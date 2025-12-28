// 排行榜详情相关模型定义

/**
 * 排行榜简要信息
 */
export interface TopList {
  /**
   * 排行榜ID
   */
  id: number;
  /**
   * 排行榜名称
   */
  name: string;
  /**
   * 排行榜封面URL
   */
  coverImgUrl: string;
  /**
   * 排行榜更新频率
   */
  updateFrequency: string;
  /**
   * 排行榜描述
   */
  description: string;
  /**
   * 排行榜类型
   */
  type: number;
  /**
   * 排行榜标签
   */
  ToplistType: number;
  /**
   * 排行榜历史数据
   */
  history?: boolean;
  /**
   * 排行榜是否为全球榜
   */
  isGlobal: boolean;
}

/**
 * 排行榜详情
 */
export interface TopListDetail extends TopList {
  /**
   * 排行榜数据
   */
  playlist: {
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
    description: string;
    /**
     * 歌单创建者
     */
    creator: {
      /**
       * 创建者ID
       */
      id: number;
      /**
       * 创建者名称
       */
      nickname: string;
    };
    /**
     * 歌曲列表
     */
    tracks: {
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
      duration: number;
      /**
       * 艺术家信息
       */
      ar: {
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
      al: {
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
        picUrl: string;
      };
      /**
       * 排行榜排名信息
       */
      tns?: string[];
      /**
       * MVID
       */
      mv?: number;
    }[];
    /**
     * 歌曲数量
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
     * 播放次数
     */
    playCount: number;
    /**
     * 订阅人数
     */
    subscribedCount: number;
  };
  /**
   * 排行榜更新时间
   */
  updateTime: number;
  /**
   * 排行榜周期
   */
  updateFrequency: string;
  /**
   * 排行榜历史记录
   */
  history?: boolean;
  /**
   * 排行榜得分
   */
  score: number;
}

/**
 * 排行榜列表响应
 */
export interface TopListResponse {
  /**
   * 全部排行榜
   */
  list: TopList[];
  /**
   * 官方榜
   */
  officialList?: TopList[];
  /**
   * 全球榜
   */
  globalList?: TopList[];
  /**
   * 其他榜单
   */
  otherList?: TopList[];
  /**
   * 响应状态码
   */
  code: number;
}

/**
 * 排行榜详情响应
 */
export interface TopListDetailResponse {
  /**
   * 排行榜详情数据
   */
  list: TopListDetail;
  /**
   * 响应状态码
   */
  code: number;
}