<template>
  <div class="music-hall-page">
    <header class="hall-header">
      <h1 class="main-title">乐馆</h1>
      <nav class="sub-nav">
        <div
          v-for="item in categories"
          :key="item"
          :class="[
            'nav-item',
            { active: currentTab === item, 'click-active': activeNavItem === item },
          ]"
          @click="handleNavItemClick(item)"
          @mouseenter="handleMouseEnter('nav', item)"
          @mouseleave="handleMouseLeave('nav', item)"
        >
          {{ item }}
        </div>
      </nav>
    </header>

    <section class="banner-section">
      <div class="banner-grid">
        <div v-for="(banner, index) in banners" :key="index" class="banner-card">
          <img :src="banner.image" :alt="banner.title" class="banner-img" />
          <div class="banner-overlay">
            <span
              class="tag"
              :class="{
                'click-active': activeBannerTag === banner.tag,
                'hover-active': hoverItems.nav === banner.tag,
              }"
              @click.stop="handleBannerTagClick(banner.tag)"
              @mouseenter="handleMouseEnter('tag', banner.tag)"
              @mouseleave="handleMouseLeave('tag', banner.tag)"
              >{{ banner.tag }}</span
            >
            <p
              class="banner-title"
              :class="{
                'click-active': activeBannerTitle === banner.title,
                'hover-active': hoverItems.title === banner.title,
              }"
              @click.stop="handleBannerTitleClick(banner.title)"
              @mouseenter="handleMouseEnter('title', banner.title)"
              @mouseleave="handleMouseLeave('title', banner.title)"
            >
              {{ banner.title }}
            </p>
          </div>
        </div>
      </div>
      <div class="pagination">
        <span
          v-for="i in 4"
          :key="i"
          :class="['dot', { active: i === 1, 'click-active': activeDot === i }]"
          @click="handleDotClick(i)"
        ></span>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">官方歌单</h2>
          <span class="section-subtitle">官方甄选订阅歌单</span>
        </div>
        <div
          class="more-link"
          @click="handleMoreLinkClick"
          @mouseenter="handleMouseEnter('more', 'more')"
          @mouseleave="handleMouseLeave('more', 'more')"
        >
          更多 <i class="icon-arrow">〉</i>
        </div>
      </div>

      <div class="playlist-grid">
        <div
          v-for="i in 6"
          :key="i"
          class="playlist-card"
          @click="handlePlaylistCardClick(i)"
          @mouseenter="handleMouseEnter('playlist', i)"
          @mouseleave="handleMouseLeave('playlist', i)"
        >
          <div
            class="cover-container"
            :class="{
              'click-active': activePlaylistCard === i,
              'hover-active': hoverItems.playlist === i,
            }"
          >
            <img :src="`https://picsum.photos/300/300?random=${i}`" class="cover-img" />
            <div class="play-btn-mask">
              <div class="play-icon-inner"></div>
            </div>
          </div>
          <p
            class="playlist-name"
            :class="{
              'click-active': activePlaylistName === i,
              'hover-active': hoverItems.playlistName === i,
            }"
            @click.stop="handlePlaylistNameClick(i)"
            @mouseenter="handleMouseEnter('playlistName', i)"
            @mouseleave="handleMouseLeave('playlistName', i)"
          >
            每日流行推荐：精选华语语种好歌 (示例内容)
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const currentTab = ref("精选");
const categories = [
  "精选",
  "排行",
  "歌手",
  "分类歌单",
  "数字专辑",
  "音质专区",
  "边听边玩",
  "视频",
  "雷达",
];

const banners = [
  { image: "https://picsum.photos/600/350?random=11", title: "2025 美好中国新歌会", tag: "直播中" },
  {
    image: "https://picsum.photos/600/350?random=12",
    title: "动物园系列：HALUU X 出发家族",
    tag: "周边",
  },
  {
    image: "https://picsum.photos/600/350?random=13",
    title: "单依纯全新专辑《纯妹妹》",
    tag: "首发",
  },
];

// 添加响应式状态来管理激活和悬停状态
const activeNavItem = ref(null);
const activeBannerTag = ref(null);
const activeBannerTitle = ref(null);
const activePlaylistName = ref(null);
const activePlaylistCard = ref(null);
const activeDot = ref(null);
const activeMoreLink = ref(null);

// 管理悬停状态
const hoverItems = reactive({
  nav: null,
  tag: null,
  title: null,
  playlist: null,
  playlistName: null,
  more: null,
});

// 添加鼠标悬停事件处理函数
const handleMouseEnter = (type, value) => {
  if (type in hoverItems) {
    hoverItems[type] = value;
  }
};

