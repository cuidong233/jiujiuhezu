const logger = require('../logger/logger');
const deviceFingerprint = require('../security/device-fingerprint');

class AntiCrawler {
    constructor() {
        this.crawlerSignatures = {
            userAgents: [
                /bot/i, /crawler/i, /spider/i, /scraper/i, /crawl/i,
                /slurp/i, /mediapartners/i, /adsbot/i, /googlebot/i,
                /bingbot/i, /yandexbot/i, /baiduspider/i, /facebookexternalhit/i,
                /twitterbot/i, /linkedinbot/i, /whatsapp/i, /applebot/i,
                /amazonbot/i, /semrushbot/i, /ahrefsbot/i, /mj12bot/i,
                /dotbot/i, /rogerbot/i, /seznambot/i, /python-requests/i,
                /python-urllib/i, /go-http-client/i, /java/i, /perl/i,
                /ruby/i, /curl/i, /wget/i, /libwww/i, /httpunit/i,
                /nutch/i, /phpcrawl/i, /msnbot/i, /rambler/i
            ],
            suspiciousHeaders: {
                missingHeaders: ['accept-language', 'accept-encoding'],
                invalidHeaders: {
                    'accept': [/^\*\/\*$/],
                    'accept-language': [/^$/],
                    'accept-encoding': [/^$/]
                }
            },
            behaviors: {
                rapidRequests: { threshold: 30, window: 10000 },
                sequentialAccess: { threshold: 20, window: 60000 },
                highPageDepth: { threshold: 100, window: 300000 },
                lowDwellTime: { threshold: 500 },
                directAPIAccess: true,
                missingReferrer: true,
                unusualAccessPattern: true
            }
        };

        this.honeypots = new Map();
        this.trapLinks = new Set([
            '/trap/hidden-link',
            '/admin/secret',
            '/private/data',
            '/api/internal',
            '/.git/config',
            '/wp-admin',
            '/phpmyadmin'
        ]);

        this.challenges = new Map();
        this.sessionTracking = new Map();
        this.captchaThreshold = 70;
    }

    async detect(request, sessionId) {
        const detectionResults = {
            isCrawler: false,
            confidence: 0,
            reasons: [],
            requiresChallenge: false,
            action: 'allow'
        };

        const checks = await Promise.all([
            this.checkUserAgent(request),
            this.checkHeaders(request),
            this.checkBehavior(sessionId, request),
            this.checkJavaScript(request),
            this.checkHoneypot(request),
            this.checkMouseMovement(request),
            this.checkTiming(sessionId, request)
        ]);

        checks.forEach(check => {
            if (check.detected) {
                detectionResults.confidence += check.weight;
                detectionResults.reasons.push(check.reason);
            }
        });

        detectionResults.isCrawler = detectionResults.confidence >= 50;

        if (detectionResults.confidence >= 90) {
            detectionResults.action = 'block';
        } else if (detectionResults.confidence >= this.captchaThreshold) {
            detectionResults.requiresChallenge = true;
            detectionResults.action = 'challenge';
        } else if (detectionResults.confidence >= 50) {
            detectionResults.action = 'monitor';
        }

        if (detectionResults.isCrawler) {
            logger.logSuspiciousActivity('crawler_detected', sessionId, {
                confidence: detectionResults.confidence,
                reasons: detectionResults.reasons,
                ip: request.ip,
                userAgent: request.headers['user-agent']
            });
        }

        return detectionResults;
    }

    checkUserAgent(request) {
        const userAgent = request.headers['user-agent'] || '';
        
        if (!userAgent) {
            return { detected: true, weight: 30, reason: 'missing_user_agent' };
        }

        for (const pattern of this.crawlerSignatures.userAgents) {
            if (pattern.test(userAgent)) {
                return { detected: true, weight: 40, reason: 'crawler_user_agent' };
            }
        }

        if (userAgent.length < 20) {
            return { detected: true, weight: 20, reason: 'short_user_agent' };
        }

        const legitBrowsers = /chrome|firefox|safari|edge|opera/i;
        if (!legitBrowsers.test(userAgent)) {
            return { detected: true, weight: 15, reason: 'unusual_browser' };
        }

        return { detected: false, weight: 0 };
    }

