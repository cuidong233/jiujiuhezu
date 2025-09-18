// SQLite 数据库配置（用于 Render 部署）
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用 SQLite 替代 MySQL
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
});

// 导出连接池兼容接口
export const pool = {
  async getConnection() {
    return {
      async query(sql, values) {
        return sequelize.query(sql, {
          replacements: values,
          type: sequelize.QueryTypes.SELECT
        });
      },
      release() {}
    };
  },
  
  async query(sql, values) {
    return sequelize.query(sql, {
      replacements: values,
      type: sequelize.QueryTypes.SELECT
    });
  },
  
  async execute(sql, values) {
    return sequelize.query(sql, {
      replacements: values,
      type: sequelize.QueryTypes.RAW
    });
  }
};

// 测试连接
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite 数据库连接成功');
    
    // 自动创建表
    await sequelize.sync();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

export default pool;