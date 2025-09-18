import { http } from '@/utils/request'
import type { Goods, GoodsCategory, PageParams, PageResponse, ApiResponse } from '@/types/api'

/**
 * 商品相关API
 */
export const goodsApi = {
  /**
   * 获取商品列表
   * @param params 查询参数
   */
  getGoodsList(params: PageParams & {
    category?: string
    categoryId?: number
    keyword?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'price' | 'sales' | 'createTime'
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<PageResponse<Goods>>> {
    return http.get('/product/goods', params)
  },

  /**
   * 获取商品详情
   * @param id 商品ID
   */
  getGoodsDetail(id: number): Promise<ApiResponse<Goods>> {
    return http.get(`/product/${id}`)
  },

  /**
   * 获取热门商品
   * @param limit 数量限制
   */
  getHotGoods(limit: number = 8): Promise<ApiResponse<Goods[]>> {
    return http.get('/product/goods', { limit, isHot: true })
  },

  /**
   * 获取推荐商品
   * @param limit 数量限制
   */
  getRecommendGoods(limit: number = 8): Promise<ApiResponse<Goods[]>> {
    return http.get('/product/goods', { limit, isRecommend: true })
  },

  /**
   * 获取商品分类列表
   */
  getCategories(): Promise<ApiResponse<GoodsCategory[]>> {
    return http.get('/product/category')
  },

  /**
   * 搜索商品
   * @param params 搜索参数
   */
  searchGoods(params: {
    keyword: string
    page: number
    limit: number
    category?: string
    categoryId?: number
    sortBy?: 'price' | 'sales' | 'createTime'
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<PageResponse<Goods>>> {
    return http.get('/product/goods', params)
  },

  /**
   * 获取商品SKU信息
   * @param goodsCode 商品编码
   */
  getGoodsSkuInfo(goodsCode: string): Promise<ApiResponse<any>> {
    return http.get(`/product/goods/getSkuInfo/${goodsCode}`)
  },

  /**
   * 通过Unicode获取SKU详细信息
   * @param unicode SKU唯一码
   */
  getSkuByUnicode(unicode: string): Promise<ApiResponse<any>> {
    return http.get(`/product/goods/getSkuByUnicode/${unicode}`)
  },

  /**
   * 查询SKU剩余库存
   * @param skuUnicode SKU唯一码
   */
  getSkuResidue(skuUnicode: string): Promise<ApiResponse<number>> {
    return http.get(`/product/goods/getSkuResidue/${skuUnicode}`)
  }
} 