<template>
  <div class="digital-album-page">
    <h2 class="page-title">数字专辑</h2>

    <!-- 专辑分类筛选区域 -->
    <section class="album-filters">
      <h3 class="section-title">分类</h3>
      <div class="filter-tabs">
        <div
          v-for="category in categories"
          :key="category.value"
          :class="['filter-tab', { active: activeCategory === category.label }]"
          @click="changeCategory(category.label)"
        >
          {{ category.label }}
        </div>
      </div>
    </section>

    <!-- 加载状态 -->
    <div v-if="isLoading && hotAlbums.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <p class="error-message">加载失败，请稍后重试</p>
      <button class="retry-btn" @click="retryLoad">重新加载</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="hotAlbums.length === 0" class="empty-container">
      <p class="empty-message">暂无专辑数据</p>
    </div>

    <!-- 热门专辑区域 -->
    <section v-else class="hot-album-section">
      <div class="section-header">
        <h3 class="section-title">热门数字专辑</h3>
        <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
      </div>

      <div class="hot-album-grid">
        <div
          v-for="album in hotAlbums"
          :key="album.id"
          class="hot-album-card"
          @click="viewAlbumDetail(album.id)"
        >
          <div class="album-cover">
            <img :src="album.picUrl" :alt="album.name" class="cover-img" />
            <div class="album-badge" v-if="album.badge">{{ album.badge }}</div>
            <div class="play-overlay" @click.stop="playAlbum(album)">
              <i class="play-icon">▶</i>
            </div>
          </div>
          <div class="album-info">
            <h4 class="album-name">{{ album.name }}</h4>
            <p class="album-artist">{{ getArtistNames(album.artists) }}</p>
            <div class="album-price">
              <span class="price">{{ formatPrice(album.price) }}</span>
              <span class="sales">{{ formatSales(album.sales) }}张</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新专辑上市区域 -->
    <section v-if="hotAlbums.length > 0" class="new-album-section">
      <div class="section-header">
        <h3 class="section-title">
          {{ activeCategory }}新专辑
          <span class="album-count">({{ sortedNewAlbums.length }}张)</span>
        </h3>
        <div class="sort-options">
          <div
            v-for="option in sortOptions"
            :key="option.value"
            :class="['sort-option', { active: activeSort === option.value }]"
            @click="changeSort(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>

      <div class="new-album-grid">
        <div
          v-for="album in sortedNewAlbums"
          :key="album.id"
          class="album-card"
          @click="viewAlbumDetail(album.id)"
        >
          <div class="album-cover">
            <img :src="album.picUrl" :alt="album.name" class="cover-img" />
            <div class="album-badge" v-if="album.badge">{{ album.badge }}</div>
            <div class="play-overlay" @click.stop="playAlbum(album)">
              <i class="play-icon">▶</i>
            </div>
          </div>
          <div class="album-info">
            <h4 class="album-name">{{ album.name }}</h4>
            <p class="album-artist">{{ getArtistNames(album.artists) }}</p>
            <p class="album-release-date">{{ album.releaseDate }}</p>
            <div class="album-price">
              <span class="price">{{ formatPrice(album.price) }}</span>
              <span class="sales">{{ formatSales(album.sales) }}张</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div class="load-more" v-if="sortedNewAlbums.length > 0">
        <button class="load-more-btn" @click="loadMore" :disabled="isLoading || !hasMore">
          {{ isLoading ? "加载中..." : hasMore ? "加载更多" : "没有更多了" }}
        </button>
      </div>

      <!-- 新专辑空状态 -->
      <div v-if="sortedNewAlbums.length === 0" class="empty-container">
        <p class="empty-message">该分类暂无新专辑</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDigitalAlbumStore } from "@/stores/digitalAlbum";
import { usePlayerStore } from "@/stores/player";

import type { DigitalAlbum } from "@/models/album";

const digitalAlbumStore = useDigitalAlbumStore();
const playerStore = usePlayerStore();

const { hasError, getHotAlbums, getNewAlbums, getAlbumDetail, clearError } = digitalAlbumStore;
const { pushPlayList, play } = playerStore;

const isLoading = computed(() => digitalAlbumStore.isLoading);
const hasMore = computed(() => digitalAlbumStore.hasMore);
const hotAlbums = computed(() => digitalAlbumStore.hotAlbums);
const newAlbums = computed(() => digitalAlbumStore.newAlbums);
const currentOffset = ref(0);
const limit = 10;

const categories = [
  { label: "全部", value: "ALL" },
  { label: "华语", value: "ZH" },
  { label: "欧美", value: "EA" },
  { label: "日韩", value: "KR" },
  { label: "粤语", value: "HK" },
];

const sortOptions = [
  { label: "最新", value: "latest" },
  { label: "最热", value: "hottest" },
  { label: "价格最低", value: "price_asc" },
  { label: "价格最高", value: "price_desc" },
];

