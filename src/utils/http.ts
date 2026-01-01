import axios, { type AxiosRequestConfig } from "axios";

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
  (config: AxiosRequestConfig | any) => {
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

interface ResType<T> {
  code: number;
  data?: T;
  msg: string;
  err?: string;
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
      axios
        .get(url, { params })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error(`GET ${url} 请求失败:`, err);
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
            console.error("响应错误:", err.response.status, err.response.data);
            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.get(url, params)
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error("请求超时或网络错误:", err.message);
            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.get(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error("请求配置错误:", err.message);
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
      axios
        .post(url, JSON.stringify(params))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error(`POST ${url} 请求失败:`, err);
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
            console.error("响应错误:", err.response.status, err.response.data);
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
            console.error("请求超时或网络错误:", err.message);
            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.post(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error("请求配置错误:", err.message);
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
      axios
        .put(url, JSON.stringify(params))
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error(`PUT ${url} 请求失败:`, err);
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
            console.error("响应错误:", err.response.status, err.response.data);
            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.put(url, params)
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error("请求超时或网络错误:", err.message);
            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.put(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error("请求配置错误:", err.message);
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
      axios
        .delete(url, { params })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error(`DELETE ${url} 请求失败:`, err);
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
            console.error("响应错误:", err.response.status, err.response.data);
            errorDetails.status = err.response.status;
            errorDetails.statusText = err.response.statusText;
            errorDetails.data = err.response.data;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                `请求失败: ${err.response.status} ${err.response.statusText}`,
                errorDetails,
                () => http.delete(url, params)
              );
            }
            reject(err.response.data || err.response);
          } else if (err.request) {
            console.error("请求超时或网络错误:", err.message);
            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.delete(url, params)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error("请求配置错误:", err.message);
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
      axios
        .post(url, file, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          console.error(`UPLOAD ${url} 请求失败:`, err);
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
            console.error("响应错误:", err.response.status, err.response.data);
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
            console.error("请求超时或网络错误:", err.message);
            errorDetails.message = err.message;

            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal("网络请求失败，请检查网络连接", errorDetails, () =>
                http.upload(url, file)
              );
            }
            reject({ message: "网络请求失败，请检查网络连接" });
          } else {
            console.error("请求配置错误:", err.message);
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
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    iframe.onload = function () {
      document.body.removeChild(iframe);
    };

    document.body.appendChild(iframe);
  },
};

export default http;
