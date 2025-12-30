<template>
  <div class="local-music-view">
    <div class="header">
      <h2 class="title">本地歌曲</h2>
    </div>
    <!-- 顶部控制区域 -->
    <HeaderControl
      :searchQuery="searchQuery"
      :sortBy="sortBy"
      :sortDirection="sortDirection"
      @update:searchQuery="searchQuery = $event"
      @update:sortBy="sortBy = $event"
      @update:sortDirection="sortDirection = $event"
      @import="handleImportMusic"
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
            :currentSong="getCurrentSong()"
            :isPlaying="playerStore.isPlaying"
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
            :songs="filteredSongs"
            :loading="isImporting"
            @folder-click="handleFolderSelect"
          />
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { usePlayerStore } from "@/stores/player";

// 导入本地音乐组件
import HeaderControl from "@/components/localmusic/HeaderControl.vue";
import SongList from "@/components/localmusic/SongList.vue";
import AlbumList from "@/components/localmusic/AlbumList.vue";
import ArtistList from "@/components/localmusic/ArtistList.vue";
import FolderList from "@/components/localmusic/FolderList.vue";

// 定义歌曲接口
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
 * @property {number} [playCount]
 * @property {number} [addTime]
 */

// 状态管理
const playerStore = usePlayerStore();

// 响应式数据
const searchQuery = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");
const activeTab = ref("songs");
const isImporting = ref(false);
const playingSongId = ref(null);
const selectedArtist = ref("");
const selectedAlbum = ref("");
const selectedFolder = ref("");

// 标签页配置
const tabs = [
  { key: "songs", label: "歌曲" },
  { key: "albums", label: "专辑" },
  { key: "artists", label: "艺术家" },
  { key: "folders", label: "文件夹" },
];

// 计算属性
const songs = ref([]);
const folders = ref([]);

// 支持的音频格式
const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/ogg",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
];

// 获取当前播放的歌曲对象

const getCurrentSong = () => {
  return songs.value.find((song) => song.id === playingSongId.value) || null;
};

// 过滤歌曲列表
const filteredSongs = computed(() => {
  let result = [...songs.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter((song) => {
      if (!song) return false;
      const name = (song.name || "").toLowerCase();
      const artist = (song.artist || "").toLowerCase();
      const album = (song.album || "").toLowerCase();
      return name.includes(query) || artist.includes(query) || album.includes(query);
    });
  }

  // 艺术家过滤
  if (selectedArtist.value) {
    result = result.filter((song) => song.artist === selectedArtist.value);
  }

  // 专辑过滤
  if (selectedAlbum.value) {
    result = result.filter((song) => song.album === selectedAlbum.value);
  }

  // 文件夹过滤
  if (selectedFolder.value) {
    result = result.filter((song) => song.folder === selectedFolder.value);
  }

  // 排序
  return sortSongs(result);
});

// 排序歌曲
const sortSongs = (songList) => {
  const sorted = [...songList];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  switch (sortBy.value) {
    case "name":
      return sorted.sort((a, b) => direction * a.name.localeCompare(b.name));
    case "artist":
      return sorted.sort((a, b) => direction * a.artist.localeCompare(b.artist));
    case "album":
      return sorted.sort((a, b) => direction * a.album.localeCompare(b.album));
    case "duration":
      return sorted.sort((a, b) => direction * (a.duration - b.duration));
    case "size":
      return sorted.sort((a, b) => direction * ((b.size || 0) - (a.size || 0)));
    case "playCount":
      return sorted.sort((a, b) => direction * ((b.playCount || 0) - (a.playCount || 0)));
    case "addTime":
      return sorted.sort((a, b) => direction * ((b.addTime || 0) - (a.addTime || 0)));
    default:
      return sorted;
  }
};

// 生成唯一ID
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 解析歌曲信息
const parseSongInfo = (file) => {
  const fileName = file.name;
  const filePath = file.path || file.webkitRelativePath || "";

  // 从文件名中提取信息
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

  // 尝试解析 "歌手 - 歌曲名" 格式
  let artist = "未知歌手";
  let name = nameWithoutExt;

  const dashIndex = nameWithoutExt.indexOf(" - ");
  if (dashIndex > 0) {
    artist = nameWithoutExt.substring(0, dashIndex).trim();
    name = nameWithoutExt.substring(dashIndex + 3).trim();
  }

  // 提取文件夹信息
  let folder = "";
  if (filePath) {
    const pathParts = filePath.split("/");
    if (pathParts.length > 1) {
      folder = pathParts[pathParts.length - 2];
    }
  }

  return {
    id: generateUniqueId(),
    name: name || fileName,
    artist: artist || "未知歌手",
    album: folder || "未知专辑",
    path: filePath || fileName,
    size: file.size,
    folder: folder,
    duration: 0,
    playCount: 0,
    addTime: Date.now(),
  };
};

// 获取音频时长
const getAudioDuration = (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration || 0);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });

    audio.src = url;
  });
};

