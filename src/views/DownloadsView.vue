<template>
  <div class="downloads-view">
    <h2 class="page-title">本地和下载</h2>

    <el-tabs v-model="activeTab">
      <!-- 已下载 -->
      <el-tab-pane :label="`下载歌曲(${downloadedSongs.length})`" name="downloaded">
        <div v-if="downloadedSongs.length === 0" class="empty">
          <div class="empty-title">暂无下载歌曲</div>
        </div>
        <div v-else class="list">
          <div
            v-for="song in downloadedSongs"
            :key="song.id"
            class="download-row"
            :class="{ playing: isPlayingSong(song) }"
            @click="play(song)"
          >
            <!-- 和 profile 页面完全一样的结构 -->
            <div class="song-cell">
              <img class="cover" :src="song.cover" alt="" />
              <div class="meta2">
                <div class="title">
                  {{ song.name }}
                  <span v-if="isPlayingSong(song)" class="playing-indicator">●</span>
                </div>
                <div class="sub">{{ song.artist }} · {{ song.time }}</div>
              </div>
            </div>

            <div class="row-actions">
              <el-button text size="small" @click.stop="deleteSong(song)"> 删除 </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 正在下载（显示进度） -->
      <el-tab-pane :label="`正在下载(${Object.keys(activeDownloads).length})`" name="downloading">
        <div v-if="Object.keys(activeDownloads).length === 0" class="empty">
          <div class="empty-title">暂无正在下载</div>
        </div>
        <div v-else class="list">
          <div v-for="d in Object.values(activeDownloads)" :key="d.id" class="download-row">
            <div class="song-cell">
              <div class="meta2">
                <div class="title">下载中：{{ d.id }}</div>
                <div class="sub">
                  已下载：{{
                    d.progress
                      ? d.progress + "%"
                      : d.received
                      ? Math.round((d.received / 1024 / 1024) * 100) / 100 + " MB"
                      : ""
                  }}
                </div>
              </div>
            </div>
            <div class="row-actions">
              <el-progress
                :percentage="d.progress || 0"
                :status="d.progress === 100 ? 'success' : 'active'"
                style="width: 200px"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
defineOptions({ name: "DownloadsView" });

import { ref, onMounted, onBeforeUnmount } from "vue";
import { usePlayerStore } from "@/stores/player";
import { getFile } from "@/utils/downloads";

const activeTab = ref("downloaded");

const playerStore = usePlayerStore();

const downloadedSongs = ref([]);

const loadDownloadedSongs = async () => {
  const DOWNLOADS_KEY = "qqmusic_downloads_v1";
  try {
    const savedDownloads = localStorage.getItem(DOWNLOADS_KEY);
    if (savedDownloads) {
      downloadedSongs.value = JSON.parse(savedDownloads);

      // 尝试恢复已保存的文件（优先从 IndexedDB 读取，其次回退到 base64）
      for (const s of downloadedSongs.value) {
        try {
          // 仅当 playerStore 中没有此文件时进行注册
          const hasSongFile = (() => {
            try {
              const sf = playerStore.songFiles;
              if (!sf) return false;
              if (sf instanceof Map) return sf.has(s.id);
              if (sf && sf.value instanceof Map) return sf.value.has(s.id);
              return false;
            } catch {
              return false;
            }
          })();

          if (hasSongFile) continue;

          // 优先从 IndexedDB 读取文件
          if (s && s.stored) {
            try {
              const blob = await getFile(s.id);
              if (blob) {
                const file = new File([blob], `${s.name}-${s.id}.mp3`, {
                  type: blob.type || "audio/mpeg",
                });
                playerStore.addSongFile(s.id, file);
                continue;
              }
            } catch (e) {
              console.warn("从 IndexedDB 恢复文件失败:", s.id, e);
            }
          }

          // 回退：如果仍有 base64 则使用 base64 恢复
          if (s && s.base64) {
            try {
              const res = await fetch(s.base64);
              const blob = await res.blob();
              const file = new File([blob], `${s.name}-${s.id}.mp3`, {
                type: blob.type || "audio/mpeg",
              });
              playerStore.addSongFile(s.id, file);
            } catch (e) {
              console.warn("使用 base64 恢复下载文件失败:", s.id, e);
            }
          }
        } catch (e) {
          console.warn("恢复下载文件失败:", s.id, e);
        }
      }
    }
  } catch (error) {
    console.error("读取下载记录失败:", error);
    downloadedSongs.value = [];
  }
};

