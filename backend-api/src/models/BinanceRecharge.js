import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const BinanceRecharge = sequelize.define('BinanceRecharge', {
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
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USDT'
  },
  txHash: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  address: {
    type: DataTypes.STRING
  },
  network: {
    type: DataTypes.STRING
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  actualAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 4)
  },
  cnyAmount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  completedTime: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'binance_recharges',
  timestamps: true
});

export default BinanceRecharge;