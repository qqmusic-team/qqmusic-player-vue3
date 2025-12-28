<template>
  <div class="local-music-view">
    <div class="profile-nav">
      <NavigationControls @back="handleBack" @forward="handleForward" />
    </div>
    <h2 class="page-title">本地歌曲</h2>

    <div class="search-container">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" v-model="searchQuery" placeholder="搜索歌曲/歌手/专辑..." />
      </div>

      <div class="sort-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="name">按歌名排序</option>
          <option value="artist">按歌手排序</option>
          <option value="album">按专辑排序</option>
          <option value="duration">按时长排序</option>
          <option value="added">按添加时间排序</option>
        </select>
        <button class="btn-sort-direction" @click="toggleSortDirection">
          {{ sortDirection === "asc" ? "↑" : "↓" }}
        </button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 所有歌曲 -->
      <el-tab-pane :label="`所有歌曲(${filteredSongs.length})`" name="all">
        <div class="list">
          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="download-row"
            :class="{ 'active-row': currentSong?.id === song.id }"
            @dblclick="playSong(song)"
          >
            <div class="song-cell">
              <div class="cover-container">
                <img v-if="song.cover" class="cover" :src="song.cover" alt="" />
                <div v-else class="cover-placeholder">🎵</div>
                <div v-if="currentSong?.id === song.id" class="playing-indicator">▶</div>
              </div>
              <div class="meta2">
                <div class="title">
                  {{ song.name }}
                </div>
                <div class="sub">
                  {{ song.artist }} · {{ song.album }} · {{ formatTime(song.duration) }}
                </div>
              </div>
            </div>

            <div class="row-actions">
              <el-button text size="small" @click.stop="playSong(song)">
                {{ currentSong?.id === song.id && isPlaying ? "暂停" : "播放" }}
              </el-button>
              <el-button text size="small" @click.stop="addToPlaylist(song)">
                添加到列表
              </el-button>
              <el-button text size="small" type="danger" @click.stop="deleteSong(song)">
                删除
              </el-button>
            </div>
          </div>

          <div v-if="filteredSongs.length === 0" class="empty">
            <div class="empty-title">暂无歌曲</div>
            <div class="empty-subtitle">点击下方按钮导入本地音乐</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 按歌手 -->
      <el-tab-pane label="按歌手" name="artist">
        <div class="artist-list">
          <div
            v-for="artist in uniqueArtists"
            :key="artist"
            class="artist-item"
            @click="filterByArtist(artist)"
          >
            <div class="artist-name">{{ artist }}</div>
            <div class="artist-count">{{ getArtistSongCount(artist) }}首</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 按专辑 -->
      <el-tab-pane label="按专辑" name="album">
        <div class="album-list">
          <div
            v-for="album in uniqueAlbums"
            :key="album"
            class="album-item"
            @click="filterByAlbum(album)"
          >
            <div class="album-name">{{ album }}</div>
            <div class="album-count">{{ getAlbumSongCount(album) }}首</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 文件夹 -->
      <el-tab-pane label="文件夹" name="folder">
        <div class="folder-list">
          <div v-for="folder in mockFolders" :key="folder.name" class="folder-item">
            <div class="folder-icon">📁</div>
            <div class="folder-info">
              <div class="folder-name">{{ folder.name }}</div>
              <div class="folder-count">{{ folder.count }}首</div>
            </div>
            <div class="folder-action">
              <el-button size="small" circle @click.stop="playFolderAll(folder)">
                <i class="el-icon-video-play"></i>
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="import-section">
      <el-button type="primary" @click="triggerFileInput">
        <i class="el-icon-plus"></i> 扫描本地歌曲
      </el-button>
      <input
        type="file"
        ref="fileInput"
        multiple
        accept=".mp3,.wav,.flac"
        style="display: none"
        @change="handleFileImport"
      />
    </div>

    <!-- 播放控制条 -->
    <div class="player-mini" v-if="currentSong">
      <div class="player-info">
        <img v-if="currentSong.cover" class="mini-cover" :src="currentSong.cover" alt="" />
        <div v-else class="mini-cover-placeholder">🎵</div>
        <div class="mini-info">
          <div class="mini-title">{{ currentSong.name }}</div>
          <div class="mini-artist">{{ currentSong.artist }}</div>
        </div>
      </div>

      <div class="mini-controls">
        <button class="btn-mini" @click="playPrevious">⏮</button>
        <button class="btn-mini play" @click="togglePlay">
          {{ isPlaying ? "⏸" : "▶" }}
        </button>
        <button class="btn-mini" @click="playNext">⏭</button>
      </div>

      <div class="mini-progress">
        <div class="progress-bar" @click="seekProgress">
          <div class="progress-inner" :style="{ width: progress + '%' }"></div>
          <div class="progress-handle" :style="{ left: progress + '%' }"></div>
        </div>
        <span class="progress-time"
          >{{ formatTime(currentTime) }} / {{ formatTime(currentSong.duration) }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import NavigationControls from '@/components/layout/NavigationControls.vue';

// 路由控制
const router = useRouter();
const handleBack = () => {
  router.replace({ name: "recommend" });
};
const handleForward = () => router.forward();

// --- 数据模拟 ---
const mockSongs = [
  {
    id: "song-1",
    name: "晴天",
    artist: "周杰伦",
    album: "叶惠美",
    duration: 267,
    path: "/music/local/song-1.mp3",
    size: "4.5",
    addedTime: new Date(2024, 4, 1),
    cover: "https://p1.music.126.net/4JHj9s8pHq2n9nXv2c7p7Q==/109951165779738588.jpg"
  },
  {
    id: "song-2",
    name: "稻香",
    artist: "周杰伦",
    album: "魔杰座",
    duration: 323,
    path: "/music/local/song-2.mp3",
    size: "5.8",
    addedTime: new Date(2024, 4, 2),
    cover: "https://p1.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg"
  },
  {
    id: "song-3",
    name: "起风了",
    artist: "吴青峰",
    album: "起风了",
    duration: 315,
    path: "/music/local/song-3.mp3",
    size: "4.9",
    addedTime: new Date(2024, 4, 3),
    cover: "https://p1.music.126.net/5lE3tYpW96p9WJ8R4J6JfQ==/109951164213634442.jpg"
  },
  {
    id: "song-4",
    name: "夜曲",
    artist: "周杰伦",
    album: "十一月的萧邦",
    duration: 278,
    path: "/music/local/song-4.mp3",
    size: "5.2",
    addedTime: new Date(2024, 4, 4),
    cover: "https://p1.music.126.net/6cL6J6F6G6H6I6J6K6L6M==/109951164567890123.jpg"
  },
  {
    id: "song-5",
    name: "演员",
    artist: "薛之谦",
    album: "绅士",
    duration: 288,
    path: "/music/local/song-5.mp3",
    size: "5.1",
    addedTime: new Date(2024, 4, 5),
    cover: "https://p1.music.126.net/7d7e7f7g7h7i7j7k7l7m==/109951164890123456.jpg"
  },
  {
    id: "song-6",
    name: "江南",
    artist: "林俊杰",
    album: "第二天堂",
    duration: 267,
    path: "/music/local/song-6.mp3",
    size: "4.7",
    addedTime: new Date(2024, 4, 6),
    cover: "https://p1.music.126.net/8e8f8g8h8i8j8k8l8m8n==/109951165123456789.jpg"
  },
  {
    id: "song-7",
    name: "海阔天空",
    artist: "Beyond",
    album: "乐与怒",
    duration: 312,
    path: "/music/local/song-7.mp3",
    size: "5.3",
    addedTime: new Date(2024, 4, 7),
    cover: "https://p1.music.126.net/9e9f9g9h9i9j9k9l9m9n==/109951165456789012.jpg"
  },
  {
    id: "song-8",
    name: "告白气球",
    artist: "周杰伦",
    album: "周杰伦的床边故事",
    duration: 281,
    path: "/music/local/song-8.mp3",
    size: "5.0",
    addedTime: new Date(2024, 4, 8),
    cover: "https://p1.music.126.net/10a1b1c1d1e1f1g1h1i==/109951165789012345.jpg"
  },
  {
    id: "song-9",
    name: "小幸运",
    artist: "田馥甄",
    album: "小幸运",
    duration: 254,
    path: "/music/local/song-9.mp3",
    size: "4.4",
    addedTime: new Date(2024, 4, 9),
    cover: "https://p1.music.126.net/20a2b2c2d2e2f2g2h2i==/109951166012345678.jpg"
  },
  {
    id: "song-10",
    name: "光年之外",
    artist: "邓紫棋",
    album: "光年之外",
    duration: 291,
    path: "/music/local/song-10.mp3",
    size: "5.2",
    addedTime: new Date(2024, 4, 10),
    cover: "https://p1.music.126.net/30a3b3c3d3e3f3g3h3i==/109951166345678901.jpg"
  }
];

// 模拟文件夹数据
const mockFolders = [
  { name: "默认音乐文件夹", count: 5 },
  { name: "下载音乐", count: 3 },
  { name: "我喜欢的音乐", count: 8 }
];

// --- 状态管理 ---
const songs = ref(mockSongs);
const activeTab = ref('all');
const searchQuery = ref('');
const sortBy = ref('name');
const sortDirection = ref('asc');
const currentFilter = ref({ type: null, value: null });
const searchTimeout = ref(null);

// 分页状态
const pageSize = ref(20);
const currentPage = ref(1);

// 播放器状态
const currentSong = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const progress = ref(0);

// 本地播放器状态
const localAudio = ref(null);
const currentLocalSong = ref(null);
const localIsPlaying = ref(false);
const localCurrentTime = ref(0);
const localDuration = ref(0);
const localIsSliderInput = ref(false);

// 文件输入引用
const fileInput = ref(null);

// 过滤器类型映射
const filterTypeMap = {
  artist: '歌手',
  album: '专辑',
  folder: '文件夹'
};

// --- 计算属性 ---

// 获取所有唯一歌手
const uniqueArtists = computed(() => {
  const artistsSet = new Set(songs.value.map(song => song.artist));
  return Array.from(artistsSet);
});

// 按歌曲数量排序的歌手列表
const alphabeticalArtists = computed(() => {
  return [...uniqueArtists.value].sort((a, b) => {
    // 先按歌曲数量降序，再按歌手名排序
    const countDiff = getArtistSongCount(b) - getArtistSongCount(a);
    return countDiff !== 0 ? countDiff : a.localeCompare(b, 'zh');
  });
});

// 获取所有唯一专辑
const uniqueAlbums = computed(() => {
  const albumsSet = new Set(songs.value.map(song => song.album));
  return Array.from(albumsSet);
});

// 当前活跃的过滤器标签
const activeFilterTag = computed(() => {
  return currentFilter.value.type && currentFilter.value.value ? currentFilter.value : null;
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredSongs.value.length / pageSize.value);
});

