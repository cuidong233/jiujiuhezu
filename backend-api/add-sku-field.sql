-- 为商品表添加SKU字段
-- SKU数据以JSON格式存储，例如：
-- [
--   {"name": "1个月", "price": 29.99, "stock": 100},
--   {"name": "3个月", "price": 79.99, "stock": 50},
--   {"name": "12个月", "price": 299.99, "stock": 30}
-- ]

ALTER TABLE pr_goods 
ADD COLUMN IF NOT EXISTS skus JSON DEFAULT NULL COMMENT '商品SKU规格，JSON格式';

-- 示例：更新某个商品的SKU
-- UPDATE pr_goods 
-- SET skus = '[
--   {"name": "1个月", "price": 29.99, "stock": 100},
--   {"name": "3个月", "price": 79.99, "stock": 50},
--   {"name": "12个月", "price": 299.99, "stock": 30}
-- ]'
-- WHERE id = 1;