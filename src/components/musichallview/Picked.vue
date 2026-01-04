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
        <button class="nav-btn prev-btn" @click="prevSlide" :disabled="isTransitioning">
          <span class="nav-icon">‹</span>
        </button>
        <div class="swiper-container">
          <div class="banner-wrapper" @mouseenter="pauseAutoPlay" @mouseleave="resumeAutoPlay">
            <div class="banner-track">
              <div v-for="banner in visibleBanners" :key="banner.bannerId" class="banner-slide">
                <div class="banner-card">
                  <img
                    :src="banner.pic"
                    :alt="banner.typeTitle"
                    class="banner-img"
                    @load="handleImageLoad($event, banner.bannerId)"
                    @error="handleImageError($event, banner.bannerId)"
                  />
                  <div v-if="isImageLoaded(banner.bannerId)" class="banner-overlay">
                    <span class="tag">{{ banner.typeTitle }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!areImagesLoaded" class="banner-loading">
              <div class="loading-spinner"></div>
            </div>
          </div>
          <div class="pagination">
            <span
              v-for="(banner, index) in banners"
              :key="banner.bannerId"
              :class="['dot', { active: currentIndex === index }]"
              @click="goToSlide(index)"
            ></span>
          </div>
        </div>
        <button class="nav-btn next-btn" @click="nextSlide" :disabled="isTransitioning">
          <span class="nav-icon">›</span>
        </button>
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
              <div class="play-btn">▶</div>
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
          <div v-for="program in djProgram.slice(0, 6)" :key="program.id" class="radio-card">
            <div class="radio-cover">
              <img :src="program.picUrl" :alt="program.name" class="cover-img" />
              <div class="play-btn">▶</div>
            </div>
            <div class="radio-info">
              <p class="radio-name">{{ program.name }}</p>
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
          <div v-for="mv in personalizedMv.slice(0, 6)" :key="mv.id" class="mv-card">
            <div class="mv-cover" :style="getMvCoverStyle(mv.id)">
              <img
                :src="mv.picUrl"
                :alt="mv.name"
                class="cover-img"
                @load="handleMvImageLoad($event, mv.id)"
              />
              <div class="play-btn">▶</div>
            </div>
            <div class="mv-info">
              <p class="mv-name">{{ mv.name }}</p>
              <p class="mv-desc">{{ mv.artistName }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
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

const currentIndex = ref(0);
const isTransitioning = ref(false);
const isLoading = ref(false);
const error = ref(null);

const imageDimensions = ref({});
const imageLoadErrors = ref(new Set());
const mvImageDimensions = ref({});

let autoPlayTimer = null;
const AUTO_PLAY_INTERVAL = 3000;

const hasError = computed(() => {
  return error.value !== null;
});

const visibleBanners = computed(() => {
  if (banners.value.length === 0) return [];
  return [banners.value[currentIndex.value]];
});

const isImageLoaded = (bannerId) => {
  return !!imageDimensions.value[bannerId];
};

const areImagesLoaded = computed(() => {
  if (banners.value.length === 0) return true;
  return visibleBanners.value.every((banner) => isImageLoaded(banner.bannerId));
});

const handleImageLoad = (event, bannerId) => {
  const img = event.target;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  if (naturalWidth > 0 && naturalHeight > 0) {
    imageDimensions.value[bannerId] = {
      width: naturalWidth,
      height: naturalHeight,
      aspectRatio: naturalWidth / naturalHeight,
    };

    imageLoadErrors.value.delete(bannerId);

    nextTick(() => {});
  }
};

const handleImageError = (event, bannerId) => {
  imageLoadErrors.value.add(bannerId);
  console.error(`Failed to load banner image for bannerId: ${bannerId}`);

  const img = event.target;
  img.src = `https://via.placeholder.com/800x400/1890ff/ffffff?text=Image+Not+Available`;
  img.onerror = null;
};

const handleMvImageLoad = (event, mvId) => {
  const img = event.target;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  if (naturalWidth > 0 && naturalHeight > 0) {
    mvImageDimensions.value[mvId] = {
      width: naturalWidth,
      height: naturalHeight,
      aspectRatio: naturalWidth / naturalHeight,
    };
  }
};

const getMvCoverStyle = (mvId) => {
  const dimensions = mvImageDimensions.value[mvId];
  if (!dimensions) {
    return {
      width: "200px",
      height: "200px",
    };
  }

  const maxWidth = 200;
  const aspectRatio = dimensions.aspectRatio;

  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > 300) {
    height = 300;
    width = height * aspectRatio;
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
  };
};

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

const nextSlide = () => {
  if (isTransitioning.value || banners.value.length === 0) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % banners.value.length;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
};

const prevSlide = () => {
  if (isTransitioning.value || banners.value.length === 0) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
};

const goToSlide = (index) => {
  if (isTransitioning.value || index === currentIndex.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
};

const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayTimer = setInterval(() => {
    nextSlide();
  }, AUTO_PLAY_INTERVAL);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

const pauseAutoPlay = () => {
  stopAutoPlay();
};

const resumeAutoPlay = () => {
  startAutoPlay();
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
  startAutoPlay();
});

onBeforeUnmount(() => {
  stopAutoPlay();
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
  padding: 0;
  background: transparent;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.swiper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 800px !important;
  margin: 0 auto;
}

.banner-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px !important;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 800px !important;
  height: 320px !important;
  margin: 0 auto;
  padding: 0;
  transition: height 0.3s ease;
}

.banner-track {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 800px !important;
  height: 100%;
  will-change: transform;
}

.banner-slide {
  flex: 0 0 800px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.banner-card {
  width: 800px !important;
  height: auto;
  border-radius: 16px !important;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  margin: 0;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.banner-img {
  max-width: none !important;
  max-height: none !important;
  width: 800px !important;
  height: 320px !important;
  border-radius: 16px !important;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.banner-card:hover .banner-img {
  transform: scale(1.05) translateZ(0);
  transition: transform 0.3s ease;
}

.banner-card:hover .banner-overlay {
  transform: scale(1.05) translateZ(0);
  transition: transform 0.3s ease;
}

.banner-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  z-index: 5;
}

.banner-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(24, 144, 255, 0.2);
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.banner-overlay {
  position: absolute;
  border-radius: 16px !important;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
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

.nav-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 32px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(24, 144, 255, 0.8);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-icon {
  line-height: 1;
  user-select: none;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 15px;
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
  background: #bfbfbf;
}

.dot.active {
  background: #1890ff;
  width: 24px;
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
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 20px !important;
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
  width: 200px !important;
  height: 200px !important;
  border-radius: 12px !important;
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
  width: 200px;
}

.playlist-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;

  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.playlist-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 新歌推荐样式 */
.newsong-section {
  margin-bottom: 40px;
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 20px !important;
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
  width: 200px !important;
  height: 200px !important;
  border-radius: 12px !important;
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
  width: 200px;
}

.song-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.song-artist {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 视频推荐样式 */
.video-section {
  margin-bottom: 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 20px !important;
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
  width: 200px !important;
  height: 113px !important;
  border-radius: 12px !important;
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
  z-index: 10000;
}

.video-cover:hover .play-btn,
.radio-cover:hover .play-btn,
.playlist-cover:hover .play-btn,
.song-cover:hover .play-btn,
.mv-cover:hover .play-btn {
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
  width: 200px;
}

.video-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 20px !important;
}

.radio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.radio-card:hover {
  transform: translateY(-4px);
}

.radio-cover {
  position: relative;
  width: 200px !important;
  height: 200px !important;
  border-radius: 12px !important;
  overflow: hidden;
  margin-bottom: 12px;
}

.radio-cover .cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.radio-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 200px;
}

.radio-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.radio-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* MV推荐样式 */
.mv-section {
  margin-bottom: 40px;
}

.mv-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 20px !important;
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
  border-radius: 12px !important;
  overflow: hidden;
  margin-bottom: 12px;
  transition: width 0.3s ease, height 0.3s ease;
}

.mv-cover .cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mv-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 200px;
}

.mv-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.mv-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
