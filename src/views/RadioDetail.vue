<template>
  <div class="radio-detail-page">
    <div v-if="isLoading" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="loadRadioDetail">重试</button>
    </div>

    <div v-else-if="radioDetail" class="radio-detail-content">
      <div class="radio-header">
        <div class="radio-cover-container">
          <img
            :src="radioDetail.picUrl || radioDetail.pic84x84"
            :alt="radioDetail.name"
            class="radio-cover"
          />
        </div>
        <div class="radio-header-info">
          <h1 class="radio-name">{{ radioDetail.name }}</h1>
          <div class="radio-stats">
            <span class="stat-item">
              <span class="stat-value">{{ radioDetail.programCount }}</span>
              <span class="stat-label">节目</span>
            </span>
            <span class="stat-item">
              <span class="stat-value">{{ formatPlayCount(radioDetail.subCount) }}</span>
              <span class="stat-label">订阅</span>
            </span>
          </div>
          <p class="radio-dj">主播: {{ radioDetail.dj?.name || "未知" }}</p>
          <p class="radio-category">分类: {{ radioDetail.category }}</p>
          <p class="radio-brief">{{ radioDetail.description || radioDetail.rcmdText }}</p>
        </div>
      </div>

      <div class="radio-content">
        <div class="content-section">
          <h3 class="section-title">热门节目</h3>
          <div v-if="programs.length === 0" class="empty-section">
            <p class="empty-text">暂无节目</p>
          </div>
          <div v-else class="program-list">
            <div
              v-for="(program, index) in programs"
              :key="program.id"
              class="program-item"
              @click="playProgram(program)"
            >
              <div class="program-index">{{ index + 1 }}</div>
              <div class="program-cover">
                <img :src="program.coverUrl" :alt="program.name" class="cover-img" />
              </div>
              <div class="program-info">
                <div class="program-name" :title="program.name">{{ program.name }}</div>
                <div class="program-desc">{{ program.description || program.copywriter }}</div>
                <div class="program-meta">
                  <span class="program-date">{{ formatDate(program.createTime) }}</span>
                  <span class="program-duration">{{ formatDuration(program.duration) }}</span>
                  <span class="program-plays"
                    >{{ formatPlayCount(program.listenerCount) }}播放</span
                  >
                </div>
              </div>
              <div class="program-actions">
                <button
                  class="download-btn"
                  @click.stop="downloadProgram(program)"
                  title="下载节目"
                >
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
              <div class="program-play-btn">▶</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import { ElMessage } from "element-plus";
import { saveFile } from "@/utils/downloads";
import { useDjRadioDetail, useDjProgram, useDownloadSong } from "@/utils/api";

defineOptions({
  name: "RadioDetailView",
});

const route = useRoute();

const playerStore = usePlayerStore();

const radioDetail = ref(null);
const programs = ref([]);
const isLoading = ref(true);
const error = ref(null);

const loadRadioDetail = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const radioId = Number(route.params.id);
    if (!radioId) {
      throw new Error("电台ID无效");
    }

    const [detailRes, programsRes] = await Promise.all([
      useDjRadioDetail(radioId),
      useDjProgram(radioId, 30, 0),
    ]);

    radioDetail.value = detailRes;
    programs.value = programsRes.programs || [];
  } catch (err) {
    console.error("加载电台详情失败:", err);
    error.value = "加载电台详情失败，请稍后重试";
  } finally {
    isLoading.value = false;
  }
};

const playProgram = (program) => {
  if (program.mainSong) {
    playerStore.play(program.mainSong.id);
  }
};

