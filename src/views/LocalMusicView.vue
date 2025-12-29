<template>
  <div class="local-music-view">
    <div class="profile-nav">
      <NavigationControls @back="handleBack" @forward="handleForward" />
    </div>
    <h2 class="page-title">本地歌曲</h2>

    <div class="search-container">
      <div class="search-box" @click="handleSearchInputClick()">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索歌曲/歌手/专辑..."
          :class="{
            'hover-active': hoverItems.searchInput === 'search',
            'click-active': activeSearchInput,
          }"
        /><span class="search-icon">🔍</span>
      </div>

      <div class="sort-controls">
        <select v-model="sortBy" class="sort-select" @click="handleSortSelectClick()">
          <option value="name">按歌名排序</option>
          <option value="artist">按歌手排序</option>
          <option value="album">按专辑排序</option>
          <option value="duration">按时长排序</option>
          <option value="added">按添加时间排序</option>
        </select>
        <button class="btn-sort-direction" @click="handleSortDirectionClick()">
          {{ sortDirection === "asc" ? "↑" : "↓" }}
        </button>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-click="(tab) => handleTabItemClick(tab.paneName)">
      <!-- 所有歌曲 -->
      <el-tab-pane
        :label="`所有歌曲(${filteredSongs.length})`"
        name="all"
        @mouseenter="handleMouseEnter('tabItem', 'all')"
        @mouseleave="handleMouseLeave('tabItem', 'all')"
        :class="{
          'hover-active': hoverItems.tabItem === 'all',
          'click-active': activeTabItem === 'all',
        }"
      >
        <div class="list">
          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="download-row"
            :class="{
              'active-row': currentSong?.id === song.id,
              'hover-active': hoverItems.songItem === song.id,
              'click-active': activeSongItem === song.id,
            }"
            @dblclick="playSong(song)"
            @click="handleSongItemClick(song.id)"
            @mouseenter="handleMouseEnter('songItem', song.id)"
            @mouseleave="handleMouseLeave('songItem', song.id)"
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
              <el-button
                text
                size="small"
                @click.stop="playSong(song)"
                @mouseenter="handleMouseEnter('playButton', song.id)"
                @mouseleave="handleMouseLeave('playButton', song.id)"
              >
                {{ currentSong?.id === song.id && isPlaying ? "暂停" : "播放" }}
              </el-button>
              <el-button
                text
                size="small"
                @click.stop="addToPlaylist(song)"
                @mouseenter="handleMouseEnter('songItem', `${song.id}-playlist`)"
                @mouseleave="handleMouseLeave('songItem', `${song.id}-playlist`)"
              >
                添加到列表
              </el-button>
              <el-button
                text
                size="small"
                type="danger"
                @click.stop="deleteSong(song)"
                @mouseenter="handleMouseEnter('songItem', `${song.id}-delete`)"
                @mouseleave="handleMouseLeave('songItem', `${song.id}-delete`)"
              >
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
      <el-tab-pane
        label="按歌手"
        name="artist"
        @mouseenter="handleMouseEnter('tabItem', 'artist')"
        @mouseleave="handleMouseLeave('tabItem', 'artist')"
        :class="{
          'hover-active': hoverItems.tabItem === 'artist',
          'click-active': activeTabItem === 'artist',
        }"
      >
        <div class="artist-list">
          <div
            v-for="artist in uniqueArtists"
            :key="artist"
            class="artist-item"
            @click="handleArtistItemClick(artist)"
            @mouseenter="handleMouseEnter('artistItem', artist)"
            @mouseleave="handleMouseLeave('artistItem', artist)"
            :class="{
              'hover-active': hoverItems.artistItem === artist,
              'click-active': activeArtistItem === artist,
            }"
          >
            <div class="artist-name">{{ artist }}</div>
            <div class="artist-count">{{ getArtistSongCount(artist) }}首</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 按专辑 -->
      <el-tab-pane
        label="按专辑"
        name="album"
        @mouseenter="handleMouseEnter('tabItem', 'album')"
        @mouseleave="handleMouseLeave('tabItem', 'album')"
        :class="{
          'hover-active': hoverItems.tabItem === 'album',
          'click-active': activeTabItem === 'album',
        }"
      >
        <div class="album-list">
          <div
            v-for="album in uniqueAlbums"
            :key="album"
            class="album-item"
            @click="handleAlbumItemClick(album)"
            @mouseenter="handleMouseEnter('albumItem', album)"
            @mouseleave="handleMouseLeave('albumItem', album)"
            :class="{
              'hover-active': hoverItems.albumItem === album,
              'click-active': activeAlbumItem === album,
            }"
          >
            <div class="album-name">{{ album }}</div>
            <div class="album-count">{{ getAlbumSongCount(album) }}首</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 文件夹 -->
      <el-tab-pane
        label="文件夹"
        name="folder"
        @mouseenter="handleMouseEnter('tabItem', 'folder')"
        @mouseleave="handleMouseLeave('tabItem', 'folder')"
        :class="{
          'hover-active': hoverItems.tabItem === 'folder',
          'click-active': activeTabItem === 'folder',
        }"
      >
        <div class="folder-list">
          <div
            v-for="folder in mockFolders"
            :key="folder.name"
            class="folder-item"
            @click="handleFolderItemClick(folder.name)"
            @mouseenter="handleMouseEnter('folderItem', folder.name)"
            @mouseleave="handleMouseLeave('folderItem', folder.name)"
            :class="{
              'hover-active': hoverItems.folderItem === folder.name,
              'click-active': activeFolderItem === folder.name,
            }"
          >
            <div class="folder-icon">📁</div>
            <div class="folder-info">
              <div class="folder-name">{{ folder.name }}</div>
              <div class="folder-count">{{ folder.count }}首</div>
            </div>
            <div class="folder-action">
              <el-button
                size="small"
                circle
                @click.stop="playFolderAll(folder)"
                @mouseenter="handleMouseEnter('playButton', `folder-${folder.name}`)"
                @mouseleave="handleMouseLeave('playButton', `folder-${folder.name}`)"
              >
                <i class="el-icon-video-play"></i>
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="import-section">
      <el-button
        type="primary"
        @click="handleImportButtonClick()"
        @mouseenter="handleMouseEnter('importButton', 'import')"
        @mouseleave="handleMouseLeave('importButton', 'import')"
        :class="{
          'hover-active': hoverItems.importButton === 'import',
          'click-active': activeImportButton,
        }"
      >
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
        <button
          class="btn-mini"
          @click="handlePreviousButtonClick()"
          @mouseenter="handleMouseEnter('previousButton', 'previous')"
          @mouseleave="handleMouseLeave('previousButton', 'previous')"
          :class="{
            'hover-active': hoverItems.previousButton === 'previous',
            'click-active': activePreviousButton,
          }"
        >
          ⏮
        </button>
        <button
          class="btn-mini play"
          @click="handlePlayButtonClick()"
          @mouseenter="handleMouseEnter('playButton', 'main')"
          @mouseleave="handleMouseLeave('playButton', 'main')"
          :class="{
            'hover-active': hoverItems.playButton === 'main',
            'click-active': activePlayButton,
          }"
        >
          {{ isPlaying ? "⏸" : "▶" }}
        </button>
        <button
          class="btn-mini"
          @click="handleNextButtonClick()"
          @mouseenter="handleMouseEnter('nextButton', 'next')"
          @mouseleave="handleMouseLeave('nextButton', 'next')"
          :class="{
            'hover-active': hoverItems.nextButton === 'next',
            'click-active': activeNextButton,
          }"
        >
          ⏭
        </button>
      </div>

      <div class="mini-progress">
        <div
          class="progress-bar"
          @click="handleProgressBarClick"
          @mouseenter="handleMouseEnter('progressBar', 'progress')"
          @mouseleave="handleMouseLeave('progressBar', 'progress')"
          :class="{
            'hover-active': hoverItems.progressBar === 'progress',
            'click-active': activeProgressBar,
          }"
        >
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import NavigationControls from "@/components/layout/NavigationControls.vue";