// 分页后的歌曲列表
const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSongs.value.slice(start, end);
});

// 过滤和排序后的歌曲列表
const filteredSongs = computed(() => {
  let result = [...songs.value];

  // 应用过滤条件
  if (currentFilter.value.type && currentFilter.value.value) {
    if (currentFilter.value.type === 'artist') {
      result = result.filter(song => song.artist === currentFilter.value.value);
    } else if (currentFilter.value.type === 'album') {
      result = result.filter(song => song.album === currentFilter.value.value);
    }
  }

  // 搜索过滤
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(song =>
      song.name.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.album.toLowerCase().includes(q)
    );
  }

  // 排序
  result.sort((a, b) => {
    let comparison = 0;

    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'zh');
        break;
      case 'artist':
        comparison = a.artist.localeCompare(b.artist, 'zh');
        break;
      case 'album':
        comparison = a.album.localeCompare(b.album, 'zh');
        break;
      case 'duration':
        comparison = a.duration - b.duration;
        break;
      case 'added':
        comparison = a.addedTime - b.addedTime;
        break;
    }

    return sortDirection.value === 'asc' ? comparison : -comparison;
  });

  return result;
});

// --- 方法定义 ---

// 时间格式化 MM:SS
const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// 搜索处理（带防抖）
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1; // 搜索时重置到第一页
  }, 300);
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
};

