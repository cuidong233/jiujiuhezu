import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cdkService from '../services/cdkService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志文件路径
const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'cdk-auto-release.log');
const errorLogFile = path.join(logDir, 'cdk-auto-release-error.log');

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 写入日志
function writeLog(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  const file = isError ? errorLogFile : logFile;
  fs.appendFileSync(file, logMessage);
  console.log(logMessage);
}

// CDK自动释放任务
class CDKAutoReleaseTask {
  constructor() {
    this.isRunning = false;
    this.taskSchedule = '0 */6 * * *'; // 默认每6小时执行一次
  }

  /**
   * 执行CDK释放任务
   */
  async execute() {
    if (this.isRunning) {
      writeLog('CDK自动释放任务正在运行中，跳过本次执行');
      return;
    }

    this.isRunning = true;
    writeLog('开始执行CDK自动释放任务');

    try {
      // 1. 释放旧版可重复使用CDK（兼容性）
      const oldResult = await cdkService.releaseExpiredCDKs();
      
      if (oldResult.success) {
        const { total, successCount, failCount } = oldResult.data;
        if (total > 0) {
          writeLog(`旧版CDK自动释放完成: 总数=${total}, 成功=${successCount}, 失败=${failCount}`);
          if (failCount > 0) {
            writeLog(`有${failCount}个旧版CDK释放失败，请检查详细日志`, true);
          }
        }
      } else {
        writeLog(`旧版CDK自动释放任务失败: ${oldResult.error}`, true);
      }

      // 2. 释放新版可重复使用有库存的CDK
      const newResult = await cdkService.releaseExpiredReusableCDKs();
      
      if (newResult.success) {
        const { total, successCount, failCount } = newResult.data;
        if (total > 0) {
          writeLog(`新版可重复使用CDK自动释放完成: 总数=${total}, 成功=${successCount}, 失败=${failCount}`);
          if (failCount > 0) {
            writeLog(`有${failCount}个新版CDK释放失败，请检查详细日志`, true);
          }
        }
      } else {
        writeLog(`新版CDK自动释放任务失败: ${newResult.error}`, true);
      }

      // 总结
      const totalOld = oldResult.success ? oldResult.data.total : 0;
      const totalNew = newResult.success ? newResult.data.total : 0;
      const totalReleased = totalOld + totalNew;
      
      if (totalReleased > 0) {
        writeLog(`CDK自动释放任务完成: 共释放${totalReleased}个CDK（旧版=${totalOld}, 新版=${totalNew}）`);
      } else {
        writeLog('CDK自动释放任务完成: 没有需要释放的CDK');
      }
    } catch (error) {
      writeLog(`CDK自动释放任务异常: ${error.message}`, true);
      console.error('CDK自动释放任务异常:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 手动触发释放任务
   */
  async manualRelease() {
    writeLog('手动触发CDK释放任务');
    await this.execute();
  }

  /**
   * 启动定时任务
   */
  start() {
    writeLog(`启动CDK自动释放定时任务，执行计划: ${this.taskSchedule}`);
    
    // 创建定时任务
    this.task = cron.schedule(this.taskSchedule, async () => {
      await this.execute();
    });

    // 启动时立即执行一次
    this.execute();
  }

  /**
   * 停止定时任务
   */
  stop() {
    if (this.task) {
      this.task.stop();
      writeLog('CDK自动释放定时任务已停止');
    }
  }

  /**
   * 更新执行计划
   * @param {String} schedule - cron表达式
   */
  updateSchedule(schedule) {
    this.stop();
    this.taskSchedule = schedule;
    this.start();
    writeLog(`CDK自动释放任务执行计划已更新为: ${schedule}`);
  }

  /**
   * 获取任务状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: this.taskSchedule,
      nextExecution: this.task ? this.task.nextDates(1)[0] : null
    };
  }
}

// 创建任务实例
const cdkAutoReleaseTask = new CDKAutoReleaseTask();

// 导出任务实例和相关方法
export default cdkAutoReleaseTask;

// 如果直接运行此文件，启动任务
if (process.argv[1] === __filename) {
  writeLog('CDK自动释放任务作为独立进程启动');
  
  // 启动任务
  cdkAutoReleaseTask.start();
  
  // 监听进程退出信号
  process.on('SIGINT', () => {
    writeLog('收到退出信号，停止CDK自动释放任务');
    cdkAutoReleaseTask.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    writeLog('收到终止信号，停止CDK自动释放任务');
    cdkAutoReleaseTask.stop();
    process.exit(0);
  });
}