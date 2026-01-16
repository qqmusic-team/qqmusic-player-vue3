<template>
  <div class="artist-detail-page">
    <div v-if="isLoading" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="loadArtistDetail">重试</button>
    </div>

    <div v-else-if="artistDetail" class="artist-detail-content">
      <div class="artist-header">
        <div class="artist-cover-container">
          <img
            :src="artistDetail.artist.cover || artistDetail.artist.picUrl"
            :alt="artistDetail.artist.name"
            class="artist-cover"
          />
        </div>
        <div class="artist-header-info">
          <h1 class="artist-name">{{ artistDetail.artist.name }}</h1>
          <div class="artist-stats">
            <span class="stat-item">
              <span class="stat-value">{{ artistDetail.artist.albumSize }}</span>
              <span class="stat-label">专辑</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">{{ artistDetail.artist.musicSize }}</span>
              <span class="stat-label">歌曲</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">{{ artistDetail.artist.mvSize }}</span>
              <span class="stat-label">MV</span>
            </span>
          </div>
          <p class="artist-brief">{{ artistDetail.artist.briefDesc }}</p>
        </div>
      </div>

      <div class="artist-content">
        <div class="content-section">
          <h3 class="section-title">热门歌曲</h3>
          <div v-if="hotSongs.length === 0" class="empty-section">
            <p class="empty-text">暂无热门歌曲</p>
          </div>
          <div v-else class="song-list">
            <div
              v-for="(song, index) in hotSongs"
              :key="song.id"
              class="song-item"
              :class="{ active: song.id === currentSong?.id }"
              @click="playSong(song)"
            >
              <div class="song-index">{{ index + 1 }}</div>
              <div class="song-info">
                <div class="song-name" :title="song.name">{{ song.name }}</div>
                <div class="song-artists">
                  {{ song.ar?.map((a) => a.name).join(", ") }}
                </div>
              </div>
              <div class="song-duration">{{ formatDuration(song.dt) }}</div>
              <div class="song-actions">
                <button class="download-btn" @click.stop="downloadSong(song)" title="下载">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor" />
                    <path d="M4 18H20V20H4V18Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="content-section">
          <h3 class="section-title">专辑</h3>
          <div v-if="albums.length === 0" class="empty-section">
            <p class="empty-text">暂无专辑</p>
          </div>
          <div v-else class="album-grid">
            <div
              v-for="album in albums"
              :key="album.id"
              class="album-card"
              @click="goToAlbum(album.id)"
            >
              <div class="album-cover-container">
                <img :src="album.picUrl" :alt="album.name" class="album-cover" loading="lazy" />
              </div>
              <div class="album-info">
                <div class="album-name" :title="album.name">{{ album.name }}</div>
                <div class="album-time">{{ formatTime(album.publishTime) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="artistDesc" class="content-section">
          <h3 class="section-title">歌手简介</h3>
          <div class="artist-description">
            <p v-if="artistDesc.briefDesc" class="desc-text">
              {{ artistDesc.briefDesc }}
            </p>
            <div
              v-if="artistDesc.introduction && artistDesc.introduction.length > 0"
              class="introduction-list"
            >
              <div
                v-for="(intro, index) in artistDesc.introduction"
                :key="index"
                class="introduction-item"
              >
                <h4 v-if="intro.ti" class="intro-title">{{ intro.ti }}</h4>
                <p class="intro-text">{{ intro.txt }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { ElMessage } from "element-plus";
import { saveFile } from "@/utils/downloads";
import {
  useArtistDetail,
  useArtistDesc,
  useArtistTopSongs,
  useArtistAlbum,
  useDownloadSong,
} from "@/utils/api";

defineOptions({
  name: "ArtistDetailView",
});

const route = useRoute();
const router = useRouter();

const playerStore = usePlayerStore();

const artistDetail = ref(null);
const artistDesc = ref(null);
const hotSongs = ref([]);
const albums = ref([]);
const isLoading = ref(true);
const error = ref(null);

const currentSong = computed(() => playerStore.currentSong);

const loadArtistDetail = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const artistId = Number(route.params.id);
    if (!artistId) {
      throw new Error("歌手ID无效");
    }

    const [detailRes, descRes, songsRes, albumsRes] = await Promise.all([
      useArtistDetail(artistId),
      useArtistDesc(artistId),
      useArtistTopSongs(artistId),
      useArtistAlbum(artistId, 10),
    ]);

    artistDetail.value = detailRes;
    artistDesc.value = descRes;
    hotSongs.value = songsRes.songs || [];
    albums.value = albumsRes.hotAlbums || [];
  } catch (err) {
    console.error("加载歌手详情失败:", err);
    error.value = "加载歌手详情失败，请稍后重试";
  } finally {
    isLoading.value = false;
  }
};

const downloadSong = async (song) => {
  try {
    console.log("开始下载歌曲:", song);

    if (!song.id) {
      ElMessage.error("歌曲ID无效，无法下载");
      return;
    }

    ElMessage.info("正在准备下载...");

    const songId = typeof song.id === "string" ? parseInt(song.id) : song.id;
    const result = await useDownloadSong(songId);

    if (!result || !result.song || !result.url) {
      ElMessage.error("获取歌曲信息失败");
      return;
    }

    // 开始流式下载
    const downloadUrl = result.url;
    let resp;
    try {
      resp = await fetch(downloadUrl);
      if (!resp.ok) throw new Error("下载请求失败");
    } catch (e) {
      console.error("下载请求失败:", e);
      ElMessage.error("下载请求失败，请重试");
      return;
    }

    const contentLengthHeader =
      resp.headers.get("Content-Length") || resp.headers.get("content-length");
    const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
    const reader = resp.body && resp.body.getReader ? resp.body.getReader() : null;

    const chunks = [];
    let received = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length || value.byteLength || 0;
        const progress = total ? Math.round((received / total) * 100) : null;
        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
          window.dispatchEvent(
            new CustomEvent("qqmusic:download-progress", {
              detail: { id: songId, progress, received, total },
            })
          );
        }
      }
    } else {
      const blob = await resp.blob();
      chunks.push(new Uint8Array(await blob.arrayBuffer()));
      received = blob.size;
    }

    const blob = new Blob(chunks, { type: resp.headers.get("Content-Type") || "audio/mpeg" });
    const safeName = (
      result.song && result.song.name ? result.song.name : song.name || "song"
    ).replace(/[\\/:*?"<>|]/g, "_");
    const fileName = `${safeName}-${songId}.mp3`;
    const file = new File([blob], fileName, { type: blob.type || "audio/mpeg" });

    // 注册到 playerStore
    try {
      playerStore.addSongFile(songId, file);
    } catch (e) {
      console.warn("[ArtistDetail] 注册 File 失败", e);
    }

    const blobUrl = URL.createObjectURL(file);

    // 保存文件到 IndexedDB（避免占用 localStorage），若失败则回退为 base64
    let base64 = null;
    let storedToIDB = false;
    try {
      await saveFile(String(song.id), blob);
      storedToIDB = true;
    } catch (e) {
      console.warn("[ArtistDetail] 保存文件到 IndexedDB 失败，尝试回退为 base64:", e);
      // 回退：转 base64（兼容旧版本）
      try {
        const fileToBase64 = (f) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(f);
          });
        base64 = await fileToBase64(file);
      } catch (e2) {
        console.warn("[ArtistDetail] 回退转 base64 失败:", e2);
      }
    }

    const DOWNLOADS_KEY = "qqmusic_downloads_v1";
    let downloads = [];

    try {
      const savedDownloads = localStorage.getItem(DOWNLOADS_KEY);
      if (savedDownloads) downloads = JSON.parse(savedDownloads);
    } catch (error) {
      console.error("读取下载记录失败:", error);
      downloads = [];
    }

    const existingIndex = downloads.findIndex((d) => d.id === String(song.id));
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    const downloadRecord = {
      id: String(song.id),
      name: result.song.name || song.name,
      artist:
        result.song.ar?.map((a) => a.name).join("/") ||
        song.ar?.map((a) => a.name).join("/") ||
        "未知歌手",
      cover: result.song.al?.picUrl || song.al?.picUrl || "",
      time: timeString,
      url: blobUrl,
      size: file.size,
      stored: storedToIDB,
      base64: base64, // 仅在回退场景下存在
    };

    if (existingIndex !== -1) downloads[existingIndex] = downloadRecord;
    else downloads.unshift(downloadRecord);
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));

    // 同步到我的歌曲并派发事件
    try {
      const MUSIC_KEY = "qqmusic_profile_music_v1";
      const saved = localStorage.getItem(MUSIC_KEY);
      const parsed = saved ? JSON.parse(saved) : { playlists: [], likedSongs: [] };
      parsed.likedSongs = parsed.likedSongs || [];
      const idx = parsed.likedSongs.findIndex((s) => String(s.id) === String(song.id));
      const mappedSong = {
        id: String(song.id),
        name: result.song.name || song.name,
        artist: result.song.ar?.map((a) => a.name).join("/") || "",
        album: result.song.al?.name || "",
        cover: result.song.al?.picUrl || "",
        duration: result.song.dt
          ? `${Math.floor(result.song.dt / 60000)}:${String(
              Math.floor((result.song.dt % 60000) / 1000)
            ).padStart(2, "0")}`
          : song.duration || "3:30",
        url: blobUrl,
        size: file.size,
        stored: storedToIDB,
        base64: base64, // 仅回退时存在
      };
      if (idx === -1) parsed.likedSongs.unshift(mappedSong);
      else parsed.likedSongs[idx] = { ...parsed.likedSongs[idx], ...mappedSong };
      localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
      try {
        window.dispatchEvent(new Event("qqmusic:music-updated"));
      } catch {
        console.warn("[ArtistDetail] 派发 qqmusic:music-updated 事件失败");
      }
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(
          new CustomEvent("qqmusic:download-complete", { detail: { id: songId } })
        );
      }
    } catch (e) {
      console.warn("同步到我的歌曲失败", e);
    }

    ElMessage.success("下载完成并保存到本地");
  } catch (error) {
    console.error("下载歌曲失败:", error);
    ElMessage.error("下载失败，请重试");
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("qqmusic:download-complete", {
          detail: { id: song && song.id, error: true },
        })
      );
    }
  }
};

