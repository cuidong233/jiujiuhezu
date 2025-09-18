import mysql from 'mysql2/promise';

async function updateProductCategories() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jiujiu_admin'
  });

  try {
    console.log('连接数据库成功');

    // 1. 查看当前商品的分类分布
    console.log('\n=== 当前商品分类分布 ===');
    const [currentDistribution] = await connection.execute(
      'SELECT category_id, COUNT(*) as count FROM pr_goods GROUP BY category_id'
    );
    console.table(currentDistribution);

    // 2. 查看所有商品
    console.log('\n=== 所有商品列表 ===');
    const [products] = await connection.execute(
      'SELECT id, title, category_id FROM pr_goods ORDER BY id'
    );
    console.table(products);

    // 3. 根据商品名称更新分类
    console.log('\n=== 开始更新商品分类 ===');

    // 视频音乐类 (category_id = 3)
    const videoKeywords = ['Netflix', 'Disney', 'YouTube', 'Spotify', 'Apple TV', 'HBO', '音乐', '视频', '影视', 'Prime Video', 'Hulu'];
    for (const keyword of videoKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 3 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到视频音乐分类`);
      }
    }

    // Vtuber类 (category_id = 4)
    const vtuberKeywords = ['Vtuber', '虚拟主播', 'B站', 'bilibili', 'Twitch', '直播'];
    for (const keyword of vtuberKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 4 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到Vtuber分类`);
      }
    }

    // 代充代付类 (category_id = 8)
    const rechargeKeywords = ['代充', '充值', '代付', '话费', '流量', 'Recharge', 'Top-up'];
    for (const keyword of rechargeKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 8 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到代充代付分类`);
      }
    }

    // 游戏类 (category_id = 9)
    const gameKeywords = ['Steam', '游戏', 'Game', 'Xbox', 'PlayStation', 'Nintendo', 'Epic', 'Origin', 'Battle.net', 'Uplay'];
    for (const keyword of gameKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 9 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到游戏分类`);
      }
    }

    // 卡券类 (category_id = 10)
    const cardKeywords = ['优惠券', '代金券', '礼品卡', 'Gift Card', '券', '卡', 'Coupon', 'Voucher'];
    for (const keyword of cardKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 10 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到卡券分类`);
      }
    }

    // 福利社类 (category_id = 11)
    const welfareKeywords = ['福利', '特价', '限时', '秒杀', 'Sale', 'Discount', '折扣'];
    for (const keyword of welfareKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 11 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到福利社分类`);
      }
    }

    // AI和工具类归类到视频音乐类
    const aiKeywords = ['ChatGPT', 'Midjourney', 'AI', 'Grammarly', 'Claude', 'Copilot', 'GPT'];
    for (const keyword of aiKeywords) {
      const [result] = await connection.execute(
        'UPDATE pr_goods SET category_id = 3 WHERE title LIKE ? AND (category_id IS NULL OR category_id = 0)',
        [`%${keyword}%`]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ 更新 ${result.affectedRows} 个包含 "${keyword}" 的商品到视频音乐分类`);
      }
    }

    // 对于没有分类的商品，设置默认分类为视频音乐(3)
    const [defaultUpdate] = await connection.execute(
      'UPDATE pr_goods SET category_id = 3 WHERE category_id IS NULL OR category_id = 0'
    );
    if (defaultUpdate.affectedRows > 0) {
      console.log(`✅ 更新 ${defaultUpdate.affectedRows} 个未分类商品到默认分类（视频音乐）`);
    }

    // 4. 查看更新后的分类分布
    console.log('\n=== 更新后的商品分类分布 ===');
    const [newDistribution] = await connection.execute(
      `SELECT 
        c.id as category_id,
        c.category_name,
        COUNT(g.id) as product_count
      FROM pr_category c
      LEFT JOIN pr_goods g ON c.id = g.category_id
      GROUP BY c.id, c.category_name
      ORDER BY c.id`
    );
    console.table(newDistribution);

    // 5. 显示每个分类的部分商品
    console.log('\n=== 每个分类的商品示例 ===');
    for (const category of newDistribution) {
      if (category.product_count > 0) {
        const [samples] = await connection.execute(
          'SELECT title FROM pr_goods WHERE category_id = ? LIMIT 3',
          [category.category_id]
        );
        console.log(`\n${category.category_name} (${category.product_count}个商品):`);
        samples.forEach(product => {
          console.log(`  - ${product.title}`);
        });
      }
    }

    console.log('\n✅ 商品分类更新完成！');

  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

// 执行更新
updateProductCategories();