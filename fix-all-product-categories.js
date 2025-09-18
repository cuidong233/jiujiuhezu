import mysql from 'mysql2/promise';

async function fixAllProductCategories() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jiujiu_admin'
  });

  try {
    console.log('连接数据库成功');

    // 1. 首先查看当前的分类分布
    console.log('\n=== 修复前的商品分类分布 ===');
    const [beforeDistribution] = await connection.execute(
      'SELECT category_id, COUNT(*) as count FROM pr_goods GROUP BY category_id ORDER BY category_id'
    );
    console.table(beforeDistribution);

    // 2. 根据商品名称更新所有商品的分类（不管原来的分类是什么）
    console.log('\n=== 开始重新分配商品分类 ===');

    // 视频音乐类 (category_id = 3)
    const videoKeywords = [
      'Netflix', 'Disney', 'YouTube', 'Spotify', 'Apple TV', 'HBO', 
      '音乐', '视频', '影视', 'Prime Video', 'Hulu', 'Paramount',
      '爱奇艺', '腾讯视频', '优酷', '芒果TV'
    ];
    
    for (const keyword of videoKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 3 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到视频音乐分类`);
      }
    }

    // 游戏类 (category_id = 9)
    const gameKeywords = [
      'Steam', '游戏', 'Game', 'Xbox', 'PlayStation', 'Nintendo', 
      'Epic', 'Origin', 'Battle.net', 'Uplay', 'GOG', 'PSN'
    ];
    
    for (const keyword of gameKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 9 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到游戏分类`);
      }
    }

    // Vtuber类 (category_id = 4)
    const vtuberKeywords = [
      'Vtuber', '虚拟主播', 'B站', 'bilibili', 'Twitch', '直播',
      'VTuber', 'Hololive', 'Nijisanji'
    ];
    
    for (const keyword of vtuberKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 4 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到Vtuber分类`);
      }
    }

    // 代充代付类 (category_id = 8)
    const rechargeKeywords = [
      '代充', '充值', '代付', '话费', '流量', 'Recharge', 'Top-up',
      '支付宝', '微信', 'PayPal', '代购'
    ];
    
    for (const keyword of rechargeKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 8 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到代充代付分类`);
      }
    }

    // 卡券类 (category_id = 10)
    const cardKeywords = [
      '优惠券', '代金券', '礼品卡', 'Gift Card', '卡券', 
      'Coupon', 'Voucher', '抵用券', '折扣券'
    ];
    
    for (const keyword of cardKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 10 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到卡券分类`);
      }
    }

    // 福利社类 (category_id = 11)
    const welfareKeywords = [
      '福利', '特价', '限时', '秒杀', 'Sale', 'Discount', 
      '折扣', '优惠', '促销', '清仓'
    ];
    
    for (const keyword of welfareKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 11 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到福利社分类`);
      }
    }

    // AI和工具类归类到视频音乐类（因为它们都是数字服务）
    const aiKeywords = [
      'ChatGPT', 'Midjourney', 'AI', 'Grammarly', 'Claude', 
      'Copilot', 'GPT', 'Stable Diffusion', 'DALL-E'
    ];
    
    for (const keyword of aiKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 3 WHERE title LIKE ?',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到视频音乐分类（数字服务）`);
      }
    }

    // 处理可能还没有分类或使用旧分类ID的商品
    // 将旧分类ID (1, 2等) 迁移到新分类
    const categoryMapping = [
      { old: 1, new: 3, name: '影音类商品迁移到视频音乐' },
      { old: 2, new: 9, name: '游戏类商品迁移到游戏分类' },
      { old: 0, new: 3, name: '未分类商品设为视频音乐' },
      { old: null, new: 3, name: 'NULL分类商品设为视频音乐' }
    ];

    for (const mapping of categoryMapping) {
      let query, params;
      if (mapping.old === null) {
        query = 'UPDATE pr_goods SET category_id = ? WHERE category_id IS NULL';
        params = [mapping.new];
      } else {
        query = 'UPDATE pr_goods SET category_id = ? WHERE category_id = ?';
        params = [mapping.new, mapping.old];
      }
      
      const [result] = await connection.execute(query, params);
      if (result.affectedRows > 0) {
        console.log(`✅ ${mapping.name}: ${result.affectedRows} 个商品`);
      }
    }

    // 确保没有使用不存在的分类ID
    const validCategoryIds = [3, 4, 8, 9, 10, 11];
    const [invalidCategories] = await connection.execute(
      `UPDATE pr_goods SET category_id = 3 
       WHERE category_id NOT IN (${validCategoryIds.join(',')})`
    );
    if (invalidCategories.affectedRows > 0) {
      console.log(`✅ 修复 ${invalidCategories.affectedRows} 个使用无效分类的商品`);
    }

    // 3. 查看修复后的分类分布
    console.log('\n=== 修复后的商品分类分布 ===');
    const [afterDistribution] = await connection.execute(
      `SELECT 
        c.id as category_id,
        c.category_name,
        COUNT(g.id) as product_count
      FROM pr_category c
      LEFT JOIN pr_goods g ON c.id = g.category_id
      WHERE c.id IN (3, 4, 8, 9, 10, 11)
      GROUP BY c.id, c.category_name
      ORDER BY c.id`
    );
    console.table(afterDistribution);

    // 4. 显示每个分类的商品列表
    console.log('\n=== 每个分类的商品列表 ===');
    for (const category of afterDistribution) {
      if (category.product_count > 0) {
        const [products] = await connection.execute(
          'SELECT id, title FROM pr_goods WHERE category_id = ? ORDER BY id',
          [category.category_id]
        );
        console.log(`\n${category.category_name} (${category.product_count}个商品):`);
        products.forEach(product => {
          console.log(`  [${product.id}] ${product.title}`);
        });
      }
    }

    console.log('\n✅ 所有商品分类已修复完成！');

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

// 执行修复
fixAllProductCategories();