# 统一后端API服务

这是一个整合了所有功能的统一后端API服务，运行在端口 3000。

## 功能模块

- **支付系统**：微信支付、支付宝支付
- **产品管理**：商品、媒体文件、CDK码
- **订单系统**：订单创建、查询、管理
- **客服系统**：问题FAQ、工单管理
- **用户系统**：VIP管理、认证授权
- **财务系统**：提现管理、币安充值
- **管理后台**：管理员功能

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置信息
```

### 3. 配置数据库
确保MySQL服务正在运行，并创建数据库：
```sql
CREATE DATABASE jiujiu_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务器
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务器将运行在 http://localhost:3000

## API端点

### 支付相关
- `POST /api/wechat/pay/native` - 微信扫码支付
- `POST /api/payment/alipay/page` - 支付宝网页支付

### 产品管理
- `GET /api/product/list` - 获取产品列表
- `POST /api/product/create` - 创建产品
- `PUT /api/product/:id` - 更新产品
- `DELETE /api/product/:id` - 删除产品

### 客服系统
- `GET /api/question/list` - 获取问题列表
- `GET /api/work/list` - 获取工单列表
- `POST /api/work/create` - 创建工单

### VIP管理
- `GET /api/vip/list` - 获取VIP用户列表
- `POST /api/vip/create` - 创建VIP用户

### 提现管理
- `GET /api/withdraw/list` - 获取提现记录
- `POST /api/withdraw/create` - 创建提现申请
- `PUT /api/withdraw/review/:id` - 审核提现

## 注意事项

1. 首次运行时，数据库表会自动创建
2. 确保所有必要的证书文件放在 `src/certs` 目录下
3. 生产环境请修改JWT密钥和其他敏感配置
4. 建议使用PM2或其他进程管理器在生产环境运行

## 原服务器迁移说明

此服务器合并了之前运行在端口 3000 和 3001 的两个独立服务器：
- 原端口 3000：文件存储的API（现已迁移到数据库）
- 原端口 3001：数据库驱动的API（保持不变）

所有功能现在统一运行在端口 3000。