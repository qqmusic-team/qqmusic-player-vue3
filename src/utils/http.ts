
import axios, { type AxiosRequestConfig } from "axios";
import networkLogger from "./networkLogger";

// 替换原来的 baseURL 配置
axios.defaults.baseURL = "https://netease-cloud-music-api-liart-mu.vercel.app/";
axios.defaults.timeout = 20 * 1000;
axios.defaults.maxBodyLength = 5 * 1024 * 1024;
axios.defaults.withCredentials = true;
axios.defaults.maxRedirects = 5;

// Cookie 管理
const COOKIE_KEY = "netease_music_cookie";

export const getCookie = (): string | null => {
  return localStorage.getItem(COOKIE_KEY);
};

export const setCookie = (cookie: string): void => {
  localStorage.setItem(COOKIE_KEY, cookie);
};

export const removeCookie = (): void => {
  localStorage.removeItem(COOKIE_KEY);
};

// 设置你的网易云音乐 cookie（从浏览器开发者工具中获取）
// 在浏览器登录网易云音乐后，按 F12 打开开发者工具
// 在 Application/Storage -> Cookies -> music.163.com 中复制所有 cookie
// 然后调用 setCookie("你的cookie字符串") 即可
// 示例：
// import { setCookie } from './utils/http'
// setCookie("MUSIC_U=xxx; __csrf=xxx; ...")

