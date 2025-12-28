// 兼容性处理模块
import { isObject, isArray, isString, isNumber, isFunction } from "lodash";
import axios, { AxiosRequestConfig } from "axios";

/**
 * 浏览器类型检测结果
 */
export interface BrowserInfo {
  chrome: boolean;
  firefox: boolean;
  safari: boolean;
  edge: boolean;
  ie: boolean;
  opera: boolean;
  mobile: boolean;
  [key: string]: boolean;
}

/**
 * API兼容性配置
 */
export const apiCompatibilityConfig = {
  // 请求超时时间（毫秒）
  timeout: 10000,
  // 最大重试次数
  retryCount: 3,
  // 重试延迟时间（毫秒）
  retryDelay: 1000,
  // 是否在低版本浏览器中使用降级方案
  enableLegacyMode: true,
  // 允许的最大请求大小（字节）
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  // 启用压缩传输
  enableCompression: true,
};

/**
 * 兼容性工具类
 */
export class CompatibilityUtils {
  /**
   * 检测浏览器类型和版本
   * @returns 浏览器信息对象
   */
  static detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent;
    const browserInfo: BrowserInfo = {
      chrome: false,
      firefox: false,
      safari: false,
      edge: false,
      ie: false,
      opera: false,
      mobile: false,
    };

    // 检测移动设备
    browserInfo.mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // 检测Edge
    browserInfo.edge = /Edge\/(\d+\.\d+)/i.test(ua);

    // 检测IE
    browserInfo.ie = /Trident\/\d+\.\d+/i.test(ua);

    // 检测Chrome
    if (!browserInfo.edge) {
      browserInfo.chrome = /Chrome\/(\d+\.\d+)/i.test(ua);
    }

    // 检测Firefox
    browserInfo.firefox = /Firefox\/(\d+\.\d+)/i.test(ua);

    // 检测Safari
    if (!browserInfo.chrome && !browserInfo.edge) {
      browserInfo.safari = /Safari\/(\d+\.\d+)/i.test(ua);
    }

    // 检测Opera
    browserInfo.opera =
      /Opera\/(\d+\.\d+)/i.test(ua) || /OPR\/(\d+\.\d+)/i.test(ua);

