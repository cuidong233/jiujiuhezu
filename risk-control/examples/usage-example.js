const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const RiskMiddleware = require('../middleware/risk-middleware');
const riskControlAPI = require('../api/risk-control-api');
const config = require('../config/default.config');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const riskMiddleware = new RiskMiddleware({
    ...config.middleware,
    redis: config.redis
});

app.use(riskMiddleware.middleware());

app.use('/api/risk-control', riskControlAPI);

app.post('/api/login', 
    riskMiddleware.loginProtection(),
    async (req, res) => {
        const { username, password } = req.body;
        
        console.log('Login attempt:', {
            username,
            loginContext: req.loginContext
        });

        res.json({
            success: true,
            message: 'Login successful'
        });
    }
);

app.post('/api/order', 
    riskMiddleware.orderValidation(),
    async (req, res) => {
        const order = req.body;
        
        if (req.requiresReview) {
            console.log('Order requires manual review:', {
                orderId: order.id,
                reasons: req.reviewReasons
            });
        }

        console.log('Order risk evaluation:', req.riskEvaluation);

        res.json({
            success: true,
            orderId: order.id,
            requiresReview: req.requiresReview || false,
            riskScore: req.riskEvaluation?.riskScore
        });
    }
);

app.get('/api/products',
    riskMiddleware.apiProtection({
        rateLimit: { requests: 50, window: 60000 },
        requireAuth: false
    }),
    async (req, res) => {
        res.json({
            products: [
                { id: 1, name: 'Product 1', price: 100 },
                { id: 2, name: 'Product 2', price: 200 }
            ]
        });
    }
);

app.post('/api/payment',
    async (req, res, next) => {
        req.user = { id: req.body.userId };
        next();
    },
    riskMiddleware.apiProtection({
        rateLimit: { requests: 5, window: 60000 },
        requireAuth: true
    }),
    async (req, res) => {
        const payment = req.body;
        
        console.log('Processing payment with risk score:', req.riskScore);

        res.json({
            success: true,
            paymentId: payment.id,
            riskScore: req.riskScore
        });
    }
);

const simulateRequests = async () => {
    const fetch = require('node-fetch');
    const baseUrl = 'http://localhost:3000';

    console.log('\n=== 模拟正常登录请求 ===');
    try {
        const loginResponse = await fetch(`${baseUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'user1',
                password: 'password123'
            })
        });
        console.log('登录响应:', await loginResponse.json());
    } catch (error) {
        console.error('登录失败:', error.message);
    }

    console.log('\n=== 模拟频繁登录（触发频率限制）===');
    for (let i = 0; i < 7; i++) {
        try {
            const response = await fetch(`${baseUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `user${i}`,
                    password: 'password'
                })
            });
            const result = await response.json();
            console.log(`尝试 ${i + 1}:`, result.error || 'Success');
        } catch (error) {
            console.error(`尝试 ${i + 1} 失败:`, error.message);
        }
    }

    console.log('\n=== 模拟正常订单 ===');
    try {
        const orderResponse = await fetch(`${baseUrl}/api/order`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Id': 'user123'
            },
            body: JSON.stringify({
                id: 'order001',
                totalAmount: 500,
                items: [
                    { id: 'item1', quantity: 2, price: 250 }
                ],
                paymentMethod: 'credit_card',
                shippingAddress: '123 Main St',
                billingAddress: '123 Main St'
            })
        });
        console.log('订单响应:', await orderResponse.json());
    } catch (error) {
        console.error('订单失败:', error.message);
    }

    console.log('\n=== 模拟高风险订单 ===');
    try {
        const highRiskOrder = await fetch(`${baseUrl}/api/order`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Id': 'new_user'
            },
            body: JSON.stringify({
                id: 'order002',
                totalAmount: 50000,
                items: [
                    { id: 'item1', quantity: 100, price: 500 }
                ],
                paymentMethod: 'credit_card',
                shippingAddress: '456 Other St',
                billingAddress: '789 Different St'
            })
        });
        console.log('高风险订单响应:', await highRiskOrder.json());
    } catch (error) {
        console.error('高风险订单失败:', error.message);
    }

    console.log('\n=== 模拟爬虫行为 ===');
    for (let i = 0; i < 35; i++) {
        try {
            const response = await fetch(`${baseUrl}/api/products`, {
                headers: {
                    'User-Agent': 'python-requests/2.28.1'
                }
            });
            if (i % 10 === 0) {
                const result = await response.json();
                console.log(`爬虫请求 ${i + 1}:`, result.error || 'Success');
            }
        } catch (error) {
            if (i % 10 === 0) {
                console.error(`爬虫请求 ${i + 1} 失败:`, error.message);
            }
        }
    }

    console.log('\n=== 测试风控API ===');
    
    try {
        const evaluateResponse = await fetch(`${baseUrl}/api/risk-control/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'test_action',
                metadata: {
                    testData: 'test value'
                }
            })
        });
        console.log('风险评估:', await evaluateResponse.json());
    } catch (error) {
        console.error('风险评估失败:', error.message);
    }

    try {
        const statsResponse = await fetch(`${baseUrl}/api/risk-control/statistics`);
        console.log('系统统计:', await statsResponse.json());
    } catch (error) {
        console.error('获取统计失败:', error.message);
    }
};

const customRuleExample = () => {
    console.log('\n=== 自定义规则示例 ===');
    
    const customRule = {
        name: 'custom_flash_sale',
        description: '闪购活动风控规则',
        priority: 1,
        conditions: [
            { type: 'order_amount', operator: '>', value: 1000 },
            { type: 'account_age', operator: '<', value: 604800000 },
            { type: 'order_count', operator: '>', value: 3, timeWindow: 3600000 }
        ],
        actions: ['manual_review', 'delay_processing'],
        riskScore: 60
    };

    console.log('自定义规则配置:', JSON.stringify(customRule, null, 2));
};

const deviceFingerprintExample = () => {
    console.log('\n=== 设备指纹示例 ===');
    
    const mockRequest = {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'accept-encoding': 'gzip, deflate, br'
        },
        body: {
            screenResolution: '1920x1080',
            timezone: 'Asia/Shanghai',
            canvasFingerprint: 'abc123def456',
            webglFingerprint: 'xyz789uvw012',
            fonts: ['Arial', 'Times New Roman', 'Courier New'],
            plugins: ['Chrome PDF Plugin', 'Native Client'],
            localStorage: true,
            sessionStorage: true,
            touchSupport: false,
            colorDepth: 24,
            pixelRatio: 1
        }
    };

    console.log('设备指纹请求数据:', JSON.stringify(mockRequest, null, 2));
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`风控系统已启动，端口: ${PORT}`);
    console.log(`API文档: http://localhost:${PORT}/api/risk-control`);
    
    customRuleExample();
    deviceFingerprintExample();
    
    setTimeout(() => {
        console.log('\n开始模拟请求测试...');
        simulateRequests().then(() => {
            console.log('\n模拟测试完成');
        });
    }, 2000);
});

process.on('SIGINT', () => {
    console.log('\n正在关闭风控系统...');
    process.exit(0);
});