import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '优惠券ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '优惠券名称'
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
    comment: '优惠券兑换码'
  },
  type: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '优惠券类型 1:满减券 2:折扣券 3:现金券'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '优惠券面值或折扣'
  },
  minAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'min_amount',
    defaultValue: 0,
    comment: '最低使用金额'
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'max_discount',
    allowNull: true,
    comment: '最高优惠金额（折扣券）'
  },
  totalCount: {
    type: DataTypes.INTEGER,
    field: 'total_count',
    defaultValue: 1,
    comment: '发放总量'
  },
  usedCount: {
    type: DataTypes.INTEGER,
    field: 'used_count',
    defaultValue: 0,
    comment: '已使用数量'
  },
  startTime: {
    type: DataTypes.DATE,
    field: 'start_time',
    allowNull: false,
    comment: '生效时间'
  },
  endTime: {
    type: DataTypes.DATE,
    field: 'end_time',
    allowNull: false,
    comment: '失效时间'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 0:禁用 1:启用'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '优惠券描述'
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
  tableName: 'coupon',
  timestamps: true,
  underscored: true
});

export default Coupon;