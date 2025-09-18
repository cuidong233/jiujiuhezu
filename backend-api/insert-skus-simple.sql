-- 为所有商品添加简化的SKU数据

-- 商品1: Netflix SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(1, 'NF-1M', 'Netflix 月度会员', 35.00, 100, 30, '高清画质，支持多设备', 1),
(1, 'NF-3M', 'Netflix 季度会员', 99.00, 100, 90, '高清画质，3个月优惠套餐', 1),
(1, 'NF-12M', 'Netflix 年度会员', 320.00, 100, 365, '高清画质，年付最划算', 1);

-- 商品2: Disney+ SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(2, 'DP-1M', 'Disney+ 月度会员', 39.99, 100, 30, '高清画质，支持4台设备', 1),
(2, 'DP-3M', 'Disney+ 季度会员', 99.99, 100, 90, '高清画质，3个月优惠套餐', 1),
(2, 'DP-6M', 'Disney+ 半年会员', 189.99, 50, 180, '高清画质，半年特惠', 1);

-- 商品3: YouTube Premium SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(3, 'YT-1M', 'YouTube Premium 月度', 11.99, 100, 30, '无广告，后台播放', 1),
(3, 'YT-3M', 'YouTube Premium 季度', 32.99, 100, 90, '无广告，季度优惠', 1),
(3, 'YT-12M', 'YouTube Premium 年度', 119.99, 100, 365, '无广告，年付优惠', 1);

-- 商品4: HBO Max SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(4, 'HBO-1M', 'HBO Max 月度', 14.99, 80, 30, '高清画质', 1),
(4, 'HBO-6M', 'HBO Max 半年', 79.99, 80, 180, '半年优惠套餐', 1),
(4, 'HBO-12M', 'HBO Max 年度', 149.99, 50, 365, '年付最优惠', 1);

-- 商品5: Apple TV+ SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(5, 'APPLE-1M', 'Apple TV+ 月度', 6.99, 200, 30, '原创内容，4K画质', 1),
(5, 'APPLE-12M', 'Apple TV+ 年度', 69.99, 200, 365, '年付优惠', 1);

-- 商品6: Amazon Prime Video SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(6, 'AMZ-1M', 'Prime Video 月度', 8.99, 150, 30, '海量影视内容', 1),
(6, 'AMZ-12M', 'Prime Video 年度', 89.99, 150, 365, '年付优惠', 1);

-- 商品7: Spotify Premium SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(7, 'SPOT-1M', 'Spotify 个人版月度', 9.99, 200, 30, '无广告，离线下载', 1),
(7, 'SPOT-12M', 'Spotify 个人版年度', 99.99, 200, 365, '年付优惠', 1),
(7, 'SPOT-FAM', 'Spotify 家庭版月度', 15.99, 100, 30, '最多6个账号', 1);

-- 商品8: Hulu SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(8, 'HULU-1M', 'Hulu 基础版月度', 7.99, 150, 30, '包含少量广告', 1),
(8, 'HULU-NOA', 'Hulu 无广告月度', 14.99, 100, 30, '完全无广告', 1);

-- 商品9: Paramount+ SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(9, 'PARA-1M', 'Paramount+ 基础版', 5.99, 100, 30, '含少量广告', 1),
(9, 'PARA-PR', 'Paramount+ 高级版', 11.99, 80, 30, '无广告，4K', 1);

-- 商品10: Peacock SKU
INSERT IGNORE INTO pr_product_skus (product_id, sku_id, sku_name, price, stock, expire_days, sku_description, status) VALUES
(10, 'PCOK-1M', 'Peacock Premium', 5.99, 120, 30, '含少量广告', 1),
(10, 'PCOK-PL', 'Peacock Premium Plus', 11.99, 80, 30, '无广告', 1);

-- 为每个商品添加规格定义
INSERT IGNORE INTO pr_product_specifications (product_id, specifications) VALUES 
(1, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('基础版', '标准版', '高级版')), JSON_OBJECT('name', '订阅时长', 'values', JSON_ARRAY('月度', '季度', '年度')))),
(2, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('月度', '季度', '半年')))),
(3, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('个人版', '家庭版')))),
(4, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('标准版', '高级版')))),
(5, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('月度', '年度')))),
(6, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('月度', '年度')))),
(7, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('个人版', '家庭版')))),
(8, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('基础版', '无广告版')))),
(9, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('基础版', '高级版')))),
(10, JSON_ARRAY(JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('Premium', 'Premium Plus'))));