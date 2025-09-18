#!/bin/bash

# 测试手动发货修复效果
echo "=== 测试代充CDK手动发货修复 ==="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 提示用户输入订单号
read -p "请输入要测试的订单号: " ORDER_NO

if [ -z "$ORDER_NO" ]; then
    echo -e "${RED}错误: 订单号不能为空${NC}"
    exit 1
fi

echo ""
echo "测试订单: $ORDER_NO"
echo ""

# 1. 查询订单当前状态
echo -e "${YELLOW}1. 查询订单当前状态...${NC}"
mysql -u root -p jiujiu -e "
SELECT 
    order_no AS '订单号',
    payment_status AS '支付状态',
    delivery_status AS '发货状态', 
    order_status AS '订单状态',
    user_email AS '用户邮箱',
    delivery_mode AS '发货方式'
FROM pr_orders 
WHERE order_no = '$ORDER_NO';
"

echo ""
echo -e "${YELLOW}2. 模拟手动发货...${NC}"
echo "准备发送请求到: http://localhost:3001/api/order/deliver/$ORDER_NO"

# 2. 发送手动发货请求
RESPONSE=$(curl -s -X PUT "http://localhost:3001/api/order/deliver/$ORDER_NO" \
  -H "Content-Type: application/json" \
  -d '{
    "cdkCodes": ["TEST-CDK-001", "TEST-CDK-002"],
    "additionalInfo": "测试附加信息",
    "remark": "测试备注"
  }')

echo "响应: $RESPONSE"
echo ""

# 3. 等待2秒
echo -e "${YELLOW}3. 等待2秒后验证...${NC}"
sleep 2

# 4. 再次查询订单状态
echo -e "${YELLOW}4. 查询更新后的订单状态...${NC}"
mysql -u root -p jiujiu -e "
SELECT 
    order_no AS '订单号',
    payment_status AS '支付状态',
    delivery_status AS '发货状态', 
    order_status AS '订单状态',
    delivered_at AS '发货时间',
    updated_at AS '更新时间'
FROM pr_orders 
WHERE order_no = '$ORDER_NO';
"

# 5. 检查发货记录
echo ""
echo -e "${YELLOW}5. 检查发货记录...${NC}"
mysql -u root -p jiujiu -e "
SELECT COUNT(*) AS '发货记录数' 
FROM pr_delivery_records 
WHERE order_id = (SELECT id FROM pr_orders WHERE order_no = '$ORDER_NO');
"

# 6. 查看最新日志
echo ""
echo -e "${YELLOW}6. 查看相关日志...${NC}"
echo "最新的日志记录:"
tail -n 50 backend-api/server.log | grep -E "$ORDER_NO|📝|✅|❌|📧" | tail -n 20

echo ""
echo -e "${GREEN}=== 测试完成 ===${NC}"
echo ""
echo "检查清单:"
echo "[ ] 发货状态是否为 2（已发货）"
echo "[ ] 订单状态是否为 2（已完成）"
echo "[ ] 是否有发货时间"
echo "[ ] 是否有发货记录"
echo "[ ] 日志是否显示验证成功"
echo "[ ] 是否收到邮件"