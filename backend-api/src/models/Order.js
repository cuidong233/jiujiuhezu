import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单ID'
  },
  orderNo: {
    type: DataTypes.STRING(50),
    field: 'order_no',
    unique: true,
    allowNull: false,
    comment: '订单编号'
  },
  userId: {
    type: DataTypes.BIGINT,
    field: 'user_id',
    allowNull: false,
    comment: '用户ID'
  },
  productId: {
    type: DataTypes.BIGINT,
    field: 'product_id',
    allowNull: false,
    comment: '商品ID'
  },
  productName: {
    type: DataTypes.STRING(200),
    field: 'product_name',
    allowNull: false,
    comment: '商品名称'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '商品SKU'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '购买数量'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'unit_price',
    allowNull: false,
    comment: '单价'
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'sale_price',
    allowNull: true,
    comment: '销售价格'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'total_amount',
    allowNull: false,
    comment: '总金额'
  },
  productImage: {
    type: DataTypes.STRING(500),
    field: 'product_image',
    allowNull: true,
    comment: '商品图片'
  },
  consumerNickname: {
    type: DataTypes.STRING(100),
    field: 'consumer_nickname',
    allowNull: true,
    comment: '消费者昵称'
  },
  paymentMethod: {
    type: DataTypes.STRING(20),
    field: 'payment_method',
    allowNull: true,
    comment: '支付方式：wechat, alipay, card等'
  },
  paymentStatus: {
    type: DataTypes.TINYINT,
    field: 'payment_status',
    defaultValue: 0,
    comment: '支付状态 0:待支付 1:已支付 2:支付失败'
  },
  deliveryStatus: {
    type: DataTypes.TINYINT,
    field: 'delivery_status',
    defaultValue: 0,
    comment: '发货状态 0:待发货 1:部分发货 2:已发货 3:已送达（原为发货失败，现用作已送达）'
  },
  deliveryMode: {
    type: DataTypes.STRING(20),
    field: 'delivery_mode',
    defaultValue: 'auto',
    comment: '发货方式：auto-自动发货, manual-手动发货'
  },
  orderStatus: {
    type: DataTypes.TINYINT,
    field: 'order_status',
    defaultValue: 0,
    comment: '订单状态 0:待处理 1:处理中 2:已完成 3:已取消 4:已退款'
  },
  processStatus: {
    type: DataTypes.TINYINT,
    field: 'process_status',
    defaultValue: 0,
    comment: '处理状态'
  },
  expireTime: {
    type: DataTypes.DATE,
    field: 'expire_time',
    allowNull: true,
    comment: '过期时间'
  },
  remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '备注'
  },
  userEmail: {
    type: DataTypes.STRING(100),
    field: 'user_email',
    allowNull: true,
    comment: '用户邮箱（用于发送CDK）'
  },
  paidAt: {
    type: DataTypes.DATE,
    field: 'paid_at',
    allowNull: true,
    comment: '支付时间'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at',
    allowNull: true,
    comment: '发货时间'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at',
    allowNull: true,
    comment: '完成时间（自动完成时间）'
  },
  deliveryRequiresReceipt: {
    type: DataTypes.BOOLEAN,
    field: 'delivery_requires_receipt',
    defaultValue: false,
    comment: '是否需要回执单（代充商品）'
  },
  hasReceipt: {
    type: DataTypes.BOOLEAN,
    field: 'has_receipt',
    defaultValue: false,
    comment: '是否有回执单'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'order',
  timestamps: true,
  underscored: true
});

export default Order;