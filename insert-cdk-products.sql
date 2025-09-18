-- 插入虚拟产品CDK商品数据
USE jjhz;

-- 插入商品数据
INSERT INTO pr_goods (category_code, title, keywords, description, cover_image, price, order_num, sales, goods_code, status, tags, coupon_state, add_state) VALUES
(1, 'Netflix 高级账号 12个月', 'Netflix,流媒体,4K,会员', 'Netflix高级会员账号，支持4K超高清，同时4设备观看，全球解锁', '/images/netflix.png', 162.00, 1, 2500, 'NETFLIX_12M', 1, '热卖,4K高清,全球解锁', 1, 1),
(1, 'Disney+ 会员 12个月', 'Disney+,迪士尼,流媒体,会员', 'Disney+会员账号，畅享迪士尼、漫威、星战等精彩内容', '/images/netflix.png', 138.00, 2, 1800, 'DISNEY_12M', 1, '4K高清,原创内容,家庭共享', 1, 1),
(1, 'Apple TV+ 会员 6个月', 'Apple TV+,苹果,流媒体,会员', 'Apple TV+会员，独家原创剧集，支持4K HDR', '/images/appletv-logo.png', 88.00, 3, 900, 'APPLETV_6M', 1, '原创剧集,4K HDR,杜比全景声', 1, 1),
(3, 'ChatGPT Plus 账号', 'ChatGPT,AI,GPT-4,人工智能', 'ChatGPT Plus账号，无限制使用GPT-4，优先响应', '/images/netflix.png', 199.00, 4, 3200, 'CHATGPT_1M', 1, '热卖,GPT-4,优先响应', 1, 1),
(3, 'Midjourney 订阅', 'Midjourney,AI绘画,设计,创作', 'Midjourney AI绘画工具订阅，无限生成，商用授权', '/images/netflix.png', 168.00, 5, 1500, 'MIDJOURNEY_1M', 1, '无限生成,商用授权,高速模式', 1, 1),
(3, 'Grammarly Premium', 'Grammarly,写作,语法检查,英语', 'Grammarly高级版，专业写作助手，语法检查和风格建议', '/images/netflix.png', 98.00, 6, 650, 'GRAMMARLY_12M', 1, '语法检查,风格建议,抄袭检测', 1, 1),
(1, 'Spotify Premium 家庭版', 'Spotify,音乐,流媒体,家庭版', 'Spotify音乐高级家庭版，支持6账号，无广告高音质', '/images/netflix.png', 128.00, 7, 1200, 'SPOTIFY_12M', 1, '无广告,离线下载,家庭共享', 1, 1),
(1, 'YouTube Premium', 'YouTube,视频,会员,无广告', 'YouTube高级会员，无广告观看，支持后台播放和离线下载', '/images/netflix.png', 108.00, 8, 800, 'YOUTUBE_12M', 1, '无广告,后台播放,YouTube Music', 1, 1),
(2, 'Steam 充值卡 $50', 'Steam,游戏,充值卡,礼品卡', 'Steam平台充值卡，可用于购买游戏和DLC', '/images/netflix.png', 358.00, 9, 450, 'STEAM_50', 1, '即买即用,全球通用', 1, 1),
(2, 'PlayStation Plus 12个月', 'PS,PlayStation,会员,游戏', 'PlayStation Plus会员，在线联机，每月免费游戏', '/images/netflix.png', 398.00, 10, 320, 'PSPLUS_12M', 1, '在线联机,免费游戏,独占折扣', 1, 1);

-- 为每个商品插入CDK库存
INSERT INTO pr_goods_cdkey (goods_code, cdkey, status) VALUES
-- Netflix CDK
('NETFLIX_12M', 'NFLX-2025-A1B2C3D4E5F6', 0),
('NETFLIX_12M', 'NFLX-2025-G7H8I9J0K1L2', 0),
('NETFLIX_12M', 'NFLX-2025-M3N4O5P6Q7R8', 0),
('NETFLIX_12M', 'NFLX-2025-S9T0U1V2W3X4', 0),
('NETFLIX_12M', 'NFLX-2025-Y5Z6A7B8C9D0', 0),
-- Disney+ CDK
('DISNEY_12M', 'DSNY-2025-E1F2G3H4I5J6', 0),
('DISNEY_12M', 'DSNY-2025-K7L8M9N0O1P2', 0),
('DISNEY_12M', 'DSNY-2025-Q3R4S5T6U7V8', 0),
('DISNEY_12M', 'DSNY-2025-W9X0Y1Z2A3B4', 0),
-- Apple TV+ CDK
('APPLETV_6M', 'APTV-2025-C5D6E7F8G9H0', 0),
('APPLETV_6M', 'APTV-2025-I1J2K3L4M5N6', 0),
('APPLETV_6M', 'APTV-2025-O7P8Q9R0S1T2', 0),
-- ChatGPT CDK
('CHATGPT_1M', 'CGPT-2025-U3V4W5X6Y7Z8', 0),
('CHATGPT_1M', 'CGPT-2025-A9B0C1D2E3F4', 0),
('CHATGPT_1M', 'CGPT-2025-G5H6I7J8K9L0', 0),
('CHATGPT_1M', 'CGPT-2025-M1N2O3P4Q5R6', 0),
-- Midjourney CDK
('MIDJOURNEY_1M', 'MIDJ-2025-S7T8U9V0W1X2', 0),
('MIDJOURNEY_1M', 'MIDJ-2025-Y3Z4A5B6C7D8', 0),
('MIDJOURNEY_1M', 'MIDJ-2025-E9F0G1H2I3J4', 0),
-- Grammarly CDK
('GRAMMARLY_12M', 'GRAM-2025-K5L6M7N8O9P0', 0),
('GRAMMARLY_12M', 'GRAM-2025-Q1R2S3T4U5V6', 0),
-- Spotify CDK
('SPOTIFY_12M', 'SPOT-2025-W7X8Y9Z0A1B2', 0),
('SPOTIFY_12M', 'SPOT-2025-C3D4E5F6G7H8', 0),
('SPOTIFY_12M', 'SPOT-2025-I9J0K1L2M3N4', 0),
-- YouTube CDK
('YOUTUBE_12M', 'YTPR-2025-O5P6Q7R8S9T0', 0),
('YOUTUBE_12M', 'YTPR-2025-U1V2W3X4Y5Z6', 0),
-- Steam CDK
('STEAM_50', 'STM-2025-A7B8C9D0E1F2', 0),
('STEAM_50', 'STM-2025-G3H4I5J6K7L8', 0),
-- PS Plus CDK
('PSPLUS_12M', 'PSP-2025-M9N0O1P2Q3R4', 0),
('PSPLUS_12M', 'PSP-2025-S5T6U7V8W9X0', 0);

-- 查看插入的商品
SELECT id, title, price, sales, status FROM pr_goods;