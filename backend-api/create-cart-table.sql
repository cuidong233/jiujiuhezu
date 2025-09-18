-- 创建购物车表
CREATE TABLE IF NOT EXISTS pr_cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '商品ID',
  sku_name VARCHAR(255) DEFAULT NULL COMMENT 'SKU规格名称',
  sku_price DECIMAL(10, 2) DEFAULT NULL COMMENT 'SKU价格',
  quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  UNIQUE KEY unique_user_product_sku (user_id, product_id, sku_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';