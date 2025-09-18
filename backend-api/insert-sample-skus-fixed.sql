-- 插入示例SKU数据
-- 为Netflix产品创建规格定义
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(1, JSON_ARRAY(
  JSON_OBJECT('name', '套餐', 'values', JSON_ARRAY('基础版', '标准版', '高级版')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('1个月', '3个月', '12个月'))
));

-- 为Netflix插入SKU数据
INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(1, 'NF-BASIC-1M', '基础版 - 1个月', JSON_OBJECT('套餐', '基础版', '时长', '1个月'), 29.99, 100, 30, '基础画质，单设备观看', 1, 1),
(1, 'NF-BASIC-3M', '基础版 - 3个月', JSON_OBJECT('套餐', '基础版', '时长', '3个月'), 79.99, 100, 90, '基础画质，单设备观看，3个月优惠', 1, 1),
(1, 'NF-BASIC-12M', '基础版 - 12个月', JSON_OBJECT('套餐', '基础版', '时长', '12个月'), 299.99, 100, 365, '基础画质，单设备观看，年度最优惠', 1, 1),
(1, 'NF-STD-1M', '标准版 - 1个月', JSON_OBJECT('套餐', '标准版', '时长', '1个月'), 49.99, 50, 30, '1080P高清，2设备同时观看', 2, 1),
(1, 'NF-STD-3M', '标准版 - 3个月', JSON_OBJECT('套餐', '标准版', '时长', '3个月'), 139.99, 50, 90, '1080P高清，2设备同时观看，3个月优惠', 2, 1),
(1, 'NF-STD-12M', '标准版 - 12个月', JSON_OBJECT('套餐', '标准版', '时长', '12个月'), 499.99, 50, 365, '1080P高清，2设备同时观看，年度最优惠', 2, 1),
(1, 'NF-PREM-1M', '高级版 - 1个月', JSON_OBJECT('套餐', '高级版', '时长', '1个月'), 69.99, 20, 30, '4K超高清，4设备同时观看', 4, 1),
(1, 'NF-PREM-3M', '高级版 - 3个月', JSON_OBJECT('套餐', '高级版', '时长', '3个月'), 189.99, 20, 90, '4K超高清，4设备同时观看，3个月优惠', 4, 1),
(1, 'NF-PREM-12M', '高级版 - 12个月', JSON_OBJECT('套餐', '高级版', '时长', '12个月'), 699.99, 20, 365, '4K超高清，4设备同时观看，年度最优惠', 4, 1);

-- 为Disney+产品创建规格定义
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(2, JSON_ARRAY(
  JSON_OBJECT('name', '类型', 'values', JSON_ARRAY('个人版', '家庭版')),
  JSON_OBJECT('name', '期限', 'values', JSON_ARRAY('月付', '季付', '年付'))
));

-- 为Disney+插入SKU数据
INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(2, 'DP-PERSONAL-1M', '个人版 - 月付', JSON_OBJECT('类型', '个人版', '期限', '月付'), 19.99, 200, 30, '个人使用，单账号', 1, 1),
(2, 'DP-PERSONAL-3M', '个人版 - 季付', JSON_OBJECT('类型', '个人版', '期限', '季付'), 54.99, 200, 90, '个人使用，季度优惠', 1, 1),
(2, 'DP-PERSONAL-12M', '个人版 - 年付', JSON_OBJECT('类型', '个人版', '期限', '年付'), 199.99, 200, 365, '个人使用，年付最划算', 1, 1),
(2, 'DP-FAMILY-1M', '家庭版 - 月付', JSON_OBJECT('类型', '家庭版', '期限', '月付'), 39.99, 150, 30, '家庭共享，支持6个账号', 6, 1),
(2, 'DP-FAMILY-3M', '家庭版 - 季付', JSON_OBJECT('类型', '家庭版', '期限', '季付'), 109.99, 150, 90, '家庭共享，季度优惠', 6, 1),
(2, 'DP-FAMILY-12M', '家庭版 - 年付', JSON_OBJECT('类型', '家庭版', '期限', '年付'), 399.99, 150, 365, '家庭共享，年付最划算', 6, 1);