const playSong = (song) => {
  playerStore.play(song.id);
};

const goToAlbum = (albumId) => {
  console.log("跳转到专辑详情页", albumId);
  router.push({
    path: `/playlist/${albumId}`,
    query: { type: "album" },
  });
};

const formatDuration = (dt) => {
  if (!dt) return "";
  const minutes = Math.floor(dt / 60000);
  const seconds = Math.floor((dt % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;
};

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadArtistDetail();
    }
  }
);

onMounted(() => {
  loadArtistDetail();
});
</script>
<style scoped>
.artist-detail-page {
  padding: 20px 0;
  min-height: 100vh;
}

.loading-container,
.error-container {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}
.error-container {
  display: flex;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text,
.error-text {
  text-align: center;
  font-size: 16px;
  color: #999;
}

.error-text {
  color: #ff4d4f;
}

.retry-btn {
  margin: 0 auto;
  padding: 10px 24px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.retry-btn:hover {
  background: #40a9ff;
}

.artist-header {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(135deg, white 0%, white 100%);
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.artist-cover-container {
  flex-shrink: 0;
  width: var(--image-size-xl);
  height: var(--image-size-xl);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  box-shadow: 0 8px 24px black;
}

.artist-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #333;
}

.artist-name {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.artist-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.artist-brief {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0;
}

.artist-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.empty-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.song-list {
  display: flex;
  flex-direction: column;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.song-item:hover {
  background: #f5f5f5;
}

.song-item.active {
  background: #e6f7ff;
}

.song-index {
  width: 32px;
  font-size: 16px;
  font-weight: bold;
  color: #999;
  text-align: center;
}

.song-item.active .song-index {
  color: #1890ff;
}

.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item.active .song-name {
  color: #1890ff;
}

.song-artists {
  font-size: 13px;
  color: #999;
}

.song-duration {
  font-size: 13px;
  color: #999;
}

.song-actions {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.download-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.download-btn:hover {
  color: #1890ff;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.album-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-cover-container {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  width: 200px;
  height: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-cover {
  transform: scale(1.05);
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.album-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-time {
  font-size: 12px;
  color: #999;
}

.artist-description {
  line-height: 1.8;
  color: #666;
}

.desc-text {
  font-size: 15px;
  margin: 0 0 20px 0;
}

.introduction-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.introduction-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intro-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.intro-text {
  font-size: 15px;
  color: #666;
  margin: 0;
  line-height: 1.8;
}

@media (max-width: var(--breakpoint-md)) {
  .artist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .artist-stats {
    justify-content: center;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .artist-header {
    padding: 24px;
    gap: 24px;
  }

  .artist-cover-container {
    width: var(--image-size-lg);
    height: var(--image-size-lg);
  }

  .artist-name {
    font-size: 28px;
  }

  .artist-stats {
    gap: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .content-section {
    padding: 20px;
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .artist-header {
    padding: 20px;
  }

  .artist-cover-container {
    width: var(--image-size-md);
    height: var(--image-size-md);
  }

  .artist-name {
    font-size: 24px;
  }

  .artist-brief {
    font-size: 14px;
  }

  .song-item {
    padding: 10px 12px;
  }
}
</style>
