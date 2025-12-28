<template>
  <div class="home-container">
    <Sidebar />
    <div class="main-content">
      <TopBar />
      <div class="content-wrapper">
        <!-- 使用动态组件实现页面切换，添加过渡效果 -->
        <transition name="page-transition" mode="out-in">
          <component :is="currentView" v-if="currentView" />
          <div v-else class="loading-container">
            <div class="loading-spinner"></div>
            <p>页面加载中...</p>
          </div>
        </transition>
      </div>
    </div>
    <PlayerBar />

    <!-- 全局错误提示组件 -->
    <div v-if="showError" class="global-error-toast" :class="{ show: showError }">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref,  onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../components/layout/Sidebar.vue";
import TopBar from "../components/layout/TopBar.vue";
import PlayerBar from "../components/layout/PlayerBar.vue";

// 错误提示相关状态
const errorMessage = ref("");
const showError = ref(false);
const isLoading = ref(false);
const route = useRoute();

// 页面组件映射表
const pageComponents = {
  "/": () => import("../views/RecommendView.vue"),
  "/recommend": () => import("../views/RecommendView.vue"),
  "/musicHall": () => import("../views/MusicHallView.vue"),
  "/comments": () => import("../views/CommentsView.vue"),
  "/favorites": () => import("../views/FavoritesView.vue"),
  "/localMusic": () => import("../views/LocalMusicView.vue"),
  "/downloads": () => import("../views/DownloadsView.vue"),
  "/recentPlay": () => import("../views/RecentPlayView.vue"),
  "/profile": () => import("../views/ProfileView.vue"),
};

// 当前页面组件
const currentView = ref(null);

// 显示错误信息
const displayError = (message, error = null) => {
  errorMessage.value = message;
  showError.value = true;

  // 记录详细错误到控制台
  if (error) {
    console.error("导航错误详情:", error);
  }

  // 3秒后自动隐藏错误提示
  setTimeout(() => {
    showError.value = false;
  }, 3000);
};

// 加载页面组件
const loadPageComponent = async (path) => {
  // 默认使用推荐页面作为首页
  if (!path || path === "/") {
    path = "/recommend";
  }

  try {
    isLoading.value = true;
    // 检查页面是否存在
    if (!pageComponents[path]) {
      throw new Error(`页面 ${path} 不存在`);
    }

    // 动态导入页面组件
    const module = await pageComponents[path]();
    currentView.value = module.default || module;

    // 添加导航成功日志
    console.log(`成功加载页面: ${path}`);
  } catch (error) {
    displayError("页面加载失败，请稍后重试", error);
    // 加载失败时回退到推荐页面
    try {
      const fallbackModule = await pageComponents["/recommend"]();
      currentView.value = fallbackModule.default || fallbackModule;
    } catch (fallbackError) {
      console.error("回退页面加载失败:", fallbackError);
    }
  } finally {
    isLoading.value = false;
  }
};

// 监听路由变化，更新当前页面
watch(
  () => route.path,
  (newPath) => {
    loadPageComponent(newPath);
  },
  { immediate: true }
);

// 组件挂载时加载初始页面
onMounted(() => {
  // 确保初始页面已加载
  if (!currentView.value) {
    loadPageComponent(route.path);
  }
});
</script>

<style scoped>
/* 使用CSS变量统一管理响应式值 */
:root {
  /* 主色调 */
  --primary-color: #409eff;
  --background-color: #f5f7fa;
  --text-color: #303133;
  --border-color: #e0e0e0;
  --error-color: #f56c6c;
}

.home-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: var(--background-color);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* 为PlayerBar留出空间 */
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  min-height: 0;
  position: relative;
}

/* 滚动条样式优化 - WebKit浏览器 */
.content-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 页面过渡动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 加载中样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-color);
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 全局错误提示样式 */
.global-error-toast {
  position: fixed;
  top: 70px;
  right: 20px;
  background-color: var(--error-color);
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 1000;
  max-width: 300px;
}

.global-error-toast.show {
  opacity: 1;
  transform: translateY(0);
}

/* 响应式设计 - 平板设备 */
@media screen and (max-width: 1023px) and (min-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }

  .main-content {
    padding-bottom: 70px;
  }

  .global-error-toast {
    right: 16px;
    left: 16px;
    max-width: none;
  }
}

/* 响应式设计 - 移动设备 */
@media screen and (max-width: 767px) and (min-width: 481px) {
  .content-wrapper {
    padding: 12px;
  }

  .main-content {
    padding-bottom: 60px;
  }

  .global-error-toast {
    right: 12px;
    left: 12px;
    max-width: none;
  }
}

/* 响应式设计 - 小屏幕设备 */
@media screen and (max-width: 480px) {
  .content-wrapper {
    padding: 8px;
  }

  .main-content {
    padding-bottom: 60px;
  }

  .global-error-toast {
    right: 8px;
    left: 8px;
    max-width: none;
    font-size: 13px;
  }

  .loading-container {
    height: 150px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1a1a1a;
    --text-color: #e0e0e0;
    --border-color: #333;
    --error-color: #ff7875;
  }

  .content-wrapper::-webkit-scrollbar-thumb {
    background-color: #555;
  }

  .content-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #777;
  }

  .loading-spinner {
    border: 4px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
