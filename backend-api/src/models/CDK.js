import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import Product from './Product.js';

const CDK = sequelize.define('CDK', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: 'CDK ID'
  },
  productId: {
    type: DataTypes.BIGINT,
    field: 'product_id',
    allowNull: false,
    comment: '商品ID',
    references: {
      model: Product,
      key: 'id'
    }
  },
  cdkCode: {
    type: DataTypes.STRING(100),
    field: 'cdk_code',
    allowNull: false,
    unique: true,
    comment: 'CDK激活码'
  },
  cdkType: {
    type: DataTypes.STRING(20),
    field: 'cdk_type',
    defaultValue: 'normal',
    comment: 'CDK类型：normal-普通, account-账号类, recharge-充值类, coupon-优惠券'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0:未售 1:已售 2:已使用 3:已过期 4:已锁定'
  },
  orderId: {
    type: DataTypes.BIGINT,
    field: 'order_id',
    allowNull: true,
    comment: '订单ID'
  },
  userId: {
    type: DataTypes.BIGINT,
    field: 'user_id',
    allowNull: true,
    comment: '使用者ID'
  },
  soldDate: {
    type: DataTypes.DATE,
    field: 'sold_date',
    allowNull: true,
    comment: '售出时间'
  },
  usedDate: {
    type: DataTypes.DATE,
    field: 'used_date',
    allowNull: true,
    comment: '使用时间'
  },
  expireDate: {
    type: DataTypes.DATE,
    field: 'expire_date',
    allowNull: true,
    comment: '过期时间'
  },
  cdkCategory: {
    type: DataTypes.STRING(20),
    field: 'cdk_category',
    defaultValue: 'one_time',
    comment: 'CDK分类: manual_recharge(代充), reusable_stock(可重复使用有库存), one_time(一次性)'
  },
  isReusable: {
    type: DataTypes.BOOLEAN,
    field: 'is_reusable',
    defaultValue: false,
    comment: '是否可重复使用'
  },
  maxUsageCount: {
    type: DataTypes.INTEGER,
    field: 'max_usage_count',
    defaultValue: 1,
    comment: '最大使用次数（可重复使用CDK）'
  },
  currentUsageCount: {
    type: DataTypes.INTEGER,
    field: 'current_usage_count',
    defaultValue: 0,
    comment: '当前使用次数'
  },
  usageExpireDate: {
    type: DataTypes.DATE,
    field: 'usage_expire_date',
    allowNull: true,
    comment: '使用有效期（使用后多久自动释放）'
  },
  lastUsedDate: {
    type: DataTypes.DATE,
    field: 'last_used_date',
    allowNull: true,
    comment: '最后使用时间'
  },
  releaseDays: {
    type: DataTypes.INTEGER,
    field: 'release_days',
    defaultValue: 30,
    comment: '释放天数(可重复使用CDK)'
  },
  productSpecId: {
    type: DataTypes.BIGINT,
    field: 'product_spec_id',
    allowNull: true,
    comment: '商品规格ID'
  },
  isUnlimitedStock: {
    type: DataTypes.BOOLEAN,
    field: 'is_unlimited_stock',
    defaultValue: false,
    comment: '是否无限库存(代充CDK)'
  },
  receiptFields: {
    type: DataTypes.JSON,
    field: 'receipt_fields',
    allowNull: true,
    comment: '回执项配置(代充CDK)'
  },
  receiptData: {
    type: DataTypes.JSON,
    field: 'receipt_data',
    allowNull: true,
    comment: '回执数据(代充CDK)'
  },
  accountInfo: {
    type: DataTypes.JSON,
    field: 'account_info',
    allowNull: true,
    comment: '账号信息（账号类CDK）'
  },
  extraData: {
    type: DataTypes.JSON,
    field: 'extra_data',
    allowNull: true,
    comment: '额外数据'
  },
  remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '备注'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pr_goods_cdkey',
  timestamps: true,
  underscored: true
});

// 定义关联关系
CDK.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CDK, { foreignKey: 'productId', as: 'cdks' });

export default CDK;