// 用户相关模型定义

/**
 * 用户信息
 */
export interface User {
  /**
   * 用户ID
   */
  userId: number;
  /**
   * 昵称
   */
  nickname: string;
  /**
   * 头像URL
   */
  avatarUrl: string;
  /**
   * 个性签名
   */
  signature?: string;
  /**
   * 性别 0:保密 1:男 2:女
   */
  gender?: number;
  /**
   * 生日（时间戳）
   */
  birthday?: number;
  /**
   * 所在地区
   */
  location?: string;
  /**
   * 等级
   */
  level?: number;
  /**
   * 听歌数量
   */
  listenSongs?: number;
  /**
   * 关注数
   */
  followeds?: number;
  /**
   * 粉丝数
   */
  follows?: number;
  /**
   * VIP类型
   */
  vipType?: number;
  /**
   * VIP过期时间
   */
  vipExpireTime?: number;
  /**
   * 是否为VIP
   */
  isVip?: boolean;
  /**
   * 用户权限
   */
  userType?: number;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /**
   * 用户信息
   */
  profile?: User;
  /**
   * 用户令牌
   */
  token?: string;
  /**
   * cookie信息
   */
  cookie?: string;
  /**
   * 登录状态
   */
  code: number;
  /**
   * 错误信息
   */
  msg?: string;
}

/**
 * 用户详情响应
 */
export interface UserDetailResponse {
  /**
   * 用户信息
   */
  profile: User;
  /**
   * 绑定手机
   */
  phone: string;
  /**
   * 用户ID
   */
  userId: number;
  /**
   * 响应状态码
   */
  code: number;
}

/**
 * 用户歌单
 */
export interface UserPlaylist {
  /**
   * 歌单ID
   */
  id: number;
  /**
   * 歌单名称
   */
  name: string;
  /**
   * 歌单封面
   */
  coverImgUrl: string;
  /**
   * 歌单描述
   */
  description?: string;
  /**
   * 歌单歌曲数量
   */
  trackCount: number;
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 更新时间
   */
  updateTime: number;
  /**
   * 是否为喜欢的音乐
   */
  isLike: boolean;
  /**
   * 是否为创建的歌单
   */
  userId: number;
}

/**
 * 用户歌单响应
 */
export interface UserPlaylistResponse {
  /**
   * 用户歌单列表
   */
  playlist: UserPlaylist[];
  /**
   * 子列表（可能是最近播放等）
   */
  subPlaylist?: UserPlaylist[];
  /**
   * 响应状态码
   */
  code: number;
}

/**
 * 用户收藏
 */
export interface UserFavorite {
  /**
   * 收藏ID
   */
  id: number;
  /**
   * 收藏类型
   */
  type: number;
  /**
   * 收藏名称
   */
  name: string;
  /**
   * 收藏时间
   */
  createTime: number;
}

/**
 * 用户设置
 */
export interface UserSettings {
  /**
   * 深色模式
   */
  darkMode?: boolean;
  /**
   * 播放音质
   */
  playQuality?: string;
  /**
   * 消息通知
   */
  notification?: boolean;
  /**
   * 自动播放
   */
  autoPlay?: boolean;
  /**
   * 循环模式
   */
  cycleMode?: number;
}
