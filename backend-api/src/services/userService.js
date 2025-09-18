import bcrypt from 'bcryptjs';
import pool from '../db/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { verifyEmailCode } from './emailService.js';

/**
 * 用户服务类
 */
class UserService {
  /**
   * 根据邮箱查找用户
   * @param {string} email - 邮箱
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async findUserByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND status = 1',
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async findUserByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ? AND status = 1',
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  /**
   * 根据ID查找用户
   * @param {number} id - 用户ID
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async findUserById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND status = 1',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  /**
   * 密码登录
   * @param {Object} params - 登录参数
   * @returns {Promise<Object>} 登录结果
   */
  async loginWithPassword({ email, password }) {
    try {
      // 查找用户
      const user = await this.findUserByEmail(email);
      if (!user) {
        await this.logLoginAttempt(null, email, 'password', false, '用户不存在');
        return {
          success: false,
          message: '用户名或密码错误'
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.logLoginAttempt(user.id, email, 'password', false, '密码错误');
        return {
          success: false,
          message: '用户名或密码错误'
        };
      }

      // 生成token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // 更新最后登录时间
      await this.updateLastLogin(user.id);

      // 记录登录日志
      await this.logLoginAttempt(user.id, email, 'password', true);

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user;
      
      return {
        success: true,
        data: {
          user: userInfo,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('密码登录失败:', error);
      return {
        success: false,
        message: '登录失败，请稍后重试'
      };
    }
  }

  /**
   * 验证码登录
   * @param {Object} params - 登录参数
   * @returns {Promise<Object>} 登录结果
   */
  async loginWithCode({ email, code }) {
    try {
      // 验证验证码
      const isCodeValid = await verifyEmailCode(email, code, 'login');
      if (!isCodeValid) {
        await this.logLoginAttempt(null, email, 'code', false, '验证码错误');
        return {
          success: false,
          message: '验证码错误或已过期'
        };
      }

      // 查找或创建用户
      let user = await this.findUserByEmail(email);
      if (!user) {
        // 如果用户不存在，自动创建用户
        const result = await this.createUser({
          email,
          username: email.split('@')[0] + '_' + Date.now(),
          nickname: email.split('@')[0]
        });
        
        if (!result.success) {
          return result;
        }
        
        user = await this.findUserByEmail(email);
      }

      // 生成token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // 更新最后登录时间
      await this.updateLastLogin(user.id);

      // 记录登录日志
      await this.logLoginAttempt(user.id, email, 'code', true);

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user;
      
      return {
        success: true,
        data: {
          user: userInfo,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('验证码登录失败:', error);
      return {
        success: false,
        message: '登录失败，请稍后重试'
      };
    }
  }

  /**
   * 用户注册
   * @param {Object} params - 注册参数
   * @returns {Promise<Object>} 注册结果
   */
  async register({ email, username, password, code, nickname }) {
    try {
      // 验证验证码
      if (code) {
        const isCodeValid = await verifyEmailCode(email, code, 'register');
        if (!isCodeValid) {
          return {
            success: false,
            message: '验证码错误或已过期'
          };
        }
      }

      // 检查邮箱是否已存在
      const existingEmailUser = await this.findUserByEmail(email);
      if (existingEmailUser) {
        return {
          success: false,
          message: '该邮箱已被注册'
        };
      }

      // 检查用户名是否已存在
      if (username) {
        const existingUsernameUser = await this.findUserByUsername(username);
        if (existingUsernameUser) {
          return {
            success: false,
            message: '该用户名已被使用'
          };
        }
      }

      // 创建用户
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const result = await this.createUser({
        email,
        username: username || email.split('@')[0] + '_' + Date.now(),
        password: hashedPassword,
        nickname: nickname || email.split('@')[0]
      });

      if (!result.success) {
        return result;
      }

      // 获取创建的用户
      const user = await this.findUserByEmail(email);

      // 生成token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user;
      
      return {
        success: true,
        data: {
          user: userInfo,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('用户注册失败:', error);
      return {
        success: false,
        message: '注册失败，请稍后重试'
      };
    }
  }

  /**
   * 创建用户
   * @param {Object} params - 用户信息
   * @returns {Promise<Object>} 创建结果
   */
  async createUser({ email, username, password, nickname, phone, avatar, role = 'user' }) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO app_users (email, username, password, nickname, phone, avatar, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, username, password, nickname, phone, avatar, role]
      );

      return {
        success: true,
        data: {
          id: result.insertId
        }
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      return {
        success: false,
        message: '创建用户失败'
      };
    }
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} updates - 更新的字段
   * @returns {Promise<Object>} 更新结果
   */
  async updateUser(userId, updates) {
    try {
      const allowedFields = ['nickname', 'avatar', 'phone'];
      const updateFields = [];
      const updateValues = [];

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }

      if (updateFields.length === 0) {
        return {
          success: false,
          message: '没有可更新的字段'
        };
      }

      updateValues.push(userId);
      await pool.execute(
        `UPDATE app_users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return {
        success: true,
        message: '用户信息更新成功'
      };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return {
        success: false,
        message: '更新用户信息失败'
      };
    }
  }

  /**
   * 修改密码
   * @param {number} userId - 用户ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 如果用户有密码，验证旧密码
      if (user.password) {
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
          return {
            success: false,
            message: '原密码错误'
          };
        }
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await pool.execute(
        'UPDATE app_users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return {
        success: true,
        message: '密码修改成功'
      };
    } catch (error) {
      console.error('修改密码失败:', error);
      return {
        success: false,
        message: '修改密码失败'
      };
    }
  }

  /**
   * 重置密码
   * @param {string} email - 邮箱
   * @param {string} code - 验证码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(email, code, newPassword) {
    try {
      // 验证验证码
      const isCodeValid = await verifyEmailCode(email, code, 'reset');
      if (!isCodeValid) {
        return {
          success: false,
          message: '验证码错误或已过期'
        };
      }

      // 查找用户
      const user = await this.findUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: '用户不存在'
        };
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await pool.execute(
        'UPDATE app_users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );

      return {
        success: true,
        message: '密码重置成功'
      };
    } catch (error) {
      console.error('重置密码失败:', error);
      return {
        success: false,
        message: '重置密码失败'
      };
    }
  }

  /**
   * 更新最后登录时间
   * @param {number} userId - 用户ID
   * @param {string} ip - IP地址
   */
  async updateLastLogin(userId, ip = null) {
    try {
      await pool.execute(
        'UPDATE app_users SET last_login_time = NOW(), last_login_ip = ? WHERE id = ?',
        [ip, userId]
      );
    } catch (error) {
      console.error('更新最后登录时间失败:', error);
    }
  }

  /**
   * 记录登录日志
   * @param {number} userId - 用户ID
   * @param {string} email - 邮箱
   * @param {string} loginType - 登录类型
   * @param {boolean} status - 登录状态
   * @param {string} failureReason - 失败原因
   */
  async logLoginAttempt(userId, email, loginType, status, failureReason = null) {
    try {
      await pool.execute(
        `INSERT INTO user_login_logs (user_id, email, login_type, status, failure_reason) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, email, loginType, status ? 1 : 0, failureReason]
      );
    } catch (error) {
      console.error('记录登录日志失败:', error);
    }
  }
}

export default new UserService();