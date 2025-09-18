#!/bin/bash
set -e

BASE_URL="http://localhost:11000"

echo "1. 测试用户登录"
curl -s -X POST "$BASE_URL/product/common/mail/login" -d '{"email":"test@demo.com","password":"admin"}' -H "Content-Type: application/json" | grep '"code":0'

echo "2. 获取商品列表"
curl -s "$BASE_URL/product/goods" | grep '"success":true'

echo "3. 获取FAQ"
curl -s "$BASE_URL/question/list" | grep '"success":true'

echo "4. 上传图片"
curl -s -F "file=@test.png" "$BASE_URL/sys/oss/upload" | grep '"src"'

echo "全部API基础功能测试通过" 