// 视频相关模型定义

/**
 * 视频信息
 */
export interface Video {
  /**
   * 视频ID
   */
  vid: string;
  /**
   * 视频标题
   */
  title: string;
  /**
   * 视频封面URL
   */
  coverUrl: string;
  /**
   * 视频播放URL
   */
  url?: string;
  /**
   * 视频描述
   */
  description?: string;
  /**
   * 视频时长（秒）
   */
  duration: number;
  /**
   * 视频播放次数
   */
  playCount: number;
  /**
   * 视频评论数
   */
  commentCount?: number;
  /**
   * 视频分享数
   */
  shareCount?: number;
  /**
   * 视频收藏数
   */
  subCount?: number;
  /**
   * 视频上传时间
   */
  publishTime: number;
  /**
   * 视频作者信息
   */
  creator: VideoCreator[];
  /**
   * 视频标签
   */
  tags?: string[];
  /**
   * 视频分类
   */
  category?: string;
  /**
   * 视频清晰度
   */
  resolutions?: VideoResolution[];
  /**
   * 视频状态
   */
  status?: number;
  /**
   * 点赞数
   */
  likedCount?: number;
  /**
   * 是否已点赞
   */
  liked?: boolean;
}

/**
 * 视频作者信息
 */
export interface VideoCreator {
  /**
   * 作者ID
   */
  userId: number;
  /**
   * 作者名称
   */
  userName: string;
  /**
   * 作者头像URL
   */
  userPic?: string;
  /**
   * 作者简介
   */
  desc?: string;
}

/**
 * 视频清晰度信息
 */
export interface VideoResolution {
  /**
   * 清晰度类型（如'1080p', '720p'）
   */
  resolution: string;
  /**
   * 清晰度URL
   */
  url: string;
  /**
   * 视频大小
   */
  size?: number;
  /**
   * 比特率
   */
  bitrate?: number;
}

/**
 * 视频详情响应
 */
export interface VideoDetailResponse {
  /**
   * 视频详情
   */
  videoInfo: Video;
  /**
   * 推荐视频列表
   */
  recommendVideos?: Video[];
  /**
   * 相关视频列表
   */
  relatedVideos?: Video[];
  /**
   * 视频评论列表
   */
  comments?: VideoComment[];
  /**
   * 响应状态码
   */
  code: number;
}

/**
 * 视频评论
 */
export interface VideoComment {
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
 * 视频列表响应
 */
export interface VideoListResponse {
  /**
   * 视频列表
   */
  videos: Video[];
  /**
   * 总数量
   */
  total: number;
  /**
   * 页码
   */
  page: number;
  /**
   * 每页数量
   */
  pageSize: number;
  /**
   * 响应状态码
   */
  code: number;
}

/**
 * 视频分类
 */
export interface VideoCategory {
  /**
   * 分类ID
   */
  id: number;
  /**
   * 分类名称
   */
  name: string;
  /**
   * 分类封面
   */
  cover?: string;
  /**
   * 分类描述
   */
  description?: string;
}

/**
 * 视频分类列表
 */
export interface VideoCategoryListResponse {
  /**
   * 分类列表
   */
  categories: VideoCategory[];
  /**
   * 响应状态码
   */
  code: number;
}
