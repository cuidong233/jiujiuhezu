import pool from './src/db/database.js';

async function createMissingTables() {
  try {
    console.log('开始创建缺失的表...\n');
    
    // 创建购物车表
    console.log('创建购物车表 user_cart...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_cart (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_id BIGINT NOT NULL COMMENT '用户ID',
        goods_id BIGINT NOT NULL COMMENT '商品ID',
        quantity INT DEFAULT 1 COMMENT '数量',
        spec VARCHAR(100) DEFAULT '' COMMENT '规格',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_user_id (user_id),
        KEY idx_goods_id (goods_id),
        UNIQUE KEY uk_user_goods_spec (user_id, goods_id, spec)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表'
    `);
    console.log('✅ user_cart 表创建成功');
    
    // 创建收藏表
    console.log('\n创建收藏表 user_favorites...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_id BIGINT NOT NULL COMMENT '用户ID',
        goods_id BIGINT NOT NULL COMMENT '商品ID',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_user_id (user_id),
        KEY idx_goods_id (goods_id),
        UNIQUE KEY uk_user_goods (user_id, goods_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表'
    `);
    console.log('✅ user_favorites 表创建成功');
    
    // 验证表是否创建成功
    console.log('\n验证表创建结果...');
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('user_cart', 'user_favorites')
    `);
    
    console.log('已创建的表:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    console.log('\n✅ 所有缺失的表已成功创建！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error);
  } finally {
    await pool.end();
  }
}

createMissingTables();