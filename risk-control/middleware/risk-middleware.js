const riskEngine = require('../engine/risk-engine');
const behaviorMonitor = require('../monitors/behavior-monitor');
const deviceFingerprint = require('../security/device-fingerprint');
const antiCrawler = require('../anti-crawler/anti-crawler');
const RateLimiter = require('../rate-limiter/rate-limiter');
const logger = require('../logger/logger');

class RiskMiddleware {
    constructor(options = {}) {
        this.options = {
            enabled: options.enabled !== false,
            blockOnHighRisk: options.blockOnHighRisk !== false,
            riskThreshold: options.riskThreshold || 70,
            crawlerDetection: options.crawlerDetection !== false,
            rateLimit: options.rateLimit !== false,
            deviceTracking: options.deviceTracking !== false,
            behaviorTracking: options.behaviorTracking !== false,
            customRules: options.customRules || [],
            whitelist: options.whitelist || [],
            skipPaths: options.skipPaths || ['/health', '/metrics', '/favicon.ico'],
            sessionKey: options.sessionKey || 'sessionId',
            userKey: options.userKey || 'userId'
        };

        this.rateLimiter = new RateLimiter(options.redis);
        
        if (this.options.customRules.length > 0) {
            this.options.customRules.forEach(rule => {
                riskEngine.addRule(rule.name, rule);
            });
        }
    }

    middleware() {
        return async (req, res, next) => {
            if (!this.options.enabled || this.shouldSkip(req)) {
                return next();
            }

            const startTime = Date.now();

            try {
                const context = this.buildContext(req);
                
                const checks = await this.performChecks(context, req, res);
                
                if (checks.blocked) {
                    return this.handleBlocked(checks.reason, res);
                }

                if (checks.challenge) {
                    return this.handleChallenge(checks.challenge, res);
                }

                req.riskScore = checks.riskScore;
                req.riskContext = context;
                req.riskChecks = checks;

                const processingTime = Date.now() - startTime;
                logger.logSystemEvent({
                    type: 'risk_middleware_check',
                    path: req.path,
                    method: req.method,
                    riskScore: checks.riskScore,
                    processingTime
                });

                next();
            } catch (error) {
                logger.logSystemEvent({
                    type: 'risk_middleware_error',
                    error: error.message,
                    path: req.path
                }, 'error');

                if (this.options.blockOnError) {
                    return res.status(500).json({
                        error: 'Security check failed'
                    });
                }

                next();
            }
        };
    }

    shouldSkip(req) {
        if (this.options.skipPaths.includes(req.path)) {
            return true;
        }

        const ip = this.getClientIP(req);
        if (this.options.whitelist.includes(ip)) {
            return true;
        }

        return false;
    }

    buildContext(req) {
        return {
            ip: this.getClientIP(req),
            userAgent: req.headers['user-agent'] || '',
            sessionId: this.getSessionId(req),
            userId: this.getUserId(req),
            method: req.method,
            path: req.path,
            headers: req.headers,
            timestamp: Date.now(),
            referer: req.headers['referer'] || '',
            origin: req.headers['origin'] || ''
        };
    }

    getClientIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] ||
               req.connection.remoteAddress ||
               req.ip;
    }

    getSessionId(req) {
        return req.session?.[this.options.sessionKey] ||
               req.cookies?.[this.options.sessionKey] ||
               req.headers['x-session-id'] ||
               null;
    }

    getUserId(req) {
        return req.user?.[this.options.userKey] ||
               req.session?.[this.options.userKey] ||
               req.headers['x-user-id'] ||
               null;
    }

    async performChecks(context, req, res) {
        const results = {
            blocked: false,
            challenge: null,
            riskScore: 0,
            reason: null,
            details: {}
        };

        if (this.options.rateLimit) {
            const rateLimitCheck = await this.checkRateLimit(context);
            if (!rateLimitCheck.allowed) {
                results.blocked = true;
                results.reason = 'rate_limit_exceeded';
                results.details.rateLimit = rateLimitCheck;
                return results;
            }
            results.details.rateLimit = rateLimitCheck;
        }

        if (this.options.crawlerDetection) {
            const crawlerCheck = await antiCrawler.detect(req, context.sessionId);
            results.details.crawler = crawlerCheck;
            
            if (crawlerCheck.action === 'block') {
                results.blocked = true;
                results.reason = 'crawler_detected';
                return results;
            }
            
            if (crawlerCheck.requiresChallenge) {
                const challenge = await antiCrawler.generateChallenge(context.sessionId);
                results.challenge = challenge;
                return results;
            }
            
            results.riskScore += crawlerCheck.confidence * 0.3;
        }

        if (this.options.deviceTracking && context.ip) {
            const ipCheck = await deviceFingerprint.checkIP(context.ip);
            results.details.ip = ipCheck;
            
            if (ipCheck.risk === 'critical') {
                results.blocked = true;
                results.reason = 'critical_ip_risk';
                return results;
            }
            
            const riskScores = { low: 0, medium: 10, high: 20, critical: 40 };
            results.riskScore += riskScores[ipCheck.risk] || 0;
        }

        if (this.options.behaviorTracking && context.userId) {
            const behaviorScore = behaviorMonitor.trackUserBehavior(
                context.userId,
                `${context.method}:${context.path}`,
                {
                    ip: context.ip,
                    userAgent: context.userAgent,
                    timestamp: context.timestamp
                }
            );
            results.details.behavior = behaviorScore;
            results.riskScore += behaviorScore * 0.5;
        }

        const evaluation = await riskEngine.evaluate({
            ...context,
            action: `${context.method}:${context.path}`,
            request: req,
            metadata: req.body || {}
        });
        
        results.details.evaluation = evaluation;
        results.riskScore = Math.max(results.riskScore, evaluation.riskScore);

        if (evaluation.decision === 'block' || results.riskScore >= this.options.riskThreshold) {
            results.blocked = true;
            results.reason = evaluation.decision === 'block' ? 'risk_engine_block' : 'high_risk_score';
        }

        return results;
    }

    async checkRateLimit(context) {
        const checks = [];

        if (context.userId) {
            checks.push(this.rateLimiter.checkLimit(context.userId, 'user'));
        }

        if (context.ip) {
            checks.push(this.rateLimiter.checkLimit(context.ip, 'ip'));
        }

        const endpoint = `${context.method}:${context.path}`;
        checks.push(this.rateLimiter.checkLimit(endpoint, 'api'));

        const results = await Promise.all(checks);
        const blocked = results.some(r => !r.allowed);
        const minRemaining = Math.min(...results.map(r => r.remaining || Infinity));

        return {
            allowed: !blocked,
            remaining: minRemaining,
            checks: results
        };
    }

    handleBlocked(reason, res) {
        logger.logRiskEvent({
            type: 'request_blocked',
            reason,
            timestamp: Date.now()
        }, 'high');

        return res.status(403).json({
            error: 'Access denied',
            reason: this.getSafeReason(reason)
        });
    }

    handleChallenge(challenge, res) {
        return res.status(403).json({
            error: 'Challenge required',
            challenge: {
                id: challenge.id,
                type: challenge.type
            }
        });
    }

    getSafeReason(reason) {
        const safeReasons = {
            'rate_limit_exceeded': 'Too many requests',
            'crawler_detected': 'Automated access detected',
            'critical_ip_risk': 'Access from this location is not allowed',
            'risk_engine_block': 'Security policy violation',
            'high_risk_score': 'Suspicious activity detected'
        };

        return safeReasons[reason] || 'Access denied for security reasons';
    }

    orderValidation() {
        return async (req, res, next) => {
            if (!this.options.enabled) {
                return next();
            }

            try {
                const order = req.body;
                const context = {
                    ...this.buildContext(req),
                    action: 'order_submit',
                    metadata: {
                        orderAmount: order.totalAmount,
                        itemCount: order.items?.length || 0,
                        maxQuantity: Math.max(...(order.items?.map(i => i.quantity) || [0])),
                        paymentMethod: order.paymentMethod,
                        shippingAddress: order.shippingAddress,
                        billingAddress: order.billingAddress
                    }
                };

                const evaluation = await riskEngine.evaluate(context);

                if (evaluation.decision === 'block') {
                    return res.status(403).json({
                        error: 'Order blocked for security reasons',
                        code: 'ORDER_BLOCKED'
                    });
                }

                if (evaluation.decision === 'review') {
                    req.requiresReview = true;
                    req.reviewReasons = evaluation.triggeredRules;
                }

                if (evaluation.decision === 'challenge') {
                    const challenge = await antiCrawler.generateChallenge(context.sessionId);
                    return res.status(403).json({
                        error: 'Additional verification required',
                        challenge: {
                            id: challenge.id,
                            type: challenge.type
                        }
                    });
                }

                req.riskEvaluation = evaluation;
                next();
            } catch (error) {
                logger.logSystemEvent({
                    type: 'order_validation_error',
                    error: error.message
                }, 'error');

                if (this.options.blockOnError) {
                    return res.status(500).json({
                        error: 'Order validation failed'
                    });
                }

                next();
            }
        };
    }

    loginProtection() {
        return async (req, res, next) => {
            if (!this.options.enabled) {
                return next();
            }

            try {
                const context = {
                    ...this.buildContext(req),
                    action: 'login_attempt',
                    metadata: {
                        username: req.body.username || req.body.email,
                        timestamp: Date.now()
                    }
                };

                const rateLimitCheck = await this.rateLimiter.checkLimit(
                    context.ip,
                    'api',
                    'login'
                );

                if (!rateLimitCheck.allowed) {
                    return res.status(429).json({
                        error: 'Too many login attempts',
                        retryAfter: rateLimitCheck.retryAfter
                    });
                }

                const crawlerCheck = await antiCrawler.detect(req, context.sessionId);
                if (crawlerCheck.isCrawler && crawlerCheck.confidence > 70) {
                    return res.status(403).json({
                        error: 'Automated login attempts are not allowed'
                    });
                }

                req.loginContext = context;
                next();
            } catch (error) {
                logger.logSystemEvent({
                    type: 'login_protection_error',
                    error: error.message
                }, 'error');

                next();
            }
        };
    }

    apiProtection(options = {}) {
        const config = {
            rateLimit: options.rateLimit || { requests: 100, window: 60000 },
            requireAuth: options.requireAuth !== false,
            allowedMethods: options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE'],
            ...options
        };

        return async (req, res, next) => {
            if (!this.options.enabled) {
                return next();
            }

            if (!config.allowedMethods.includes(req.method)) {
                return res.status(405).json({
                    error: 'Method not allowed'
                });
            }

            if (config.requireAuth && !this.getUserId(req)) {
                return res.status(401).json({
                    error: 'Authentication required'
                });
            }

            try {
                const identifier = this.getUserId(req) || this.getClientIP(req);
                const rateLimitCheck = await this.rateLimiter.checkSlidingWindow(
                    identifier,
                    config.rateLimit.requests,
                    config.rateLimit.window
                );

                if (!rateLimitCheck.allowed) {
                    return res.status(429).json({
                        error: 'API rate limit exceeded',
                        limit: config.rateLimit.requests,
                        window: config.rateLimit.window
                    });
                }

                res.setHeader('X-RateLimit-Limit', config.rateLimit.requests);
                res.setHeader('X-RateLimit-Remaining', 
                    Math.max(0, config.rateLimit.requests - rateLimitCheck.count));

                next();
            } catch (error) {
                logger.logSystemEvent({
                    type: 'api_protection_error',
                    error: error.message
                }, 'error');

                next();
            }
        };
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }

    getStatistics() {
        return {
            enabled: this.options.enabled,
            options: this.options,
            timestamp: Date.now()
        };
    }
}

module.exports = RiskMiddleware;