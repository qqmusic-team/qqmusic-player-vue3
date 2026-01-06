<template>
  <div class="artist-page">
    <h2 class="page-title">歌手</h2>

    <!-- 加载状态 -->
    <div v-if="categoryStore.isLoading && artists.length === 0" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="categoryStore.hasError" class="error-container">
      <p class="error-text">{{ categoryStore.error }}</p>
      <button class="retry-btn" @click="handleRetry">重试</button>
    </div>

    <template v-else>
      <!-- 筛选区域 -->
      <section class="filter-section">
        <div class="filter-container">
          <div class="filter-group">
            <span class="filter-label">类型:</span>
            <div class="filter-options">
              <span
                v-for="type in artistTypes"
                :key="type.value"
                :class="['filter-option', { active: selectedType === type.value }]"
                @click="selectType(type.value)"
              >
                {{ type.label }}
              </span>
            </div>
          </div>

          <div class="filter-group">
            <span class="filter-label">地区:</span>
            <div class="filter-options">
              <span
                v-for="region in regions"
                :key="region.value"
                :class="['filter-option', { active: selectedRegion === region.value }]"
                @click="selectRegion(region.value)"
              >
                {{ region.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- 首字母筛选 -->
        <div class="alphabet-filter">
          <span
            v-for="letter in alphabetLetters"
            :key="letter"
            :class="['letter-option', { active: selectedLetter === letter }]"
            @click="selectLetter(letter)"
          >
            {{ letter }}
          </span>
        </div>
      </section>

      <!-- 歌手列表 -->
      <section class="artist-list-section">
        <div v-if="isFiltering" class="filter-loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">筛选中...</p>
        </div>

        <div v-else-if="artists.length === 0" class="empty-container">
          <p class="empty-text">暂无歌手数据</p>
        </div>

        <div v-else class="artist-list">
          <div
            v-for="artist in artists"
            :key="artist.id"
            class="artist-card"
            @click="goToArtistDetail(artist.id)"
          >
            <div class="artist-avatar-container">
              <div v-if="!artist.imageLoaded" class="avatar-placeholder">
                <span class="placeholder-icon">🎵</span>
              </div>
              <img
                :src="getOptimizedImageUrl(artist)"
                :alt="artist.name"
                class="artist-avatar"
                loading="lazy"
                crossorigin="anonymous"
                @load="onImageLoad(artist)"
                @error="onImageError(artist)"
                :style="{
                  opacity: artist.imageLoaded ? 1 : 0,
                  display: artist.hasError && artist.imageLoaded ? 'block' : 'block',
                }"
              />
              <div v-if="artist.hasError && artist.imageLoaded" class="image-error-badge">
                <span>⚠️</span>
              </div>
            </div>
            <div class="artist-info">
              <h4 class="artist-name" :title="artist.name">{{ artist.name }}</h4>
              <p class="artist-desc" :title="artist.briefDesc || artist.alias?.join(', ')">
                {{ artist.briefDesc || artist.alias?.join(", ") || "" }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="isLoadingMore" class="scroll-loading-indicator">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else-if="loadError" class="load-error-container">
          <el-icon :size="32" color="#ff4d4f"><CircleClose /></el-icon>
          <p class="error-text">加载失败，请重试</p>
          <el-button type="primary" @click="handleLoadMoreRetry">重试</el-button>
        </div>

        <div v-else-if="!hasMore && artists.length > 0" class="no-more">
          <p class="no-more-text">没有更多了</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from "vue";
import { useRouter } from "vue-router";
import { Loading, CircleClose } from "@element-plus/icons-vue";

import { useCategoryStore } from "@/stores/category";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";

defineOptions({
  name: "ArtistList",
});

const categoryStore = useCategoryStore();
const router = useRouter();

const scrollContainerRef = inject("scrollContainer", ref(null));
const isLoadingMore = ref(false);
const loadError = ref(false);
const isFiltering = ref(false);
const imageLoadedStates = ref(new Map());
const imageErrorStates = ref(new Map());

const handleLoadMoreArtists = async () => {
  if (isLoadingMore.value || !hasMore.value) return;

  try {
    isLoadingMore.value = true;
    loadError.value = false;
    await categoryStore.getArtists(
      selectedType.value,
      selectedRegion.value,
      selectedLetter.value,
      categoryStore.currentPage + 1,
      30,
      true
    );
  } catch (error) {
    console.error("加载更多歌手失败:", error);
    loadError.value = true;
  } finally {
    isLoadingMore.value = false;
  }
};

const { resetScroll } = useInfiniteScroll({
  threshold: 200,
  debounceTime: 300,
  onLoadMore: handleLoadMoreArtists,
  hasMore: computed(() => categoryStore.hasMore),
  isLoading: computed(() => isLoadingMore.value),
  scrollContainerRef: scrollContainerRef,
});

const artistTypes = [
  { label: "全部", value: -1 },
  { label: "男歌手", value: 1 },
  { label: "女歌手", value: 2 },
  { label: "乐队组合", value: 3 },
];

const regions = [
  { label: "全部", value: -1 },
  { label: "华语", value: 7 },
  { label: "欧美", value: 96 },
  { label: "日本", value: 8 },
  { label: "韩国", value: 16 },
  { label: "其他", value: 0 },
];

const alphabetLetters = [
  "#",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const selectedType = ref(-1);
const selectedRegion = ref(-1);
const selectedLetter = ref("");

const artists = computed(() => {
  return categoryStore.artists.map((artist) => ({
    ...artist,
    imageLoaded: imageLoadedStates.value.get(artist.id) ?? false,
    hasValidImage: isValidImageUrl(artist.picUrl || artist.img1v1Url),
    hasError: imageErrorStates.value.get(artist.id) ?? false,
  }));
});
const hasMore = computed(() => categoryStore.hasMore);

const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const getOptimizedImageUrl = (artist) => {
  const originalUrl = artist.picUrl || artist.img1v1Url;

  if (!originalUrl || !artist.hasValidImage) {
    return getDefaultAvatarUrl();
  }

  try {
    const url = new URL(originalUrl);

    if (url.hostname.includes("music.126.net")) {
      url.searchParams.set("param", "120y120");
      return url.toString();
    }

    return originalUrl;
  } catch (error) {
    console.warn("URL解析失败:", originalUrl, error);
    return getDefaultAvatarUrl();
  }
};

const getDefaultAvatarUrl = () => {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='60' y='60' font-size='40' text-anchor='middle' dy='.3em' fill='%23999'%3E🎵%3C/text%3E%3C/svg%3E";
};

const onImageLoad = (artist) => {
  imageLoadedStates.value.set(artist.id, true);
  imageErrorStates.value.set(artist.id, false);
};

const onImageError = (artist) => {
  console.warn(`图片加载失败: ${artist.name}, URL: ${artist.picUrl || artist.img1v1Url}`);

  imageErrorStates.value.set(artist.id, true);

  const fallbackUrl = getDefaultAvatarUrl();
  const originalUrl = artist.picUrl || artist.img1v1Url;

  if (originalUrl !== fallbackUrl) {
    artist.picUrl = fallbackUrl;
    artist.hasValidImage = true;
  }

  imageLoadedStates.value.set(artist.id, true);
};

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("URL is empty"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error("Image load failed"));

    img.src = url;
  });
};