const handleMouseLeave = (type, value) => {
  if (type in hoverItems && hoverItems[type] === value) {
    hoverItems[type] = null;
  }
};

// 添加点击事件处理函数
const handleNavItemClick = (item) => {
  currentTab.value = item;
  activeNavItem.value = activeNavItem.value === item ? null : item;
};

const handleBannerTagClick = (tag) => {
  activeBannerTag.value = activeBannerTag.value === tag ? null : tag;
};

const handleBannerTitleClick = (title) => {
  activeBannerTitle.value = activeBannerTitle.value === title ? null : title;
};

const handlePlaylistNameClick = (index) => {
  activePlaylistName.value = activePlaylistName.value === index ? null : index;
};

const handlePlaylistCardClick = (index) => {
  activePlaylistCard.value = activePlaylistCard.value === index ? null : index;
};

const handleDotClick = (index) => {
  activeDot.value = activeDot.value === index ? null : index;
};

const handleMoreLinkClick = () => {
  activeMoreLink.value = !activeMoreLink.value;
};
</script>

<style scoped>
/* 基础容器 */
.music-hall-page {
  padding: 30px 40px;
  color: #333;
  background: transparent;
  min-height: 100vh;
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
}

.nav-item {
  font-size: 16px;
  color: #333;
  cursor: pointer;
  position: relative;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.nav-item:hover,
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

/* 导航项点击效果 */
.nav-item.click-active {
  color: #1890ff;
  font-weight: bold;
  transform: scale(1.05);
  transition: all 0.1s ease;
}

.nav-item.click-active::after {
  background: #1890ff;
  height: 4px;
}

/* 轮播图区域 */
.banner-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 15px;
}

.banner-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.banner-card:hover .banner-img {
  transform: scale(1.05);
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  transition: all 0.3s ease;
}

.tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: 8px;
  display: inline-block;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tag:hover,
.tag.hover-active {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.tag.click-active {
  background: #1890ff;
  color: #fff;
  transform: scale(0.95);
  transition: all 0.1s ease;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.banner-title {
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 0;
}

.banner-title:hover,
.banner-title.hover-active {
  color: #1890ff;
  transform: translateX(4px);
}

.banner-title.click-active {
  color: #1890ff;
  font-weight: bold;
  transform: scale(1.02);
  transition: all 0.1s ease;
}

/* 歌单部分 */
.content-section {
  margin-top: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.section-subtitle {
  color: #999;
  font-size: 14px;
  margin-left: 15px;
}

.more-link {
  color: #333;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.more-link:hover,
.more-link.hover-active {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  transform: translateX(4px);
}

.more-link.click-active {
  background: #1890ff;
  color: #fff;
  transform: scale(0.95);
  transition: all 0.1s ease;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.playlist-card:hover {
  transform: translateY(-8px);
}

.cover-container {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.cover-container:hover,
.cover-container.hover-active {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.cover-container.click-active {
  transform: scale(0.98);
  box-shadow: 0 8px 16px rgba(24, 144, 255, 0.3);
  border: 2px solid #1890ff;
  transition: all 0.1s ease;
}

.cover-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: block;
}

.play-btn-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-container:hover .play-btn-mask {
  opacity: 1;
}

.cover-container.click-active .play-btn-mask {
  background: rgba(24, 144, 255, 0.3);
}

.play-icon-inner {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.cover-container:hover .play-icon-inner {
  transform: scale(1);
  background: #1890ff;
}

/* 播放三角形 */
.play-icon-inner::after {
  content: "";
  position: absolute;
  top: 13px;
  left: 18px;
  border-left: 14px solid #000;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  transition: all 0.3s ease;
}

.cover-container:hover .play-icon-inner::after {
  border-left-color: #fff;
  transform: translateX(2px);
}

.playlist-name {
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 0;
}

.playlist-name:hover,
.playlist-name.hover-active {
  color: #1890ff;
  transform: translateX(2px);
}

.playlist-name.click-active {
  color: #1890ff;
  font-weight: bold;
  transform: scale(1.02);
  transition: all 0.1s ease;
}

/* 指示器 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9d9d9;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  background: #1890ff;
  transform: scale(1.2);
}

.dot.active {
  background: #1890ff;
  width: 20px;
  border-radius: 4px;
}

.dot.click-active {
  background: #1890ff;
  width: 24px;
  transform: scale(1.1);
  transition: all 0.1s ease;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
}

/* 全局动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.nav-item.click-active,
.tag.click-active,
.banner-title.click-active,
.cover-container.click-active,
.playlist-name.click-active,
.dot.click-active,
.more-link.click-active {
  animation: pulse 0.15s ease-in-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .sub-nav {
    flex-wrap: wrap;
    gap: 15px;
  }
}
</style>
