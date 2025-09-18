const Redis = require('ioredis');
const logger = require('../logger/logger');

class RateLimiter {
    constructor(redisConfig = {}) {
        this.redis = new Redis({
            host: redisConfig.host || 'localhost',
            port: redisConfig.port || 6379,
            password: redisConfig.password,
            db: redisConfig.db || 0,
            retryStrategy: (times) => Math.min(times * 50, 2000)
        });

        this.limits = {
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
        };

        this.blacklist = new Set();
        this.whitelist = new Set();
        this.tempBans = new Map();
    }

    async checkLimit(identifier, type = 'global', action = null) {
        if (this.whitelist.has(identifier)) {
            return { allowed: true, remaining: Infinity };
        }

        if (this.blacklist.has(identifier) || this.isTemporarilyBanned(identifier)) {
            logger.logRiskEvent({
                type: 'rate_limit_blocked',
                identifier,
                reason: 'blacklisted_or_banned'
            }, 'high');
            return { allowed: false, remaining: 0, retryAfter: this.getTempBanExpiry(identifier) };
        }

        const key = this.generateKey(identifier, type, action);
        const limit = this.getLimit(type, action);
        
        if (!limit) {
            return { allowed: true, remaining: Infinity };
        }

        try {
            const current = await this.redis.incr(key);
            
            if (current === 1) {
                await this.redis.pexpire(key, limit.window);
            }

            const ttl = await this.redis.pttl(key);
            const remaining = Math.max(0, limit.requests - current);

            if (current > limit.requests) {
                const violations = await this.recordViolation(identifier, type, action);
                
                if (violations >= 3) {
                    this.tempBan(identifier, Math.min(violations * 600000, 86400000));
                }

                logger.logSuspiciousActivity('rate_limit_exceeded', identifier, {
                    type,
                    action,
                    attempts: current,
                    limit: limit.requests,
                    violations
                });

                return {
                    allowed: false,
                    remaining: 0,
                    retryAfter: ttl > 0 ? ttl : limit.window
                };
            }

            return {
                allowed: true,
                remaining,
                limit: limit.requests,
                window: limit.window,
                resetAt: Date.now() + ttl
            };
        } catch (error) {
            logger.logSystemEvent({
                type: 'rate_limiter_error',
                error: error.message,
                identifier,
                fallback: 'allowing_request'
            }, 'error');
            
            return { allowed: true, remaining: Infinity };
        }
    }

    async checkSlidingWindow(identifier, limit, window, bucketSize = 60000) {
        const now = Date.now();
        const windowStart = now - window;
        const key = `sliding:${identifier}`;

        try {
            await this.redis.zremrangebyscore(key, '-inf', windowStart);
            
            const count = await this.redis.zcard(key);
            
            if (count >= limit) {
                return { allowed: false, count };
            }

            await this.redis.zadd(key, now, `${now}-${Math.random()}`);
            await this.redis.expire(key, Math.ceil(window / 1000));

            return { allowed: true, count: count + 1, limit };
        } catch (error) {
            logger.logSystemEvent({
                type: 'sliding_window_error',
                error: error.message,
                identifier
            }, 'error');
            
            return { allowed: true, count: 0 };
        }
    }

    async checkTokenBucket(identifier, capacity, refillRate, interval = 1000) {
        const key = `bucket:${identifier}`;
        const now = Date.now();

        try {
            const bucketData = await this.redis.hgetall(key);
            
            let tokens = parseInt(bucketData.tokens) || capacity;
            let lastRefill = parseInt(bucketData.lastRefill) || now;

            const timePassed = now - lastRefill;
            const tokensToAdd = Math.floor((timePassed / interval) * refillRate);
            
            tokens = Math.min(capacity, tokens + tokensToAdd);

            if (tokens < 1) {
                const waitTime = Math.ceil((1 - tokens) * interval / refillRate);
                return { 
                    allowed: false, 
                    tokens: 0, 
                    waitTime 
                };
            }

            await this.redis.hmset(key, {
                tokens: tokens - 1,
                lastRefill: now
            });
            await this.redis.expire(key, Math.ceil(capacity * interval / refillRate / 1000));

            return { 
                allowed: true, 
                tokens: tokens - 1, 
                capacity 
            };
        } catch (error) {
            logger.logSystemEvent({
                type: 'token_bucket_error',
                error: error.message,
                identifier
            }, 'error');
            
            return { allowed: true, tokens: capacity };
        }
    }

