import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const WithdrawRecord = sequelize.define('WithdrawRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  actualAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accountName: {
    type: DataTypes.STRING
  },
  bankName: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'rejected'),
    defaultValue: 'pending'
  },
  remark: {
    type: DataTypes.TEXT
  },
  rejectReason: {
    type: DataTypes.TEXT
  },
  operatorId: {
    type: DataTypes.STRING
  },
  operatorName: {
    type: DataTypes.STRING
  },
  processedTime: {
    type: DataTypes.DATE
  },
  completedTime: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'withdraw_records',
  timestamps: true
});

export default WithdrawRecord;