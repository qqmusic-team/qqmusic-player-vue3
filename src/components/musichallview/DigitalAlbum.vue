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
      <div v-loading="true" element-loading-text="加载中..."></div>
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
            <div class="album-meta">
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
          <div class="album-info has-release-date">
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

      <div v-if="isLoading" class="scroll-loading-indicator">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        <p class="loading-text">加载中...</p>
      </div>

      <div v-else-if="!hasMore && sortedNewAlbums.length > 0" class="no-more">
        <p class="no-more-text">没有更多了</p>
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
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import { Loading } from "@element-plus/icons-vue";

import type { DigitalAlbum } from "@/models/album";

type DigitalAlbumSort = "latest" | "hottest" | "price_asc" | "price_desc";

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

const handleLoadMore = async () => {
  if (!hasMore.value || isLoading.value) return;
  try {
    currentOffset.value += limit;
    // 翻页始终按最新拉取，展示层再按 activeSort 进行本地排序
    await getNewAlbums(categoryValue.value, limit, currentOffset.value, "latest");
  } catch (error) {
    console.error("加载更多专辑失败:", error);
  }
};

const { resetScroll } = useInfiniteScroll({
  threshold: 200,
  debounceTime: 300,
  onLoadMore: handleLoadMore,
  hasMore: hasMore,
  isLoading: isLoading,
});

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
const activeSort = ref<DigitalAlbumSort>("latest");

const categoryValue = computed(() => {
  const category = categories.find((c) => c.label === activeCategory.value);
  return category ? category.value : "ALL";
});

const sortedNewAlbums = computed<DigitalAlbum[]>(() => {
  const list = newAlbums.value.slice();
  switch (activeSort.value) {
    case "hottest":
      return list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    case "price_asc":
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_desc":
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "latest":
    default:
      return list.sort((a, b) => (b.publishTime || 0) - (a.publishTime || 0));
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
  resetScroll();
  await loadAlbums();
};

const changeSort = async (sortValue) => {
  activeSort.value = sortValue;
  // 排序只影响当前分类已加载的新专辑展示，不触发重新请求
  resetScroll();
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
      // 初始/切换分类始终按最新拉取，展示层再按 activeSort 本地排序
      getNewAlbums(categoryValue.value, limit, currentOffset.value, "latest"),
    ]);
    console.log("加载完成 - hotAlbums:", hotAlbums.value);
    console.log("加载完成 - newAlbums:", newAlbums.value);
    console.log("加载完成 - sortedNewAlbums:", sortedNewAlbums.value);
  } catch (error) {
    console.error("加载专辑数据失败:", error);
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
  padding: 0;
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
  gap: 16px;
}

.loading-text {
  margin-top: 0;
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
  gap: 16px;
}

.error-text {
  color: #ff4d4f;
  font-size: 16px;
  margin: 0;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.hot-album-card {
  cursor: pointer;
  transition: all 0.3s ease;
  width: 200px;
  height: 300px;
  padding: 0;
  margin: 0;
  border: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.hot-album-card:hover {
  transform: translateY(-4px);
}

.album-cover {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  margin-bottom: 12px;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  gap: 4px;
  padding: 0;
  margin: 0;
  height: 88px;
  flex-shrink: 0;
  overflow: hidden;
}

.album-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  height: 18px;
}

.album-artist {
  font-size: 12px;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  height: 16px;
}

.album-meta,
.album-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
  padding-top: 4px;
  border-top: 1px solid #f0f0f0;
  height: 22px;
  flex-shrink: 0;
}

.price {
  font-size: 15px;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 0;
}

.album-card {
  cursor: pointer;
  transition: all 0.3s ease;
  width: 200px;
  height: 300px;
  padding: 0;
  margin: 0;
  border: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-card .album-cover {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.album-card .album-info {
  height: 88px;
  flex-shrink: 0;
  overflow: hidden;
}

.album-card .album-info.has-release-date {
  height: 105px;
}

.album-release-date {
  font-size: 11px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  height: 14px;
  flex-shrink: 0;
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

.no-more {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.no-more-text {
  font-size: 14px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .hot-album-grid,
  .new-album-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .hot-album-card,
  .album-card {
    width: 180px;
    height: 270px;
  }

  .hot-album-card .album-cover,
  .album-card .album-cover {
    width: 180px;
    height: 180px;
  }

  .hot-album-card .album-info,
  .album-card .album-info {
    height: 78px;
  }

  .album-card .album-info.has-release-date {
    height: 92px;
  }

  .album-name {
    font-size: 13px;
    height: 17px;
  }

  .album-artist {
    font-size: 11px;
    height: 15px;
  }

  .album-release-date {
    font-size: 10px;
    height: 13px;
  }

  .price {
    font-size: 13px;
  }

  .sales {
    font-size: 11px;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .hot-album-grid,
  .new-album-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .hot-album-card,
  .album-card {
    width: 160px;
    height: 240px;
  }

  .hot-album-card .album-cover,
  .album-card .album-cover {
    width: 160px;
    height: 160px;
  }

  .hot-album-card .album-info,
  .album-card .album-info {
    height: 68px;
  }

  .album-card .album-info.has-release-date {
    height: 80px;
  }

  .album-name {
    font-size: 12px;
    height: 16px;
  }

  .album-artist {
    font-size: 11px;
    height: 14px;
  }

  .album-release-date {
    font-size: 10px;
    height: 12px;
  }

  .price {
    font-size: 12px;
  }

  .sales {
    font-size: 10px;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .hot-album-grid,
  .new-album-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .hot-album-card,
  .album-card {
    width: 140px;
    height: 210px;
  }

  .hot-album-card .album-cover,
  .album-card .album-cover {
    width: 140px;
    height: 140px;
  }

  .hot-album-card .album-info,
  .album-card .album-info {
    height: 58px;
  }

  .album-card .album-info.has-release-date {
    height: 68px;
  }

  .album-name {
    font-size: 11px;
    height: 15px;
  }

  .album-artist {
    font-size: 10px;
    height: 13px;
  }

  .album-release-date {
    font-size: 9px;
    height: 11px;
  }

  .price {
    font-size: 11px;
  }

  .sales {
    font-size: 9px;
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
