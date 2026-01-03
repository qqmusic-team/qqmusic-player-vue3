<template>
  <div class="picked-page">
    <h2 class="page-title">精选推荐</h2>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">重试</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 轮播图区域 -->
      <section v-if="banners.length > 0" class="banner-section">
        <div class="swiper-container">
          <div class="banner-grid">
            <div v-for="banner in banners.slice(0, 3)" :key="banner.bannerId" class="banner-card">
              <img :src="banner.pic" :alt="banner.typeTitle" class="banner-img" />
              <div class="banner-overlay">
                <span class="tag">{{ banner.typeTitle }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="pagination">
          <span v-for="i in 4" :key="i" :class="['dot', { active: currentDot === i }]"></span>
        </div>
      </section>

      <!-- 推荐歌单区域 -->
      <section v-if="personalized.length > 0" class="playlist-section">
        <div class="section-header">
          <h3 class="section-title">推荐歌单</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div class="playlist-grid">
          <div v-for="item in personalized.slice(0, 6)" :key="item.id" class="playlist-card">
            <div class="playlist-cover">
              <img :src="item.picUrl" :alt="item.name" class="cover-img" />
              <div class="play-count">{{ formatPlayCount(item.playCount) }}</div>
            </div>
            <div class="playlist-info">
              <p class="playlist-name">{{ item.name }}</p>
              <p class="playlist-desc">{{ item.copywriter }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 新歌推荐区域 -->
      <section v-if="personalizedNewSong.length > 0" class="newsong-section">
        <div class="section-header">
          <h3 class="section-title">新歌推荐</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div class="song-grid">
          <div v-for="item in personalizedNewSong.slice(0, 6)" :key="item.id" class="song-card">
            <div class="song-cover">
              <img :src="item.picUrl" :alt="item.name" class="cover-img" />
              <div class="play-btn">▶</div>
            </div>
            <div class="song-info">
              <p class="song-name">{{ item.name }}</p>
              <p class="song-artist">{{ item.song.artists.map((a) => a.name).join(", ") }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 视频推荐区域 -->
      <section v-if="videos.length > 0" class="video-section">
        <div class="section-header">
          <h3 class="section-title">视频推荐</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div class="video-grid">
          <div v-for="video in videos.slice(0, 4)" :key="video.id" class="video-card">
            <div class="video-cover">
              <img
                :src="
                  video.data?.coverUrl ||
                  video.coverUrl ||
                  `https://picsum.photos/400/225?random=${Math.random()}`
                "
                class="cover-img"
              />
              <div class="play-btn">▶</div>
              <div class="video-duration">{{ formatDuration(video.data?.durationMs || 0) }}</div>
            </div>
            <div class="video-info">
              <p class="video-title">{{ video.data?.title || "视频标题" }}</p>
              <p class="video-stats">{{ formatPlayCount(video.data?.playTime || 0) }}次播放</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 电台节目区域 -->
      <section v-if="djProgram.length > 0" class="radio-section">
        <div class="section-header">
          <h3 class="section-title">热门电台节目</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div class="radio-grid">
          <div v-for="program in djProgram.slice(0, 4)" :key="program.id" class="radio-card">
            <div class="radio-cover">
              <img :src="program.picUrl" :alt="program.name" class="cover-img" />
            </div>
            <div class="radio-info">
              <p class="radio-title">{{ program.name }}</p>
              <p class="radio-desc">{{ program.copywriter }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- MV推荐区域 -->
      <section v-if="personalizedMv.length > 0" class="mv-section">
        <div class="section-header">
          <h3 class="section-title">最新MV</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div class="mv-grid">
          <div v-for="mv in personalizedMv.slice(0, 4)" :key="mv.id" class="mv-card">
            <div class="mv-cover">
              <img :src="mv.picUrl" :alt="mv.name" class="cover-img" />
              <div class="play-btn">▶</div>
              <div class="video-duration">{{ formatDuration(mv.duration) }}</div>
            </div>
            <div class="mv-info">
              <p class="mv-title">{{ mv.name }}</p>
              <p class="mv-stats">{{ mv.artistName }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useMusicHallStore } from "@/stores/musicHall";

defineOptions({
  name: "PickedView",
});

const musicHallStore = useMusicHallStore();

const banners = ref([]);
const personalized = ref([]);
const personalizedNewSong = ref([]);
const personalizedMv = ref([]);
const djProgram = ref([]);
const videos = ref([]);

const currentDot = ref(1);

const isLoading = ref(false);
const error = ref(null);

const hasError = computed(() => {
  return error.value !== null;
});

const loadData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await musicHallStore.initPickedPage();
    banners.value = musicHallStore.banners;
    personalized.value = musicHallStore.personalized;
    personalizedNewSong.value = musicHallStore.personalizedNewSong;
    personalizedMv.value = musicHallStore.personalizedMv;
    djProgram.value = musicHallStore.djProgram;
    videos.value = musicHallStore.videos;
  } catch (err) {
    error.value = "加载数据失败，请稍后重试";
    console.error("加载数据失败:", err);
  } finally {
    isLoading.value = false;
  }
};

const formatPlayCount = (count) => {
  if (!count) return "0";
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + "亿";
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + "万";
  }
  return count.toString();
};

const formatDuration = (ms) => {
  if (!ms) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.picked-page {
  padding: 0;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
}

/* 加载和错误状态样式 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container p {
  color: #ff4d4f;
  font-size: 14px;
}

.retry-btn {
  padding: 8px 24px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #40a9ff;
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 40px;
}

.banner-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-3);
  gap: var(--grid-gap-md);
  margin-bottom: 15px;
}

.banner-card {
  position: relative;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  aspect-ratio: var(--aspect-ratio-16-9);
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

/* 推荐歌单样式 */
.playlist-section {
  margin-bottom: 40px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-6);
  gap: var(--grid-gap-md);
}

.playlist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: var(--image-size-lg);
  height: var(--image-size-lg);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-bottom: 12px;
}