// 路由控制
const router = useRouter();
const handleBack = () => {
  router.replace({ name: "recommend" });
};
const handleForward = () => router.forward();

// 添加响应式状态来管理激活和悬停状态
// 导航相关
const activeNavControls = ref(null);
const activeSortSelect = ref(null);
const activeSortDirection = ref(null);
const activeSearchInput = ref(null);

// 列表项相关
const activeSongItem = ref(null);
const activeArtistItem = ref(null);
const activeAlbumItem = ref(null);
const activeFolderItem = ref(null);
const activeImportButton = ref(null);

// 播放器相关
const activePlayButton = ref(null);
const activePreviousButton = ref(null);
const activeNextButton = ref(null);
const activeProgressBar = ref(null);

// 标签页相关
const activeTabItem = ref(null);

// 管理悬停状态
const hoverItems = reactive({
  navControls: null,
  sortSelect: null,
  sortDirection: null,
  searchInput: null,
  songItem: null,
  artistItem: null,
  albumItem: null,
  folderItem: null,
  importButton: null,
  playButton: null,
  previousButton: null,
  nextButton: null,
  progressBar: null,
  tabItem: null,
});

// 添加鼠标悬停事件处理函数
const handleMouseEnter = (type, value) => {
  if (type in hoverItems) {
    hoverItems[type] = value;
  }
};

