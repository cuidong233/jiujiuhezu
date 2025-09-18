-- 为商品表添加SKU字段
ALTER TABLE pr_goods 
ADD COLUMN skus JSON COMMENT '商品SKU规格，JSON格式';