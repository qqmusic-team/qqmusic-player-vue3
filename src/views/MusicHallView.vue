<template>
  <div class="music-hall-page">
    <div class="music-hall-content">
      <h1 class="main-title">音乐馆</h1>

      <!-- 使用 Element Plus Tabs - 不使用路由跳转 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane
          v-for="item in navItems"
          :key="item.key"
          :label="item.label"
          :name="item.key"
        />
      </el-tabs>

      <!-- 子页面内容 - 动态组件加载 -->
      <main class="main-content">
        <component :is="currentSubView" v-if="currentSubView" :key="activeTab" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { shallowRef, watch, ref, defineAsyncComponent } from "vue";

defineOptions({
  name: "MusicHallView",
});

// 当前激活的 tab
const activeTab = ref("picked");

// 当前子视图组件
const currentSubView = shallowRef(null);

// 子组件映射表 - 使用 defineAsyncComponent 异步加载
const subComponents = {
  picked: defineAsyncComponent(() => import("@/components/musichallview/Picked.vue")),
  topList: defineAsyncComponent(() => import("@/components/musichallview/TopList.vue")),
  artist: defineAsyncComponent(() => import("@/components/musichallview/Artist.vue")),
  category: defineAsyncComponent(() => import("@/components/musichallview/Category.vue")),
  radio: defineAsyncComponent(() => import("@/components/musichallview/Radio.vue")),
  digitalAlbum: defineAsyncComponent(() => import("@/components/musichallview/DigitalAlbum.vue")),
};

// 导航菜单配置
const navItems = [
  { label: "精选", key: "picked" },
  { label: "排行", key: "topList" },
  { label: "歌手", key: "artist" },
  { label: "分类歌单", key: "category" },
  { label: "有声电台", key: "radio" },
  { label: "数字专辑", key: "digitalAlbum" },
];

// 监听 tab 变化，切换组件
watch(
  activeTab,
  (newTab) => {
    currentSubView.value = subComponents[newTab] || subComponents.picked;
  },
  { immediate: true }
);
</script>

<style scoped>
/* 基础容器 */
.music-hall-page {
  padding: 16px 20px;
}

.music-hall-content {
  padding: 0;
}

/* 主内容区域 */
.main-content {
  margin-top: 0;
  min-height: calc(100vh - 200px);
}

/* 标题 */
.main-title {
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 12px;
}

/* 标签页样式 */
:deep(.el-tabs__item) {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-hall-page {
    padding: 12px 15px;
  }

  .main-title {
    font-size: 24px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
</style>
