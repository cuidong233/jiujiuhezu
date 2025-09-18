import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const EmailCode = sequelize.define('EmailCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '邮箱'
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    comment: '验证码'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '类型：login-登录，register-注册，reset-重置密码'
  },
  used: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否已使用：0-未使用，1-已使用'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
    comment: '过期时间'
  }
}, {
  tableName: 'email_codes',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

export default EmailCode;