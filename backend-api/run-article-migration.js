import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'jjhz',
      multipleStatements: true
    });
    
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'migrations/create_articles_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 执行SQL迁移文件...');
    
    // 执行SQL
    await connection.query(sql);
    
    console.log('✅ 文章表创建成功');
    console.log('✅ 示例数据插入成功');
    
    // 验证表创建
    const [tables] = await connection.query("SHOW TABLES LIKE 'articles'");
    if (tables.length > 0) {
      console.log('✅ 验证成功：articles表已创建');
      
      // 查询插入的数据
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM articles');
      console.log(`📊 当前文章数量：${rows[0].count}条`);
      
      // 显示文章列表
      const [articles] = await connection.query('SELECT id, title, category, status FROM articles');
      console.log('\n📝 文章列表：');
      articles.forEach(article => {
        console.log(`  - [${article.id}] ${article.title} (${article.category}) - ${article.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 数据库连接已关闭');
    }
  }
}

// 运行迁移
console.log('🚀 开始运行文章表迁移...\n');
runMigration();