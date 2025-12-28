// 歌曲URL相关模型定义

/**
 * 歌曲URL接口
 */
export interface SongUrl {
  /**
   * 歌曲ID
   */
  id: number;
  /**
   * URL获取状态码
   */
  code: number;
  /**
   * 歌曲URL
   */
  url?: string;
  /**
   * 歌曲大小
   */
  size?: number;
  /**
   * 歌曲比特率
   */
  br?: number;
  /**
   * URL加密签名
   */
  encodeType?: string;
  /**
   * 歌曲类型
   */
  type?: string;
  /**
   * 歌曲MD5值
   */
  md5?: string;
  /**
   * 播放状态权限信息
   */
  freeTrialInfo?: any;
  /**
   * 音频格式
   */
  encodeType?: string;
  /**
   * 协议类型
   */
  protocol?: string;
  /**
   * 平台限制信息
   */
  platform?: number;
  /**
   * 时间限制信息
   */
  sp?: number;
  /**
   * 版权方信息
   */
  cp?: number;
  /**
   * 资源来源
   */
  uf?: any;
  /**
   * 访问权限信息
   */
  payed?: number;
  /**
   * 免费试听信息
   */
  flag?: number;
  /**
   * 资源类型
   */
  level?: string;
  /**
   * 音质等级
   */
  encodeLevel?: string;
  /**
   * 体验版信息
   */
  freeTrialPrivilege?: {
    /**
     * 是否免费试听
     */
    resConsumable?: boolean;
    /**
     * 免费试听时长
     */
    userConsumable?: boolean;
    /**
     * 免费试听状态
     */
    listenType?: any;
  };
  /**
   * 收费信息
   */
  fee?: number;
  /**
   * 下载权限信息
   */
  downloadPrivilege?: {
    /**
     * 是否可下载
     */
    resConsumable?: boolean;
    /**
     * 下载付费状态
     */
    userConsumable?: boolean;
    /**
     * 下载VIP权限
     */
    needPay?: number;
    /**
     * 下载价格
     */
    price?: number;
    /**
     * 下载付费信息
     */
    payed?: number;
    /**
     * 赠送信息
     */
    chargeInfoList?: any[];
  };
}
