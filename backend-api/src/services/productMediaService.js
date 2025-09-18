import ProductMedia from '../models/ProductMedia.js';
import Product from '../models/Product.js';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片和视频文件'));
    }
  }
});

class ProductMediaService {
  // 获取商品的所有媒体
  async getProductMedia(productId) {
    try {
      const media = await ProductMedia.findAll({
        where: { 
          productId,
          status: 1 
        },
        order: [
          ['isPrimary', 'DESC'],
          ['sortOrder', 'ASC'],
          ['createdAt', 'ASC']
        ]
      });
      return media;
    } catch (error) {
      throw new Error(`获取商品媒体失败: ${error.message}`);
    }
  }

  // 添加媒体到商品
  async addMediaToProduct(productId, mediaData) {
    try {
      // 验证商品是否存在
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 如果设置为主图，先将其他主图取消
      if (mediaData.isPrimary) {
        await ProductMedia.update(
          { isPrimary: false },
          { 
            where: { 
              productId,
              mediaType: mediaData.mediaType 
            } 
          }
        );
      }

      // 创建媒体记录
      const media = await ProductMedia.create({
        productId,
        ...mediaData
      });

      return media;
    } catch (error) {
      throw new Error(`添加媒体失败: ${error.message}`);
    }
  }

  // 批量添加媒体
  async bulkAddMedia(productId, mediaArray) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 处理主图逻辑
      const hasNewPrimaryImage = mediaArray.some(m => m.isPrimary && m.mediaType === 'image');
      const hasNewPrimaryVideo = mediaArray.some(m => m.isPrimary && m.mediaType === 'video');

      if (hasNewPrimaryImage) {
        await ProductMedia.update(
          { isPrimary: false },
          { 
            where: { 
              productId,
              mediaType: 'image' 
            } 
          }
        );
      }

      if (hasNewPrimaryVideo) {
        await ProductMedia.update(
          { isPrimary: false },
          { 
            where: { 
              productId,
              mediaType: 'video' 
            } 
          }
        );
      }

      // 批量创建
      const mediaData = mediaArray.map(media => ({
        productId,
        ...media
      }));

      const createdMedia = await ProductMedia.bulkCreate(mediaData);
      return createdMedia;
    } catch (error) {
      throw new Error(`批量添加媒体失败: ${error.message}`);
    }
  }

  // 更新媒体信息
  async updateMedia(mediaId, updateData) {
    try {
      const media = await ProductMedia.findByPk(mediaId);
      if (!media) {
        throw new Error('媒体不存在');
      }

      // 如果设置为主图，先将同类型其他主图取消
      if (updateData.isPrimary) {
        await ProductMedia.update(
          { isPrimary: false },
          { 
            where: { 
              productId: media.productId,
              mediaType: media.mediaType,
              id: { [Op.ne]: mediaId }
            } 
          }
        );
      }

      await media.update(updateData);
      return media;
    } catch (error) {
      throw new Error(`更新媒体失败: ${error.message}`);
    }
  }

  // 删除媒体
  async deleteMedia(mediaId) {
    try {
      const media = await ProductMedia.findByPk(mediaId);
      if (!media) {
        throw new Error('媒体不存在');
      }

      // 如果是本地上传的文件，删除文件
      if (media.source === 'upload' && media.mediaUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), media.mediaUrl);
        await fs.unlink(filePath).catch(() => {});
      }

      await media.destroy();
      return { success: true, message: '媒体已删除' };
    } catch (error) {
      throw new Error(`删除媒体失败: ${error.message}`);
    }
  }

  // 更新媒体排序
  async updateMediaOrder(productId, orderData) {
    try {
      const updates = orderData.map(item => 
        ProductMedia.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id, productId } }
        )
      );

      await Promise.all(updates);
      return { success: true, message: '排序已更新' };
    } catch (error) {
      throw new Error(`更新排序失败: ${error.message}`);
    }
  }

  // 从免费图库搜索图片
  async searchStockPhotos(query, source = 'unsplash') {
    try {
      let photos = [];

      switch (source) {
        case 'unsplash':
          photos = await this.searchUnsplash(query);
          break;
        case 'pexels':
          photos = await this.searchPexels(query);
          break;
        case 'pixabay':
          photos = await this.searchPixabay(query);
          break;
        default:
          throw new Error('不支持的图库来源');
      }

      return photos;
    } catch (error) {
      throw new Error(`搜索图库失败: ${error.message}`);
    }
  }

  // Unsplash API搜索
  async searchUnsplash(query) {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (!UNSPLASH_ACCESS_KEY) {
      throw new Error('请配置 Unsplash API Key');
    }

    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          per_page: 20,
          orientation: 'landscape'
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      return response.data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.thumb,
        description: photo.description || photo.alt_description,
        author: photo.user.name,
        authorUrl: photo.user.links.html,
        source: 'unsplash',
        license: 'Unsplash License',
        attribution: `Photo by ${photo.user.name} on Unsplash`
      }));
    } catch (error) {
      throw new Error(`Unsplash API错误: ${error.message}`);
    }
  }

  // Pexels API搜索
  async searchPexels(query) {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    if (!PEXELS_API_KEY) {
      throw new Error('请配置 Pexels API Key');
    }

    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query,
          per_page: 20,
          orientation: 'landscape'
        },
        headers: {
          Authorization: PEXELS_API_KEY
        }
      });

      return response.data.photos.map(photo => ({
        id: photo.id,
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        description: photo.alt,
        author: photo.photographer,
        authorUrl: photo.photographer_url,
        source: 'pexels',
        license: 'Pexels License',
        attribution: `Photo by ${photo.photographer} on Pexels`
      }));
    } catch (error) {
      throw new Error(`Pexels API错误: ${error.message}`);
    }
  }

  // Pixabay API搜索
  async searchPixabay(query) {
    const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
    if (!PIXABAY_API_KEY) {
      throw new Error('请配置 Pixabay API Key');
    }

    try {
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: PIXABAY_API_KEY,
          q: query,
          per_page: 20,
          image_type: 'photo',
          orientation: 'horizontal'
        }
      });

      return response.data.hits.map(photo => ({
        id: photo.id,
        url: photo.largeImageURL,
        thumbnailUrl: photo.previewURL,
        description: photo.tags,
        author: photo.user,
        authorUrl: `https://pixabay.com/users/${photo.user}-${photo.user_id}/`,
        source: 'pixabay',
        license: 'Pixabay License',
        attribution: `Image by ${photo.user} from Pixabay`
      }));
    } catch (error) {
      throw new Error(`Pixabay API错误: ${error.message}`);
    }
  }

  // 从URL添加外部媒体
  async addExternalMedia(productId, externalUrl, mediaInfo = {}) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 检测媒体类型
      const isVideo = /\.(mp4|webm|ogg)$/i.test(externalUrl);
      const mediaType = isVideo ? 'video' : 'image';

      const media = await ProductMedia.create({
        productId,
        mediaType,
        mediaUrl: externalUrl,
        source: 'external',
        ...mediaInfo
      });

      return media;
    } catch (error) {
      throw new Error(`添加外部媒体失败: ${error.message}`);
    }
  }
}

export default new ProductMediaService();