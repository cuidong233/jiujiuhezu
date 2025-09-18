-- 更新商品分类表，设置您需要的6个分类
-- 先清空现有分类（如果有的话）
DELETE FROM pr_category WHERE 1=1;

-- 插入新的6个分类
INSERT INTO pr_category (id, name, category_name, sort_order) VALUES
(1, '视频音乐', '视频音乐', 1),
(2, 'Vtuber', 'Vtuber', 2),
(3, '代充代付', '代充代付', 3),
(4, '游戏', '游戏', 4),
(5, '卡券', '卡券', 5),
(6, '福利社', '福利社', 6);

-- 如果表结构缺少必要字段，可以添加
ALTER TABLE pr_category 
  MODIFY COLUMN name VARCHAR(100) NOT NULL COMMENT '分类名称',
  MODIFY COLUMN category_name VARCHAR(100) NOT NULL COMMENT '分类显示名称';

-- 确保pr_goods表只需要category_id，移除product_type_id（如果存在）
ALTER TABLE pr_goods DROP COLUMN IF EXISTS product_type_id;

-- 删除不需要的product_types表（如果存在）
DROP TABLE IF EXISTS pr_product_types;