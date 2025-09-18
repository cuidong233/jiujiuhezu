const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

class Logger {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.splat(),
                winston.format.json()
            ),
            defaultMeta: { service: 'risk-control' },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                new DailyRotateFile({
                    filename: path.join('logs', 'risk-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d'
                }),
                new DailyRotateFile({
                    filename: path.join('logs', 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxSize: '20m',
                    maxFiles: '30d'
                })
            ]
        });

        this.auditLogger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new DailyRotateFile({
                    filename: path.join('logs', 'audit-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '50m',
                    maxFiles: '90d'
                })
            ]
        });
    }

    logUserAction(userId, action, details, riskLevel = 'normal') {
        this.auditLogger.info({
            userId,
            action,
            details,
            riskLevel,
            timestamp: new Date(),
            ip: details.ip || null,
            userAgent: details.userAgent || null,
            sessionId: details.sessionId || null
        });
    }

    logSuspiciousActivity(type, userId, details) {
        this.logger.warn({
            type: 'suspicious_activity',
            suspicionType: type,
            userId,
            details,
            timestamp: new Date()
        });
    }

    logRiskEvent(event, severity = 'medium') {
        this.logger.error({
            type: 'risk_event',
            event,
            severity,
            timestamp: new Date()
        });
    }

    logSystemEvent(event, level = 'info') {
        this.logger.log(level, event);
    }
}

module.exports = new Logger();