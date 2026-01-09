/**
 * 音乐评论相关类型定义
 * 统一管理评论数据结构，保证类型安全
 */
export interface Comment {
  /** 评论唯一ID */
  id: string;
  /** 用户头像URL */
  avatar: string;
  /** 用户昵称 */
  nickname: string;
  /** 评论内容 */
  content: string;
  /** 评论时间（格式：YYYY-MM-DD） */
  time: string;
  /** 点赞数 */
  likeCount: number;
}

/**
 * 评论组件的Props类型（扩展用）
 */
export interface CommentComponentProps {
  /** 是否显示点赞数 */
  showLike?: boolean;
  /** 评论列表数据 */
  list: Comment[];
}
