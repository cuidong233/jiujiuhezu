-- 添加回执单修改记录字段
-- 用于记录管理员修改回执单的历史

ALTER TABLE pr_cdk_receipts 
ADD COLUMN IF NOT EXISTS last_modified DATETIME NULL COMMENT '最后修改时间' AFTER delivered_at,
ADD COLUMN IF NOT EXISTS modified_by VARCHAR(50) NULL COMMENT '修改人' AFTER last_modified,
ADD COLUMN IF NOT EXISTS modification_history JSON NULL COMMENT '修改历史' AFTER modified_by;

-- 添加索引以提高查询性能
ALTER TABLE pr_cdk_receipts ADD INDEX idx_last_modified (last_modified);

-- 添加回执字段配置到商品表（用于代充商品）
ALTER TABLE pr_goods 
ADD COLUMN IF NOT EXISTS receipt_fields JSON NULL COMMENT '代充商品回执单字段配置' AFTER delivery_requires_receipt;

-- 为现有的代充商品设置默认字段
UPDATE pr_goods 
SET receipt_fields = JSON_ARRAY(
    JSON_OBJECT('key', 'account', 'label', '账号', 'type', 'text', 'placeholder', '请输入账号', 'required', true),
    JSON_OBJECT('key', 'password', 'label', '密码', 'type', 'password', 'placeholder', '请输入密码', 'required', true),
    JSON_OBJECT('key', 'contact', 'label', '联系方式', 'type', 'text', 'placeholder', '请输入联系方式', 'required', false)
)
WHERE delivery_requires_receipt = 1 AND receipt_fields IS NULL;

-- 查看修改结果
SELECT 
    table_name,
    column_name,
    data_type,
    column_comment
FROM information_schema.columns
WHERE table_schema = DATABASE()
    AND table_name = 'pr_cdk_receipts'
    AND column_name IN ('last_modified', 'modified_by', 'modification_history');