import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '通知类型: order_update, receipt_approved, receipt_rejected, system'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '通知标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '通知内容'
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '关联类型: order, receipt, etc'
  },
  relatedId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '关联ID: 订单号等'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已读'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '阅读时间'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '额外数据'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['relatedType', 'relatedId']
    }
  ]
});

// 类方法：创建通知
Notification.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    return notification;
  } catch (error) {
    console.error('创建通知失败:', error);
    throw error;
  }
};

// 类方法：批量创建通知
Notification.createBulkNotifications = async function(notifications) {
  try {
    const result = await this.bulkCreate(notifications);
    return result;
  } catch (error) {
    console.error('批量创建通知失败:', error);
    throw error;
  }
};

// 类方法：标记为已读
Notification.markAsRead = async function(notificationId, userId) {
  try {
    const result = await this.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          id: notificationId,
          userId: userId
        }
      }
    );
    return result[0] > 0;
  } catch (error) {
    console.error('标记通知已读失败:', error);
    throw error;
  }
};

// 类方法：标记用户所有通知为已读
Notification.markAllAsRead = async function(userId) {
  try {
    const result = await this.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          userId: userId,
          isRead: false
        }
      }
    );
    return result[0];
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    throw error;
  }
};

// 类方法：获取用户未读通知数量
Notification.getUnreadCount = async function(userId) {
  try {
    const count = await this.count({
      where: {
        userId: userId,
        isRead: false
      }
    });
    return count;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    throw error;
  }
};

// 类方法：创建回执修改通知
Notification.createReceiptModificationNotification = async function(userId, orderNo, status, reason = null) {
  const notifications = {
    approved: {
      title: '回执修改申请已通过',
      content: `您的订单 ${orderNo} 的回执修改申请已通过，回执单已更新为您提交的新数据。`,
      type: 'receipt_approved'
    },
    rejected: {
      title: '回执修改申请已拒绝',
      content: `您的订单 ${orderNo} 的回执修改申请已被拒绝。${reason ? `拒绝原因：${reason}` : ''}`,
      type: 'receipt_rejected'
    }
  };

  const notificationData = notifications[status];
  if (!notificationData) {
    throw new Error('无效的状态');
  }

  return await this.createNotification({
    userId,
    type: notificationData.type,
    title: notificationData.title,
    content: notificationData.content,
    relatedType: 'order',
    relatedId: orderNo,
    metadata: {
      orderNo,
      status,
      reason
    }
  });
};

export default Notification;