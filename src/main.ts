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
const NETEASE_COOKIE = `MUSIC_U=003B06B6C5194BB049D8D478194D2A053806B3696FE90066114AE46CE4EC7FBAD83CFC24D13D3421E3F3EBBDE503707C4BA7862FFDB9796E6256BBE0178D65D81FA8B9F7479A91E1C1BE8C5F7854AADEB60D34F3907E493736B1676B36EE3162DC01E762B416871C08BD3200679B8C43572C52F1693A9BA3D00E9FA9453B7EA188108435ECB09D8EEEFF202E915159C0951FEB05CB85CC75E153BA96CD370A0D7681C80E12D13131918F1B0210F4165FFB33302EB82866DE4F45DC004F12B23A4A90C719E221CFB2D032ACFFEA10770F5CBE833A05BD4F25ADEB9B62D25B4D02BF6E9F3C23E3169EC15850FE10425C641C8B9E76F966108FB27C65FD543D96FADF9F6B2ADFFA593D1AAEDF96D6D1928F29261D3127242AD1D3ECF1FAC8E39BC1E0BB660DD7A271B8C12EDC387E108D100BEDAFC3F1257C07BF18C5C0A2E8FA9EC8D9F254F5DA7DDDE4735FA55E4DDC82A446129EB9249DB78E5C0D45F8906E907CACA6FEA01491D613FB1333A884A3C0AC3A1B60FCF5036C93B2BA6E7E4CE67DBA95C6BC7F94FA8007C70E7B65BB7532CB53A74F10D625314DA34DED515676EC06; __csrf=c5c6257088eb79c28d943f84a7e44034; NMTID=00On575Rb8tfqrFwUBcueWT_KDPBPkAAAGbiJ1v2w; NTES_P_UTID=Ez6tZiPuTCGk8dbKrp9O1NLitTaDk4YO|1746972891; P_INFO=m15308686584@163.com|1746972891|0|mail163|00&99|null&null&null#tij&null#10#0#0|153584&1|urs_mailaq|15308686584@163.com; JSESSIONID-WYYY=NrtZ7UUagBCOJ40UGyr0QP%2BPDWHQyIwjcihvyjWgCl49s46upWt5W%2Bn%5Cjb40gEZOrdRfsdVaeq4MMR2f%2BctziMbR8DSSzFzvChl4N%2B4F4IqeIgo0UyrFJTzPBxBeSZthype%5CQotU868HDfInBr0O6Wqhwqc%2FgJsS7DbVg1I%2BzKMCbYNi%3A1767525375693; _iuqxldmzr_=32; _ntes_nnid=77b2b64a4711142d5add4d0b8ebf6343,1767523575725; _ntes_nuid=77b2b64a4711142d5add4d0b8ebf6343; WEVNSM=1.0.0; WNMCID=wmrycq.1767523579385.01.0; WM_NI=5G%2FGTwS4Y14MsY7EsTkcwU7H7huDsMWohSJQtQ%2ByW0BOrzW8KDle5ANguNTyicZxY%2Fr0uVVUHTro6YCH3dx%2BRa1gsXoWUSLNSomuExdtixsW7w%2FPsM%2BcR0HFpZijjFo5Qzg%3D; WM_NIKE=9ca17ae2e6ffcda170e2e6eea8dc4d8c8b82adb440bb9e8ea2c54b979f8bacd63ab8898f89b56a958f8cd0ed2af0fea7c3b92af799e1a8d77d91ec97d2b747b187f9a6f260a9bdb9b6b644f5b8bba5f24795b1a8b4c95bb88fe59ad63c8291be9bd634899ca486b84b8eb9bbafd773abbd9699dc25b2f0bbb7d55f8c8cbe90b5538198fd85fb2192bfff88f254ad899bb4cf4691b1a396c874a8aca799f25df5a9e1b1f247e9bd9ed1cb4eb486a78be94eadeb9f9be637e2a3; WM_TID=YZ5U48i5UUdBEVVUFRfGjpTExqKGQHvy; sDeviceId=YD-812ez0jpKoFFFgUBABOT2oWAlrbCR0uK; __snaker__id=ggqEmQRLC5iQ80B3; ntes_utid=tid._.GIQwwaKgU4tAB0UAUVOSjpTEk%252BOGVkVy._.0; ntes_kaola_ad=1;`;

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
