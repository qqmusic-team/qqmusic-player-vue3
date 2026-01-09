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
  base: "/qqmusic-player-vue3/", // 注意前后都有斜杠，比如 '/my-music-app/'
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
  // 性能优化配置
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // 将 Vue 相关库单独打包
          "vue-vendor": ["vue", "vue-router", "pinia"],
          // 将 Element Plus 单独打包
          "element-plus": ["element-plus", "@element-plus/icons-vue"],
          // 将工具库单独打包
          utils: ["axios"],
        },
        // 优化 chunk 文件名
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // 启用 gzip 压缩提示
    reportCompressedSize: true,
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用 source map（生产环境可关闭）
    sourcemap: false,
    // 压缩选项
    minify: "terser",
    terserOptions: {
      compress: {
        // 移除 console.log（保留 warn 和 error）
        drop_console: false,
        pure_funcs: ["console.debug"],
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ["vue", "vue-router", "pinia", "axios", "element-plus", "@element-plus/icons-vue"],
  },
});
