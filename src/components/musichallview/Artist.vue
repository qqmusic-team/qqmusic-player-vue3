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
        <div v-if="artists.length === 0" class="empty-container">
          <p class="empty-text">暂无歌手数据</p>
        </div>

        <div v-else class="artist-grid">
          <div
            v-for="artist in artists"
            :key="artist.id"
            class="artist-card"
            @click="goToArtistDetail(artist.id)"
          >
            <div class="artist-avatar-container">
              <img
                :src="artist.picUrl || artist.img1v1Url"
                :alt="artist.name"
                class="artist-avatar"
                loading="lazy"
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

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" @click="loadMoreArtists" :disabled="isLoadingMore">
            {{ isLoadingMore ? "加载中..." : "加载更多" }}
          </button>
        </div>

        <div v-else-if="artists.length > 0" class="no-more">
          <p class="no-more-text">没有更多了</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/category";

const router = useRouter();
const categoryStore = useCategoryStore();

const isLoadingMore = ref(false);

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

const artists = computed(() => categoryStore.artists);
const hasMore = computed(() => categoryStore.hasMore);
const isLoading = computed(() => categoryStore.isLoading);

const selectType = async (type) => {
  if (selectedType.value === type) return;

  selectedType.value = type;
  await loadArtists();
};

const selectRegion = async (region) => {
  if (selectedRegion.value === region) return;

  selectedRegion.value = region;
  await loadArtists();
};

const selectLetter = async (letter) => {
  if (selectedLetter.value === letter) return;

  selectedLetter.value = letter;
  await loadArtists();
};

const loadArtists = async (append = false) => {
  if (append && isLoadingMore.value) return;

  if (append) {
    isLoadingMore.value = true;
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
  } finally {
    isLoadingMore.value = false;
  }
};

const loadMoreArtists = async () => {
  await categoryStore.loadMoreArtists();
};

const goToArtistDetail = (id) => {
  if (id) {
    console.log("跳转到歌手详情页", id);
  }
};

const handleRetry = () => {
  categoryStore.clearError();
  loadArtists();
};

onMounted(async () => {
  await loadArtists();
});
</script>

<style scoped>
.artist-page {
  padding: 20px 0;
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
  padding: 16px;
  margin-bottom: 24px;
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

/* 歌手列表 */
.artist-list-section {
  margin-bottom: 40px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.artist-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.artist-card:hover {
  transform: translateY(-4px);
}

.artist-avatar-container {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.artist-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.artist-card:hover .artist-avatar {
  transform: scale(1.05);
}

.artist-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.artist-name {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.artist-desc {
  font-size: 12px;
  color: #999;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 加载更多按钮 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 10px 24px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.load-more-btn:hover {
  background: #f0f0f0;
  border-color: #1890ff;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .artist-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 992px) {
  .artist-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .filter-container {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .artist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .filter-container {
    flex-direction: column;
    gap: 16px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .filter-options {
    width: 100%;
    justify-content: flex-start;
  }

  .alphabet-filter {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
