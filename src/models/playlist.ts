// 歌单相关模型定义

/**
 * 歌单基本信息
 */
export interface PlayList {
  /**
   * 歌单ID
   */
  id: number;
  /**
   * 歌单名称
   */
  name: string;
  /**
   * 歌单封面URL
   */
  coverImgUrl: string;
  /**
   * 歌单描述
   */
  description?: string;
  /**
   * 播放次数
   */
  playCount: number;
  /**
   * 收藏次数
   */
  bookCount?: number;
  /**
   * 分享次数
   */
  shareCount?: number;
  /**
   * 评论次数
   */
  commentCount?: number;
  /**
   * 歌单标签
   */
  tags?: string[];
  /**
   * 歌单创建者
   */
  creator?: {
    /**
     * 创建者ID
     */
    id: number;
    /**
     * 创建者名称
     */
    nickname: string;
    /**
     * 创建者头像
     */
    avatarUrl?: string;
  };
  /**
   * 更新时间
   */
  updateTime?: number;
  /**
   * 创建时间
   */
  createTime?: number;
  /**
   * 歌曲数量
   */
  trackCount?: number;
  /**
   * 订阅数量
   */
  subscribedCount?: number;
  /**
   * 是否订阅
   */
  subscribed?: boolean;
}

/**
 * 歌单详情
 */
export interface PlayListDetail extends PlayList {
  /**
   * 歌单类型
   */
  type?: number;
  /**
   * 歌单状态
   */
  status?: number;
  /**
   * 歌单歌曲列表
   */
  tracks?: any[];
  /**
   * 歌单歌曲总数
   */
  trackIds?: PlayListDetailTrackIds[];
  /**
   * 封面ID
   */
  coverImgId?: number;
  /**
   * 封面URL（高质量）
   */
  coverImgId_str?: string;
  /**
   * 是否为官方歌单
   */
  officialPlaylistType?: number;
  /**
   * 是否为高质量歌单
   */
  highQuality?: boolean;
  /**
   * 分享链接
   */
  shareUrl?: string;
  /**
   * 订阅者列表
   */
  subscribers?: {
    /**
     * 订阅者ID
     */
    id: number;
    /**
     * 订阅者昵称
     */
    nickname: string;
    /**
     * 订阅者头像
     */
    avatarUrl: string;
  }[];
}

/**
 * 歌单详情中的歌曲ID列表项
 */
export interface PlayListDetailTrackIds {
  /**
   * 歌曲ID
   */
  id: number;
  /**
   * 歌曲类型
   */
  v: number;
  /**
   * 歌曲算法信息
   */
  alg?: string;
}

/**
 * 歌单评论
 */
export interface PlaylistComment {
  /**
   * 评论ID
   */
  commentId: number;
  /**
   * 用户信息
   */
  user: {
    /**
     * 用户ID
     */
    userId: number;
    /**
     * 用户昵称
     */
    nickname: string;
    /**
     * 用户头像
     */
    avatarUrl: string;
  };
  /**
   * 评论内容
   */
  content: string;
  /**
   * 评论时间
   */
  time: number;
  /**
   * 点赞数量
   */
  likedCount: number;
  /**
   * 是否点赞
   */
  liked: boolean;
  /**
   * 回复数量
   */
  replyCount: number;
}

/**
 * 高质量歌单标签
 */
export interface PlaylistHighqualityTag {
  /**
   * 标签ID
   */
  id: number;
  /**
   * 标签名
   */
  name: string;
  /**
   * 标签类型
   */
  type: number;
}
