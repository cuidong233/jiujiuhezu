-- Migration: Add CDK categories and product specifications support
-- Date: 2025-01-14

-- 1. Add new fields to CDK table for supporting three CDK types
ALTER TABLE pr_goods_cdkey 
ADD COLUMN cdk_category VARCHAR(20) DEFAULT 'one_time' COMMENT 'CDK分类: manual_recharge(代充), reusable_stock(可重复使用有库存), one_time(一次性)',
ADD COLUMN receipt_fields JSON COMMENT '回执项配置(代充CDK)',
ADD COLUMN receipt_data JSON COMMENT '回执数据(代充CDK)',
ADD COLUMN release_days INT DEFAULT 30 COMMENT '释放天数(可重复使用CDK)',
ADD COLUMN product_spec_id BIGINT COMMENT '商品规格ID',
ADD COLUMN is_unlimited_stock BOOLEAN DEFAULT FALSE COMMENT '是否无限库存(代充CDK)',
ADD INDEX idx_cdk_category (cdk_category),
ADD INDEX idx_product_spec_id (product_spec_id);

-- 2. Create product specifications table for product variants
CREATE TABLE IF NOT EXISTS pr_product_specifications (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品规格表';

-- 3. Add foreign key constraint for CDK to product specifications
ALTER TABLE pr_goods_cdkey 
ADD CONSTRAINT fk_cdk_product_spec 
FOREIGN KEY (product_spec_id) REFERENCES pr_product_specifications(id) ON DELETE SET NULL;

-- 4. Update existing CDKs to have default category based on current type
UPDATE pr_goods_cdkey 
SET cdk_category = CASE 
  WHEN is_reusable = 1 THEN 'reusable_stock'
  ELSE 'one_time'
END
WHERE cdk_category IS NULL;

-- 5. Add delivery_requires_receipt field to products table for manual recharge products
ALTER TABLE pr_goods
ADD COLUMN delivery_requires_receipt BOOLEAN DEFAULT FALSE COMMENT '是否需要回执(代充商品)',
ADD COLUMN receipt_template JSON COMMENT '回执模板配置';

-- 6. Create CDK receipt records table for tracking manual delivery receipts
CREATE TABLE IF NOT EXISTS pr_cdk_receipts (
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
  FOREIGN KEY (cdk_id) REFERENCES pr_goods_cdkey(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES pr_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CDK回执记录表';

-- 7. Add index for better query performance on CDK usage records
ALTER TABLE pr_cdk_usage_records
ADD INDEX idx_usage_expire (usage_status, expire_at);