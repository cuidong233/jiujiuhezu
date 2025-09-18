const express = require('express');
const router = express.Router();
const riskEngine = require('../engine/risk-engine');
const behaviorMonitor = require('../monitors/behavior-monitor');
const deviceFingerprint = require('../security/device-fingerprint');
const antiCrawler = require('../anti-crawler/anti-crawler');
const RateLimiter = require('../rate-limiter/rate-limiter');
const AlertSystem = require('../alert/alert-system');
const logger = require('../logger/logger');

const alertSystem = new AlertSystem();
const rateLimiter = new RateLimiter();

router.use(express.json());

router.use((req, res, next) => {
    req.riskContext = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        sessionId: req.session?.id || req.headers['x-session-id'],
        userId: req.user?.id || req.headers['x-user-id'],
        timestamp: Date.now()
    };
    next();
});

router.post('/evaluate', async (req, res) => {
    try {
        const context = {
            ...req.riskContext,
            action: req.body.action,
            metadata: req.body.metadata || {},
            request: req,
            deviceId: req.body.deviceId
        };

        const evaluation = await riskEngine.evaluate(context);

        if (evaluation.decision === 'block') {
            await alertSystem.sendAlert({
                type: 'high_risk_action_blocked',
                severity: 'high',
                title: '高风险行为已阻止',
                description: `用户 ${context.userId} 的 ${context.action} 操作被阻止`,
                data: evaluation
            });
        }

        res.json({
            success: true,
            evaluation
        });
    } catch (error) {
        logger.logSystemEvent({
            type: 'api_error',
            endpoint: '/evaluate',
            error: error.message
        }, 'error');

        res.status(500).json({
            success: false,
            error: 'Risk evaluation failed'
        });
    }
});

router.post('/check-rate-limit', async (req, res) => {
    try {
        const { identifier, type = 'global', action } = req.body;
        const result = await rateLimiter.checkLimit(identifier, type, action);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Rate limit check failed'
        });
    }
});

router.post('/check-crawler', async (req, res) => {
    try {
        const detection = await antiCrawler.detect(req, req.riskContext.sessionId);

        if (detection.requiresChallenge) {
            const challenge = await antiCrawler.generateChallenge(req.riskContext.sessionId);
            detection.challenge = challenge;
        }

        res.json({
            success: true,
            detection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Crawler detection failed'
        });
    }
});

router.post('/verify-challenge', async (req, res) => {
    try {
        const { challengeId, solution } = req.body;
        const result = antiCrawler.verifyChallenge(challengeId, solution);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Challenge verification failed'
        });
    }
});

router.post('/track-behavior', async (req, res) => {
    try {
        const { userId, action, metadata } = req.body;
        const suspicionScore = behaviorMonitor.trackUserBehavior(userId, action, metadata);

        res.json({
            success: true,
            suspicionScore,
            flags: behaviorMonitor.getUserFlags(userId)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Behavior tracking failed'
        });
    }
});

