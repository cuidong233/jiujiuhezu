const crypto = require('crypto');
const logger = require('../logger/logger');

class DeviceFingerprint {
    constructor() {
        this.deviceDatabase = new Map();
        this.ipBlacklist = new Set();
        this.ipWhitelist = new Set();
        this.suspiciousIPs = new Map();
        this.geoIPDatabase = new Map();
        this.vpnProviders = new Set([
            '45.77.', '104.238.', '108.61.', '149.28.',
            '23.94.', '23.95.', '104.168.', '192.241.',
            '162.159.', '104.16.', '172.64.', '131.255.'
        ]);
        this.cloudProviders = new Set([
            '13.', '18.', '34.', '35.', '52.', '54.',
            '20.', '40.', '104.40.', '137.116.', '168.61.',
            '34.64.', '34.65.', '34.66.', '35.185.', '35.186.'
        ]);
    }

    generateFingerprint(request) {
        const components = {
            userAgent: request.headers['user-agent'] || '',
            acceptLanguage: request.headers['accept-language'] || '',
            acceptEncoding: request.headers['accept-encoding'] || '',
            accept: request.headers['accept'] || '',
            screenResolution: request.body?.screenResolution || '',
            timezone: request.body?.timezone || '',
            canvas: request.body?.canvasFingerprint || '',
            webgl: request.body?.webglFingerprint || '',
            fonts: request.body?.fonts || [],
            plugins: request.body?.plugins || [],
            audioContext: request.body?.audioContext || '',
            cpuClass: request.body?.cpuClass || '',
            platform: request.body?.platform || '',
            doNotTrack: request.headers['dnt'] || '',
            cookies: request.headers['cookie'] ? 'enabled' : 'disabled',
            localStorage: request.body?.localStorage || false,
            sessionStorage: request.body?.sessionStorage || false,
            touchSupport: request.body?.touchSupport || false,
            colorDepth: request.body?.colorDepth || 24,
            pixelRatio: request.body?.pixelRatio || 1
        };

        const fingerprintString = JSON.stringify(components);
        const hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');
        
        return {
            id: hash,
            components,
            timestamp: Date.now()
        };
    }

    async checkIP(ip) {
        if (this.ipWhitelist.has(ip)) {
            return { risk: 'low', reason: 'whitelisted' };
        }

        if (this.ipBlacklist.has(ip)) {
            logger.logRiskEvent({
                type: 'blacklisted_ip',
                ip
            }, 'critical');
            return { risk: 'critical', reason: 'blacklisted' };
        }

        const checks = [];

        if (this.isVPN(ip)) {
            checks.push({ type: 'vpn', risk: 'high' });
        }

        if (this.isCloudProvider(ip)) {
            checks.push({ type: 'cloud_provider', risk: 'high' });
        }

        if (this.isTorExitNode(ip)) {
            checks.push({ type: 'tor', risk: 'critical' });
        }

        const geoData = await this.getGeoLocation(ip);
        if (geoData) {
            if (this.isHighRiskCountry(geoData.country)) {
                checks.push({ type: 'high_risk_country', risk: 'medium' });
            }

            if (this.hasGeoInconsistency(ip, geoData)) {
                checks.push({ type: 'geo_inconsistency', risk: 'high' });
            }
        }

        const reputation = this.checkIPReputation(ip);
        if (reputation.score < 50) {
            checks.push({ type: 'poor_reputation', risk: 'high', score: reputation.score });
        }

        if (checks.length === 0) {
            return { risk: 'low', reason: 'clean' };
        }

        const highestRisk = checks.reduce((max, check) => {
            const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
            return riskLevels[check.risk] > riskLevels[max.risk] ? check : max;
        }, { risk: 'low' });

        return {
            risk: highestRisk.risk,
            reason: checks.map(c => c.type).join(', '),
            details: checks
        };
    }

    isVPN(ip) {
        return this.vpnProviders.has(ip.split('.').slice(0, 2).join('.') + '.');
    }

    isCloudProvider(ip) {
        const prefix = ip.split('.')[0] + '.';
        return this.cloudProviders.has(prefix);
    }

    isTorExitNode(ip) {
        const torExitNodes = new Set([
            '185.220.', '185.100.', '195.206.', '51.75.',
            '198.98.', '199.87.', '209.141.', '23.129.'
        ]);
        
        return Array.from(torExitNodes).some(prefix => ip.startsWith(prefix));
    }

    async getGeoLocation(ip) {
        if (this.geoIPDatabase.has(ip)) {
            return this.geoIPDatabase.get(ip);
        }

        const mockGeoData = {
            ip,
            country: 'US',
            region: 'California',
            city: 'San Francisco',
            latitude: 37.7749,
            longitude: -122.4194,
            timezone: 'America/Los_Angeles'
        };

        this.geoIPDatabase.set(ip, mockGeoData);
        return mockGeoData;
    }

    isHighRiskCountry(country) {
        const highRiskCountries = new Set(['NG', 'RU', 'CN', 'IN', 'PK', 'BD', 'VN']);
        return highRiskCountries.has(country);
    }

