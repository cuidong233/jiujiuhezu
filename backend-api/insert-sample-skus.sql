-- 插入示例SKU数据
-- 首先为商品ID=1的产品创建规格定义
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(1, JSON_ARRAY(
  JSON_OBJECT('name', '套餐', 'values', JSON_ARRAY('基础版', '高级版', '专业版')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('1个月', '3个月', '12个月'))
));

-- 为商品ID=1插入SKU数据
INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(1, 'SKU001', '基础版 - 1个月', JSON_OBJECT('套餐', '基础版', '时长', '1个月'), 29.99, 100, 30, '基础功能，适合个人用户', 1, 1),
(1, 'SKU002', '基础版 - 3个月', JSON_OBJECT('套餐', '基础版', '时长', '3个月'), 79.99, 100, 90, '基础功能，3个月优惠套餐', 1, 1),
(1, 'SKU003', '基础版 - 12个月', JSON_OBJECT('套餐', '基础版', '时长', '12个月'), 299.99, 100, 365, '基础功能，年度套餐最优惠', 1, 1),
(1, 'SKU004', '高级版 - 1个月', JSON_OBJECT('套餐', '高级版', '时长', '1个月'), 59.99, 50, 30, '高级功能，支持多设备', 3, 1),
(1, 'SKU005', '高级版 - 3个月', JSON_OBJECT('套餐', '高级版', '时长', '3个月'), 159.99, 50, 90, '高级功能，3个月优惠套餐', 3, 1),
(1, 'SKU006', '高级版 - 12个月', JSON_OBJECT('套餐', '高级版', '时长', '12个月'), 599.99, 50, 365, '高级功能，年度套餐最优惠', 3, 1),
(1, 'SKU007', '专业版 - 1个月', JSON_OBJECT('套餐', '专业版', '时长', '1个月'), 99.99, 20, 30, '专业功能，无限设备', 999, 1),
(1, 'SKU008', '专业版 - 3个月', JSON_OBJECT('套餐', '专业版', '时长', '3个月'), 269.99, 20, 90, '专业功能，3个月优惠套餐', 999, 1),
(1, 'SKU009', '专业版 - 12个月', JSON_OBJECT('套餐', '专业版', '时长', '12个月'), 999.99, 20, 365, '专业功能，年度套餐最优惠', 999, 1);

-- 为商品ID=2的产品创建规格定义
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(2, JSON_ARRAY(
  JSON_OBJECT('name', '类型', 'values', JSON_ARRAY('个人版', '家庭版', '企业版')),
  JSON_OBJECT('name', '期限', 'values', JSON_ARRAY('月付', '季付', '年付'))
));

-- 为商品ID=2插入SKU数据
INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(2, 'SKU010', '个人版 - 月付', JSON_OBJECT('类型', '个人版', '期限', '月付'), 19.99, 200, 30, '个人使用，按月付费', 1, 1),
(2, 'SKU011', '个人版 - 季付', JSON_OBJECT('类型', '个人版', '期限', '季付'), 54.99, 200, 90, '个人使用，季度优惠', 1, 1),
(2, 'SKU012', '个人版 - 年付', JSON_OBJECT('类型', '个人版', '期限', '年付'), 199.99, 200, 365, '个人使用，年付最划算', 1, 1),
(2, 'SKU013', '家庭版 - 月付', JSON_OBJECT('类型', '家庭版', '期限', '月付'), 39.99, 150, 30, '家庭共享，支持5个账号', 5, 1),
(2, 'SKU014', '家庭版 - 季付', JSON_OBJECT('类型', '家庭版', '期限', '季付'), 109.99, 150, 90, '家庭共享，季度优惠', 5, 1),
(2, 'SKU015', '家庭版 - 年付', JSON_OBJECT('类型', '家庭版', '期限', '年付'), 399.99, 150, 365, '家庭共享，年付最划算', 5, 1);