-- 修改 cdk_receipts 表，允许 cdk_id 为 NULL
-- 这是为了支持代充订单的回执单（它们可能没有关联的CDK）

ALTER TABLE cdk_management.pr_cdk_receipts 
MODIFY COLUMN cdk_id BIGINT NULL COMMENT 'CDK ID（可选，代充订单可能没有关联的CDK）';

-- 确认修改
DESCRIBE cdk_management.pr_cdk_receipts;