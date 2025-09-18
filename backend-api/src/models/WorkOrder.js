import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'closed'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  description: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.STRING
  },
  userName: {
    type: DataTypes.STRING
  },
  userPhone: {
    type: DataTypes.STRING
  },
  assignee: {
    type: DataTypes.STRING
  },
  assigneeName: {
    type: DataTypes.STRING
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  reply: {
    type: DataTypes.TEXT
  },
  closedTime: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'work_orders',
  timestamps: true
});

export default WorkOrder;