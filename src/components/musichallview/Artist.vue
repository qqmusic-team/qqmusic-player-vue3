<template>
  <div class="artist-page">
    <h2 class="page-title">歌手</h2>

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
      <div class="artist-grid">
        <div
          v-for="(artist, index) in artists"
          :key="artist.id"
          class="artist-card"
          @click="goToArtistDetail(artist.id)"
        >
          <div class="artist-avatar-container">
            <img :src="artist.avatar" alt="{{ artist.name }}" class="artist-avatar" />
          </div>
          <div class="artist-info">
            <h4 class="artist-name">{{ artist.name }}</h4>
            <p class="artist-desc">{{ artist.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more">
        <button class="load-more-btn" @click="loadMoreArtists">加载更多</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 筛选选项
const artistTypes = [
  { label: "全部", value: "all" },
  { label: "男歌手", value: "male" },
  { label: "女歌手", value: "female" },
  { label: "乐队组合", value: "band" }
];

const regions = [
  { label: "全部", value: "all" },
  { label: "华语", value: "chinese" },
  { label: "欧美", value: "western" },
  { label: "日本", value: "japan" },
  { label: "韩国", value: "korea" },
  { label: "其他", value: "other" }
];

const alphabetLetters = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// 筛选状态
const selectedType = ref("all");
const selectedRegion = ref("all");
const selectedLetter = ref("all");

// 歌手数据
const artists = ref([
  { id: 1, name: "周杰伦", avatar: "https://picsum.photos/200/200?random=51", desc: "华语流行歌手、音乐人、演员" },
  { id: 2, name: "陈奕迅", avatar: "https://picsum.photos/200/200?random=52", desc: "华语流行歌手、演员" },
  { id: 3, name: "Taylor Swift", avatar: "https://picsum.photos/200/200?random=53", desc: "美国流行歌手、音乐制作人" },
  { id: 4, name: "林俊杰", avatar: "https://picsum.photos/200/200?random=54", desc: "华语流行歌手、音乐制作人" },
  { id: 5, name: "邓紫棋", avatar: "https://picsum.photos/200/200?random=55", desc: "华语流行歌手、音乐制作人" },
  { id: 6, name: "华晨宇", avatar: "https://picsum.photos/200/200?random=56", desc: "华语流行歌手、音乐制作人" },
  { id: 7, name: "Ariana Grande", avatar: "https://picsum.photos/200/200?random=57", desc: "美国流行歌手、演员" },
  { id: 8, name: "五月天", avatar: "https://picsum.photos/200/200?random=58", desc: "华语摇滚乐队" },
  { id: 9, name: "李荣浩", avatar: "https://picsum.photos/200/200?random=59", desc: "华语流行歌手、音乐制作人" },
  { id: 10, name: "Billie Eilish", avatar: "https://picsum.photos/200/200?random=60", desc: "美国流行歌手、词曲作者" },
  { id: 11, name: "蔡依林", avatar: "https://picsum.photos/200/200?random=61", desc: "华语流行歌手" },
  { id: 12, name: "薛之谦", avatar: "https://picsum.photos/200/200?random=62", desc: "华语流行歌手、音乐制作人" }
]);

// 筛选方法
const selectType = (type) => {
  selectedType.value = type;
  // 这里可以添加筛选逻辑
};

const selectRegion = (region) => {
  selectedRegion.value = region;
  // 这里可以添加筛选逻辑
};

const selectLetter = (letter) => {
  selectedLetter.value = letter;
  // 这里可以添加筛选逻辑
};

// 加载更多
const loadMoreArtists = () => {
  // 这里可以添加加载更多逻辑
  console.log("加载更多歌手");
};

// 跳转到歌手详情页
const goToArtistDetail = (id) => {
  // 这里可以添加跳转到歌手详情页的逻辑
  console.log("跳转到歌手详情页", id);
};
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