const handleMouseLeave = (type, value) => {
  if (type in hoverItems && hoverItems[type] === value) {
    hoverItems[type] = null;
  }
};

// 添加点击事件处理函数
const handleNavControlsClick = (action) => {
  activeNavControls.value = activeNavControls.value === action ? null : action;
};

const handleSortSelectClick = () => {
  activeSortSelect.value = !activeSortSelect.value;
};

const handleSortDirectionClick = () => {
  activeSortDirection.value = !activeSortDirection.value;
  toggleSortDirection();
};

const handleSearchInputClick = () => {
  activeSearchInput.value = !activeSearchInput.value;
};

const handleSongItemClick = (songId) => {
  activeSongItem.value = activeSongItem.value === songId ? null : songId;
};

const handleArtistItemClick = (artist) => {
  activeArtistItem.value = activeArtistItem.value === artist ? null : artist;
  filterByArtist(artist);
};

const handleAlbumItemClick = (album) => {
  activeAlbumItem.value = activeAlbumItem.value === album ? null : album;
  filterByAlbum(album);
};

const handleFolderItemClick = (folderName) => {
  activeFolderItem.value = activeFolderItem.value === folderName ? null : folderName;
};

const handleImportButtonClick = () => {
  activeImportButton.value = !activeImportButton.value;
  triggerFileInput();
};

const handlePlayButtonClick = () => {
  activePlayButton.value = !activePlayButton.value;
  togglePlay();
};

const handlePreviousButtonClick = () => {
  activePreviousButton.value = !activePreviousButton.value;
  playPrevious();
};

const handleNextButtonClick = () => {
  activeNextButton.value = !activeNextButton.value;
  playNext();
};

const handleProgressBarClick = (e) => {
  activeProgressBar.value = !activeProgressBar.value;
  seekProgress(e);
};

const handleTabItemClick = (tabName) => {
  activeTabItem.value = activeTabItem.value === tabName ? null : tabName;
  activeTab.value = tabName;
};

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
    cover: "https://p1.music.126.net/4JHj9s8pHq2n9nXv2c7p7Q==/109951165779738588.jpg",
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
    cover: "https://p1.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg",
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
    cover: "https://p1.music.126.net/5lE3tYpW96p9WJ8R4J6JfQ==/109951164213634442.jpg",
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
    cover: "https://p1.music.126.net/6cL6J6F6G6H6I6J6K6L6M==/109951164567890123.jpg",
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
    cover: "https://p1.music.126.net/7d7e7f7g7h7i7j7k7l7m==/109951164890123456.jpg",
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
    cover: "https://p1.music.126.net/8e8f8g8h8i8j8k8l8m8n==/109951165123456789.jpg",
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
    cover: "https://p1.music.126.net/9e9f9g9h9i9j9k9l9m9n==/109951165456789012.jpg",
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
    cover: "https://p1.music.126.net/10a1b1c1d1e1f1g1h1i==/109951165789012345.jpg",
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
    cover: "https://p1.music.126.net/20a2b2c2d2e2f2g2h2i==/109951166012345678.jpg",
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
    cover: "https://p1.music.126.net/30a3b3c3d3e3f3g3h3i==/109951166345678901.jpg",
  },
];

// 模拟文件夹数据
const mockFolders = [
  { name: "默认音乐文件夹", count: 5 },
  { name: "下载音乐", count: 3 },
  { name: "我喜欢的音乐", count: 8 },
];

// --- 状态管理 ---
const songs = ref(mockSongs);
const activeTab = ref("all");
const searchQuery = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");
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
  artist: "歌手",
  album: "专辑",
  folder: "文件夹",
};

// --- 计算属性 ---

// 获取所有唯一歌手
const uniqueArtists = computed(() => {
  const artistsSet = new Set(songs.value.map((song) => song.artist));
  return Array.from(artistsSet);
});

// 按歌曲数量排序的歌手列表
const alphabeticalArtists = computed(() => {
  return [...uniqueArtists.value].sort((a, b) => {
    // 先按歌曲数量降序，再按歌手名排序
    const countDiff = getArtistSongCount(b) - getArtistSongCount(a);
    return countDiff !== 0 ? countDiff : a.localeCompare(b, "zh");
  });
});