// 处理排序变化
const handleSortChange = () => {
  // 切换排序字段时重置为升序
  sortDirection.value = 'asc';
};

// 切换排序方向
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
};

// 过滤歌手
const filterByArtist = (artist) => {
  currentFilter.value = { type: 'artist', value: artist };
  activeTab.value = 'all';
  currentPage.value = 1;
};

// 过滤专辑
const filterByAlbum = (album) => {
  currentFilter.value = { type: 'album', value: album };
  activeTab.value = 'all';
  currentPage.value = 1;
};

// 清除过滤条件
const clearFilter = () => {
  currentFilter.value = { type: null, value: null };
  currentPage.value = 1;
};

// 获取歌手歌曲数量
const getArtistSongCount = (artist) => {
  return songs.value.filter(song => song.artist === artist).length;
};

// 获取专辑歌曲数量
const getAlbumSongCount = (album) => {
  return songs.value.filter(song => song.album === album).length;
};

// 获取专辑封面
const getAlbumCover = (album) => {
  const albumSong = songs.value.find(song => song.album === album);
  return albumSong ? albumSong.cover : null;
};

// 获取专辑歌手
const getAlbumArtist = (album) => {
  const artists = [...new Set(songs.value
    .filter(song => song.album === album)
    .map(song => song.artist))];
  return artists.length <= 3 ? artists.join('、') : `${artists[0]} 等`;
};

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 播放所有歌手歌曲
const playArtistAll = (artist) => {
  const artistSongs = songs.value.filter(song => song.artist === artist);
  if (artistSongs.length > 0) {
    currentFilter.value = { type: 'artist', value: artist };
    activeTab.value = 'all';
    playSong(artistSongs[0]);
  }
};

