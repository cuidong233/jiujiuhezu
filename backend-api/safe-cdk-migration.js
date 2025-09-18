/**
 * 安全的CDK迁移脚本 - 检查列是否存在后再执行
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jiujiu_admin',
  charset: 'utf8mb4'
};

async function checkColumnExists(connection, table, column) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [dbConfig.database, table, column]
  );
  return rows[0].count > 0;
}

async function checkTableExists(connection, table) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [dbConfig.database, table]
  );
  return rows[0].count > 0;
}

async function runSafeMigration() {
  let connection;
  
  try {
    console.log('🚀 安全CDK分类系统数据库迁移工具\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 1. 添加CDK分类相关字段
    console.log('📝 检查并添加CDK分类字段...');
    
    const cdkColumns = [
      { name: 'cdk_category', sql: "ADD COLUMN cdk_category VARCHAR(20) DEFAULT 'one_time' COMMENT 'CDK分类: manual_recharge(代充), reusable_stock(可重复使用有库存), one_time(一次性)'" },
      { name: 'receipt_fields', sql: "ADD COLUMN receipt_fields JSON COMMENT '回执项配置(代充CDK)'" },
      { name: 'receipt_data', sql: "ADD COLUMN receipt_data JSON COMMENT '回执数据(代充CDK)'" },
      { name: 'release_days', sql: "ADD COLUMN release_days INT DEFAULT 30 COMMENT '释放天数(可重复使用CDK)'" },
      { name: 'product_spec_id', sql: "ADD COLUMN product_spec_id BIGINT COMMENT '商品规格ID'" },
      { name: 'is_unlimited_stock', sql: "ADD COLUMN is_unlimited_stock BOOLEAN DEFAULT FALSE COMMENT '是否无限库存(代充CDK)'" }
    ];

    for (const col of cdkColumns) {
      const exists = await checkColumnExists(connection, 'pr_goods_cdkey', col.name);
      if (!exists) {
        console.log(`   ➕ 添加字段 ${col.name}...`);
        await connection.query(`ALTER TABLE pr_goods_cdkey ${col.sql}`);
      } else {
        console.log(`   ✅ 字段 ${col.name} 已存在`);
      }
    }

    // 2. 添加索引
    console.log('\n📝 检查并添加索引...');
    try {
      await connection.query('ALTER TABLE pr_goods_cdkey ADD INDEX idx_cdk_category (cdk_category)');
      console.log('   ➕ 添加索引 idx_cdk_category');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e;
      console.log('   ✅ 索引 idx_cdk_category 已存在');
    }

    try {
      await connection.query('ALTER TABLE pr_goods_cdkey ADD INDEX idx_product_spec_id (product_spec_id)');
      console.log('   ➕ 添加索引 idx_product_spec_id');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e;
      console.log('   ✅ 索引 idx_product_spec_id 已存在');
    }

    // 3. 创建商品规格表
    console.log('\n📝 检查并创建商品规格表...');
    const specTableExists = await checkTableExists(connection, 'pr_product_specifications');
    if (!specTableExists) {
      console.log('   ➕ 创建表 pr_product_specifications...');
      await connection.query(`
        CREATE TABLE pr_product_specifications (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          product_id BIGINT NOT NULL COMMENT '商品ID',
          spec_name VARCHAR(100) NOT NULL COMMENT '规格名称',
          spec_value VARCHAR(255) NOT NULL COMMENT '规格值',
          price DECIMAL(10,2) NOT NULL COMMENT '规格价格',
          original_price DECIMAL(10,2) COMMENT '原价',
          stock INT DEFAULT 0 COMMENT '库存',
          max_purchase INT DEFAULT 999999 COMMENT '最大购买数量',
          min_purchase INT DEFAULT 1 COMMENT '最小购买数量',
          is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认规格',
          status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
          attributes JSON COMMENT '规格属性',
          sort_order INT DEFAULT 0 COMMENT '排序',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_product_id (product_id),
          INDEX idx_status (status),
          FOREIGN KEY (product_id) REFERENCES pr_goods(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表'
      `);
    } else {
      console.log('   ✅ 表 pr_product_specifications 已存在');
    }

    // 4. 添加外键约束
    console.log('\n📝 检查并添加外键约束...');
    try {
      await connection.query(`
        ALTER TABLE pr_goods_cdkey 
        ADD CONSTRAINT fk_cdk_product_spec 
        FOREIGN KEY (product_spec_id) REFERENCES pr_product_specifications(id) ON DELETE SET NULL
      `);
      console.log('   ➕ 添加外键约束 fk_cdk_product_spec');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME' && e.code !== 'ER_FK_DUP_NAME') throw e;
      console.log('   ✅ 外键约束 fk_cdk_product_spec 已存在');
    }

    // 5. 更新现有CDK的分类
    console.log('\n📝 更新现有CDK的分类...');
    await connection.query(`
      UPDATE pr_goods_cdkey 
      SET cdk_category = CASE 
        WHEN is_reusable = 1 THEN 'reusable_stock'
        ELSE 'one_time'
      END
      WHERE cdk_category IS NULL OR cdk_category = ''
    `);

    // 6. 为商品表添加回执相关字段
    console.log('\n📝 检查并添加商品回执字段...');
    
    const productColumns = [
      { name: 'delivery_requires_receipt', sql: "ADD COLUMN delivery_requires_receipt BOOLEAN DEFAULT FALSE COMMENT '是否需要回执(代充商品)'" },
      { name: 'receipt_template', sql: "ADD COLUMN receipt_template JSON COMMENT '回执模板配置'" }
    ];

    for (const col of productColumns) {
      const exists = await checkColumnExists(connection, 'pr_goods', col.name);
      if (!exists) {
        console.log(`   ➕ 添加字段 ${col.name}...`);
        await connection.query(`ALTER TABLE pr_goods ${col.sql}`);
      } else {
        console.log(`   ✅ 字段 ${col.name} 已存在`);
      }
    }

    // 7. 创建CDK回执表
    console.log('\n📝 检查并创建CDK回执表...');
    const receiptTableExists = await checkTableExists(connection, 'pr_cdk_receipts');
    if (!receiptTableExists) {
      console.log('   ➕ 创建表 pr_cdk_receipts...');
      await connection.query(`
        CREATE TABLE pr_cdk_receipts (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          cdk_id BIGINT NOT NULL COMMENT 'CDK ID',
          order_id BIGINT NOT NULL COMMENT '订单ID',
          user_id BIGINT COMMENT '用户ID',
          receipt_fields JSON COMMENT '回执字段',
          receipt_data JSON COMMENT '回执数据',
          delivery_status TINYINT DEFAULT 0 COMMENT '发货状态: 0-待发货, 1-已发货, 2-发货失败',
          delivered_by BIGINT COMMENT '发货人ID',
          delivered_at DATETIME COMMENT '发货时间',
          notes TEXT COMMENT '备注',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_cdk_id (cdk_id),
          INDEX idx_order_id (order_id),
          INDEX idx_delivery_status (delivery_status),
          FOREIGN KEY (cdk_id) REFERENCES pr_goods_cdkey(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CDK回执记录表'
      `);
    } else {
      console.log('   ✅ 表 pr_cdk_receipts 已存在');
    }

    // 8. 为CDK使用记录表添加索引
    console.log('\n📝 检查并添加CDK使用记录索引...');
    const usageTableExists = await checkTableExists(connection, 'pr_cdk_usage_records');
    if (usageTableExists) {
      try {
        await connection.query('ALTER TABLE pr_cdk_usage_records ADD INDEX idx_usage_expire (usage_status, expire_at)');
        console.log('   ➕ 添加索引 idx_usage_expire');
      } catch (e) {
        if (e.code !== 'ER_DUP_KEYNAME') throw e;
        console.log('   ✅ 索引 idx_usage_expire 已存在');
      }
    } else {
      console.log('   ⚠️  表 pr_cdk_usage_records 不存在，跳过添加索引');
    }

    console.log('\n✅ 数据库迁移完成！');
    console.log('\n📊 CDK分类系统已就绪：');
    console.log('- 手动代充CDK (manual_recharge): 无限库存，手动发货，需要回执');
    console.log('- 可重复库存CDK (reusable_stock): 自动发货，设定天数后释放');
    console.log('- 一次性CDK (one_time): 自动发货，单次使用');
    
  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 数据库连接已关闭');
    }
  }
}

// 运行迁移
runSafeMigration();