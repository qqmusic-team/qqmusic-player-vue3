<template>
  <div class="category-page">
    <h2 class="page-title">分类歌单</h2>
    <div class="category-filters"></div>
    <!-- 加载状态 -->
    <div v-if="categoryStore.isLoading && playlists.length === 0" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="categoryStore.hasError" class="error-container">
      <el-icon :size="40" color="#ff4d4f"><CircleClose /></el-icon>
      <p class="error-text">{{ categoryStore.error }}</p>
      <el-button type="primary" @click="handleRetry">重试</el-button>
    </div>

    <template v-else>
      <!-- 分类筛选区域 -->
      <section class="category-filters">
        <h3 class="section-title">分类</h3>
        <div class="filter-tabs">
          <div
            v-for="(category, index) in displayCategories"
            :key="index"
            :class="['filter-tab', { active: activeCategory === category }]"
            @click="changeCategory(category)"
          >
            {{ category }}
          </div>
        </div>
      </section>

      <!-- 歌单列表区域 -->
      <section class="playlist-section">
        <div class="section-header">
          <h3 class="section-title">
            {{ activeCategory }}歌单
            <span class="sort-status" v-if="activeSort !== 'recommend'">
              ({{ sortOptions.find((opt) => opt.value === activeSort)?.label }})
            </span>
          </h3>
          <div class="sort-options">
            <div
              v-for="(option, index) in sortOptions"
              :key="index"
              :class="[
                'sort-option',
                {
                  active: activeSort === option.value,
                  loading: isSorting && activeSort === option.value,
                },
              ]"
              @click="changeSort(option.value)"
            >
              <span v-if="isSorting && activeSort === option.value" class="sort-loading-icon">
                <el-icon class="is-loading"><Loading /></el-icon>
              </span>
              <span>{{ option.label }}</span>
            </div>
          </div>
        </div>

        <div v-if="playlists.length === 0" class="empty-container">
          <p class="empty-text">暂无歌单数据</p>
        </div>

        <div v-else class="playlist-grid">
          <div
            v-for="(playlist, index) in playlists"
            :key="playlist.id || index"
            class="playlist-card"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="playlist-cover">
              <img
                :src="playlist.coverImgUrl || playlist.picUrl"
                :alt="playlist.name"
                class="cover-img"
                loading="lazy"
              />
              <div class="playlist-count">
                {{ playlist.trackCount || playlist.trackIds?.length || 0 }}首
              </div>
              <div class="play-count-overlay">
                <span class="play-icon">▶</span>
                <span>{{ formatPlayCount(playlist.playCount) }}</span>
              </div>
            </div>
            <div class="playlist-info">
              <h4 class="playlist-name" :title="playlist.name">{{ playlist.name }}</h4>
              <p class="playlist-desc" :title="playlist.description">
                {{ playlist.description || "" }}
              </p>
              <div class="playlist-creator">
                <span class="creator-name">{{ playlist.creator?.nickname || "未知" }}</span>
                <span class="play-count">{{ formatPlayCount(playlist.playCount) }}次播放</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoadingMore" class="scroll-loading-indicator">
          <div v-loading="true" element-loading-text="加载中..."></div>
        </div>

        <div v-else-if="loadError" class="load-error-container">
          <p class="error-text">加载失败，请重试</p>
          <el-button type="primary" @click="handleLoadMoreRetry">重试</el-button>
        </div>

        <div v-else-if="!hasMore && playlists.length > 0" class="no-more">
          <p class="no-more-text">没有更多了</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useCategoryStore } from "@/stores/category";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import { Loading, CircleClose } from "@element-plus/icons-vue";

defineOptions({
  name: "CategoryView",
});

const router = useRouter();
const categoryStore = useCategoryStore();

const scrollContainerRef = inject("scrollContainer", ref(null));
const isLoadingMore = ref(false);
const loadError = ref(false);
const isSorting = ref(false);

const handleLoadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return;

  try {
    isLoadingMore.value = true;
    loadError.value = false;
    await categoryStore.loadMorePlaylists();
  } catch (error) {
    console.error("加载更多失败:", error);
    loadError.value = true;
  } finally {
    isLoadingMore.value = false;
  }
};

