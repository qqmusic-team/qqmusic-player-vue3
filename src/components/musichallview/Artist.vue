<template>
  <div class="artist-page">
    <h2 class="page-title">歌手</h2>

    <!-- 加载状态 -->
    <div v-if="categoryStore.isLoading && artists.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
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
                @load="onImageLoad(artist)"
                @error="onImageError(artist)"
                :style="{ opacity: artist.imageLoaded ? 1 : 0 }"
              />
            </div>
            <div class="artist-info">
              <h4 class="artist-name" :title="artist.name">{{ artist.name }}</h4>
              <p class="artist-desc" :title="artist.briefDesc || artist.alias?.join(', ')">
                {{ artist.briefDesc || artist.alias?.join(", ") || "" }}
              </p>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div v-if="artists.length > 0" class="load-more">
          <button
            class="load-more-btn"
            @click="loadMoreArtists"
            :disabled="isLoadingMore || !hasMore"
          >
            {{ isLoadingMore ? "加载中..." : hasMore ? "加载更多" : "没有更多了" }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import { useCategoryStore } from "@/stores/category";

defineOptions({
  name: "ArtistList",
});

const categoryStore = useCategoryStore();
const router = useRouter();

const isLoadingMore = ref(false);
const loadError = ref(false);
const filterDebounceTimer = ref(null);
const isFiltering = ref(false);

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
    imageLoaded: false,
  }));
});
const hasMore = computed(() => categoryStore.hasMore);

const getOptimizedImageUrl = (artist) => {
  const originalUrl = artist.picUrl || artist.img1v1Url;
  if (!originalUrl) return "";

  try {
    const url = new URL(originalUrl, window.location.origin);
    url.searchParams.set("param", "120y120");
    return url.toString();
  } catch {
    return originalUrl;
  }
};

const onImageLoad = (artist) => {
  artist.imageLoaded = true;
};

const onImageError = (artist) => {
  artist.imageLoaded = true;
  const img = document.querySelector(`img[alt="${artist.name}"]`);
  if (img) {
    img.src =
      "https://p2.music.126.net/UeTuwE7pvjBpypWLudqukA==/109951164323221286.jpg?param=120y120";
  }
};

const filterDebounce = (func, wait) => {
  return (...args) => {
    if (filterDebounceTimer.value) {
      clearTimeout(filterDebounceTimer.value);
    }
    filterDebounceTimer.value = setTimeout(() => {
      func.apply(this, args);
      filterDebounceTimer.value = null;
    }, wait);
  };
};

const selectType = async (type) => {
  if (selectedType.value === type) return;

  selectedType.value = type;
  await filterDebounce(async () => {
    isFiltering.value = true;
    await loadArtists();
    isFiltering.value = false;
  }, 300)();
};

const selectRegion = async (region) => {
  if (selectedRegion.value === region) return;

  selectedRegion.value = region;
  await filterDebounce(async () => {
    isFiltering.value = true;
    await loadArtists();
    isFiltering.value = false;
  }, 300)();
};

const selectLetter = async (letter) => {
  if (selectedLetter.value === letter) return;

  selectedLetter.value = letter;
  await filterDebounce(async () => {
    isFiltering.value = true;
    await loadArtists();
    isFiltering.value = false;
  }, 300)();
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

const loadMoreArtists = async () => {
  if (isLoadingMore.value || !hasMore.value || loadError.value) return;

  await loadArtists(true);
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

onMounted(async () => {
  await loadArtists();
});

onUnmounted(() => {
  if (filterDebounceTimer.value) {
    clearTimeout(filterDebounceTimer.value);
  }
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
  border: 3px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.retry-btn {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.retry-btn:hover {
  background: #40a9ff;
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
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 30px;
}

.artist-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.artist-card:hover {
  background: #f8f8f8;
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

.artist-card:hover .artist-avatar {
  transform: scale(1.05);
}

.artist-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex: 1;
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

/* 加载更多按钮 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.load-more-btn {
  padding: 10px 30px;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .filter-section {
    padding: 10px 16px;
    margin-bottom: 18px;
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
}

@media (max-width: var(--breakpoint-sm)) {
  .filter-section {
    padding: 8px 12px;
    margin-bottom: 14px;
  }

  .artist-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
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
