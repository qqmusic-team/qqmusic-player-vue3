<template>
  <div class="music-hall-page">
    <div class="music-hall-content">
      <header class="hall-header">
        <h1 class="main-title">音乐馆</h1>
        <!-- 使用 Element Plus Tabs -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane
            v-for="item in navItems"
            :key="item.path"
            :label="item.label"
            :name="item.path"
          />
        </el-tabs>
      </header>

      <!-- 子页面内容 - 动态组件加载 -->
      <main class="main-content">
        <component :is="currentSubView" v-if="currentSubView" :key="route.path" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { shallowRef, watch, markRaw, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

defineOptions({
  name: "MusicHallView",
});

const route = useRoute();
const router = useRouter();

// 当前激活的 tab
const activeTab = ref(route.path === "/musicHall" ? "/musicHall/picked" : route.path);

// 当前子视图组件
const currentSubView = shallowRef(null);

// 子组件映射表
const subComponents = {
  "/musicHall": () => import("@/components/musichallview/Picked.vue"),
  "/musicHall/picked": () => import("@/components/musichallview/Picked.vue"),
  "/musicHall/topList": () => import("@/components/musichallview/TopList.vue"),
  "/musicHall/artist": () => import("@/components/musichallview/Artist.vue"),
  "/musicHall/category": () => import("@/components/musichallview/Category.vue"),
  "/musicHall/radio": () => import("@/components/musichallview/Radio.vue"),
  "/musicHall/digitalAlbum": () => import("@/components/musichallview/DigitalAlbum.vue"),
};

// 组件缓存
const componentCache = new Map();

// 加载子组件
const loadSubComponent = async (path) => {
  const componentKey = subComponents[path] ? path : "/musicHall";

  if (componentCache.has(componentKey)) {
    currentSubView.value = componentCache.get(componentKey);
    return;
  }

  try {
    const module = await subComponents[componentKey]();
    const component = markRaw(module.default || module);
    componentCache.set(componentKey, component);
    currentSubView.value = component;
  } catch (error) {
    console.error("子组件加载失败:", error);
  }
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith("/musicHall")) {
      loadSubComponent(newPath);
    }
  },
  { immediate: true }
);

// 导航菜单配置
const navItems = [
  { label: "精选", path: "/musicHall/picked" },
  { label: "排行", path: "/musicHall/topList" },
  { label: "歌手", path: "/musicHall/artist" },
  { label: "分类歌单", path: "/musicHall/category" },
  { label: "有声电台", path: "/musicHall/radio" },
  { label: "数字专辑", path: "/musicHall/digitalAlbum" },
];

// 处理 tab 点击
const handleTabClick = (tab) => {
  router.push(tab.props.name);
};

// 监听路由变化，同步 activeTab
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/musicHall") {
      activeTab.value = "/musicHall/picked";
    } else if (newPath.startsWith("/musicHall")) {
      activeTab.value = newPath;
    }
  }
);
</script>

<style scoped>
/* 基础容器 */
.music-hall-page {
  padding: 0;
  color: #333;
  background: transparent;
  min-height: 100vh;
}

.music-hall-content {
  padding: 30px 40px;
}

/* 主内容区域 */
.main-content {
  margin-top: 0;
  min-height: calc(100vh - 200px);
}

/* 标题 */
.main-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 标签页样式 */
:deep(.el-tabs__item) {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-hall-content {
    padding: 20px 15px;
  }

  .main-title {
    font-size: 24px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
</style>
