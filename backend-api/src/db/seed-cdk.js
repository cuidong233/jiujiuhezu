import { sequelize } from '../models/index.js';
import CDK from '../models/CDK.js';
import Product from '../models/Product.js';

// 生成CDK码
const generateCDKCode = (prefix = 'CDK', index) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix + '-';
  
  // 生成随机码
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += segment;
    if (i < 2) code += '-';
  }
  
  return code;
};

const seedData = async () => {
  try {
    console.log('开始创建测试数据...');
    
    // 先创建一些测试商品
    const products = await Product.bulkCreate([
      {
        id: 1,
        name: 'Netflix 12个月',
        cdkType: 'netflix',
        price: 299.00,
        status: 1,
        stock: 100,
        description: 'Netflix 12个月会员订阅',
        attributes: {
          tags: ['全球解锁', '4K高清', '支持杜比', '单月起售']
        }
      },
      {
        id: 2,
        name: 'Disney+ 6个月',
        cdkType: 'disney',
        price: 199.00,
        status: 1,
        stock: 50,
        description: 'Disney+ 6个月会员订阅',
        attributes: {
          tags: ['4K高清', '原创内容', '家庭共享', '半年优惠']
        }
      },
      {
        id: 3,
        name: 'Steam $100充值卡',
        cdkType: 'steam',
        price: 688.00,
        status: 1,
        stock: 30,
        description: 'Steam钱包充值卡 $100',
        attributes: {
          tags: ['即时到账', '全球通用', '官方渠道', '安全保障']
        }
      },
      {
        id: 4,
        name: 'Spotify 12个月',
        cdkType: 'spotify',
        price: 199.00,
        status: 1,
        stock: 40,
        description: 'Spotify Premium 12个月订阅',
        attributes: {
          tags: ['无广告', '高音质', '离线下载', '全球曲库']
        }
      }
    ], { 
      ignoreDuplicates: true 
    });
    
    console.log(`✅ 创建了 ${products.length} 个商品`);
    
    // 生成CDK数据
    const cdks = [];
    const now = new Date();
    
    // 为每个产品生成一些CDK
    const productConfigs = [
      { productId: 1, prefix: 'NETFLIX', count: 20, type: 'account' },
      { productId: 2, prefix: 'DISNEY', count: 15, type: 'account' },
      { productId: 3, prefix: 'STEAM', count: 10, type: 'recharge' },
      { productId: 4, prefix: 'SPOTIFY', count: 12, type: 'account' }
    ];
    
    for (const config of productConfigs) {
      for (let i = 0; i < config.count; i++) {
        const status = Math.random() > 0.7 ? 2 : (Math.random() > 0.4 ? 1 : 0); // 30%已使用，30%已售，40%未售
        
        cdks.push({
          productId: config.productId,
          cdkCode: generateCDKCode(config.prefix, i),
          cdkType: config.type,
          status: status,
          soldDate: status >= 1 ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
          usedDate: status === 2 ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
          expireDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 一年后过期
          remark: `测试CDK #${i + 1}`
        });
      }
    }
    
    // 批量插入CDK
    const createdCDKs = await CDK.bulkCreate(cdks, { 
      ignoreDuplicates: true 
    });
    
    console.log(`✅ 创建了 ${createdCDKs.length} 个CDK`);
    
    // 统计信息
    const stats = await CDK.count({
      group: ['status']
    });
    
    console.log('\n📊 CDK统计:');
    stats.forEach(stat => {
      const statusMap = {
        0: '未售',
        1: '已售',
        2: '已使用',
        3: '已过期',
        4: '已锁定'
      };
      console.log(`   ${statusMap[stat.status]}: ${stat.count}个`);
    });
    
    console.log('\n✅ 测试数据创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
    process.exit(1);
  }
};

// 运行种子数据
seedData();