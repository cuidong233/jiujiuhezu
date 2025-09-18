const RiskMiddleware = require('./middleware/risk-middleware');
const riskEngine = require('./engine/risk-engine');
const behaviorMonitor = require('./monitors/behavior-monitor');
const deviceFingerprint = require('./security/device-fingerprint');
const antiCrawler = require('./anti-crawler/anti-crawler');
const RateLimiter = require('./rate-limiter/rate-limiter');
const AlertSystem = require('./alert/alert-system');
const logger = require('./logger/logger');
const riskControlAPI = require('./api/risk-control-api');

module.exports = {
    RiskMiddleware,
    riskEngine,
    behaviorMonitor,
    deviceFingerprint,
    antiCrawler,
    RateLimiter,
    AlertSystem,
    logger,
    riskControlAPI,

    createMiddleware: (options) => {
        return new RiskMiddleware(options);
    },

    createAlertSystem: (config) => {
        return new AlertSystem(config);
    },

    createRateLimiter: (redisConfig) => {
        return new RateLimiter(redisConfig);
    },

    quickStart: (app, options = {}) => {
        const middleware = new RiskMiddleware(options);
        
        app.use(middleware.middleware());
        
        app.use('/api/risk-control', riskControlAPI);

        return {
            middleware,
            loginProtection: middleware.loginProtection.bind(middleware),
            orderValidation: middleware.orderValidation.bind(middleware),
            apiProtection: middleware.apiProtection.bind(middleware)
        };
    }
};