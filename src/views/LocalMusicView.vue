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
      @upload="handleUploadMusic"
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

      <!-- 面包屑导航 -->
      <div v-if="selectedFolder" class="breadcrumb">
        <span class="breadcrumb-item" @click="clearFolderFilter">
          <span class="breadcrumb-icon">📁</span>
          <span class="breadcrumb-text">{{ selectedFolder }}</span>
          <span class="breadcrumb-close">×</span>
        </span>
      </div>

      <!-- 批量操作按钮 -->
      <div v-if="hasSelectedItems" class="batch-actions">
        <button class="delete-selected-btn" @click="handleDeleteSelected">
          <span class="delete-icon">🗑️</span>
          删除所选 ({{ selectedItemsCount }})
        </button>
      </div>

      <!-- 内容展示区域 -->
      <div class="tab-content">
        <!-- 歌曲列表 -->
        <div v-if="activeTab === 'songs'" class="songs-container">
          <SongList
            :songs="filteredSongs"
            :currentSong="song.value"
            :isPlaying="isPlaying.value"
            :selectedSongs="selectedSongs"
            @play="handlePlaySong"
            @delete="handleDeleteSong"
            @selection-change="handleSongSelectionChange"
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
            :selectedFolders="selectedFolders"
            @folder-click="handleFolderSelect"
            @selection-change="handleFolderSelectionChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { storeToRefs } from "pinia";
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

// 使用storeToRefs获取响应式状态
const { song, isPlaying } = storeToRefs(playerStore);

// 响应式数据
const searchQuery = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");
const activeTab = ref("songs");
const isImporting = ref(false);
const selectedArtist = ref("");
const selectedAlbum = ref("");
const selectedFolder = ref("");
// 选择状态管理
const selectedSongs = ref(new Set());
const selectedFolders = ref(new Set());

// 处理歌曲选择变化


// 处理文件夹选择变化
const handleFolderSelectionChange = (selectedIds) => {
  selectedFolders.value = selectedIds;
};

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
const songFiles = ref(new Map());

// 计算是否有选中项
const hasSelectedItems = computed(() => {
  if (activeTab.value === "songs") {
    return selectedSongs.value.size > 0;
  } else if (activeTab.value === "folders") {
    return selectedFolders.value.size > 0;
  }
  return false;
});

// 计算选中项数量
const selectedItemsCount = computed(() => {
  if (activeTab.value === "songs") {
    return selectedSongs.value.size;
  } else if (activeTab.value === "folders") {
    return selectedFolders.value.size;
  }
  return 0;
});

