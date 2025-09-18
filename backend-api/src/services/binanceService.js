import axios from 'axios';

class BinanceService {
  constructor() {
    // 币安公开API端点（不需要API密钥）
    this.baseURL = 'https://api.binance.com';
    this.cnBaseURL = 'https://api.binance.vision'; // 备用域名（中国可访问）
    
    // 缓存配置
    this.cache = new Map();
    this.cacheExpiry = 60000; // 缓存60秒
    
    // 配置axios实例，支持代理
    this.axiosInstance = axios.create();
    
    // 检查是否有代理配置
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      console.log('🌐 币安服务使用代理:', proxyUrl);
      
      // 简单的代理配置解析
      const proxyMatch = proxyUrl.match(/^(https?:\/\/)?([\w.-]+):(\d+)/);
      if (proxyMatch) {
        this.axiosInstance.defaults.proxy = {
          host: proxyMatch[2],
          port: parseInt(proxyMatch[3])
        };
      }
    }
  }

  /**
   * 获取USDT对CNY的实时汇率
   * 使用币安P2P市场数据
   * @returns {Promise<Object>} 汇率信息
   */
  async getUSDTtoCNYRate() {
    const cacheKey = 'USDT_CNY_RATE';
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // 获取币安P2P USDT/CNY买卖价格
      const response = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
        page: 1,
        rows: 10,
        payTypes: [],
        asset: 'USDT',
        tradeType: 'BUY', // 买入USDT（用CNY购买）
        fiat: 'CNY',
        merchantCheck: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        // 计算平均买入价
        const buyPrices = response.data.data.slice(0, 5).map(item => parseFloat(item.adv.price));
        const avgBuyPrice = buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length;

        // 获取卖出价格
        const sellResponse = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
          page: 1,
          rows: 10,
          payTypes: [],
          asset: 'USDT',
          tradeType: 'SELL', // 卖出USDT（换成CNY）
          fiat: 'CNY',
          merchantCheck: false
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        let avgSellPrice = avgBuyPrice; // 默认使用买入价
        if (sellResponse.data && sellResponse.data.data && sellResponse.data.data.length > 0) {
          const sellPrices = sellResponse.data.data.slice(0, 5).map(item => parseFloat(item.adv.price));
          avgSellPrice = sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length;
        }

        const result = {
          success: true,
          data: {
            buy: parseFloat(avgBuyPrice.toFixed(2)),  // CNY买入USDT的价格
            sell: parseFloat(avgSellPrice.toFixed(2)), // CNY卖出USDT的价格
            mid: parseFloat(((avgBuyPrice + avgSellPrice) / 2).toFixed(2)), // 中间价
            spread: parseFloat((avgBuyPrice - avgSellPrice).toFixed(2)), // 买卖价差
            source: 'Binance P2P',
            timestamp: new Date().toISOString()
          }
        };

        // 缓存结果
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }

      throw new Error('无法获取币安P2P汇率数据');
    } catch (error) {
      console.error('获取币安汇率失败:', error.message);
      
      // 返回备用汇率（基于市场常见汇率）
      return {
        success: false,
        data: {
          buy: 7.35,
          sell: 7.25,
          mid: 7.30,
          spread: 0.10,
          source: 'Fallback Rate',
          timestamp: new Date().toISOString()
        },
        error: error.message
      };
    }
  }

  /**
   * 获取指定交易对的实时价格
   * @param {String} symbol - 交易对，如 'BTCUSDT'
   * @returns {Promise<Object>} 价格信息
   */
  async getSymbolPrice(symbol) {
    const cacheKey = `PRICE_${symbol}`;
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // 使用币安公开API获取价格
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/price`, {
        params: { symbol }
      });

      const result = {
        success: true,
        data: {
          symbol: response.data.symbol,
          price: parseFloat(response.data.price),
          timestamp: new Date().toISOString()
        }
      };

      // 缓存结果
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      // 尝试使用备用域名
      try {
        const response = await axios.get(`${this.cnBaseURL}/api/v3/ticker/price`, {
          params: { symbol }
        });

        const result = {
          success: true,
          data: {
            symbol: response.data.symbol,
            price: parseFloat(response.data.price),
            timestamp: new Date().toISOString()
          }
        };

        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      } catch (fallbackError) {
        console.error('获取币安价格失败:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }

  /**
   * 获取24小时价格统计
   * @param {String} symbol - 交易对
   * @returns {Promise<Object>} 24小时统计
   */
  async get24hrStats(symbol) {
    const cacheKey = `STATS_${symbol}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/24hr`, {
        params: { symbol }
      });

      const result = {
        success: true,
        data: {
          symbol: response.data.symbol,
          priceChange: parseFloat(response.data.priceChange),
          priceChangePercent: parseFloat(response.data.priceChangePercent),
          lastPrice: parseFloat(response.data.lastPrice),
          highPrice: parseFloat(response.data.highPrice),
          lowPrice: parseFloat(response.data.lowPrice),
          volume: parseFloat(response.data.volume),
          quoteVolume: parseFloat(response.data.quoteVolume),
          openTime: new Date(response.data.openTime).toISOString(),
          closeTime: new Date(response.data.closeTime).toISOString()
        }
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('获取24小时统计失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取多个交易对的价格
   * @param {Array} symbols - 交易对数组
   * @returns {Promise<Object>} 价格列表
   */
  async getMultipleSymbolPrices(symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/price`);
      
      const prices = response.data
        .filter(item => symbols.includes(item.symbol))
        .map(item => ({
          symbol: item.symbol,
          price: parseFloat(item.price)
        }));

      return {
        success: true,
        data: prices,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取多个币种价格失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 将USDT金额转换为CNY
   * @param {Number} usdtAmount - USDT金额
   * @returns {Promise<Number>} CNY金额
   */
  async convertUSDTtoCNY(usdtAmount) {
    const rateInfo = await this.getUSDTtoCNYRate();
    if (rateInfo.success) {
      return parseFloat((usdtAmount * rateInfo.data.sell).toFixed(2));
    }
    return parseFloat((usdtAmount * 7.30).toFixed(2)); // 使用默认汇率
  }

  /**
   * 将CNY金额转换为USDT
   * @param {Number} cnyAmount - CNY金额
   * @returns {Promise<Number>} USDT金额
   */
  async convertCNYtoUSDT(cnyAmount) {
    const rateInfo = await this.getUSDTtoCNYRate();
    if (rateInfo.success) {
      return parseFloat((cnyAmount / rateInfo.data.buy).toFixed(2));
    }
    return parseFloat((cnyAmount / 7.35).toFixed(2)); // 使用默认汇率
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取充值记录列表
   */
  async getRechargeList({ page, pageSize, status, userId, startDate, endDate }) {
    try {
      // 导入模型
      const BinanceRecharge = (await import('../models/BinanceRecharge.js')).default;
      const { Op } = await import('sequelize');
      
      // 构建查询条件
      const where = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      // 查询数据
      const { count, rows } = await BinanceRecharge.findAndCountAll({
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']]
      });

      return {
        total: count,
        list: rows,
        page,
        pageSize
      };
    } catch (error) {
      console.error('获取充值记录失败:', error);
      // 返回模拟数据
      return {
        total: 0,
        list: [],
        page,
        pageSize
      };
    }
  }

  /**
   * 获取充值统计
   */
  async getRechargeStatistics() {
    try {
      // 导入模型
      const BinanceRecharge = (await import('../models/BinanceRecharge.js')).default;
      const { Op } = await import('sequelize');
      const sequelize = (await import('../db/sequelize.js')).default;
      
      // 今日开始时间
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // 统计今日充值笔数
      const todayCount = await BinanceRecharge.count({
        where: {
          createdAt: { [Op.gte]: todayStart }
        }
      });
      
      // 统计今日充值金额
      const todayAmount = await BinanceRecharge.sum('cnyAmount', {
        where: {
          createdAt: { [Op.gte]: todayStart },
          status: 'completed'
        }
      }) || 0;
      
      // 统计待处理订单
      const pendingCount = await BinanceRecharge.count({
        where: { status: 'pending' }
      });
      
      // 计算成功率
      const totalCount = await BinanceRecharge.count();
      const successCount = await BinanceRecharge.count({
        where: { status: 'completed' }
      });
      const successRate = totalCount > 0 ? (successCount / totalCount * 100) : 0;
      
      return {
        todayCount,
        todayAmount,
        pendingCount,
        successRate: successRate.toFixed(1)
      };
    } catch (error) {
      console.error('获取充值统计失败:', error);
      // 返回默认统计数据
      return {
        todayCount: 0,
        todayAmount: 0,
        pendingCount: 0,
        successRate: 0
      };
    }
  }

  /**
   * 更新汇率配置
   */
  async updateExchangeRate({ buy, sell, auto }) {
    try {
      // 这里可以保存到数据库或配置文件
      // 暂时只更新缓存
      const currentRate = await this.getUSDTtoCNYRate();
      if (currentRate.success) {
        currentRate.data.buy = buy || currentRate.data.buy;
        currentRate.data.sell = sell || currentRate.data.sell;
        currentRate.data.auto = auto !== undefined ? auto : true;
        this.cache.set('USDT_CNY_RATE', currentRate.data);
      }
      return currentRate.data;
    } catch (error) {
      console.error('更新汇率配置失败:', error);
      throw error;
    }
  }
}

export default new BinanceService();