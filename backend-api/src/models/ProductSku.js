import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const ProductSku = sequelize.define('ProductSku', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: 'SKU ID'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '商品ID'
  },
  sku_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'SKU编号'
  },
  sku_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'SKU名称'
  },
  attributes: {
    type: DataTypes.JSON,
    comment: 'SKU属性组合，JSON格式'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '销售价'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '库存'
  },
  expire_days: {
    type: DataTypes.INTEGER,
    comment: '有效天数（用于订阅型产品）'
  },
  sku_description: {
    type: DataTypes.TEXT,
    comment: 'SKU简介'
  },
  license_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '授权码数量'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '销量'
  }
}, {
  tableName: 'pr_product_skus',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ProductSku;