import cron from 'node-cron';
import winston from 'winston';
import { Op } from 'sequelize';
import Order from '../models/Order.js';
import sequelize from '../db/sequelize.js';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/order-auto-cancel-error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/order-auto-cancel.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * 自动取消超时未支付订单
 * 逻辑：查找15分钟前创建且仍未支付的订单，将其状态更新为已取消
 */
class OrderAutoCancelTask {
  constructor() {
    this.isRunning = false;
    this.taskName = 'OrderAutoCancel';
    this.timeoutMinutes = 15; // 超时分钟数
  }

  /**
   * 执行自动取消任务
   */
  async execute() {
    if (this.isRunning) {
      logger.warn('取消任务已在运行中，跳过此次执行');
      return {
        success: false,
        message: '任务已在运行中',
        skipped: true
      };
    }

    const startTime = Date.now();
    const executionId = `${this.taskName}_${startTime}`;
    
    this.isRunning = true;
    
    logger.info(`开始执行订单自动取消任务 [${executionId}]`);

    // 使用数据库事务确保数据一致性
    const transaction = await sequelize.transaction();
    
    try {
      // 计算15分钟前的时间
      const timeoutTime = new Date(Date.now() - this.timeoutMinutes * 60 * 1000);
      
      logger.info(`查找 ${timeoutTime.toISOString()} 之前创建的未支付订单`);

      // 查找需要取消的订单
      const ordersToCancel = await Order.findAll({
        where: {
          // 订单状态：待处理（0）
          orderStatus: 0,
          // 支付状态：待支付（0）
          paymentStatus: 0,
          // 创建时间超过15分钟
          createdAt: {
            [Op.lt]: timeoutTime
          }
        },
        attributes: ['id', 'orderNo', 'userId', 'totalAmount', 'createdAt'],
        transaction
      });

      if (ordersToCancel.length === 0) {
        await transaction.commit();
        const duration = Date.now() - startTime;
        
        logger.info(`未找到需要取消的订单 [${executionId}]`, {
          duration,
          timeoutTime: timeoutTime.toISOString()
        });

        return {
          success: true,
          message: '未找到需要取消的订单',
          processedCount: 0,
          duration
        };
      }

      logger.info(`找到 ${ordersToCancel.length} 个需要取消的订单`, {
        orderIds: ordersToCancel.map(order => order.id),
        orderNos: ordersToCancel.map(order => order.orderNo)
      });

      // 批量更新订单状态
      const updateResult = await Order.update(
        {
          orderStatus: 3, // 已取消
          updatedAt: new Date(),
          remark: `系统自动取消：超过${this.timeoutMinutes}分钟未支付`
        },
        {
          where: {
            id: {
              [Op.in]: ordersToCancel.map(order => order.id)
            }
          },
          transaction
        }
      );

      // 提交事务
      await transaction.commit();

      const duration = Date.now() - startTime;
      const cancelledCount = updateResult[0]; // 返回影响的行数

      logger.info(`订单自动取消任务完成 [${executionId}]`, {
        processedCount: cancelledCount,
        totalFound: ordersToCancel.length,
        duration,
        timeoutTime: timeoutTime.toISOString(),
        orderDetails: ordersToCancel.map(order => ({
          id: order.id,
          orderNo: order.orderNo,
          userId: order.userId,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt
        }))
      });

      return {
        success: true,
        message: `成功取消 ${cancelledCount} 个超时订单`,
        processedCount: cancelledCount,
        totalFound: ordersToCancel.length,
        duration,
        orders: ordersToCancel.map(order => ({
          id: order.id,
          orderNo: order.orderNo,
          totalAmount: order.totalAmount
        }))
      };

    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      
      const duration = Date.now() - startTime;
      
      logger.error(`订单自动取消任务失败 [${executionId}]`, {
        error: error.message,
        stack: error.stack,
        duration
      });

      return {
        success: false,
        message: error.message || '任务执行失败',
        duration,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      };
    } finally {
      this.isRunning = false;
      logger.info(`订单自动取消任务结束 [${executionId}]`, {
        duration: Date.now() - startTime
      });
    }
  }

  /**
   * 手动执行一次任务（用于测试或管理员手动触发）
   */
  async executeOnce() {
    logger.info('手动触发订单自动取消任务');
    return await this.execute();
  }

  /**
   * 启动定时任务
   * 每分钟执行一次
   */
  start() {
    logger.info('启动订单自动取消定时任务，执行间隔：每分钟');
    
    // 每分钟的第0秒执行
    const task = cron.schedule('0 * * * * *', async () => {
      await this.execute();
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'Asia/Shanghai'
    });

    task.start();
    
    logger.info('订单自动取消定时任务已启动');
    
    return task;
  }

  /**
   * 获取任务状态
   */
  getStatus() {
    return {
      taskName: this.taskName,
      isRunning: this.isRunning,
      timeoutMinutes: this.timeoutMinutes,
      timezone: process.env.TZ || 'Asia/Shanghai'
    };
  }

  /**
   * 设置超时分钟数
   */
  setTimeoutMinutes(minutes) {
    if (typeof minutes !== 'number' || minutes <= 0) {
      throw new Error('超时分钟数必须是大于0的数字');
    }
    this.timeoutMinutes = minutes;
    logger.info(`订单超时时间已设置为 ${minutes} 分钟`);
  }
}

// 导出单例
export default new OrderAutoCancelTask();