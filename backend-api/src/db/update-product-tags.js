import sequelize from './sequelize.js';

const updateProductTags = async () => {
  try {
    console.log('开始更新商品标签...');
    
    // 直接使用SQL更新
    const updates = [
      {
        id: 1,
        tags: JSON.stringify({ tags: ['全球解锁', '4K高清', '支持杜比', '单月起售'] })
      },
      {
        id: 2,
        tags: JSON.stringify({ tags: ['4K高清', '原创内容', '家庭共享', '半年优惠'] })
      },
      {
        id: 3,
        tags: JSON.stringify({ tags: ['即时到账', '全球通用', '官方渠道', '安全保障'] })
      },
      {
        id: 4,
        tags: JSON.stringify({ tags: ['无广告', '高音质', '离线下载', '全球曲库'] })
      },
      {
        id: 5,
        tags: JSON.stringify({ tags: ['全球解锁', '高速稳定', '多设备', '优质节点'] })
      }
    ];
    
    for (const update of updates) {
      try {
        await sequelize.query(
          `UPDATE pr_goods SET attributes = :tags WHERE goods_id = :id`,
          {
            replacements: { 
              tags: update.tags,
              id: update.id 
            },
            type: sequelize.QueryTypes.UPDATE
          }
        );
        console.log(`✅ 更新商品 ${update.id} 的标签成功`);
      } catch (err) {
        console.log(`⚠️ 商品 ${update.id} 可能不存在，跳过`);
      }
    }
    
    console.log('✅ 商品标签更新完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
};

updateProductTags();