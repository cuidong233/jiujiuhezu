import { sequelize } from '../models/index.js';
import '../models/CDK.js';
import '../models/Product.js';
import '../models/Order.js';
import '../models/DeliveryRecord.js';

const initDatabase = async () => {
  try {
    // Sync all defined models to the DB
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    process.exit(1);
  }
};

initDatabase();