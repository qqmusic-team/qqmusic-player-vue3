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
  base: '/qqmusic-player-vue3/', // 注意前后都有斜杠，比如 '/my-music-app/'
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // 添加API代理配置
    port: 5173,
    host: true,

  },
});
