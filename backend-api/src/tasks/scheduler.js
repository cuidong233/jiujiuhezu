import cron from 'node-cron';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import orderAutoCancelTask from './orderAutoCancel.js';
import cdkAutoReleaseTask from './cdkAutoRelease.js';

// Configure logger for scheduler
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/scheduler-error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/scheduler.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * 任务调度器 - 管理所有定时任务
 */
class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.isInitialized = false;
    this.startTime = null;
  }

  /**
   * 初始化调度器
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('任务调度器已初始化，跳过重复初始化');
      return;
    }

    logger.info('开始初始化任务调度器...');
    
    try {
      // 确保日志目录存在
      await this.ensureLogDirectory();
      
      // 注册所有任务
      await this.registerTasks();
      
      this.isInitialized = true;
      this.startTime = new Date();
      
      logger.info('任务调度器初始化完成', {
        registeredTasks: Array.from(this.tasks.keys()),
        startTime: this.startTime
      });
      
    } catch (error) {
      logger.error('任务调度器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 确保日志目录存在
   */
  async ensureLogDirectory() {
    const logDir = path.join(process.cwd(), 'logs');
    
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        logger.info(`创建日志目录: ${logDir}`);
      }
    } catch (error) {
      logger.error('创建日志目录失败:', error);
      throw error;
    }
  }

  /**
   * 注册所有任务
   */
  async registerTasks() {
    try {
      // 注册订单自动取消任务
      await this.registerTask('orderAutoCancel', {
        name: '订单自动取消任务',
        description: '自动取消超过15分钟未支付的订单',
        schedule: '0 * * * * *', // 每分钟执行
        task: orderAutoCancelTask,
        enabled: true,
        timezone: process.env.TZ || 'Asia/Shanghai'
      });

      // 注册CDK自动释放任务
      await this.registerTask('cdkAutoRelease', {
        name: 'CDK自动释放任务',
        description: '自动释放过期的可重复使用CDK',
        schedule: '0 0 */6 * * *', // 每6小时执行一次
        task: cdkAutoReleaseTask,
        enabled: true,
        timezone: process.env.TZ || 'Asia/Shanghai'
      });

      // 可以在这里添加更多任务
      // await this.registerTask('anotherTask', {...});
      
    } catch (error) {
      logger.error('注册任务失败:', error);
      throw error;
    }
  }

  /**
   * 注册单个任务
   */
  async registerTask(taskId, taskConfig) {
    const { name, description, schedule, task, enabled, timezone } = taskConfig;
    
    try {
      if (this.tasks.has(taskId)) {
        logger.warn(`任务 ${taskId} 已存在，跳过注册`);
        return;
      }

      logger.info(`注册任务: ${taskId} - ${name}`);

      const cronTask = cron.schedule(schedule, async () => {
        const startTime = Date.now();
        logger.info(`开始执行任务: ${taskId}`);
        
        try {
          const result = await task.execute();
          const duration = Date.now() - startTime;
          
          logger.info(`任务 ${taskId} 执行完成`, {
            duration,
            success: result.success,
            processedCount: result.processedCount || 0
          });
          
        } catch (error) {
          const duration = Date.now() - startTime;
          logger.error(`任务 ${taskId} 执行失败`, {
            error: error.message,
            stack: error.stack,
            duration
          });
        }
      }, {
        scheduled: false,
        timezone: timezone || 'Asia/Shanghai'
      });

      // 存储任务信息
      this.tasks.set(taskId, {
        id: taskId,
        name,
        description,
        schedule,
        task,
        cronTask,
        enabled,
        timezone,
        registeredAt: new Date(),
        lastExecuted: null,
        executionCount: 0,
        successCount: 0,
        errorCount: 0
      });

      // 如果任务启用，则启动
      if (enabled) {
        cronTask.start();
        logger.info(`任务 ${taskId} 已启动，调度规则: ${schedule}`);
      }

    } catch (error) {
      logger.error(`注册任务 ${taskId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 启动所有任务
   */
  async startAll() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    logger.info('启动所有已注册的任务...');
    
    let startedCount = 0;
    
    for (const [taskId, taskInfo] of this.tasks) {
      try {
        if (taskInfo.enabled && taskInfo.cronTask) {
          if (!taskInfo.cronTask.running) {
            taskInfo.cronTask.start();
            startedCount++;
            logger.info(`启动任务: ${taskId} - ${taskInfo.name}`);
          } else {
            logger.info(`任务 ${taskId} 已在运行中`);
          }
        } else {
          logger.info(`任务 ${taskId} 已禁用，跳过启动`);
        }
      } catch (error) {
        logger.error(`启动任务 ${taskId} 失败:`, error);
      }
    }

    logger.info(`任务启动完成，已启动 ${startedCount}/${this.tasks.size} 个任务`);
  }

  /**
   * 停止所有任务
   */
  async stopAll() {
    logger.info('停止所有任务...');
    
    let stoppedCount = 0;
    
    for (const [taskId, taskInfo] of this.tasks) {
      try {
        if (taskInfo.cronTask && taskInfo.cronTask.running) {
          taskInfo.cronTask.stop();
          stoppedCount++;
          logger.info(`停止任务: ${taskId} - ${taskInfo.name}`);
        }
      } catch (error) {
        logger.error(`停止任务 ${taskId} 失败:`, error);
      }
    }

    logger.info(`任务停止完成，已停止 ${stoppedCount} 个任务`);
  }

  /**
   * 启动特定任务
   */
  async startTask(taskId) {
    const taskInfo = this.tasks.get(taskId);
    
    if (!taskInfo) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    if (!taskInfo.enabled) {
      throw new Error(`任务 ${taskId} 已禁用`);
    }

    if (taskInfo.cronTask.running) {
      logger.warn(`任务 ${taskId} 已在运行中`);
      return;
    }

    taskInfo.cronTask.start();
    logger.info(`启动任务: ${taskId} - ${taskInfo.name}`);
  }

  /**
   * 停止特定任务
   */
  async stopTask(taskId) {
    const taskInfo = this.tasks.get(taskId);
    
    if (!taskInfo) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    if (!taskInfo.cronTask.running) {
      logger.warn(`任务 ${taskId} 未在运行`);
      return;
    }

    taskInfo.cronTask.stop();
    logger.info(`停止任务: ${taskId} - ${taskInfo.name}`);
  }

  /**
   * 手动执行特定任务
   */
  async executeTask(taskId) {
    const taskInfo = this.tasks.get(taskId);
    
    if (!taskInfo) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    logger.info(`手动执行任务: ${taskId} - ${taskInfo.name}`);
    
    try {
      const result = await taskInfo.task.execute();
      taskInfo.executionCount++;
      taskInfo.lastExecuted = new Date();
      
      if (result.success) {
        taskInfo.successCount++;
      } else {
        taskInfo.errorCount++;
      }

      logger.info(`手动执行任务 ${taskId} 完成`, {
        success: result.success,
        message: result.message
      });

      return result;
    } catch (error) {
      taskInfo.errorCount++;
      logger.error(`手动执行任务 ${taskId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 启用/禁用任务
   */
  async toggleTask(taskId, enabled) {
    const taskInfo = this.tasks.get(taskId);
    
    if (!taskInfo) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    if (taskInfo.enabled === enabled) {
      logger.warn(`任务 ${taskId} 已经是 ${enabled ? '启用' : '禁用'} 状态`);
      return;
    }

    taskInfo.enabled = enabled;

    if (enabled) {
      if (!taskInfo.cronTask.running) {
        taskInfo.cronTask.start();
        logger.info(`启用并启动任务: ${taskId}`);
      }
    } else {
      if (taskInfo.cronTask.running) {
        taskInfo.cronTask.stop();
        logger.info(`禁用并停止任务: ${taskId}`);
      }
    }
  }

  /**
   * 获取所有任务状态
   */
  getTasksStatus() {
    const tasks = [];
    
    for (const [taskId, taskInfo] of this.tasks) {
      tasks.push({
        id: taskId,
        name: taskInfo.name,
        description: taskInfo.description,
        schedule: taskInfo.schedule,
        enabled: taskInfo.enabled,
        running: taskInfo.cronTask ? taskInfo.cronTask.running : false,
        registeredAt: taskInfo.registeredAt,
        lastExecuted: taskInfo.lastExecuted,
        executionCount: taskInfo.executionCount,
        successCount: taskInfo.successCount,
        errorCount: taskInfo.errorCount,
        successRate: taskInfo.executionCount > 0 
          ? Math.round((taskInfo.successCount / taskInfo.executionCount) * 100) 
          : 0,
        timezone: taskInfo.timezone
      });
    }

    return {
      schedulerStatus: {
        initialized: this.isInitialized,
        startTime: this.startTime,
        totalTasks: this.tasks.size,
        runningTasks: tasks.filter(t => t.running).length
      },
      tasks
    };
  }

  /**
   * 获取特定任务状态
   */
  getTaskStatus(taskId) {
    const taskInfo = this.tasks.get(taskId);
    
    if (!taskInfo) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    return {
      id: taskId,
      name: taskInfo.name,
      description: taskInfo.description,
      schedule: taskInfo.schedule,
      enabled: taskInfo.enabled,
      running: taskInfo.cronTask ? taskInfo.cronTask.running : false,
      registeredAt: taskInfo.registeredAt,
      lastExecuted: taskInfo.lastExecuted,
      executionCount: taskInfo.executionCount,
      successCount: taskInfo.successCount,
      errorCount: taskInfo.errorCount,
      successRate: taskInfo.executionCount > 0 
        ? Math.round((taskInfo.successCount / taskInfo.executionCount) * 100) 
        : 0,
      timezone: taskInfo.timezone,
      taskStatus: taskInfo.task.getStatus ? taskInfo.task.getStatus() : null
    };
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    logger.info('开始优雅关闭任务调度器...');
    
    try {
      await this.stopAll();
      
      // 清理资源
      this.tasks.clear();
      this.isInitialized = false;
      this.startTime = null;
      
      logger.info('任务调度器已优雅关闭');
    } catch (error) {
      logger.error('任务调度器关闭失败:', error);
      throw error;
    }
  }
}

// 导出单例
export default new TaskScheduler();