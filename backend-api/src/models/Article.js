import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '文章标题'
  },
  subtitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '副标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '文章描述/摘要'
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: '文章内容（HTML格式）'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '教程指南',
    comment: '文章分类'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '文章封面图'
  },
  author_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '管理员',
    comment: '作者名称'
  },
  author_avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '作者头像'
  },
  read_time: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '5分钟',
    comment: '阅读时间'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览次数'
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    comment: '文章状态：draft草稿，published已发布，archived已归档'
  },
  publish_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发布日期'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '标签（逗号分隔）'
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'SEO标题'
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO描述'
  },
  meta_keywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO关键词'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序顺序'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推荐'
  },
  related_articles: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '相关文章ID（逗号分隔）'
  }
}, {
  tableName: 'articles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Article;