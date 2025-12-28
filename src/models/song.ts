// 歌曲模型定义
export interface Song {
  /**
   * 歌曲ID
   */
  id: number;
  /**
   * 歌曲名称
   */
  name: string;
  /**
   * 歌曲别名
   */
  alias?: string[];
  /**
   * 歌曲时长(毫秒)
   */
  dt?: number;
  /**
   * 歌曲封面URL
   */
  picUrl?: string;
  /**
   * 歌曲链接
   */
  url?: string;
  /**
   * 歌曲类型
   */
  fee?: number;
  /**
   * 歌曲状态
   */
  status?: number;
  /**
   * 歌曲版权信息
   */
  copyright?: number;
  /**
   * 艺术家信息
   */
  ar: SongAr[];
  /**
   * 专辑信息
   */
  al: SongAl;
  /**
   * 是否为喜欢的歌曲
   */
  liked?: boolean;
  /**
   * 音质信息
   */
  h?: SongQuality;
  m?: SongQuality;
  l?: SongQuality;
}

// 艺术家信息
export interface SongAr {
  /**
   * 艺术家ID
   */
  id: number;
  /**
   * 艺术家名称
   */
  name: string;
  /**
   * 艺术家别名
   */
  alias?: string[];
}

// 专辑信息
export interface SongAl {
  /**
   * 专辑ID
   */
  id: number;
  /**
   * 专辑名称
   */
  name: string;
  /**
   * 专辑封面URL
   */
  picUrl: string;
  /**
   * 专辑发布时间
   */
  publishTime?: number;
  /**
   * 专辑描述
   */
  description?: string;
}

// 音质信息
export interface SongQuality {
  /**
   * 音质ID
   */
  br?: number;
  /**
   * 音质文件大小
   */
  size?: number;
  /**
   * 音质MD5
   */
  md5?: string;
  /**
   * 音质类型
   */
  type?: string;
  /**
   * 音质URL
   */
  url?: string;
  /**
   * 音质自由选择
   */
  freeTrialInfo?: any;
  /**
   * 编码类型
   */
  encodeType?: string;
}

// 歌曲播放状态
export interface SongPlayState {
  /**
   * 是否播放中
   */
  playing: boolean;
  /**
   * 当前播放进度
   */
  currentTime: number;
  /**
   * 播放速率
   */
  playbackRate: number;
  /**
   * 播放模式（循环、随机、单曲循环）
   */
  playMode: 'loop' | 'random' | 'single';
  /**
   * 是否静音
   */
  muted: boolean;
  /**
   * 音量大小
   */
  volume: number;
}
