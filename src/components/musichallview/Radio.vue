<template>
  <div class="radio-page">
    <h2 class="page-title">有声电台</h2>

    <!-- 加载状态 -->
    <div v-if="djStore.isLoading && djStore.djCategories.length === 0" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>

    <!-- 错误状态 -->
    <div v-if="djStore.hasError && djStore.djCategories.length === 0" class="error-container">
      <el-icon :size="40" color="#ff4d4f"><CircleClose /></el-icon>
      <p class="error-text">{{ djStore.error }}</p>
      <el-button type="primary" @click="retryLoad">重试</el-button>
    </div>

    <template v-if="!djStore.isLoading || djStore.djCategories.length > 0">
      <!-- 电台分类筛选区域 -->
      <section class="radio-filters">
        <h3 class="section-title">电台分类</h3>
        <div class="filter-tabs">
          <div
            :class="['filter-tab', { active: activeCategory === null }]"
            @click="changeCategory(null)"
          >
            全部
          </div>
          <div
            v-for="category in djStore.djCategories"
            :key="category.id"
            :class="['filter-tab', { active: activeCategory === category.id }]"
            @click="changeCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
      </section>

      <!-- 热门电台区域 -->
      <section class="hot-radio-section">
        <div class="section-header">
          <h3 class="section-title">热门电台</h3>
          <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
        </div>

        <div
          v-if="djStore.isLoading && djStore.hotRadios.length === 0"
          class="loading-container small"
        >
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        </div>

        <div v-else-if="djStore.hotRadios.length > 0" class="hot-radio-grid">
          <div
            v-for="radio in djStore.hotRadios"
            :key="radio.id"
            class="hot-radio-card"
            @click="playRadio(radio.id)"
          >
            <div class="radio-cover">
              <img :src="radio.picUrl || radio.pic84x84" :alt="radio.name" class="cover-img" />
              <div class="play-btn">▶</div>
            </div>
            <div class="radio-info">
              <h4 class="radio-name">{{ radio.name }}</h4>
              <p class="radio-host">{{ radio.dj?.name || "未知主播" }}</p>
              <p class="radio-play-count">{{ formatPlayCount(radio.subCount) }}订阅</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 电台节目列表区域 -->
      <section class="radio-programs-section">
        <div class="section-header">
          <h3 class="section-title">
            电台节目
            <span class="program-count">({{ djStore.radioPrograms.length }}个)</span>
          </h3>
        </div>

        <div
          v-if="djStore.isLoading && djStore.radioPrograms.length === 0"
          class="loading-container small"
        >
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        </div>

        <div v-else-if="djStore.radioPrograms.length > 0" class="program-list">
          <div
            v-for="program in djStore.radioPrograms"
            :key="program.id"
            class="program-item"
            @click="playProgram(program.id)"
          >
            <div class="program-cover">
              <img :src="program.coverUrl" :alt="program.name" class="cover-img" />
            </div>
            <div class="program-info">
              <h4 class="program-title">{{ program.name }}</h4>
              <p class="program-desc">{{ program.description || program.copywriter }}</p>
              <div class="program-meta">
                <span class="program-radio">{{ program.radio?.name || "未知电台" }}</span>
                <span class="program-date">{{ formatDate(program.createTime) }}</span>
                <span class="program-duration">{{ formatDuration(program.duration) }}</span>
              </div>
            </div>
            <div class="program-play-btn" @click.stop="playProgram(program.id)">▶</div>
          </div>
        </div>

        <div
          v-else-if="!djStore.isLoading && djStore.radioPrograms.length === 0"
          class="empty-state"
        >
          <p class="empty-text">暂无电台节目</p>
        </div>

        <div v-if="isLoadingMore" class="scroll-loading-indicator">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          <p class="loading-text">加载中...</p>
        </div>

        <div v-else-if="!hasMore && djStore.radioPrograms.length > 0" class="no-more">
          <p class="no-more-text">没有更多了</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useDJStore } from "@/stores/dj";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import { Loading, CircleClose } from "@element-plus/icons-vue";

defineOptions({
  name: "RadioView",
});

const djStore = useDJStore();
const router = useRouter();

const activeCategory = ref(null);
const isLoadingMore = ref(false);

const hasMore = computed(() => djStore.hasMorePrograms);
const isLoading = computed(() => djStore.isLoading);

