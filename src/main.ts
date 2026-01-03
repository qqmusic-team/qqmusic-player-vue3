import "./assets/main.css";
import "./types/global.d.ts";

import { createApp } from "vue";
import { createPinia } from "pinia";
import "element-plus/dist/index.css";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import VueVirtualScroller from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import App from "./App.vue";
import router from "./router";
import "@/utils/extend";
import { setCookie } from "./utils/http";

const app = createApp(App);

// 设置网易云音乐 Cookie
// 请将下面的 cookie 字符串替换为你自己的 cookie
const NETEASE_COOKIE = "MUSIC_U=; __csrf=xxx; ...";
if (NETEASE_COOKIE && NETEASE_COOKIE !== "MUSIC_U=; __csrf=xxx; ...") {
  setCookie(NETEASE_COOKIE);
  console.log("✅ 网易云音乐 Cookie 已设置");
} else {
  console.warn("⚠️ 请在 main.ts 中设置你的网易云音乐 Cookie");
}

app.use(createPinia());
app.use(router);
app.use(ElementPlus);
app.use(VueVirtualScroller);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 【全局捕获未处理异常】
window.addEventListener("error", (event) => {
  console.error("全局 error 事件捕获:", event.error);
  if (window.showErrorModal) {
    window.showErrorModal("代码崩溃了！", { message: event.message, error: event.error }, null);
  } else {
    alert("代码崩溃了！请打开控制台查看详情：\n" + event.message);
  }
});

// 【全局捕获未处理的 Promise 拒绝】
window.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的 Promise 拒绝:", event.reason);
  if (window.showErrorModal) {
    window.showErrorModal("异步代码崩溃了！", { reason: event.reason }, null);
  } else {
    alert("异步代码崩溃了！请打开控制台查看：\n" + (event.reason?.message || event.reason));
  }
});

// 【Vue 特定的错误捕获（推荐一起加）】
app.config.errorHandler = (err, vm, info) => {
  console.error("Vue errorHandler 捕获:", err, info);
  if (window.showErrorModal) {
    window.showErrorModal("Vue 组件内错误！", { error: err, info: info }, null);
  } else {
    alert(
      "Vue 组件内错误！\n" + (err instanceof Error ? err.message : String(err)) + "\n位置：" + info
    );
  }
};
app.mount("#app");
