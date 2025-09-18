import sequelize from '../db/sequelize.js';
import User from './User.js';
import Product from './Product.js';
import ProductMedia from './ProductMedia.js';
import ProductSpecification from './ProductSpecification.js';
import Order from './Order.js';
import CDK from './CDK.js';
import CDKUsageRecord from './CDKUsageRecord.js';
import CDKReceipt from './CDKReceipt.js';
import Coupon from './Coupon.js';
import DeliveryRecord from './DeliveryRecord.js';
import EmailCode from './EmailCode.js';
import Question from './Question.js';
import Category from './Category.js';
import WorkOrder from './WorkOrder.js';
import BinanceRecharge from './BinanceRecharge.js';
import VipUser from './VipUser.js';
import WithdrawRecord from './WithdrawRecord.js';
import Article from './Article.js';
import ProductSku from './ProductSku.js';
import Notification from './Notification.js';
import DiscountActivity from './DiscountActivity.js';

// 定义关联关系
Product.hasMany(ProductMedia, { as: 'media', foreignKey: 'productId' });
ProductMedia.belongsTo(Product, { foreignKey: 'productId' });

// 定义Order和Product的关联关系
Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

// 定义Order和User的关联关系
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Product.hasMany(CDK, { foreignKey: 'productId' });
CDK.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(DeliveryRecord, { foreignKey: 'orderId' });
DeliveryRecord.belongsTo(Order, { foreignKey: 'orderId' });

// 导出所有模型
export {
  sequelize,
  User,
  Product,
  ProductMedia,
  ProductSpecification,
  ProductSku,
  Order,
  CDK,
  CDKUsageRecord,
  CDKReceipt,
  Coupon,
  DeliveryRecord,
  EmailCode,
  Question,
  Category,
  WorkOrder,
  BinanceRecharge,
  VipUser,
  WithdrawRecord,
  Article,
  Notification,
  DiscountActivity
};