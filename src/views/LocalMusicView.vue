<template>
  <div class="local-music-page">
    <div class="local-music-content">
      <header class="page-header">
        <h1 class="main-title">本地歌曲</h1>
      </header>

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

      <div class="content-wrapper">
        <el-tabs v-model="activeTab">
          <el-tab-pane v-for="tab in tabs" :key="tab.key" :label="tab.label" :name="tab.key" />
        </el-tabs>

        <div v-if="selectedFolder || hasSelectedItems" class="content-toolbar">
          <div v-if="selectedFolder" class="breadcrumb">
            <span class="breadcrumb-item" @click="clearFolderFilter">
              <span class="breadcrumb-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h4.19c.597 0 1.17.237 1.592.658l.56.56c.281.282.662.441 1.06.441H18A2.25 2.25 0 0 1 20.25 8.41v8.84A2.25 2.25 0 0 1 18 19.5H6A2.25 2.25 0 0 1 3.75 17.25V6.75Z"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="breadcrumb-text">{{ selectedFolder }}</span>
              <span class="breadcrumb-close" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.75 6.75 17.25 17.25M17.25 6.75 6.75 17.25"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </span>
          </div>

          <div v-if="hasSelectedItems" class="batch-actions">
            <button class="delete-selected-btn" @click="handleDeleteSelected">
              <span class="delete-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 3.75h6c.414 0 .75.336.75.75V6h3a.75.75 0 0 1 0 1.5h-.75l-.73 12.042A2.25 2.25 0 0 1 15.026 21H8.974a2.25 2.25 0 0 1-2.244-1.458L6 7.5h-.75a.75.75 0 0 1 0-1.5h3V4.5c0-.414.336-.75.75-.75ZM9.75 6h4.5V5.25h-4.5V6Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10.5 10.5v7.5M13.5 10.5v7.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              删除所选 ({{ selectedItemsCount }})
            </button>
          </div>
        </div>

        <Transition name="local-tab" mode="out-in">
          <div :key="activeTab" class="tab-content">
            <div v-if="activeTab === 'songs'" ref="songListSectionRef" class="songs-container">
              <SongList
                :songs="filteredSongs"
                :selectedSongs="selectedSongs"
                @delete="handleDeleteSong"
                @selection-change="handleSongSelectionChange"
              />
            </div>

            <div v-else-if="activeTab === 'albums'" class="albums-container">
              <AlbumList :audioList="filteredSongs" @select="handleAlbumSelect" />
            </div>

            <div v-else-if="activeTab === 'artists'" class="artists-container">
              <ArtistList
                :songs="filteredSongs"
                :selectedArtist="selectedArtist"
                @select="handleArtistSelect"
              />
            </div>

            <div v-else-if="activeTab === 'folders'" class="folders-container">
              <FolderList
                :songs="filteredSongs"
                :loading="isImporting"
                :selectedFolders="selectedFolders"
                @play-folder="handlePlayFolder"
                @folder-click="handleFolderSelect"
                @selection-change="handleFolderSelectionChange"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent, nextTick } from "vue";
import { defineStore, storeToRefs } from "pinia";
import { onBeforeRouteLeave } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { usePlayerStore } from "@/stores/player";
import type { LocalSong } from "@/stores/player";

defineOptions({ name: "LocalMusicView" });

const LOCAL_MUSIC_META_KEY = "localMusicData:v2";
const LOCAL_MUSIC_LEGACY_KEY = "localMusicData";
const LOCAL_MUSIC_DB_NAME = "qqmusic-localmusic";
const LOCAL_MUSIC_DB_VERSION = 1;
const LOCAL_MUSIC_DB_STORE = "songBase64";

const useLocalMusicPersistStore = defineStore("localMusicPersist", () => {
  const songs = ref<LocalSong[]>([]);
  const folders = ref<string[]>([]);
  const hydrated = ref(false);
  return { songs, folders, hydrated };
});

// 导入本地音乐组件 - 使用异步导入提高初始加载速度
import HeaderControl from "@/components/localmusic/HeaderControl.vue";
const SongList = defineAsyncComponent(() => import("@/components/localmusic/SongList.vue"));
const AlbumList = defineAsyncComponent(() => import("@/components/localmusic/AlbumList.vue"));
const ArtistList = defineAsyncComponent(() => import("@/components/localmusic/ArtistList.vue"));
const FolderList = defineAsyncComponent(() => import("@/components/localmusic/FolderList.vue"));

// 状态管理
const playerStore = usePlayerStore();
const localMusicStore = useLocalMusicPersistStore();
const { songs, folders } = storeToRefs(localMusicStore);

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
const selectedSongs = ref<Set<string | number>>(new Set());
const selectedFolders = ref<Set<string | number>>(new Set());
const songListSectionRef = ref<HTMLElement | null>(null);