const { resetScroll } = useInfiniteScroll({
  threshold: 200,
  debounceTime: 300,
  onLoadMore: handleLoadMore,
  hasMore: computed(() => categoryStore.hasMore),
  isLoading: computed(() => isLoadingMore.value),
  scrollContainerRef: scrollContainerRef,
});

const displayCategories = ref([
  "全部",
  "华语",
  "欧美",
  "日韩",
  "粤语",
  "古典",
  "摇滚",
  "流行",
  "电子",
  "民谣",
  "说唱",
  "爵士",
  "乡村",
  "R&B",
  "轻音乐",
  "DJ舞曲",
]);

const sortOptions = [
  { label: "推荐", value: "recommend" },
  { label: "最新", value: "latest" },
  { label: "最热", value: "hottest" },
];

const activeCategory = computed(() => categoryStore.currentCategory);
const activeSort = computed(() => categoryStore.currentSort);
const playlists = computed(() => categoryStore.playlists);
const hasMore = computed(() => categoryStore.hasMore);

const changeCategory = async (category) => {
  if (activeCategory.value === category) return;

  categoryStore.currentCategory = category;
  resetScroll();
  await loadPlaylists(category);
};

const changeSort = async (sortValue) => {
  if (activeSort.value === sortValue) return;

  isSorting.value = true;
  const previousSort = categoryStore.currentSort;
  const sortLabel = sortOptions.find((opt) => opt.value === sortValue)?.label;

  try {
    categoryStore.currentSort = sortValue;
    categoryStore.clearPlaylistCache();
    resetScroll();

    await loadPlaylists(activeCategory.value);
  } catch (error) {
    console.error("排序切换失败:", error);
    ElMessage.error(`切换到${sortLabel}排序失败，请重试`);
    categoryStore.currentSort = previousSort;
  } finally {
    isSorting.value = false;
  }
};

const loadPlaylists = async (category, append = false) => {
  if (append && isLoadingMore.value) return;

  if (append) {
    isLoadingMore.value = true;
  }

  try {
    await categoryStore.getPlaylistsByCategory(
      category,
      append ? categoryStore.currentPage + 1 : 1,
      30,
      append
    );
  } catch (error) {
    console.error("加载歌单失败:", error);
  } finally {
    isLoadingMore.value = false;
  }
};

const goToPlaylist = (id) => {
  if (id) {
    router.push(`/playlist/${id}`);
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

const handleRetry = () => {
  categoryStore.clearError();
  loadPlaylists(activeCategory.value);
};

const handleLoadMoreRetry = () => {
  loadError.value = false;
  handleLoadMore();
};

onMounted(async () => {
  await categoryStore.getCategories();
  await loadPlaylists(activeCategory.value);
});
</script>

<style scoped>
.category-page {
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

/* 加载状态 让文字横向排列*/
.loading-container {
  display: flex;
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
  background: #fafafa;
  border-radius: 8px;
}

.empty-text {
  color: #999;
  font-size: 16px;
}

/* 分类筛选样式 */
.category-filters {
  margin-bottom: 0;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
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

/* 歌单列表样式 */
.playlist-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.playlist-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
  margin-left: 8px;
}

.sort-status {
  font-size: 14px;
  color: #1890ff;
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
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-option:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.sort-option.active {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
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

.sort-option.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.sort-loading-icon {
  display: flex;
  align-items: center;
}

.playlist-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-4);
  gap: var(--grid-gap-lg);
  margin-bottom: 30px;
}

.playlist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
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
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform 0.3s ease;
}

.playlist-card:hover .cover-img {
  transform: scale(1.05);
}

.playlist-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.play-count-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.play-icon {
  font-size: 10px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: var(--image-size-lg);
}

.playlist-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.playlist-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.playlist-creator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.creator-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 60%;
}

.play-count {
  font-size: 12px;
  color: #999;
}

.scroll-loading-indicator {

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
  margin-top: 30px;
}

.no-more-text {
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .playlist-grid {
    grid-template-columns: var(--grid-columns-3);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .playlist-grid {
    grid-template-columns: var(--grid-columns-2);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .playlist-grid {
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
