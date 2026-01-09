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

import http, { getCookie, setCookie } from "@/utils/http";

// ✅ 开发调试：在浏览器控制台可以用 http.get(...) 测接口
// @ts-expect-error - dev debug only
window.http = http;

const app = createApp(App);

// =====================【网易云音乐 Cookie 配置】=====================
// ⚠️ Cookie 属于敏感信息，不建议提交到 GitHub / 公开仓库
// 建议从浏览器控制台 copy(document.cookie) 获取整串，粘贴到这里
// ⚠️ 注意：必须写成【同一行】，不要换行！！
const NETEASE_COOKIE = `MUSIC_U=00462189FC327B674CE2C0A03976F1FA956E1030B94DDAFB2C53068482B65A6A5E62EA21C337CA85D05FCF0B8E8E83F58C27AB7359AC24943DDEF1A0C82A19AA7F43AC5B5D2DFADE324D667F2FB16C7679F18111E565901BEC5C92FDEB095201CC770D100FC5E1549817FEF82216C11B656923C702E54705939835CBE20F42689225539B899DD402B72F7E8C8409455F1A18EBC17D0E8A2444C260BE1E5AE5152D3CED3C241385A182234A1666486D11817C2E3AE0662A5F69D100949742D3319011270050F99D4F3DF666FC95B6438273EC635E150926A289F9DC5DA74AD05FC0CEADAD056FDFB4A45BD20AD238B2538EAB392C52F1EC4AA0E1AA8A3545EAC7F251AEB44DB9AC6024E5C5659A36FB12F3562E4C626FD4388131EF4DBAE6B7FCA6C57D4655C7F3C13DA177D02DF9916B72BD8BBAEA4C193406148CDB18D48B2E2D842AAD495C4A77E7BF6031CB4AE2663FD2F8289D9382319085B4738FA584FF326AF7B267896D9378CE056292C3D31BAFAEBF1CE451A7719B148B6FCBEEDC5EB89FD0D50FC59A2B7C013EEAE524EB349A; __csrf=213a53f263416d0e77a7509f4268fb33; _ntes_nnid=1814d134894d7750972fdc56f2e17f5b,1767692182052; _ntes_nuid=1814d134894d7750972fdc56f2e17f5b;`;

// ✅ 启动时自动写入 Cookie 到 localStorage
(function initNeteaseCookie() {
  if (!NETEASE_COOKIE || NETEASE_COOKIE.includes("MUSIC_U=xxx")) {
    console.warn("⚠️ 请在 main.ts 中设置你的网易云音乐 Cookie");
    return;
  }

  // 如果 localStorage 里没有 cookie，则写入一次
  if (!getCookie()) {
    setCookie(NETEASE_COOKIE);
    console.log("✅ 网易云音乐 Cookie 已写入 localStorage");
  } else {
    console.log("✅ 已存在网易云音乐 Cookie（localStorage）");
  }
})();

// ===================== Vue Plugins =====================
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
