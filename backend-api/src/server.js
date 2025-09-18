import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './db/database.js';
import { initializeTables } from './db/init-tables.js';
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
import authRoutes from './routes/auth.routes.js';
import authSimpleRoutes from './routes/auth.simple.routes.js';
import questionRoutes from './routes/question.routes.js';
import workRoutes from './routes/work.routes.js';
import vipRoutes from './routes/vip.routes.js';
import withdrawRoutes from './routes/withdraw.routes.js';
import emailRoutes from './routes/email.routes.js';
import adminEmailRoutes from './routes/adminEmail.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import cartRoutes from './routes/cart.routes.js';
import userRoutes from './routes/user.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import articleRoutes from './routes/article.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import discountRoutes from './routes/discount.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件 - 配置允许跨域图片加载
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:*", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002', 
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8002',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    // 允许没有origin的请求（比如Postman）
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'Accept-Language', 'x-request-id', 'x-timestamp', 'x-signature'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: 'text/plain' }));

// 静态文件服务 - 用于提供上传的媒体文件
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 根路径欢迎页面
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Backend API Server',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api_docs: '请访问具体的API端点',
      payment: {
        wechat: '/api/wechat/pay',
        alipay: '/api/payment/alipay'
      },
      business: {
        product: '/api/product',
        order: '/api/order',
        cdk: '/api/cdk'
      },
      support: {
        question: '/api/question',
        work: '/api/work'
      }
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API路由
// 支付相关
app.use('/api/wechat/pay', wechatPayRoutes);
app.use('/api/payment/alipay', alipayPayRoutes);
app.use('/api/payment/status', paymentStatusRoutes);

// 产品和订单相关
app.use('/api/auth', authSimpleRoutes);  // 简化版认证路由
app.use('/api/product', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/media', productMediaRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/cdk', cdkRoutes);

// 收藏和购物车
app.use('/api/favorites', favoritesRoutes);  // 收藏功能
app.use('/api/cart', cartRoutes);  // 购物车功能

// 管理相关
app.use('/api/admin', adminRoutes);
app.use('/api/binance', binanceRoutes);

// 客服相关
app.use('/api/question', questionRoutes);
app.use('/api/work', workRoutes);

// VIP和提现
app.use('/api/vip', vipRoutes);
app.use('/api/withdraw', withdrawRoutes);

// 邮件服务
app.use('/api/email', emailRoutes);

// Admin email management
app.use('/api/admin', adminEmailRoutes);

// 用户和钱包
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);

// 文章管理
app.use('/api/articles', articleRoutes);

// 仪表板统计
app.use('/api/dashboard', dashboardRoutes);

// 轮播图管理
app.use('/api', bannerRoutes);

// 文件上传
app.use('/api/upload', uploadRoutes);

// 通知系统
app.use('/api/notification', notificationRoutes);

// 折扣活动路由
app.use('/api/discount', discountRoutes);

// 任务管理API
app.get('/api/tasks/status', (req, res) => {
  try {
    const status = taskScheduler.getTasksStatus();
    res.json({
      code: 200,
      success: true,
      data: status,
      message: '获取任务状态成功'
    });
  } catch (error) {
    console.error('获取任务状态失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: error.message || '获取任务状态失败'
    });
  }
});

app.get('/api/tasks/:taskId/status', (req, res) => {
  try {
    const { taskId } = req.params;
    const status = taskScheduler.getTaskStatus(taskId);
    res.json({
      code: 200,
      success: true,
      data: status,
      message: '获取任务状态成功'
    });
  } catch (error) {
    console.error('获取任务状态失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: error.message || '任务不存在或获取失败'
    });
  }
});

app.post('/api/tasks/:taskId/execute', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await taskScheduler.executeTask(taskId);
    res.json({
      code: 200,
      success: result.success,
      data: result,
      message: result.message || '任务执行完成'
    });
  } catch (error) {
    console.error('执行任务失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: error.message || '执行任务失败'
    });
  }
});

app.post('/api/tasks/:taskId/toggle', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        code: 400,
        success: false,
        message: 'enabled参数必须是布尔值'
      });
    }
    
    await taskScheduler.toggleTask(taskId, enabled);
    res.json({
      code: 200,
      success: true,
      message: `任务 ${taskId} 已${enabled ? '启用' : '禁用'}`
    });
  } catch (error) {
    console.error('切换任务状态失败:', error);
    res.status(500).json({
      code: 500,
      success: false,
      message: error.message || '切换任务状态失败'
    });
  }
});

