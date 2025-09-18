# 任务调度系统

## 概述

这个任务调度系统用于管理和执行定时任务，包括自动取消超时未支付的订单等功能。

## 文件结构

```
src/tasks/
├── README.md                # 文档说明
├── scheduler.js             # 任务调度器主文件
└── orderAutoCancel.js      # 订单自动取消任务
```

## 主要功能

### 1. 订单自动取消任务 (orderAutoCancel.js)

- **功能**: 自动取消超过15分钟未支付的订单
- **执行频率**: 每分钟检查一次
- **处理逻辑**: 
  - 查找创建时间超过15分钟且状态为待支付的订单
  - 批量更新订单状态为"已取消"
  - 使用数据库事务确保数据一致性
  - 详细的日志记录和错误处理

### 2. 任务调度器 (scheduler.js)

- **功能**: 管理所有定时任务的生命周期
- **特性**:
  - 任务注册和配置
  - 启动/停止任务
  - 任务状态监控
  - 手动执行任务
  - 优雅关闭

## API 接口

### 获取所有任务状态
```http
GET /api/tasks/status
```

### 获取特定任务状态
```http
GET /api/tasks/{taskId}/status
```

### 手动执行任务
```http
POST /api/tasks/{taskId}/execute
```

### 启用/禁用任务
```http
POST /api/tasks/{taskId}/toggle
Content-Type: application/json

{
  "enabled": true
}
```

## 配置说明

### 订单自动取消配置

- **超时时间**: 默认15分钟，可通过 `setTimeoutMinutes(minutes)` 方法修改
- **执行频率**: 每分钟执行一次（cron: `0 * * * * *`）
- **时区**: 默认 `Asia/Shanghai`，可通过环境变量 `TZ` 设置

### 日志配置

日志文件存放在 `logs/` 目录下：
- `scheduler.log` - 调度器日志
- `scheduler-error.log` - 调度器错误日志
- `order-auto-cancel.log` - 订单取消任务日志
- `order-auto-cancel-error.log` - 订单取消任务错误日志

## 使用示例

### 服务器集成

任务调度器已集成到主服务器 (`server.js`) 中，会在服务器启动时自动初始化和启动。

### 手动测试

可以运行测试脚本来验证功能：

```bash
node test-order-auto-cancel.js
```

### 程序化使用

```javascript
import orderAutoCancelTask from './src/tasks/orderAutoCancel.js';
import taskScheduler from './src/tasks/scheduler.js';

// 手动执行一次订单取消任务
const result = await orderAutoCancelTask.executeOnce();

// 获取任务状态
const status = orderAutoCancelTask.getStatus();

// 设置超时时间为30分钟
orderAutoCancelTask.setTimeoutMinutes(30);

// 管理调度器
await taskScheduler.initialize();
await taskScheduler.startAll();
const allStatus = taskScheduler.getTasksStatus();
await taskScheduler.executeTask('orderAutoCancel');
```

## 错误处理

- 使用数据库事务确保数据一致性
- 详细的错误日志记录
- 任务执行失败不会影响其他任务
- 服务器启动失败不会因为任务调度器而中断

## 扩展新任务

要添加新的定时任务：

1. 创建任务类，实现 `execute()` 方法
2. 在 `scheduler.js` 的 `registerTasks()` 方法中注册新任务
3. 配置调度规则（cron表达式）

示例：
```javascript
// 在 scheduler.js 中添加
await this.registerTask('newTask', {
  name: '新任务',
  description: '任务描述',
  schedule: '0 0 * * *', // 每天午夜执行
  task: newTaskInstance,
  enabled: true,
  timezone: 'Asia/Shanghai'
});
```

## 注意事项

- 确保数据库连接正常
- 日志目录权限正确
- 合理设置任务执行频率避免性能问题
- 生产环境建议监控任务执行状态
- 定期清理日志文件避免磁盘空间不足