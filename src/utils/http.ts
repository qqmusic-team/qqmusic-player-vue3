import axios from "axios";
import networkLogger from "./networkLogger";

// 替换原来的 baseURL 配置"https://netease-cloud-music-api-liart-mu.vercel.app/"（国外）
//国内部署的接口地址"http://1394200796-77l4g2jhjv.ap-guangzhou.tencentscf.com"
axios.defaults.baseURL = "http://1394200796-77l4g2jhjv.ap-guangzhou.tencentscf.com/";
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

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    // ✅ 过滤掉不能序列化的参数（如 signal）
    const params = config.params || {};
    const filteredParams: any = {};

    for (const key in params) {
      if (params.hasOwnProperty(key) && typeof params[key] !== 'object') {
        filteredParams[key] = params[key];
      } else if (key !== 'signal' && typeof params[key] === 'object' && params[key] !== null) {
        // 保留可序列化的对象
        if (!(params[key] instanceof AbortSignal)) {
          filteredParams[key] = params[key];
        }
      }
    }

    // ✅ 确保 params 一定是对象
    config.params = {
      ...filteredParams,
      t: Date.now(),
      timestamp: Date.now(),
      // 为敏感接口添加随机IP，避免安全验证
      ...(config.url?.includes('/song/url') || config.url?.includes('/song/detail') ? {
        realIP: `116.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      } : {})
    };

    // ✅ 自动添加 cookie（关键：encodeURIComponent）
    const cookie = getCookie();
    if (cookie) {
      config.params.cookie = encodeURIComponent(cookie);
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use((response) => {
  const data = response.data;
  if (data?.code === 301) {
    console.warn("⚠️ Cookie 已失效，请重新设置");
  }
  return response;
}, (error) => {
  // 统一处理-462安全验证错误
  const errorData = error.response?.data;
  if (errorData?.code === -462) {
    console.error("🚨 安全验证错误（-462）:", {
      message: "网易云音乐需要进行安全验证",
      verifyInfo: {
        verifyId: errorData.verifyId,
        verifyType: errorData.verifyType,
        verifyUrl: errorData.verifyUrl
      },
      request: {
        url: error.config.url,
        method: error.config.method,
        params: error.config.params
      }
    });

    // 自动打开验证页面
    if (errorData.verifyUrl && typeof window !== 'undefined') {
      // 添加随机参数，避免缓存
      const verifyUrlWithParams = `${errorData.verifyUrl}&t=${Date.now()}`;
      window.open(verifyUrlWithParams, '_blank', 'width=500,height=600');

      // 显示提示信息给用户
      if (typeof window !== 'undefined' && !window.verifyAlertShown) {
        window.verifyAlertShown = true;
        setTimeout(() => {
          alert('网易云音乐需要进行安全验证，请在新打开的窗口中完成验证后重试。');
          window.verifyAlertShown = false;
        }, 500);
      }
    }
  }
  return Promise.reject(error);
});

// 为window对象添加verifyAlertShown属性
if (typeof window !== 'undefined') {
  (window as any).verifyAlertShown = false;
}


interface Http {
  get<T>(url: string, params?: unknown): Promise<T>;

  post<T>(url: string, params?: unknown): Promise<T>;

  upload<T>(url: string, params: unknown): Promise<T>;

  put<T>(url: string, params: unknown): Promise<T>;

  delete<T>(url: string, params: unknown): Promise<T>;

  download(url: string): void;
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
        .get(url, { params })
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers,
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

          if (err.response) {
            networkLogger.logError(
              {
                type: "HTTP 响应错误",
                message: err.message || "请求失败（有响应）",
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
            networkLogger.logError(
              {
                type: "网络错误",
                message: err.message || "网络请求失败",
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
            networkLogger.logError(
              {
                type: "请求配置错误",
                message: err.message || "请求配置错误",
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
              headers: res.headers,
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

          if (err.response) {
            networkLogger.logError(
              {
                type: "HTTP 响应错误",
                message: err.message || "请求失败（有响应）",
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
            networkLogger.logError(
              {
                type: "网络错误",
                message: err.message || "网络请求失败",
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
            networkLogger.logError(
              {
                type: "请求配置错误",
                message: err.message || "请求配置错误",
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
              headers: res.headers,
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

          if (err.response) {
            networkLogger.logError(
              {
                type: "HTTP 响应错误",
                message: err.message || "请求失败（有响应）",
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
            networkLogger.logError(
              {
                type: "网络错误",
                message: err.message || "网络请求失败",
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
            networkLogger.logError(
              {
                type: "请求配置错误",
                message: err.message || "请求配置错误",
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
        .delete(url, { params })
        .then((res) => {
          networkLogger.logResponse(
            {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers,
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

          if (err.response) {
            networkLogger.logError(
              {
                type: "HTTP 响应错误",
                message: err.message || "请求失败（有响应）",
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
            networkLogger.logError(
              {
                type: "网络错误",
                message: err.message || "网络请求失败",
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
            networkLogger.logError(
              {
                type: "请求配置错误",
                message: err.message || "请求配置错误",
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
              headers: res.headers,
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

          if (err.response) {
            networkLogger.logError(
              {
                type: "HTTP 响应错误",
                message: err.message || "请求失败（有响应）",
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
            networkLogger.logError(
              {
                type: "网络错误",
                message: err.message || "网络请求失败",
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
            networkLogger.logError(
              {
                type: "请求配置错误",
                message: err.message || "请求配置错误",
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
    };

    iframe.onerror = function () {
      document.body.removeChild(iframe);
      networkLogger.logError(
        {
          type: "下载错误",
          message: "文件下载失败",
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
