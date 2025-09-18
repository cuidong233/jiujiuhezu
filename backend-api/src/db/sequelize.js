import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'jiujiu_admin',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // SSL配置 - 支持Aiven
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')
        ? { rejectUnauthorized: false }
        : undefined
    }
  }
);

// Test the connection
export const testSequelizeConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize连接成功');
    return true;
  } catch (error) {
    console.error('❌ Sequelize连接失败:', error);
    return false;
  }
};

export default sequelize;