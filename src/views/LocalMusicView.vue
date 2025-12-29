<template>
  <div class="local-music-view">
    <div class="header">
      <h2 class="title">本地歌曲</h2>
    </div>
    <!-- 顶部控制区域 -->
    <HeaderControl
      :searchQuery="searchQuery"
      :sortBy="sortBy"
      :isImporting="isImporting"
      @update:searchQuery="searchQuery = $event"
      @update:sortBy="sortBy = $event"
      @importMusic="handleImportMusic"
    />

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 标签页导航 -->
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 内容展示区域 -->
      <div class="tab-content">
        <!-- 歌曲列表 -->
        <div v-if="activeTab === 'songs'" class="songs-container">
          <SongList
            :songs="filteredSongs"
            :selectedSongId="selectedSongId"
            :playingSongId="playingSongId"
            @play="handlePlaySong"
            @delete="handleDeleteSong"
          />
        </div>

        <!-- 专辑列表 -->
        <div v-else-if="activeTab === 'albums'" class="albums-container">
          <AlbumList :audioList="filteredSongs" @select="handleAlbumSelect" />
        </div>

        <!-- 艺术家列表 -->
        <div v-else-if="activeTab === 'artists'" class="artists-container">
          <ArtistList
            :songs="filteredSongs"
            :selectedArtist="selectedArtist"
            @select="handleArtistSelect"
          />
        </div>

        <!-- 文件夹列表 -->
        <div v-else-if="activeTab === 'folders'" class="folders-container">
          <FolderList
            :folders="folders"
            :selectedFolder="selectedFolder"
            @select="handleFolderSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';


// 导入本地音乐组件
import HeaderControl from '@/components/localmusic/HeaderControl.vue';
import SongList from '@/components/localmusic/SongList.vue';
import AlbumList from '@/components/localmusic/AlbumList.vue';
import ArtistList from '@/components/localmusic/ArtistList.vue';
import FolderList from '@/components/localmusic/FolderList.vue';

// 定义歌曲接口
// 定义歌曲接口（使用 JSDoc 注解代替 TypeScript interface）
/**
 * @typedef {Object} Song
 * @property {string|number} id
 * @property {string} name
 * @property {string} artist
 * @property {string} album
 * @property {string} path
 * @property {number} duration
 * @property {number} [size]
 * @property {string} [cover]
 * @property {string} [folder]
 */

/**
 * @typedef {Object} Song
 * @property {string|number} id
 * @property {string} name
 * @property {string} artist
 * @property {string} album
 * @property {string} path
 * @property {number} duration
 * @property {number} [size]
 * @property {string} [cover]
 * @property {string} [folder]
 */

// 状态管理


// 响应式数据
const searchQuery = ref('');
const sortBy = ref('name');
const activeTab = ref('songs');
const isImporting = ref(false);
const selectedSongId = ref(null);
const selectedArtist = ref('');
const selectedAlbum = ref('');
const selectedFolder = ref('');

// 标签页配置
const tabs = [
  { key: 'songs', label: '歌曲' },
  { key: 'albums', label: '专辑' },
  { key: 'artists', label: '艺术家' },
  { key: 'folders', label: '文件夹' }
];

// 计算属性
const songs = ref([]);
const folders = ref([]);

// 获取当前播放的歌曲ID


// 过滤歌曲列表
const filteredSongs = computed(() => {
  let result = [...songs.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(song =>
      song.name.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
    );
  }

  // 艺术家过滤
  if (selectedArtist.value) {
    result = result.filter(song => song.artist === selectedArtist.value);
  }

  // 专辑过滤
  if (selectedAlbum.value) {
    result = result.filter(song => song.album === selectedAlbum.value);
  }

  // 文件夹过滤
  if (selectedFolder.value) {
    result = result.filter(song => song.folder === selectedFolder.value);
  }

  // 排序
  return sortSongs(result);
});

// 排序歌曲
const sortSongs = (songList) => {
  const sorted = [...songList];

  switch (sortBy.value) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'artist':
      return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    case 'album':
      return sorted.sort((a, b) => a.album.localeCompare(b.album));
    case 'duration':
      return sorted.sort((a, b) => a.duration - b.duration);
    case 'size':
      return sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
    default:
      return sorted;
  }
};

// 方法
const switchTab = (tab) => {
  activeTab.value = tab;
  // 重置筛选条件
  if (tab !== 'songs') {
    selectedArtist.value = '';
    selectedAlbum.value = '';
    selectedFolder.value = '';
  }
};

const handlePlaySong = (song, index) => {
  if (!song || !song.path) {
    ElMessage.warning('歌曲信息不完整，无法播放');
    return;
  }

  // 添加到播放列表

  // 播放指定索引的歌曲

  selectedSongId.value = song.id;
};

const handleDeleteSong = (songId) => {
  // 从本地存储中删除歌曲

  // 从当前列表中移除
  const index = songs.value.findIndex(song => song.id === songId);
  if (index > -1) {
    songs.value.splice(index, 1);
  }
  ElMessage.success('歌曲已删除');
};

const handleArtistSelect = (artistName) => {
  selectedArtist.value = artistName;
  activeTab.value = 'songs';
};

const handleAlbumSelect = (albumName) => {
  selectedAlbum.value = albumName;
  activeTab.value = 'songs';
};

const handleFolderSelect = (folderName) => {
  selectedFolder.value = folderName;
  activeTab.value = 'songs';
};


// 初始化加载本地音乐

// 生命周期钩子
onMounted(() => {

});
</script>

<style scoped>
.local-music-view {
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-background-page, #f5f7fa);
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
}

.tabs {
  display: flex;
  background-color: var(--color-background, #ffffff);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  padding: 12px 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--color-text-secondary, #606266);
}

.tab-item:hover {
  background-color: var(--color-background-soft, #f5f7fa);
  color: var(--color-primary, #409eff);
}

.tab-item.active {
  background-color: var(--color-primary, #409eff);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.tab-content {
  flex: 1;
  background-color: var(--color-background, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.songs-container,
.albums-container,
.artists-container,
.folders-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 12px;
    gap: 12px;
  }

  .tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding: 4px 8px;
  }

  .tab-item {
    padding: 8px 16px;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 8px;
    gap: 8px;
  }

  .tab-item {
    padding: 6px 12px;
    font-size: 14px;
  }
}
.title {
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-primary, #303133);
  margin-bottom: 20px;
}
</style>