// 处理歌曲选择变化
const handleSongSelectionChange = (selectedIds: Set<string | number>) => {
  selectedSongs.value = selectedIds;
};

// 处理文件夹选择变化
const handleFolderSelectionChange = (selectedIds: Set<string>) => {
  selectedFolders.value = selectedIds;
};

// 标签页配置
const tabs = [
  { key: "songs", label: "歌曲" },
  { key: "albums", label: "专辑" },
  { key: "artists", label: "艺术家" },
  { key: "folders", label: "文件夹" },
];

// 说明：
// 之前在 localStorage 里直接保存 songs（包含 base64）在歌曲多时会触发 quota exceeded，导致路由切走后重新进入页面时无法恢复。
// 这里将“歌曲元数据”存 localStorage，“base64 大字段”存 IndexedDB，并用 Pinia 在内存中兜底，避免仅靠 localStorage 导致的数据丢失。

let localMusicDbPromise: Promise<IDBDatabase> | null = null;
const openLocalMusicDb = (): Promise<IDBDatabase> => {
  if (localMusicDbPromise) return localMusicDbPromise;
  localMusicDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(LOCAL_MUSIC_DB_NAME, LOCAL_MUSIC_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOCAL_MUSIC_DB_STORE)) {
        db.createObjectStore(LOCAL_MUSIC_DB_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return localMusicDbPromise;
};

const idbPutSongBase64Batch = async (items: { id: string | number; base64: string }[]) => {
  if (items.length === 0) return;
  const db = await openLocalMusicDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOCAL_MUSIC_DB_STORE, "readwrite");
    const store = tx.objectStore(LOCAL_MUSIC_DB_STORE);
    items.forEach((it) => store.put(it));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const idbGetSongBase64Map = async (ids: (string | number)[]) => {
  const result = new Map<string | number, string>();
  if (ids.length === 0) return result;
  const db = await openLocalMusicDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOCAL_MUSIC_DB_STORE, "readonly");
    const store = tx.objectStore(LOCAL_MUSIC_DB_STORE);
    let pending = ids.length;

    ids.forEach((id) => {
      const req = store.get(id);
      req.onsuccess = () => {
        const value = req.result as { id: string | number; base64?: string } | undefined;
        if (value?.base64) result.set(id, value.base64);
        pending -= 1;
        if (pending === 0) resolve();
      };
      req.onerror = () => {
        pending -= 1;
        if (pending === 0) resolve();
      };
    });

    tx.onerror = () => reject(tx.error);
  });
  return result;
};

