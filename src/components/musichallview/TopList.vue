<template>
  <div class="toplist-page">
    <h2 class="page-title">音乐排行榜</h2>

    <!-- 官方榜区域 -->
    <section class="official-charts">
      <h3 class="section-title">官方榜</h3>
      <div class="official-grid">
        <div v-for="(chart, index) in officialCharts" :key="index" class="chart-card" @click="goToPlaylist(chart.id)">
          <div class="chart-cover">
            <img :src="chart.cover" alt="{{ chart.name }}" class="cover-img" />
            <div class="play-count">{{ chart.playCount }}</div>
          </div>
          <div class="chart-info">
            <h4 class="chart-name">{{ chart.name }}</h4>
            <ul class="song-list">
              <li v-for="(song, songIndex) in chart.songs" :key="songIndex" class="song-item">
                <span class="song-rank">{{ songIndex + 1 }}</span>
                <span class="song-title">{{ song.title }}</span>
                <span class="song-artist">{{ song.artist }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色榜区域 -->
    <section class="featured-charts">
      <h3 class="section-title">特色榜</h3>
      <div class="featured-grid">
        <div v-for="(chart, index) in featuredCharts" :key="index" class="featured-chart-card" @click="goToPlaylist(chart.id)">
          <div class="chart-cover-small">
            <img :src="chart.cover" alt="{{ chart.name }}" class="cover-img" />
          </div>
          <div class="chart-info-small">
            <h4 class="chart-name">{{ chart.name }}</h4>
            <p class="chart-desc">{{ chart.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 官方榜数据
const officialCharts = [
  {
    id: 1,
    name: "飙升榜",
    cover: "https://picsum.photos/200/200?random=31",
    playCount: "1.2亿次播放",
    songs: [
      { title: "歌曲标题1", artist: "歌手1" },
      { title: "歌曲标题2", artist: "歌手2" },
      { title: "歌曲标题3", artist: "歌手3" }
    ]
  },
  {
    id: 2,
    name: "新歌榜",
    cover: "https://picsum.photos/200/200?random=32",
    playCount: "8500万次播放",
    songs: [
      { title: "新歌标题1", artist: "歌手A" },
      { title: "新歌标题2", artist: "歌手B" },
      { title: "新歌标题3", artist: "歌手C" }
    ]
  },
  {
    id: 3,
    name: "热歌榜",
    cover: "https://picsum.photos/200/200?random=33",
    playCount: "2.5亿次播放",
    songs: [
      { title: "热歌标题1", artist: "流行歌手1" },
      { title: "热歌标题2", artist: "流行歌手2" },
      { title: "热歌标题3", artist: "流行歌手3" }
    ]
  },
  {
    id: 4,
    name: "原创榜",
    cover: "https://picsum.photos/200/200?random=34",
    playCount: "6800万次播放",
    songs: [
      { title: "原创歌曲1", artist: "独立音乐人1" },
      { title: "原创歌曲2", artist: "独立音乐人2" },
      { title: "原创歌曲3", artist: "独立音乐人3" }
    ]
  }
];

// 特色榜数据
const featuredCharts = [
  { id: 5, name: "华语金曲榜", cover: "https://picsum.photos/150/150?random=41", desc: "华语流行音乐精选" },
  { id: 6, name: "欧美热歌榜", cover: "https://picsum.photos/150/150?random=42", desc: "欧美流行音乐精选" },
  { id: 7, name: "抖音热歌榜", cover: "https://picsum.photos/150/150?random=43", desc: "抖音热门音乐" },
  { id: 8, name: "影视金曲榜", cover: "https://picsum.photos/150/150?random=44", desc: "热门影视歌曲" },
  { id: 9, name: "古典音乐榜", cover: "https://picsum.photos/150/150?random=45", desc: "经典古典音乐" },
  { id: 10, name: "电音热歌榜", cover: "https://picsum.photos/150/150?random=46", desc: "热门电子音乐" },
  { id: 11, name: "民谣热歌榜", cover: "https://picsum.photos/150/150?random=47", desc: "热门民谣音乐" },
  { id: 12, name: "说唱热歌榜", cover: "https://picsum.photos/150/150?random=48", desc: "热门说唱音乐" }
];

// 跳转到歌单详情页
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`);
};
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

/* 官方榜样式 */
.official-charts {
  margin-bottom: 40px;
}

.official-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
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
  width: 120px;
  height: 120px;
  border-radius: 6px;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
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
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
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
@media (max-width: 1200px) {
  .featured-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .official-grid {
    grid-template-columns: 1fr;
  }

  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chart-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .chart-cover {
    width: 100%;
    max-width: 200px;
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