// 获取所有唯一专辑
const uniqueAlbums = computed(() => {
  const albumsSet = new Set(songs.value.map((song) => song.album));
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
    if (currentFilter.value.type === "artist") {
      result = result.filter((song) => song.artist === currentFilter.value.value);
    } else if (currentFilter.value.type === "album") {
      result = result.filter((song) => song.album === currentFilter.value.value);
    }
  }

  // 搜索过滤
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (song) =>
        song.name.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.album.toLowerCase().includes(q)
    );
  }

  // 排序
  result.sort((a, b) => {
    let comparison = 0;

    switch (sortBy.value) {
      case "name":
        comparison = a.name.localeCompare(b.name, "zh");
        break;
      case "artist":
        comparison = a.artist.localeCompare(b.artist, "zh");
        break;
      case "album":
        comparison = a.album.localeCompare(b.album, "zh");
        break;
      case "duration":
        comparison = a.duration - b.duration;
        break;
      case "added":
        comparison = a.addedTime - b.addedTime;
        break;
    }

    return sortDirection.value === "asc" ? comparison : -comparison;
  });

  return result;
});

// --- 方法定义 ---

// 时间格式化 MM:SS
const formatTime = (seconds) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
  searchQuery.value = "";
  currentPage.value = 1;
};

const handleChangeSearchType = (type) => {
  searchType.value = type;
};

// 排序相关方法
const handleSort = (type) => {
  // 排序逻辑
};

// 过滤相关方法
const filterByArtist = (artist) => {
  currentFilter.value = { type: "artist", value: artist };
  activeTab.value = "songs";
  currentPage.value = 1;
};

const filterByAlbum = (album) => {
  currentFilter.value = { type: "album", value: album };
  activeTab.value = "songs";
  currentPage.value = 1;
};

// 获取统计信息方法
const getArtistSongCount = (artist) => {
  return songs.value.filter((song) => song.artist === artist).length;
};

const getAlbumSongCount = (album) => {
  return songs.value.filter((song) => song.album === album).length;
};

const getAlbumCover = (album) => {
  const albumSong = songs.value.find((song) => song.album === album);
  return albumSong ? albumSong.cover : null;
};

const getAlbumArtist = (album) => {
  const artists = [
    ...new Set(songs.value.filter((song) => song.album === album).map((song) => song.artist)),
  ];
  return artists.length <= 3 ? artists.join("、") : `${artists[0]} 等`;
};

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 播放相关方法
const playSong = (song) => {
  currentSong.value = song;
  isPlaying.value = true;
  currentTime.value = 0;
  progress.value = 0;
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
};

const playPrevious = () => {
  const currentIndex = filteredSongs.value.findIndex((song) => song.id === currentSong.value?.id);
  if (currentIndex > 0) {
    playSong(filteredSongs.value[currentIndex - 1]);
  }
};

const playNext = () => {
  const currentIndex = filteredSongs.value.findIndex((song) => song.id === currentSong.value?.id);
  if (currentIndex < filteredSongs.value.length - 1) {
    playSong(filteredSongs.value[currentIndex + 1]);
  }
};

const playArtistAll = (artist) => {
  const artistSongs = songs.value.filter((song) => song.artist === artist);
  if (artistSongs.length > 0) {
    playSong(artistSongs[0]);
    filterByArtist(artist);
  }
};

const playAlbumAll = (album) => {
  const albumSongs = songs.value.filter((song) => song.album === album);
  if (albumSongs.length > 0) {
    playSong(albumSongs[0]);
    filterByAlbum(album);
  }
};

const playFolderAll = (folder) => {
  if (songs.value.length > 0) {
    playSong(songs.value[0]);
  }
};

// 其他方法
const addToPlaylist = (song) => {
  alert(`已添加《${song.name}》到播放列表`);
};

const handleSongMore = (song) => {
  // 歌曲更多操作
};

const handleArtistMore = (artist) => {
  // 歌手更多操作
};

const handleAlbumMore = (album) => {
  // 专辑更多操作
};

const handleFolderMore = (folder) => {
  // 文件夹更多操作
};

// 删除重复的handleFolderItemClick函数
const handleTabClick = (tab) => {
  activeTab.value = tab.paneName;
  currentPage.value = 1;
};

const handleImportMusic = () => {
  // 导入音乐操作
};

const seekProgress = (percent) => {
  if (!currentSong.value) return;
  const newTime = percent * currentSong.value.duration;
  currentTime.value = newTime;
  progress.value = percent * 100;
};

// 组件挂载时的初始化
onMounted(() => {
  // 初始化逻辑
});

// 组件卸载时清理
onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});
</script>

<style scoped>
.local-music-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.search-container {
  margin-bottom: 20px;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.song-list,
.artist-list,
.album-list,
.folder-list {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

/* 分页样式 */
.el-pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
