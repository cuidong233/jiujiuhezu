import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '商品ID'
  },
  categoryId: {
    type: DataTypes.BIGINT,
    field: 'category_id',
    allowNull: true,
    comment: '分类ID'
  },
  title: {
    type: DataTypes.STRING(255),
    field: 'title',
    allowNull: false,
    comment: '商品标题'
  },
  // 为了兼容性，添加一个虚拟字段name，映射到title
  name: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('title');
    },
    set(value) {
      this.setDataValue('title', value);
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  productType: {
    type: DataTypes.STRING(20),
    field: 'product_type',
    defaultValue: 'CDK',
    comment: '商品类型：CDK-虚拟激活码, PHYSICAL-实物商品'
  },
  cdkType: {
    type: DataTypes.STRING(50),
    field: 'cdk_type',
    allowNull: true,
    comment: 'CDK类型：netflix, disney, appletv, steam, coupon等'
  },
  deliveryMode: {
    type: DataTypes.STRING(20),
    field: 'delivery_mode',
    defaultValue: 'auto',
    comment: '发货方式：auto-自动发货, manual-手动发货'
  },
  autoDeliveryLimit: {
    type: DataTypes.INTEGER,
    field: 'auto_delivery_limit',
    defaultValue: 1,
    comment: '自动发货数量限制（每次订单最多自动发货数量）'
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '时长：1个月、3个月、12个月等'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'original_price',
    allowNull: true,
    comment: '原价'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 999999,
    comment: '库存'
  },
  sales: {
    type: DataTypes.INTEGER,
    field: 'sales',
    defaultValue: 0,
    comment: '销量'
  },
  // 为了兼容性，添加虚拟字段soldCount
  soldCount: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('sales');
    },
    set(value) {
      this.setDataValue('sales', value);
    }
  },
  coverImage: {
    type: DataTypes.STRING(500),
    field: 'cover_image',
    allowNull: true,
    comment: '商品封面图片'
  },
  // 为了兼容性，添加虚拟字段imageUrl
  imageUrl: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('coverImage');
    },
    set(value) {
      this.setDataValue('coverImage', value);
    }
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 0:下架 1:上架'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    field: 'sort_order',
    defaultValue: 0,
    comment: '排序'
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '商品属性JSON'
  },
  spec: {
    type: DataTypes.STRING(255),
    field: 'spec',
    allowNull: true,
    comment: '商品规格'
  },
  memberPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'member_price',
    allowNull: true,
    comment: '会员价'
  },
  memberLevel: {
    type: DataTypes.INTEGER,
    field: 'member_level',
    allowNull: true,
    comment: '会员等级'
  },
  monthlySales: {
    type: DataTypes.INTEGER,
    field: 'monthly_sales',
    defaultValue: 0,
    comment: '月销量'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'rating',
    allowNull: true,
    comment: '评分'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    field: 'review_count',
    defaultValue: 0,
    comment: '评论数'
  },
  skuInfo: {
    type: DataTypes.JSON,
    field: 'sku_info',
    allowNull: true,
    comment: 'SKU信息'
  },
  specifications: {
    type: DataTypes.JSON,
    field: 'specifications',
    allowNull: true,
    comment: '商品规格JSON'
  },
  goodsCode: {
    type: DataTypes.STRING(50),
    field: 'goods_code',
    allowNull: true,
    comment: '商品编码'
  },
  tags: {
    type: DataTypes.STRING(255),
    field: 'tags',
    allowNull: true,
    comment: '标签'
  },
  keywords: {
    type: DataTypes.STRING(255),
    field: 'keywords',
    allowNull: true,
    comment: '关键词'
  },
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    field: 'email_enabled',
    defaultValue: false,
    comment: '是否启用邮件'
  },
  emailSubject: {
    type: DataTypes.STRING(255),
    field: 'email_subject',
    allowNull: true,
    comment: '邮件主题'
  },
  emailTemplate: {
    type: DataTypes.TEXT,
    field: 'email_template',
    allowNull: true,
    comment: '邮件模板'
  },
  deliveryRequiresReceipt: {
    type: DataTypes.BOOLEAN,
    field: 'delivery_requires_receipt',
    defaultValue: false,
    comment: '是否需要回执(代充商品)'
  },
  receiptTemplate: {
    type: DataTypes.JSON,
    field: 'receipt_template',
    allowNull: true,
    comment: '回执模板配置'
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
  tableName: 'pr_goods',
  timestamps: true,
  underscored: true
});

export default Product;