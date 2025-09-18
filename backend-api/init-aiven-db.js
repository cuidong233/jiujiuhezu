import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function initAivenDB() {
  console.log('🚀 开始连接Aiven MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });

  try {
    console.log('✅ 成功连接到Aiven MySQL！');
    
    // 创建jiujiu_admin数据库
    await connection.query('CREATE DATABASE IF NOT EXISTS jiujiu_admin');
    console.log('✅ 数据库 jiujiu_admin 已创建');
    
    // 切换到jiujiu_admin数据库
    await connection.query('USE jiujiu_admin');
    
    // 读取并执行SQL备份文件
    const sqlBackup = fs.readFileSync('../jiujiu_admin_backup.sql', 'utf8');
    
    // 分割SQL语句并逐个执行
    const statements = sqlBackup.split(';').filter(stmt => stmt.trim());
    
    console.log(`📝 开始导入数据，共 ${statements.length} 条语句...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        try {
          await connection.query(stmt);
          if (i % 10 === 0) {
            console.log(`  处理进度: ${i}/${statements.length}`);
          }
        } catch (err) {
          console.warn(`  跳过语句 ${i}: ${err.message.substring(0, 50)}`);
        }
      }
    }
    
    console.log('✅ 数据导入完成！');
    
    // 验证数据
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 已创建 ${tables.length} 个表`);
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`👤 用户数: ${users[0].count}`);
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await connection.end();
    console.log('🔒 连接已关闭');
  }
}

initAivenDB();