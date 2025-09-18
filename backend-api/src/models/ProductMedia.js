import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const ProductMedia = sequelize.define('ProductMedia', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '媒体ID'
  },
  productId: {
    type: DataTypes.BIGINT,
    field: 'product_id',
    allowNull: false,
    comment: '商品ID',
    references: {
      model: 'product',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  mediaType: {
    type: DataTypes.ENUM('image', 'video'),
    field: 'media_type',
    allowNull: false,
    comment: '媒体类型：image-图片, video-视频'
  },
  mediaUrl: {
    type: DataTypes.STRING(500),
    field: 'media_url',
    allowNull: false,
    comment: '媒体URL地址'
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    field: 'thumbnail_url',
    allowNull: true,
    comment: '缩略图URL（视频使用）'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '媒体标题/描述'
  },
  alt: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '替代文本（SEO优化）'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    field: 'sort_order',
    defaultValue: 0,
    comment: '排序顺序'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    field: 'is_primary',
    defaultValue: false,
    comment: '是否为主图/主视频'
  },
  source: {
    type: DataTypes.ENUM('upload', 'unsplash', 'pexels', 'pixabay', 'external'),
    defaultValue: 'upload',
    comment: '媒体来源'
  },
  license: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '许可证信息'
  },
  attribution: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '版权归属信息'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '元数据（尺寸、格式、大小等）'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：0-禁用, 1-启用'
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
  tableName: 'product_media',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['media_type']
    },
    {
      fields: ['is_primary']
    }
  ]
});

export default ProductMedia;