const handleLoadMore = async () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return;

  try {
    isLoadingMore.value = true;
    const offset = djStore.radioPrograms.length;
    if (djStore.currentRadioId) {
      await djStore.getDjPrograms(djStore.currentRadioId, 30, offset);
    } else {
      await djStore.getDjProgramToplist(30, offset);
    }
  } catch (error) {
    console.error("加载更多节目失败:", error);
  } finally {
    isLoadingMore.value = false;
  }
};

const { attachScrollListener, detachScrollListener, resetScroll } = useInfiniteScroll({
  threshold: 200,
  debounceTime: 300,
  onLoadMore: handleLoadMore,
  hasMore: hasMore,
  isLoading: computed(() => isLoadingMore.value),
});

const formatPlayCount = (count) => {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + "亿";
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + "万";
  }
  return count.toString();
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 1000 / 60);
  const remainingSeconds = Math.floor((seconds / 1000) % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const changeCategory = async (categoryId) => {
  activeCategory.value = categoryId;
  djStore.setCurrentCategory(categoryId);
  resetScroll();

  if (categoryId === null) {
    await djStore.getDjHot();
  } else {
    await djStore.getDjHot(categoryId);
  }

  const hotRadios = djStore.hotRadios;
  if (hotRadios.length > 0) {
    await djStore.getDjPrograms(hotRadios[0].id);
  }
};

const playRadio = (id) => {
  router.push({ name: "radioDetail", params: { id } });
};

const playProgram = (id) => {
  console.log("播放节目:", id);
};

const retryLoad = async () => {
  djStore.clearError();
  await djStore.initRadioPage();
};

onMounted(async () => {
  await djStore.initRadioPage();
  attachScrollListener();
});

onUnmounted(() => {
  detachScrollListener();
});
</script>

<style scoped>
.radio-page {
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

/* 加载状态样式 */
.loading-container {
  
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 200px;
  gap: 16px;
}

.loading-container.small {
  min-height: 100px;
  padding: 30px 20px;
}

.loading-text {
  margin-top: 0;
  color: #999;
  font-size: 14px;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 200px;
  gap: 16px;
}

.error-text {
  color: #ff4d4f;
  font-size: 16px;
  margin: 0;
}

/* 分类筛选样式 */
.radio-filters {
  margin-bottom: 30px;
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

/* 热门电台样式 */
.hot-radio-section {
  margin-bottom: 0;
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

.hot-radio-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-6);
  gap: var(--grid-gap-md);
}

.hot-radio-card {
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hot-radio-card:hover {
  transform: translateY(-4px);
}

.radio-cover {
  position: relative;
  border-radius: var(--border-radius-full);
  overflow: hidden;
  margin-bottom: 12px;
  width: var(--image-size-md);
  height: var(--image-size-md);
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

.radio-cover:hover .play-btn {
  opacity: 1;
  background: rgba(24, 144, 255, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.radio-info {
  text-align: center;
  width: 100%;
}

.radio-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.radio-host {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.radio-play-count {
  font-size: 12px;
  color: #999;
}

/* 电台节目列表样式 */
.radio-programs-section {
  margin-bottom: 0;
}

.program-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
  margin-left: 8px;
}

.program-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.program-item {
  display: flex;
  gap: 16px;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
}

.program-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.program-item .program-cover {
  width: var(--image-size-sm);
  height: var(--image-size-sm);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.program-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.program-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.program-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.program-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.program-play-btn {
  width: 40px;
  height: 40px;
  background: #1890ff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.program-play-btn:hover {
  background: #40a9ff;
  transform: scale(1.1);
}

/* 滚动加载状态样式 */
.scroll-loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  margin-top: 30px;
  gap: 12px;
}

.scroll-loading-indicator .loading-text {
  margin-top: 0;
  color: #999;
  font-size: 14px;
}

.no-more {
  display: flex;
  justify-content: center;
  padding: 30px 20px;
  margin-top: 30px;
}

.no-more-text {
  color: #999;
  font-size: 14px;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  margin-top: 30px;
}

.empty-text {
  color: #999;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .hot-radio-grid {
    grid-template-columns: var(--grid-columns-5);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .hot-radio-grid {
    grid-template-columns: var(--grid-columns-4);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .hot-radio-grid {
    grid-template-columns: var(--grid-columns-2);
  }

  .program-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .program-item .program-cover {
    width: 100%;
    max-width: var(--image-size-lg);
  }

  .program-meta {
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .hot-radio-grid {
    grid-template-columns: 1fr;
  }

  .radio-cover {
    width: 100%;
    max-width: var(--image-size-xl);
  }
}
</style>
