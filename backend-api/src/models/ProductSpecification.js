import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import Product from './Product.js';

const ProductSpecification = sequelize.define('ProductSpecification', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '规格ID'
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
  specName: {
    type: DataTypes.STRING(100),
    field: 'spec_name',
    allowNull: false,
    comment: '规格名称'
  },
  specValue: {
    type: DataTypes.STRING(255),
    field: 'spec_value',
    allowNull: false,
    comment: '规格值'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '规格价格'
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'original_price',
    allowNull: true,
    comment: '原价'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '库存'
  },
  maxPurchase: {
    type: DataTypes.INTEGER,
    field: 'max_purchase',
    defaultValue: 999999,
    comment: '最大购买数量'
  },
  minPurchase: {
    type: DataTypes.INTEGER,
    field: 'min_purchase',
    defaultValue: 1,
    comment: '最小购买数量'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    field: 'is_default',
    defaultValue: false,
    comment: '是否默认规格'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 0-禁用, 1-启用'
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '规格属性'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    field: 'sort_order',
    defaultValue: 0,
    comment: '排序'
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
  tableName: 'pr_product_specifications',
  timestamps: true,
  underscored: true
});

// 定义关联关系
ProductSpecification.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductSpecification, { foreignKey: 'productId', as: 'productSpecifications' });

export default ProductSpecification;