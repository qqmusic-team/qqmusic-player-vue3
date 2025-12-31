<template>
  <div class="radio-page">
    <h2 class="page-title">有声电台</h2>

    <!-- 电台分类筛选区域 -->
    <section class="radio-filters">
      <h3 class="section-title">电台分类</h3>
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

    <!-- 热门电台区域 -->
    <section class="hot-radio-section">
      <div class="section-header">
        <h3 class="section-title">热门电台</h3>
        <a href="#" class="more-link">更多 <i class="icon-arrow">〉</i></a>
      </div>

      <div class="hot-radio-grid">
        <div
          v-for="(radio, index) in hotRadios"
          :key="index"
          class="hot-radio-card"
          @click="playRadio(radio.id)"
        >
          <div class="radio-cover">
            <img :src="radio.cover" alt="{{ radio.name }}" class="cover-img" />
            <div class="play-btn">▶</div>
          </div>
          <div class="radio-info">
            <h4 class="radio-name">{{ radio.name }}</h4>
            <p class="radio-host">{{ radio.host }}</p>
            <p class="radio-play-count">{{ radio.playCount }}次播放</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 电台节目列表区域 -->
    <section class="radio-programs-section">
      <div class="section-header">
        <h3 class="section-title">
          {{ activeCategory }}节目
          <span class="program-count">({{ radioPrograms.length }}个)</span>
        </h3>
      </div>

      <div class="program-list">
        <div
          v-for="(program, index) in radioPrograms"
          :key="index"
          class="program-item"
          @click="playProgram(program.id)"
        >
          <div class="program-cover">
            <img :src="program.cover" alt="{{ program.title }}" class="cover-img" />
          </div>
          <div class="program-info">
            <h4 class="program-title">{{ program.title }}</h4>
            <p class="program-desc">{{ program.desc }}</p>
            <div class="program-meta">
              <span class="program-radio">{{ program.radioName }}</span>
              <span class="program-date">{{ program.date }}</span>
              <span class="program-duration">{{ program.duration }}</span>
            </div>
          </div>
          <div class="program-play-btn" @click.stop="playProgram(program.id)">
            ▶
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

// 电台分类列表
const categories = [
  "全部",
  "情感",
  "新闻",
  "音乐",
  "故事",
  "科技",
  "财经",
  "教育",
  "健康",
  "娱乐",
  "儿童",
  "戏曲",
];

// 当前激活的分类
const activeCategory = ref("全部");
const isLoading = ref(false);

// 热门电台数据
const hotRadios = ref([
  {
    id: 1,
    name: "深夜情感电台",
    host: "小夜",
    cover: "https://picsum.photos/200/200?random=71",
    playCount: "156.8万",
  },
  {
    id: 2,
    name: "音乐心情",
    host: "小明",
    cover: "https://picsum.photos/200/200?random=72",
    playCount: "123.4万",
  },
  {
    id: 3,
    name: "新闻早报",
    host: "主持人A",
    cover: "https://picsum.photos/200/200?random=73",
    playCount: "98.7万",
  },
  {
    id: 4,
    name: "科技前沿",
    host: "科技达人",
    cover: "https://picsum.photos/200/200?random=74",
    playCount: "85.2万",
  },
  {
    id: 5,
    name: "财经资讯",
    host: "财经专家",
    cover: "https://picsum.photos/200/200?random=75",
    playCount: "76.9万",
  },
  {
    id: 6,
    name: "儿童故事",
    host: "童话妈妈",
    cover: "https://picsum.photos/200/200?random=76",
    playCount: "102.3万",
  },
]);

// 电台节目数据
const radioPrograms = ref([
  {
    id: 1,
    title: "深夜情感：如何处理亲密关系",
    desc: "探讨现代人际关系中的情感问题，分享处理亲密关系的技巧",
    cover: "https://picsum.photos/400/400?random=81",
    radioName: "深夜情感电台",
    date: "2025-01-01",
    duration: "45:30",
  },
  {
    id: 2,
    title: "2025年科技趋势预测",
    desc: "解析2025年科技行业的发展趋势，展望未来科技发展方向",
    cover: "https://picsum.photos/400/400?random=82",
    radioName: "科技前沿",
    date: "2025-01-02",
    duration: "52:15",
  },
  {
    id: 3,
    title: "经典音乐回顾：80年代流行金曲",
    desc: "重温80年代经典流行音乐，回忆美好时光",
    cover: "https://picsum.photos/400/400?random=83",
    radioName: "音乐心情",
    date: "2025-01-03",
    duration: "38:45",
  },
  {
    id: 4,
    title: "儿童睡前故事：小兔子的冒险",
    desc: "适合儿童收听的睡前故事，培养孩子的想象力",
    cover: "https://picsum.photos/400/400?random=84",
    radioName: "儿童故事",
    date: "2025-01-04",
    duration: "15:20",
  },
  {
    id: 5,
    title: "财经课堂：个人投资理财入门",
    desc: "讲解个人投资理财的基础知识和技巧，帮助听众实现财富增长",
    cover: "https://picsum.photos/400/400?random=85",
    radioName: "财经资讯",
    date: "2025-01-05",
    duration: "48:30",
  },
]);

// 切换分类
const changeCategory = (category) => {
  activeCategory.value = category;
  // 这里可以添加根据分类加载数据的逻辑
  console.log("切换到分类:", category);
};

// 播放电台
const playRadio = (id) => {
  console.log("播放电台:", id);
};

// 播放节目
const playProgram = (id) => {
  console.log("播放节目:", id);
};

// 加载更多
const loadMore = () => {
  isLoading.value = true;

  // 模拟加载更多数据
  setTimeout(() => {
    // 添加一些新的模拟节目数据
    const newPrograms = [
      {
        id: radioPrograms.value.length + 1,
        title: `${activeCategory.value}节目${radioPrograms.value.length + 1}`,
        desc: `新添加的${activeCategory.value}电台节目描述`,
        cover: `https://picsum.photos/400/400?random=${90 + radioPrograms.value.length}`,
        radioName: `${activeCategory.value}电台`,
        date: "2025-01-06",
        duration: `${Math.floor(Math.random() * 30) + 15}:${Math.floor(Math.random() * 60)}`,
      },
      {
        id: radioPrograms.value.length + 2,
        title: `${activeCategory.value}节目${radioPrograms.value.length + 2}`,
        desc: `新添加的${activeCategory.value}电台节目描述`,
        cover: `https://picsum.photos/400/400?random=${91 + radioPrograms.value.length}`,
        radioName: `${activeCategory.value}电台`,
        date: "2025-01-07",
        duration: `${Math.floor(Math.random() * 30) + 15}:${Math.floor(Math.random() * 60)}`,
      },
    ];

    radioPrograms.value = [...radioPrograms.value, ...newPrograms];
    isLoading.value = false;
  }, 1500);
};
</script>

<style scoped>
.radio-page {
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
.radio-filters {
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

/* 热门电台样式 */
.hot-radio-section {
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

.hot-radio-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
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
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
  width: 120px;
  height: 120px;
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
  margin-bottom: 40px;
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
  width: 80px;
  height: 80px;
  border-radius: 6px;
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
  .hot-radio-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 992px) {
  .hot-radio-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .hot-radio-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .program-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .program-item .program-cover {
    width: 100%;
    max-width: 150px;
  }

  .program-meta {
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 576px) {
  .hot-radio-grid {
    grid-template-columns: 1fr;
  }

  .radio-cover {
    width: 100%;
    max-width: 200px;
  }
}
</style>