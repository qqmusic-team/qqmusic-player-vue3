<template>
  <div class="category-page">
    <h2 class="page-title">分类歌单</h2>

    <!-- 分类筛选区域 -->
    <section class="category-filters">
      <h3 class="section-title">分类</h3>
      <div class="filter-tabs">
        <div
          v-for="(category, index) in categories"
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
          <span class="playlist-count">({{ playlists.length }}个)</span>
        </h3>
        <div class="sort-options">
          <div
            v-for="(option, index) in sortOptions"
            :key="index"
            :class="['sort-option', { active: activeSort === option.value }]"
            @click="changeSort(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>

      <div class="playlist-grid">
        <div
          v-for="(playlist, index) in playlists"
          :key="index"
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <div class="playlist-cover">
            <img :src="playlist.cover" alt="{{ playlist.name }}" class="cover-img" />
            <div class="playlist-count">{{ playlist.songCount }}首</div>
          </div>
          <div class="playlist-info">
            <h4 class="playlist-name">{{ playlist.name }}</h4>
            <p class="playlist-desc">{{ playlist.desc }}</p>
            <div class="playlist-creator">
              <span class="creator-name">{{ playlist.creator }}</span>
              <span class="play-count">{{ playlist.playCount }}次播放</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div class="load-more">
        <button class="load-more-btn" @click="loadMore" :disabled="isLoading">
          {{ isLoading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 分类列表
const categories = [
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
];

// 排序选项
const sortOptions = [
  { label: "推荐", value: "recommend" },
  { label: "最新", value: "latest" },
  { label: "最热", value: "hottest" },
];

// 当前激活的分类和排序
const activeCategory = ref("全部");
const activeSort = ref("recommend");
const isLoading = ref(false);

// 歌单列表数据
const playlists = ref([
  {
    id: 1,
    name: "华语流行音乐精选",
    cover: "https://picsum.photos/300/300?random=51",
    songCount: 50,
    desc: "精选华语流行音乐，涵盖多种风格",
    creator: "音乐精选官",
    playCount: "125.8万",
  },
  {
    id: 2,
    name: "欧美经典摇滚",
    cover: "https://picsum.photos/300/300?random=52",
    songCount: 30,
    desc: "经典欧美摇滚乐队作品合集",
    creator: "摇滚爱好者",
    playCount: "89.6万",
  },
  {
    id: 3,
    name: "日韩流行金曲",
    cover: "https://picsum.photos/300/300?random=53",
    songCount: 45,
    desc: "最新日韩流行音乐精选",
    creator: "日韩音乐迷",
    playCount: "102.3万",
  },
  {
    id: 4,
    name: "粤语怀旧金曲",
    cover: "https://picsum.photos/300/300?random=54",
    songCount: 60,
    desc: "经典粤语老歌，回味逝去的时光",
    creator: "怀旧音乐馆",
    playCount: "95.7万",
  },
  {
    id: 5,
    name: "古典音乐精选",
    cover: "https://picsum.photos/300/300?random=55",
    songCount: 35,
    desc: "世界经典古典音乐作品合集",
    creator: "古典音乐鉴赏",
    playCount: "78.4万",
  },
  {
    id: 6,
    name: "电子音乐派对",
    cover: "https://picsum.photos/300/300?random=56",
    songCount: 40,
    desc: "嗨翻全场的电子音乐合集",
    creator: "电子音乐控",
    playCount: "112.5万",
  },
]);

// 切换分类
const changeCategory = (category) => {
  activeCategory.value = category;
  // 这里可以添加根据分类加载数据的逻辑
  console.log("切换到分类:", category);
};

// 切换排序
const changeSort = (sortValue) => {
  activeSort.value = sortValue;
  // 这里可以添加根据排序方式重新排序数据的逻辑
  console.log("切换到排序:", sortValue);
};

// 加载更多
const loadMore = () => {
  isLoading.value = true;

  // 模拟加载更多数据
  setTimeout(() => {
    // 添加一些新的模拟歌单数据
    const newPlaylists = [
      {
        id: playlists.value.length + 1,
        name: `新${activeCategory.value}歌单${playlists.value.length + 1}`,
        cover: `https://picsum.photos/300/300?random=${60 + playlists.value.length}`,
        songCount: Math.floor(Math.random() * 50) + 20,
        desc: `新添加的${activeCategory.value}歌单描述`,
        creator: "音乐精选官",
        playCount: `${Math.floor(Math.random() * 100) + 50}万`,
      },
      {
        id: playlists.value.length + 2,
        name: `新${activeCategory.value}歌单${playlists.value.length + 2}`,
        cover: `https://picsum.photos/300/300?random=${61 + playlists.value.length}`,
        songCount: Math.floor(Math.random() * 50) + 20,
        desc: `新添加的${activeCategory.value}歌单描述`,
        creator: "音乐精选官",
        playCount: `${Math.floor(Math.random() * 100) + 50}万`,
      },
    ];

    playlists.value = [...playlists.value, ...newPlaylists];
    isLoading.value = false;
  }, 1500);
};

// 跳转到歌单详情页
const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`);
};
</script>

<style scoped>
.category-page {
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

/* 分类筛选样式 */
.category-filters {
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

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
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

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.playlist-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
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
  .playlist-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
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