// 播放所有专辑歌曲
const playAlbumAll = (album) => {
  const albumSongs = songs.value.filter(song => song.album === album);
  if (albumSongs.length > 0) {
    currentFilter.value = { type: 'album', value: album };
    activeTab.value = 'all';
    playSong(albumSongs[0]);
  }
};

// 播放文件夹所有歌曲
const playFolderAll = (folder) => {
  if (songs.value.length > 0) {
    playSong(songs.value[0]);
  }
};

// 添加到播放列表
const addToPlaylist = (song) => {
  // 将本地歌曲转换为兼容全局播放器的格式
  const songForPlaylist = {
    id: song.id,
    name: song.name,
    ar: [{ id: song.id, name: song.artist }],
    al: { id: song.id, name: song.album, picUrl: song.cover },
    dt: song.duration * 1000,
    // 添加本地标识
    isLocal: true,
    localPath: song.path
  };

  // 这里可以实现添加到全局播放列表的逻辑
  alert(`已添加《${song.name}》到播放列表`);
};

// 删除歌曲
const deleteSong = (song) => {
  if (confirm(`确定要删除《${song.name}》吗？`)) {
    // 停止播放并清空当前歌曲
    if (currentLocalSong.value?.id === song.id) {
      try {
        localAudio.value.pause();
        localAudio.value.src = '';
      } catch (error) {
        console.error('停止播放失败:', error);
      }
      currentLocalSong.value = null;
      localIsPlaying.value = false;
      localCurrentTime.value = 0;
      localDuration.value = 0;
    }

    // 从列表中删除
    songs.value = songs.value.filter(s => s.id !== song.id);

    // 处理分页
    if (paginatedSongs.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  }
};

// 播放歌曲
const playSong = (song) => {
  currentSong.value = song;
  isPlaying.value = true;
  currentTime.value = 0;
  progress.value = 0;
  localDuration.value = song.duration;
  localCurrentTime.value = 0;
  currentLocalSong.value = song;
  localIsPlaying.value = true;
};

// 播放控制
const togglePlay = () => {
  if (currentSong.value) {
    isPlaying.value = !isPlaying.value;
    localIsPlaying.value = !localIsPlaying.value;
  }
};

// 上一首
const playPrevious = () => {
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value?.id);
  if (currentIndex > 0) {
    playSong(filteredSongs.value[currentIndex - 1]);
  }
};