const selectType = async (type) => {
  if (selectedType.value === type) return;

  selectedType.value = type;
  resetScroll();
  isFiltering.value = true;
  await loadArtists();
  isFiltering.value = false;
};

const selectRegion = async (region) => {
  if (selectedRegion.value === region) return;

  selectedRegion.value = region;
  resetScroll();
  isFiltering.value = true;
  await loadArtists();
  isFiltering.value = false;
};

const selectLetter = async (letter) => {
  if (selectedLetter.value === letter) return;

  selectedLetter.value = letter;
  resetScroll();
  isFiltering.value = true;
  await loadArtists();
  isFiltering.value = false;
};

const loadArtists = async (append = false) => {
  if (append && isLoadingMore.value) return;

  if (append) {
    isLoadingMore.value = true;
    loadError.value = false;
  }

  try {
    await categoryStore.getArtists(
      selectedType.value,
      selectedRegion.value,
      selectedLetter.value,
      append ? categoryStore.currentPage + 1 : 1,
      30,
      append
    );
  } catch (error) {
    console.error("加载歌手失败:", error);
    if (append) {
      loadError.value = true;
    }
  } finally {
    isLoadingMore.value = false;
  }
};

const goToArtistDetail = (id) => {
  if (id) {
    router.push({ name: "artistDetail", params: { id } });
  }
};

const handleRetry = () => {
  categoryStore.clearError();
  loadArtists();
};

const handleLoadMoreRetry = () => {
  loadError.value = false;
  handleLoadMoreArtists();
};

