import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  log('\n=== CDK可重复使用功能数据库迁移 ===\n', 'bright');
  
  try {
    // 测试数据库连接
    log('测试数据库连接...', 'blue');
    await sequelize.authenticate();
    log('✓ 数据库连接成功', 'green');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'migrations', 'add_cdk_reusable_fields.sql');
    log(`\n读取迁移文件: ${sqlFilePath}`, 'blue');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('迁移文件不存在');
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割SQL语句（按分号分割，但要考虑存储过程等特殊情况）
    const statements = [];
    let currentStatement = '';
    let inDelimiter = false;
    
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('DELIMITER')) {
        if (trimmedLine === 'DELIMITER ;') {
          inDelimiter = false;
        } else {
          inDelimiter = true;
        }
        continue;
      }
      
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      if (!inDelimiter && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    log(`\n准备执行 ${statements.length} 个SQL语句`, 'blue');
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      let executedCount = 0;
      
      // 执行每个SQL语句
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // 显示正在执行的语句类型
            const statementType = statement.split(' ')[0].toUpperCase();
            const tableName = extractTableName(statement);
            
            log(`\n执行: ${statementType} ${tableName ? `on ${tableName}` : ''}`, 'yellow');
            
            await sequelize.query(statement, { transaction });
            executedCount++;
            log(`✓ 成功`, 'green');
          } catch (error) {
            // 某些错误可能是可以忽略的（如字段已存在）
            if (error.message.includes('Duplicate column name') || 
                error.message.includes('already exists')) {
              log(`⚠ 跳过: ${error.message}`, 'yellow');
            } else {
              throw error;
            }
          }
        }
      }
      
      // 提交事务
      await transaction.commit();
      log(`\n✓ 迁移成功完成！执行了 ${executedCount} 个语句`, 'green');
      
      // 验证迁移结果
      await verifyMigration();
      
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    log(`\n✗ 迁移失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 提取表名
function extractTableName(statement) {
  const patterns = [
    /ALTER TABLE `?(\w+)`?/i,
    /CREATE TABLE IF NOT EXISTS `?(\w+)`?/i,
    /CREATE TABLE `?(\w+)`?/i,
    /UPDATE `?(\w+)`?/i
  ];
  
  for (const pattern of patterns) {
    const match = statement.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// 验证迁移结果
async function verifyMigration() {
  log('\n验证迁移结果...', 'blue');
  
  try {
    // 检查pr_goods_cdkey表的新字段
    const [cdkColumns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'pr_goods_cdkey'
      AND COLUMN_NAME IN ('is_reusable', 'max_usage_count', 'current_usage_count', 'usage_expire_date', 'last_used_date')
    `);
    
    if (cdkColumns.length === 5) {
      log('✓ pr_goods_cdkey表字段添加成功', 'green');
    } else {
      log(`⚠ pr_goods_cdkey表只添加了 ${cdkColumns.length}/5 个新字段`, 'yellow');
    }
    
    // 检查cdk_usage_records表是否创建
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'cdk_usage_records'
    `);
    
    if (tables.length > 0) {
      log('✓ cdk_usage_records表创建成功', 'green');
      
      // 检查表结构
      const [usageColumns] = await sequelize.query(`
        SELECT COUNT(*) as column_count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'cdk_usage_records'
      `);
      
      log(`  - 包含 ${usageColumns[0].column_count} 个字段`, 'blue');
    } else {
      log('⚠ cdk_usage_records表未创建', 'yellow');
    }
    
    // 统计CDK数据
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_cdks,
        SUM(CASE WHEN is_reusable = 1 THEN 1 ELSE 0 END) as reusable_cdks,
        SUM(CASE WHEN is_reusable = 0 THEN 1 ELSE 0 END) as single_use_cdks
      FROM pr_goods_cdkey
    `);
    
    log('\nCDK统计信息:', 'blue');
    log(`  - 总数: ${stats[0].total_cdks}`, 'blue');
    log(`  - 可重复使用: ${stats[0].reusable_cdks}`, 'blue');
    log(`  - 一次性使用: ${stats[0].single_use_cdks}`, 'blue');
    
  } catch (error) {
    log(`验证失败: ${error.message}`, 'yellow');
  }
}

// 运行迁移
log('开始执行CDK可重复使用功能迁移脚本', 'bright');
log('请确保已备份数据库！', 'yellow');
log('按Ctrl+C取消执行\n', 'yellow');

// 等待3秒
setTimeout(() => {
  runMigration();
}, 3000);