    checkHeaders(request) {
        const headers = request.headers;
        const issues = [];

        for (const header of this.crawlerSignatures.suspiciousHeaders.missingHeaders) {
            if (!headers[header]) {
                issues.push(`missing_${header}`);
            }
        }

        for (const [header, patterns] of Object.entries(this.crawlerSignatures.suspiciousHeaders.invalidHeaders)) {
            if (headers[header]) {
                for (const pattern of patterns) {
                    if (pattern.test(headers[header])) {
                        issues.push(`invalid_${header}`);
                    }
                }
            }
        }

        if (!headers['referer'] && request.path !== '/') {
            issues.push('missing_referer');
        }

        if (headers['connection'] === 'close') {
            issues.push('connection_close');
        }

        if (!headers['cookie']) {
            issues.push('no_cookies');
        }

        const weight = Math.min(issues.length * 10, 30);
        return {
            detected: issues.length > 0,
            weight,
            reason: issues.join(', ')
        };
    }

    checkBehavior(sessionId, request) {
        if (!sessionId) {
            return { detected: true, weight: 20, reason: 'no_session' };
        }

        if (!this.sessionTracking.has(sessionId)) {
            this.sessionTracking.set(sessionId, {
                requests: [],
                pages: new Set(),
                startTime: Date.now(),
                lastRequest: Date.now()
            });
        }

        const session = this.sessionTracking.get(sessionId);
        const now = Date.now();
        
        session.requests.push({
            path: request.path,
            timestamp: now,
            method: request.method
        });
        session.pages.add(request.path);
        session.lastRequest = now;

        if (session.requests.length > 1000) {
            session.requests = session.requests.slice(-500);
        }

        const issues = [];

        const recentRequests = session.requests.filter(
            r => now - r.timestamp < this.crawlerSignatures.behaviors.rapidRequests.window
        );
        if (recentRequests.length > this.crawlerSignatures.behaviors.rapidRequests.threshold) {
            issues.push('rapid_requests');
        }

        const timeRange = now - session.startTime;
        const requestRate = session.requests.length / (timeRange / 1000);
        if (requestRate > 2) {
            issues.push('high_request_rate');
        }

        if (session.pages.size > this.crawlerSignatures.behaviors.highPageDepth.threshold) {
            issues.push('high_page_depth');
        }

        if (this.isSequentialAccess(session.requests)) {
            issues.push('sequential_access');
        }

        if (request.path.startsWith('/api/') && !request.headers['referer']) {
            issues.push('direct_api_access');
        }

        const weight = Math.min(issues.length * 15, 40);
        return {
            detected: issues.length > 0,
            weight,
            reason: issues.join(', ')
        };
    }

    checkJavaScript(request) {
        const jsTokens = request.body?.jsTokens || {};
        
        if (!jsTokens.executed) {
            return { detected: true, weight: 25, reason: 'no_javascript_execution' };
        }

        if (!jsTokens.windowSize || !jsTokens.screenSize) {
            return { detected: true, weight: 15, reason: 'missing_browser_properties' };
        }

        if (!jsTokens.plugins || jsTokens.plugins.length === 0) {
            return { detected: true, weight: 10, reason: 'no_browser_plugins' };
        }

        if (!jsTokens.canvas || !jsTokens.webgl) {
            return { detected: true, weight: 10, reason: 'missing_rendering_context' };
        }

        return { detected: false, weight: 0 };
    }

    checkHoneypot(request) {
        if (this.trapLinks.has(request.path)) {
            logger.logRiskEvent({
                type: 'honeypot_triggered',
                path: request.path,
                ip: request.ip,
                sessionId: request.sessionId
            }, 'critical');
            
            return { detected: true, weight: 100, reason: 'honeypot_triggered' };
        }

        if (request.body?.honeypotField) {
            return { detected: true, weight: 80, reason: 'honeypot_field_filled' };
        }

        return { detected: false, weight: 0 };
    }

    checkMouseMovement(request) {
        const movements = request.body?.mouseMovements || [];
        
        if (movements.length === 0) {
            return { detected: true, weight: 20, reason: 'no_mouse_movement' };
        }

        const isLinear = this.analyzeMousePattern(movements);
        if (isLinear) {
            return { detected: true, weight: 25, reason: 'linear_mouse_movement' };
        }

        const velocity = this.calculateMouseVelocity(movements);
        if (velocity > 5000 || velocity < 10) {
            return { detected: true, weight: 15, reason: 'abnormal_mouse_velocity' };
        }

        return { detected: false, weight: 0 };
    }

