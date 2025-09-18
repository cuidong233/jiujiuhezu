import express from 'express';
import productMediaService, { upload } from '../services/productMediaService.js';

const router = express.Router();

// 获取商品的所有媒体
router.get('/products/:productId/media', async (req, res) => {
  try {
    const { productId } = req.params;
    const media = await productMediaService.getProductMedia(productId);
    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 添加单个媒体到商品
router.post('/products/:productId/media', async (req, res) => {
  try {
    const { productId } = req.params;
    const mediaData = req.body;
    
    const media = await productMediaService.addMediaToProduct(productId, mediaData);
    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 批量添加媒体
router.post('/products/:productId/media/bulk', async (req, res) => {
  try {
    const { productId } = req.params;
    const { media } = req.body;
    
    if (!Array.isArray(media)) {
      return res.status(400).json({
        success: false,
        message: '请提供媒体数组'
      });
    }
    
    const createdMedia = await productMediaService.bulkAddMedia(productId, media);
    res.status(201).json({
      success: true,
      data: createdMedia
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 上传媒体文件
router.post('/products/:productId/media/upload', 
  upload.single('file'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      const { productId } = req.params;
      const { title, alt, isPrimary } = req.body;
      
      // 构建文件URL
      const mediaUrl = `/uploads/products/${req.file.filename}`;
      const isVideo = /\.(mp4|webm|ogg)$/i.test(req.file.originalname);
      
      const mediaData = {
        mediaType: isVideo ? 'video' : 'image',
        mediaUrl,
        title,
        alt,
        isPrimary: isPrimary === 'true',
        source: 'upload',
        metadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      };
      
      const media = await productMediaService.addMediaToProduct(productId, mediaData);
      res.status(201).json({
        success: true,
        data: media
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 批量上传媒体文件
router.post('/products/:productId/media/upload-multiple',
  upload.array('files', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      const { productId } = req.params;
      const mediaArray = req.files.map((file, index) => {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(file.originalname);
        return {
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: `/uploads/products/${file.filename}`,
          isPrimary: index === 0 && !req.body.isPrimary ? true : false,
          source: 'upload',
          sortOrder: index,
          metadata: {
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          }
        };
      });
      
      const createdMedia = await productMediaService.bulkAddMedia(productId, mediaArray);
      res.status(201).json({
        success: true,
        data: createdMedia
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 搜索免费图库
router.get('/media/search-stock', async (req, res) => {
  try {
    const { query, source = 'unsplash' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }
    
    const photos = await productMediaService.searchStockPhotos(query, source);
    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 从图库添加图片到商品
router.post('/products/:productId/media/from-stock', async (req, res) => {
  try {
    const { productId } = req.params;
    const { url, thumbnailUrl, title, alt, author, source, license, attribution } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: '请提供图片URL'
      });
    }
    
    const mediaData = {
      mediaType: 'image',
      mediaUrl: url,
      thumbnailUrl,
      title,
      alt,
      source,
      license,
      attribution
    };
    
    const media = await productMediaService.addMediaToProduct(productId, mediaData);
    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 添加外部媒体URL
router.post('/products/:productId/media/external', async (req, res) => {
  try {
    const { productId } = req.params;
    const { url, title, alt, isPrimary } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: '请提供媒体URL'
      });
    }
    
    const mediaInfo = { title, alt, isPrimary };
    const media = await productMediaService.addExternalMedia(productId, url, mediaInfo);
    
    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 更新媒体信息
router.put('/media/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const updateData = req.body;
    
    const media = await productMediaService.updateMedia(mediaId, updateData);
    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 删除媒体
router.delete('/media/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const result = await productMediaService.deleteMedia(mediaId);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 更新媒体排序
router.put('/products/:productId/media/reorder', async (req, res) => {
  try {
    const { productId } = req.params;
    const { order } = req.body;
    
    if (!Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        message: '请提供排序数组'
      });
    }
    
    const result = await productMediaService.updateMediaOrder(productId, order);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;