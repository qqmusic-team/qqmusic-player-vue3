<template>
  <div class="digital-album-page">
    <h2 class="page-title">数字专辑</h2>

    <!-- 专辑分类筛选区域 -->
    <section class="album-filters">
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

    <!-- 热门专辑区域 -->
    <section class="hot-album-section">
      <div class="section-header">
        <h3 class="section-title">热门数字专辑</h3>
        <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
      </div>

      <div class="hot-album-grid">
        <div
          v-for="(album, index) in hotAlbums"
          :key="index"
          class="hot-album-card"
          @click="viewAlbumDetail(album.id)"
        >
          <div class="album-cover">
            <img :src="album.cover" alt="{{ album.name }}" class="cover-img" />
            <div class="album-badge" v-if="album.badge">{{ album.badge }}</div>
          </div>
          <div class="album-info">
            <h4 class="album-name">{{ album.name }}</h4>
            <p class="album-artist">{{ album.artist }}</p>
            <div class="album-price">
              <span class="price">{{ album.price }}</span>
              <span class="sales">{{ album.sales }}张</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新专辑上市区域 -->
    <section class="new-album-section">
      <div class="section-header">
        <h3 class="section-title">
          {{ activeCategory }}新专辑
          <span class="album-count">({{ newAlbums.length }}张)</span>
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

      <div class="new-album-grid">
        <div
          v-for="(album, index) in newAlbums"
          :key="index"
          class="album-card"
          @click="viewAlbumDetail(album.id)"
        >
          <div class="album-cover">
            <img :src="album.cover" alt="{{ album.name }}" class="cover-img" />
            <div class="album-badge" v-if="album.badge">{{ album.badge }}</div>
          </div>
          <div class="album-info">
            <h4 class="album-name">{{ album.name }}</h4>
            <p class="album-artist">{{ album.artist }}</p>
            <p class="album-release-date">{{ album.releaseDate }}</p>
            <div class="album-price">
              <span class="price">{{ album.price }}</span>
              <span class="sales">{{ album.sales }}张</span>
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

// 专辑分类列表
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
];

// 排序选项
const sortOptions = [
  { label: "最新", value: "latest" },
  { label: "最热", value: "hottest" },
  { label: "价格最低", value: "price_asc" },
  { label: "价格最高", value: "price_desc" },
];

// 当前激活的分类和排序
const activeCategory = ref("全部");
const activeSort = ref("latest");
const isLoading = ref(false);

// 热门专辑数据
const hotAlbums = ref([
  {
    id: 1,
    name: "数字专辑名称1",
    artist: "歌手A",
    cover: "https://picsum.photos/200/200?random=101",
    price: "¥19.9",
    sales: "12.5万",
    badge: "热销",
  },
  {
    id: 2,
    name: "数字专辑名称2",
    artist: "歌手B",
    cover: "https://picsum.photos/200/200?random=102",
    price: "¥29.9",
    sales: "8.9万",
    badge: "新品",
  },
  {
    id: 3,
    name: "数字专辑名称3",
    artist: "歌手C",
    cover: "https://picsum.photos/200/200?random=103",
    price: "¥15.9",
    sales: "6.7万",
    badge: "畅销",
  },
  {
    id: 4,
    name: "数字专辑名称4",
    artist: "歌手D",
    cover: "https://picsum.photos/200/200?random=104",
    price: "¥25.9",
    sales: "5.3万",
    badge: "精选",
  },
]);

// 新专辑数据
const newAlbums = ref([
  {
    id: 5,
    name: "新专辑名称1",
    artist: "歌手E",
    cover: "https://picsum.photos/300/300?random=111",
    price: "¥19.9",
    sales: "3.2万",
    releaseDate: "2025-01-01",
    badge: "首发",
  },
  {
    id: 6,
    name: "新专辑名称2",
    artist: "歌手F",
    cover: "https://picsum.photos/300/300?random=112",
    price: "¥29.9",
    sales: "2.8万",
    releaseDate: "2025-01-02",
    badge: "独家",
  },
  {
    id: 7,
    name: "新专辑名称3",
    artist: "歌手G",
    cover: "https://picsum.photos/300/300?random=113",
    price: "¥15.9",
    sales: "1.9万",
    releaseDate: "2025-01-03",
  },
  {
    id: 8,
    name: "新专辑名称4",
    artist: "歌手H",
    cover: "https://picsum.photos/300/300?random=114",
    price: "¥25.9",
    sales: "1.5万",
    releaseDate: "2025-01-04",
    badge: "限量",
  },
  {
    id: 9,
    name: "新专辑名称5",
    artist: "歌手I",
    cover: "https://picsum.photos/300/300?random=115",
    price: "¥12.9",
    sales: "1.2万",
    releaseDate: "2025-01-05",
  },
  {
    id: 10,
    name: "新专辑名称6",
    artist: "歌手J",
    cover: "https://picsum.photos/300/300?random=116",
    price: "¥18.9",
    sales: "9,800",
    releaseDate: "2025-01-06",
    badge: "纪念",
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

// 查看专辑详情
const viewAlbumDetail = (id) => {
  console.log("查看专辑详情:", id);
};

// 加载更多
const loadMore = () => {
  isLoading.value = true;

  // 模拟加载更多数据
  setTimeout(() => {
    // 添加一些新的模拟专辑数据
    const newAlbumsData = [
      {
        id: newAlbums.value.length + 5,
        name: `${activeCategory.value}新专辑${newAlbums.value.length + 1}`,
        artist: `${activeCategory.value}歌手${newAlbums.value.length + 1}`,
        cover: `https://picsum.photos/300/300?random=${120 + newAlbums.value.length}`,
        price: `¥${Math.floor(Math.random() * 20) + 10}.9`,
        sales: `${Math.floor(Math.random() * 10000) + 5000}`,
        releaseDate: "2025-01-07",
        badge: Math.random() > 0.5 ? "新品" : "",
      },
      {
        id: newAlbums.value.length + 6,
        name: `${activeCategory.value}新专辑${newAlbums.value.length + 2}`,
        artist: `${activeCategory.value}歌手${newAlbums.value.length + 2}`,
        cover: `https://picsum.photos/300/300?random=${121 + newAlbums.value.length}`,
        price: `¥${Math.floor(Math.random() * 20) + 10}.9`,
        sales: `${Math.floor(Math.random() * 10000) + 5000}`,
        releaseDate: "2025-01-08",
        badge: Math.random() > 0.5 ? "独家" : "",
      },
    ];

    newAlbums.value = [...newAlbums.value, ...newAlbumsData];
    isLoading.value = false;
  }, 1500);
};
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