-- 查看当前商品的分类分布
SELECT category_id, COUNT(*) as product_count 
FROM pr_goods 
GROUP BY category_id;

-- 查看所有商品及其分类
SELECT id, title, category_id 
FROM pr_goods 
ORDER BY category_id, id;

-- 查看可用的分类
SELECT * FROM pr_category;

-- 根据商品类型更新分类ID
-- 视频音乐类 (category_id = 3)
UPDATE pr_goods 
SET category_id = 3 
WHERE title LIKE '%Netflix%' 
   OR title LIKE '%Disney%' 
   OR title LIKE '%YouTube%' 
   OR title LIKE '%Spotify%' 
   OR title LIKE '%Apple TV%'
   OR title LIKE '%HBO%'
   OR title LIKE '%音乐%'
   OR title LIKE '%视频%'
   OR title LIKE '%影视%';

-- Vtuber类 (category_id = 4)
UPDATE pr_goods 
SET category_id = 4 
WHERE title LIKE '%Vtuber%' 
   OR title LIKE '%虚拟主播%'
   OR title LIKE '%B站%'
   OR title LIKE '%bilibili%';

-- 代充代付类 (category_id = 8)
UPDATE pr_goods 
SET category_id = 8 
WHERE title LIKE '%代充%' 
   OR title LIKE '%充值%'
   OR title LIKE '%代付%'
   OR title LIKE '%话费%'
   OR title LIKE '%流量%';

-- 游戏类 (category_id = 9)
UPDATE pr_goods 
SET category_id = 9 
WHERE title LIKE '%Steam%' 
   OR title LIKE '%游戏%'
   OR title LIKE '%Game%'
   OR title LIKE '%Xbox%'
   OR title LIKE '%PlayStation%'
   OR title LIKE '%Nintendo%'
   OR title LIKE '%Epic%';

-- 卡券类 (category_id = 10)
UPDATE pr_goods 
SET category_id = 10 
WHERE title LIKE '%优惠券%' 
   OR title LIKE '%代金券%'
   OR title LIKE '%礼品卡%'
   OR title LIKE '%Gift Card%'
   OR title LIKE '%券%'
   OR title LIKE '%卡%';

-- 福利社类 (category_id = 11)
UPDATE pr_goods 
SET category_id = 11 
WHERE title LIKE '%福利%' 
   OR title LIKE '%特价%'
   OR title LIKE '%限时%'
   OR title LIKE '%秒杀%';

-- AI和工具类可以归类到合适的分类
-- ChatGPT、Midjourney等AI工具归类到Vtuber或者视频音乐
UPDATE pr_goods 
SET category_id = 3 
WHERE title LIKE '%ChatGPT%' 
   OR title LIKE '%Midjourney%'
   OR title LIKE '%AI%'
   OR title LIKE '%Grammarly%';

-- 查看更新后的分类分布
SELECT category_id, COUNT(*) as product_count 
FROM pr_goods 
GROUP BY category_id;

-- 查看每个分类下的商品
SELECT 
    c.id as category_id,
    c.category_name,
    COUNT(g.id) as product_count,
    GROUP_CONCAT(g.title SEPARATOR ', ') as products
FROM pr_category c
LEFT JOIN pr_goods g ON c.id = g.category_id
GROUP BY c.id, c.category_name
ORDER BY c.id;