// 保存到本地存储
const saveToLocalStorage = () => {
  try {
    const data = {
      songs: songs.value,
      folders: folders.value,
    };
    localStorage.setItem("localMusicData", JSON.stringify(data));
  } catch (error) {
    console.error("保存到本地存储失败:", error);
  }
};

// 从本地存储加载
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem("localMusicData");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.songs) {
        songs.value = parsed.songs;
      }
      if (parsed.folders) {
        folders.value = parsed.folders;
      }
    }
  } catch (error) {
    console.error("从本地存储加载失败:", error);
  }
};

// 更新文件夹列表
const updateFolders = () => {
  const folderSet = new Set();
  songs.value.forEach((song) => {
    if (song.folder) {
      folderSet.add(song.folder);
    }
  });
  folders.value = Array.from(folderSet).sort();
};

// 处理导入音乐
const handleImportMusic = async () => {
  try {
    isImporting.value = true;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".mp3,.wav,.flac,.ogg,.m4a,.aac,audio/*";
    input.webkitdirectory = false;

    input.onchange = async (event) => {
      const files = Array.from(event.target.files);

      if (files.length === 0) {
        isImporting.value = false;
        return;
      }

      ElMessage.info(`开始扫描 ${files.length} 个文件...`);

      const audioFiles = files.filter((file) => {
        const type = file.type || "";
        const extension = file.name.split(".").pop().toLowerCase();
        return (
          SUPPORTED_AUDIO_FORMATS.includes(type) ||
          ["mp3", "wav", "flac", "ogg", "m4a", "aac"].includes(extension)
        );
      });

      if (audioFiles.length === 0) {
        ElMessage.warning("未找到支持的音频文件");
        isImporting.value = false;
        return;
      }

      ElMessage.info(`找到 ${audioFiles.length} 个音频文件，正在解析...`);

      const newSongs = [];
      let processedCount = 0;

      for (const file of audioFiles) {
        try {
          const songInfo = parseSongInfo(file);

          // 获取音频时长
          const duration = await getAudioDuration(file);
          songInfo.duration = duration;

          // 检查是否已存在相同路径的歌曲
          const existingIndex = songs.value.findIndex((s) => s.path === songInfo.path);
          if (existingIndex > -1) {
            // 更新现有歌曲
            songs.value[existingIndex] = { ...songs.value[existingIndex], ...songInfo };
          } else {
            // 添加新歌曲
            newSongs.push(songInfo);
          }

          processedCount++;

          // 每处理10个文件更新一次进度
          if (processedCount % 10 === 0) {
            ElMessage.info(`已处理 ${processedCount}/${audioFiles.length} 个文件`);
          }
        } catch (error) {
          console.error("解析文件失败:", file.name, error);
        }
      }

      // 添加新歌曲到列表
      songs.value = [...songs.value, ...newSongs];

      // 更新文件夹列表
      updateFolders();

      // 保存到本地存储
      saveToLocalStorage();

      ElMessage.success(`扫描完成！共添加 ${newSongs.length} 首歌曲`);
      isImporting.value = false;
    };

    input.click();
  } catch (error) {
    console.error("导入音乐失败:", error);
    ElMessage.error("导入音乐失败: " + error.message);
    isImporting.value = false;
  }
};

// 方法
const switchTab = (tab) => {
  activeTab.value = tab;
  // 重置筛选条件
  if (tab !== "songs") {
    selectedArtist.value = "";
    selectedAlbum.value = "";
    selectedFolder.value = "";
  }
};

const handlePlaySong = (song) => {
  if (!song || !song.path) {
    ElMessage.warning("歌曲信息不完整，无法播放");
    return;
  }

  // 更新播放状态
  playingSongId.value = song.id;

  // 增加播放次数
  const songIndex = songs.value.findIndex((s) => s.id === song.id);
  if (songIndex > -1) {
    songs.value[songIndex].playCount = (songs.value[songIndex].playCount || 0) + 1;
    saveToLocalStorage();
  }

  // 添加到播放列表并播放
  playerStore.setPlaylist(songs.value);
  playerStore.setCurrentIndex(songIndex);
  playerStore.play();
};

const handleDeleteSong = (songId) => {
  // 从本地存储中删除歌曲
  const index = songs.value.findIndex((song) => song.id === songId);
  if (index > -1) {
    songs.value.splice(index, 1);
    updateFolders();
    saveToLocalStorage();
    ElMessage.success("歌曲已删除");
  }
};

const handleArtistSelect = (artistName) => {
  selectedArtist.value = artistName;
  activeTab.value = "songs";
};

const handleAlbumSelect = (albumName) => {
  selectedAlbum.value = albumName;
  activeTab.value = "songs";
};

const handleFolderSelect = (folder) => {
  selectedFolder.value = folder.name;
  activeTab.value = "songs";
};

// 监听播放状态变化
watch(
  () => playerStore.currentSong,
  (newSong) => {
    if (newSong && newSong.id) {
      playingSongId.value = newSong.id;
    }
  }
);

// 生命周期钩子
onMounted(() => {
  // 加载本地存储的音乐数据
  loadFromLocalStorage();
  // 更新文件夹列表
  updateFolders();
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