    hasGeoInconsistency(ip, geoData) {
        const suspiciousData = this.suspiciousIPs.get(ip);
        if (!suspiciousData) return false;

        const timeDiff = Date.now() - suspiciousData.lastSeen;
        const distance = this.calculateDistance(
            suspiciousData.location.latitude,
            suspiciousData.location.longitude,
            geoData.latitude,
            geoData.longitude
        );

        const maxSpeed = 1000;
        const possibleDistance = (timeDiff / 3600000) * maxSpeed;

        return distance > possibleDistance;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    checkIPReputation(ip) {
        const segments = ip.split('.');
        let score = 100;

        if (segments[0] === '10' || segments[0] === '192' || segments[0] === '172') {
            score -= 20;
        }

        const ipNum = segments.reduce((acc, val) => acc * 256 + parseInt(val), 0);
        if (ipNum % 7 === 0) score -= 10;
        if (ipNum % 13 === 0) score -= 15;

        const suspiciousActivity = this.suspiciousIPs.get(ip);
        if (suspiciousActivity) {
            score -= suspiciousActivity.violations * 10;
        }

        return { score: Math.max(0, score), ip };
    }

    trackDevice(deviceId, userId, fingerprint) {
        if (!this.deviceDatabase.has(deviceId)) {
            this.deviceDatabase.set(deviceId, {
                users: new Set(),
                fingerprints: [],
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                trustScore: 50
            });
        }

        const device = this.deviceDatabase.get(deviceId);
        device.users.add(userId);
        device.fingerprints.push(fingerprint);
        device.lastSeen = Date.now();

        if (device.fingerprints.length > 100) {
            device.fingerprints = device.fingerprints.slice(-50);
        }

        if (device.users.size > 5) {
            device.trustScore = Math.max(0, device.trustScore - 10);
            logger.logSuspiciousActivity('multiple_users_single_device', deviceId, {
                userCount: device.users.size,
                users: Array.from(device.users)
            });
        }

        return device;
    }

    checkDeviceConsistency(deviceId, currentFingerprint) {
        const device = this.deviceDatabase.get(deviceId);
        if (!device || device.fingerprints.length === 0) {
            return { consistent: true, score: 100 };
        }

        const recentFingerprints = device.fingerprints.slice(-10);
        const similarities = recentFingerprints.map(fp => 
            this.calculateSimilarity(fp, currentFingerprint)
        );

        const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;

        if (avgSimilarity < 70) {
            logger.logSuspiciousActivity('device_fingerprint_change', deviceId, {
                similarity: avgSimilarity,
                changes: this.detectChanges(recentFingerprints[recentFingerprints.length - 1], currentFingerprint)
            });
        }

        return {
            consistent: avgSimilarity > 70,
            score: avgSimilarity,
            trustScore: device.trustScore
        };
    }

    calculateSimilarity(fp1, fp2) {
        const components1 = fp1.components;
        const components2 = fp2.components;
        let matches = 0;
        let total = 0;

        for (const key in components1) {
            total++;
            if (JSON.stringify(components1[key]) === JSON.stringify(components2[key])) {
                matches++;
            }
        }

        return (matches / total) * 100;
    }

    detectChanges(oldFp, newFp) {
        const changes = [];
        const old = oldFp.components;
        const current = newFp.components;

        for (const key in old) {
            if (JSON.stringify(old[key]) !== JSON.stringify(current[key])) {
                changes.push({
                    field: key,
                    old: old[key],
                    new: current[key]
                });
            }
        }

        return changes;
    }

    addIPToBlacklist(ip) {
        this.ipBlacklist.add(ip);
        logger.logRiskEvent({
            type: 'ip_blacklisted',
            ip
        }, 'high');
    }

    removeIPFromBlacklist(ip) {
        this.ipBlacklist.delete(ip);
    }

    addIPToWhitelist(ip) {
        this.ipWhitelist.add(ip);
    }

    removeIPFromWhitelist(ip) {
        this.ipWhitelist.delete(ip);
    }

    reportSuspiciousIP(ip, reason, severity = 'medium') {
        if (!this.suspiciousIPs.has(ip)) {
            this.suspiciousIPs.set(ip, {
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                violations: 0,
                reasons: []
            });
        }

        const record = this.suspiciousIPs.get(ip);
        record.lastSeen = Date.now();
        record.violations++;
        record.reasons.push({ reason, timestamp: Date.now(), severity });

        if (record.violations >= 10) {
            this.addIPToBlacklist(ip);
        }

        return record;
    }

    getDeviceInfo(deviceId) {
        return this.deviceDatabase.get(deviceId);
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000;

        for (const [deviceId, device] of this.deviceDatabase.entries()) {
            if (now - device.lastSeen > maxAge) {
                this.deviceDatabase.delete(deviceId);
            }
        }

        for (const [ip, data] of this.suspiciousIPs.entries()) {
            if (now - data.lastSeen > maxAge) {
                this.suspiciousIPs.delete(ip);
            }
        }
    }
}

module.exports = new DeviceFingerprint();