const activeCategory = ref("全部");
const activeSort = ref("latest");

const categoryValue = computed(() => {
  const category = categories.find((c) => c.label === activeCategory.value);
  return category ? category.value : "ALL";
});

const sortedNewAlbums = computed<DigitalAlbum[]>(() => {
  const albums: DigitalAlbum[] = [...newAlbums.value];
  switch (activeSort.value) {
    case "latest":
      return albums.sort((a, b) => (b.publishTime || 0) - (a.publishTime || 0));
    case "hottest":
      return albums.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    case "price_asc":
      return albums.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_desc":
      return albums.sort((a, b) => (b.price || 0) - (a.price || 0));
    default:
      return albums;
  }
});

const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

const formatSales = (sales) => {
  if (sales >= 10000) {
    return `${(sales / 10000).toFixed(1)}万`;
  }
  return sales.toLocaleString();
};

const getArtistNames = (artists) => {
  if (!artists || !Array.isArray(artists) || artists.length === 0) {
    return "未知歌手";
  }
  return artists.map((artist) => artist.name).join(", ");
};

const changeCategory = async (category) => {
  activeCategory.value = category;
  currentOffset.value = 0;
  await loadAlbums();
};

const changeSort = (sortValue) => {
  activeSort.value = sortValue;
};

const viewAlbumDetail = async (albumId) => {
  try {
    await getAlbumDetail(albumId);
    if (digitalAlbumStore.currentAlbum) {
      console.log("查看专辑详情:", digitalAlbumStore.currentAlbum);
    }
  } catch (error) {
    console.error("获取专辑详情失败:", error);
  }
};

const playAlbum = async (album) => {
  try {
    await getAlbumDetail(album.id);
    if (digitalAlbumStore.currentAlbumSongs && digitalAlbumStore.currentAlbumSongs.length > 0) {
      const songs = digitalAlbumStore.currentAlbumSongs;
      pushPlayList(true, ...songs);
      if (songs[0] && songs[0].id) {
        play(songs[0].id);
      }
    }
  } catch (error) {
    console.error("播放专辑失败:", error);
  }
};

const loadAlbums = async () => {
  try {
    currentOffset.value = 0;
    await Promise.all([
      getHotAlbums(categoryValue.value),
      getNewAlbums(categoryValue.value, limit, currentOffset.value),
    ]);
    console.log("加载完成 - hotAlbums:", hotAlbums.value);
    console.log("加载完成 - newAlbums:", newAlbums.value);
    console.log("加载完成 - sortedNewAlbums:", sortedNewAlbums.value);
  } catch (error) {
    console.error("加载专辑数据失败:", error);
  }
};

const loadMore = async () => {
  if (!hasMore.value || isLoading) return;
  try {
    currentOffset.value += limit;
    await getNewAlbums(categoryValue.value, limit, currentOffset.value);
  } catch (error) {
    console.error("加载更多专辑失败:", error);
  }
};

const retryLoad = async () => {
  clearError();
  await loadAlbums();
};

onMounted(async () => {
  await loadAlbums();
});
</script>

<style scoped>
.digital-album-page {
  padding: 20px 0;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
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

.loading-text {
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.error-message {
  color: #ff4d4f;
  font-size: 16px;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 24px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
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

.empty-message {
  color: #999;
  font-size: 16px;
}

/* 分类筛选样式 */
.album-filters {
  margin-bottom: 30px;
}

.filter-tabs {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.filter-tab {
  padding: 8px 20px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  background: #e0e0e0;
}

.filter-tab.active {
  background: #1890ff;
  color: #fff;
}

/* 热门专辑样式 */
.hot-album-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.hot-album-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.hot-album-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-album-card:hover {
  transform: translateY(-4px);
}

.album-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.cover-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.album-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ff4d4f;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-cover:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  color: #fff;
  font-size: 32px;
  cursor: pointer;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.album-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  font-size: 14px;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
}

.sales {
  font-size: 12px;
  color: #999;
}

/* 新专辑上市样式 */
.new-album-section {
  margin-bottom: 40px;
}

.album-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
  margin-left: 8px;
}

.sort-options {
  display: flex;
  gap: 20px;
}

.sort-option {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  position: relative;
}

.sort-option:hover {
  color: #1890ff;
}

.sort-option.active {
  color: #1890ff;
}

.sort-option.active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1890ff;
  border-radius: 1px;
}

.new-album-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.album-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-release-date {
  font-size: 12px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载更多样式 */
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
@media (max-width: 1200px) {
  .hot-album-grid,
  .new-album-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .hot-album-grid,
  .new-album-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hot-album-grid,
  .new-album-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .sort-options {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 8px;
  }
}
</style>
