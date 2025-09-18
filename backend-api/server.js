const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs-extra')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const app = express()
const port = 3000
const DATA_DIR = path.join(__dirname, 'data')

// 确保数据目录存在
fs.ensureDirSync(DATA_DIR)

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 数据文件路径
const DATA_FILES = {
  questions: path.join(DATA_DIR, 'questions.json'),
  categories: path.join(DATA_DIR, 'categories.json'),
  work: path.join(DATA_DIR, 'work.json'),
  binance: path.join(DATA_DIR, 'binance.json'),
  vip: path.join(DATA_DIR, 'vip.json'),
  withdraw: path.join(DATA_DIR, 'withdraw.json')
}

// 初始化数据文件
function initDataFiles() {
  // 初始化问题数据
  if (!fs.existsSync(DATA_FILES.questions)) {
    fs.writeJsonSync(DATA_FILES.questions, [
      {
        id: '1',
        title: '如何充值到账户？',
        category: 'recharge',
        categoryName: '充值相关',
        question: '请问如何给我的账户充值？支持哪些充值方式？',
        answer: '您可以通过以下方式充值：\n1. 支付宝充值：进入个人中心-钱包-充值，选择支付宝支付\n2. 微信充值：进入个人中心-钱包-充值，选择微信支付\n3. 银行卡充值：进入个人中心-钱包-充值，选择银行卡支付\n4. 币安支付：进入个人中心-钱包-充值，选择币安支付（支持USDT）\n\n充值一般实时到账，如有延迟请联系客服。',
        keywords: ['充值', '支付', '到账'],
        views: 15680,
        helpful: 1423,
        notHelpful: 56,
        status: 'active',
        isTop: true,
        isHot: true,
        order: 1,
        createdBy: 'admin',
        createdTime: '2024-06-01 10:00:00',
        updatedTime: '2024-12-01 10:00:00'
      }
    ])
  }

  // 初始化分类数据
  if (!fs.existsSync(DATA_FILES.categories)) {
    fs.writeJsonSync(DATA_FILES.categories, [
      {
        id: '1',
        code: 'recharge',
        name: '充值相关',
        description: '充值方式、到账时间等问题',
        icon: 'wallet',
        order: 1,
        questionCount: 5,
        status: 'active'
      },
      {
        id: '2',
        code: 'withdraw',
        name: '提现相关',
        description: '提现流程、手续费、到账时间等',
        icon: 'bank',
        order: 2,
        questionCount: 4,
        status: 'active'
      },
      {
        id: '3',
        code: 'vip',
        name: 'VIP相关',
        description: 'VIP等级、权益、升级等',
        icon: 'crown',
        order: 3,
        questionCount: 3,
        status: 'active'
      }
    ])
  }

  // 初始化工单数据
  if (!fs.existsSync(DATA_FILES.work)) {
    fs.writeJsonSync(DATA_FILES.work, [])
  }

  // 初始化其他数据文件
  Object.values(DATA_FILES).forEach(file => {
    if (!fs.existsSync(file)) {
      fs.writeJsonSync(file, [])
    }
  })
}

// 初始化数据
initDataFiles()

// ============= 问题管理 API =============

