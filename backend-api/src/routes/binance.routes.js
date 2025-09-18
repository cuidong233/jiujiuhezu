import express from 'express';
import binanceService from '../services/binanceService.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * 获取USDT对CNY的实时汇率
 * GET /api/binance/rate/usdt-cny
 */
router.get('/rate/usdt-cny', async (req, res) => {
  try {
    const result = await binanceService.getUSDTtoCNYRate();
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.json({
        code: -1,
        message: '获取汇率失败，使用备用汇率',
        data: result.data
      });
    }
  } catch (error) {
    console.error('获取USDT/CNY汇率异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取指定交易对价格
 * GET /api/binance/price/:symbol
 */
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await binanceService.getSymbolPrice(symbol.toUpperCase());
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        code: -1,
        message: result.error || '获取价格失败'
      });
    }
  } catch (error) {
    console.error('获取币价异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取24小时价格统计
 * GET /api/binance/stats/:symbol
 */
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await binanceService.get24hrStats(symbol.toUpperCase());
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        code: -1,
        message: result.error || '获取统计数据失败'
      });
    }
  } catch (error) {
    console.error('获取统计数据异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取多个币种价格
 * GET /api/binance/prices
 */
router.get('/prices', async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolList = symbols ? symbols.split(',').map(s => s.toUpperCase()) : undefined;
    const result = await binanceService.getMultipleSymbolPrices(symbolList);
    
    if (result.success) {
      res.json({
        code: 0,
        message: 'success',
        data: result.data
      });
    } else {
      res.status(400).json({
        code: -1,
        message: result.error || '获取价格失败'
      });
    }
  } catch (error) {
    console.error('获取多币种价格异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * USDT转CNY
 * POST /api/binance/convert/usdt-to-cny
 */
router.post('/convert/usdt-to-cny', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        code: -1,
        message: '请输入有效金额'
      });
    }
    
    const cnyAmount = await binanceService.convertUSDTtoCNY(amount);
    const rateInfo = await binanceService.getUSDTtoCNYRate();
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        usdtAmount: amount,
        cnyAmount: cnyAmount,
        rate: rateInfo.data.sell,
        source: rateInfo.data.source,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('USDT转CNY异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * CNY转USDT
 * POST /api/binance/convert/cny-to-usdt
 */
router.post('/convert/cny-to-usdt', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        code: -1,
        message: '请输入有效金额'
      });
    }
    
    const usdtAmount = await binanceService.convertCNYtoUSDT(amount);
    const rateInfo = await binanceService.getUSDTtoCNYRate();
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        cnyAmount: amount,
        usdtAmount: usdtAmount,
        rate: rateInfo.data.buy,
        source: rateInfo.data.source,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('CNY转USDT异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 清除缓存
 * POST /api/binance/cache/clear
 */
router.post('/cache/clear', async (req, res) => {
  try {
    binanceService.clearCache();
    res.json({
      code: 0,
      message: '缓存已清除'
    });
  } catch (error) {
    console.error('清除缓存异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取充值记录列表
 * GET /api/binance/recharge/list
 */
router.get('/recharge/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, userId, startDate, endDate } = req.query;
    const result = await binanceService.getRechargeList({
      page: Number(page),
      pageSize: Number(pageSize),
      status,
      userId,
      startDate,
      endDate
    });
    
    res.json({
      code: 0,
      message: 'success',
      data: result
    });
  } catch (error) {
    console.error('获取充值记录异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 获取充值统计
 * GET /api/binance/recharge/statistics
 */
router.get('/recharge/statistics', async (req, res) => {
  try {
    const statistics = await binanceService.getRechargeStatistics();
    
    res.json({
      code: 0,
      message: 'success',
      data: statistics
    });
  } catch (error) {
    console.error('获取充值统计异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 更新汇率配置
 * PUT /api/binance/exchange-rate
 */
router.put('/exchange-rate', async (req, res) => {
  try {
    const { buy, sell, auto } = req.body;
    const result = await binanceService.updateExchangeRate({ buy, sell, auto });
    
    res.json({
      code: 0,
      message: '汇率配置更新成功',
      data: result
    });
  } catch (error) {
    console.error('更新汇率配置异常:', error);
    res.status(500).json({
      code: -1,
      message: '服务器错误'
    });
  }
});

/**
 * 创建币安支付订单
 * POST /api/binance/pay/create
 */
router.post('/pay/create',
  [
    body('orderNo').notEmpty().withMessage('订单号不能为空'),
    body('amount').isNumeric().withMessage('金额必须是数字'),
    body('currency').optional().isIn(['USDT', 'BUSD', 'BNB']).withMessage('不支持的币种')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const { orderNo, amount, currency = 'USDT', description } = req.body;
      
      // 获取当前汇率
      const rateInfo = await binanceService.getUSDTtoCNYRate();
      const usdtAmount = (Number(amount) / rateInfo.data.rate).toFixed(2);
      
      // 生成币安支付链接（这里需要根据实际的币安支付API进行调整）
      // 暂时返回一个模拟的支付链接
      const paymentUrl = `https://pay.binance.com/checkout?orderNo=${orderNo}&amount=${usdtAmount}&currency=${currency}`;
      
      res.json({
        code: 0,
        msg: 'success',
        success: true,
        data: paymentUrl
      });
      
    } catch (error) {
      console.error('创建币安支付订单异常:', error);
      res.status(500).json({
        code: -1,
        msg: '服务器错误',
        success: false
      });
    }
  }
);

export default router;