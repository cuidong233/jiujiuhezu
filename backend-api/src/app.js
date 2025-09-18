/**
 * 应用主入口文件 - 使用所有新的中间件
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// 导入我们新创建的中间件
import { responseMiddleware } from './middleware/response.js';
import { errorHandler, notFoundHandler, logger } from './middleware/errorHandler.js';
import { sqlInjectionProtection } from './middleware/validation.js';
import { authenticate, adminAuth } from './middleware/auth.js';

// 导入数据库和模型
import { testConnection } from './db/database.js';
import { sequelize } from './models/index.js';
import taskScheduler from './tasks/scheduler.js';

// 导入路由
import wechatPayRoutes from './routes/wechatPay.routes.js';
import alipayPayRoutes from './routes/alipayPay.routes.js';
import paymentStatusRoutes from './routes/paymentStatus.routes.js';
import productRoutes from './routes/product.routes.js';
import productMediaRoutes from './routes/productMedia.routes.js';
import cdkRoutes from './routes/cdk.routes.js';
import adminRoutes from './routes/admin.routes.js';
import binanceRoutes from './routes/binance.routes.js';
import orderRoutes from './routes/order.routes.js';
import orderReceiptsFixRoutes from './routes/order.receipts.fix.js';
import authRoutes from './routes/auth.routes.js';
import authSimpleRoutes from './routes/auth.simple.routes.js';
import questionRoutes from './routes/question.routes.js';
import workRoutes from './routes/work.routes.js';
import vipRoutes from './routes/vip.routes.js';
import withdrawRoutes from './routes/withdraw.routes.js';
import emailRoutes from './routes/email.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import cartRoutes from './routes/cart.routes.js';
import userRoutes from './routes/user.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import articleRoutes from './routes/article.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import discountRoutes from './routes/discount.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 信任代理（如果使用反向代理）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      mediaSrc: ["'self'", "blob:", "*"],
      connectSrc: ["'self'", "*"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "data:", "*"]
    }
  }
}));

// 请求日志
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 登录接口限制更严格
  message: {
    code: 429,
    message: '登录尝试过于频繁，请15分钟后再试',
    success: false
  }
});

const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100, // 管理接口限制
  message: {
    code: 429,
    message: '管理操作过于频繁，请稍后再试',
    success: false
  }
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/admin', adminLimiter);

// CORS配置
app.use(cors({
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:8080', 
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // 开发环境允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS策略不允许此来源访问'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token', 'x-request-id', 'x-timestamp', 'x-signature']
}));

// 请求体解析
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// SQL注入保护
app.use(sqlInjectionProtection);

// 统一响应格式中间件
app.use(responseMiddleware);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 健康检查端点
app.get('/health', (req, res) => {
  res.apiSuccess({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }, '服务运行正常');
});

// API文档端点
app.get('/api', (req, res) => {
  res.apiSuccess({
    message: 'CDK管理系统 API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth/*',
      products: '/api/product/*',
      orders: '/api/order/*',
      cdk: '/api/cdk/*',
      admin: '/api/admin/*',
      user: '/api/user/*'
    }
  });
});

// ============= 公开路由（无需认证） =============

// 认证相关路由
app.use('/api/auth', authRoutes);
app.use('/api/auth-simple', authSimpleRoutes);

// 支付相关路由（回调通常不需要认证）
app.use('/api/payment/wechat', wechatPayRoutes);
app.use('/api/payment/alipay', alipayPayRoutes);
app.use('/api/payment-status', paymentStatusRoutes);

// 产品相关路由（部分公开）
app.use('/api/product', productRoutes);
app.use('/api/product-media', productMediaRoutes);

// 文章路由（部分公开）
app.use('/api/article', articleRoutes);

// 轮播图路由（部分公开）
app.use('/api', bannerRoutes);

// 折扣活动路由（部分公开）
app.use('/api/discount', discountRoutes);

// 上传路由（需要认证）
app.use('/api/upload', uploadRoutes);

// 邮件验证路由
app.use('/api/email', emailRoutes);

// ============= 需要认证的用户路由 =============

// 用户相关路由
app.use('/api/user', authenticate, userRoutes);
app.use('/api/wallet', authenticate, walletRoutes);
app.use('/api/favorites', authenticate, favoritesRoutes);
app.use('/api/cart', authenticate, cartRoutes);
// Order routes have their own authentication per endpoint
app.use('/api/order', orderRoutes);

// 临时修复路由 - 用于修复已存在的代充订单
app.use('/api/fix', orderReceiptsFixRoutes);

// ============= 管理员路由 =============

// 管理员专用路由
app.use('/api/admin', adminAuth, adminRoutes);
app.use('/api/cdk', adminAuth, cdkRoutes);
app.use('/api/binance', adminAuth, binanceRoutes);
app.use('/api/question', adminAuth, questionRoutes);
app.use('/api/work', adminAuth, workRoutes);
app.use('/api/vip', adminAuth, vipRoutes);
app.use('/api/withdraw', adminAuth, withdrawRoutes);
app.use('/api/dashboard', adminAuth, dashboardRoutes);

// ============= 错误处理 =============

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ============= 服务器启动 =============

async function startServer() {
  try {
    // 测试数据库连接
    logger.info('正在测试数据库连接...');
    await testConnection();
    
    // 同步数据库模型
    logger.info('正在同步数据库模型...');
    await sequelize.sync({ alter: false });
    
    // 启动定时任务
    logger.info('正在启动定时任务...');
    await taskScheduler.initialize();
    await taskScheduler.startAll();
    
    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      logger.info(`🚀 服务器已启动`);
      logger.info(`📍 地址: http://localhost:${PORT}`);
      logger.info(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 健康检查: http://localhost:${PORT}/health`);
      logger.info(`📚 API文档: http://localhost:${PORT}/api`);
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`);
      
      // 停止接收新请求
      server.close(async (err) => {
        if (err) {
          logger.error('服务器关闭出错:', err);
          process.exit(1);
        }
        
        try {
          // 停止定时任务
          logger.info('正在停止定时任务...');
          await taskScheduler.shutdown();
          
          // 关闭数据库连接
          logger.info('正在关闭数据库连接...');
          await sequelize.close();
          
          logger.info('服务器已优雅关闭');
          process.exit(0);
        } catch (error) {
          logger.error('关闭过程中出错:', error);
          process.exit(1);
        }
      });
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 监听未捕获的异常
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的Promise拒绝:', { reason, promise });
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

export default app;