// 搜索相关模型定义

/**
 * 搜索类型枚举
 */
export enum SearchType {
  /** 单曲 */
  SONG = 1,
  /** 专辑 */
  ALBUM = 10,
  /** 歌手 */
  ARTIST = 100,
  /** 歌单 */
  PLAYLIST = 1000,
  /** 用户 */
  USER = 1002,
  /** MV */
  MV = 1004,
  /** 歌词 */
  LYRIC = 1006,
  /** 电台 */
  RADIO = 1009,
  /** 视频 */
  VIDEO = 1014,
  /** 综合 */
  ALL = 1018,
}

/**
 * 搜索建议项
 */
export interface SearchSuggestion {
  /**
   * 建议关键词
   */
  keyword: string;
  /**
   * 建议类型
   */
  type?: number;
  /**
   * 建议ID
   */
  id?: number;
  /**
   * 建议描述
   */
  transname?: string;
}

/**
 * 搜索建议响应
 */
export interface SearchSuggestionResponse {
  /**
   * 热门搜索关键词
   */
  hot: SearchSuggestion[];
  /**
   * 搜索建议列表
   */
  result: {
    /**
     * 关键词建议
     */
    allMatch?: SearchSuggestion[];
    /**
     * 艺术家建议
     */
    artists?: SearchSuggestion[];
    /**
     * 专辑建议
     */
    albums?: SearchSuggestion[];
    /**
     * 歌单建议
     */
    playlists?: SearchSuggestion[];
    /**
     * 用户建议
     */
    users?: SearchSuggestion[];
    /**
     * MV建议
     */
    mvs?: SearchSuggestion[];
    /**
     * 视频建议
     */
    videos?: SearchSuggestion[];
  };
}

/**
 * 搜索结果响应
 */
export interface SearchResultResponse {
  /**
   * 搜索结果
   */
  result: {
    /**
     * 单曲搜索结果
     */
    songs?: {
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
       * 歌曲时长
       */
      duration?: number;
      /**
       * 歌曲版本
       */
      version?: string;
      /**
       * 艺术家信息
       */
      artists: {
        /**
         * 艺术家ID
         */
        id: number;
        /**
         * 艺术家名称
         */
        name: string;
      }[];
      /**
       * 专辑信息
       */
      album: {
        /**
         * 专辑ID
         */
        id: number;
        /**
         * 专辑名称
         */
        name: string;
      };
    }[];
    /**
     * 单曲总数
     */
    songCount?: number;
    /**
     * 歌单搜索结果
     */
    playlists?: {
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
      coverImgUrl?: string;
      /**
       * 歌单歌曲数量
       */
      trackCount?: number;
      /**
       * 歌单播放次数
       */
      playCount?: number;
      /**
       * 歌单创建者
       */
      creator?: {
        /**
         * 创建者ID
         */
        userId: number;
        /**
         * 创建者昵称
         */
        nickname: string;
      };
    }[];
    /**
     * 艺术家搜索结果
     */
    artists?: {
      /**
       * 艺术家ID
       */
      id: number;
      /**
       * 艺术家名称
       */
      name: string;
      /**
       * 艺术家粉丝数
       */
      fansCount?: number;
      /**
       * 艺术家头像
       */
      img1v1Url?: string;
    }[];
    /**
     * 专辑搜索结果
     */
    albums?: {
      /**
       * 专辑ID
       */
      id: number;
      /**
       * 专辑名称
       */
      name: string;
      /**
       * 专辑封面
       */
      picUrl?: string;
      /**
       * 专辑发布时间
       */
      publishTime?: number;
      /**
       * 专辑艺术家
       */
      artist: {
        /**
         * 艺术家ID
         */
        id: number;
        /**
         * 艺术家名称
         */
        name: string;
      };
    }[];
    /**
     * MV搜索结果
     */
    mvs?: {
      /**
       * MV ID
       */
      id: number;
      /**
       * MV名称
       */
      name: string;
      /**
       * MV封面
       */
      coverUrl?: string;
      /**
       * MV播放次数
       */
      playCount?: number;
      /**
       * MV时长
       */
      duration?: number;
      /**
       * MV作者
       */
      artistName?: string;
    }[];
  };
  /**
   * 响应状态码
   */
  code: number;
}