onMounted(() => {
  loadDownloadedSongs();

  // 监听下载进度与完成事件，实时更新 UI
  window.addEventListener("qqmusic:download-progress", handleDownloadProgress);
  window.addEventListener("qqmusic:download-complete", handleDownloadComplete);
});

onBeforeUnmount(() => {
  window.removeEventListener("qqmusic:download-progress", handleDownloadProgress);
  window.removeEventListener("qqmusic:download-complete", handleDownloadComplete);
});

function play(song) {
  // 将下载的歌曲转换为适合播放的格式
  const localSong = {
    id: parseInt(song.id),
    name: song.name,
    artist: song.artist,
    cover: song.cover,
    blobUrl: song.url, // 使用下载的url作为blobUrl
  };

  // 如果有 base64 且 playerStore 尚未注册文件，尝试注册
  try {
    // 兼容 playerStore.songFiles 为 Map 或 Ref<Map>
    const hasSongFile = (() => {
      try {
        const sf = playerStore.songFiles;
        if (!sf) return false;
        if (sf instanceof Map) return sf.has(song.id);
        if (sf && sf.value instanceof Map) return sf.value.has(song.id);
        return false;
      } catch {
        return false;
      }
    })();

    if (song.base64 && !hasSongFile) {
      fetch(song.base64)
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], `${song.name}-${song.id}.mp3`, {
            type: blob.type || "audio/mpeg",
          });
          playerStore.addSongFile(song.id, file);
        })
        .catch((e) => console.warn("注册下载文件失败:", e));
    }
  } catch (e) {
    console.warn("处理本地播放注册失败", e);
  }

  // 清空当前播放列表，只播放这首歌
  playerStore.pushPlayList(true, localSong);

  // 播放歌曲
  playerStore.playLocalSong(localSong);
}

function isPlayingSong(song) {
  return playerStore.id === song.id;
}

function deleteSong(song) {
  if (!confirm(`确定要删除《${song.name}》吗？`)) {
    return;
  }

  const DOWNLOADS_KEY = "qqmusic_downloads_v1";
  const index = downloadedSongs.value.findIndex((s) => s.id === song.id);

  if (index !== -1) {
    downloadedSongs.value.splice(index, 1);
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloadedSongs.value));
  }
}

// Active downloads map
const activeDownloads = ref({});

function handleDownloadProgress(e) {
  const d = e && e.detail ? e.detail : null;
  if (!d || !d.id) return;
  activeDownloads.value = {
    ...activeDownloads.value,
    [d.id]: { id: d.id, progress: d.progress, received: d.received, total: d.total },
  };
}

function handleDownloadComplete(e) {
  const d = e && e.detail ? e.detail : null;
  if (!d || !d.id) return;
  // 移除活动下载
  const copy = { ...activeDownloads.value };
  delete copy[d.id];
  activeDownloads.value = copy;
  // 重新加载下载列表
  loadDownloadedSongs();
}
</script>

<style scoped>
.downloads-view {
  padding: 16px 20px;
}

.profile-nav {
  margin-bottom: 10px;
  margin-top: -10px;
}

.page-title {
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 12px;
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
}

/* 单行（和 profile 表格一行一样） */
.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 6px;
  border-radius: 6px;
}

.download-row:hover {
  background: #f9fafb;
}

/* 当前播放歌曲高亮 */
.download-row.playing {
  background: #f0f8ff;
  border-left: 3px solid #1890ff;
}

/* 播放指示器样式 */
.playing-indicator {
  color: #1890ff;
  font-size: 12px;
  margin-left: 6px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* song-cell：完全复用你 profile 页 */
.song-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  background: #eee;
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

/* hover 操作区（和 profile 一样） */
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

/* 空状态 */
.empty {
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-icon {
  font-size: 56px;
}

.empty-title {
  font-size: 16px;
  color: #666;
}

:deep(.el-tabs__item) {
  font-size: 16px;
}
</style>
