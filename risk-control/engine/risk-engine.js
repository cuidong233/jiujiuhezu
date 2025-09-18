const logger = require('../logger/logger');
const behaviorMonitor = require('../monitors/behavior-monitor');
const deviceFingerprint = require('../security/device-fingerprint');
const antiCrawler = require('../anti-crawler/anti-crawler');
const RateLimiter = require('../rate-limiter/rate-limiter');
const { EventEmitter } = require('events');

class RiskEngine extends EventEmitter {
    constructor() {
        super();
        this.rateLimiter = new RateLimiter();
        this.rules = new Map();
        this.riskScores = new Map();
        this.decisions = new Map();
        this.initializeRules();
    }

    initializeRules() {
        this.addRule('high_frequency_order', {
            description: '高频下单检测',
            priority: 1,
            conditions: [
                { type: 'order_count', operator: '>', value: 5, timeWindow: 60000 },
                { type: 'total_amount', operator: '>', value: 10000 }
            ],
            actions: ['block_order', 'alert_admin', 'log_event'],
            riskScore: 80
        });

        this.addRule('suspicious_payment', {
            description: '可疑支付行为',
            priority: 2,
            conditions: [
                { type: 'payment_attempts', operator: '>', value: 3, timeWindow: 300000 },
                { type: 'different_cards', operator: '>', value: 2 }
            ],
            actions: ['require_verification', 'delay_processing', 'log_event'],
            riskScore: 60
        });

        this.addRule('bulk_purchase', {
            description: '批量采购检测',
            priority: 3,
            conditions: [
                { type: 'single_item_quantity', operator: '>', value: 20 },
                { type: 'unique_items', operator: '<', value: 3 }
            ],
            actions: ['manual_review', 'limit_quantity', 'log_event'],
            riskScore: 50
        });

        this.addRule('new_user_high_value', {
            description: '新用户高额订单',
            priority: 2,
            conditions: [
                { type: 'account_age', operator: '<', value: 86400000 },
                { type: 'order_amount', operator: '>', value: 5000 }
            ],
            actions: ['require_verification', 'manual_review', 'log_event'],
            riskScore: 70
        });

        this.addRule('address_mismatch', {
            description: '地址不匹配',
            priority: 3,
            conditions: [
                { type: 'billing_shipping_mismatch', operator: '==', value: true },
                { type: 'high_risk_country', operator: '==', value: true }
            ],
            actions: ['additional_verification', 'delay_shipping', 'log_event'],
            riskScore: 45
        });

        this.addRule('velocity_check', {
            description: '速度检查',
            priority: 1,
            conditions: [
                { type: 'click_velocity', operator: '>', value: 10, timeWindow: 1000 },
                { type: 'page_views', operator: '>', value: 50, timeWindow: 60000 }
            ],
            actions: ['rate_limit', 'captcha_challenge', 'log_event'],
            riskScore: 55
        });

        this.addRule('device_anomaly', {
            description: '设备异常',
            priority: 2,
            conditions: [
                { type: 'device_trust_score', operator: '<', value: 30 },
                { type: 'multiple_accounts', operator: '>', value: 3 }
            ],
            actions: ['block_device', 'require_2fa', 'log_event'],
            riskScore: 75
        });

        this.addRule('coupon_abuse', {
            description: '优惠券滥用',
            priority: 3,
            conditions: [
                { type: 'coupon_usage', operator: '>', value: 5, timeWindow: 86400000 },
                { type: 'same_coupon_multiple_accounts', operator: '==', value: true }
            ],
            actions: ['invalidate_coupon', 'flag_account', 'log_event'],
            riskScore: 65
        });
    }

