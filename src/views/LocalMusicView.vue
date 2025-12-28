<template>
  <div class="local-music-view" :class="{ 'dark-mode': isDarkMode }">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">本地歌曲</h2>
      <p class="page-subtitle">管理你本地存储的音乐文件</p>
    </div>

    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <div class="search-filters">
        <!-- 搜索框 -->
        <el-input
          v-model="searchQuery"
          placeholder="搜索歌曲、歌手或专辑"
          prefix-icon="Search"
          class="search-input"
          clearable
          @clear="searchQuery = ''"
        />

        <!-- 筛选器 -->
        <el-select v-model="filterBy" placeholder="筛选" class="filter-select">
          <el-option label="全部" value="all" />
          <el-option label="歌曲名" value="title" />
          <el-option label="歌手" value="artist" />
          <el-option label="专辑" value="album" />
        </el-select>

        <!-- 排序选项 -->
        <el-select v-model="sortBy" placeholder="排序" class="sort-select">
          <el-option label="默认" value="default" />
          <el-option label="歌曲名" value="title" />
          <el-option label="时长" value="duration" />
          <el-option label="修改日期" value="modified" />
        </el-select>

        <!-- 排序方向 -->
        <el-button-group class="sort-direction">
          <el-button
            :icon="SortAscending"
            :type="sortOrder === 'asc' ? 'primary' : 'default'"
            size="small"
            @click="sortOrder = 'asc'"
            title="升序"
          />
          <el-button
            :icon="SortDescending"
            :type="sortOrder === 'desc' ? 'primary' : 'default'"
            size="small"
            @click="sortOrder = 'desc'"
            title="降序"
          />
        </el-button-group>
      </div>

      <!-- 批量操作按钮 -->
      <div class="batch-actions">
        <el-button
          type="danger"
          :icon="Delete"
          size="small"
          :disabled="selectedSongs.length === 0"
          @click="batchDelete"
        >
          批量删除
        </el-button>
        <el-button
          type="primary"
          :icon="Plus"
          size="small"
          :disabled="selectedSongs.length === 0"
          @click="addToPlaylist"
        >
          添加到播放列表
        </el-button>
      </div>
    </div>

    <!-- 主内容区 - 歌曲列表 -->
    <div class="content-area">
      <!-- 表格加载状态 -->
      <div v-loading="loading" class="loading-container">
        <!-- 歌曲表格 - 仅当有数据时显示 -->
        <el-table
          v-if="filteredAndSortedSongs.length > 0"
          :data="filteredAndSortedSongs"
          style="width: 100%"
          height="calc(100vh - 320px)"
          class="music-table"
          stripe
          :header-cell-style="{ backgroundColor: isDarkMode ? '#333' : '' }"
          :row-style="{
            backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
            color: isDarkMode ? '#e0e0e0' : '#303133',
          }"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          :row-class-name="rowClassName"
        >
          <!-- 复选框列 -->
          <el-table-column type="selection" width="50" />

          <!-- 序号列 -->
          <el-table-column type="index" label="#" width="60" />

          <!-- 歌曲信息列 -->
          <el-table-column prop="title" label="歌曲名" min-width="200">
            <template #default="{ row }">
              <div
                class="song-info"
                @mouseenter="showPreview(row)"
                @mouseleave="hidePreview"
                :class="{ 'preview-active': previewSong?.id === row.id }"
              >
                <!-- 歌曲封面（实际项目中会从歌曲文件中提取） -->
                <div class="song-cover">
                  <img :src="getCoverImage(row)" :alt="row.title" />
                </div>
                <el-button
                  type="text"
                  icon="Play"
                  size="small"
                  @click.stop="playSong(row)"
                  class="play-btn"
                />
                <div class="song-details">
                  <span class="song-title">{{ row.title }}</span>
                  <span class="song-artist" v-if="row.artist">{{ row.artist }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="artist" label="歌手" min-width="150">
            <template #default="{ row }">
              <div
                class="artist-cell"
                @mouseenter="showPreview(row)"
                @mouseleave="hidePreview"
                :class="{ 'preview-active': previewSong?.id === row.id }"
              >
                {{ row.artist }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="album" label="专辑" min-width="150">
            <template #default="{ row }">
              <div
                class="album-cell"
                @mouseenter="showPreview(row)"
                @mouseleave="hidePreview"
                :class="{ 'preview-active': previewSong?.id === row.id }"
              >
                {{ row.album }}
              </div>
            </template>
          </el-table-column>

          <!-- 时长列 -->
          <el-table-column prop="duration" label="时长" width="100">
            <template #default="{ row }">
              {{ formatDuration(row.duration) }}
            </template>
          </el-table-column>

          <!-- 文件大小列 -->
          <el-table-column prop="size" label="大小" width="100">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>

          <!-- 修改日期列 -->
          <el-table-column prop="modified" label="修改日期" width="160" />

          <!-- 操作列 -->
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button-group class="table-actions">
                <el-button
                  type="text"
                  icon="Play"
                  size="small"
                  @click="playSong(row)"
                  title="播放"
                  class="action-btn"
                />
                <el-button
                  type="text"
                  icon="Star"
                  :type="row.isFavorite ? 'warning' : 'default'"
                  size="small"
                  @click="toggleFavorite(row)"
                  title="收藏"
                  class="action-btn"
                />
                <el-button
                  type="text"
                  icon="Plus"
                  size="small"
                  @click="addToPlaylist([row])"
                  title="添加到播放列表"
                  class="action-btn"
                />
                <el-button
                  type="text"
                  icon="Delete"
                  size="small"
                  @click="deleteSong(row)"
                  title="删除"
                  class="action-btn"
                />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空数据提示 -->
      <div v-if="!loading && filteredAndSortedSongs.length === 0" class="empty-state">
        <el-empty description="暂无歌曲" image="empty" :image-size="120">
          <div class="empty-actions">
            <el-button type="primary" :icon="UploadFilled" size="small"> 导入歌曲 </el-button>
          </div>
        </el-empty>
      </div>
    </div>

    <!-- 歌曲预览播放器（悬停时显示） -->
    <div
      v-if="previewSong"
      class="mini-player"
      :style="{ left: previewPosition.x + 'px', top: previewPosition.y + 'px' }"
    >
      <div class="mini-player-content">
        <div class="mini-player-cover">
          <img :src="getCoverImage(previewSong)" :alt="previewSong.title" />
        </div>
        <div class="mini-player-info">
          <div class="mini-player-title">{{ previewSong.title }}</div>
          <div class="mini-player-artist">{{ previewSong.artist }}</div>
          <div class="mini-player-controls">
            <el-button
              type="primary"
              :icon="Play"
              size="small"
              circle
              @click="playSong(previewSong)"
            />
            <el-button
              type="default"
              :icon="Plus"
              size="small"
              circle
              @click="addToPlaylist([previewSong])"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-info">
        <span class="status-item">共 {{ totalSongs }} 首歌曲</span>
        <span class="status-item">总大小：{{ totalFileSize }}</span>
        <span v-if="selectedSongs.length > 0" class="status-item selected-count"
          >已选择 {{ selectedSongs.length }} 首</span
        >
      </div>

      <!-- 深色/浅色模式切换 -->
      <div class="theme-toggle">
        <el-switch
          v-model="isDarkMode"
          active-icon="Moon"
          inactive-icon="Sunny"
          @change="toggleTheme"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { debounce } from "@vueuse/core";
import {
  Search,
  Delete,
  Plus,
  Play,
  Star,
  SortAscending,
  SortDescending,
  Moon,
  Sunny,
  UploadFilled,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 生成丰富的模拟歌曲数据
const generateMockSongs = (count = 100) => {
  const artists = [
    "周杰伦",
    "薛之谦",
    "陈奕迅",
    "林俊杰",
    "邓紫棋",
    "Taylor Swift",
    "Billie Eilish",
    "Adele",
    "张学友",
    "刘德华",
    "Beyond",
    "五月天",
    "田馥甄",
    "刘若英",
    "王菲",
  ];
  const albums = [
    "叶惠美",
    "晴天",
    "告白气球",
    "床边故事",
    "七里香",
    "我很忙",
    "十一月的萧邦",
    "Jay",
    "范特西",
    "八度空间",
    "魔杰座",
    "依然范特西",
    "跨时代",
    "惊叹号",
    "十二新作",
  ];
  const titles = [
    "晴天",
    "告白气球",
    "稻香",
    "青花瓷",
    "七里香",
    "夜曲",
    "双截棍",
    "听妈妈的话",
    "简单爱",
    "彩虹",
    "最长的电影",
    "不能说的秘密",
    "东风破",
    "发如雪",
    "半岛铁盒",
    "星晴",
    "黑色幽默",
    "安静",
    "七里香",
    "菊花台",
  ];

  return Array.from({ length: count }, (_, index) => {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const album = albums[Math.floor(Math.random() * albums.length)];
    const title = `${titles[Math.floor(Math.random() * titles.length)]}_${index + 1}`;
    const duration = Math.floor(Math.random() * 240) + 120; // 2-6分钟
    const size = Math.floor(Math.random() * 10000000) + 5000000; // 5-15MB

    // 生成随机日期（最近一年）
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    const modified = date.toISOString().split("T")[0];

    return {
      id: index + 1,
      title,
      artist,
      album,
      duration,
      size,
      modified,
      isFavorite: Math.random() > 0.7, // 30%的概率是收藏的
      path: `/music/${title}.mp3`,
    };
  });
};

// 模拟歌曲数据 - 使用函数生成
const songs = ref([]);

// 状态变量
const loading = ref(false);
const searchQuery = ref("");
const filterBy = ref("all");
const sortBy = ref("default");
const sortOrder = ref("asc");
const selectedSongs = ref([]);
const isDarkMode = ref(false);

// 分页和虚拟滚动相关
const pageSize = ref(50);
const currentPage = ref(1);
const totalItems = ref(0);
const displaySongs = ref([]); // 用于虚拟滚动显示的歌曲

// 格式化时长
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 计算总文件大小 - 使用缓存优化
const cachedTotalSize = ref(null);
const lastSongsCount = ref(0);

const totalFileSize = computed(() => {
  // 如果歌曲数量变化，重新计算总大小
  if (songs.value.length !== lastSongsCount.value || cachedTotalSize.value === null) {
    const totalBytes = songs.value.reduce((sum, song) => sum + song.size, 0);
    cachedTotalSize.value = formatFileSize(totalBytes);
    lastSongsCount.value = songs.value.length;
  }
  return cachedTotalSize.value;
});

// 计算总歌曲数
const totalSongs = computed(() => songs.value.length);

// 防抖搜索函数
const debouncedSearch = debounce((query) => {
  // 实际搜索逻辑已在filteredSongs计算属性中处理
  console.log(`搜索: ${query}`);
}, 300);

// 监听搜索查询变化，触发防抖搜索
watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

// 搜索和筛选歌曲 - 添加缓存优化
const searchCache = ref(new Map());

const filteredSongs = computed(() => {
  const cacheKey = `${searchQuery.value}_${filterBy.value}`;

  // 检查缓存
  if (searchCache.value.has(cacheKey)) {
    return searchCache.value.get(cacheKey);
  }

  if (!searchQuery.value) {
    searchCache.value.set(cacheKey, songs.value);
    return songs.value;
  }

  const query = searchQuery.value.toLowerCase();
  let result;

  if (filterBy.value === "all") {
    result = songs.value.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
    );
  } else {
    result = songs.value.filter((song) => song[filterBy.value].toLowerCase().includes(query));
  }

  // 限制缓存大小
  if (searchCache.value.size > 10) {
    const firstKey = searchCache.value.keys().next().value;
    searchCache.value.delete(firstKey);
  }

  searchCache.value.set(cacheKey, result);
  return result;
});

// 排序歌曲 - 分离排序逻辑，避免重复计算
const sortCache = ref(new Map());

const filteredAndSortedSongs = computed(() => {
  const cacheKey = `${JSON.stringify(filteredSongs.value)}_${sortBy.value}_${sortOrder.value}`;

  // 对于默认排序，直接返回
  if (sortBy.value === "default") {
    totalItems.value = filteredSongs.value.length;
    return filteredSongs.value;
  }

  // 检查缓存
  if (sortCache.value.has(cacheKey)) {
    totalItems.value = sortCache.value.get(cacheKey).length;
    return sortCache.value.get(cacheKey);
  }

  const filtered = [...filteredSongs.value];
  const sorted = filtered.sort((a, b) => {
    let compareValue = 0;

    if (sortBy.value === "title" || sortBy.value === "artist" || sortBy.value === "album") {
      compareValue = a[sortBy.value].localeCompare(b[sortBy.value], "zh-CN");
    } else if (sortBy.value === "duration" || sortBy.value === "size") {
      compareValue = a[sortBy.value] - b[sortBy.value];
    } else if (sortBy.value === "modified") {
      compareValue = new Date(a.modified) - new Date(b.modified);
    }

    return sortOrder.value === "asc" ? compareValue : -compareValue;
  });

  // 限制缓存大小
  if (sortCache.value.size > 5) {
    const firstKey = sortCache.value.keys().next().value;
    sortCache.value.delete(firstKey);
  }

  sortCache.value.set(cacheKey, sorted);
  totalItems.value = sorted.length;
  return sorted;
});

// 分页处理 - 优化大数据量显示
const paginatedSongs = computed(() => {
  if (totalItems.value <= pageSize.value) {
    return filteredAndSortedSongs.value;
  }

  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredAndSortedSongs.value.slice(startIndex, endIndex);
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedSongs.value = selection;
};

// 播放歌曲 - 添加节流控制
let lastPlayTime = 0;
const PLAY_THROTTLE_MS = 300;

const playSong = (song) => {
  const now = Date.now();
  if (now - lastPlayTime < PLAY_THROTTLE_MS) {
    return;
  }
  lastPlayTime = now;

  ElMessage.success(`开始播放：${song.title} - ${song.artist}`);
  // 实际项目中这里会调用音乐播放API
};

// 切换收藏状态
const toggleFavorite = (song) => {
  song.isFavorite = !song.isFavorite;
  ElMessage.success(song.isFavorite ? "已添加到收藏" : "已取消收藏");
};

// 删除歌曲 - 批量操作优化
const deleteSong = (song) => {
  const index = songs.value.findIndex((s) => s.id === song.id);
  if (index > -1) {
    songs.value.splice(index, 1);
    ElMessage.success(`已删除歌曲：${song.title}`);
    // 清除相关缓存
    searchCache.value.clear();
    sortCache.value.clear();
  }
};

// 批量删除 - 使用Set优化查找
const batchDelete = () => {
  if (selectedSongs.value.length === 0) return;

  const idsToDelete = new Set(selectedSongs.value.map((song) => song.id));
  songs.value = songs.value.filter((song) => !idsToDelete.has(song.id));
  selectedSongs.value = [];
  ElMessage.success(`已批量删除 ${idsToDelete.size} 首歌曲`);
  // 清除相关缓存
  searchCache.value.clear();
  sortCache.value.clear();
};

// 添加到播放列表
const addToPlaylist = (songList = selectedSongs.value) => {
  ElMessage.success(`已添加 ${songList.length} 首歌曲到播放列表`);
  // 实际项目中这里会调用添加到播放列表的API
};

// 切换深色/浅色模式
const toggleTheme = () => {
  // 在实际项目中，这里会更新全局主题
  // 为演示目的，我们只在当前组件中更新样式类
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  ElMessage.info(isDarkMode.value ? "已切换到深色模式" : "已切换到浅色模式");
};

// 歌曲预览相关状态 - 添加防抖和节流优化
const previewSong = ref(null);
const previewPosition = ref({ x: 0, y: 0 });
const previewTimer = ref(null);

// 防抖处理预览显示
const debouncedShowPreview = debounce((row, event) => {
  previewSong.value = row;
  previewPosition.value = {
    x: event.clientX + 20,
    y: event.clientY - 120,
  };
}, 200);

// 显示歌曲预览
const showPreview = (row) => {
  // 清除之前的计时器
  if (previewTimer.value) {
    clearTimeout(previewTimer.value);
  }

  // 使用防抖处理预览显示
  const event = window.event;
  debouncedShowPreview(row, event);
};

// 延迟隐藏预览
const hidePreview = () => {
  if (previewTimer.value) {
    clearTimeout(previewTimer.value);
  }
  // 延迟隐藏，使交互更流畅
  previewTimer.value = setTimeout(() => {
    previewSong.value = null;
  }, 150);
};

// 获取封面图片（使用缓存优化）
const coverImageCache = ref(new Map());

const getCoverImage = (song) => {
  // 检查缓存
  if (coverImageCache.value.has(song.id)) {
    return coverImageCache.value.get(song.id);
  }

  // 模拟封面图片，实际项目中需要从歌曲文件中提取
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"];
  const index = song.id % colors.length;
  const firstChar = song.title ? song.title.charAt(0) : "?";
  // 修复SVG生成代码，确保正确的字符串转义
  const svgContent = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <rect width="40" height="40" fill="${colors[index]}"/>
      <text x="20" y="25" font-size="16" text-anchor="middle" fill="white" font-family="Arial">${firstChar}</text>
    </svg>`
  );
  const image = `data:image/svg+xml,${svgContent}`;

  // 限制缓存大小
  if (coverImageCache.value.size > 100) {
    const firstKey = coverImageCache.value.keys().next().value;
    coverImageCache.value.delete(firstKey);
  }

  coverImageCache.value.set(song.id, image);
  return image;
};

// 行样式类名
const rowClassName = ({ row, rowIndex }) => {
  return {
    "hover-row": true,
    "dark-row": isDarkMode.value && rowIndex % 2 === 1,
  };
};

// 页面加载时初始化数据
const initData = () => {
  loading.value = true;

  // 模拟异步加载
  setTimeout(() => {
    songs.value = generateMockSongs(200); // 生成200首模拟歌曲
    loading.value = false;
  }, 500);
};

// 清理函数
const cleanup = () => {
  // 清理定时器和缓存
  if (previewTimer.value) {
    clearTimeout(previewTimer.value);
  }
  searchCache.value.clear();
  sortCache.value.clear();
  coverImageCache.value.clear();
};

// 监听页面可见性变化，优化性能
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 页面不可见时暂停一些操作
    if (previewTimer.value) {
      clearTimeout(previewTimer.value);
    }
  } else {
    // 页面可见时恢复
  }
};

// 生命周期钩子
onMounted(() => {
  initData();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  cleanup();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<style scoped>
.local-music-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  transition: background-color 0.3s, color 0.3s;
  overflow: hidden;
}

/* 深色模式支持 */
.local-music-view.dark-mode {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.local-music-view.dark-mode .action-bar {
  background-color: #2d2d2d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.local-music-view.dark-mode .action-bar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.local-music-view.dark-mode .page-subtitle {
  color: #a0a0a0;
}

.local-music-view.dark-mode .el-table {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

.local-music-view.dark-mode .el-table__row:hover {
  background-color: #3d3d3d;
}

.local-music-view.dark-mode .song-info:hover {
  background-color: #3d3d3d;
}

/* 页面标题样式 */
.page-header {
  margin-bottom: 24px;
  transition: transform 0.3s ease;
}

.page-header:hover {
  transform: translateY(-2px);
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  transition: color 0.3s;
}

.page-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  transition: color 0.3s;
}

/* 顶部操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.action-bar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
  transition: width 0.3s ease;
}

.search-input:focus-within {
  width: 350px;
}

.filter-select,
.sort-select {
  width: 120px;
}

.sort-direction {
  display: flex;
}

.batch-actions {
  display: flex;
  gap: 12px;
  transition: transform 0.2s;
}

.batch-actions:hover {
  transform: translateY(-1px);
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.loading-container {
  height: calc(100vh - 320px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-table {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  contain: layout style paint;
}

.music-table .el-table__body-wrapper {
  overflow-y: auto;
  scroll-behavior: smooth;
  will-change: transform;
}

.music-table .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.music-table .el-table__body-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.music-table .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.music-table .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 深色模式下的滚动条 */
.local-music-view.dark-mode .music-table .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.local-music-view.dark-mode .music-table .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 歌曲信息样式 */
.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: -webkit-optimize-contrast;
}

/* 迷你播放器样式 */
.mini-player {
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 1000;
  animation: fadeInUp 0.2s ease-out;
  max-width: 300px;
}

.local-music-view.dark-mode .mini-player {
  background: rgba(45, 45, 45, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.mini-player-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-player-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.mini-player-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: -webkit-optimize-contrast;
}

.mini-player-info {
  flex: 1;
  min-width: 0;
}

.mini-player-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-player-artist {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-player-controls {
  display: flex;
  gap: 8px;
}

.status-item,
.song-title,
.song-artist {
  will-change: auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 底部状态栏样式 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
}

.local-music-view.dark-mode .status-bar {
  background-color: #2d2d2d;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.local-music-view.dark-mode .status-info {
  color: #a0a0a0;
}

.status-item {
  transition: color 0.3s;
}

.selected-count {
  color: var(--el-color-primary);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-input {
    width: 250px;
  }

  .search-input:focus-within {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .local-music-view {
    padding: 12px;
    font-size: 14px;
  }

  .page-title {
    font-size: 24px;
  }

  .action-bar {
    flex-direction: column;
    gap: 16px;
    padding: 12px;
  }

  .search-filters {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .search-input:focus-within {
    width: 100%;
  }

  .filter-select,
  .sort-select {
    width: 100%;
  }

  .music-table {
    height: calc(100vh - 380px);
  }

  .song-info {
    gap: 8px;
  }

  .song-cover {
    width: 32px;
    height: 32px;
  }

  /* 隐藏部分表格列以适应移动设备 */
  .el-table__column--index,
  .el-table__column--prop.size,
  .el-table__column--prop.modified {
    display: none;
  }

  /* 调整操作列 */
  .el-table__column--fixed-right {
    width: 120px !important;
  }

  .table-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-btn {
    padding: 2px;
  }

  .status-bar {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .status-info {
    justify-content: center;
    gap: 16px;
  }

  /* 隐藏迷你播放器在移动设备上 */
  .mini-player {
    display: none;
  }
}

@media (max-width: 480px) {
  .local-music-view {
    padding: 8px;
  }

  .action-bar {
    padding: 8px;
  }

  .batch-actions {
    width: 100%;
    justify-content: space-between;
  }

  .batch-actions .el-button {
    flex: 1;
  }

  .el-table__column--prop.album {
    display: none;
  }

  .status-info {
    gap: 12px;
    font-size: 12px;
  }
}
</style>