// 下一首
const playNext = () => {
  const currentIndex = filteredSongs.value.findIndex(song => song.id === currentSong.value?.id);
  if (currentIndex < filteredSongs.value.length - 1) {
    playSong(filteredSongs.value[currentIndex + 1]);
  } else if (filteredSongs.value.length > 0) {
    playSong(filteredSongs.value[0]); // 循环播放
  }
};

// 进度条控制
const seekProgress = (e) => {
  if (!currentSong.value) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * currentSong.value.duration;

  currentTime.value = newTime;
  localCurrentTime.value = newTime;
  progress.value = percent * 100;
};

// 停止本地播放进度模拟
const stopLocalProgressSimulation = () => {
  if (localProgressInterval) {
    clearInterval(localProgressInterval);
    localProgressInterval = null;
  }
};

// 音频事件处理
const handleTimeUpdate = () => {
  if (localAudio.value && currentLocalSong.value) {
    localCurrentTime.value = localAudio.value.currentTime;
    progress.value = (localAudio.value.currentTime / localDuration.value) * 100;
  }
};

const handleLoadedMetadata = () => {
  if (localAudio.value) {
    localDuration.value = localAudio.value.duration;
  }
};

const handleEnded = () => {
  playNext();
};

const handleAudioError = (error) => {
  console.error('音频播放错误:', error);
  localIsPlaying.value = false;
};

// 清理缓存
const clearCache = () => {
  // 清理URL对象
  songs.value.forEach(song => {
    if (song.path && song.path.startsWith('blob:')) {
      URL.revokeObjectURL(song.path);
    }
  });
};

// 模拟全局播放器状态
const playerStore = {
  isPlaying: false
};

