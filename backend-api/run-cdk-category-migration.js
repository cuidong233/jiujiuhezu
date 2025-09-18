/**
 * 运行CDK分类系统数据库迁移
 * 
 * 运行方式：node run-cdk-category-migration.js
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jiujiushop',
      multipleStatements: true
    });
    
    console.log('✅ 数据库连接成功');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, 'migrations', 'add_cdk_categories_and_specs.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 开始执行数据库迁移...');
    
    // 执行迁移
    await connection.query(migrationSQL);
    
    console.log('✅ 数据库迁移成功完成！');
    console.log('\n已添加的功能：');
    console.log('1. CDK分类支持（一次性、可重复库存、代充）');
    console.log('2. 商品规格表');
    console.log('3. CDK回执记录表');
    console.log('4. 释放天数配置');
    console.log('5. 无限库存标记');
    console.log('6. 回执项配置');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    console.error('详细错误:', error);
    
    // 如果是字段已存在的错误，说明部分迁移可能已经执行
    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('\n⚠️  部分迁移可能已经执行，请检查数据库结构');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 数据库连接已关闭');
    }
  }
}

// 运行迁移
console.log('🚀 CDK分类系统数据库迁移工具\n');
runMigration();