// 处理404
app.use((req, res) => {
  console.log('404 - 未找到路由:', req.method, req.url, req.path);
  res.status(404).json({
    code: 404,
    message: 'Not Found'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || 'Internal Server Error'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ 无法连接到数据库，请检查配置');
      console.log('📝 请确保MySQL服务正在运行，并在.env文件中配置正确的数据库连接信息');
    } else {
      // 检查是否需要自动同步数据库
      if (process.env.AUTO_SYNC_DB !== 'false') {
        try {
          // 初始化数据库表
          await initializeTables();
          
          // 同步数据库模型 - 使用 force: false 避免删除现有数据
          await sequelize.sync({ force: false, alter: false });
          console.log('✅ 数据库模型同步成功');
        } catch (error) {
          console.error('⚠️ 数据库初始化失败，但服务继续运行:', error.message);
          console.log('💡 提示: 设置环境变量 AUTO_SYNC_DB=false 来跳过自动同步');
          console.log('💡 提示: 或手动运行 npm run db:init 来初始化数据库');
        }
      } else {
        console.log('ℹ️ 跳过数据库自动同步 (AUTO_SYNC_DB=false)');
      }
    }

    // 验证支付配置（静默处理）
    try {
      const { validateWechatConfig } = await import('./config/wechat.config.js');
      validateWechatConfig();
    } catch (error) {
      // 静默处理
    }

    try {
      const { validateAlipayConfig } = await import('./config/alipay.config.js');
      validateAlipayConfig();
    } catch (error) {
      // 静默处理
    }

    // 初始化并启动任务调度器
    try {
      await taskScheduler.initialize();
      await taskScheduler.startAll();
      console.log('✅ 任务调度器启动成功');
    } catch (error) {
      console.error('❌ 任务调度器启动失败:', error);
      // 不中断服务器启动
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log('\n📋 可用的API端点：');
      console.log('  支付相关：');
      console.log(`    💳 微信支付: http://localhost:${PORT}/api/wechat/pay`);
      console.log(`    💳 支付宝支付: http://localhost:${PORT}/api/payment/alipay`);
      console.log('\n  产品和订单：');
      console.log(`    📦 商品管理: http://localhost:${PORT}/api/product`);
      console.log(`    📸 媒体管理: http://localhost:${PORT}/api/media`);
      console.log(`    📝 订单管理: http://localhost:${PORT}/api/order`);
      console.log(`    🔑 CDK管理: http://localhost:${PORT}/api/cdk`);
      console.log('\n  客服系统：');
      console.log(`    ❓ 问题管理: http://localhost:${PORT}/api/question`);
      console.log(`    🎫 工单管理: http://localhost:${PORT}/api/work`);
      console.log('\n  用户和财务：');
      console.log(`    👑 VIP管理: http://localhost:${PORT}/api/vip`);
      console.log(`    💰 提现管理: http://localhost:${PORT}/api/withdraw`);
      console.log(`    ₿ 币安管理: http://localhost:${PORT}/api/binance`);
      console.log('\n  系统管理：');
      console.log(`    👤 管理员: http://localhost:${PORT}/api/admin`);
      console.log(`    🔐 认证: http://localhost:${PORT}/api/product (auth routes)`);
      console.log(`    📧 邮件服务: http://localhost:${PORT}/api/email`);
      console.log(`    ⏰ 任务管理: http://localhost:${PORT}/api/tasks/status`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭处理
const gracefulShutdown = async () => {
  console.log('\n🛑 收到关闭信号，开始优雅关闭...');
  
  try {
    // 停止任务调度器
    if (taskScheduler) {
      await taskScheduler.shutdown();
    }
    
    // 关闭数据库连接
    if (sequelize) {
      await sequelize.close();
      console.log('✅ 数据库连接已关闭');
    }
    
    console.log('✅ 服务器已优雅关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 优雅关闭失败:', error);
    process.exit(1);
  }
};

// 监听关闭信号
process.on('SIGINT', gracefulShutdown);   // Ctrl+C
process.on('SIGTERM', gracefulShutdown);  // kill命令
process.on('SIGUSR1', gracefulShutdown);  // nodemon重启
process.on('SIGUSR2', gracefulShutdown);  // nodemon重启

startServer();