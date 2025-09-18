// 统一主题配置
export const theme = {
  // 颜色方案
  colors: {
    primary: '#409EFF',
    success: '#67C23A', 
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399',
    
    // 渐变色方案
    gradients: {
      purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      cyan: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  },
  
  // 图表配色方案
  chartColors: [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc'
  ],
  
  // 阴影效果
  shadows: {
    base: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
    light: '0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04)',
    dark: '0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.12)'
  },
  
  // 动画配置
  transitions: {
    base: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
    fade: 'opacity 0.3s linear',
    'fade-linear': 'opacity 0.2s linear'
  }
}

// 获取随机渐变色
export function getRandomGradient() {
  const gradients = Object.values(theme.colors.gradients)
  return gradients[Math.floor(Math.random() * gradients.length)]
}

// 获取状态颜色
export function getStatusColor(status) {
  const statusMap = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
    primary: theme.colors.primary
  }
  return statusMap[status] || theme.colors.info
}