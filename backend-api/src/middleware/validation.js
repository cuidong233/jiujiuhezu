/**
 * 输入验证和SQL注入保护中间件
 */

import { body, query, param, validationResult } from 'express-validator';

/**
 * 通用验证规则
 */
const commonValidation = {
  // ID验证 - 确保是正整数
  id: param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
  
  // 分页验证
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是正整数')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页条数必须在1-100之间')
      .toInt()
  ],

  // 字符串长度验证
  string: (field, min = 1, max = 255) => 
    body(field)
      .trim()
      .isLength({ min, max })
      .withMessage(`${field}长度必须在${min}-${max}字符之间`)
      .escape(), // 防止XSS

  // 邮箱验证
  email: body('email')
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),

  // 手机号验证
  phone: body('phone')
    .isMobilePhone('zh-CN')
    .withMessage('手机号格式不正确'),

  // 密码验证
  password: body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('密码长度必须在6-20位之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),

  // 价格验证
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('价格必须是非负数')
    .toFloat(),

  // 状态验证
  status: body('status')
    .isIn([0, 1])
    .withMessage('状态值必须是0或1')
    .toInt()
};

/**
 * 商品相关验证
 */
const productValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('商品名称长度必须在1-100字符之间')
      .escape(),
    body('categoryId')
      .isInt({ min: 1 })
      .withMessage('分类ID必须是正整数')
      .toInt(),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('价格必须是非负数')
      .toFloat(),
    body('deliveryMode')
      .isIn(['auto', 'manual'])
      .withMessage('发货方式必须是auto或manual'),
    body('autoDeliveryLimit')
      .optional()
      .isInt({ min: 1, max: 99 })
      .withMessage('自动发货限制必须在1-99之间')
      .toInt(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('商品描述不能超过2000字符')
      .escape()
  ],

  update: [
    param('id').isInt({ min: 1 }).withMessage('商品ID必须是正整数'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('商品名称长度必须在1-100字符之间')
      .escape(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('价格必须是非负数')
      .toFloat(),
    body('deliveryMode')
      .optional()
      .isIn(['auto', 'manual'])
      .withMessage('发货方式必须是auto或manual')
  ]
};

/**
 * 订单相关验证
 */
const orderValidation = {
  create: [
    body('productId')
      .isInt({ min: 1 })
      .withMessage('商品ID必须是正整数')
      .toInt(),
    body('quantity')
      .isInt({ min: 1, max: 100 })
      .withMessage('购买数量必须在1-100之间')
      .toInt(),
    body('userEmail')
      .isEmail()
      .withMessage('邮箱格式不正确')
      .normalizeEmail(),
    body('consumerNickname')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('昵称不能超过50字符')
      .escape()
  ],

  updateStatus: [
    param('orderNo')
      .isLength({ min: 10, max: 50 })
      .withMessage('订单号格式不正确')
      .escape(),
    body('status')
      .isIn([0, 1, 2, 3, 4])
      .withMessage('订单状态值无效')
      .toInt()
  ]
};

/**
 * CDK相关验证
 */
const cdkValidation = {
  generate: [
    body('productId')
      .isInt({ min: 1 })
      .withMessage('商品ID必须是正整数')
      .toInt(),
    body('count')
      .isInt({ min: 1, max: 1000 })
      .withMessage('生成数量必须在1-1000之间')
      .toInt(),
    body('prefix')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('前缀不能超过20字符')
      .matches(/^[A-Z0-9]*$/)
      .withMessage('前缀只能包含大写字母和数字'),
    body('cdkType')
      .isIn(['normal', 'account', 'recharge', 'coupon'])
      .withMessage('CDK类型无效'),
    body('isReusable')
      .isBoolean()
      .withMessage('可重复使用标志必须是布尔值')
      .toBoolean(),
    body('maxUsageCount')
      .optional()
      .isInt({ min: 1, max: 999 })
      .withMessage('最大使用次数必须在1-999之间')
      .toInt()
  ],

  import: [
    body('productId')
      .isInt({ min: 1 })
      .withMessage('商品ID必须是正整数')
      .toInt(),
    body('cdks')
      .isArray({ min: 1 })
      .withMessage('CDK列表不能为空'),
    body('cdks.*')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('CDK码长度必须在1-100字符之间')
      .matches(/^[A-Z0-9\-]+$/)
      .withMessage('CDK码只能包含大写字母、数字和短横线')
  ]
};

/**
 * 用户相关验证
 */
const userValidation = {
  login: [
    body('email')
      .isEmail()
      .withMessage('邮箱格式不正确')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 1 })
      .withMessage('密码不能为空')
  ],

  register: [
    body('email')
      .isEmail()
      .withMessage('邮箱格式不正确')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6, max: 20 })
      .withMessage('密码长度必须在6-20位之间')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('密码必须包含字母和数字'),
    body('nickname')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('昵称不能超过50字符')
      .escape()
  ]
};

/**
 * SQL注入防护
 */
const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\*\/|\*|\/\*)/,
    /(\b(OR|AND)\b.*=.*)/i,
    /(;|\|\||&&)/,
    /(<script|javascript:|vbscript:|onload|onerror)/i
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (checkValue(key) || checkValue(value)) {
        return true;
      }
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // 检查请求参数
  if (checkObject(req.query) || checkObject(req.body) || checkObject(req.params)) {
    return res.status(400).json({
      code: 1006,
      success: false,
      message: '检测到可疑输入，请求被拒绝'
    });
  }

  next();
};

/**
 * 处理验证结果
 */
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 1001,
      success: false,
      message: '输入验证失败',
      errors: errors.array()
    });
  }
  next();
};

export {
  commonValidation,
  productValidation,
  orderValidation,
  cdkValidation,
  userValidation,
  sqlInjectionProtection,
  handleValidationResult
};