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
      "@": fileURLToPath(new URL("./src", import.meta.url)), // 保留原有别名
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
        // 手动分割代码块 - 使用函数形式避免与动态导入冲突
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("pinia") || id.includes("vue-router")) {
              return "vue-vendor";
            }
            if (id.includes("element-plus") || id.includes("@element-plus")) {
              return "element-plus";
            }
            if (id.includes("axios")) {
              return "utils";
            }
          }
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
    // 使用 esbuild 压缩（默认，无需额外安装依赖）
    minify: "esbuild",
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ["vue", "vue-router", "pinia", "axios", "element-plus", "@element-plus/icons-vue"],
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