axios.interceptors.request.use(
  (config: AxiosRequestConfig | Record<string, unknown>) => {
    config.params = {
      ...config.params,
      t: Date.now(),
    };

    // 自动添加 cookie
    const cookie = getCookie();
    if (cookie) {
      config.params.cookie = cookie;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

interface Http {
  get<T>(_url: string, _params?: unknown): Promise<T>;

  post<T>(_url: string, _params?: unknown): Promise<T>;

  upload<T>(_url: string, _params: unknown): Promise<T>;

  put<T>(_url: string, _params: unknown): Promise<T>;

  delete<T>(_url: string, _params: unknown): Promise<T>;

  download(_url: string): void;
}

const http: Http = {
  get(url, params) {
    return new Promise((resolve, reject) => {
      const requestId = networkLogger.generateRequestId();

      networkLogger.logRequest(
        {
          method: "GET",
          url: url,
          params: params,
        },
        requestId,
        "API"
      );

      axios
        .get(url, { params: params })
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers as Record<string, string | number | boolean | string[]>,
              data: res.data,
            },
            requestId,
            "API"
          );

          resolve(res.data);
        })
        .catch((err) => {
          let errorDetails = {
            url: url,
            method: "GET",
            params: params,
            status: 0,
            message: "",
            data: "",
            statusText: "",
          };

          console.error("=".repeat(80));
          console.error(`[HTTP Error] GET 请求失败`);
          console.error("=".repeat(80));
          console.error(`请求URL: ${url}`);
          console.error(`请求方法: GET`);
          console.error(`请求参数:`, params);
          console.error(`错误对象:`, err);

          if (err.response) {
            console.error(`状态码: ${err.response.status}`);
            console.error(`状态文本: ${err.response.statusText}`);
            console.error(`响应数据:`, err.response.data);
            console.error(`响应头:`, err.response.headers);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "HTTP Response Error",
                message: err.message || "Request failed with response",
                status: err.response.status,
                statusText: err.response.statusText,
                requestId: requestId,
              },
              {
                method: "GET",
                url: url,
                params: params,
              },
              "API"
            );

            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.get(url, params),
                err.response.status
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error(`错误类型: 请求超时或网络错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Network Error",
                message: err.message || "Network request failed",
                requestId: requestId,
              },
              {
                method: "GET",
                url: url,
                params: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.get(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error(`错误类型: 请求配置错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Request Config Error",
                message: err.message || "Request configuration error",
                requestId: requestId,
              },
              {
                method: "GET",
                url: url,
                params: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("请求配置错误", errorDetails, () => http.get(url, params));
            }
            reject({ message: "请求配置错误" });
          }
          console.error("=".repeat(80));
        });
    });
  },

  post(url, params) {
    return new Promise((resolve, reject) => {
      const requestId = networkLogger.generateRequestId();

      networkLogger.logRequest(
        {
          method: "POST",
          url: url,
          data: params,
        },
        requestId,
        "API"
      );

      axios
        .post(url, JSON.stringify(params))
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers as Record<string, string | number | boolean | string[]>,
              data: res.data,
            },
            requestId,
            "API"
          );

          resolve(res.data);
        })
        .catch((err) => {
          let errorDetails = {
            url: url,
            method: "POST",
            params: params,
            status: 0,
            message: "",
            data: "",
            statusText: "",
          };

          console.error("=".repeat(80));
          console.error(`[HTTP Error] POST 请求失败`);
          console.error("=".repeat(80));
          console.error(`请求URL: ${url}`);
          console.error(`请求方法: POST`);
          console.error(`请求参数:`, params);
          console.error(`错误对象:`, err);

          if (err.response) {
            console.error(`状态码: ${err.response.status}`);
            console.error(`状态文本: ${err.response.statusText}`);
            console.error(`响应数据:`, err.response.data);
            console.error(`响应头:`, err.response.headers);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "HTTP Response Error",
                message: err.message || "Request failed with response",
                status: err.response.status,
                statusText: err.response.statusText,
                requestId: requestId,
              },
              {
                method: "POST",
                url: url,
                data: params,
              },
              "API"
            );

            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.post(url, params)
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error(`错误类型: 请求超时或网络错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Network Error",
                message: err.message || "Network request failed",
                requestId: requestId,
              },
              {
                method: "POST",
                url: url,
                data: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.post(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error(`错误类型: 请求配置错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Request Config Error",
                message: err.message || "Request configuration error",
                requestId: requestId,
              },
              {
                method: "POST",
                url: url,
                data: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("请求配置错误", errorDetails, () => http.post(url, params));
            }
            reject({ message: "请求配置错误" });
          }
          console.error("=".repeat(80));
        });
    });
  },

  put(url, params) {
    return new Promise((resolve, reject) => {
      const requestId = networkLogger.generateRequestId();

      networkLogger.logRequest(
        {
          method: "PUT",
          url: url,
          data: params,
        },
        requestId,
        "API"
      );

      axios
        .put(url, JSON.stringify(params))
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers as Record<string, string | number | boolean | string[]>,
              data: res.data,
            },
            requestId,
            "API"
          );

          resolve(res.data);
        })
        .catch((err) => {
          let errorDetails = {
            url: url,
            method: "PUT",
            params: params,
            status: 0,
            message: "",
            data: "",
            statusText: "",
          };

          console.error("=".repeat(80));
          console.error(`[HTTP Error] PUT 请求失败`);
          console.error("=".repeat(80));
          console.error(`请求URL: ${url}`);
          console.error(`请求方法: PUT`);
          console.error(`请求参数:`, params);
          console.error(`错误对象:`, err);

          if (err.response) {
            console.error(`状态码: ${err.response.status}`);
            console.error(`状态文本: ${err.response.statusText}`);
            console.error(`响应数据:`, err.response.data);
            console.error(`响应头:`, err.response.headers);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "HTTP Response Error",
                message: err.message || "Request failed with response",
                status: err.response.status,
                statusText: err.response.statusText,
                requestId: requestId,
              },
              {
                method: "PUT",
                url: url,
                data: params,
              },
              "API"
            );

            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.put(url, params),
                err.response.status
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error(`错误类型: 请求超时或网络错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Network Error",
                message: err.message || "Network request failed",
                requestId: requestId,
              },
              {
                method: "PUT",
                url: url,
                data: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.put(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error(`错误类型: 请求配置错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Request Config Error",
                message: err.message || "Request configuration error",
                requestId: requestId,
              },
              {
                method: "PUT",
                url: url,
                data: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("请求配置错误", errorDetails, () => http.put(url, params));
            }
            reject({ message: "请求配置错误" });
          }
          console.error("=".repeat(80));
        });
    });
  },

  delete(url, params) {
    return new Promise((resolve, reject) => {
      const requestId = networkLogger.generateRequestId();

      networkLogger.logRequest(
        {
          method: "DELETE",
          url: url,
          params: params,
        },
        requestId,
        "API"
      );

      axios
        .delete(url, { params: params })
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers as Record<string, string | number | boolean | string[]>,
              data: res.data,
            },
            requestId,
            "API"
          );

          resolve(res.data);
        })
        .catch((err) => {
          let errorDetails = {
            url: url,
            method: "DELETE",
            params: params,
            status: 0,
            message: "",
            data: "",
            statusText: "",
          };

          console.error("=".repeat(80));
          console.error(`[HTTP Error] DELETE 请求失败`);
          console.error("=".repeat(80));
          console.error(`请求URL: ${url}`);
          console.error(`请求方法: DELETE`);
          console.error(`请求参数:`, params);
          console.error(`错误对象:`, err);

          if (err.response) {
            console.error(`状态码: ${err.response.status}`);
            console.error(`状态文本: ${err.response.statusText}`);
            console.error(`响应数据:`, err.response.data);
            console.error(`响应头:`, err.response.headers);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "HTTP Response Error",
                message: err.message || "Request failed with response",
                status: err.response.status,
                statusText: err.response.statusText,
                requestId: requestId,
              },
              {
                method: "DELETE",
                url: url,
                params: params,
              },
              "API"
            );

            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.delete(url, params),
                err.response.status
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error(`错误类型: 请求超时或网络错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Network Error",
                message: err.message || "Network request failed",
                requestId: requestId,
              },
              {
                method: "DELETE",
                url: url,
                params: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.delete(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error(`错误类型: 请求配置错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Request Config Error",
                message: err.message || "Request configuration error",
                requestId: requestId,
              },
              {
                method: "DELETE",
                url: url,
                params: params,
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("请求配置错误", errorDetails, () => http.delete(url, params));
            }
            reject({ message: "请求配置错误" });
          }
          console.error("=".repeat(80));
        });
    });
  },

  upload(url, file) {
    return new Promise((resolve, reject) => {
      const requestId = networkLogger.generateRequestId();

      networkLogger.logRequest(
        {
          method: "UPLOAD",
          url: url,
          data: {
            fileName: (file as File)?.name || "unknown",
            fileSize: (file as File)?.size || 0,
            fileType: (file as File)?.type || "unknown",
          },
        },
        requestId,
        "API"
      );

      axios
        .post(url, file, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers as Record<string, string | number | boolean | string[]>,
              data: res.data,
            },
            requestId,
            "API"
          );

          resolve(res.data);
        })
        .catch((err) => {
          let errorDetails = {
            url: url,
            method: "UPLOAD",
            fileName: (file as File)?.name || "unknown",
            status: 0,
            message: "",
            data: "",
            statusText: "",
          };

          console.error("=".repeat(80));
          console.error(`[HTTP Error] UPLOAD 请求失败`);
          console.error("=".repeat(80));
          console.error(`请求URL: ${url}`);
          console.error(`请求方法: UPLOAD`);
          console.error(`文件名: ${(file as File)?.name || "unknown"}`);
          console.error(`文件大小: ${(file as File)?.size || 0} bytes`);
          console.error(`错误对象:`, err);

          if (err.response) {
            console.error(`状态码: ${err.response.status}`);
            console.error(`状态文本: ${err.response.statusText}`);
            console.error(`响应数据:`, err.response.data);
            console.error(`响应头:`, err.response.headers);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "HTTP Response Error",
                message: err.message || "Request failed with response",
                status: err.response.status,
                statusText: err.response.statusText,
                requestId: requestId,
              },
              {
                method: "UPLOAD",
                url: url,
                data: {
                  fileName: (file as File)?.name || "unknown",
                  fileSize: (file as File)?.size || 0,
                },
              },
              "API"
            );

            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `上传失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.upload(url, file)
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error(`错误类型: 请求超时或网络错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Network Error",
                message: err.message || "Network request failed",
                requestId: requestId,
              },
              {
                method: "UPLOAD",
                url: url,
                data: {
                  fileName: (file as File)?.name || "unknown",
                  fileSize: (file as File)?.size || 0,
                },
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.upload(url, file)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error(`错误类型: 请求配置错误`);
            console.error(`错误消息: ${err.message}`);
            console.error(`错误堆栈:`, err.stack);

            networkLogger.logError(
              {
                type: "Request Config Error",
                message: err.message || "Request configuration error",
                requestId: requestId,
              },
              {
                method: "UPLOAD",
                url: url,
                data: {
                  fileName: (file as File)?.name || "unknown",
                  fileSize: (file as File)?.size || 0,
                },
              },
              "API"
            );

            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("请求配置错误", errorDetails, () => http.upload(url, file));
            }
            reject({ message: "请求配置错误" });
          }
          console.error("=".repeat(80));
        });
    });
  },

  download(url) {
    const requestId = networkLogger.generateRequestId();

    networkLogger.logResourceLoad(url, requestId, "DOWNLOAD");

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    iframe.onload = function () {
      document.body.removeChild(iframe);
      console.log(`[DOWNLOAD COMPLETE] [${requestId}] File download initiated: ${url}`);
    };

    iframe.onerror = function () {
      document.body.removeChild(iframe);
      networkLogger.logError(
        {
          type: "Download Error",
          message: "Failed to download file",
          requestId: requestId,
        },
        {
          method: "DOWNLOAD",
          url: url,
        },
        "RESOURCE"
      );
    };

    document.body.appendChild(iframe);
  },
};

export default http;