    async evaluate(context) {
        const startTime = Date.now();
        const evaluation = {
            timestamp: startTime,
            userId: context.userId,
            sessionId: context.sessionId,
            riskScore: 0,
            triggeredRules: [],
            actions: new Set(),
            decision: 'allow',
            details: {}
        };

        try {
            const [
                rateLimitCheck,
                crawlerCheck,
                ipCheck,
                behaviorScore,
                deviceCheck
            ] = await Promise.all([
                this.checkRateLimit(context),
                this.checkCrawler(context),
                this.checkIP(context),
                this.checkBehavior(context),
                this.checkDevice(context)
            ]);

            evaluation.details = {
                rateLimit: rateLimitCheck,
                crawler: crawlerCheck,
                ip: ipCheck,
                behavior: behaviorScore,
                device: deviceCheck
            };

            evaluation.riskScore = this.calculateBaseRiskScore(evaluation.details);

            const applicableRules = this.getApplicableRules(context);
            for (const rule of applicableRules) {
                if (this.evaluateRule(rule, context, evaluation.details)) {
                    evaluation.triggeredRules.push(rule.name);
                    evaluation.riskScore += rule.riskScore;
                    rule.actions.forEach(action => evaluation.actions.add(action));
                }
            }

            evaluation.riskScore = Math.min(100, evaluation.riskScore);

            evaluation.decision = this.makeDecision(evaluation);

            await this.recordDecision(context, evaluation);

            if (evaluation.decision !== 'allow') {
                this.emit('risk_detected', evaluation);
            }

            const processingTime = Date.now() - startTime;
            logger.logSystemEvent({
                type: 'risk_evaluation',
                userId: context.userId,
                decision: evaluation.decision,
                riskScore: evaluation.riskScore,
                processingTime
            });

        } catch (error) {
            logger.logSystemEvent({
                type: 'risk_engine_error',
                error: error.message,
                context
            }, 'error');

            evaluation.decision = 'allow';
            evaluation.error = error.message;
        }

        return evaluation;
    }

    async checkRateLimit(context) {
        const checks = await Promise.all([
            this.rateLimiter.checkLimit(context.userId, 'user', context.action),
            this.rateLimiter.checkLimit(context.ip, 'ip', context.action),
            this.rateLimiter.checkLimit(`${context.userId}:${context.action}`, 'api', context.action)
        ]);

        const blocked = checks.some(check => !check.allowed);
        const minRemaining = Math.min(...checks.map(c => c.remaining || Infinity));

        return {
            allowed: !blocked,
            remaining: minRemaining,
            checks
        };
    }

    async checkCrawler(context) {
        return await antiCrawler.detect(context.request, context.sessionId);
    }

    async checkIP(context) {
        return await deviceFingerprint.checkIP(context.ip);
    }

    checkBehavior(context) {
        return behaviorMonitor.trackUserBehavior(
            context.userId,
            context.action,
            context.metadata
        );
    }

    async checkDevice(context) {
        if (!context.deviceId) {
            return { trustScore: 50, consistent: true };
        }

        const fingerprint = deviceFingerprint.generateFingerprint(context.request);
        const device = deviceFingerprint.trackDevice(
            context.deviceId,
            context.userId,
            fingerprint
        );

        const consistency = deviceFingerprint.checkDeviceConsistency(
            context.deviceId,
            fingerprint
        );

        return {
            trustScore: device.trustScore,
            consistent: consistency.consistent,
            similarity: consistency.score
        };
    }

    calculateBaseRiskScore(details) {
        let score = 0;

        if (!details.rateLimit.allowed) score += 30;
        
        if (details.crawler.isCrawler) {
            score += Math.min(40, details.crawler.confidence * 0.4);
        }

        const ipRiskMap = { low: 0, medium: 10, high: 20, critical: 30 };
        score += ipRiskMap[details.ip.risk] || 0;

        score += Math.min(25, details.behavior * 0.5);

        if (!details.device.consistent) {
            score += 15;
        }
        if (details.device.trustScore < 30) {
            score += 20;
        }

        return Math.min(100, score);
    }

    getApplicableRules(context) {
        const rules = Array.from(this.rules.values());
        return rules
            .filter(rule => this.isRuleApplicable(rule, context))
            .sort((a, b) => a.priority - b.priority);
    }

    isRuleApplicable(rule, context) {
        if (rule.contextFilter) {
            return rule.contextFilter(context);
        }
        return true;
    }

    evaluateRule(rule, context, details) {
        try {
            return rule.conditions.every(condition => 
                this.evaluateCondition(condition, context, details)
            );
        } catch (error) {
            logger.logSystemEvent({
                type: 'rule_evaluation_error',
                rule: rule.name,
                error: error.message
            }, 'error');
            return false;
        }
    }

    evaluateCondition(condition, context, details) {
        const value = this.getConditionValue(condition.type, context, details);
        
        switch (condition.operator) {
            case '>':
                return value > condition.value;
            case '<':
                return value < condition.value;
            case '>=':
                return value >= condition.value;
            case '<=':
                return value <= condition.value;
            case '==':
                return value === condition.value;
            case '!=':
                return value !== condition.value;
            case 'in':
                return condition.value.includes(value);
            case 'not_in':
                return !condition.value.includes(value);
            case 'contains':
                return value && value.includes(condition.value);
            case 'regex':
                return new RegExp(condition.value).test(value);
            default:
                return false;
        }
    }

