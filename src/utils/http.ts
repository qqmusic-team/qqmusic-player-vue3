import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// 响应类型定义
export interface ResType<T = any> {
  code: number;
  data?: T;
  message?: string;
}

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加日志记录
    console.log("API请求:", {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
    });

    // 统一添加时间戳，防止缓存
    if (config.params) {
      config.params.timestamp = Date.now();
    } else {
      config.params = { timestamp: Date.now() };
    }

    return config;
  },
  (error: any) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    console.log(
      `[HTTP] 响应: ${response.config.method?.toUpperCase()} ${response.config.url} - 状态码: ${
        response.status
      }`
    );
    console.log("[HTTP] 响应数据:", response.data);

    return response.data;
  },
  (error) => {
    console.error(`[HTTP] 请求失败:`, error);

    // 错误处理
    const errorMessage = error.response
      ? `请求失败，错误码: ${error.response.status || "undefined"}`
      : error.request
      ? `网络请求失败，请检查网络连接`
      : error.message
      ? `请求错误: ${error.message}`
      : "未知错误";

    console.error(`[HTTP] 错误信息:`, errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// 导出单独的方法以兼容原有导入方式
export const get = <T = any>(url: string, params?: any): Promise<ResType<T>> => {
  return service.get(url, { params });
};

export const post = <T = any>(url: string, data?: any, params?: any): Promise<ResType<T>> => {
  return service.post(url, data, { params });
};

export const put = <T = any>(url: string, data?: any, params?: any): Promise<ResType<T>> => {
  return service.put(url, data, { params });
};

export const del = <T = any>(url: string, params?: any): Promise<ResType<T>> => {
  return service.delete(url, { params });
};

// 封装HTTP请求对象
export const http = {
  get,
  post,
  put,
  delete: del,
  // 添加取消请求功能
  cancelToken: axios.CancelToken,
  isCancel: axios.isCancel,
};

export default http;
