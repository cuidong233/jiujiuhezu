/**
 * 统一API响应格式中间件
 */

class ResponseHandler {
  /**
   * 成功响应
   * @param {Object} res - Express响应对象
   * @param {*} data - 响应数据
   * @param {string} message - 成功消息
   * @param {number} code - 状态码
   */
  static success(res, data = null, message = '操作成功', code = 0) {
    return res.status(200).json({
      code,
      message,
      data,
      success: true,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 分页成功响应
   * @param {Object} res - Express响应对象
   * @param {Array} list - 数据列表
   * @param {number} total - 总数
   * @param {number} page - 当前页
   * @param {number} limit - 每页数量
   * @param {string} message - 消息
   */
  static successWithPagination(res, list, total, page, limit, message = '获取数据成功') {
    return res.status(200).json({
      code: 0,
      message,
      data: {
        list,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      },
      success: true,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 错误响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {number} code - 错误码
   * @param {number} status - HTTP状态码
   * @param {Object} details - 错误详情
   */
  static error(res, message = '操作失败', code = 1, status = 400, details = null) {
    return res.status(status).json({
      code,
      message,
      data: details,
      success: false,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 验证错误响应
   * @param {Object} res - Express响应对象
   * @param {Array} errors - 验证错误数组
   */
  static validationError(res, errors) {
    return res.status(400).json({
      code: 1001,
      message: '数据验证失败',
      data: {
        errors: errors.map(err => ({
          field: err.param || err.field,
          message: err.msg || err.message,
          value: err.value
        }))
      },
      success: false,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 未授权响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   */
  static unauthorized(res, message = '未授权访问') {
    return res.status(401).json({
      code: 401,
      message,
      data: null,
      success: false,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 禁止访问响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   */
  static forbidden(res, message = '禁止访问') {
    return res.status(403).json({
      code: 403,
      message,
      data: null,
      success: false,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 资源未找到响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   */
  static notFound(res, message = '资源不存在') {
    return res.status(404).json({
      code: 404,
      message,
      data: null,
      success: false,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 服务器错误响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {Object} error - 错误对象
   */
  static serverError(res, message = '服务器内部错误', error = null) {
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      stack: error?.stack,
      details: error?.message
    } : null;

    return res.status(500).json({
      code: 500,
      message,
      data: errorDetails,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 响应处理中间件
 * 为res对象添加统一的响应方法
 */
const responseMiddleware = (req, res, next) => {
  // 添加统一响应方法到res对象
  res.apiSuccess = (data, message, code) => ResponseHandler.success(res, data, message, code);
  res.apiSuccessWithPagination = (list, total, page, limit, message) => 
    ResponseHandler.successWithPagination(res, list, total, page, limit, message);
  res.apiError = (message, code, status, details) => ResponseHandler.error(res, message, code, status, details);
  res.apiValidationError = (errors) => ResponseHandler.validationError(res, errors);
  res.apiUnauthorized = (message) => ResponseHandler.unauthorized(res, message);
  res.apiForbidden = (message) => ResponseHandler.forbidden(res, message);
  res.apiNotFound = (message) => ResponseHandler.notFound(res, message);
  res.apiServerError = (message, error) => ResponseHandler.serverError(res, message, error);

  next();
};

export { ResponseHandler, responseMiddleware };