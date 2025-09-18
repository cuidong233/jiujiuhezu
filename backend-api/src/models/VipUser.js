import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const VipUser = sequelize.define('VipUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING
  },
  userPhone: {
    type: DataTypes.STRING
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  levelName: {
    type: DataTypes.STRING
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalRecharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalWithdraw: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  monthlyRecharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  benefits: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  expireTime: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'suspended'),
    defaultValue: 'active'
  }
}, {
  tableName: 'vip_users',
  timestamps: true
});

export default VipUser;