    checkTiming(sessionId, request) {
        const session = this.sessionTracking.get(sessionId);
        if (!session || session.requests.length < 2) {
            return { detected: false, weight: 0 };
        }

        const timings = [];
        for (let i = 1; i < session.requests.length; i++) {
            timings.push(session.requests[i].timestamp - session.requests[i-1].timestamp);
        }

        const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
        const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTiming, 2), 0) / timings.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < 100) {
            return { detected: true, weight: 20, reason: 'regular_timing_pattern' };
        }

        if (avgTiming < this.crawlerSignatures.behaviors.lowDwellTime.threshold) {
            return { detected: true, weight: 15, reason: 'low_dwell_time' };
        }

        return { detected: false, weight: 0 };
    }

    isSequentialAccess(requests) {
        if (requests.length < 5) return false;

        const recentPaths = requests.slice(-10).map(r => r.path);
        const patterns = [
            /\/page\/\d+/,
            /\/product\/\d+/,
            /\/category\/\d+/,
            /\/item-\d+/
        ];

        for (const pattern of patterns) {
            const matches = recentPaths.filter(path => pattern.test(path));
            if (matches.length > 7) {
                const numbers = matches.map(path => {
                    const match = path.match(/\d+/);
                    return match ? parseInt(match[0]) : 0;
                });

                const isSequential = numbers.every((num, i) => {
                    if (i === 0) return true;
                    return num === numbers[i-1] + 1 || num === numbers[i-1] - 1;
                });

                if (isSequential) return true;
            }
        }

        return false;
    }

    analyzeMousePattern(movements) {
        if (movements.length < 3) return false;

        const angles = [];
        for (let i = 2; i < movements.length; i++) {
            const angle = this.calculateAngle(
                movements[i-2], movements[i-1], movements[i]
            );
            angles.push(angle);
        }

        const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
        const variance = angles.reduce((sum, a) => sum + Math.pow(a - avgAngle, 2), 0) / angles.length;

        return variance < 10;
    }

    calculateAngle(p1, p2, p3) {
        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        
        const dot = v1.x * v2.x + v1.y * v2.y;
        const cross = v1.x * v2.y - v1.y * v2.x;
        
        return Math.atan2(cross, dot) * 180 / Math.PI;
    }

    calculateMouseVelocity(movements) {
        if (movements.length < 2) return 0;

        const velocities = [];
        for (let i = 1; i < movements.length; i++) {
            const distance = Math.sqrt(
                Math.pow(movements[i].x - movements[i-1].x, 2) +
                Math.pow(movements[i].y - movements[i-1].y, 2)
            );
            const time = movements[i].timestamp - movements[i-1].timestamp;
            if (time > 0) {
                velocities.push(distance / time);
            }
        }

        return velocities.reduce((a, b) => a + b, 0) / velocities.length;
    }

    async generateChallenge(sessionId) {
        const challenge = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'captcha',
            created: Date.now(),
            sessionId,
            solved: false
        };

        this.challenges.set(challenge.id, challenge);
        
        setTimeout(() => {
            if (this.challenges.has(challenge.id)) {
                this.challenges.delete(challenge.id);
            }
        }, 300000);

        return challenge;
    }

    verifyChallenge(challengeId, solution) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) {
            return { valid: false, reason: 'challenge_not_found' };
        }

        if (Date.now() - challenge.created > 300000) {
            this.challenges.delete(challengeId);
            return { valid: false, reason: 'challenge_expired' };
        }

        if (challenge.solved) {
            return { valid: false, reason: 'challenge_already_solved' };
        }

        challenge.solved = true;
        this.challenges.delete(challengeId);

        return { valid: true };
    }

    addHoneypot(path) {
        this.trapLinks.add(path);
    }

    removeHoneypot(path) {
        this.trapLinks.delete(path);
    }

    getSessionInfo(sessionId) {
        return this.sessionTracking.get(sessionId);
    }

    clearSession(sessionId) {
        this.sessionTracking.delete(sessionId);
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 3600000;

        for (const [sessionId, session] of this.sessionTracking.entries()) {
            if (now - session.lastRequest > maxAge) {
                this.sessionTracking.delete(sessionId);
            }
        }

        for (const [challengeId, challenge] of this.challenges.entries()) {
            if (now - challenge.created > 300000) {
                this.challenges.delete(challengeId);
            }
        }
    }
}

module.exports = new AntiCrawler();