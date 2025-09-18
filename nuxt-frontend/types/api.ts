// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  success: boolean
}

// 分页参数
export interface PageParams {
  page: number
  limit: number
}

// 分页响应
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  limit: number
  totalPage: number
}

// 用户相关类型
export interface User {
  id: number
  nickName?: string        // 后端主要字段
  price?: number          // 后端余额字段
  avatar?: string
  mail?: string           // 后端邮箱字段
  openId?: string         
  status?: boolean | number // 兼容两种类型
  uuid?: string           
  inviteId?: string       
  birthday?: string       
  sex?: number           
  // 兼容字段 - 保持向后兼容
  username?: string       
  nickname?: string       
  email?: string          
  balance?: number        
  phone?: string
  createTime?: string
  updateTime?: string
}

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: User
  expires: number
}

// 商品相关类型
export interface Goods {
  id: number
  articleId?: number      // 新增：文章ID
  categoryId?: number     // 修正：后端分类ID字段为categoryId
  categoryCode?: number   // 兼容旧字段
  title: string          // 修正：后端商品名称字段为title
  coverImage: string     // 修正：后端图片字段为coverImage
  description: string
  orderNum?: number      // 新增：商品排序
  price: number
  goodsCode?: string     // 新增：商品编码
  status: number         // 商品状态
  couponState?: boolean  // 新增：优惠券状态
  tags?: string          // 新增：商品标签
  addState?: boolean     // 新增：是否可以加购
  addUnit?: string       // 新增：加购单位
  keywords?: string      // 新增：关键词
  sales: number | string    // 兼容：后端为Integer，前端展示可能为字符串
  // 兼容字段 - 保持向后兼容
  name?: string          // 兼容字段，映射到title
  image?: string         // 兼容字段，映射到coverImage
  originalPrice?: number // 兼容字段
  images?: string[]      // 兼容字段
  category?: string      // 兼容字段
  stock?: number         // 兼容字段
  rating?: number        // 兼容字段
  features?: string[]    // 兼容字段
  promo?: string         // 兼容字段
  createTime?: string
  updateTime?: string
}

// 商品分类
export interface GoodsCategory {
  id: number
  name: string
  parentId: number
  level: number
  sort: number
  status: number
}

// 订单相关类型
export interface Order {
  id: number
  orderNo: string
  userId: number
  goodsId: number
  goodsName: string
  goodsImage: string
  price: number
  quantity: number
  totalAmount: number
  status: number
  payStatus: number
  payTime?: string
  createTime: string
  updateTime: string
}

// 订单状态枚举
export enum OrderStatus {
  PENDING = 0,    // 待付款
  PAID = 1,       // 已付款
  SHIPPED = 2,    // 已发货
  DELIVERED = 3,  // 已送达
  COMPLETED = 4,  // 已完成
  CANCELLED = 5   // 已取消
}

// 支付相关类型
export interface Payment {
  id: number
  orderId: number
  orderNo: string
  amount: number
  payMethod: string
  payStatus: number
  payTime?: string
  createTime: string
}

// 文章相关类型
export interface Article {
  id: number
  title: string
  content: string
  summary: string
  coverImage: string
  author: string
  category: string
  status: number
  viewCount: number
  createTime: string
  updateTime: string
}

// 轮播图类型
export interface Banner {
  id: number
  title: string
  image: string
  link: string
  sort: number
  status: number
  createTime: string
}

// 优惠券类型
export interface Coupon {
  id: number
  name: string
  type: number
  value: number
  minAmount: number
  startTime: string
  endTime: string
  status: number
  createTime: string
}

// 充值相关类型
export interface Recharge {
  id: number
  userId: number
  amount: number
  payMethod: string
  payStatus: number
  payTime?: string
  createTime: string
}

// 提现相关类型
export interface Withdraw {
  id: number
  userId: number
  amount: number
  bankInfo: string
  status: number
  processTime?: string
  createTime: string
}

// 系统参数类型
export interface SysParams {
  id: number
  paramCode: string
  paramValue: string
  paramType: string
  description: string
  createTime: string
  updateTime: string
} 