// 获取问题列表
app.get('/api/question/list', (req, res) => {
  try {
    const { page = 1, pageSize = 10, category, status, keyword } = req.query
    let questions = fs.readJsonSync(DATA_FILES.questions)
    
    // 过滤
    if (category) {
      questions = questions.filter(item => item.category === category)
    }
    if (status) {
      questions = questions.filter(item => item.status === status)
    }
    if (keyword) {
      questions = questions.filter(item => 
        item.title.includes(keyword) || 
        item.question.includes(keyword) ||
        item.answer.includes(keyword)
      )
    }
    
    // 排序
    questions.sort((a, b) => a.order - b.order)
    
    // 分页
    const total = questions.length
    const startIndex = (Number(page) - 1) * Number(pageSize)
    const endIndex = startIndex + Number(pageSize)
    const paginatedList = questions.slice(startIndex, endIndex)
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: paginatedList,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 获取分类
app.get('/api/question/categories', (req, res) => {
  try {
    const categories = fs.readJsonSync(DATA_FILES.categories)
    res.json({
      code: 0,
      message: 'success',
      data: categories
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 获取单个问题
app.get('/api/question/:id', (req, res) => {
  try {
    const questions = fs.readJsonSync(DATA_FILES.questions)
    const question = questions.find(q => q.id === req.params.id)
    
    if (!question) {
      return res.status(404).json({ code: 404, message: '问题不存在' })
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: question
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 创建问题
app.post('/api/question/create', (req, res) => {
  try {
    const questions = fs.readJsonSync(DATA_FILES.questions)
    const newQuestion = {
      id: uuidv4(),
      ...req.body,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    }
    
    questions.push(newQuestion)
    fs.writeJsonSync(DATA_FILES.questions, questions)
    
    res.json({
      code: 0,
      message: '问题创建成功',
      data: newQuestion
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 更新问题
app.put('/api/question/:id', (req, res) => {
  try {
    const questions = fs.readJsonSync(DATA_FILES.questions)
    const index = questions.findIndex(q => q.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '问题不存在' })
    }
    
    questions[index] = {
      ...questions[index],
      ...req.body,
      updatedTime: new Date().toISOString()
    }
    
    fs.writeJsonSync(DATA_FILES.questions, questions)
    
    res.json({
      code: 0,
      message: '问题更新成功',
      data: questions[index]
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 删除问题
app.delete('/api/question/:id', (req, res) => {
  try {
    let questions = fs.readJsonSync(DATA_FILES.questions)
    questions = questions.filter(q => q.id !== req.params.id)
    fs.writeJsonSync(DATA_FILES.questions, questions)
    
    res.json({
      code: 0,
      message: '问题删除成功',
      data: { id: req.params.id }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// ============= 工单管理 API =============

// 获取工单列表
app.get('/api/work/list', (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, type, priority } = req.query
    let workList = fs.readJsonSync(DATA_FILES.work)
    
    // 如果没有数据，创建一些示例数据
    if (workList.length === 0) {
      workList = [
        {
          id: '1',
          orderNo: `WO${Date.now()}1`,
          title: '账号无法登录',
          type: 'account',
          status: 'pending',
          priority: 'high',
          description: '用户反馈无法正常登录账号',
          userId: 'user_001',
          userName: '张三',
          userPhone: '13800138000',
          assignee: 'admin',
          assigneeName: '管理员',
          images: [],
          reply: '',
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString()
        }
      ]
      fs.writeJsonSync(DATA_FILES.work, workList)
    }
    
    // 过滤
    if (status) {
      workList = workList.filter(item => item.status === status)
    }
    if (type) {
      workList = workList.filter(item => item.type === type)
    }
    if (priority) {
      workList = workList.filter(item => item.priority === priority)
    }
    
    // 分页
    const total = workList.length
    const startIndex = (Number(page) - 1) * Number(pageSize)
    const endIndex = startIndex + Number(pageSize)
    const paginatedList = workList.slice(startIndex, endIndex)
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: paginatedList,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 创建工单
app.post('/api/work/create', (req, res) => {
  try {
    const workList = fs.readJsonSync(DATA_FILES.work)
    const newWork = {
      id: uuidv4(),
      orderNo: `WO${Date.now()}`,
      ...req.body,
      status: 'pending',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      closedTime: null
    }
    
    workList.push(newWork)
    fs.writeJsonSync(DATA_FILES.work, workList)
    
    res.json({
      code: 0,
      message: '工单创建成功',
      data: newWork
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 更新工单
app.put('/api/work/:id', (req, res) => {
  try {
    const workList = fs.readJsonSync(DATA_FILES.work)
    const index = workList.findIndex(w => w.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '工单不存在' })
    }
    
    workList[index] = {
      ...workList[index],
      ...req.body,
      updatedTime: new Date().toISOString()
    }
    
    fs.writeJsonSync(DATA_FILES.work, workList)
    
    res.json({
      code: 0,
      message: '工单更新成功',
      data: workList[index]
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 工单回复
app.post('/api/work/reply', (req, res) => {
  try {
    const { workId, content, operator, operatorId } = req.body
    
    const replyData = {
      id: uuidv4(),
      workId,
      content,
      operator,
      operatorId,
      time: new Date().toISOString(),
      type: 'reply'
    }
    
    res.json({
      code: 0,
      message: '回复成功',
      data: replyData
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// ============= 币安管理 API =============

// 获取充值记录列表
app.get('/api/binance/rechargeRecords', (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, userId } = req.query
    let binanceData = fs.readJsonSync(DATA_FILES.binance)
    
    if (!binanceData.rechargeRecords) {
      binanceData.rechargeRecords = [
        {
          id: '1',
          orderId: `BR${Date.now()}1`,
          userId: 'user_001',
          userName: '张三',
          amount: 1000,
          currency: 'USDT',
          txHash: '0xabc...def',
          status: 'completed',
          address: 'TRX123...456',
          network: 'TRC20',
          fee: 1,
          actualAmount: 999,
          exchangeRate: 7.2,
          cnyAmount: 7192.8,
          createdTime: '2024-12-20 10:00:00',
          completedTime: '2024-12-20 10:05:00'
        }
      ]
      fs.writeJsonSync(DATA_FILES.binance, binanceData)
    }
    
    let records = binanceData.rechargeRecords || []
    
    // 过滤
    if (status) {
      records = records.filter(item => item.status === status)
    }
    if (userId) {
      records = records.filter(item => item.userId === userId)
    }
    
    // 分页
    const total = records.length
    const startIndex = (Number(page) - 1) * Number(pageSize)
    const endIndex = startIndex + Number(pageSize)
    const paginatedList = records.slice(startIndex, endIndex)
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: paginatedList,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 获取汇率设置
app.get('/api/binance/exchangeRate', (req, res) => {
  try {
    let binanceData = fs.readJsonSync(DATA_FILES.binance)
    
    if (!binanceData.exchangeRate) {
      binanceData.exchangeRate = {
        USDT_CNY: 7.2,
        BTC_USDT: 43000,
        ETH_USDT: 2200,
        BNB_USDT: 320,
        autoUpdate: true,
        updateInterval: 60,
        lastUpdate: new Date().toISOString()
      }
      fs.writeJsonSync(DATA_FILES.binance, binanceData)
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: binanceData.exchangeRate
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 更新汇率
app.put('/api/binance/exchangeRate', (req, res) => {
  try {
    let binanceData = fs.readJsonSync(DATA_FILES.binance)
    binanceData.exchangeRate = {
      ...binanceData.exchangeRate,
      ...req.body,
      lastUpdate: new Date().toISOString()
    }
    fs.writeJsonSync(DATA_FILES.binance, binanceData)
    
    res.json({
      code: 0,
      message: '汇率更新成功',
      data: binanceData.exchangeRate
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 获取统计数据
app.get('/api/binance/statistics', (req, res) => {
  try {
    let binanceData = fs.readJsonSync(DATA_FILES.binance)
    const records = binanceData.rechargeRecords || []
    
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = records.filter(r => r.createdTime && r.createdTime.startsWith(today))
    
    const statistics = {
      todayRecharge: todayRecords.reduce((sum, r) => sum + (r.actualAmount || 0), 0),
      todayCount: todayRecords.length,
      totalRecharge: records.reduce((sum, r) => sum + (r.actualAmount || 0), 0),
      totalCount: records.length,
      pendingCount: records.filter(r => r.status === 'pending').length,
      completedCount: records.filter(r => r.status === 'completed').length,
      failedCount: records.filter(r => r.status === 'failed').length,
      currencyStats: [
        { currency: 'USDT', amount: records.filter(r => r.currency === 'USDT').reduce((sum, r) => sum + r.actualAmount, 0) },
        { currency: 'BTC', amount: records.filter(r => r.currency === 'BTC').reduce((sum, r) => sum + r.actualAmount, 0) },
        { currency: 'ETH', amount: records.filter(r => r.currency === 'ETH').reduce((sum, r) => sum + r.actualAmount, 0) }
      ]
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: statistics
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 用户充值
app.post('/api/binance/userRecharge', (req, res) => {
  try {
    let binanceData = fs.readJsonSync(DATA_FILES.binance)
    if (!binanceData.rechargeRecords) {
      binanceData.rechargeRecords = []
    }
    
    const newRecord = {
      id: uuidv4(),
      orderId: `BR${Date.now()}`,
      ...req.body,
      status: 'pending',
      createdTime: new Date().toISOString(),
      completedTime: null
    }
    
    binanceData.rechargeRecords.push(newRecord)
    fs.writeJsonSync(DATA_FILES.binance, binanceData)
    
    res.json({
      code: 0,
      message: '充值记录创建成功',
      data: newRecord
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// ============= VIP管理 API =============

// 获取VIP用户列表
app.get('/api/vip/list', (req, res) => {
  try {
    const { page = 1, pageSize = 10, level, status } = req.query
    let vipData = fs.readJsonSync(DATA_FILES.vip)
    
    if (vipData.length === 0) {
      vipData = [
        {
          id: '1',
          userId: 'user_001',
          userName: '张三',
          userPhone: '13800138000',
          level: 3,
          levelName: 'VIP3',
          points: 15000,
          totalRecharge: 50000,
          totalWithdraw: 20000,
          monthlyRecharge: 5000,
          benefits: ['提现手续费8折', '专属客服', '生日礼包'],
          expireTime: '2025-12-31 23:59:59',
          status: 'active',
          createdTime: '2024-01-01 10:00:00',
          updatedTime: '2024-12-20 10:00:00'
        }
      ]
      fs.writeJsonSync(DATA_FILES.vip, vipData)
    }
    
    // 过滤
    if (level) {
      vipData = vipData.filter(item => item.level === Number(level))
    }
    if (status) {
      vipData = vipData.filter(item => item.status === status)
    }
    
    // 分页
    const total = vipData.length
    const startIndex = (Number(page) - 1) * Number(pageSize)
    const endIndex = startIndex + Number(pageSize)
    const paginatedList = vipData.slice(startIndex, endIndex)
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: paginatedList,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 创建VIP用户
app.post('/api/vip/create', (req, res) => {
  try {
    const vipData = fs.readJsonSync(DATA_FILES.vip)
    const newVip = {
      id: uuidv4(),
      ...req.body,
      status: 'active',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    }
    
    vipData.push(newVip)
    fs.writeJsonSync(DATA_FILES.vip, vipData)
    
    res.json({
      code: 0,
      message: 'VIP用户创建成功',
      data: newVip
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 更新VIP用户
app.put('/api/vip/:id', (req, res) => {
  try {
    const vipData = fs.readJsonSync(DATA_FILES.vip)
    const index = vipData.findIndex(v => v.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: 'VIP用户不存在' })
    }
    
    vipData[index] = {
      ...vipData[index],
      ...req.body,
      updatedTime: new Date().toISOString()
    }
    
    fs.writeJsonSync(DATA_FILES.vip, vipData)
    
    res.json({
      code: 0,
      message: 'VIP用户更新成功',
      data: vipData[index]
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 删除VIP用户
app.delete('/api/vip/:id', (req, res) => {
  try {
    let vipData = fs.readJsonSync(DATA_FILES.vip)
    vipData = vipData.filter(v => v.id !== req.params.id)
    fs.writeJsonSync(DATA_FILES.vip, vipData)
    
    res.json({
      code: 0,
      message: 'VIP用户删除成功',
      data: { id: req.params.id }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// ============= 提现管理 API =============

// 获取提现记录列表
app.get('/api/withdraw/list', (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, userId } = req.query
    let withdrawData = fs.readJsonSync(DATA_FILES.withdraw)
    
    if (withdrawData.length === 0) {
      withdrawData = [
        {
          id: '1',
          orderId: `WD${Date.now()}1`,
          userId: 'user_001',
          userName: '张三',
          amount: 5000,
          fee: 50,
          actualAmount: 4950,
          method: 'alipay',
          account: '138****8000',
          accountName: '张三',
          bankName: '',
          status: 'pending',
          remark: '用户申请提现',
          rejectReason: '',
          operatorId: '',
          operatorName: '',
          createdTime: '2024-12-20 10:00:00',
          processedTime: '',
          completedTime: ''
        }
      ]
      fs.writeJsonSync(DATA_FILES.withdraw, withdrawData)
    }
    
    // 过滤
    if (status) {
      withdrawData = withdrawData.filter(item => item.status === status)
    }
    if (userId) {
      withdrawData = withdrawData.filter(item => item.userId === userId)
    }
    
    // 分页
    const total = withdrawData.length
    const startIndex = (Number(page) - 1) * Number(pageSize)
    const endIndex = startIndex + Number(pageSize)
    const paginatedList = withdrawData.slice(startIndex, endIndex)
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: paginatedList,
        total,
        page: Number(page),
        pageSize: Number(pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 创建提现申请
app.post('/api/withdraw/create', (req, res) => {
  try {
    const withdrawData = fs.readJsonSync(DATA_FILES.withdraw)
    const newWithdraw = {
      id: uuidv4(),
      orderId: `WD${Date.now()}`,
      ...req.body,
      status: 'pending',
      createdTime: new Date().toISOString(),
      processedTime: '',
      completedTime: ''
    }
    
    withdrawData.push(newWithdraw)
    fs.writeJsonSync(DATA_FILES.withdraw, withdrawData)
    
    res.json({
      code: 0,
      message: '提现申请创建成功',
      data: newWithdraw
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 审核提现申请
app.put('/api/withdraw/review/:id', (req, res) => {
  try {
    const withdrawData = fs.readJsonSync(DATA_FILES.withdraw)
    const index = withdrawData.findIndex(w => w.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '提现记录不存在' })
    }
    
    const { status, rejectReason, operatorId, operatorName } = req.body
    
    withdrawData[index] = {
      ...withdrawData[index],
      status,
      rejectReason: rejectReason || '',
      operatorId,
      operatorName,
      processedTime: new Date().toISOString(),
      completedTime: status === 'completed' ? new Date().toISOString() : ''
    }
    
    fs.writeJsonSync(DATA_FILES.withdraw, withdrawData)
    
    res.json({
      code: 0,
      message: '提现审核成功',
      data: withdrawData[index]
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// 获取提现统计
app.get('/api/withdraw/statistics', (req, res) => {
  try {
    const withdrawData = fs.readJsonSync(DATA_FILES.withdraw)
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = withdrawData.filter(w => w.createdTime && w.createdTime.startsWith(today))
    
    const statistics = {
      todayAmount: todayRecords.reduce((sum, w) => sum + (w.actualAmount || 0), 0),
      todayCount: todayRecords.length,
      totalAmount: withdrawData.reduce((sum, w) => sum + (w.actualAmount || 0), 0),
      totalCount: withdrawData.length,
      pendingAmount: withdrawData.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.actualAmount, 0),
      pendingCount: withdrawData.filter(w => w.status === 'pending').length,
      completedAmount: withdrawData.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.actualAmount, 0),
      completedCount: withdrawData.filter(w => w.status === 'completed').length,
      rejectedCount: withdrawData.filter(w => w.status === 'rejected').length
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: statistics
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message })
  }
})

// ============= 通用处理 =============

// 处理其他所有API请求（返回空数据）
app.all('/api/*', (req, res) => {
  console.log(`Unhandled API request: ${req.method} ${req.path}`)
  res.json({
    code: 0,
    message: 'success',
    data: {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10
    }
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: err.message
  })
})

// 启动服务器
app.listen(port, () => {
  console.log(`后端API服务器运行在 http://localhost:${port}`)
  console.log('\n已实现的API接口：')
  console.log('  问题管理：')
  console.log('    GET    /api/question/list          - 获取问题列表')
  console.log('    GET    /api/question/categories    - 获取分类列表')
  console.log('    GET    /api/question/:id           - 获取单个问题')
  console.log('    POST   /api/question/create        - 创建问题')
  console.log('    PUT    /api/question/:id           - 更新问题')
  console.log('    DELETE /api/question/:id           - 删除问题')
  console.log('\n  工单管理：')
  console.log('    GET    /api/work/list              - 获取工单列表')
  console.log('    POST   /api/work/create            - 创建工单')
  console.log('    PUT    /api/work/:id               - 更新工单')
  console.log('    POST   /api/work/reply             - 工单回复')
  console.log('\n  币安管理：')
  console.log('    GET    /api/binance/rechargeRecords - 获取充值记录')
  console.log('    GET    /api/binance/exchangeRate    - 获取汇率设置')
  console.log('    PUT    /api/binance/exchangeRate    - 更新汇率')
  console.log('    GET    /api/binance/statistics      - 获取统计数据')
  console.log('    POST   /api/binance/userRecharge    - 用户充值')
  console.log('\n  VIP管理：')
  console.log('    GET    /api/vip/list               - 获取VIP用户列表')
  console.log('    POST   /api/vip/create             - 创建VIP用户')
  console.log('    PUT    /api/vip/:id                - 更新VIP用户')
  console.log('    DELETE /api/vip/:id                - 删除VIP用户')
  console.log('\n  提现管理：')
  console.log('    GET    /api/withdraw/list          - 获取提现记录')
  console.log('    POST   /api/withdraw/create        - 创建提现申请')
  console.log('    PUT    /api/withdraw/review/:id    - 审核提现申请')
  console.log('    GET    /api/withdraw/statistics    - 获取提现统计')
  console.log('\n数据存储位置：', DATA_DIR)
})