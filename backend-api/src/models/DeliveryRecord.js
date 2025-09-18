import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const DeliveryRecord = sequelize.define('DeliveryRecord', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '发货记录ID'
  },
  orderId: {
    type: DataTypes.BIGINT,
    field: 'order_id',
    allowNull: false,
    comment: '订单ID'
  },
  productId: {
    type: DataTypes.BIGINT,
    field: 'product_id',
    allowNull: false,
    comment: '商品ID'
  },
  cdkId: {
    type: DataTypes.BIGINT,
    field: 'cdk_id',
    allowNull: true,
    comment: 'CDK ID'
  },
  cdkCode: {
    type: DataTypes.STRING(100),
    field: 'cdk_code',
    allowNull: true,
    comment: 'CDK码'
  },
  deliveryType: {
    type: DataTypes.STRING(20),
    field: 'delivery_type',
    defaultValue: 'auto',
    comment: '发货类型：auto-自动发货, manual-手动发货'
  },
  deliveryStatus: {
    type: DataTypes.TINYINT,
    field: 'delivery_status',
    defaultValue: 1,
    comment: '发货状态 0:失败 1:成功'
  },
  deliveryMethod: {
    type: DataTypes.STRING(50),
    field: 'delivery_method',
    allowNull: true,
    comment: '发货方式：email-邮件, system-系统内, api-API推送'
  },
  deliveryContent: {
    type: DataTypes.TEXT,
    field: 'delivery_content',
    allowNull: true,
    comment: '发货内容（CDK信息或其他）'
  },
  recipientEmail: {
    type: DataTypes.STRING(100),
    field: 'recipient_email',
    allowNull: true,
    comment: '接收邮箱'
  },
  operatorId: {
    type: DataTypes.BIGINT,
    field: 'operator_id',
    allowNull: true,
    comment: '操作员ID（手动发货时）'
  },
  operatorName: {
    type: DataTypes.STRING(50),
    field: 'operator_name',
    allowNull: true,
    comment: '操作员名称'
  },
  failureReason: {
    type: DataTypes.STRING(500),
    field: 'failure_reason',
    allowNull: true,
    comment: '失败原因'
  },
  retryCount: {
    type: DataTypes.INTEGER,
    field: 'retry_count',
    defaultValue: 0,
    comment: '重试次数'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at',
    defaultValue: DataTypes.NOW,
    comment: '发货时间'
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
  tableName: 'delivery_record',
  timestamps: true,
  underscored: true
});

export default DeliveryRecord;