    async checkDistributed(identifier, limit, window, replicas = 3) {
        const results = [];
        
        for (let i = 0; i < replicas; i++) {
            const key = `dist:${i}:${identifier}`;
            const shardLimit = Math.ceil(limit / replicas);
            
            try {
                const count = await this.redis.incr(key);
                
                if (count === 1) {
                    await this.redis.pexpire(key, window);
                }
                
                results.push(count <= shardLimit);
            } catch (error) {
                results.push(true);
            }
        }

        const allowed = results.filter(r => r).length >= Math.ceil(replicas / 2);
        
        return { allowed };
    }

    generateKey(identifier, type, action) {
        const parts = ['rate_limit', type, identifier];
        if (action) parts.push(action);
        return parts.join(':');
    }

    getLimit(type, action) {
        if (type === 'api' && action && this.limits.api[action]) {
            return this.limits.api[action];
        }
        return this.limits[type] || this.limits.global;
    }

    async recordViolation(identifier, type, action) {
        const key = `violations:${identifier}`;
        const violations = await this.redis.incr(key);
        
        if (violations === 1) {
            await this.redis.expire(key, 86400);
        }
        
        return violations;
    }

    addToBlacklist(identifier) {
        this.blacklist.add(identifier);
        logger.logRiskEvent({
            type: 'blacklist_add',
            identifier
        }, 'high');
    }

    removeFromBlacklist(identifier) {
        this.blacklist.delete(identifier);
    }

    addToWhitelist(identifier) {
        this.whitelist.add(identifier);
    }

    removeFromWhitelist(identifier) {
        this.whitelist.delete(identifier);
    }

    tempBan(identifier, duration) {
        const expiry = Date.now() + duration;
        this.tempBans.set(identifier, expiry);
        
        logger.logRiskEvent({
            type: 'temp_ban',
            identifier,
            duration,
            expiry: new Date(expiry).toISOString()
        }, 'high');

        setTimeout(() => {
            this.tempBans.delete(identifier);
        }, duration);
    }

    isTemporarilyBanned(identifier) {
        const expiry = this.tempBans.get(identifier);
        if (!expiry) return false;
        
        if (Date.now() > expiry) {
            this.tempBans.delete(identifier);
            return false;
        }
        
        return true;
    }

    getTempBanExpiry(identifier) {
        const expiry = this.tempBans.get(identifier);
        if (!expiry || Date.now() > expiry) return 0;
        return expiry - Date.now();
    }

    async reset(identifier, type = null, action = null) {
        const key = this.generateKey(identifier, type || 'global', action);
        await this.redis.del(key);
    }

    async getStats(identifier) {
        const stats = {};
        const types = ['global', 'api', 'ip', 'user'];
        
        for (const type of types) {
            const key = this.generateKey(identifier, type);
            const count = await this.redis.get(key);
            const ttl = await this.redis.pttl(key);
            
            if (count) {
                stats[type] = {
                    count: parseInt(count),
                    ttl,
                    limit: this.getLimit(type)
                };
            }
        }
        
        return stats;
    }

    updateLimit(type, action, newLimit) {
        if (type === 'api' && action) {
            this.limits.api[action] = newLimit;
        } else if (this.limits[type]) {
            this.limits[type] = { ...this.limits[type], ...newLimit };
        }
    }

    async cleanup() {
        const now = Date.now();
        for (const [identifier, expiry] of this.tempBans.entries()) {
            if (now > expiry) {
                this.tempBans.delete(identifier);
            }
        }
    }
}

module.exports = RateLimiter;