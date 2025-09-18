import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateCategories() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Zxcvbnm123',
      database: process.env.DB_NAME || 'jiujiu_rental',
      multipleStatements: true
    });
    
    console.log('✓ 数据库连接成功');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, 'migrations', 'update_product_categories.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('开始更新商品分类...');
    
    // 执行SQL
    await connection.query(sql);
    
    console.log('✓ 商品分类更新成功');
    console.log('✓ 已设置6个分类：视频音乐、Vtuber、代充代付、游戏、卡券、福利社');
    
    // 验证分类
    const [categories] = await connection.query('SELECT id, name, category_name FROM pr_category ORDER BY sort_order');
    
    console.log('\n当前分类列表：');
    categories.forEach(cat => {
      console.log(`  ${cat.id}. ${cat.name} (${cat.category_name})`);
    });
    
    console.log('\n分类更新完成！');
    
  } catch (error) {
    console.error('更新失败:', error);
    console.error('错误详情:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 运行更新
updateCategories();