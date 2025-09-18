// 环境配置管理
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 根据 NODE_ENV 加载对应的环境文件
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

// 加载环境变量
dotenv.config({ 
  path: path.resolve(__dirname, '../../../', envFile) 
});

// 如果还有 .env 文件，也加载它（作为默认值）
dotenv.config({ 
  path: path.resolve(__dirname, '../../../', '.env') 
});

// 环境配置对象
const config = {
  // 环境
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  
  // 服务器配置
  server: {
    port: parseInt(process.env.API_PORT || process.env.PORT || '3001'),
    host: process.env.HOST || '0.0.0.0',
  },
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    name: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'jiujiu_db',
    dialect: 'mysql',
    logging: process.env.NODE_ENV !== 'production',
  },
  
  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default_dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS配置
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:8080',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174'
        ],
    credentials: true,
  },
  
  // API URLs
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:5173',
  },
  
  // 邮件配置
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    secure: true,
  },
  
  // 支付配置
  payment: {
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      sandbox: process.env.ALIPAY_SANDBOX === 'true',
      notifyUrl: process.env.ALIPAY_NOTIFY_URL || '',
      returnUrl: process.env.ALIPAY_RETURN_URL || '',
    },
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_API_KEY || '',
      sandbox: process.env.WECHAT_SANDBOX === 'true',
      notifyUrl: process.env.WECHAT_NOTIFY_URL || '',
    },
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },
  
  // 其他配置
  debug: process.env.DEBUG === 'true',
  compression: process.env.COMPRESSION !== 'false',
  clusterWorkers: process.env.CLUSTER_WORKERS || 1,
};

// 验证必要的配置
function validateConfig() {
  const errors = [];
  
  if (config.isProduction) {
    // 生产环境必须的配置
    if (config.jwt.secret === 'default_dev_secret') {
      errors.push('JWT_SECRET 必须在生产环境中设置');
    }
    if (!config.database.password) {
      errors.push('数据库密码必须在生产环境中设置');
    }
    if (!config.cors.origin || config.cors.origin.length === 0) {
      errors.push('CORS_ORIGIN 必须在生产环境中设置');
    }
  }
  
  if (errors.length > 0) {
    console.error('配置验证失败:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (config.isProduction) {
      process.exit(1);
    }
  }
}

// 执行验证
validateConfig();

// 导出配置
export default config;

// 为了向后兼容，也导出单独的配置项
export const {
  env,
  isDevelopment,
  isProduction,
  server,
  database,
  redis,
  jwt,
  cors,
  api,
  email,
  payment,
  logging,
  debug,
  compression,
  clusterWorkers,
} = config;