    return browserInfo;
  }

  /**
   * 检测浏览器是否支持某个特性
   * @param feature 特性名称
   * @returns 是否支持
   */
  static isFeatureSupported(feature: string): boolean {
    // 检测常见特性支持
    const featureSupport: Record<string, () => boolean> = {
      // Promise支持检测
      Promise: () => typeof Promise !== "undefined",
      // Fetch API支持检测
      fetch: () => typeof fetch !== "undefined",
      // 跨域资源共享(CORS)支持检测
      cors: () => {
        try {
          return "credentials" in new XMLHttpRequest();
        } catch (e) {
          return false;
        }
      },
      // Web Storage支持检测
      localStorage: () => {
        try {
          const test = "__test__";
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
          return true;
        } catch (e) {
          return false;
        }
      },
      // IndexedDB支持检测
      indexedDB: () => "indexedDB" in window,
      // Web Workers支持检测
      webWorkers: () => "Worker" in window,
      // Service Worker支持检测
      serviceWorker: () => "serviceWorker" in navigator,
    };

    // 执行对应检测函数
    if (featureSupport[feature]) {
      return featureSupport[feature]();
    }

    // 默认为false
    return false;
  }

  /**
   * 安全的Fetch API调用，提供降级处理
   * @param url 请求URL
   * @param options 请求选项
   * @returns Promise<Response>
   */
  static async safeFetch(
    url: string,
    options?: RequestInit | AxiosRequestConfig
  ): Promise<Response> {
    // 检测浏览器是否支持Fetch API
    const supportsFetch = this.isFeatureSupported("fetch");
    const browserInfo = this.detectBrowser();

    try {
      if (supportsFetch && !browserInfo.ie) {
        // 现代浏览器使用fetch
        const fetchOptions = this.normalizeFetchOptions(options || {});

        // 处理GET请求的URL参数
        let finalUrl = url;
        if (
          "params" in options &&
          options.params &&
          fetchOptions.method === "GET"
        ) {
          const params = new URLSearchParams();
          Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value));
            }
          });
          const paramsString = params.toString();
          if (paramsString) {
            finalUrl = finalUrl.includes("?")
              ? `${finalUrl}&${paramsString}`
              : `${finalUrl}?${paramsString}`;
          }
        }

        // 处理请求大小限制
        if (fetchOptions.body && typeof fetchOptions.body === "string") {
          if (
            fetchOptions.body.length > apiCompatibilityConfig.maxRequestSize
          ) {
            throw new Error(
              `请求体大小超过限制 ${apiCompatibilityConfig.maxRequestSize} 字节`
            );
          }
        }

        // 添加CORS和凭证处理
        if (fetchOptions.mode !== "no-cors") {
          fetchOptions.mode = "cors";
          fetchOptions.credentials = "include";
        }

        return await fetch(finalUrl, fetchOptions);
      } else {
        // IE或不支持fetch的浏览器使用axios降级方案
        return await this.axiosToFetchResponse(
          url,
          (options as AxiosRequestConfig) || {}
        );
      }
    } catch (error) {
      console.error("Safe fetch error:", error);
      throw error;
    }
  }

  /**
   * 规范化Fetch选项
   * @param options 请求选项
   * @returns 规范化后的fetch选项
   */
  private static normalizeFetchOptions(
    options: RequestInit | AxiosRequestConfig
  ): RequestInit {
    const fetchOptions: RequestInit = {};

    // 复制基本属性
    if ("method" in options)
      fetchOptions.method = (options.method as string) || "GET";
    if ("headers" in options) fetchOptions.headers = options.headers;
    if ("body" in options) fetchOptions.body = options.body;
    if ("mode" in options) fetchOptions.mode = options.mode as RequestMode;
    if ("credentials" in options)
      fetchOptions.credentials = options.credentials as RequestCredentials;
    if ("cache" in options) fetchOptions.cache = options.cache as RequestCache;

    return fetchOptions;
  }

  /**
   * 将axios请求转换为fetch响应格式
   * @param url 请求URL
   * @param config axios配置
   * @returns Promise<Response>
   */
  private static async axiosToFetchResponse(
    url: string,
    config: AxiosRequestConfig
  ): Promise<Response> {
    try {
      // 发送axios请求
      const response = await axios({
        url,
        ...config,
        timeout: config.timeout || apiCompatibilityConfig.timeout,
      });

      // 构建Response对象
      const responseHeaders = new Headers();
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            responseHeaders.append(key, String(value));
          }
        });
      }

      // 根据响应类型创建body
      let body: BodyInit | null = null;
      if (response.data) {
        if (typeof response.data === "object") {
          body = JSON.stringify(response.data);
          responseHeaders.append("Content-Type", "application/json");
        } else if (typeof response.data === "string") {
          body = response.data;
        }
      }

      // 返回符合fetch API格式的响应
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Axios fallback error:", error);
      throw error;
    }
  }

  /**
   * 创建兼容各种浏览器的FormData对象
   * @param data 表单数据
   * @returns FormData对象
   */
  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    // 遍历数据并添加到FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File || value instanceof Blob) {
          // 文件或二进制数据直接添加
          formData.append(
            key,
            value,
            value instanceof File ? value.name : "file"
          );
        } else if (Array.isArray(value)) {
          // 数组类型数据
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, String(item));
          });
        } else if (typeof value === "object") {
          // 对象类型数据序列化为JSON字符串
          formData.append(key, JSON.stringify(value));
        } else {
          // 基本类型直接添加
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  /**
   * 安全的localStorage操作，提供降级处理
   */
  static localStorage = {
    /**
     * 设置本地存储项
     * @param key 键名
     * @param value 键值
     * @returns 是否设置成功
     */
    setItem(key: string, value: any): boolean {
      try {
        // 检测localStorage支持
        if (!CompatibilityUtils.isFeatureSupported("localStorage")) {
          // 降级到Cookie存储
          return CompatibilityUtils.cookie.setItem(key, String(value));
        }

        // 确保值是字符串
        const stringValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        localStorage.setItem(key, stringValue);
        return true;
      } catch (error) {
        console.error("Error setting localStorage item:", error);
        // 降级到Cookie存储
        return CompatibilityUtils.cookie.setItem(key, String(value));
      }
    },

    /**
     * 获取本地存储项
     * @param key 键名
     * @param defaultValue 默认值
     * @returns 存储的值或默认值
     */
    getItem<T = any>(key: string, defaultValue?: T): T | null {
      try {
        // 检测localStorage支持
        if (!CompatibilityUtils.isFeatureSupported("localStorage")) {
          // 降级到Cookie读取
          return (
            (CompatibilityUtils.cookie.getItem(key) as T) ||
            defaultValue ||
            null
          );
        }

        const value = localStorage.getItem(key);
        if (value === null) return defaultValue || null;

        // 尝试解析JSON
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      } catch (error) {
        console.error("Error getting localStorage item:", error);
        // 降级到Cookie读取
        return (
          (CompatibilityUtils.cookie.getItem(key) as T) || defaultValue || null
        );
      }
    },

    /**
     * 删除本地存储项
     * @param key 键名
     * @returns 是否删除成功
     */
    removeItem(key: string): boolean {
      try {
        // 检测localStorage支持
        if (!CompatibilityUtils.isFeatureSupported("localStorage")) {
          // 降级到Cookie删除
          return CompatibilityUtils.cookie.removeItem(key);
        }

        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error("Error removing localStorage item:", error);
        // 降级到Cookie删除
        return CompatibilityUtils.cookie.removeItem(key);
      }
    },

    /**
     * 清空所有本地存储
     * @returns 是否清空成功
     */
    clear(): boolean {
      try {
        // 检测localStorage支持
        if (!CompatibilityUtils.isFeatureSupported("localStorage")) {
          return false;
        }

        localStorage.clear();
        return true;
      } catch (error) {
        console.error("Error clearing localStorage:", error);
        return false;
      }
    },
  };

  /**
   * Cookie操作工具
   */
  static cookie = {
    /**
     * 设置Cookie
     * @param key 键名
     * @param value 键值
     * @param days 过期天数
     * @returns 是否设置成功
     */
    setItem(key: string, value: string, days = 30): boolean {
      try {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        const cookie = `${key}=${encodeURIComponent(
          value
        )};expires=${expires.toUTCString()};path=/`;
        document.cookie = cookie;
        return true;
      } catch (error) {
        console.error("Error setting cookie:", error);
        return false;
      }
    },

    /**
     * 获取Cookie
     * @param key 键名
     * @returns Cookie值或null
     */
    getItem(key: string): string | null {
      try {
        const cookieName = `${key}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(";");

        for (let i = 0; i < cookieArray.length; i++) {
          let cookie = cookieArray[i];
          while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1);
          }
          if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
          }
        }
        return null;
      } catch (error) {
        console.error("Error getting cookie:", error);
        return null;
      }
    },

    /**
     * 删除Cookie
     * @param key 键名
     * @returns 是否删除成功
     */
    removeItem(key: string): boolean {
      try {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        return true;
      } catch (error) {
        console.error("Error removing cookie:", error);
        return false;
      }
    },
  };

  /**
   * 处理URL参数的兼容性方法
   * @param url URL字符串
   * @returns URLSearchParams对象
   */
  static getUrlParams(url: string = window.location.href): URLSearchParams {
    // 获取URL中的查询字符串部分
    const queryString = url.split("?")[1] || "";

    // 创建URLSearchParams对象
    return new URLSearchParams(queryString);
  }
}