const idbDeleteSongBase64 = async (id: string | number) => {
  const db = await openLocalMusicDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOCAL_MUSIC_DB_STORE, "readwrite");
    tx.objectStore(LOCAL_MUSIC_DB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

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
const handleDeleteSelected = async (): Promise<void> => {
  try {
    let items: (string | number)[] = [];
    let itemType = "";
    let deleteFn: (ids: (string | number)[]) => void = null;

    if (activeTab.value === "songs") {
      items = Array.from(selectedSongs.value) as (string | number)[];
      itemType = "歌曲";
      deleteFn = deleteSelectedSongs;
    } else if (activeTab.value === "folders") {
      items = Array.from(selectedFolders.value) as (string | number)[];
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
    if (deleteFn) {
      deleteFn(items);
    }

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
    ElMessage.error("删除失败: " + (error as Error).message);
  }
};

// 删除选中的歌曲
const deleteSelectedSongs = (selectedIds: (string | number)[]) => {
  // 过滤掉选中的歌曲
  songs.value = songs.value.filter((song) => !selectedIds.includes(song.id));

  // 从 playerStore 的 songFiles Map 中删除对应的 File 对象
  selectedIds.forEach((id) => {
    playerStore.removeSongFile(id);
    idbDeleteSongBase64(id).catch((e) => console.warn("[LocalMusicView] 删除 base64 失败:", id, e));
  });

  // 更新文件夹列表
  updateFolders();

  // 保存到本地存储
  saveToLocalStorage();
};

// 删除选中的文件夹
const deleteSelectedFolders = (selectedFolderNames: string[]) => {
  const songsToDelete = songs.value.filter((song) => selectedFolderNames.includes(song.folder));
  songs.value = songs.value.filter((song) => !selectedFolderNames.includes(song.folder));
  songsToDelete.forEach((song) => {
    playerStore.removeSongFile(song.id);
    idbDeleteSongBase64(song.id).catch((e) =>
      console.warn("[LocalMusicView] 删除 base64 失败:", song.id, e),
    );
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
const filteredSongs = computed<LocalSong[]>(() => {
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
const sortSongs = (songList: LocalSong[]): LocalSong[] => {
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
const generateUniqueId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// 将File对象转换为Base64字符串
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 解析歌曲信息
const parseSongInfo = async (file: File): Promise<LocalSong> => {
  const fileName = file.name;
  const filePath = (file as File & { path?: string }).path || file.webkitRelativePath || "";

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

  // 将File对象转换为Base64字符串
  const base64 = await fileToBase64(file);

  // 存储 File 对象到 playerStore
  playerStore.addSongFile(songId, file);

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
    base64: base64,
  };
};

// 获取音频时长
const getAudioDuration = (file: File): Promise<number> => {
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

// 保存到本地存储（v2：songs 元数据进 localStorage，base64 进 IndexedDB）
const saveToLocalStorage = async (): Promise<void> => {
  try {
    const base64Items: { id: string | number; base64: string }[] = [];
    const songsMeta = songs.value.map((s) => {
      if (typeof s.base64 === "string" && s.base64.length > 0) {
        base64Items.push({ id: s.id, base64: s.base64 });
      }
      const { base64: _base64, blobUrl: _blobUrl, ...rest } = s;
      return rest;
    });

    const meta = { version: 2, songs: songsMeta, folders: folders.value };
    localStorage.setItem(LOCAL_MUSIC_META_KEY, JSON.stringify(meta));
    await idbPutSongBase64Batch(base64Items);
  } catch (error) {
    console.error("保存到本地存储失败:", error);
  }
};

// 从本地存储加载（优先 Pinia 内存态，其次 localStorage v2，最后兼容 legacy）
const loadFromLocalStorage = async (): Promise<void> => {
  try {
    if (localMusicStore.hydrated && songs.value.length > 0) {
      return;
    }

    const v2 = localStorage.getItem(LOCAL_MUSIC_META_KEY);
    if (v2) {
      const parsed = JSON.parse(v2) as { songs?: LocalSong[]; folders?: string[] };
      songs.value = parsed.songs || [];
      folders.value = parsed.folders || [];

      const ids = songs.value.map((s) => s.id);
      const base64Map = await idbGetSongBase64Map(ids);
      songs.value = songs.value.map((s) => ({ ...s, base64: base64Map.get(s.id) || "" }));

      playerStore.setSongFiles(new Map());
      localMusicStore.hydrated = true;
      updateFolders();
      return;
    }

    const legacy = localStorage.getItem(LOCAL_MUSIC_LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { songs?: LocalSong[]; folders?: string[] };
      songs.value = parsed.songs || [];
      folders.value = parsed.folders || [];

      playerStore.setSongFiles(new Map());
      localMusicStore.hydrated = true;
      updateFolders();

      await saveToLocalStorage();
    }
  } catch (error) {
    console.error("从本地存储加载失败:", error);
  }
};

// 更新文件夹列表
const updateFolders = (): void => {
  const folderSet = new Set<string>();
  songs.value.forEach((song) => {
    if (song.folder) {
      folderSet.add(song.folder);
    }
  });
  folders.value = Array.from(folderSet).sort();
};

// 处理导入音乐
const handleImportMusic = async (): Promise<void> => {
  try {
    isImporting.value = true;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".mp3,.wav,.flac,.ogg,.m4a,.aac,audio/*";
    input.webkitdirectory = true;

    input.onchange = async (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);

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

      const newSongs: LocalSong[] = [];
      let processedCount = 0;

      for (const file of audioFiles) {
        try {
          const songInfo = await parseSongInfo(file);

          // 获取音频时长
          const duration = await getAudioDuration(file);
          songInfo.duration = duration;

          // 检查是否已存在相同路径的歌曲
          const existingIndex = songs.value.findIndex((s) => s.path === songInfo.path);
          if (existingIndex > -1) {
            // 删除旧的 File 对象
            const oldSongId = songs.value[existingIndex].id;
            playerStore.removeSongFile(oldSongId);

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
    ElMessage.error("导入音乐失败: " + (error as Error).message);
    isImporting.value = false;
  }
};

// 处理上传音乐文件
const handleUploadMusic = async (): Promise<void> => {
  try {
    isImporting.value = true;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".mp3,.wav,.flac,.ogg,.m4a,.aac,audio/*";

    input.onchange = async (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);

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

      const newSongs: LocalSong[] = [];
      let processedCount = 0;

      for (const file of audioFiles) {
        try {
          const songInfo = await parseSongInfoForUpload(file);

          const duration = await getAudioDuration(file);
          songInfo.duration = duration;

          const existingIndex = songs.value.findIndex((s) => s.path === songInfo.path);
          if (existingIndex > -1) {
            const oldSongId = songs.value[existingIndex].id;
            playerStore.removeSongFile(oldSongId);
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
    ElMessage.error("上传音乐失败: " + (error as Error).message);
    isImporting.value = false;
  }
};

// 解析上传歌曲信息（用于单独上传）
const parseSongInfoForUpload = async (file: File): Promise<LocalSong> => {
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

  // 将File对象转换为Base64字符串
  const base64 = await fileToBase64(file);

  playerStore.addSongFile(songId, file);

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
    base64: base64,
  };
};

// 监听 tab 切换，重置筛选条件
watch(activeTab, (newTab) => {
  if (newTab !== "songs") {
    selectedArtist.value = "";
    selectedAlbum.value = "";
    selectedFolder.value = "";
  }
});

const handleDeleteSong = (songId: string | number) => {
  // 从本地存储中删除歌曲
  const index = songs.value.findIndex((song) => song.id === songId);
  if (index > -1) {
    // 从 playerStore 的 songFiles Map 中删除对应的 File 对象
    playerStore.removeSongFile(songId);
    idbDeleteSongBase64(songId).catch((e) =>
      console.warn("[LocalMusicView] 删除 base64 失败:", songId, e),
    );
    // 从 songs 数组中删除歌曲
    songs.value.splice(index, 1);
    updateFolders();
    saveToLocalStorage();
    ElMessage.success("歌曲已删除");
  }
};

const handleArtistSelect = (artistName: string): void => {
  selectedArtist.value = artistName;
  activeTab.value = "songs";
  nextTick(() => {
    const scrollToSongList = (attempt = 0) => {
      if (songListSectionRef.value) {
        songListSectionRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempt < 12) {
        requestAnimationFrame(() => scrollToSongList(attempt + 1));
      }
    };
    scrollToSongList();
  });
};

const handleAlbumSelect = (albumName: string): void => {
  selectedAlbum.value = albumName;
  activeTab.value = "songs";
};

const handleFolderSelect = (folder: { name: string }): void => {
  selectedFolder.value = folder.name;
  activeTab.value = "songs";
};

const handlePlayFolder = (folderPath: string): void => {
  const list = sortSongs(songs.value.filter((s) => s.folder === folderPath));
  if (list.length === 0) {
    ElMessage.warning("该文件夹暂无可播放歌曲");
    return;
  }

  playerStore.setPlaylist(list);
  playerStore.playLocalSong(list[0]);

  selectedFolder.value = folderPath;
  activeTab.value = "songs";
};

const clearFolderFilter = (): void => {
  selectedFolder.value = "";
};

// 生命周期钩子
onMounted(() => {
  // 使用 requestIdleCallback 或 setTimeout 延迟加载数据，不阻塞页面渲染
  requestAnimationFrame(() => {
    loadFromLocalStorage();
  });
});

onBeforeRouteLeave(async () => {
  await saveToLocalStorage();
});
</script>

<style scoped>
.local-music-page {
  padding: 16px 20px;
  color: #111;
}

.page-header {
  margin-bottom: 0;
}

.main-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 12px 0;
  letter-spacing: 0.2px;
}

.content-wrapper {
  margin-top: 10px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 14px 14px 10px;
}

/* 标签页样式 */
:deep(.el-tabs__item) {
  font-size: 16px;
}

:deep(.el-tabs__header) {
  margin: 0 0 10px;
}

:deep(.el-tabs__nav-scroll) {
  padding-left: 24px;
}

:deep(.el-tabs__nav-wrap)::after {
  background-color: rgba(0, 0, 0, 0.06);
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 999px;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 10px 0 12px;
  min-height: 34px;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.78);
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.breadcrumb-item:hover {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.12);
}

.breadcrumb-item:active {
  transform: scale(0.98);
}

.breadcrumb-icon,
.breadcrumb-close,
.delete-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.breadcrumb-icon svg,
.breadcrumb-close svg,
.delete-icon svg {
  width: 16px;
  height: 16px;
}

.breadcrumb-close {
  opacity: 0.75;
}

.batch-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-selected-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid rgba(245, 108, 108, 0.35);
  background: rgba(245, 108, 108, 0.1);
  color: #d92d20;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.delete-selected-btn:hover {
  background: rgba(245, 108, 108, 0.14);
  border-color: rgba(245, 108, 108, 0.55);
}

.delete-selected-btn:active {
  transform: scale(0.98);
}

/* 内容区域 */
.tab-content {
  min-height: 500px;
}

.songs-container,
.albums-container,
.artists-container,
.folders-container {
  width: 100%;
  height: 100%;
}

.local-tab-enter-active,
.local-tab-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.local-tab-enter-from,
.local-tab-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .local-music-page {
    padding: 12px 15px;
  }

  .main-title {
    font-size: 24px;
  }

  .content-wrapper {
    padding: 12px 12px 8px;
  }
}

@media (max-width: 480px) {
  .local-music-page {
    padding: 8px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
</style>
