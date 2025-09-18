-- 为所有商品添加SKU数据
-- 注意：此脚本需要在已有商品数据的基础上执行

-- 商品3: YouTube Premium
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(3, JSON_ARRAY(
  JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('个人版', '家庭版')),
  JSON_OBJECT('name', '订阅时长', 'values', JSON_ARRAY('月度', '季度', '年度'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(3, 'YT-PERSONAL-1M', 'YouTube个人版-月度', JSON_OBJECT('套餐类型', '个人版', '订阅时长', '月度'), 11.99, 100, 30, '无广告，后台播放，YouTube Music', 1, 1),
(3, 'YT-PERSONAL-3M', 'YouTube个人版-季度', JSON_OBJECT('套餐类型', '个人版', '订阅时长', '季度'), 32.99, 100, 90, '无广告，后台播放，季度优惠', 1, 1),
(3, 'YT-PERSONAL-12M', 'YouTube个人版-年度', JSON_OBJECT('套餐类型', '个人版', '订阅时长', '年度'), 119.99, 100, 365, '无广告，后台播放，年付最划算', 1, 1),
(3, 'YT-FAMILY-1M', 'YouTube家庭版-月度', JSON_OBJECT('套餐类型', '家庭版', '订阅时长', '月度'), 22.99, 50, 30, '最多6位家庭成员共享', 6, 1),
(3, 'YT-FAMILY-12M', 'YouTube家庭版-年度', JSON_OBJECT('套餐类型', '家庭版', '订阅时长', '年度'), 239.99, 50, 365, '家庭共享，年付优惠', 6, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品4: HBO Max
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(4, JSON_ARRAY(
  JSON_OBJECT('name', '画质', 'values', JSON_ARRAY('标准', '4K')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('1个月', '6个月', '12个月'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(4, 'HBO-STD-1M', 'HBO标准版-月度', JSON_OBJECT('画质', '标准', '时长', '1个月'), 14.99, 80, 30, '1080P高清，2设备同时', 2, 1),
(4, 'HBO-STD-6M', 'HBO标准版-半年', JSON_OBJECT('画质', '标准', '时长', '6个月'), 79.99, 80, 180, '1080P高清，半年优惠', 2, 1),
(4, 'HBO-4K-1M', 'HBO 4K版-月度', JSON_OBJECT('画质', '4K', '时长', '1个月'), 19.99, 50, 30, '4K超高清，3设备同时', 3, 1),
(4, 'HBO-4K-12M', 'HBO 4K版-年度', JSON_OBJECT('画质', '4K', '时长', '12个月'), 199.99, 50, 365, '4K超高清，年付最优惠', 3, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品5: Apple TV+
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(5, JSON_ARRAY(
  JSON_OBJECT('name', '套餐', 'values', JSON_ARRAY('标准版')),
  JSON_OBJECT('name', '期限', 'values', JSON_ARRAY('月付', '年付'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(5, 'APPLE-STD-1M', 'Apple TV+ 月度', JSON_OBJECT('套餐', '标准版', '期限', '月付'), 6.99, 200, 30, '原创内容，4K画质', 6, 1),
(5, 'APPLE-STD-12M', 'Apple TV+ 年度', JSON_OBJECT('套餐', '标准版', '期限', '年付'), 69.99, 200, 365, '原创内容，年付优惠', 6, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品6: Amazon Prime Video
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(6, JSON_ARRAY(
  JSON_OBJECT('name', '会员类型', 'values', JSON_ARRAY('Prime Video', 'Prime完整版')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('月度', '年度'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(6, 'AMZ-VIDEO-1M', 'Prime Video月度', JSON_OBJECT('会员类型', 'Prime Video', '时长', '月度'), 8.99, 150, 30, '仅视频服务', 3, 1),
(6, 'AMZ-VIDEO-12M', 'Prime Video年度', JSON_OBJECT('会员类型', 'Prime Video', '时长', '年度'), 89.99, 150, 365, '仅视频服务，年付优惠', 3, 1),
(6, 'AMZ-PRIME-1M', 'Prime完整版月度', JSON_OBJECT('会员类型', 'Prime完整版', '时长', '月度'), 14.99, 100, 30, '包含购物、音乐、视频', 1, 1),
(6, 'AMZ-PRIME-12M', 'Prime完整版年度', JSON_OBJECT('会员类型', 'Prime完整版', '时长', '年度'), 139.99, 100, 365, '全功能会员，年付最优', 1, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品7: Spotify Premium
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(7, JSON_ARRAY(
  JSON_OBJECT('name', '套餐类型', 'values', JSON_ARRAY('个人', '双人', '家庭', '学生')),
  JSON_OBJECT('name', '付费周期', 'values', JSON_ARRAY('月付', '年付'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(7, 'SPOT-IND-1M', 'Spotify个人版-月付', JSON_OBJECT('套餐类型', '个人', '付费周期', '月付'), 9.99, 200, 30, '无广告，离线下载', 1, 1),
(7, 'SPOT-IND-12M', 'Spotify个人版-年付', JSON_OBJECT('套餐类型', '个人', '付费周期', '年付'), 99.99, 200, 365, '个人版年付优惠', 1, 1),
(7, 'SPOT-DUO-1M', 'Spotify双人版-月付', JSON_OBJECT('套餐类型', '双人', '付费周期', '月付'), 12.99, 100, 30, '2个账号共享', 2, 1),
(7, 'SPOT-FAM-1M', 'Spotify家庭版-月付', JSON_OBJECT('套餐类型', '家庭', '付费周期', '月付'), 15.99, 100, 30, '最多6个账号', 6, 1),
(7, 'SPOT-STU-1M', 'Spotify学生版-月付', JSON_OBJECT('套餐类型', '学生', '付费周期', '月付'), 4.99, 50, 30, '学生优惠价', 1, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品8: Hulu
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(8, JSON_ARRAY(
  JSON_OBJECT('name', '套餐', 'values', JSON_ARRAY('含广告', '无广告', 'Hulu+直播')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('月付', '年付'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(8, 'HULU-ADS-1M', 'Hulu含广告版-月付', JSON_OBJECT('套餐', '含广告', '时长', '月付'), 7.99, 150, 30, '包含少量广告', 2, 1),
(8, 'HULU-ADS-12M', 'Hulu含广告版-年付', JSON_OBJECT('套餐', '含广告', '时长', '年付'), 79.99, 150, 365, '含广告，年付优惠', 2, 1),
(8, 'HULU-NOAD-1M', 'Hulu无广告版-月付', JSON_OBJECT('套餐', '无广告', '时长', '月付'), 14.99, 100, 30, '完全无广告体验', 2, 1),
(8, 'HULU-LIVE-1M', 'Hulu+直播电视-月付', JSON_OBJECT('套餐', 'Hulu+直播', '时长', '月付'), 76.99, 50, 30, '包含85+直播频道', 2, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品9: Paramount+
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(9, JSON_ARRAY(
  JSON_OBJECT('name', '套餐', 'values', JSON_ARRAY('基础版', '高级版')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('月付', '年付'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(9, 'PARA-ESS-1M', 'Paramount+基础版-月付', JSON_OBJECT('套餐', '基础版', '时长', '月付'), 5.99, 100, 30, '含少量广告', 1, 1),
(9, 'PARA-ESS-12M', 'Paramount+基础版-年付', JSON_OBJECT('套餐', '基础版', '时长', '年付'), 59.99, 100, 365, '基础版年付优惠', 1, 1),
(9, 'PARA-PREM-1M', 'Paramount+高级版-月付', JSON_OBJECT('套餐', '高级版', '时长', '月付'), 11.99, 80, 30, '无广告，4K，下载', 3, 1),
(9, 'PARA-PREM-12M', 'Paramount+高级版-年付', JSON_OBJECT('套餐', '高级版', '时长', '年付'), 119.99, 80, 365, '高级版年付最优', 3, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 商品10: Peacock
INSERT INTO pr_product_specifications (product_id, specifications) VALUES 
(10, JSON_ARRAY(
  JSON_OBJECT('name', '套餐', 'values', JSON_ARRAY('Premium', 'Premium Plus')),
  JSON_OBJECT('name', '时长', 'values', JSON_ARRAY('月付', '年付'))
)) ON DUPLICATE KEY UPDATE specifications = VALUES(specifications);

INSERT INTO pr_product_skus (product_id, sku_id, sku_name, attributes, price, stock, expire_days, sku_description, license_count, status) VALUES
(10, 'PCOK-PREM-1M', 'Peacock Premium-月付', JSON_OBJECT('套餐', 'Premium', '时长', '月付'), 5.99, 120, 30, '含少量广告', 3, 1),
(10, 'PCOK-PREM-12M', 'Peacock Premium-年付', JSON_OBJECT('套餐', 'Premium', '时长', '年付'), 59.99, 120, 365, 'Premium年付优惠', 3, 1),
(10, 'PCOK-PLUS-1M', 'Peacock Premium Plus-月付', JSON_OBJECT('套餐', 'Premium Plus', '时长', '月付'), 11.99, 80, 30, '无广告，支持下载', 3, 1),
(10, 'PCOK-PLUS-12M', 'Peacock Premium Plus-年付', JSON_OBJECT('套餐', 'Premium Plus', '时长', '年付'), 119.99, 80, 365, '无广告年付优惠', 3, 1)
ON DUPLICATE KEY UPDATE 
  sku_name = VALUES(sku_name),
  price = VALUES(price),
  stock = VALUES(stock);

-- 更新商品价格为最低SKU价格
UPDATE pr_goods g
SET g.price = (
  SELECT MIN(s.price) 
  FROM pr_product_skus s 
  WHERE s.product_id = g.id AND s.status = 1
)
WHERE g.id IN (3,4,5,6,7,8,9,10)
AND EXISTS (
  SELECT 1 FROM pr_product_skus s 
  WHERE s.product_id = g.id AND s.status = 1
);

-- 查询验证
SELECT 
  g.id,
  g.title,
  COUNT(s.sku_id) as sku_count,
  MIN(s.price) as min_price,
  MAX(s.price) as max_price
FROM pr_goods g
LEFT JOIN pr_product_skus s ON g.id = s.product_id AND s.status = 1
WHERE g.id <= 10
GROUP BY g.id, g.title
ORDER BY g.id;