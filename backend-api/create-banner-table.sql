-- 创建轮播图表
CREATE TABLE IF NOT EXISTS pr_banner (
  id INT(11) NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  title VARCHAR(255) NOT NULL COMMENT '标题',
  img VARCHAR(500) NOT NULL COMMENT '图片地址',
  link VARCHAR(500) DEFAULT '' COMMENT '跳转链接',
  order_num INT(11) DEFAULT 0 COMMENT '排序号',
  is_visible TINYINT(1) DEFAULT 1 COMMENT '是否显示 0-隐藏 1-显示',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  INDEX idx_visible (is_visible),
  INDEX idx_order (order_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 插入一些示例数据
INSERT INTO pr_banner (title, img, link, order_num, is_visible) VALUES
('欢迎来到商城', '/uploads/banner/banner1.jpg', '', 1, 1),
('新品上市', '/uploads/banner/banner2.jpg', '/goods/new', 2, 1),
('限时优惠', '/uploads/banner/banner3.jpg', '/goods/sale', 3, 1);