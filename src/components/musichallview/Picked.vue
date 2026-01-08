<template>
  <div class="picked-page">
    <h2 class="page-title">精选推荐</h2>

    <!-- 加载状态 - 仅在所有模块都在加载时显示 -->

    <div  v-if="isLoading && !hasAnyData" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>
    <!-- 错误状态 - 仅在所有模块都失败时显示 -->
    <div v-else-if="hasError && !hasAnyData" class="error-container">
      <p>数据加载失败，请稍后重试</p>
      <button @click="loadData" class="retry-btn">重试</button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 轮播图区域 -->
      <section
        v-if="moduleStates.banners.data.length > 0 || moduleStates.banners.loading"
        class="banner-section"
      >
        <div
          v-if="moduleStates.banners.loading && moduleStates.banners.data.length === 0"
          class="module-loading"
          v-loading="true"
          element-loading-text="轮播图加载中..."
        ></div>
        <div
          v-else-if="moduleStates.banners.error && moduleStates.banners.data.length === 0"
          class="module-error"
        >
          <p>{{ moduleStates.banners.error }}</p>
          <button @click="loadBanners" class="retry-btn-small">重试</button>
        </div>
        <template v-else>
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

              <div v-if="!areImagesLoaded" class="banner-loading" v-loading="true"></div>
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
        </template>
      </section>

      <!-- 轮播图区域错误提示 -->
      <section
        v-else class="banner-section"
      >
        <div class="module-error">
          <p>无法加载该区域内容</p>
          <button @click="loadBanners" class="retry-btn-small">重试</button>
        </div>
      </section>

      <!-- 推荐歌单区域 -->
      <section
        v-if="moduleStates.personalized.data.length > 0 || moduleStates.personalized.loading"
        class="playlist-section"
      >
        <div class="section-header">
          <h3 class="section-title">推荐歌单</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div
          v-if="moduleStates.personalized.loading && moduleStates.personalized.data.length === 0"
          class="module-loading"
          v-loading="true"
          element-loading-text="推荐歌单加载中..."
        ></div>
        <div
          v-else-if="moduleStates.personalized.error && moduleStates.personalized.data.length === 0"
          class="module-error"
        >
          <p>{{ moduleStates.personalized.error }}</p>
          <button @click="loadPersonalized" class="retry-btn-small">重试</button>
        </div>
        <div v-else class="playlist-grid">
          <div
            v-for="item in personalized.slice(0, 6)"
            :key="item.id"
            class="playlist-card"
            @click="navigateToPlaylist(item.id)"
          >
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

      <!-- 推荐歌单区域错误提示 -->
      <section
        v-else class="playlist-section"
      >
        <div class="section-header">
          <h3 class="section-title">推荐歌单</h3>
        </div>
        <div class="module-error">
          <p>无法加载该区域内容</p>
          <button @click="loadPersonalized" class="retry-btn-small">重试</button>
        </div>
      </section>

      <!-- 新歌推荐区域 -->
      <section
        v-if="
          moduleStates.personalizedNewSong.data.length > 0 ||
          moduleStates.personalizedNewSong.loading
        "
        class="newsong-section"
      >
        <div class="section-header">
          <h3 class="section-title">新歌推荐</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div
          v-if="
            moduleStates.personalizedNewSong.loading &&
            moduleStates.personalizedNewSong.data.length === 0
          "
          class="module-loading"
          v-loading="true"
          element-loading-text="新歌推荐加载中..."
        ></div>
        <div
          v-else-if="
            moduleStates.personalizedNewSong.error &&
            moduleStates.personalizedNewSong.data.length === 0
          "
          class="module-error"
        >
          <p>{{ moduleStates.personalizedNewSong.error }}</p>
          <button @click="loadPersonalizedNewSong" class="retry-btn-small">重试</button>
        </div>
        <div v-else class="song-grid">
          <div v-for="item in personalizedNewSong.slice(0, 6)" :key="item.id" class="song-card">
            <div class="song-cover">
              <img :src="item.picUrl" :alt="item.name" class="cover-img" />
              <div
                class="play-btn"
                @click.stop="playNewSong(item)"
                :class="{ loading: isNewSongLoading }"
              >
                <span v-if="!isNewSongLoading">▶</span>
                <span v-else class="loading-spinner-small"></span>
              </div>
            </div>
            <div class="song-info">
              <p class="song-name" @click="playNewSong(item)">{{ item.name }}</p>
              <p class="song-artist" @click="playNewSong(item)">
                {{ item.song.artists.map((a) => a.name).join(", ") }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 新歌推荐区域错误提示 -->
      <section
        v-else
        class="newsong-section"
      >
        <div class="section-header">
          <h3 class="section-title">新歌推荐</h3>
        </div>
        <div class="module-error">
          <p>无法加载该区域内容</p>
          <button @click="loadPersonalizedNewSong" class="retry-btn-small">重试</button>
        </div>
      </section>

      <!-- 视频推荐区域 -->
      <section
        v-if="moduleStates.videos.data.length > 0 || moduleStates.videos.loading"
        class="video-section"
      >
        <div class="section-header">
          <h3 class="section-title">视频推荐</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div
          v-if="moduleStates.videos.loading && moduleStates.videos.data.length === 0"
          class="module-loading"
          v-loading="true"
          element-loading-text="视频推荐加载中..."
        ></div>
        <div
          v-else-if="moduleStates.videos.error && moduleStates.videos.data.length === 0"
          class="module-error"
        >
          <p>{{ moduleStates.videos.error }}</p>
          <button @click="loadVideos" class="retry-btn-small">重试</button>
        </div>
        <div v-else class="video-grid">
          <div v-for="video in videos.slice(0, 6)" :key="video.id" class="video-card">
            <div class="video-cover" :style="getVideoCoverStyle(video.id)">
              <img
                :src="
                  video.data?.coverUrl ||
                  video.coverUrl ||
                  `https://picsum.photos/400/400?random=${Math.random()}`
                "
                class="cover-img"
                @load="handleVideoImageLoad($event, video.id)"
              />
              <div class="play-btn">▶</div>
              <div class="video-duration">
                <span
                  v-if="videoDurationLoading.has(video.data?.vid)"
                  class="duration-loading"
                  v-loading="true"
                ></span>
                <span v-else-if="videoDurationData.has(video.data?.vid)">
                  {{ formatDuration(videoDurationData.get(video.data?.vid) || 0) }}
                </span>
                <span v-else>
                  {{ formatDuration(video.data?.durationms || 0) }}
                </span>
              </div>
            </div>
            <div class="video-info">
              <p class="video-title">{{ video.data?.title || "视频标题" }}</p>
              <p class="video-stats">{{ formatPlayCount(video.data?.playTime || 0) }}次播放</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 视频推荐区域错误提示 -->
      <section
        v-else
        class="video-section"
      >
        <div class="section-header">
          <h3 class="section-title">视频推荐</h3>
        </div>
        <div class="module-error">
          <p>无法加载该区域内容，尝试登录后再访问</p>
          <button @click="loadVideos" class="retry-btn-small">重试</button>
        </div>
      </section>

      <!-- 热门电台区域 -->
      <section
        v-if="moduleStates.hotRadios.data.length > 0 || moduleStates.hotRadios.loading"
        class="radio-section"
      >
        <div class="section-header">
          <h3 class="section-title">热门电台</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div
          v-if="moduleStates.hotRadios.loading && moduleStates.hotRadios.data.length === 0"
          class="module-loading"
          v-loading="true"
          element-loading-text="热门电台加载中..."
        ></div>
        <div
          v-else-if="moduleStates.hotRadios.error && moduleStates.hotRadios.data.length === 0"
          class="module-error"
        >
          <p>{{ moduleStates.hotRadios.error }}</p>
          <button @click="loadHotRadios" class="retry-btn-small">重试</button>
        </div>
        <div v-else class="radio-grid">
          <div
            v-for="radio in hotRadios.slice(0, 6)"
            :key="radio.id"
            class="radio-card"
            @click="navigateToRadioDetail(radio.id)"
          >
            <div class="radio-cover">
              <img :src="radio.picUrl" :alt="radio.name" class="cover-img" />
              <div
                class="play-btn"
                @click.stop="playRadio(radio)"
                :class="{ loading: isRadioLoading }"
              >
                <span v-if="!isRadioLoading">▶</span>
                <span v-else class="loading-spinner-small"></span>
              </div>
              <div class="play-count">{{ formatPlayCount(radio.subCount) }}</div>
            </div>
            <div class="radio-info">
              <p class="radio-name">{{ radio.name }}</p>
              <p class="radio-desc">{{ radio.rcmdText || radio.dj?.name || "电台" }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门电台区域错误提示 -->
      <section
        v-else
        class="radio-section"
      >
        <div class="section-header">
          <h3 class="section-title">热门电台</h3>
        </div>
        <div class="module-error">
          <p>无法加载该区域内容</p>
          <button @click="loadHotRadios" class="retry-btn-small">重试</button>
        </div>
      </section>

      <!-- MV推荐区域 -->
      <section
        v-if="moduleStates.personalizedMv.data.length > 0 || moduleStates.personalizedMv.loading"
        class="mv-section"
      >
        <div class="section-header">
          <h3 class="section-title">最新MV</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>
        <div
          v-if="
            moduleStates.personalizedMv.loading && moduleStates.personalizedMv.data.length === 0
          "
          class="module-loading"
          v-loading="true"
          element-loading-text="最新MV加载中..."
        ></div>
        <div
          v-else-if="
            moduleStates.personalizedMv.error && moduleStates.personalizedMv.data.length === 0
          "
          class="module-error"
        >
          <p>{{ moduleStates.personalizedMv.error }}</p>
          <button @click="loadPersonalizedMv" class="retry-btn-small">重试</button>
        </div>
        <div v-else class="mv-grid">
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

      <!-- MV推荐区域错误提示 -->
      <section
        v-else
        class="mv-section"
      >
        <div class="section-header">
          <h3 class="section-title">最新MV</h3>
        </div>
        <div class="module-error">
          <p>无法加载该区域内容</p>
          <button @click="loadPersonalizedMv" class="retry-btn-small">重试</button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { useMusicHallStore } from "@/stores/musicHall";
import { useDJStore } from "@/stores/dj";
import { usePlayerStore } from "@/stores/player";
import { useRouter } from "vue-router";
import { useDjProgram } from "@/utils/api";
import { ElMessage} from "element-plus";

defineOptions({
  name: "PickedView",
});

const musicHallStore = useMusicHallStore();
const djStore = useDJStore();
const playerStore = usePlayerStore();
const router = useRouter();

const moduleStates = ref({
  banners: { loading: false, error: null, data: [] },
  personalized: { loading: false, error: null, data: [] },
  personalizedNewSong: { loading: false, error: null, data: [] },
  personalizedMv: { loading: false, error: null, data: [] },
  videos: { loading: false, error: null, data: [] },
  hotRadios: { loading: false, error: null, data: [] },
});

const banners = computed(() => moduleStates.value.banners.data);
const personalized = computed(() => moduleStates.value.personalized.data);
const personalizedNewSong = computed(() => moduleStates.value.personalizedNewSong.data);
const personalizedMv = computed(() => moduleStates.value.personalizedMv.data);
const videos = computed(() => moduleStates.value.videos.data);
const hotRadios = computed(() => moduleStates.value.hotRadios.data);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const imageDimensions = ref({});
const imageLoadErrors = ref(new Set());
const mvImageDimensions = ref({});
const videoImageDimensions = ref({});
const isRadioLoading = ref(false);
const isNewSongLoading = ref(false);
const videoDurationLoading = ref(new Set());
const videoDurationData = ref(new Map());

let autoPlayTimer = null;
const AUTO_PLAY_INTERVAL = 3000;

const isLoading = computed(() => {
  return Object.values(moduleStates.value).some((state) => state.loading);
});

const hasError = computed(() => {
  return Object.values(moduleStates.value).some((state) => state.error !== null);
});

const hasAnyData = computed(() => {
  return Object.values(moduleStates.value).some((state) => state.data.length > 0);
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

const handleVideoImageLoad = (event, videoId) => {
  const img = event.target;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  if (naturalWidth > 0 && naturalHeight > 0) {
    videoImageDimensions.value[videoId] = {
      width: naturalWidth,
      height: naturalHeight,
      aspectRatio: naturalWidth / naturalHeight,
    };
  }
};

const getVideoCoverStyle = (videoId) => {
  const dimensions = videoImageDimensions.value[videoId];
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

const loadBanners = async () => {
  const moduleName = "banners";
  moduleStates.value[moduleName].loading = true;
  moduleStates.value[moduleName].error = null;
  try {
    await musicHallStore.getBanners();
    moduleStates.value[moduleName].data = musicHallStore.banners;
  } catch (err) {
    moduleStates.value[moduleName].error = "加载轮播图失败";
    console.error("加载轮播图失败:", err);
  } finally {
    moduleStates.value[moduleName].loading = false;
  }
};

const loadPersonalized = async () => {
  const moduleName = "personalized";
  moduleStates.value[moduleName].loading = true;
  moduleStates.value[moduleName].error = null;
  try {
    await musicHallStore.getPersonalized();
    moduleStates.value[moduleName].data = musicHallStore.personalized;
  } catch (err) {
    moduleStates.value[moduleName].error = "加载推荐歌单失败";
    console.error("加载推荐歌单失败:", err);
  } finally {
    moduleStates.value[moduleName].loading = false;
  }
};

const loadPersonalizedNewSong = async () => {
  const moduleName = "personalizedNewSong";
  moduleStates.value[moduleName].loading = true;
  moduleStates.value[moduleName].error = null;
  try {
    await musicHallStore.getPersonalizedNewSong();
    moduleStates.value[moduleName].data = musicHallStore.personalizedNewSong;
  } catch (err) {
    moduleStates.value[moduleName].error = "加载新歌推荐失败";
    console.error("加载新歌推荐失败:", err);
  } finally {
    moduleStates.value[moduleName].loading = false;
  }
};

const loadPersonalizedMv = async () => {
  const moduleName = "personalizedMv";
  moduleStates.value[moduleName].loading = true;
  moduleStates.value[moduleName].error = null;
  try {
    await musicHallStore.getPersonalizedMv();
    moduleStates.value[moduleName].data = musicHallStore.personalizedMv;
  } catch (err) {
    moduleStates.value[moduleName].error = "加载MV推荐失败";
    console.error("加载MV推荐失败:", err);
  } finally {
    moduleStates.value[moduleName].loading = false;
  }
};

const loadVideos = async () => {
  const moduleName = "videos";
  moduleStates.value[moduleName].loading = true;
  moduleStates.value[moduleName].error = null;
  try {
    await musicHallStore.getVideos();
    moduleStates.value[moduleName].data = musicHallStore.videos;

    await loadVideoDurations();
  } catch (err) {
    moduleStates.value[moduleName].error = "加载视频推荐失败";
    console.error("加载视频推荐失败:", err);
  } finally {
    moduleStates.value[moduleName].loading = false;
  }
};

const loadVideoDurations = async () => {
  const videosToLoad = videos.value.slice(0, 6);
  const videoIds = videosToLoad.map((video) => video.data?.vid).filter(Boolean);

  if (videoIds.length === 0) {
    console.warn("没有有效的视频ID");
    return;
  }

  console.log("开始加载视频时长:", videoIds);

  const loadPromises = videoIds.map(async (videoId) => {
    if (videoDurationData.value.has(videoId)) {
      return;
    }

    try {
      videoDurationLoading.value.add(videoId);
      const videoDetail = await musicHallStore.getVideoDetail(videoId);

      if (videoDetail && videoDetail.data && videoDetail.data.durationms) {
        videoDurationData.value.set(videoId, videoDetail.data.durationms);
        console.log(`视频 ${videoId} 时长:`, formatDuration(videoDetail.data.durationms));
      } else {
        console.warn(`视频 ${videoId} 时长数据无效`);
      }
    } catch (error) {
      console.error(`加载视频 ${videoId} 时长失败:`, error);
    } finally {
      videoDurationLoading.value.delete(videoId);
    }
  });

  await Promise.allSettled(loadPromises);
  console.log("视频时长加载完成");
};

const loadHotRadios = async () => {
  const moduleName = "hotRadios";
  moduleStates.value[moduleName].loading = true;
  moduleStates.value[moduleName].error = null;
  try {
    await djStore.getDjHot();
    moduleStates.value[moduleName].data = djStore.hotRadios;
  } catch (err) {
    moduleStates.value[moduleName].error = "加载热门电台失败";
    console.error("加载热门电台失败:", err);
  } finally {
    moduleStates.value[moduleName].loading = false;
  }
};

const loadData = async () => {
  const modules = [
    loadBanners,
    loadPersonalized,
    loadPersonalizedNewSong,
    loadPersonalizedMv,
    loadVideos,
    loadHotRadios,
  ];

  await Promise.allSettled(modules.map((module) => module()));
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

const playNewSong = async (songItem) => {
  if (!songItem || !songItem.id) {
    console.error("歌曲信息无效");
    ElMessage.error("歌曲信息无效");
    return;
  }

  const songId = songItem.id;
  console.log("播放新歌:", songItem.name, songId);

  try {
    isNewSongLoading.value = true;

    const mappedSongs = personalizedNewSong.value.map((s) => ({
      id: s.id,
      name: s.name,
      ar: s.song?.artists || [],
      al: s.song?.album || {},
      cover: s.picUrl,
    }));

    playerStore.setPlaylist(mappedSongs);
    playerStore.showPlayList = false;

    await playerStore.play(songId);

    setTimeout(() => {
      try {
        playerStore.showPlayList = false;
      } catch (e) {
        console.warn("无法设置 showPlayList:", e);
      }
    }, 200);

    ElMessage.success(`开始播放: ${songItem.name}`);
  } catch (error) {
    console.error("播放新歌失败:", error);

    if (error.message?.includes("网络")) {
      ElMessage.error("网络错误，请检查网络连接后重试");
    } else if (error.message?.includes("404")) {
      ElMessage.error("歌曲不存在或已被删除");
    } else {
      ElMessage.error("播放歌曲失败，请稍后重试");
    }
  } finally {
    isNewSongLoading.value = false;
  }
};

const playRadio = async (radioItem) => {
  if (!radioItem || !radioItem.id) {
    console.error("电台信息无效");
    ElMessage.error("电台信息无效");
    return;
  }

  const radioId = radioItem.id;
  console.log("播放电台:", radioItem.name, radioId);

  try {
    isRadioLoading.value = true;

    const { programs } = await useDjProgram(radioId, 1, 0);

    if (!programs || programs.length === 0) {
      ElMessage.error("该电台暂无节目");
      console.error("该电台暂无节目");
      return;
    }

    const firstProgram = programs[0];
    console.log("获取到节目:", firstProgram.name, "歌曲ID:", firstProgram.mainSong?.id);

    if (!firstProgram.mainSong || !firstProgram.mainSong.id) {
      ElMessage.error("该节目暂无音频");
      console.error("该节目暂无音频");
      return;
    }

    await playerStore.play(firstProgram.mainSong.id);
    ElMessage.success(`开始播放: ${firstProgram.name}`);
  } catch (error) {
    console.error("播放电台失败:", error);

    if (error.message?.includes("网络")) {
      ElMessage.error("网络错误，请检查网络连接后重试");
    } else if (error.message?.includes("404")) {
      ElMessage.error("电台不存在或已被删除");
    } else {
      ElMessage.error("播放电台失败，请稍后重试");
    }
  } finally {
    isRadioLoading.value = false;
  }
};

const navigateToPlaylist = (playlistId) => {
  if (!playlistId) {
    console.error("歌单ID无效");
    return;
  }

  console.log("跳转到歌单:", playlistId);
  router.push({
    name: "playlistDetail",
    params: { id: playlistId },
  });
};

const navigateToRadioDetail = (radioId) => {
  if (!radioId) {
    console.error("电台ID无效");
    return;
  }

  console.log("跳转到电台详情:", radioId);
  router.push({
    name: "radioDetail",
    params: { id: radioId },
  });
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

  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}
.error-container {
  display: flex;
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

/* 模块级加载和错误状态样式 */
.module-loading,
.module-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  min-height: 200px;
  width: 100%;
}

.module-loading .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
}

.module-loading p,
.module-error p {
  font-size: 14px;
  color: #666;
}

.module-error p {
  color: #ff4d4f;
}

.retry-btn-small {
  padding: 6px 16px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
}

.retry-btn-small:hover {
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
  cursor: pointer;
  transition: color 0.3s ease;
}

.song-name:hover {
  color: #1890ff;
}

.song-artist {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  cursor: pointer;
  transition: color 0.3s ease;
}

.song-artist:hover {
  color: #1890ff;
}

/* 视频推荐样式 */
.video-section {
  margin-bottom: 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr) !important;
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
  border-radius: 12px !important;
  overflow: hidden;
  margin-bottom: 12px;
  transition: width 0.3s ease, height 0.3s ease;
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

.play-btn.loading {
  opacity: 1;
  background: rgba(24, 144, 255, 0.8);
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 20px;
}

.duration-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.loading-spinner-small {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

/* 响应式布局 */
@media (max-width: 1400px) {
  .playlist-grid,
  .song-grid,
  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
}

@media (max-width: 1200px) {
  .playlist-grid,
  .song-grid,
  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}

@media (max-width: 992px) {
  .playlist-grid,
  .song-grid,
  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .playlist-grid,
  .song-grid,
  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 576px) {
  .playlist-grid,
  .song-grid,
  .video-grid,
  .radio-grid,
  .mv-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
