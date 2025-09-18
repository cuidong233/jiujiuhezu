import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import CDK from './CDK.js';
import Order from './Order.js';
import User from './User.js';

const CDKReceipt = sequelize.define('CDKReceipt', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '回执ID'
  },
  cdkId: {
    type: DataTypes.BIGINT,
    field: 'cdk_id',
    allowNull: true,  // 允许为null，因为代充订单可能没有关联的CDK
    comment: 'CDK ID（可选）',
    references: {
      model: CDK,
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.BIGINT,
    field: 'order_id',
    allowNull: false,
    comment: '订单ID',
    references: {
      model: Order,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.BIGINT,
    field: 'user_id',
    allowNull: true,
    comment: '用户ID',
    references: {
      model: User,
      key: 'id'
    }
  },
  receiptFields: {
    type: DataTypes.JSON,
    field: 'receipt_fields',
    allowNull: true,
    comment: '回执字段配置'
  },
  receiptData: {
    type: DataTypes.JSON,
    field: 'receipt_data',
    allowNull: true,
    comment: '回执数据'
  },
  deliveryStatus: {
    type: DataTypes.TINYINT,
    field: 'delivery_status',
    defaultValue: 0,
    comment: '发货状态: 0-待发货, 1-已发货, 2-发货失败'
  },
  deliveredBy: {
    type: DataTypes.BIGINT,
    field: 'delivered_by',
    allowNull: true,
    comment: '发货人ID'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    field: 'delivered_at',
    allowNull: true,
    comment: '发货时间'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
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
  tableName: 'pr_cdk_receipts',
  timestamps: true,
  underscored: true
});

// 定义关联关系
CDKReceipt.belongsTo(CDK, { foreignKey: 'cdkId', as: 'cdk' });
CDKReceipt.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
CDKReceipt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

CDK.hasMany(CDKReceipt, { foreignKey: 'cdkId', as: 'receipts' });
Order.hasMany(CDKReceipt, { foreignKey: 'orderId', as: 'cdkReceipts' });

export default CDKReceipt;