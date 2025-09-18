module.exports = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: process.env.REDIS_DB || 0
    },

    rateLimit: {
        global: {
            requests: 1000,
            window: 3600000
        },
        api: {
            login: { requests: 5, window: 300000 },
            register: { requests: 3, window: 3600000 },
            order: { requests: 10, window: 60000 },
            payment: { requests: 5, window: 60000 },
            product_view: { requests: 100, window: 60000 },
            search: { requests: 30, window: 60000 },
            comment: { requests: 10, window: 600000 },
            cart_add: { requests: 20, window: 60000 },
            coupon_use: { requests: 5, window: 300000 }
        },
        ip: {
            requests: 500,
            window: 3600000,
            burst: 50
        },
        user: {
            requests: 200,
            window: 3600000,
            burst: 20
        }
    },

    behavior: {
        suspiciousPatterns: {
            rapidClicking: { threshold: 10, timeWindow: 1000 },
            frequentOrders: { threshold: 5, timeWindow: 60000 },
            unusualAmount: { minAmount: 10000, maxAmount: 1000000 },
            bulkPurchase: { threshold: 20 },
            rapidPageNavigation: { threshold: 50, timeWindow: 10000 },
            abnormalOrderTime: { start: 2, end: 5 },
            multiplePaymentAttempts: { threshold: 3, timeWindow: 300000 },
            frequentAddressChange: { threshold: 3, timeWindow: 86400000 }
        },
        cleanupInterval: 86400000
    },

    crawler: {
        captchaThreshold: 70,
        honeypots: [
            '/trap/hidden-link',
            '/admin/secret',
            '/private/data',
            '/api/internal'
        ],
        behaviors: {
            rapidRequests: { threshold: 30, window: 10000 },
            sequentialAccess: { threshold: 20, window: 60000 },
            highPageDepth: { threshold: 100, window: 300000 },
            lowDwellTime: { threshold: 500 }
        }
    },

    security: {
        vpnProviders: [
            '45.77.', '104.238.', '108.61.', '149.28.',
            '23.94.', '23.95.', '104.168.', '192.241.'
        ],
        cloudProviders: [
            '13.', '18.', '34.', '35.', '52.', '54.',
            '20.', '40.', '104.40.', '137.116.', '168.61.'
        ],
        torExitNodes: [
            '185.220.', '185.100.', '195.206.', '51.75.',
            '198.98.', '199.87.', '209.141.', '23.129.'
        ],
        highRiskCountries: ['NG', 'RU', 'CN', 'IN', 'PK', 'BD', 'VN']
    },

    alert: {
        email: {
            enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
            smtp: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER || '',
                    pass: process.env.SMTP_PASS || ''
                }
            },
            recipients: process.env.ALERT_RECIPIENTS?.split(',') || []
        },
        webhook: {
            enabled: process.env.ALERT_WEBHOOK_ENABLED === 'true',
            urls: process.env.ALERT_WEBHOOK_URLS?.split(',') || []
        },
        sms: {
            enabled: process.env.ALERT_SMS_ENABLED === 'true',
            provider: process.env.SMS_PROVIDER || 'twilio',
            config: {
                accountSid: process.env.TWILIO_ACCOUNT_SID || '',
                authToken: process.env.TWILIO_AUTH_TOKEN || '',
                from: process.env.TWILIO_FROM_NUMBER || ''
            }
        },
        thresholds: {
            riskScore: 70,
            failedLogins: 5,
            orderAmount: 10000,
            crawlerConfidence: 80,
            suspiciousIPs: 10
        },
        cooldowns: {
            critical: 60000,
            high: 300000,
            medium: 600000,
            low: 1800000
        }
    },

    riskEngine: {
        enabled: true,
        defaultRiskThreshold: 70,
        decisionThresholds: {
            block: 80,
            review: 60,
            challenge: 40,
            monitor: 20
        },
        rules: {
            high_frequency_order: {
                enabled: true,
                priority: 1,
                riskScore: 80
            },
            suspicious_payment: {
                enabled: true,
                priority: 2,
                riskScore: 60
            },
            bulk_purchase: {
                enabled: true,
                priority: 3,
                riskScore: 50
            },
            new_user_high_value: {
                enabled: true,
                priority: 2,
                riskScore: 70
            },
            address_mismatch: {
                enabled: true,
                priority: 3,
                riskScore: 45
            },
            velocity_check: {
                enabled: true,
                priority: 1,
                riskScore: 55
            },
            device_anomaly: {
                enabled: true,
                priority: 2,
                riskScore: 75
            },
            coupon_abuse: {
                enabled: true,
                priority: 3,
                riskScore: 65
            }
        }
    },

    middleware: {
        enabled: true,
        blockOnHighRisk: true,
        riskThreshold: 70,
        crawlerDetection: true,
        rateLimit: true,
        deviceTracking: true,
        behaviorTracking: true,
        skipPaths: ['/health', '/metrics', '/favicon.ico', '/robots.txt'],
        sessionKey: 'sessionId',
        userKey: 'id'
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        maxFiles: '14d',
        maxSize: '20m',
        auditLogRetention: '90d'
    },

    cleanup: {
        enabled: true,
        interval: 3600000,
        maxAge: {
            sessions: 86400000,
            decisions: 86400000,
            alerts: 86400000,
            devices: 2592000000
        }
    },

    performance: {
        maxConcurrentEvaluations: 100,
        evaluationTimeout: 5000,
        cacheEnabled: true,
        cacheTTL: 300000
    }
};