router.post('/device-fingerprint', async (req, res) => {
    try {
        const fingerprint = deviceFingerprint.generateFingerprint(req);
        const ipCheck = await deviceFingerprint.checkIP(req.riskContext.ip);

        if (req.body.deviceId && req.riskContext.userId) {
            const device = deviceFingerprint.trackDevice(
                req.body.deviceId,
                req.riskContext.userId,
                fingerprint
            );

            const consistency = deviceFingerprint.checkDeviceConsistency(
                req.body.deviceId,
                fingerprint
            );

            res.json({
                success: true,
                fingerprint: fingerprint.id,
                device: {
                    trustScore: device.trustScore,
                    consistency: consistency.consistent,
                    similarity: consistency.score
                },
                ip: ipCheck
            });
        } else {
            res.json({
                success: true,
                fingerprint: fingerprint.id,
                ip: ipCheck
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Fingerprint generation failed'
        });
    }
});

router.get('/rules', (req, res) => {
    try {
        const rules = riskEngine.getAllRules();
        res.json({
            success: true,
            rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rules'
        });
    }
});

router.post('/rules', (req, res) => {
    try {
        const { name, config } = req.body;
        riskEngine.addRule(name, config);

        logger.logSystemEvent({
            type: 'rule_added',
            rule: name,
            config
        });

        res.json({
            success: true,
            message: 'Rule added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to add rule'
        });
    }
});

router.put('/rules/:name', (req, res) => {
    try {
        const { name } = req.params;
        const { config } = req.body;
        
        riskEngine.updateRule(name, config);

        logger.logSystemEvent({
            type: 'rule_updated',
            rule: name,
            config
        });

        res.json({
            success: true,
            message: 'Rule updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update rule'
        });
    }
});

router.delete('/rules/:name', (req, res) => {
    try {
        const { name } = req.params;
        riskEngine.removeRule(name);

        logger.logSystemEvent({
            type: 'rule_removed',
            rule: name
        });

        res.json({
            success: true,
            message: 'Rule removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to remove rule'
        });
    }
});

router.post('/blacklist/ip', (req, res) => {
    try {
        const { ip, action = 'add' } = req.body;

        if (action === 'add') {
            deviceFingerprint.addIPToBlacklist(ip);
            rateLimiter.addToBlacklist(ip);
        } else if (action === 'remove') {
            deviceFingerprint.removeIPFromBlacklist(ip);
            rateLimiter.removeFromBlacklist(ip);
        }

        logger.logSystemEvent({
            type: 'blacklist_update',
            target: 'ip',
            ip,
            action
        });

        res.json({
            success: true,
            message: `IP ${action === 'add' ? 'added to' : 'removed from'} blacklist`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Blacklist update failed'
        });
    }
});

router.post('/whitelist/ip', (req, res) => {
    try {
        const { ip, action = 'add' } = req.body;

        if (action === 'add') {
            deviceFingerprint.addIPToWhitelist(ip);
            rateLimiter.addToWhitelist(ip);
        } else if (action === 'remove') {
            deviceFingerprint.removeIPFromWhitelist(ip);
            rateLimiter.removeFromWhitelist(ip);
        }

        logger.logSystemEvent({
            type: 'whitelist_update',
            target: 'ip',
            ip,
            action
        });

        res.json({
            success: true,
            message: `IP ${action === 'add' ? 'added to' : 'removed from'} whitelist`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Whitelist update failed'
        });
    }
});

router.get('/user-profile/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const profile = riskEngine.getUserRiskProfile(userId);

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user profile'
        });
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const { timeRange = 3600000 } = req.query;
        
        const stats = {
            alerts: alertSystem.getStatistics(parseInt(timeRange)),
            rateLimit: await rateLimiter.getStats('global'),
            sessions: {
                active: antiCrawler.sessionTracking.size,
                challenges: antiCrawler.challenges.size
            },
            devices: {
                tracked: deviceFingerprint.deviceDatabase.size,
                suspicious: deviceFingerprint.suspiciousIPs.size
            }
        };

        res.json({
            success: true,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

router.post('/alert', async (req, res) => {
    try {
        const alert = req.body;
        const result = await alertSystem.sendAlert(alert);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to send alert'
        });
    }
});

router.put('/alert-config', (req, res) => {
    try {
        const config = req.body;
        alertSystem.updateConfig(config);

        logger.logSystemEvent({
            type: 'alert_config_updated',
            config
        });

        res.json({
            success: true,
            message: 'Alert configuration updated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update alert configuration'
        });
    }
});

router.post('/cleanup', (req, res) => {
    try {
        riskEngine.cleanup();
        behaviorMonitor.cleanupOldData();
        deviceFingerprint.cleanup();
        antiCrawler.cleanup();
        alertSystem.cleanup();

        logger.logSystemEvent({
            type: 'manual_cleanup',
            timestamp: Date.now()
        });

        res.json({
            success: true,
            message: 'Cleanup completed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Cleanup failed'
        });
    }
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime()
    });
});

setInterval(() => {
    riskEngine.cleanup();
    behaviorMonitor.cleanupOldData();
    deviceFingerprint.cleanup();
    antiCrawler.cleanup();
    alertSystem.cleanup();
    rateLimiter.cleanup();
}, 3600000);

riskEngine.on('risk_detected', async (evaluation) => {
    if (evaluation.riskScore >= 70) {
        await alertSystem.sendAlert({
            type: 'high_risk_detected',
            severity: evaluation.riskScore >= 80 ? 'critical' : 'high',
            title: '检测到高风险行为',
            description: `用户 ${evaluation.userId} 风险评分: ${evaluation.riskScore}`,
            data: evaluation,
            actions: [
                '审查用户账户',
                '检查相关订单',
                '考虑临时限制'
            ]
        });
    }
});

behaviorMonitor.on('suspicious_behavior', async (data) => {
    if (data.suspicionScore >= 50) {
        await alertSystem.sendAlert({
            type: 'suspicious_behavior',
            severity: data.suspicionScore >= 70 ? 'high' : 'medium',
            title: '检测到可疑行为',
            description: `用户 ${data.userId} 可疑评分: ${data.suspicionScore}`,
            data,
            actions: data.flags
        });
    }
});

module.exports = router;