const downloadProgram = async (program) => {
  try {
    console.log("开始下载节目:", program);

    if (!program.mainSong || !program.mainSong.id) {
      ElMessage.error("该节目没有关联的音频文件，无法下载");
      return;
    }

    ElMessage.info("正在准备下载...");

    const songId = program.mainSong.id;
    // 使用节目名称作为下载后的文件名，如果需要的话
    const songName = program.name;
    const coverUrl = program.coverUrl;

    const result = await useDownloadSong(songId);

    if (!result || !result.url) {
      ElMessage.error("获取节目音频信息失败");
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
    const safeName = (songName || "program").replace(/[\\/:*?"<>|]/g, "_");
    const fileName = `${safeName}-${songId}.mp3`;
    const file = new File([blob], fileName, { type: blob.type || "audio/mpeg" });

    // 注册到 playerStore
    try {
      playerStore.addSongFile(songId, file);
    } catch (e) {
      console.warn("[RadioDetail] 注册 File 失败", e);
    }

    const blobUrl = URL.createObjectURL(file);

    // 保存文件到 IndexedDB
    let base64 = null;
    let storedToIDB = false;
    try {
      await saveFile(String(songId), blob);
      storedToIDB = true;
    } catch (e) {
      console.warn("[RadioDetail] 保存文件到 IndexedDB 失败，尝试回退为 base64:", e);
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
        console.warn("[RadioDetail] 回退转 base64 失败:", e2);
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

    const existingIndex = downloads.findIndex((d) => d.id === String(songId));
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    const downloadRecord = {
      id: String(songId),
      name: songName,
      artist: radioDetail.value?.name || "电台节目",
      cover: coverUrl || "",
      time: timeString,
      url: blobUrl,
      size: file.size,
      stored: storedToIDB,
      base64: base64,
      type: "radio", // 标记为电台
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
      const idx = parsed.likedSongs.findIndex((s) => String(s.id) === String(songId));

      const mappedSong = {
        id: String(songId),
        name: songName,
        artist: radioDetail.value?.name || "电台节目",
        album: radioDetail.value?.category || "电台",
        cover: coverUrl || "",
        duration: formatDuration(program.duration),
        url: blobUrl,
        size: file.size,
        stored: storedToIDB,
        base64: base64,
      };

      if (idx === -1) parsed.likedSongs.unshift(mappedSong);
      else parsed.likedSongs[idx] = { ...parsed.likedSongs[idx], ...mappedSong };

      localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
      try {
        window.dispatchEvent(new Event("qqmusic:music-updated"));
      } catch {
        console.warn("[RadioDetail] 派发 qqmusic:music-updated 事件失败");
      }
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(
          new CustomEvent("qqmusic:download-complete", { detail: { id: songId } })
        );
      }
    } catch (e) {
      console.warn("同步到我的歌曲失败", e);
    }

    ElMessage.success("节目下载完成并保存到本地");
  } catch (error) {
    console.error("下载节目失败:", error);
    ElMessage.error("下载失败，请重试");
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("qqmusic:download-complete", {
          detail: { id: program?.mainSong?.id, error: true },
        })
      );
    }
  }
};

const formatPlayCount = (count) => {
  if (!count) return "0";
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + "亿";
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + "万";
  }
  return count.toString();
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDuration = (milliseconds) => {
  if (!milliseconds) return "";
  const minutes = Math.floor(milliseconds / 1000 / 60);
  const seconds = Math.floor((milliseconds / 1000) % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      loadRadioDetail();
    }
  }
);

onMounted(() => {
  loadRadioDetail();
});
</script>

<style scoped>
.radio-detail-page {
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
  font-size: 16px;
  color: #999;
  text-align: center;
}

.error-text {
  color: #ff4d4f;
}

.retry-btn {
  padding: 10px 24px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  margin: 0 auto;
}

.retry-btn:hover {
  background: #40a9ff;
}

.radio-header {
  display: flex;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #fff 0%, #fff 100%);
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px black;
}

.radio-cover-container {
  flex-shrink: 0;
  width: var(--image-size-xl);
  height: var(--image-size-xl);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.radio-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.radio-header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #333;
}

.radio-name {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.radio-stats {
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

.radio-dj,
.radio-category {
  font-size: 15px;
  opacity: 0.95;
  margin: 0;
}

.radio-brief {
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0;
}

.radio-content {
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

.program-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.program-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f8f8;
}

.program-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

.program-index {
  width: 32px;
  font-size: 16px;
  font-weight: bold;
  color: #999;
  text-align: center;
}

.program-cover {
  width: var(--image-size-sm);
  height: var(--image-size-sm);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.program-cover .cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.program-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.program-desc {
  font-size: 14px;
  color: #666;
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

.program-actions {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.download-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1890ff;
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

.program-item:hover .program-play-btn {
  background: #40a9ff;
  transform: scale(1.1);
}

@media (max-width: var(--breakpoint-md)) {
  .radio-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .radio-stats {
    justify-content: center;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .radio-header {
    padding: 24px;
    gap: 24px;
  }

  .radio-cover-container {
    width: var(--image-size-lg);
    height: var(--image-size-lg);
  }

  .radio-name {
    font-size: 28px;
  }

  .radio-stats {
    gap: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .content-section {
    padding: 20px;
  }

  .program-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .program-cover {
    width: 100%;
    max-width: var(--image-size-lg);
  }

  .program-meta {
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .radio-header {
    padding: 20px;
  }

  .radio-cover-container {
    width: var(--image-size-md);
    height: var(--image-size-md);
  }

  .radio-name {
    font-size: 24px;
  }

  .radio-brief {
    font-size: 14px;
  }

  .program-item {
    padding: 10px 12px;
  }
}
</style>