onMounted(async () => {
  await loadArtists();

  const artistsToPreload = artists.value.slice(0, 10);
  for (const artist of artistsToPreload) {
    const imageUrl = getOptimizedImageUrl(artist);
    if (imageUrl && artist.hasValidImage) {
      try {
        await preloadImage(imageUrl);
        imageLoadedStates.value.set(artist.id, true);
        imageErrorStates.value.set(artist.id, false);
      } catch (error) {
        console.warn(`预加载图片失败: ${artist.name}`, error);
        imageErrorStates.value.set(artist.id, true);
      }
    }
  }
});

onUnmounted(() => {
  imageLoadedStates.value.clear();
  imageErrorStates.value.clear();
});
</script>

<style scoped>
.artist-page {
  padding: 0;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
}

/* 加载状态 */
.loading-container {
  
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #999;
}

/* 错误提示 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.error-text {
  font-size: 14px;
  color: #ff4d4f;
}

/* 空状态 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* 没有更多 */
.no-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.no-more-text {
  font-size: 14px;
  color: #999;
}

/* 筛选区域样式 */
.filter-section {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  gap: 40px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-option {
  padding: 6px 12px;
  background: #fff;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.filter-option:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.filter-option.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

/* 首字母筛选 */
.alphabet-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.letter-option {
  width: 30px;
  height: 30px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.letter-option:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
}

.letter-option.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

/* 筛选加载状态 */
.filter-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  animation: fadeIn 0.3s ease;
}

/* 歌手列表 */
.artist-list-section {
  margin-bottom: 0;
}

.artist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f0f0f0;
}

.artist-card:hover {
  background: #f8f8f8;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.artist-avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  border-radius: var(--border-radius-full);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.avatar-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  z-index: 1;
}

.placeholder-icon {
  font-size: 40px;
  opacity: 0.5;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.artist-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.3s ease;
  position: relative;
  z-index: 2;
}

.image-error-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(255, 77, 79, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.image-error-badge span {
  line-height: 1;
}

.artist-card:hover .artist-avatar {
  transform: scale(1.05);
}

.artist-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1;
  width: 100%;
  text-align: center;
}

.artist-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.artist-desc {
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.scroll-loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  gap: 12px;
}

.scroll-loading-indicator .loading-text {
  font-size: 14px;
  color: #999;
}

.load-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  gap: 12px;
  padding: 20px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #ffccc7;
}

.load-error-container .error-text {
  font-size: 14px;
  color: #ff4d4f;
}

.no-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
@media (max-width: var(--breakpoint-lg)) {
  .filter-section {
    padding: 10px 16px;
    margin-bottom: 18px;
  }

  .artist-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .filter-section {
    padding: 8px 14px;
    margin-bottom: 16px;
  }

  .filter-container {
    gap: 20px;
    margin-bottom: 8px;
  }

  .filter-group {
    gap: 8px;
  }

  .filter-options {
    gap: 5px;
  }

  .alphabet-filter {
    gap: 5px;
    padding-top: 8px;
  }

  .artist-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  .artist-card {
    padding: 12px;
  }

  .artist-avatar-container {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .artist-info {
    align-items: center;
  }

  .artist-name {
    font-size: 14px;
  }

  .artist-desc {
    font-size: 12px;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .filter-section {
    padding: 8px 12px;
    margin-bottom: 14px;
  }

  .artist-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .artist-card {
    padding: 10px;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .artist-avatar-container {
    width: 90px;
    height: 90px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .artist-info {
    align-items: center;
  }

  .artist-name {
    font-size: 14px;
  }

  .artist-desc {
    font-size: 12px;
  }

  .filter-container {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 8px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .filter-options {
    width: 100%;
    justify-content: flex-start;
    gap: 4px;
  }

  .filter-option {
    padding: 4px 8px;
    font-size: 13px;
  }

  .alphabet-filter {
    justify-content: flex-start;
    gap: 4px;
    padding-top: 8px;
  }

  .letter-option {
    width: 26px;
    height: 26px;
    font-size: 13px;
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .filter-section {
    padding: 6px 10px;
    margin-bottom: 12px;
  }

  .artist-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .artist-card {
    padding: 8px;
  }

  .artist-avatar-container {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .filter-container {
    gap: 10px;
  }

  .filter-option {
    padding: 3px 6px;
    font-size: 12px;
  }

  .letter-option {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
}
</style>
