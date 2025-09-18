-- 创建折扣活动表
CREATE TABLE IF NOT EXISTS discount_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2) DEFAULT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status INTEGER DEFAULT 1,
    apply_to_all_products BOOLEAN DEFAULT 1,
    product_ids TEXT,
    category_ids TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_discount_status ON discount_activities(status);
CREATE INDEX IF NOT EXISTS idx_discount_time ON discount_activities(start_time, end_time);