<template>
  <div class="picked-page">
    <h2 class="page-title">精选推荐</h2>

    <!-- 轮播图区域 -->
    <section class="banner-section">
      <div class="swiper-container">
        <div class="banner-grid">
          <div v-for="(banner, index) in banners" :key="index" class="banner-card">
            <img :src="banner.image" :alt="banner.title" class="banner-img" />
            <div class="banner-overlay">
              <span class="tag">{{ banner.tag }}</span>
              <p class="banner-title">{{ banner.title }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination">
        <span v-for="i in 4" :key="i" :class="['dot', { active: currentDot === i }]"></span>
      </div>
    </section>

    <!-- 视频推荐区域 -->
    <section class="video-section">
      <div class="section-header">
        <h3 class="section-title">视频推荐</h3>
        <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
      </div>
      <div class="video-grid">
        <div v-for="i in 4" :key="i" class="video-card">
          <div class="video-cover">
            <img :src="`https://picsum.photos/400/225?random=${i+10}`" class="cover-img" />
            <div class="play-btn">▶</div>
            <div class="video-duration">03:24</div>
          </div>
          <div class="video-info">
            <p class="video-title">视频标题示例：精选华语音乐MV合集</p>
            <p class="video-stats">12.5万次播放 · 3天前</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 电台节目区域 -->
    <section class="radio-section">
      <div class="section-header">
        <h3 class="section-title">热门电台节目</h3>
        <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
      </div>
      <div class="radio-grid">
        <div v-for="i in 4" :key="i" class="radio-card">
          <div class="radio-cover">
            <img :src="`https://picsum.photos/200/200?random=${i+20}`" class="cover-img" />
          </div>
          <div class="radio-info">
            <p class="radio-title">深夜电台：治愈系音乐</p>
            <p class="radio-host">主持人：小夜</p>
            <p class="radio-stats">156.8万次播放 · 每日更新</p>
          </div>
        </div>
      </div>
    </section>

    <!-- MV推荐区域 -->
    <section class="mv-section">
      <div class="section-header">
        <h3 class="section-title">最新MV</h3>
        <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
      </div>
      <div class="mv-grid">
        <div v-for="i in 4" :key="i" class="mv-card">
          <div class="mv-cover">
            <img :src="`https://picsum.photos/400/225?random=${i+30}`" class="cover-img" />
            <div class="play-btn">▶</div>
            <div class="video-duration">04:12</div>
          </div>
          <div class="mv-info">
            <p class="mv-title">歌曲名称 - 歌手名称</p>
            <p class="mv-stats">8.9万次播放 · 昨天发布</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 轮播图数据
const banners = [
  { image: "https://picsum.photos/600/350?random=11", title: "2025 美好中国新歌会", tag: "直播中" },
  { image: "https://picsum.photos/600/350?random=12", title: "动物园系列：HALUU X 出发家族", tag: "周边" },
  { image: "https://picsum.photos/600/350?random=13", title: "单依纯全新专辑《纯妹妹》", tag: "首发" },
];

// 当前轮播点
const currentDot = ref(1);
</script>

<style scoped>
.picked-page {
  padding: 20px 0;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 40px;
}

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
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.banner-title {
  color: #fff;
  font-size: 16px;
}

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
}

.dot.active {
  background: #1890ff;
  width: 20px;
  border-radius: 4px;
}

/* 区域通用样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
}

.more-link {
  color: #999;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.more-link:hover {
  color: #1890ff;
}

/* 视频推荐样式 */
.video-section {
  margin-bottom: 40px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.video-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.cover-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  font-size: 18px;
}

.video-cover:hover .play-btn {
  opacity: 1;
  background: rgba(24, 144, 255, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.video-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-stats {
  font-size: 12px;
  color: #999;
}

/* 电台节目样式 */
.radio-section {
  margin-bottom: 40px;
}

.radio-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.radio-card {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-card:hover {
  transform: translateY(-4px);
}

.radio-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.radio-cover .cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.radio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}

.radio-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.radio-host {
  font-size: 12px;
  color: #666;
}

.radio-stats {
  font-size: 12px;
  color: #999;
}

/* MV推荐样式 */
.mv-section {
  margin-bottom: 40px;
}

.mv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.mv-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mv-card:hover {
  transform: translateY(-4px);
}

.mv-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.mv-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mv-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.mv-stats {
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-grid {
    grid-template-columns: 1fr;
  }

  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .radio-card {
    flex-direction: column;
  }

  .radio-cover {
    width: 100%;
  }
}
</style>