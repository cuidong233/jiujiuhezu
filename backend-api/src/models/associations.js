import Product from './Product.js';
import ProductMedia from './ProductMedia.js';
import Order from './Order.js';
import CDK from './CDK.js';
import ProductSku from './ProductSku.js';
import ProductSpecification from './ProductSpecification.js';
import Category from './Category.js';

// Define associations
const defineAssociations = () => {
  // Product belongs to Category
  Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  // Category has many Products
  Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products'
  });


  // Product has many ProductMedia
  Product.hasMany(ProductMedia, {
    foreignKey: 'product_id',
    as: 'media',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // ProductMedia belongs to Product
  ProductMedia.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Product has many SKUs
  Product.hasMany(ProductSku, {
    foreignKey: 'product_id',
    as: 'skus',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // SKU belongs to Product
  ProductSku.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Product has one Specification
  Product.hasOne(ProductSpecification, {
    foreignKey: 'product_id',
    as: 'specification',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Specification belongs to Product
  ProductSpecification.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Existing associations
  // Order belongs to Product
  Order.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Product has many Orders
  Product.hasMany(Order, {
    foreignKey: 'product_id',
    as: 'orders'
  });

  // CDK belongs to Product
  CDK.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  // Product has many CDKs
  Product.hasMany(CDK, {
    foreignKey: 'product_id',
    as: 'cdks'
  });
};

export default defineAssociations;