.playlist-cover .cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.play-count::before {
  content: "▶";
  font-size: 10px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: var(--image-size-lg);
}

.playlist-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.playlist-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 新歌推荐样式 */
.newsong-section {
  margin-bottom: 40px;
}

.song-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-6);
  gap: var(--grid-gap-md);
}

.song-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.song-card:hover {
  transform: translateY(-4px);
}

.song-cover {
  position: relative;
  width: var(--image-size-lg);
  height: var(--image-size-lg);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-bottom: 12px;
}

.song-cover .cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: var(--image-size-lg);
}

.song-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.song-artist {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 视频推荐样式 */
.video-section {
  margin-bottom: 0;
}

.video-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-4);
  gap: var(--grid-gap-md);
}

.video-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-cover {
  position: relative;
  width: var(--image-size-lg);
  height: calc(var(--image-size-lg) * 9 / 16);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-bottom: 12px;
}

.cover-img {
  width: 100%;
  height: 100%;
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
  width: var(--image-size-lg);
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
  margin-bottom: 0;
}

.radio-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-4);
  gap: var(--grid-gap-md);
}

.radio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-card:hover {
  transform: translateY(-4px);
}

.radio-cover {
  width: var(--image-size-lg);
  height: var(--image-size-lg);
  border-radius: var(--border-radius-lg);
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

.radio-desc {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* MV推荐样式 */
.mv-section {
  margin-bottom: 0;
}

.mv-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-4);
  gap: var(--grid-gap-md);
}

.mv-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mv-card:hover {
  transform: translateY(-4px);
}

.mv-cover {
  position: relative;
  width: var(--image-size-lg);
  height: calc(var(--image-size-lg) * 9 / 16);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-bottom: 12px;
}

.mv-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: var(--image-size-lg);
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
@media (max-width: var(--breakpoint-xl)) {
  .playlist-grid,
  .song-grid {
    grid-template-columns: var(--grid-columns-5);
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .playlist-grid,
  .song-grid {
    grid-template-columns: var(--grid-columns-4);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .banner-grid {
    grid-template-columns: 1fr;
  }

  .playlist-grid,
  .song-grid {
    grid-template-columns: var(--grid-columns-3);
  }

  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: var(--grid-columns-2);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .playlist-grid,
  .song-grid {
    grid-template-columns: var(--grid-columns-2);
  }

  .radio-card {
    flex-direction: column;
  }

  .radio-cover {
    width: 100%;
  }

  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: 1fr;
  }
}
</style>
