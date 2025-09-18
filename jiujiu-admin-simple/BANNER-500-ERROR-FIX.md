# Banner API 500 错误解决方案

## 问题描述
点击轮播图管理页面时，API 调用 `/api/admin/banner` 返回 500 错误：
- 错误信息：`Incorrect arguments to mysqld_stmt_execute`
- 原因：MySQL 预处理语句参数不匹配

## 问题原因
在 `banner.routes.js` 中，获取列表时重复使用了同一个参数数组：
1. 先用 `params` 数组执行计数查询
2. 然后在同一个 `params` 数组上追加 `limit` 和 `offset`
3. 导致参数数量不匹配

## 解决方案

### 修改文件：`/Users/apple/Desktop/project/backend-api/src/routes/banner.routes.js`

在第 57-81 行，修改代码如下：

```javascript
// 获取总数
const countSql = `SELECT COUNT(*) as total FROM pr_banner WHERE ${whereClause}`;
const [countResult] = await pool.execute(countSql, params);
const total = countResult[0].total;

// 获取列表 - 使用新的参数数组
const listParams = [...params]; // 复制参数数组
const listSql = `
  SELECT 
    id,
    img,
    link,
    title,
    order_num,
    is_visible,
    created_at,
    updated_at
  FROM pr_banner 
  WHERE ${whereClause}
  ORDER BY order_num ASC, id DESC
  LIMIT ? OFFSET ?
`;
listParams.push(parseInt(limit), parseInt(offset));

const [rows] = await pool.execute(listSql, listParams);
```

## 已完成的修复
✅ 修改了 `banner.routes.js` 文件
✅ 使用独立的参数数组避免参数污染
✅ 添加了详细的错误日志

## 重启服务
修改后需要重启后端服务：
```bash
# 停止服务
pkill -f nodemon

# 启动服务（端口 3002）
PORT=3002 npm run dev
```

## 验证修复
1. 确保后端运行在 http://localhost:3002
2. 前端访问轮播图管理页面
3. API 应该正常返回数据

## 注意事项
- 后端需要设置 `PORT=3002` 环境变量
- 数据库表名是 `pr_banner`（不是 `banners`）
- 需要正确的认证 token 才能访问管理端 API