// 处理删除所选项目
const handleDeleteSelected = async () => {
  try {
    let items = [];
    let itemType = "";
    let deleteFn = null;

    if (activeTab.value === "songs") {
      items = Array.from(selectedSongs.value);
      itemType = "歌曲";
      deleteFn = deleteSelectedSongs;
    } else if (activeTab.value === "folders") {
      items = Array.from(selectedFolders.value);
      itemType = "文件夹";
      deleteFn = deleteSelectedFolders;
    }

    if (items.length === 0) {
      ElMessage.warning("没有选择要删除的项目");
      return;
    }

    // 显示确认对话框
    await ElMessageBox.confirm(`确定要删除所选的 ${items.length} 个${itemType}吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 执行删除操作
    await deleteFn(items);

    // 清除选择状态
    if (activeTab.value === "songs") {
      selectedSongs.value.clear();
    } else if (activeTab.value === "folders") {
      selectedFolders.value.clear();
    }

    // 显示成功提示
    ElMessage.success(`${itemType}删除成功`);
  } catch (error) {
    if (error === "cancel") {
      return;
    }
    console.error("删除失败:", error);
    ElMessage.error("删除失败: " + error.message);
  }
};

// 删除选中的歌曲
const deleteSelectedSongs = (selectedIds) => {
  // 过滤掉选中的歌曲
  songs.value = songs.value.filter((song) => !selectedIds.includes(song.id));

  // 从songFiles Map中删除对应的File对象
  selectedIds.forEach((id) => {
    songFiles.value.delete(id);
  });

  // 更新文件夹列表
  updateFolders();

  // 保存到本地存储
  saveToLocalStorage();
};

// 删除选中的文件夹
const deleteSelectedFolders = (selectedFolderNames) => {
  // 过滤掉选中文件夹中的所有歌曲
  songs.value = songs.value.filter((song) => !selectedFolderNames.includes(song.folder));

  // 从songFiles Map中删除对应的File对象
  songs.value.forEach((song) => {
    if (selectedFolderNames.includes(song.folder)) {
      songFiles.value.delete(song.id);
    }
  });

  // 更新文件夹列表
  updateFolders();

  // 保存到本地存储
  saveToLocalStorage();
};

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
  let folder = "默认导入文件夹";
  if (filePath) {
    const pathParts = filePath.split("/");
    if (pathParts.length > 1) {
      // 获取倒数第二个部分作为文件夹名（最后一个部分是文件名）
      folder = pathParts[pathParts.length - 2] || "默认导入文件夹";
    }
  }

  const songId = generateUniqueId();

  // 存储 File 对象到 Map
  songFiles.value.set(songId, file);

  return {
    id: songId,
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
    input.webkitdirectory = true;

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
            // 删除旧的 File 对象
            const oldSongId = songs.value[existingIndex].id;
            songFiles.value.delete(oldSongId);

            // 更新现有歌曲（使用新的 ID 和 File 对象）
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

// 处理上传音乐文件
const handleUploadMusic = async () => {
  try {
    isImporting.value = true;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".mp3,.wav,.flac,.ogg,.m4a,.aac,audio/*";

    input.onchange = async (event) => {
      const files = Array.from(event.target.files);

      if (files.length === 0) {
        isImporting.value = false;
        return;
      }

      ElMessage.info(`开始处理 ${files.length} 个文件...`);

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
          const songInfo = parseSongInfoForUpload(file);

          const duration = await getAudioDuration(file);
          songInfo.duration = duration;

          const existingIndex = songs.value.findIndex((s) => s.path === songInfo.path);
          if (existingIndex > -1) {
            const oldSongId = songs.value[existingIndex].id;
            songFiles.value.delete(oldSongId);
            songs.value[existingIndex] = { ...songs.value[existingIndex], ...songInfo };
          } else {
            newSongs.push(songInfo);
          }

          processedCount++;

          if (processedCount % 10 === 0) {
            ElMessage.info(`已处理 ${processedCount}/${audioFiles.length} 个文件`);
          }
        } catch (error) {
          console.error("解析文件失败:", file.name, error);
        }
      }

      songs.value = [...songs.value, ...newSongs];
      updateFolders();
      saveToLocalStorage();

      ElMessage.success(`上传完成！共添加 ${newSongs.length} 首歌曲`);
      isImporting.value = false;
    };

    input.click();
  } catch (error) {
    console.error("上传音乐失败:", error);
    ElMessage.error("上传音乐失败: " + error.message);
    isImporting.value = false;
  }
};

// 解析上传歌曲信息（用于单独上传）
const parseSongInfoForUpload = (file) => {
  const fileName = file.name;
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

  let artist = "未知歌手";
  let name = nameWithoutExt;

  const dashIndex = nameWithoutExt.indexOf(" - ");
  if (dashIndex > 0) {
    artist = nameWithoutExt.substring(0, dashIndex).trim();
    name = nameWithoutExt.substring(dashIndex + 3).trim();
  }

  const songId = generateUniqueId();
  const folderName = "默认文件夹";

  songFiles.value.set(songId, file);

  return {
    id: songId,
    name: name || fileName,
    artist: artist || "未知歌手",
    album: "未知专辑",
    path: fileName,
    size: file.size,
    folder: folderName,
    duration: 0,
    playCount: 0,
    addTime: Date.now(),
  };
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
  if (!song || !song.id) {
    ElMessage.warning("歌曲信息不完整，无法播放");
    return;
  }

  // 从 Map 中获取 File 对象
  const file = songFiles.value.get(song.id);
  if (!file) {
    ElMessage.warning("找不到音频文件，请重新导入");
    return;
  }

  const songIndex = songs.value.findIndex((s) => s.id === song.id);
  if (songIndex > -1) {
    songs.value[songIndex].playCount = (songs.value[songIndex].playCount || 0) + 1;
    saveToLocalStorage();
  }

  playerStore.setPlaylist(songs.value);

  // 创建 Blob URL 并播放
  const blobUrl = URL.createObjectURL(file);
  playerStore.playLocalSong({ ...song, blobUrl });
};

const handleDeleteSong = (songId) => {
  // 从本地存储中删除歌曲
  const index = songs.value.findIndex((song) => song.id === songId);
  if (index > -1) {
    // 从 songFiles Map 中删除对应的 File 对象
    songFiles.value.delete(songId);
    // 从 songs 数组中删除歌曲
    songs.value.splice(index, 1);
    updateFolders();
    saveToLocalStorage();
    ElMessage.success("歌曲已删除");
  }
};

// 处理歌曲选择变化
const handleSongSelectionChange = (selectedIds) => {
  selectedSongs.value = selectedIds;
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

const clearFolderFilter = () => {
  selectedFolder.value = "";
};

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

.breadcrumb {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-background, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #f0f7ff;
  border: 1px solid #b3d8ff;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #409eff;
}

.breadcrumb-item:hover {
  background-color: #d9ecff;
  border-color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.breadcrumb-icon {
  font-size: 16px;
}

.breadcrumb-text {
  font-weight: 500;
}

.breadcrumb-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.2);
  font-size: 16px;
  line-height: 1;
  transition: all 0.3s ease;
}

.breadcrumb-item:hover .breadcrumb-close {
  background-color: rgba(64, 158, 255, 0.4);
  transform: rotate(90deg);
}

/* 批量操作按钮 */
.batch-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-background, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease-out;
}

.delete-selected-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-selected-btn:hover {
  background-color: #f78989;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.delete-selected-btn:active {
  transform: translateY(0);
}

.delete-icon {
  font-size: 16px;
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
