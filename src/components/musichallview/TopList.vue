<template>
  <div class="toplist-page">
    <h2 class="page-title">音乐排行榜</h2>

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
      <!-- 官方榜区域 -->
      <section v-if="officialCharts.length > 0" class="official-charts">
        <h3 class="section-title">官方榜</h3>
        <div class="official-grid">
          <div
            v-for="chart in officialCharts"
            :key="chart.id"
            class="chart-card"
            @click="goToPlaylist(chart.id)"
          >
            <div class="chart-cover">
              <img :src="chart.coverImgUrl" :alt="chart.name" class="cover-img" />
              <div class="play-count">{{ formatPlayCount(chart.playCount) }}</div>
            </div>
            <div class="chart-info">
              <h4 class="chart-name">{{ chart.name }}</h4>
              <p class="update-freq">{{ chart.updateFrequency }}</p>
              <ul class="song-list">
                <li
                  v-for="(track, songIndex) in chart.tracks.slice(0, 3)"
                  :key="songIndex"
                  class="song-item"
                >
                  <span class="song-rank" :class="{ 'top-three': songIndex < 3 }">{{
                    songIndex + 1
                  }}</span>
                  <span class="song-title">{{ track.first }}</span>
                  <span class="song-artist">{{ track.second }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 全球榜区域 -->
      <section v-if="globalCharts.length > 0" class="featured-charts">
        <h3 class="section-title">全球榜</h3>
        <div class="featured-grid">
          <div
            v-for="chart in globalCharts"
            :key="chart.id"
            class="featured-chart-card"
            @click="goToPlaylist(chart.id)"
          >
            <div class="chart-cover-small">
              <img :src="chart.coverImgUrl" :alt="chart.name" class="cover-img" />
              <div class="play-count-small">{{ formatPlayCount(chart.playCount) }}</div>
            </div>
            <div class="chart-info-small">
              <h4 class="chart-name">{{ chart.name }}</h4>
              <p class="update-freq">{{ chart.updateFrequency }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 特色榜区域 -->
      <section v-if="featuredCharts.length > 0" class="featured-charts">
        <h3 class="section-title">特色榜</h3>
        <div class="featured-grid">
          <div
            v-for="chart in featuredCharts"
            :key="chart.id"
            class="featured-chart-card"
            @click="goToPlaylist(chart.id)"
          >
            <div class="chart-cover-small">
              <img :src="chart.coverImgUrl" :alt="chart.name" class="cover-img" />
              <div class="play-count-small">{{ formatPlayCount(chart.playCount) }}</div>
            </div>
            <div class="chart-info-small">
              <h4 class="chart-name">{{ chart.name }}</h4>
              <p class="update-freq">{{ chart.updateFrequency }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMusicHallStore } from "@/stores/musicHall";

const router = useRouter();
const musicHallStore = useMusicHallStore();

const isLoading = ref(false);
const error = ref(null);
const topListDetail = ref([]);

const hasError = computed(() => {
  return error.value !== null;
});

const loadData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await musicHallStore.initTopListPage();
    topListDetail.value = musicHallStore.topListDetail;
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

const officialCharts = computed(() => {
  return topListDetail.value.filter((chart) =>
    ["飙升榜", "热歌榜", "新歌榜", "原创榜"].includes(chart.name)
  );
});

const globalCharts = computed(() => {
  return topListDetail.value
    .filter(
      (chart) =>
        chart.name.includes("榜") &&
        !["飙升榜", "热歌榜", "新歌榜", "原创榜"].includes(chart.name) &&
        ![
          "云音乐新歌榜",
          "网易音乐奖",
          "云音乐电音榜",
          "UK排行榜",
          "美国Billboard榜",
          "Beatport全球电子舞曲榜",
          "Oricon公信榜",
          "Melon榜单",
          "Gaon榜",
          "FM韩国音乐榜",
        ].includes(chart.name)
    )
    .slice(0, 8);
});

const featuredCharts = computed(() => {
  return topListDetail.value.filter((chart) =>
    [
      "云音乐新歌榜",
      "网易音乐奖",
      "云音乐电音榜",
      "UK排行榜",
      "美国Billboard榜",
      "Beatport全球电子舞曲榜",
      "Oricon公信榜",
      "Melon榜单",
      "Gaon榜",
      "FM韩国音乐榜",
    ].includes(chart.name)
  );
});

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.toplist-page {
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

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #c20c0c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #c20c0c;
}

.error-container p {
  margin-bottom: 16px;
}

.retry-btn {
  padding: 10px 24px;
  background: #c20c0c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #a00a0a;
}

/* 官方榜样式 */
.official-charts {
  margin-bottom: 40px;
}

.official-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-2);
  gap: var(--grid-gap-md);
}

.chart-card {
  display: flex;
  gap: 16px;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-card:hover {
  background: #f0f0f0;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.chart-cover {
  position: relative;
  width: var(--image-size-md);
  height: var(--image-size-md);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.cover-img {
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.chart-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
}

.update-freq {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.song-rank {
  width: 20px;
  font-size: 12px;
  color: #999;
  margin-right: 12px;
}

.song-rank.top-three {
  color: #c20c0c;
  font-weight: bold;
}

.song-title {
  flex: 1;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 12px;
}

.song-artist {
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

/* 特色榜样式 */
.featured-charts {
  margin-bottom: 40px;
}

.featured-grid {
  display: grid;
  grid-template-columns: var(--grid-columns-4);
  gap: var(--grid-gap-md);
}

.featured-chart-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.featured-chart-card:hover {
  transform: translateY(-4px);
}

.chart-cover-small {
  position: relative;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  aspect-ratio: var(--aspect-ratio-square);
}

.play-count-small {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.chart-info-small {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-name {
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .featured-grid {
    grid-template-columns: var(--grid-columns-3);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .official-grid {
    grid-template-columns: 1fr;
  }

  .featured-grid {
    grid-template-columns: var(--grid-columns-2);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .chart-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .chart-cover {
    width: 100%;
    max-width: var(--image-size-xl);
    height: auto;
  }

  .song-list {
    width: 100%;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }
}
</style>
