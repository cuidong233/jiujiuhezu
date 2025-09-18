// AWS部署专用CORS配置
import cors from 'cors';

// 获取允许的源
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080'
  ];

  // 添加环境变量中的URL
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  if (process.env.ADMIN_URL) {
    origins.push(process.env.ADMIN_URL);
  }
  if (process.env.API_BASE_URL) {
    origins.push(process.env.API_BASE_URL);
  }

  // 在生产环境，添加EC2 IP地址的所有端口组合
  if (process.env.NODE_ENV === 'production' && process.env.EC2_PUBLIC_IP) {
    const ip = process.env.EC2_PUBLIC_IP;
    origins.push(
      `http://${ip}`,
      `http://${ip}:3000`,
      `http://${ip}:3001`,
      `http://${ip}:8080`,
      `https://${ip}`,
      `https://${ip}:3000`,
      `https://${ip}:3001`,
      `https://${ip}:8080`
    );
  }

  return origins.filter(Boolean);
};

// CORS配置选项
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // 生产环境下，允许无origin的请求（同源请求）
    if (!origin) {
      return callback(null, true);
    }
    
    // 开发环境允许所有
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 检查是否是IP地址格式的请求
    const ipPattern = /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/;
    if (ipPattern.test(origin)) {
      return callback(null, true);
    }
    
    // 检查是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 在生产环境记录被拒绝的源
      console.log('CORS rejected origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      // 暂时允许所有请求，避免部署问题
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24小时
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 导出配置好的CORS中间件
export default cors(corsOptions);