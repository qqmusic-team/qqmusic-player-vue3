import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import eslintPlugin from "vite-plugin-eslint";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    eslintPlugin({
      cache: false,
      include: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
      exclude: ["node_modules", "dist"],
      emitWarning: true,
      emitError: false,
    }),
  ],
  base: '/qqmusic-player-vue3/', // 保留你的base路径配置
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // 保留原有别名
    },
  },
  server: {
    port: 5173, // 保留原有端口
    host: true, // 保留原有host配置
    // 新增：网易云接口代理配置（核心，解决跨域）
    proxy: {
      // 匹配以 /api/netease 开头的请求
      '/api/netease': {
        target: 'https://music.163.com', // 网易云接口域名
        changeOrigin: true, // 开启跨域（关键）
        rewrite: (path) => path.replace(/^\/api\/netease/, ''), // 重写路径，去掉前缀
        // 模拟浏览器请求头，避免网易云接口拦截
        headers: {
          'Referer': 'https://music.163.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    }
  },
});
