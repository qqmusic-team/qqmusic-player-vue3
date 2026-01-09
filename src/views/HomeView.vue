<template>
  <div class="home-container">
    <Sidebar />
    <div class="main-content">
      <TopBar />
      <div class="content-wrapper" ref="contentWrapperRef">
        <!-- 动态组件 -->
        <component :is="currentView" v-if="currentView" :key="currentViewKey" />
        <!-- 加载中状态 -->
        <div v-if="isLoading && !currentView" class="loading-container">
          <p>页面加载中...</p>
        </div>
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
import { ref, provide, watch, onMounted, shallowRef, markRaw } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "../components/layout/Sidebar.vue";
import TopBar from "../components/layout/TopBar.vue";
import PlayerBar from "../components/layout/PlayerBar.vue";

const contentWrapperRef = ref(null);

provide("scrollContainer", contentWrapperRef);

const errorMessage = ref("");
const showError = ref(false);
const isLoading = ref(false);
const route = useRoute();

// 组件缓存
const componentCache = new Map();

// 当前页面组件
const currentView = shallowRef(null);
const currentViewKey = ref("");

// 页面组件映射表
const pageComponents = {
  "/": () => import("./RecommendView.vue"),
  "/recommend": () => import("./RecommendView.vue"),
  "/localMusic": () => import("./LocalMusicView.vue"),
  "/favorites": () => import("./FavoritesView.vue"),
  "/comments": () => import("./CommentsView.vue"),
  "/downloads": () => import("./DownloadsView.vue"),
  "/recentPlay": () => import("./RecentPlayView.vue"),
  "/profile": () => import("./ProfileView.vue"),
  "/playlist": () => import("./PlaylistDetailView.vue"),
  "/artist": () => import("./ArtistDetail.vue"),
  "/radio": () => import("./RadioDetail.vue"),
  "/musicHall": () => import("./MusicHallView.vue"),
};

// 加载页面组件
const loadPageComponent = async (path) => {
  if (!path || path === "/") {
    path = "/recommend";
  }

  try {
    let componentKey = path;

    // 处理动态路由
    if (path.startsWith("/playlist/")) componentKey = "/playlist";
    else if (path.startsWith("/artist/")) componentKey = "/artist";
    else if (path.startsWith("/radio/")) componentKey = "/radio";
    else if (path.startsWith("/musicHall")) componentKey = "/musicHall";

    if (!pageComponents[componentKey]) {
      console.error(`页面 ${path} 不存在`);
      componentKey = "/recommend";
    }

    currentViewKey.value = path;

    // 检查缓存
    if (componentCache.has(componentKey)) {
      currentView.value = componentCache.get(componentKey);
      return;
    }

    isLoading.value = true;
    const module = await pageComponents[componentKey]();
    const component = markRaw(module.default || module);
    componentCache.set(componentKey, component);
    currentView.value = component;
  } catch (error) {
    console.error("页面加载失败:", error);
    errorMessage.value = "页面加载失败";
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 3000);
  } finally {
    isLoading.value = false;
  }
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    loadPageComponent(newPath);
    if (contentWrapperRef.value) {
      contentWrapperRef.value.scrollTop = 0;
    }
  },
  { immediate: true }
);

onMounted(() => {
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
  padding: 0;
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

/* 页面过渡动画 - 优化为更丝滑的效果 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
}

.page-transition-leave-to {
  opacity: 0;
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
    padding: 0;
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
