import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import CDK from './CDK.js';
import User from './User.js';
import Order from './Order.js';

const CDKUsageRecord = sequelize.define('CDKUsageRecord', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '使用记录ID'
  },
  cdkId: {
    type: DataTypes.BIGINT,
    field: 'cdk_id',
    allowNull: false,
    comment: 'CDK ID',
    references: {
      model: CDK,
      key: 'id'
    }
  },
  cdkCode: {
    type: DataTypes.STRING(100),
    field: 'cdk_code',
    allowNull: false,
    comment: 'CDK码'
  },
  userId: {
    type: DataTypes.BIGINT,
    field: 'user_id',
    allowNull: false,
    comment: '使用者ID',
    references: {
      model: User,
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.BIGINT,
    field: 'order_id',
    allowNull: true,
    comment: '关联订单ID',
    references: {
      model: Order,
      key: 'id'
    }
  },
  usageType: {
    type: DataTypes.STRING(20),
    field: 'usage_type',
    defaultValue: 'normal',
    comment: '使用类型：normal-正常使用, redeem-兑换, activate-激活'
  },
  usageStatus: {
    type: DataTypes.TINYINT,
    field: 'usage_status',
    defaultValue: 1,
    comment: '使用状态 0:失败 1:成功 2:已释放'
  },
  usedAt: {
    type: DataTypes.DATE,
    field: 'used_at',
    defaultValue: DataTypes.NOW,
    comment: '使用时间'
  },
  expireAt: {
    type: DataTypes.DATE,
    field: 'expire_at',
    allowNull: true,
    comment: '本次使用的过期时间'
  },
  releasedAt: {
    type: DataTypes.DATE,
    field: 'released_at',
    allowNull: true,
    comment: '释放时间'
  },
  releaseReason: {
    type: DataTypes.STRING(100),
    field: 'release_reason',
    allowNull: true,
    comment: '释放原因：expired-过期, manual-手动, system-系统'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    field: 'ip_address',
    allowNull: true,
    comment: '使用时的IP地址'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    field: 'user_agent',
    allowNull: true,
    comment: '使用时的User Agent'
  },
  deviceInfo: {
    type: DataTypes.JSON,
    field: 'device_info',
    allowNull: true,
    comment: '设备信息'
  },
  remark: {
    type: DataTypes.STRING(500),
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
  tableName: 'cdk_usage_records',
  timestamps: true,
  underscored: true
});

// 定义关联关系
CDKUsageRecord.belongsTo(CDK, { foreignKey: 'cdkId', as: 'cdk' });
CDKUsageRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CDKUsageRecord.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

CDK.hasMany(CDKUsageRecord, { foreignKey: 'cdkId', as: 'usageRecords' });
User.hasMany(CDKUsageRecord, { foreignKey: 'userId', as: 'cdkUsageRecords' });

export default CDKUsageRecord;