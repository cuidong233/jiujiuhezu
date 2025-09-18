<template>
  <div class="binance-recharge">
    <!-- 充值页面 -->
    <div class="recharge-container">
      <h2>币安支付充值</h2>
      
      <!-- 实时汇率显示 -->
      <div class="exchange-rates">
        <h3>实时汇率 (1 CNY = ?)</h3>
        <div class="rate-cards">
          <div v-for="rate in exchangeRates" :key="rate.crypto_currency" class="rate-card">
            <div class="currency">{{ rate.crypto_currency }}</div>
            <div class="rate">{{ (1 / rate.exchange_rate).toFixed(8) }}</div>
            <div class="update-time">更新: {{ formatTime(rate.last_update_time) }}</div>
          </div>
        </div>
      </div>

      <!-- 充值表单 -->
      <div class="recharge-form">
        <el-form ref="rechargeForm" :model="rechargeData" :rules="rules">
          <!-- 选择币种 -->
          <el-form-item label="选择币种" prop="cryptoCurrency">
            <el-radio-group v-model="rechargeData.cryptoCurrency" @change="onCurrencyChange">
              <el-radio-button label="USDT">USDT (稳定币)</el-radio-button>
              <el-radio-button label="BUSD">BUSD</el-radio-button>
              <el-radio-button label="BTC">BTC (比特币)</el-radio-button>
              <el-radio-button label="ETH">ETH (以太坊)</el-radio-button>
              <el-radio-button label="BNB">BNB (币安币)</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 充值金额 -->
          <el-form-item label="充值金额(CNY)" prop="amount">
            <el-input v-model.number="rechargeData.amount" @input="calculateCrypto">
              <template slot="append">元</template>
            </el-input>
            <div class="amount-tips">
              <el-tag type="info" size="mini">最小: 10元</el-tag>
              <el-tag type="info" size="mini">最大: 50000元</el-tag>
            </div>
          </el-form-item>

          <!-- 快捷金额 -->
          <el-form-item label="快捷选择">
            <el-button-group>
              <el-button @click="setAmount(100)">100元</el-button>
              <el-button @click="setAmount(500)">500元</el-button>
              <el-button @click="setAmount(1000)">1000元</el-button>
              <el-button @click="setAmount(5000)">5000元</el-button>
              <el-button @click="setAmount(10000)">10000元</el-button>
            </el-button-group>
          </el-form-item>

          <!-- 充值赠送提示 -->
          <el-form-item label="充值优惠" v-if="rechargeBonus > 0">
            <el-alert
              :title="`充值${rechargeData.amount}元，赠送${rechargeBonus}元`"
              type="success"
              :closable="false">
            </el-alert>
          </el-form-item>

          <!-- 需支付加密货币 -->
          <el-form-item label="需支付" v-if="calculatedCrypto">
            <div class="crypto-amount">
              <span class="amount">{{ calculatedCrypto.cryptoAmount }}</span>
              <span class="currency">{{ rechargeData.cryptoCurrency }}</span>
            </div>
            <div class="exchange-info">
              <small>汇率: 1 {{ rechargeData.cryptoCurrency }} = {{ calculatedCrypto.exchangeRate }} CNY</small>
              <small>实际到账: {{ calculatedCrypto.actualAmount }} 元</small>
            </div>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="primary" @click="submitRecharge" :loading="loading">
              立即充值
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 充值记录 -->
      <div class="recharge-history">
        <h3>我的充值记录</h3>
        <el-table :data="rechargeRecords" stripe>
          <el-table-column prop="recharge_no" label="订单号" width="180"></el-table-column>
          <el-table-column prop="cny_amount" label="充值金额(CNY)" width="120"></el-table-column>
          <el-table-column prop="crypto_currency" label="币种" width="80"></el-table-column>
          <el-table-column prop="crypto_amount" label="支付数量" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间" width="160"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button 
                v-if="scope.row.status === 0" 
                type="text" 
                @click="continuePayment(scope.row)">
                继续支付
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <el-dialog
      title="币安支付"
      :visible.sync="payDialog"
      width="500px">
      <div class="pay-dialog">
        <div class="qrcode-container" v-if="paymentInfo.qrcode">
          <vue-qr :text="paymentInfo.qrcode" :size="200"></vue-qr>
          <p>请使用币安App扫码支付</p>
        </div>
        <div class="pay-info">
          <p>订单号: {{ paymentInfo.rechargeNo }}</p>
          <p>支付金额: {{ paymentInfo.cryptoAmount }} {{ paymentInfo.cryptoCurrency }}</p>
          <p>人民币: ￥{{ paymentInfo.amount }}</p>
        </div>
        <el-button type="primary" @click="openPayUrl" v-if="paymentInfo.payUrl">
          打开币安支付页面
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BinanceRecharge',
  data() {
    return {
      exchangeRates: [],
      rechargeData: {
        cryptoCurrency: 'USDT',
        amount: 100
      },
      rules: {
        cryptoCurrency: [
          { required: true, message: '请选择币种', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入充值金额', trigger: 'blur' },
          { type: 'number', min: 10, max: 50000, message: '充值金额需在10-50000之间', trigger: 'blur' }
        ]
      },
      calculatedCrypto: null,
      rechargeBonus: 0,
      loading: false,
      rechargeRecords: [],
      payDialog: false,
      paymentInfo: {},
      updateTimer: null
    }
  },
  
  mounted() {
    this.loadExchangeRates()
    this.loadRechargeRecords()
    this.calculateCrypto()
    
    // 定时更新汇率
    this.updateTimer = setInterval(() => {
      this.loadExchangeRates()
    }, 30000) // 30秒更新一次
  },
  
  beforeDestroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  
  methods: {
    // 加载汇率
    async loadExchangeRates() {
      try {
        const res = await this.$http.get('/api/recharge/binance/exchange-rate')
        if (res.data.code === 0) {
          this.exchangeRates = res.data.data
        }
      } catch (error) {
        console.error('加载汇率失败', error)
      }
    },
    
    // 加载充值记录
    async loadRechargeRecords() {
      try {
        const userId = this.$store.state.user.id // 获取当前用户ID
        const res = await this.$http.get('/api/recharge/binance/records', {
          params: { userId, page: 1, limit: 10 }
        })
        if (res.data.code === 0) {
          this.rechargeRecords = res.data.data.list
        }
      } catch (error) {
        console.error('加载充值记录失败', error)
      }
    },
    
    // 计算加密货币数量
    async calculateCrypto() {
      if (!this.rechargeData.amount || this.rechargeData.amount < 10) {
        this.calculatedCrypto = null
        this.rechargeBonus = 0
        return
      }
      
      try {
        const res = await this.$http.get('/api/recharge/binance/calculate', {
          params: {
            cnyAmount: this.rechargeData.amount,
            cryptoCurrency: this.rechargeData.cryptoCurrency
          }
        })
        
        if (res.data.code === 0) {
          this.calculatedCrypto = res.data.data
          this.rechargeBonus = res.data.data.bonus || 0
        }
      } catch (error) {
        console.error('计算失败', error)
      }
    },
    
    // 设置金额
    setAmount(amount) {
      this.rechargeData.amount = amount
      this.calculateCrypto()
    },
    
    // 币种改变
    onCurrencyChange() {
      this.calculateCrypto()
    },
    
    // 提交充值
    submitRecharge() {
      this.$refs.rechargeForm.validate(async (valid) => {
        if (!valid) return
        
        this.loading = true
        try {
          const userId = this.$store.state.user.id
          const res = await this.$http.post('/api/recharge/binance/create', {
            userId,
            amount: this.rechargeData.amount,
            cryptoCurrency: this.rechargeData.cryptoCurrency
          })
          
          if (res.data.code === 0) {
            this.paymentInfo = res.data.data
            this.payDialog = true
            
            // 开始轮询支付状态
            this.checkPaymentStatus(res.data.data.rechargeNo)
          } else {
            this.$message.error(res.data.msg)
          }
        } catch (error) {
          this.$message.error('创建充值订单失败')
        } finally {
          this.loading = false
        }
      })
    },
    
    // 打开支付页面
    openPayUrl() {
      if (this.paymentInfo.payUrl) {
        window.open(this.paymentInfo.payUrl, '_blank')
      }
    },
    
    // 继续支付
    continuePayment(record) {
      this.paymentInfo = {
        rechargeNo: record.recharge_no,
        amount: record.cny_amount,
        cryptoAmount: record.crypto_amount,
        cryptoCurrency: record.crypto_currency
      }
      this.payDialog = true
    },
    
    // 检查支付状态
    checkPaymentStatus(rechargeNo) {
      const checkInterval = setInterval(async () => {
        try {
          const res = await this.$http.get(`/api/recharge/status/${rechargeNo}`)
          if (res.data.code === 0 && res.data.data.status === 2) {
            clearInterval(checkInterval)
            this.payDialog = false
            this.$message.success('充值成功！')
            this.loadRechargeRecords()
          }
        } catch (error) {
          console.error('检查状态失败', error)
        }
      }, 3000) // 每3秒检查一次
      
      // 30分钟后停止检查
      setTimeout(() => {
        clearInterval(checkInterval)
      }, 30 * 60 * 1000)
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已到账',
        3: '失败',
        4: '已退款'
      }
      return statusMap[status] || '未知'
    },
    
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'primary',
        2: 'success',
        3: 'danger',
        4: 'info'
      }
      return typeMap[status] || 'info'
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.binance-recharge {
  padding: 20px;
}

.recharge-container {
  max-width: 1200px;
  margin: 0 auto;
}

.exchange-rates {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.rate-cards {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.rate-card {
  flex: 1;
  padding: 15px;
  background: white;
  border-radius: 6px;
  text-align: center;
}

.rate-card .currency {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.rate-card .rate {
  font-size: 14px;
  color: #f6931a;
  margin: 10px 0;
}

.rate-card .update-time {
  font-size: 12px;
  color: #999;
}

.recharge-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.amount-tips {
  margin-top: 10px;
}

.amount-tips .el-tag {
  margin-right: 10px;
}

.crypto-amount {
  font-size: 24px;
  color: #f6931a;
  font-weight: bold;
}

.crypto-amount .currency {
  margin-left: 10px;
  font-size: 18px;
}

.exchange-info {
  margin-top: 10px;
}

.exchange-info small {
  display: block;
  color: #666;
  line-height: 1.5;
}

.recharge-history {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.pay-dialog {
  text-align: center;
}

.qrcode-container {
  margin: 20px 0;
}

.pay-info {
  margin: 20px 0;
}

.pay-info p {
  margin: 10px 0;
}
</style>