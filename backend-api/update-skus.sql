-- 为现有商品配置合适的SKU规格

-- 1. Netflix 高级账号
UPDATE pr_goods 
SET skus = '[
  {"name": "1个月", "price": 39.99, "stock": 100},
  {"name": "3个月", "price": 109.99, "stock": 100},
  {"name": "6个月", "price": 199.99, "stock": 50},
  {"name": "12个月", "price": 320.00, "stock": 30}
]'
WHERE id = 1;

-- 2. Disney+ 会员 
UPDATE pr_goods 
SET skus = '[
  {"name": "1个月", "price": 35.00, "stock": 100},
  {"name": "3个月", "price": 85.00, "stock": 100},
  {"name": "6个月", "price": 168.00, "stock": 50},
  {"name": "12个月", "price": 299.00, "stock": 30}
]'
WHERE id = 2;

-- 3. Apple TV+ 会员
UPDATE pr_goods 
SET skus = '[
  {"name": "1个月", "price": 38.00, "stock": 100},
  {"name": "3个月", "price": 98.00, "stock": 100},
  {"name": "6个月", "price": 188.00, "stock": 50},
  {"name": "12个月", "price": 348.00, "stock": 30}
]'
WHERE id = 3;

-- 4. Steam充值卡 (按金额)
UPDATE pr_goods 
SET skus = '[
  {"name": "$50", "price": 350.00, "stock": 100},
  {"name": "$100", "price": 699.00, "stock": 100},
  {"name": "$200", "price": 1390.00, "stock": 50},
  {"name": "$500", "price": 3475.00, "stock": 20}
]'
WHERE id = 4;

-- 5. Disney+ 会员 (id=5的另一个Disney+)
UPDATE pr_goods 
SET skus = '[
  {"name": "1个月", "price": 35.00, "stock": 100},
  {"name": "3个月", "price": 85.00, "stock": 100},
  {"name": "6个月", "price": 168.00, "stock": 50},
  {"name": "12个月", "price": 299.00, "stock": 30}
]'
WHERE id = 5;

-- 6. HBO Max 会员
UPDATE pr_goods 
SET skus = '[
  {"name": "1个月", "price": 45.00, "stock": 100},
  {"name": "3个月", "price": 108.00, "stock": 100},
  {"name": "6个月", "price": 208.00, "stock": 50},
  {"name": "12个月", "price": 388.00, "stock": 30}
]'
WHERE id = 6;

-- 7. Steam充值卡 (id=7的另一个Steam)
UPDATE pr_goods 
SET skus = '[
  {"name": "$20", "price": 144.00, "stock": 100},
  {"name": "$50", "price": 350.00, "stock": 100},
  {"name": "$100", "price": 699.00, "stock": 50},
  {"name": "$200", "price": 1390.00, "stock": 30}
]'
WHERE id = 7;

-- 8. Claude Pro
UPDATE pr_goods 
SET skus = '[
  {"name": "1个月", "price": 158.00, "stock": 100},
  {"name": "3个月", "price": 450.00, "stock": 50},
  {"name": "6个月", "price": 850.00, "stock": 30},
  {"name": "12个月", "price": 1580.00, "stock": 20}
]'
WHERE id = 8;

-- 9和10是测试商品，暂时不设置SKU，保持单一价格即可