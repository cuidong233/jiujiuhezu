import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jiujiu_admin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL 配置 - 支持 PlanetScale 和 Aiven
  ssl: process.env.DB_HOST && (
    process.env.DB_HOST.includes('psdb.cloud') || 
    process.env.DB_HOST.includes('aivencloud.com')
  ) ? { rejectUnauthorized: false } : undefined
});

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

export default pool;