import pool from './src/db/database.js';

async function unifyDatabase() {
  try {
    console.log('开始统一数据库字段...\n');
    
    // 1. 先检查当前表结构
    const [columns] = await pool.execute('SHOW COLUMNS FROM pr_goods');
    const columnNames = columns.map(c => c.Field);
    console.log('当前字段:', columnNames.filter(f => ['name', 'title', 'image_url', 'cover_image'].includes(f)).join(', '));
    
    // 2. 删除旧的name和image_url字段（如果存在）
    if (columnNames.includes('name')) {
      // 先确保title字段有数据
      await pool.execute('UPDATE pr_goods SET title = name WHERE title IS NULL OR title = ""');
      // 删除name字段
      await pool.execute('ALTER TABLE pr_goods DROP COLUMN name');
      console.log('✅ 已删除name字段');
    }
    
    if (columnNames.includes('image_url')) {
      // 先确保cover_image字段有数据
      await pool.execute('UPDATE pr_goods SET cover_image = image_url WHERE cover_image IS NULL OR cover_image = ""');
      // 删除image_url字段
      await pool.execute('ALTER TABLE pr_goods DROP COLUMN image_url');
      console.log('✅ 已删除image_url字段');
    }
    
    if (columnNames.includes('keyword')) {
      // 确保keywords字段有数据
      await pool.execute('UPDATE pr_goods SET keywords = keyword WHERE keywords IS NULL OR keywords = ""');
      // 删除keyword字段
      await pool.execute('ALTER TABLE pr_goods DROP COLUMN keyword');
      console.log('✅ 已删除keyword字段');
    }
    
    if (columnNames.includes('sold_count')) {
      // 确保sales字段有数据
      await pool.execute('UPDATE pr_goods SET sales = sold_count WHERE sales IS NULL');
      // 删除sold_count字段
      await pool.execute('ALTER TABLE pr_goods DROP COLUMN sold_count');
      console.log('✅ 已删除sold_count字段');
    }
    
    console.log('\n✅ 数据库字段统一完成！');
    
    // 3. 显示最终的表结构
    const [finalColumns] = await pool.execute('SHOW COLUMNS FROM pr_goods');
    const importantFields = finalColumns.filter(c => 
      ['id', 'title', 'cover_image', 'goods_code', 'price', 'sales', 'keywords', 'tags', 'category_id'].includes(c.Field)
    );
    console.log('\n最终的重要字段:');
    importantFields.forEach(f => {
      console.log(`  ${f.Field}: ${f.Type}`);
    });
    
    // 4. 验证数据
    const [products] = await pool.execute('SELECT id, title, cover_image, goods_code, price FROM pr_goods LIMIT 3');
    console.log('\n验证数据:');
    products.forEach(p => {
      console.log(`ID ${p.id}: title="${p.title}", cover_image="${p.cover_image}"`);
    });
    
  } catch (error) {
    console.error('❌ 统一数据库失败:', error.message);
  } finally {
    await pool.end();
  }
}

unifyDatabase();