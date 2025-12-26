<template>
  <div class="home-container">
    <Sidebar />
    <div class="main-content">
      <TopBar />
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </div>
    <PlayerBar />
  </div>
</template>

<script setup>
import Sidebar from "../components/layout/Sidebar.vue";
import TopBar from "../components/layout/TopBar.vue";
import PlayerBar from "../components/layout/PlayerBar.vue";
</script>

<style scoped>
/* 使用CSS变量统一管理响应式值 */
:root {
  /* 主色调 */
  --primary-color: #409eff;
  --background-color: #f5f7fa;
  --text-color: #303133;
  --border-color: #e0e0e0;
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

/* 响应式设计 - 平板设备 */
@media screen and (max-width: 1023px) and (min-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }

  .main-content {
    padding-bottom: 70px;
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
}

/* 响应式设计 - 小屏幕设备 */
@media screen and (max-width: 480px) {
  .content-wrapper {
    padding: 8px;
  }

  .main-content {
    padding-bottom: 60px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1a1a1a;
    --text-color: #e0e0e0;
    --border-color: #333;
  }

  .content-wrapper::-webkit-scrollbar-thumb {
    background-color: #555;
  }

  .content-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: #777;
  }
}
</style>
