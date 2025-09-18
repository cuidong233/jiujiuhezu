const logger = require('../logger/logger');
const { EventEmitter } = require('events');
const nodemailer = require('nodemailer');

class AlertSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            email: {
                enabled: config.email?.enabled || false,
                smtp: config.email?.smtp || {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: config.email?.user || '',
                        pass: config.email?.pass || ''
                    }
                },
                recipients: config.email?.recipients || []
            },
            webhook: {
                enabled: config.webhook?.enabled || false,
                urls: config.webhook?.urls || []
            },
            sms: {
                enabled: config.sms?.enabled || false,
                provider: config.sms?.provider || 'twilio',
                config: config.sms?.config || {}
            },
            thresholds: {
                riskScore: config.thresholds?.riskScore || 70,
                failedLogins: config.thresholds?.failedLogins || 5,
                orderAmount: config.thresholds?.orderAmount || 10000,
                crawlerConfidence: config.thresholds?.crawlerConfidence || 80,
                suspiciousIPs: config.thresholds?.suspiciousIPs || 10
            }
        };

        this.alertQueue = [];
        this.alertHistory = new Map();
        this.alertCooldowns = new Map();
        this.statistics = {
            sent: 0,
            failed: 0,
            queued: 0
        };

        if (this.config.email.enabled) {
            this.emailTransporter = nodemailer.createTransport(this.config.email.smtp);
        }

        this.startAlertProcessor();
    }

    async sendAlert(alert) {
        try {
            if (this.shouldSuppress(alert)) {
                logger.logSystemEvent({
                    type: 'alert_suppressed',
                    alert: alert.type,
                    reason: 'cooldown_period'
                });
                return { success: false, reason: 'suppressed' };
            }

            const enrichedAlert = this.enrichAlert(alert);
            
            this.alertQueue.push(enrichedAlert);
            this.statistics.queued++;

            this.emit('alert_queued', enrichedAlert);

            return { success: true, alertId: enrichedAlert.id };
        } catch (error) {
            logger.logSystemEvent({
                type: 'alert_error',
                error: error.message,
                alert
            }, 'error');
            
            this.statistics.failed++;
            return { success: false, error: error.message };
        }
    }

    enrichAlert(alert) {
        return {
            id: this.generateAlertId(),
            timestamp: Date.now(),
            type: alert.type,
            severity: alert.severity || 'medium',
            title: alert.title || this.generateTitle(alert.type),
            description: alert.description,
            data: alert.data || {},
            source: alert.source || 'system',
            metadata: {
                environment: process.env.NODE_ENV || 'production',
                server: process.env.HOSTNAME || 'unknown',
                version: process.env.APP_VERSION || '1.0.0'
            },
            actions: alert.actions || [],
            ttl: alert.ttl || 3600000
        };
    }

    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateTitle(type) {
        const titles = {
            high_risk_order: '高风险订单检测',
            crawler_detected: '爬虫行为检测',
            rate_limit_exceeded: '频率限制超标',
            suspicious_login: '可疑登录尝试',
            payment_fraud: '支付欺诈风险',
            account_takeover: '账户接管风险',
            bulk_registration: '批量注册检测',
            data_breach_attempt: '数据泄露尝试',
            ddos_attack: 'DDoS攻击检测',
            sql_injection: 'SQL注入尝试'
        };
        
        return titles[type] || '安全警报';
    }

    shouldSuppress(alert) {
        const key = `${alert.type}:${alert.data?.userId || alert.data?.ip || 'global'}`;
        const lastAlert = this.alertCooldowns.get(key);
        
        if (!lastAlert) return false;
        
        const cooldownPeriod = this.getCooldownPeriod(alert.severity);
        return Date.now() - lastAlert < cooldownPeriod;
    }

    getCooldownPeriod(severity) {
        const periods = {
            critical: 60000,
            high: 300000,
            medium: 600000,
            low: 1800000
        };
        
        return periods[severity] || 600000;
    }

    async startAlertProcessor() {
        setInterval(async () => {
            if (this.alertQueue.length === 0) return;
            
            const batch = this.alertQueue.splice(0, 10);
            
            for (const alert of batch) {
                await this.processAlert(alert);
            }
        }, 5000);
    }

    async processAlert(alert) {
        try {
            const channels = this.determineChannels(alert);
            const results = [];

            if (channels.email) {
                results.push(await this.sendEmailAlert(alert));
            }

            if (channels.webhook) {
                results.push(await this.sendWebhookAlert(alert));
            }

            if (channels.sms) {
                results.push(await this.sendSMSAlert(alert));
            }

            if (channels.internal) {
                results.push(await this.sendInternalAlert(alert));
            }

            const success = results.some(r => r.success);
            
            if (success) {
                this.recordAlert(alert);
                this.updateCooldown(alert);
                this.statistics.sent++;
                this.emit('alert_sent', alert);
            } else {
                this.statistics.failed++;
                this.emit('alert_failed', alert);
            }

            logger.logSystemEvent({
                type: 'alert_processed',
                alertId: alert.id,
                success,
                channels: Object.keys(channels).filter(k => channels[k])
            });

        } catch (error) {
            logger.logSystemEvent({
                type: 'alert_processing_error',
                error: error.message,
                alertId: alert.id
            }, 'error');
            
            this.statistics.failed++;
        }
    }

    determineChannels(alert) {
        const channels = {
            email: false,
            webhook: false,
            sms: false,
            internal: true
        };

        if (alert.severity === 'critical') {
            channels.email = this.config.email.enabled;
            channels.sms = this.config.sms.enabled;
            channels.webhook = this.config.webhook.enabled;
        } else if (alert.severity === 'high') {
            channels.email = this.config.email.enabled;
            channels.webhook = this.config.webhook.enabled;
        } else if (alert.severity === 'medium') {
            channels.webhook = this.config.webhook.enabled;
        }

        if (alert.channels) {
            Object.keys(channels).forEach(channel => {
                if (alert.channels[channel] !== undefined) {
                    channels[channel] = alert.channels[channel];
                }
            });
        }

        return channels;
    }

    async sendEmailAlert(alert) {
        if (!this.config.email.enabled || !this.emailTransporter) {
            return { success: false, reason: 'email_disabled' };
        }

        try {
            const html = this.generateEmailHTML(alert);
            
            const info = await this.emailTransporter.sendMail({
                from: this.config.email.smtp.auth.user,
                to: this.config.email.recipients.join(', '),
                subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
                html
            });

            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.logSystemEvent({
                type: 'email_alert_error',
                error: error.message,
                alertId: alert.id
            }, 'error');
            
            return { success: false, error: error.message };
        }
    }

    generateEmailHTML(alert) {
        return `
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <div style="background-color: #f4f4f4; padding: 20px;">
                        <h2 style="color: ${this.getSeverityColor(alert.severity)};">
                            ${alert.title}
                        </h2>
                        <div style="background-color: white; padding: 15px; border-radius: 5px;">
                            <p><strong>时间:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
                            <p><strong>级别:</strong> ${alert.severity}</p>
                            <p><strong>类型:</strong> ${alert.type}</p>
                            <p><strong>描述:</strong> ${alert.description}</p>
                            
                            ${alert.data ? `
                                <h3>详细信息:</h3>
                                <pre style="background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
${JSON.stringify(alert.data, null, 2)}
                                </pre>
                            ` : ''}
                            
                            ${alert.actions.length > 0 ? `
                                <h3>建议操作:</h3>
                                <ul>
                                    ${alert.actions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    getSeverityColor(severity) {
        const colors = {
            critical: '#ff0000',
            high: '#ff6600',
            medium: '#ffcc00',
            low: '#00cc00'
        };
        
        return colors[severity] || '#666666';
    }

    async sendWebhookAlert(alert) {
        if (!this.config.webhook.enabled || this.config.webhook.urls.length === 0) {
            return { success: false, reason: 'webhook_disabled' };
        }

        const results = await Promise.all(
            this.config.webhook.urls.map(url => this.postToWebhook(url, alert))
        );

        const success = results.some(r => r.success);
        return { success, results };
    }

    async postToWebhook(url, alert) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });

            return { success: response.ok, status: response.status };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendSMSAlert(alert) {
        if (!this.config.sms.enabled) {
            return { success: false, reason: 'sms_disabled' };
        }

        const message = `[${alert.severity.toUpperCase()}] ${alert.title}\n${alert.description}`;
        
        logger.logSystemEvent({
            type: 'sms_alert_simulated',
            message,
            alertId: alert.id
        });

        return { success: true, simulated: true };
    }

    async sendInternalAlert(alert) {
        logger.logRiskEvent({
            type: 'internal_alert',
            alert
        }, alert.severity);

        return { success: true };
    }

    recordAlert(alert) {
        const key = `${alert.type}:${new Date().toISOString().split('T')[0]}`;
        
        if (!this.alertHistory.has(key)) {
            this.alertHistory.set(key, []);
        }
        
        const history = this.alertHistory.get(key);
        history.push({
            id: alert.id,
            timestamp: alert.timestamp,
            severity: alert.severity
        });

        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
    }

    updateCooldown(alert) {
        const key = `${alert.type}:${alert.data?.userId || alert.data?.ip || 'global'}`;
        this.alertCooldowns.set(key, Date.now());
    }

    getStatistics(timeRange = 3600000) {
        const now = Date.now();
        const stats = {
            total: this.statistics.sent + this.statistics.failed,
            sent: this.statistics.sent,
            failed: this.statistics.failed,
            queued: this.alertQueue.length,
            byType: {},
            bySeverity: {},
            recentAlerts: []
        };

        for (const [key, alerts] of this.alertHistory.entries()) {
            const [type] = key.split(':');
            const recentAlerts = alerts.filter(a => now - a.timestamp < timeRange);
            
            if (recentAlerts.length > 0) {
                stats.byType[type] = recentAlerts.length;
                
                recentAlerts.forEach(alert => {
                    stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
                    stats.recentAlerts.push(alert);
                });
            }
        }

        stats.recentAlerts.sort((a, b) => b.timestamp - a.timestamp);
        stats.recentAlerts = stats.recentAlerts.slice(0, 20);

        return stats;
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.config.email.enabled && !this.emailTransporter) {
            this.emailTransporter = nodemailer.createTransport(this.config.email.smtp);
        }
    }

    clearHistory() {
        this.alertHistory.clear();
        this.alertCooldowns.clear();
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 86400000;

        for (const [key, timestamp] of this.alertCooldowns.entries()) {
            if (now - timestamp > maxAge) {
                this.alertCooldowns.delete(key);
            }
        }

        for (const [key, alerts] of this.alertHistory.entries()) {
            const recentAlerts = alerts.filter(a => now - a.timestamp < maxAge);
            if (recentAlerts.length === 0) {
                this.alertHistory.delete(key);
            } else {
                this.alertHistory.set(key, recentAlerts);
            }
        }
    }
}

module.exports = AlertSystem;