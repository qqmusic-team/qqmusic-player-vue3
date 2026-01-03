<template>
  <div class="music-hall-page">
    <div class="music-hall-content">
      <header class="hall-header">
        <h1 class="main-title">音乐馆</h1>
        <nav class="sub-nav">
          <div
            v-for="(item, index) in navItems"
            :key="index"
            :class="['nav-item', { active: isActive(item) }]"
          >
            <router-link :to="item.path" class="nav-link">
              {{ item.label }}
            </router-link>
          </div>
        </nav>
      </header>

      <!-- 子页面内容 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

// 导航菜单配置
const navItems = [
  { label: "精选", path: "/musicHall/picked", route: "musicHallPicked" },
  { label: "排行", path: "/musicHall/topList", route: "musicHallTopList" },
  { label: "歌手", path: "/musicHall/artist", route: "musicHallArtist" },
  { label: "分类歌单", path: "/musicHall/category", route: "musicHallCategory" },
  { label: "有声电台", path: "/musicHall/radio", route: "musicHallRadio" },
  { label: "数字专辑", path: "/musicHall/digitalAlbum", route: "musicHallDigitalAlbum" },
];

// 判断导航项是否激活
const isActive = (item) => {
  // 对于"精选"选项，当路由为 musicHall、musicHallDefault 或 musicHallPicked 时都激活
  if (item.route === "musicHallPicked") {
    return (
      route.name === "musicHall" ||
      route.name === "musicHallDefault" ||
      route.name === "musicHallPicked"
    );
  }
  // 其他选项正常匹配
  return route.name === item.route;
};
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

/* 标题与导航 */
.main-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
}

.sub-nav {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.nav-item {
  font-size: 16px;
  color: #333;
  position: relative;
  transition: all 0.3s ease;
}

.nav-link {
  display: block;
  padding: 8px 0;
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #1890ff;
}

.nav-item.active {
  color: #1890ff;
  transform: translateY(-2px);
}

.nav-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #1890ff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-hall-content {
    padding: 20px 15px;
  }

  .sub-nav {
    flex-wrap: wrap;
    gap: 15px;
  }

  .main-title {
    font-size: 24px;
  }
}
</style>