    getConditionValue(type, context, details) {
        const valueMap = {
            'order_count': () => context.metadata?.orderCount || 0,
            'total_amount': () => context.metadata?.totalAmount || 0,
            'payment_attempts': () => context.metadata?.paymentAttempts || 0,
            'different_cards': () => context.metadata?.differentCards || 0,
            'single_item_quantity': () => context.metadata?.maxQuantity || 0,
            'unique_items': () => context.metadata?.uniqueItems || 0,
            'account_age': () => Date.now() - (context.metadata?.accountCreated || Date.now()),
            'order_amount': () => context.metadata?.orderAmount || 0,
            'billing_shipping_mismatch': () => context.metadata?.addressMismatch || false,
            'high_risk_country': () => details.ip?.risk === 'high' || false,
            'click_velocity': () => context.metadata?.clickVelocity || 0,
            'page_views': () => context.metadata?.pageViews || 0,
            'device_trust_score': () => details.device?.trustScore || 50,
            'multiple_accounts': () => context.metadata?.multipleAccounts || 0,
            'coupon_usage': () => context.metadata?.couponUsage || 0,
            'same_coupon_multiple_accounts': () => context.metadata?.couponSharing || false
        };

        const getter = valueMap[type];
        return getter ? getter() : null;
    }

    makeDecision(evaluation) {
        if (evaluation.actions.has('block_order') || 
            evaluation.actions.has('block_device') ||
            evaluation.riskScore >= 80) {
            return 'block';
        }

        if (evaluation.actions.has('manual_review') ||
            evaluation.actions.has('require_verification') ||
            evaluation.riskScore >= 60) {
            return 'review';
        }

        if (evaluation.actions.has('captcha_challenge') ||
            evaluation.actions.has('additional_verification') ||
            evaluation.riskScore >= 40) {
            return 'challenge';
        }

        if (evaluation.riskScore >= 20) {
            return 'monitor';
        }

        return 'allow';
    }

    async recordDecision(context, evaluation) {
        const key = `decision:${context.userId}:${context.sessionId}`;
        this.decisions.set(key, {
            ...evaluation,
            context,
            timestamp: Date.now()
        });

        if (this.decisions.size > 10000) {
            const oldestKeys = Array.from(this.decisions.keys()).slice(0, 5000);
            oldestKeys.forEach(key => this.decisions.delete(key));
        }

        logger.logUserAction(
            context.userId,
            context.action,
            {
                decision: evaluation.decision,
                riskScore: evaluation.riskScore,
                triggeredRules: evaluation.triggeredRules
            },
            evaluation.decision === 'allow' ? 'normal' : 'high'
        );
    }

    addRule(name, config) {
        this.rules.set(name, { name, ...config });
    }

    removeRule(name) {
        this.rules.delete(name);
    }

    updateRule(name, config) {
        if (this.rules.has(name)) {
            this.rules.set(name, { name, ...config });
        }
    }

    getRule(name) {
        return this.rules.get(name);
    }

    getAllRules() {
        return Array.from(this.rules.values());
    }

    getUserRiskProfile(userId) {
        const profile = {
            userId,
            currentScore: behaviorMonitor.getUserRiskScore(userId),
            flags: behaviorMonitor.getUserFlags(userId),
            recentDecisions: [],
            statistics: {
                totalRequests: 0,
                blockedRequests: 0,
                challengedRequests: 0,
                reviewedRequests: 0
            }
        };

        for (const [key, decision] of this.decisions.entries()) {
            if (decision.userId === userId) {
                profile.recentDecisions.push(decision);
                profile.statistics.totalRequests++;
                
                switch (decision.decision) {
                    case 'block':
                        profile.statistics.blockedRequests++;
                        break;
                    case 'challenge':
                        profile.statistics.challengedRequests++;
                        break;
                    case 'review':
                        profile.statistics.reviewedRequests++;
                        break;
                }
            }
        }

        profile.recentDecisions.sort((a, b) => b.timestamp - a.timestamp);
        profile.recentDecisions = profile.recentDecisions.slice(0, 10);

        return profile;
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 86400000;

        for (const [key, decision] of this.decisions.entries()) {
            if (now - decision.timestamp > maxAge) {
                this.decisions.delete(key);
            }
        }

        behaviorMonitor.cleanupOldData();
        deviceFingerprint.cleanup();
        antiCrawler.cleanup();
    }
}

module.exports = new RiskEngine();