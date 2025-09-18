import { DataTypes, Op } from 'sequelize';
import sequelize from '../db/sequelize.js';

const DiscountActivity = sequelize.define('DiscountActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '活动名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '活动描述'
  },
  discount_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'percentage',
    allowNull: false,
    validate: {
      isIn: [['percentage', 'fixed']]
    },
    comment: '折扣类型: percentage(百分比折扣), fixed(固定金额)'
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '折扣值: 如9折则为90, 减10元则为10'
  },
  min_purchase_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '最低消费金额'
  },
  max_discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: null,
    comment: '最高折扣金额限制'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '活动开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '活动结束时间'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '状态: 0-禁用, 1-启用'
  },
  apply_to_all_products: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否应用于所有商品'
  },
  product_ids: {
    type: DataTypes.TEXT,
    comment: '指定商品ID列表(JSON格式)',
    get() {
      const value = this.getDataValue('product_ids');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('product_ids', value ? JSON.stringify(value) : null);
    }
  },
  category_ids: {
    type: DataTypes.TEXT,
    comment: '指定分类ID列表(JSON格式)',
    get() {
      const value = this.getDataValue('category_ids');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('category_ids', value ? JSON.stringify(value) : null);
    }
  }
}, {
  tableName: 'discount_activities',
  timestamps: true,
  underscored: true
});

// 获取当前有效的活动
DiscountActivity.getActiveDiscounts = async function() {
  const now = new Date();
  return await this.findAll({
    where: {
      status: 1,
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now }
    },
    order: [['discount_value', 'DESC']]
  });
};

// 检查商品是否适用于活动
DiscountActivity.prototype.isApplicableToProduct = function(productId, categoryId) {
  if (this.apply_to_all_products) {
    return true;
  }
  
  if (this.product_ids && this.product_ids.includes(productId)) {
    return true;
  }
  
  if (this.category_ids && categoryId && this.category_ids.includes(categoryId)) {
    return true;
  }
  
  return false;
};

// 计算折扣后的价格
DiscountActivity.prototype.calculateDiscountedPrice = function(originalPrice) {
  let discountAmount = 0;
  
  if (this.discount_type === 'percentage') {
    discountAmount = originalPrice * (100 - this.discount_value) / 100;
  } else if (this.discount_type === 'fixed') {
    discountAmount = this.discount_value;
  }
  
  // 应用最高折扣限制
  if (this.max_discount_amount && discountAmount > this.max_discount_amount) {
    discountAmount = this.max_discount_amount;
  }
  
  const finalPrice = originalPrice - discountAmount;
  return Math.max(0, finalPrice);
};

export default DiscountActivity;