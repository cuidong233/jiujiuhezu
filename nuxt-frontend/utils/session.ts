/**
 * 会话管理工具
 * 用于在用户未登录时跟踪订单
 */

const SESSION_KEY = 'guest_session_id'
const EMAIL_KEY = 'guest_email'

/**
 * 获取或创建会话ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    // 生成唯一的会话ID
    sessionId = `GUEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}

/**
 * 保存游客邮箱
 */
export function saveGuestEmail(email: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(EMAIL_KEY, email)
}

/**
 * 获取游客邮箱
 */
export function getGuestEmail(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(EMAIL_KEY) || ''
}

/**
 * 清除会话信息（用户登录后调用）
 */
export function clearGuestSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

/**
 * 获取用户标识（用于订单查询）
 */
export function getUserIdentifier() {
  // 优先使用邮箱，其次使用sessionId
  const email = getGuestEmail()
  const sessionId = getSessionId()
  
  return {
    userEmail: email,
    sessionId: email || sessionId
  }
}