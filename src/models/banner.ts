// 轮播图相关模型定义

/**
 * 轮播图信息
 */
export interface Banner {
  /**
   * 轮播图ID
   */
  id: number;
  /**
   * 轮播图图片URL
   */
  pic: string;
  /**
   * 目标ID
   */
  targetId: number;
  /**
   * 目标类型
   * - 1: 歌曲
   * - 10: 专辑
   * - 100: 歌手
   * - 1000: 歌单
   * - 2000: MV
   * - 2001: 电台
   * - 2002: 视频
   * - 3000: 图片集
   */
  targetType: number;
  /**
   * 轮播图类型
   */
  typeTitle: string;
  /**
   * 轮播图链接URL
   */
  url: string;
  /**
   * 轮播图专属信息
   */
  exclusive: boolean;
  /**
   * 轮播图描述
   */
  scm?: string;
  /**
   * 轮播图标题
   */
  titleColor?: string;
  /**
   * 轮播图副标题
   */
  typeTitle?: string;
  /**
   * 轮播图参数
   */
  bannerBizType?: string;
  /**
   * 轮播图位置参数
   */
  position?: string;
  /**
   * 轮播图显示状态
   */
  showAdTag?: boolean;
}

/**
 * 轮播图接口响应
 */
export interface BannerResponse {
  /**
   * 轮播图列表
   */
  banners: Banner[];
  /**
   * 接口响应码
   */
  code: number;
  /**
   * 轮播图更新时间
   */
  updateTime?: number;
}
