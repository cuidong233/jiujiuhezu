const logger = require('../logger/logger');
const { EventEmitter } = require('events');

class BehaviorMonitor extends EventEmitter {
    constructor() {
        super();
        this.userBehaviorMap = new Map();
        this.suspiciousPatterns = {
            rapidClicking: { threshold: 10, timeWindow: 1000 },
            frequentOrders: { threshold: 5, timeWindow: 60000 },
            unusualAmount: { minAmount: 10000, maxAmount: 1000000 },
            bulkPurchase: { threshold: 20 },
            rapidPageNavigation: { threshold: 50, timeWindow: 10000 },
            suspiciousUserAgent: [
                /bot/i, /crawler/i, /spider/i, /scraper/i,
                /curl/i, /wget/i, /python/i, /java/i
            ],
            abnormalOrderTime: { start: 2, end: 5 },
            multiplePaymentAttempts: { threshold: 3, timeWindow: 300000 },
            frequentAddressChange: { threshold: 3, timeWindow: 86400000 },
            unusualProductCombination: true
        };
    }

    trackUserBehavior(userId, action, metadata = {}) {
        if (!this.userBehaviorMap.has(userId)) {
            this.userBehaviorMap.set(userId, {
                actions: [],
                clickCount: 0,
                orderCount: 0,
                lastActionTime: null,
                suspicionScore: 0,
                flags: new Set()
            });
        }

        const userBehavior = this.userBehaviorMap.get(userId);
        const now = Date.now();

        userBehavior.actions.push({
            action,
            timestamp: now,
            metadata
        });

        if (userBehavior.actions.length > 1000) {
            userBehavior.actions = userBehavior.actions.slice(-500);
        }

        userBehavior.lastActionTime = now;

        this.analyzeAction(userId, action, metadata, userBehavior);

        return userBehavior.suspicionScore;
    }

    analyzeAction(userId, action, metadata, userBehavior) {
        const now = Date.now();
        const analysis = [];

        if (action === 'click') {
            userBehavior.clickCount++;
            const recentClicks = userBehavior.actions.filter(
                a => a.action === 'click' && 
                now - a.timestamp < this.suspiciousPatterns.rapidClicking.timeWindow
            );
            
            if (recentClicks.length > this.suspiciousPatterns.rapidClicking.threshold) {
                analysis.push({ type: 'rapid_clicking', severity: 'high' });
                userBehavior.suspicionScore += 20;
            }
        }

        if (action === 'order_submit') {
            userBehavior.orderCount++;
            const recentOrders = userBehavior.actions.filter(
                a => a.action === 'order_submit' && 
                now - a.timestamp < this.suspiciousPatterns.frequentOrders.timeWindow
            );
            
            if (recentOrders.length > this.suspiciousPatterns.frequentOrders.threshold) {
                analysis.push({ type: 'frequent_orders', severity: 'critical' });
                userBehavior.suspicionScore += 50;
            }

            if (metadata.amount) {
                if (metadata.amount > this.suspiciousPatterns.unusualAmount.maxAmount ||
                    metadata.amount < this.suspiciousPatterns.unusualAmount.minAmount) {
                    analysis.push({ type: 'unusual_amount', severity: 'medium' });
                    userBehavior.suspicionScore += 15;
                }
            }

            if (metadata.quantity && metadata.quantity > this.suspiciousPatterns.bulkPurchase.threshold) {
                analysis.push({ type: 'bulk_purchase', severity: 'medium' });
                userBehavior.suspicionScore += 25;
            }

            const hour = new Date().getHours();
            if (hour >= this.suspiciousPatterns.abnormalOrderTime.start && 
                hour <= this.suspiciousPatterns.abnormalOrderTime.end) {
                analysis.push({ type: 'abnormal_order_time', severity: 'low' });
                userBehavior.suspicionScore += 10;
            }
        }

        if (action === 'page_view') {
            const recentPageViews = userBehavior.actions.filter(
                a => a.action === 'page_view' && 
                now - a.timestamp < this.suspiciousPatterns.rapidPageNavigation.timeWindow
            );
            
            if (recentPageViews.length > this.suspiciousPatterns.rapidPageNavigation.threshold) {
                analysis.push({ type: 'rapid_navigation', severity: 'medium' });
                userBehavior.suspicionScore += 15;
            }
        }

        if (metadata.userAgent) {
            const isSuspicious = this.suspiciousPatterns.suspiciousUserAgent.some(
                pattern => pattern.test(metadata.userAgent)
            );
            
            if (isSuspicious) {
                analysis.push({ type: 'suspicious_user_agent', severity: 'high' });
                userBehavior.suspicionScore += 30;
            }
        }

        if (action === 'payment_attempt') {
            const recentPayments = userBehavior.actions.filter(
                a => a.action === 'payment_attempt' && 
                now - a.timestamp < this.suspiciousPatterns.multiplePaymentAttempts.timeWindow
            );
            
            if (recentPayments.length > this.suspiciousPatterns.multiplePaymentAttempts.threshold) {
                analysis.push({ type: 'multiple_payment_attempts', severity: 'high' });
                userBehavior.suspicionScore += 40;
            }
        }

        if (action === 'address_change') {
            const recentChanges = userBehavior.actions.filter(
                a => a.action === 'address_change' && 
                now - a.timestamp < this.suspiciousPatterns.frequentAddressChange.timeWindow
            );
            
            if (recentChanges.length > this.suspiciousPatterns.frequentAddressChange.threshold) {
                analysis.push({ type: 'frequent_address_change', severity: 'medium' });
                userBehavior.suspicionScore += 20;
            }
        }

        if (analysis.length > 0) {
            analysis.forEach(issue => {
                userBehavior.flags.add(issue.type);
                logger.logSuspiciousActivity(issue.type, userId, {
                    action,
                    metadata,
                    severity: issue.severity,
                    suspicionScore: userBehavior.suspicionScore
                });
            });

            this.emit('suspicious_behavior', {
                userId,
                analysis,
                suspicionScore: userBehavior.suspicionScore,
                flags: Array.from(userBehavior.flags)
            });
        }

        userBehavior.suspicionScore = Math.max(0, userBehavior.suspicionScore - 0.1);
        
        return analysis;
    }

    checkVelocity(userId, action, threshold, timeWindow) {
        const userBehavior = this.userBehaviorMap.get(userId);
        if (!userBehavior) return false;

        const now = Date.now();
        const recentActions = userBehavior.actions.filter(
            a => a.action === action && now - a.timestamp < timeWindow
        );

        return recentActions.length >= threshold;
    }

    getUserRiskScore(userId) {
        const userBehavior = this.userBehaviorMap.get(userId);
        return userBehavior ? userBehavior.suspicionScore : 0;
    }

    getUserFlags(userId) {
        const userBehavior = this.userBehaviorMap.get(userId);
        return userBehavior ? Array.from(userBehavior.flags) : [];
    }

    clearUserBehavior(userId) {
        this.userBehaviorMap.delete(userId);
    }

    cleanupOldData(maxAge = 86400000) {
        const now = Date.now();
        for (const [userId, behavior] of this.userBehaviorMap.entries()) {
            if (now - behavior.lastActionTime > maxAge) {
                this.userBehaviorMap.delete(userId);
            }
        }
    }
}

module.exports = new BehaviorMonitor();