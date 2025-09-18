-- 更新商品分类为频道会员类型
-- 先删除原有分类
DELETE FROM pr_category;

-- 插入新的频道会员分类
INSERT INTO pr_category (id, name, category_name, sort_order) VALUES
(3, '视频音乐', '视频音乐', 3),
(4, 'Vtuber', 'Vtuber', 4),
(8, '代充代付', '代充代付', 8),
(9, '游戏', '游戏', 9),
(10, '卡劵', '卡劵', 10),
(11, '福利社', '福利社', 11);