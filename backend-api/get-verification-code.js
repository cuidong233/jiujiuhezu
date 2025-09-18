import pool from './src/db/database.js';

async function getLatestCode(email) {
  try {
    const [rows] = await pool.execute(
      `SELECT code, type, expires_at, used, created_at 
       FROM email_codes 
       WHERE email = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [email]
    );
    
    if (rows.length === 0) {
      console.log(`没有找到邮箱 ${email} 的验证码`);
      return;
    }
    
    console.log(`\n邮箱 ${email} 的验证码记录：`);
    console.log('='.repeat(60));
    
    rows.forEach((row, index) => {
      const isExpired = new Date(row.expires_at) < new Date();
      const status = row.used ? '已使用' : (isExpired ? '已过期' : '有效');
      
      console.log(`\n记录 ${index + 1}:`);
      console.log(`  验证码: ${row.code}`);
      console.log(`  类型: ${row.type}`);
      console.log(`  状态: ${status}`);
      console.log(`  创建时间: ${row.created_at}`);
      console.log(`  过期时间: ${row.expires_at}`);
      
      if (index === 0 && !row.used && !isExpired) {
        console.log(`\n✅ 最新可用验证码: ${row.code}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    process.exit(0);
  }
}

// 从命令行参数获取邮箱
const email = process.argv[2] || 'cuidong111@gmail.com';
getLatestCode(email);