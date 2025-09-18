-- 创建文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
  `subtitle` VARCHAR(255) DEFAULT NULL COMMENT '副标题',
  `description` TEXT DEFAULT NULL COMMENT '文章描述/摘要',
  `content` LONGTEXT NOT NULL COMMENT '文章内容（HTML格式）',
  `category` VARCHAR(50) NOT NULL DEFAULT '教程指南' COMMENT '文章分类',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '文章封面图',
  `author_name` VARCHAR(50) NOT NULL DEFAULT '管理员' COMMENT '作者名称',
  `author_avatar` VARCHAR(500) DEFAULT NULL COMMENT '作者头像',
  `read_time` VARCHAR(20) DEFAULT '5分钟' COMMENT '阅读时间',
  `views` INT(11) DEFAULT 0 COMMENT '浏览次数',
  `likes` INT(11) DEFAULT 0 COMMENT '点赞数',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '文章状态',
  `publish_date` DATETIME DEFAULT NULL COMMENT '发布日期',
  `tags` TEXT DEFAULT NULL COMMENT '标签（逗号分隔）',
  `meta_title` VARCHAR(255) DEFAULT NULL COMMENT 'SEO标题',
  `meta_description` TEXT DEFAULT NULL COMMENT 'SEO描述',
  `meta_keywords` TEXT DEFAULT NULL COMMENT 'SEO关键词',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序顺序',
  `is_featured` BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
  `related_articles` TEXT DEFAULT NULL COMMENT '相关文章ID（逗号分隔）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_date` (`publish_date`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 插入示例文章数据
INSERT INTO `articles` (`title`, `subtitle`, `description`, `content`, `category`, `image`, `author_name`, `author_avatar`, `read_time`, `status`, `publish_date`, `tags`, `is_featured`) VALUES
('电视盒子看奈飞4K完整教程', '解锁高清流媒体体验', '教你如何选择合适的电视盒子，安装奈飞App解码4K画质，解决播放卡顿问题', '<h2>准备工作</h2><p>在开始之前，请确保您已准备好以下内容...</p>', '教程指南', '/images/help1.png', '张科技', '/images/zhangkeji.png', '8分钟', 'published', NOW(), '流媒体,4K,电视盒子,Netflix', 1),
('2023年Apple TV 4K全面评测', '值得购买吗？', '深度评测最新款Apple TV 4K，包括性能、功能、生态系统等方面', '<h2>外观设计</h2><p>Apple TV 4K采用全新的设计...</p>', '设备评测', '/images/related-1.jpg', '李评测', '/images/head1.png', '10分钟', 'published', NOW(), 'Apple TV,4K,评测,流媒体设备', 1),
('打造完美家庭影院', '从入门到专业的完整指南', '详细介绍如何搭建家庭影院系统，包括设备选择、布线、调试等', '<h2>设备选择</h2><p>打造家庭影院的第一步是选择合适的设备...</p>', '家居影院', '/images/related-2.jpg', '王影音', '/images/head2.png', '15分钟', 'published', NOW(), '家庭影院,音响,投影仪,环绕声', 0),
('五大流媒体平台对比', 'Netflix、Disney+、HBO哪家强？', '全面对比主流流媒体平台的内容、价格、功能等方面', '<h2>平台概览</h2><p>本文将对比五大主流流媒体平台...</p>', '流媒体', '/images/related-3.jpg', '赵媒体', '/images/head3.png', '12分钟', 'published', NOW(), 'Netflix,Disney+,HBO,流媒体,对比', 0);