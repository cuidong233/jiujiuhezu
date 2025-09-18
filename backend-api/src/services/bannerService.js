import pool from '../db/database.js';

export const bannerService = {
  // 获取轮播图列表
  async getBannerList() {
    try {
      const sql = `
        SELECT 
          id,
          img as image,
          link,
          title,
          order_num as sort_order,
          is_visible as status
        FROM pr_banner
        WHERE is_visible = 1
        ORDER BY order_num ASC, id DESC
      `;

      const [rows] = await pool.execute(sql);

      // 如果没有banner数据，返回默认数据
      if (rows.length === 0) {
        return {
          success: true,
          data: [
            {
              id: 1,
              image: '/images/banner.png',
              link: '',
              title: '凡图拉 - 优质商品平台',
              description: '提供优质虚拟产品CDK服务'
            }
          ]
        };
      }

      // 过滤并替换外部占位符URL为本地默认图片
      const processedRows = rows.map(row => {
        if (row.image && row.image.includes('via.placeholder.com')) {
          row.image = '/images/banner.png';
        }
        return row;
      });

      return {
        success: true,
        data: processedRows
      };
    } catch (error) {
      console.error('获取轮播图失败:', error);
      // 返回默认数据，避免前端报错
      return {
        success: true,
        data: [
          {
            id: 1,
            image: '/images/banner.png',
            link: '',
            title: '凡图拉 - 优质商品平台',
            description: '提供优质虚拟产品CDK服务'
          }
        ]
      };
    }
  }
};

export default bannerService;