// 文件导入
const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileImport = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    // 模拟添加导入的文件
    const newSongs = Array.from(files).map((file, index) => ({
      id: `imported-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // 移除扩展名
      artist: "未知艺术家",
      album: "未分类",
      duration: Math.floor(Math.random() * 200) + 120, // 随机时长
      path: URL.createObjectURL(file),
      size: (file.size / (1024 * 1024)).toFixed(1),
      addedTime: new Date(),
      cover: null
    }));

    songs.value.push(...newSongs);
    alert(`成功导入 ${newSongs.length} 首歌曲`);

    // 清空文件输入，允许重新选择同一文件
    e.target.value = '';
  }
};

// 模拟本地播放进度更新（用于演示）
let localProgressInterval = null;
const startLocalProgressSimulation = () => {
  if (localProgressInterval) clearInterval(localProgressInterval);

  localProgressInterval = setInterval(() => {
    if (localIsPlaying.value && currentLocalSong.value && !localIsSliderInput.value) {
      localCurrentTime.value += 1;

      if (localCurrentTime.value >= localDuration.value) {
        // 播放完毕，自动播放下一首
        playNext();
      }
    }
  }, 1000);
};

// 监听标签切换，重置分页
watch(activeTab, () => {
  currentPage.value = 1;
});

// 监听全局播放器状态变化，停止本地播放
watch(
  () => playerStore.isPlaying,
  (isPlaying) => {
    if (isPlaying && currentLocalSong.value) {
      // 如果全局播放器开始播放，停止本地播放
      localIsPlaying.value = false;
      try {
        if (localAudio.value) {
          localAudio.value.pause();
        }
      } catch (error) {
        console.error('停止本地播放失败:', error);
      }
    }
  }
);

// 监听当前歌曲变化，清理资源
watch(
  () => currentLocalSong.value?.id,
  () => {
    stopLocalProgressSimulation();
  }
);

// 组件挂载时的初始化
onMounted(() => {
  // 延迟初始化，避免阻塞首屏渲染
  setTimeout(() => {
    // 启动本地播放进度模拟
    startLocalProgressSimulation();
  }, 0);
});

// 清理资源 - 更完整的清理
const cleanup = () => {
  stopLocalProgressSimulation();

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (localAudio.value) {
    try {
      localAudio.value.pause();
      localAudio.value.src = '';
      // 移除事件监听器
      localAudio.value.removeEventListener('timeupdate', handleTimeUpdate);
      localAudio.value.removeEventListener('loadedmetadata', handleLoadedMetadata);
      localAudio.value.removeEventListener('ended', handleEnded);
      localAudio.value.removeEventListener('error', handleAudioError);
      localAudio.value = null;
    } catch (error) {
      console.error('清理音频资源失败:', error);
    }
  }

  // 清理缓存
  clearCache();
};

// 组件卸载时清理
onBeforeUnmount(cleanup);
</script>

<style scoped>
/* 基础样式 - 与DownloadsView保持一致 */
.local-music-view {
  padding: 16px 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-title {
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 12px;
}

/* 搜索和排序控制 */
.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 14px;
}

.search-box input {
  width: 100%;
  padding: 8px 10px 8px 36px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #f7f7f7;
  outline: none;
  font-size: 14px;
  transition: all 0.2s;
}

.search-box input:focus {
  background: white;
  border-color: #409eff;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover {
  background: #f0f0f0;
  color: #666;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  cursor: pointer;
}

.btn-sort-direction {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-sort-direction:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 过滤器标签 */
.filter-tag {
  display: inline-flex;
  align-items: center;
  background: #e6f7ff;
  color: #409eff;
  padding: 4px 12px;
  border-radius: 16px;
  margin-bottom: 16px;
  font-size: 14px;
}

.filter-tag-text {
  margin-right: 6px;
}

.filter-tag-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #409eff;
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.filter-tag-close:hover {
  background: rgba(64, 158, 255, 0.1);
}

/* 列表样式 - 与DownloadsView保持一致 */
.list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  /* 优化滚动性能 */
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

.list::-webkit-scrollbar {
  width: 6px;
}

.list::-webkit-scrollbar-track {
  background: transparent;
}

.list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
  /* 优化渲染性能 */
  contain: layout style paint;
}

.download-row:hover {
  background: #f9fafb;
}

.download-row.active-row {
  background: #e6f7ff;
  color: #409eff;
}

/* song-cell：完全复用DownloadsView样式 */
.song-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.cover-container {
  position: relative;
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  background: #eee;
  /* 优化图片加载体验 */
  transition: opacity 0.3s;
}

.cover-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.playing-indicator {
  position: absolute;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.meta2 {
  min-width: 0;
  flex: 1;
}

.title {
  font-weight: 700;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* hover 操作区 */
.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.download-row:hover .row-actions {
  opacity: 1;
}

/* 歌手列表样式 */
.artist-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  overflow-y: auto;
  flex: 1;
}

.artist-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.artist-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.artist-rank {
  width: 30px;
  font-size: 18px;
  font-weight: bold;
  color: #999;
  text-align: center;
}

.artist-content {
  flex: 1;
}

.artist-name {
  font-weight: 700;
  color: #111;
  margin-bottom: 4px;
  font-size: 16px;
}

.artist-count {
  font-size: 12px;
  color: #777;
}

.artist-action {
  margin-left: 10px;
}

/* 专辑列表样式 */
.album-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 16px 0;
  overflow-y: auto;
  flex: 1;
}

.album-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 300px;
  width: calc(50% - 10px);
  /* 优化渲染性能 */
  contain: layout style paint;
}

.album-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.album-cover {
  position: relative;
}

.album-cover img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  transition: transform 0.3s;
}

.album-cover img:hover {
  transform: scale(1.05);
}

.album-cover-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.album-info {
  flex: 1;
  min-width: 0;
}

.album-name {
  font-weight: 700;
  color: #111;
  margin-bottom: 4px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-count {
  font-size: 12px;
  color: #999;
}

.album-action {
  margin-left: 10px;
}

/* 文件夹列表样式 */
.folder-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0;
  overflow-y: auto;
  flex: 1;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  min-width: 250px;
  cursor: pointer;
  transition: all 0.2s;
  /* 优化渲染性能 */
  contain: layout style paint;
}

.folder-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.folder-icon {
  font-size: 24px;
}

.folder-info {
  flex: 1;
}

.folder-name {
  font-weight: 700;
  color: #111;
}

.folder-action {
  margin-left: 10px;
}

/* 导入按钮 */
.import-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  text-align: center;
}

/* 空状态 */
.empty {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-title {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.empty-subtitle {
  font-size: 14px;
  color: #999;
}

/* 分页控件 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* 迷你播放器 */
.player-mini {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.mini-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  animation: rotate 10s linear infinite;
  animation-play-state: paused;
}

.player-mini:hover .mini-cover {
  animation-play-state: running;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mini-cover-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.mini-info {
  min-width: 0;
}

.mini-title {
  font-weight: 500;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.mini-artist {
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-mini {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-mini:hover {
  background: #f0f0f0;
}

.btn-mini:active {
  transform: scale(0.95);
}

.btn-mini.play {
  font-size: 18px;
  background: #409eff;
  color: white;
  padding: 6px 10px;
}

.btn-mini.play:hover {
  background: #66b1ff;
}

.mini-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: height 0.2s;
}

.progress-bar:hover {
  height: 6px;
}

.progress-inner {
  height: 100%;
  background: #409eff;
  border-radius: 2px;
  transition: width 0.3s;
}

.progress-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.progress-time {
  font-size: 12px;
  color: #999;
  min-width: 80px;
  text-align: right;
}

/* Element UI 样式覆盖 */
:deep(.el-tabs__item) {
  font-size: 16px;
}

:deep(.el-tabs__active-bar) {
  background: #409eff;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
  .local-music-view {
    padding: 12px;
    height: calc(100vh - 60px); /* 为底部播放器留出空间 */
  }

  .page-title {
    font-size: 28px;
  }

  .search-container {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .sort-controls {
    justify-content: center;
  }

  .song-cell {
    flex: 1;
  }

  .sub {
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-actions {
    opacity: 1;
    flex-wrap: wrap;
    gap: 4px;
  }

  .player-mini {
    padding: 0 12px;
    height: 50px;
  }

  .player-info {
    min-width: 120px;
    gap: 8px;
  }

  .mini-cover {
    width: 32px;
    height: 32px;
  }

  .mini-cover-placeholder {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .mini-controls {
    gap: 8px;
  }

  .btn-mini {
    font-size: 14px;
    padding: 2px 6px;
  }

  .btn-mini.play {
    font-size: 16px;
    padding: 4px 8px;
  }

  .progress-time {
    display: none;
  }

  .album-item {
    width: 100%;
    min-width: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
  }

  .album-cover {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .album-cover img {
    width: 120px;
    height: 120px;
  }

  .artist-item,
  .folder-item {
    min-width: auto;
    width: 100%;
  }

  .artist-rank {
    width: 24px;
    font-size: 16px;
  }

  .artist-name {
    font-size: 14px;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .album-item {
    width: 100%;
    min-width: auto;
  }

  .player-info {
    min-width: 160px;
  }
}
</style>
