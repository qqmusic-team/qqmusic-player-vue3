<template>
  <div class="playlist-detail">
    <div v-if="loading" class="loading-container">
      <div v-loading="true" element-loading-text="加载中..."></div>
    </div>

    <div v-else-if="playlistDetail" class="playlist-content">
      <!-- 歌单头部信息 -->
      <div class="playlist-header">
        <img class="playlist-cover" :src="playlistDetail.coverImgUrl" alt="歌单封面" />
        <div class="playlist-info">
          <div class="playlist-type">歌单</div>
          <h1 class="playlist-name">{{ playlistDetail.name }}</h1>
          <div class="playlist-desc">{{ playlistDetail.description }}</div>
          <div class="playlist-stats">
            <span class="stat-item">
              <i class="icon-user"></i>
              <span>{{ playlistDetail.creator.nickname }}</span>
            </span>
            <span class="stat-item">
              <i class="icon-play"></i>
              <span>{{ formatNumber(playlistDetail.playCount) }}</span>
            </span>
            <span class="stat-item">
              <i class="icon-collect"></i>
              <span>{{ formatNumber(playlistDetail.subscribedCount) }}</span>
            </span>
          </div>
          <div class="playlist-actions">
            <button class="btn-primary" @click="playAll">
              <i class="icon-play-all"></i>
              播放全部
            </button>
            <button class="btn-secondary" @click="createPlaylistFromCurrent">
              <i class="icon-playlist-add"></i>
              添加到歌单
            </button>
            <button
              v-if="playlistId && playlistId.toString().startsWith('pl_')"
              class="btn-add"
              @click="openAddSongDialog"
            >
              <i class="icon-plus"></i>
              添加歌曲
            </button>
          </div>
        </div>
      </div>

      <!-- 歌单歌曲列表 -->
      <div class="song-list">
        <div class="list-header">
          <div class="list-title">歌曲列表</div>
          <div class="list-count">(共 {{ playlistDetail.trackCount }} 首)</div>
        </div>
        <div class="songs-container">
          <template v-if="playlistDetail.tracks && playlistDetail.tracks.length > 0">
            <div
              v-for="(song, index) in playlistDetail.tracks"
              :key="song.id"
              class="song-item"
              @click="playSong(song, index)"
            >
              <div class="song-index">{{ index + 1 }}</div>
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ formatArtists(song.ar) }}</div>
              </div>
              <div class="song-album">{{ song.al?.name || "" }}</div>
              <div class="song-duration">{{ formatDuration(song.dt) }}</div>
              <div class="song-actions">
                <button
                  v-if="playingSongIds.has(Number(song.id))"
                  class="song-loading-indicator"
                  aria-hidden
                >
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </button>
                <template v-else>
                  <button
                    class="action-btn"
                    @click.stop="addToList(song)"
                    :disabled="addingSongs"
                    :title="addingSongs ? '添加中...' : '添加到我的歌单'"
                  >
                    <i class="icon-add"></i>
                  </button>
                  <button class="download-btn" @click.stop="downloadSong(song)">
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
                </template>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="empty-tip">当前暂无可显示的歌曲（可能正在加载或歌单为空）</div>
            <div style="margin-top: 8px">
              <button class="btn-primary" @click="loadPlaylistDetail">重新加载歌曲</button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <div class="error-icon"></div>
      <div class="error-text">{{ loadErrorMessage || "加载歌单详情失败，请稍后重试" }}</div>
      <div style="margin-top: 8px; display: flex; gap: 10px">
        <button class="btn-primary" @click="loadPlaylistDetail">重新加载</button>
        <button
          v-if="loadErrorMessage && loadErrorMessage.includes('验证')"
          class="btn-secondary"
          @click="
            () => {
              /* 可提供打开验证页逻辑 */
            }
          "
        >
          去验证
        </button>
      </div>
    </div>

    <el-dialog
      v-model="addSongDialogVisible"
      title="添加歌曲到歌单"
      width="600px"
      class="add-song-dialog"
    >
      <div class="dialog-content">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索歌曲"
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
        <div class="song-selection-list">
          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="song-selection-item"
            :class="{ selected: isSongSelected(song.id) }"
            @click="toggleSongSelection(song)"
          >
            <div class="song-selection-info">
              <div class="song-selection-name">{{ song.name }}</div>
              <div class="song-selection-artist">{{ song.artist }}</div>
            </div>
            <div class="song-selection-check">
              <el-checkbox :model-value="isSongSelected(song.id)" />
            </div>
          </div>
          <div v-if="filteredSongs.length === 0" class="empty-tip">没有找到相关歌曲</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <span class="selected-count">已选择 {{ selectedSongs.length }} 首歌曲</span>
          <el-button @click="addSongDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddSongs" :disabled="selectedSongs.length === 0">
            确定添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="addToPlaylistDialogVisible"
      title="添加到我的歌单"
      width="500px"
      class="add-to-playlist-dialog"
    >
      <div class="dialog-content">
        <div class="playlist-info-text">将《{{ playlistDetail?.name }}》中的歌曲添加到：</div>
        <div class="target-playlist-list">
          <div
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            class="target-playlist-item"
            :class="{ selected: selectedTargetPlaylistId === playlist.id }"
            @click="selectTargetPlaylist(playlist)"
          >
            <img
              class="target-playlist-cover"
              :src="playlist.cover || 'https://via.placeholder.com/60x60.png?text=%E2%99%AA'"
              alt=""
            />
            <div class="target-playlist-info">
              <div class="target-playlist-name">{{ playlist.name }}</div>
              <div class="target-playlist-count">{{ playlist.tracks?.length || 0 }} 首歌曲</div>
            </div>
            <div class="target-playlist-check">
              <el-checkbox :model-value="selectedTargetPlaylistId === playlist.id" />
            </div>
          </div>
          <div v-if="userPlaylists.length === 0" class="empty-playlists">
            暂无歌单，请先创建歌单
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addToPlaylistDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmAddToPlaylist"
            :disabled="!selectedTargetPlaylistId || userPlaylists.length === 0"
          >
            确定添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加单曲到现有歌单的对话框 -->
    <el-dialog
      v-model="addToExistingPlaylistDialogVisible"
      title="添加到现有歌单"
      width="500px"
      class="add-to-playlist-dialog"
    >
      <div class="dialog-content">
        <div class="playlist-info-text">将歌曲《{{ selectedSongForAdding?.name }}》添加到：</div>
        <div class="target-playlist-list">
          <div
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            class="target-playlist-item"
            :class="{ selected: selectedPlaylistForAdding?.id === playlist.id }"
            @click="selectPlaylistForAdding(playlist)"
          >
            <img
              class="target-playlist-cover"
              :src="playlist.cover || 'https://via.placeholder.com/60x60.png?text=%E2%99%AA'"
              alt=""
            />
            <div class="target-playlist-info">
              <div class="target-playlist-name">{{ playlist.name }}</div>
              <div class="target-playlist-count">{{ playlist.tracks?.length || 0 }} 首歌曲</div>
            </div>
            <div class="target-playlist-check">
              <el-checkbox :model-value="selectedPlaylistForAdding?.id === playlist.id" />
            </div>
          </div>
          <div v-if="userPlaylists.length === 0" class="empty-playlists">
            暂无歌单，请先创建歌单
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addToExistingPlaylistDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmAddToExistingPlaylist"
            :disabled="!selectedPlaylistForAdding || userPlaylists.length === 0"
          >
            确定添加
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({ name: "PlaylistDetailView" });

import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRoute } from "vue-router";
import { usePlayListDetail, useDownloadSong, useSongUrl } from "@/utils/api";
import { saveFile } from "@/utils/downloads";
import { useNumberFormat } from "@/utils/number";
import { usePlayerStore } from "@/stores/player";

const route = useRoute();

const loading = ref(false);
const playlistDetail = ref(null);
const loadErrorMessage = ref("");

// 添加歌曲相关状态
const addSongDialogVisible = ref(false);
const searchKeyword = ref("");
const selectedSongs = ref([]);
const allAvailableSongs = ref([]);

// 添加到我的歌单相关状态
const addToPlaylistDialogVisible = ref(false);
const userPlaylists = ref([]);
const selectedTargetPlaylistId = ref(null);
const addingSongs = ref(false);

// 使用在线示例图片作为封面（避免缺失本地资源）
const img1 = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=200&q=80';
const img2 = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';
const img3 = 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=200&q=80';
const img4 = 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=200&q=80';
const img5 = 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=200&q=80';

// 获取歌单ID
const playlistId = computed(() => route.params.id);

// 点击节流与预取
const playingSongIds = ref(new Set());
const prefetchedSongIds = ref(new Set());
const prefetchPlaylistSongUrls = async (ids = []) => {
  const toFetch = ids.filter((id) => id && !prefetchedSongIds.value.has(id)).slice(0, 3);
  if (toFetch.length === 0) return;
  toFetch.forEach((id) => prefetchedSongIds.value.add(id));
  try {
    await Promise.all(
      toFetch.map(async (id) => {
        try {
          await useSongUrl(Number(id));
          console.log("[PlaylistDetail] 预取 songUrl 成功", id);
        } catch (e) {
          console.warn("[PlaylistDetail] 预取失败", id, e);
        }
      })
    );
  } catch (e) {
    console.warn("[PlaylistDetail] 预取发生错误", e);
  }
};

// 歌单缓存配置（6 小时）
const PLAYLIST_CACHE_TTL = 1000 * 60 * 60 * 6;
const playlistCacheKey = (id) => `playlist_cache_${id}`;
const readPlaylistCache = (id) => {
  try {
    const raw = localStorage.getItem(playlistCacheKey(id));
    if (!raw) {
      console.log("[PlaylistDetail] 未命中缓存", id);
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts) {
      console.log("[PlaylistDetail] 缓存格式异常", id, parsed);
      return null;
    }
    if (Date.now() - parsed.ts > PLAYLIST_CACHE_TTL) {
      console.log("[PlaylistDetail] 缓存已过期", id);
      return null;
    }
    console.log(
      "[PlaylistDetail] 读取缓存成功",
      id,
      "tracksLength=",
      (parsed.data && parsed.data.length) || 0
    );
    return parsed.data;
  } catch (e) {
    console.warn("[PlaylistDetail] 读取缓存失败", e);
    return null;
  }
};
const writePlaylistCache = (id, data) => {
  try {
    localStorage.setItem(playlistCacheKey(id), JSON.stringify({ ts: Date.now(), data }));
    console.log("[PlaylistDetail] 写入缓存成功", id, "tracksLength=", (data && data.length) || 0);
  } catch (e) {
    console.warn("[PlaylistDetail] 写入缓存失败", e);
  }
};

// 播放器 store
const playerStore = usePlayerStore();

// 格式化数字
const formatNumber = useNumberFormat;

// 格式化歌手名称
const formatArtists = (artists) => {
  if (!artists) return "";
  return artists.map((ar) => ar.name).join(", ");
};

// 格式化时长
const formatDuration = (ms) => {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// 加载歌单详情（支持缓存加速与超时回退），重构为可复用的 loadPlaylist(id)
const loadPlaylist = async (idParam) => {
  const id = idParam || playlistId.value;
  if (!id) return;

  loading.value = true;

  try {
    console.log("========== 开始加载歌单详情 ==========", id);

    // 如果是本地类型（liked 或 pl_ 开头），按原逻辑处理（无需远端缓存）
    if (id === "liked" || (id && id.toString().startsWith("pl_"))) {
      // 若是本地类型，使用原有逻辑（不使用远端缓存）
      if (id === "liked") {
        console.log("加载我喜欢的音乐（本地）");
        const MUSIC_KEY = "qqmusic_profile_music_v1";
        const savedMusic = localStorage.getItem(MUSIC_KEY);

        if (!savedMusic) {
          console.warn("localStorage 中没有找到音乐数据");
          playlistDetail.value = {
            id: "liked",
            name: "我喜欢的音乐",
            coverImgUrl: "https://via.placeholder.com/200x200.png?text=%E2%99%AA",
            description: "我收藏的所有喜欢的歌曲",
            creator: { nickname: "我" },
            playCount: 0,
            subscribedCount: 0,
            trackCount: 0,
            tracks: [],
          };
          loading.value = false;
          return;
        }

        let parsedMusic;
        try {
          parsedMusic = JSON.parse(savedMusic);
        } catch (parseError) {
          console.error("解析 localStorage 数据失败:", parseError);
          ElMessage.error("数据解析失败，请清除缓存后重试");
          loading.value = false;
          return;
        }

        const likedSongs = parsedMusic.likedSongs || [];
        playlistDetail.value = {
          id: "liked",
          name: "我喜欢的音乐",
          coverImgUrl:
            likedSongs.length > 0 && likedSongs[0].cover
              ? likedSongs[0].cover
              : "https://via.placeholder.com/200x200.png?text=%E2%99%AA",
          description: "我收藏的所有喜欢的歌曲",
          creator: { nickname: "我" },
          playCount: parsedMusic.likedPlayCount || 0,
          subscribedCount: 0,
          trackCount: likedSongs.length,
          tracks: likedSongs.map((song, index) => ({
            id: song.id || `liked_${index}`,
            name: song.name,
            ar: [{ name: song.artist }],
            al: { name: song.album },
            dt: song.duration
              ? parseInt(song.duration.split(":")[0]) * 60000 +
                parseInt(song.duration.split(":")[1]) * 1000
              : 0,
          })),
        };
        loading.value = false;
        console.log("我喜欢的音乐加载完成（本地）");
        return;
      }

      // pl_ 用户歌单分支
      console.log("加载用户创建的歌单（本地）");
      const MUSIC_KEY = "qqmusic_profile_music_v1";
      const savedMusic = localStorage.getItem(MUSIC_KEY);

      if (!savedMusic) {
        console.warn("localStorage 中没有找到音乐数据");
        ElMessage.error("未找到歌单数据，请先创建歌单");
        loading.value = false;
        return;
      }

      let parsedMusic;
      try {
        parsedMusic = JSON.parse(savedMusic);
      } catch (parseError) {
        console.error("解析 localStorage 数据失败:", parseError);
        ElMessage.error("数据解析失败，请清除缓存后重试");
        loading.value = false;
        return;
      }

      const playlists = parsedMusic.playlists || [];
      const playlist = playlists.find((pl) => String(pl.id) === String(id));

      if (!playlist) {
        console.error(
          "歌单不存在，可用的歌单ID:",
          playlists.map((p) => p.id)
        );
        ElMessage.error(`歌单不存在（ID: ${id}）`);
        loading.value = false;
        return;
      }

      if (!playlist.tracks || !Array.isArray(playlist.tracks)) {
        playlist.tracks = [];
      }

      playlistDetail.value = {
        id: playlist.id,
        name: playlist.name,
        coverImgUrl: playlist.cover || "https://via.placeholder.com/200x200.png?text=%E2%99%AA",
        description: `创建者：${playlist.creator}`,
        creator: { nickname: playlist.creator || "我" },
        playCount: 0,
        subscribedCount: 0,
        trackCount: playlist.tracks.length,
        tracks: playlist.tracks.map((song, index) => ({
          id: song.id || `${playlist.id}_${index}`,
          name: song.name,
          ar: [{ name: song.artist }],
          al: { name: song.album },
          dt: song.duration
            ? parseInt(song.duration.split(":")[0]) * 60000 +
              parseInt(song.duration.split(":")[1]) * 1000
            : 0,
        })),
      };

      loading.value = false;
      console.log("用户歌单加载成功（本地）");
      return;
    }

    // 非本地歌单：尝试从缓存中快速显示
    const cached = readPlaylistCache(id);
    if (cached) {
      console.log("使用缓存快速渲染歌单详情", id);
      playlistDetail.value = {
        id,
        name: id,
        coverImgUrl: "",
        description: "",
        creator: { nickname: "" },
        playCount: 0,
        subscribedCount: 0,
        trackCount: (cached && cached.length) || 0,
        tracks: cached,
      };
      // 只有在缓存里有真实数据时才认为渲染完成
      if (Array.isArray(cached) && cached.length > 0) {
        loading.value = false;
      } else {
        console.log("[PlaylistDetail] 缓存为空，占位模式，保持 loading，等待远端数据", id);
      }
    }

    // 从 API 拉取数据，使用重试与超时避免长时间卡住
    console.log("从 API 加载歌单（远端）", id);

    // helper: attempt with timeout
    const attemptFetch = (timeoutMs) =>
      Promise.race([
        usePlayListDetail(Number(id)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
      ]);

    let data = null;
    let lastError = null;

    // 第一次尝试（8s），失败后再尝试一次（12s）
    for (const t of [8000, 12000]) {
      try {
        data = await attemptFetch(t);
        break;
      } catch (err) {
        console.warn(`[PlaylistDetail] load attempt failed (timeout=${t}):`, err);
        lastError = err;

        // 如果服务端要求安全验证（-462），err 可能是对象且包含 code
        const code =
          err && err.code
            ? err.code
            : err && err.response && err.response.data && err.response.data.code
            ? err.response.data.code
            : null;
        const verifyUrl =
          err && err.verifyUrl
            ? err.verifyUrl
            : err && err.verify_url
            ? err.verify_url
            : err &&
              err.response &&
              err.response.data &&
              (err.response.data.verifyUrl || err.response.data.verify_url)
            ? err.response.data.verifyUrl || err.response.data.verify_url
            : null;

        if (code === -462) {
          loadErrorMessage.value = "接口要求安全验证，请在网易云完成验证后重试。";
          console.warn("[PlaylistDetail] 安全验证触发，verifyUrl =", verifyUrl);
          try {
            if (typeof window !== "undefined" && window.showErrorModal) {
              window.showErrorModal(
                "安全验证",
                { message: "网易云音乐要求进行安全验证，请在新窗口完成验证后重试。", verifyUrl },
                () => {
                  if (verifyUrl) window.open(verifyUrl, "_blank");
                }
              );
            } else {
              // 使用 Element Plus message 告知用户
              ElMessage.warning("接口要求安全验证，请在网易云完成验证后重试");
              if (verifyUrl) window.open(verifyUrl, "_blank");
            }
          } catch (e) {
            console.warn("[PlaylistDetail] 打开验证页面失败", e);
          }
          break; // 不再继续重试
        }

        // 否则短暂等待后重试
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (data) {
      playlistDetail.value = data;
      writePlaylistCache(id, data.tracks || data.songs || []);
      console.log("API 歌单加载成功:", id, playlistDetail.value);

      // 预取前三首 songUrl
      const idsToPrefetch = (data.tracks || data.songs || [])
        .slice(0, 3)
        .map((s) => s.id)
        .filter(Boolean);
      prefetchPlaylistSongUrls(idsToPrefetch);
      loading.value = false;
    } else {
      console.warn("从 API 未获取到歌单数据，保留缓存或默认显示", id);
      if (!playlistDetail.value) {
        loadErrorMessage.value = lastError?.message || "加载失败，请重试";
      }
    }

    console.log("========== 歌单详情加载完成 ==========", id);
  } catch (error) {
    console.error("========== 加载歌单详情失败 ==========", error);

    // 如果存在缓存则继续展示缓存，不要强制覆盖
    const cached = readPlaylistCache(id);
    if (cached) {
      console.log("加载失败，但存在缓存，将继续展示缓存数据", id);
      playlistDetail.value = {
        id,
        name: id,
        coverImgUrl: "",
        description: "",
        creator: { nickname: "" },
        playCount: 0,
        subscribedCount: 0,
        trackCount: cached.length,
        tracks: cached,
      };
    } else {
      ElMessage.error("加载歌单详情失败，请稍后重试");
      playlistDetail.value = null;
    }
  } finally {
    loading.value = false;
  }
};

// 保持兼容：模板中仍可调用 loadPlaylistDetail
const loadPlaylistDetail = async () => {
  await loadPlaylist(playlistId.value);
};

// 监听 route.params.id 变化以支持 /playlist/:id 的切换
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (!newId || newId === oldId) return;
    console.log("[PlaylistDetail] route id 变更，重新加载", newId, oldId);
    loadPlaylist(newId);
  }
);

// 监听全局本地音乐更新事件（用于下载完成后实时刷新“我喜欢的音乐”）
const handleLocalMusicUpdated = (_e) => {
  try {
    if (playlistId.value === "liked") {
      console.log("[PlaylistDetail] 收到本地音乐更新事件，重新加载 liked 歌单");
      loadPlaylist("liked");
    }
  } catch {
    console.warn("[PlaylistDetail] 处理本地更新事件失败");
  }
};

onMounted(() => {
  window.addEventListener("qqmusic:music-updated", handleLocalMusicUpdated);
});

onBeforeUnmount(() => {
  window.removeEventListener("qqmusic:music-updated", handleLocalMusicUpdated);
});

// 播放全部歌曲
const playAll = () => {
  if (!playlistDetail.value || !playlistDetail.value.tracks) {
    ElMessage.warning("暂无歌曲可播放");
    return;
  }

  // 这里可以调用播放服务，播放全部歌曲
  console.log("播放全部歌曲:", playlistDetail.value.tracks);
  ElMessage.success(`开始播放《${playlistDetail.value.name}》`);
};

// 播放单首歌曲
const playSong = async (song, index) => {
  console.log("播放歌曲:", song, "索引:", index);

  if (!song || !song.id) {
    ElMessage.warning("歌曲ID无效，无法播放");
    return;
  }

  const sid = Number(song.id);
  if (playingSongIds.value.has(sid)) {
    ElMessage.info("正在加载，请稍后");
    return;
  }

  playingSongIds.value.add(sid);

  try {
    // 将当前歌单映射为播放器需要的最小结构并设置到播放器
    const mapped = (playlistDetail.value?.tracks || []).map((s) => ({
      id: s.id,
      name: s.name || "",
      ar: s.ar || [],
      al: s.al || {},
      cover: (s.al && s.al.picUrl) || "",
    }));

    playerStore.setPlaylist(mapped);

    // 如果本地已有下载（存在于 likedSongs 且包含 base64 或 url），优先使用本地播放
    try {
      const MUSIC_KEY = "qqmusic_profile_music_v1";
      const savedMusic = localStorage.getItem(MUSIC_KEY);
      if (savedMusic) {
        const parsed = JSON.parse(savedMusic);
        const liked = parsed.likedSongs || [];
        const localEntry = liked.find((ls) => String(ls.id) === String(song.id));
        if (localEntry && (localEntry.base64 || localEntry.url)) {
          // 如果 base64 存在但 playerStore 中还没有 File，则尝试创建并注册
          try {
            // 安全判断 playerStore.songFiles 是否包含 id
            const hasSongFile = (() => {
              try {
                const sf = playerStore.songFiles;
                if (!sf) return false;
                if (sf instanceof Map) return sf.has(localEntry.id);
                if (sf && sf.value instanceof Map) return sf.value.has(localEntry.id);
                return false;
              } catch {
                return false;
              }
            })();

            if (localEntry.base64 && !hasSongFile) {
              const res = await fetch(localEntry.base64);
              const blob = await res.blob();
              const fileName = `${(localEntry.name || "song").replace(/[\\/:*?"<>|]/g, "")}-${
                localEntry.id
              }.mp3`;
              const file = new File([blob], fileName, { type: blob.type || "audio/mpeg" });
              playerStore.addSongFile(localEntry.id, file);
              console.log("[PlaylistDetail] 已将 base64 注册为 File 到 playerStore", localEntry.id);
            }
          } catch {
            console.warn("[PlaylistDetail] 将 base64 生成文件失败");
          }

          // 构造 LocalSong 并播放
          const localSong = {
            id: Number(localEntry.id),
            name: localEntry.name,
            artist: localEntry.artist,
            cover: localEntry.cover,
            base64: localEntry.base64,
            blobUrl: localEntry.url,
          };

          playerStore.showPlayList = false;
          await playerStore.playLocalSong(localSong);
          ElMessage.success(`开始播放《${song.name}（本地）》`);
          return;
        }
      }
    } catch (e) {
      console.warn("[PlaylistDetail] 检测本地下载失败", e);
    }

    // 确保不弹出播放列表面板，直接播放该首歌
    playerStore.showPlayList = false;

    await playerStore.play(sid);

    // 再次确保短时间内播放列表不会被打开
    setTimeout(() => {
      try {
        playerStore.showPlayList = false;
      } catch (e) {
        console.warn("无法设置 showPlayList:", e);
      }
    }, 200);

    ElMessage.success(`开始播放《${song.name}》`);
  } catch (error) {
    console.error("播放歌曲失败:", error);
    ElMessage.error("播放失败，请重试");
  } finally {
    playingSongIds.value.delete(sid);
  }
};

// 备用：打开添加到歌单对话框（保留以便手动选择目标歌单）
const _openAddToPlaylistDialog = () => {
  addToPlaylistDialogVisible.value = true;
  selectedTargetPlaylistId.value = null;

  const MUSIC_KEY = "qqmusic_profile_music_v1";
  const savedMusic = localStorage.getItem(MUSIC_KEY);

  if (savedMusic) {
    try {
      const parsedMusic = JSON.parse(savedMusic);
      userPlaylists.value = parsedMusic.playlists || [];
    } catch (error) {
      console.error("解析歌单数据失败:", error);
      userPlaylists.value = [];
    }
  } else {
    userPlaylists.value = [];
  }

  console.log("打开添加到歌单对话框，用户歌单数量:", userPlaylists.value.length);
};

// 选择目标歌单
const selectTargetPlaylist = (playlist) => {
  selectedTargetPlaylistId.value = playlist.id;
  console.log("选择目标歌单:", playlist);
};

// 确认添加到歌单
const confirmAddToPlaylist = async () => {
  if (!selectedTargetPlaylistId.value) {
    ElMessage.warning("请选择目标歌单");
    return;
  }

  if (!playlistDetail.value || !playlistDetail.value.tracks) {
    ElMessage.error("当前歌单没有歌曲");
    return;
  }

  addingSongs.value = true;

  try {
    console.log("开始添加歌曲到目标歌单...");
    console.log("目标歌单ID:", selectedTargetPlaylistId.value);
    console.log("当前歌单歌曲数量:", playlistDetail.value.tracks.length);

    const MUSIC_KEY = "qqmusic_profile_music_v1";
    const savedMusic = localStorage.getItem(MUSIC_KEY);

    if (!savedMusic) {
      ElMessage.error("未找到歌单数据");
      addingSongs.value = false;
      return;
    }

    const parsedMusic = JSON.parse(savedMusic);
    const playlists = parsedMusic.playlists || [];
    const playlistIndex = playlists.findIndex(
      (pl) => String(pl.id) === String(selectedTargetPlaylistId.value)
    );

    if (playlistIndex === -1) {
      ElMessage.error("目标歌单不存在");
      addingSongs.value = false;
      return;
    }

    const targetPlaylist = playlists[playlistIndex];
    const currentSongIds = targetPlaylist.tracks.map((t) => t.id);

    let addedCount = 0;
    const newSongs = [];

    playlistDetail.value.tracks.forEach((song) => {
      if (!currentSongIds.includes(song.id)) {
        newSongs.push({
          id: song.id,
          name: song.name,
          artist: song.ar?.[0]?.name || song.artist || "未知歌手",
          album: song.al?.name || song.album || "",
          cover: song.al?.picUrl || song.cover || "",
          duration: song.dt
            ? `${Math.floor(song.dt / 60000)}:${Math.floor((song.dt % 60000) / 1000)
                .toString()
                .padStart(2, "0")}`
            : "3:30",
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      ElMessage.warning("当前歌单的所有歌曲已在目标歌单中");
      addToPlaylistDialogVisible.value = false;
      addingSongs.value = false;
      return;
    }

    targetPlaylist.tracks.push(...newSongs);
    parsedMusic.playlists = playlists;

    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
    console.log("保存到localStorage成功");

    ElMessage.success(`成功添加 ${addedCount} 首歌曲到《${targetPlaylist.name}》`);
    addToPlaylistDialogVisible.value = false;
    selectedTargetPlaylistId.value = null;
  } catch (error) {
    console.error("添加歌曲失败:", error);
    ElMessage.error("添加歌曲失败，请重试");
  } finally {
    addingSongs.value = false;
  }
};

// 获取用户创建的歌单
const loadUserPlaylists = () => {
  console.log("loadUserPlaylists() 被调用");
  const MUSIC_KEY = "qqmusic_profile_music_v1";
  const savedMusic = localStorage.getItem(MUSIC_KEY);
  if (savedMusic) {
    try {
      const parsedMusic = JSON.parse(savedMusic);
      // 确保playlists是数组
      userPlaylists.value = Array.isArray(parsedMusic.playlists) ? parsedMusic.playlists : [];
      console.log("成功加载用户歌单:", userPlaylists.value.length, "个歌单");
    } catch (error) {
      console.error("解析用户歌单数据失败:", error);
      userPlaylists.value = [];
    }
  } else {
    console.log("未找到保存的歌单数据");
    userPlaylists.value = [];
  }
};

// 添加到歌单对话框状态
const addToExistingPlaylistDialogVisible = ref(false);
const selectedSongForAdding = ref(null);
const selectedPlaylistForAdding = ref(null);

// 打开添加到现有歌单对话框
const openAddToExistingPlaylistDialog = (song) => {
  selectedSongForAdding.value = song;
  selectedPlaylistForAdding.value = null;
  // 加载用户所有歌单
  loadUserPlaylists();
  addToExistingPlaylistDialogVisible.value = true;
};

// 选择要添加到的歌单
const selectPlaylistForAdding = (playlist) => {
  selectedPlaylistForAdding.value = playlist;
};

// 确认将单曲添加到选定的歌单
const confirmAddToExistingPlaylist = async () => {
  if (!selectedSongForAdding.value || !selectedPlaylistForAdding.value) {
    ElMessage.warning("请选择目标歌单");
    return;
  }

  addingSongs.value = true;

  try {
    const song = selectedSongForAdding.value;
    const playlist = selectedPlaylistForAdding.value;

    const artists =
      song.ar && Array.isArray(song.ar)
        ? song.ar.map((a) => a.name).join(", ")
        : song.artist || "未知艺术家";
    const songToAdd = {
      id: song.id,
      name: song.name || "未知歌曲",
      artist: artists,
      album: (song.al && song.al.name) || song.album || "",
      cover: (song.al && song.al.picUrl) || song.cover || "",
      duration: song.dt
        ? `${Math.floor(song.dt / 60000)}:${String(Math.floor((song.dt % 60000) / 1000)).padStart(
            2,
            "0"
          )}`
        : "3:30",
    };

    const MUSIC_KEY = "qqmusic_profile_music_v1";
    const saved = localStorage.getItem(MUSIC_KEY);
    let parsed = saved ? JSON.parse(saved) : { playlists: [], likedSongs: [] };
    parsed.playlists = parsed.playlists || [];

    // 找到目标歌单
    const targetPlaylistIndex = parsed.playlists.findIndex(
      (pl) => String(pl.id) === String(playlist.id)
    );

    if (targetPlaylistIndex === -1) {
      ElMessage.error("目标歌单不存在");
      return;
    }

    const targetPlaylist = parsed.playlists[targetPlaylistIndex];
    targetPlaylist.tracks = targetPlaylist.tracks || [];

    // 检查歌曲是否已在歌单中
    const currentSongIds = new Set((targetPlaylist.tracks || []).map((t) => String(t.id)));

    if (currentSongIds.has(String(song.id))) {
      ElMessage.warning("该歌曲已在目标歌单中");
      return;
    }

    // 添加歌曲到歌单
    targetPlaylist.tracks.push(songToAdd);
    parsed.playlists[targetPlaylistIndex] = targetPlaylist;

    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));

    // 更新用户歌单列表
    userPlaylists.value = parsed.playlists;

    // 通知其他组件本地歌单数据已更新
    try {
      window.dispatchEvent(new Event("qqmusic:music-updated"));
    } catch (error) {
      console.error("通知其他组件失败:", error);
    }

    ElMessage.success(`成功将歌曲添加到《${targetPlaylist.name}》`);
    addToExistingPlaylistDialogVisible.value = false;
  } catch (error) {
    console.error("添加歌曲到歌单失败:", error);
    ElMessage.error("添加歌曲到歌单失败，请重试");
  } finally {
    addingSongs.value = false;
  }
};

// 添加到播放列表（现在改为：为单曲创建同名歌单并添加，保留确认与防重）
const addToList = async (song) => {
  if (!song || !song.id) {
    ElMessage.error("歌曲数据无效");
    return;
  }
  if (addingSongs.value) return; // 防止重复点击

  // 询问用户是添加到现有歌单还是创建新歌单
  try {
    await ElMessageBox.confirm("请选择添加方式", "添加到歌单", {
      confirmButtonText: "添加到现有歌单",
      cancelButtonText: "创建新歌单",
      type: "info",
    });
    // 用户选择添加到现有歌单
    openAddToExistingPlaylistDialog(song);
  } catch {
    // 用户选择创建新歌单
    addingSongs.value = true;
    try {
      const artists =
        song.ar && Array.isArray(song.ar)
          ? song.ar.map((a) => a.name).join(", ")
          : song.artist || "未知艺术家";
      const mapped = [
        {
          id: song.id,
          name: song.name || "未知歌曲",
          artist: artists,
          album: (song.al && song.al.name) || song.album || "",
          cover: (song.al && song.al.picUrl) || song.cover || "",
          duration: song.dt
            ? `${Math.floor(song.dt / 60000)}:${String(
                Math.floor((song.dt % 60000) / 1000)
              ).padStart(2, "0")}`
            : "3:30",
        },
      ];

      const MUSIC_KEY = "qqmusic_profile_music_v1";
      const saved = localStorage.getItem(MUSIC_KEY);
      let parsed = saved ? JSON.parse(saved) : { playlists: [], likedSongs: [] };
      parsed.playlists = parsed.playlists || [];

      const plName = song.name || `歌单-${Date.now()}`;
      const existingIndex = parsed.playlists.findIndex(
        (p) => String(p.name).trim().toLowerCase() === String(plName).trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        try {
          await ElMessageBox.confirm(
            `检测到已有同名歌单《${parsed.playlists[existingIndex].name}》。\n点击“确定”将把歌曲追加到该歌单；点击“取消”将新建歌单并添加。`,
            "发现同名歌单",
            { confirmButtonText: "追加到已存在", cancelButtonText: "新建并添加", type: "warning" }
          );
          // 追加
          const target = parsed.playlists[existingIndex];
          const currentIds = new Set((target.tracks || []).map((t) => String(t.id)));
          let added = 0;
          mapped.forEach((item) => {
            if (!currentIds.has(String(item.id))) {
              target.tracks.push(item);
              added++;
            }
          });
          parsed.playlists[existingIndex] = target;
          localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
          userPlaylists.value = parsed.playlists;
          // 通知其他组件本地歌单数据已更新
          try {
            window.dispatchEvent(new Event("qqmusic:music-updated"));
          } catch (error) {
            console.error("通知其他组件失败:", error);
          }
          ElMessage.success(`已追加 ${added} 首歌曲到《${target.name}》`);
          return;
        } catch (e) {
          // 继续新建并添加
          console.log("[PlaylistDetail] 用户选择新建并添加（取消追加）", e && e.message);
        }
      }

      // 新建并添加
      try {
        const newPlaylist = {
          id: `pl_${Date.now()}`,
          name: plName,
          cover: mapped[0].cover || "",
          creator: "我",
          tracks: mapped,
        };
        parsed.playlists.unshift(newPlaylist);
        localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
        userPlaylists.value = parsed.playlists;
        // 通知其他组件本地歌单数据已更新
        try {
          window.dispatchEvent(new Event("qqmusic:music-updated"));
        } catch (error) {
          console.error("通知其他组件失败:", error);
        }
        ElMessage.success(`已创建歌单《${plName}》并添加 1 首歌曲`);
      } catch (err) {
        console.error("[PlaylistDetail] 创建本地歌单失败", err);
        ElMessage.error("创建歌单失败，请稍后重试");
      }
    } finally {
      addingSongs.value = false;
    }
  }
};

// 示例歌曲数据（可以从API或其他地方获取）
const exampleSongs = [
  {
    id: "s1",
    name: "清透",
    artist: "陈粒",
    cover: img1,
    tag: "SQ",
    album: "清透",
  },
  {
    id: "s2",
    name: "小孩",
    artist: "罗森涛",
    cover: img2,
    tag: "独家",
    album: "小孩",
  },
  {
    id: "s3",
    name: "爱情讯息",
    artist: "洪一诺",
    cover: img3,
    tag: "",
    album: "爱情讯息",
  },
  {
    id: "s4",
    name: "最初的记忆",
    artist: "云汐",
    cover: img4,
    tag: "MV",
    album: "最初的记忆",
  },
  {
    id: "s5",
    name: "戒不掉",
    artist: "田馥甄",
    cover: img5,
    tag: "",
    album: "戒不掉",
  },
];

// 过滤后的歌曲列表（用于搜索）
const filteredSongs = computed(() => {
  if (!searchKeyword.value) {
    return allAvailableSongs.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return allAvailableSongs.value.filter(
    (song) =>
      song.name.toLowerCase().includes(keyword) || song.artist.toLowerCase().includes(keyword)
  );
});

// 打开添加歌曲对话框
const openAddSongDialog = () => {
  addSongDialogVisible.value = true;
  searchKeyword.value = "";
  selectedSongs.value = [];
  allAvailableSongs.value = [...exampleSongs];
  console.log("打开添加歌曲对话框，可用歌曲数量:", allAvailableSongs.value.length);
};

// 处理搜索
const handleSearch = () => {
  console.log("搜索关键词:", searchKeyword.value);
};

// 切换歌曲选择状态
const toggleSongSelection = (song) => {
  const index = selectedSongs.value.findIndex((s) => s.id === song.id);
  if (index > -1) {
    selectedSongs.value.splice(index, 1);
  } else {
    selectedSongs.value.push(song);
  }
  console.log("当前选中的歌曲:", selectedSongs.value);
};

// 检查歌曲是否被选中
const isSongSelected = (songId) => {
  return selectedSongs.value.some((s) => s.id === songId);
};

// 确认添加歌曲到歌单
const confirmAddSongs = async () => {
  if (selectedSongs.value.length === 0) {
    ElMessage.warning("请至少选择一首歌曲");
    return;
  }

  try {
    console.log("开始添加歌曲到歌单...");
    console.log("歌单ID:", playlistId.value);
    console.log("要添加的歌曲:", selectedSongs.value);

    const MUSIC_KEY = "qqmusic_profile_music_v1";
    const savedMusic = localStorage.getItem(MUSIC_KEY);

    if (!savedMusic) {
      ElMessage.error("未找到歌单数据");
      return;
    }

    const parsedMusic = JSON.parse(savedMusic);
    const playlists = parsedMusic.playlists || [];
    const playlistIndex = playlists.findIndex((pl) => String(pl.id) === String(playlistId.value));

    if (playlistIndex === -1) {
      ElMessage.error("歌单不存在");
      return;
    }

    const playlist = playlists[playlistIndex];
    const currentSongIds = playlist.tracks.map((t) => t.id);

    let addedCount = 0;
    const newSongs = [];

    selectedSongs.value.forEach((song) => {
      if (!currentSongIds.includes(song.id)) {
        newSongs.push({
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album || "",
          cover: song.cover || "",
          duration: "3:30",
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      ElMessage.warning("所选歌曲已在歌单中");
      addSongDialogVisible.value = false;
      return;
    }

    playlist.tracks.push(...newSongs);
    parsedMusic.playlists = playlists;

    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
    console.log("保存到localStorage成功");

    ElMessage.success(`成功添加 ${addedCount} 首歌曲到歌单`);
    addSongDialogVisible.value = false;
    selectedSongs.value = [];

    await loadPlaylistDetail();
  } catch (error) {
    console.error("添加歌曲失败:", error);
    ElMessage.error("添加歌曲失败，请重试");
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
      console.warn("[PlaylistDetail] 注册 File 失败", e);
    }

    const blobUrl = URL.createObjectURL(file);

    // 保存文件到 IndexedDB（避免占用 localStorage），若失败则回退为 base64
    let base64 = null;
    let storedToIDB = false;
    try {
      await saveFile(String(song.id), blob);
      storedToIDB = true;
    } catch (e) {
      console.warn("[PlaylistDetail] 保存文件到 IndexedDB 失败，尝试回退为 base64:", e);
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
        console.warn("[PlaylistDetail] 回退转 base64 失败:", e2);
      }
    }

    const DOWNLOADS_KEY = "qqmusic_downloads_v1";
    let downloads = [];

    try {
      const savedDownloads = localStorage.getItem(DOWNLOADS_KEY);
      if (savedDownloads) {
        const parsed = JSON.parse(savedDownloads);
        if (Array.isArray(parsed)) {
          downloads = parsed;
        } else if (parsed && typeof parsed === "object") {
          console.warn("[PlaylistDetail] 下载记录格式为对象，已转换为数组");
          downloads = Object.values(parsed);
        } else {
          downloads = [];
        }
      }
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
        console.warn("[PlaylistDetail] 派发 qqmusic:music-updated 事件失败");
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

// 创建一个新的本地歌单（从当前显示的歌单内容）并添加到我的歌单
const createPlaylistFromCurrent = async () => {
  if (!playlistDetail.value) {
    ElMessage.error("当前没有可用的歌单内容");
    return;
  }

  const plName = playlistDetail.value.name || `歌单-${Date.now()}`;
  const plCover = playlistDetail.value.coverImgUrl || "";
  const tracks = (playlistDetail.value.tracks || []).map((s) => ({
    id: s.id,
    name: s.name,
    artist: s.ar && Array.isArray(s.ar) ? s.ar.map((a) => a.name).join(", ") : s.artist || "",
    album: s.al && s.al.name ? s.al.name : s.album || "",
    cover: (s.al && s.al.picUrl) || s.cover || "",
    duration: s.dt
      ? `${Math.floor(s.dt / 60000)}:${String(Math.floor((s.dt % 60000) / 1000)).padStart(2, "0")}`
      : "3:30",
  }));

  // 检查是否已有同名歌单（仅限“我”创建的歌单）
  const MUSIC_KEY = "qqmusic_profile_music_v1";
  const saved = localStorage.getItem(MUSIC_KEY);
  let parsed = saved ? JSON.parse(saved) : { playlists: [], likedSongs: [] };
  parsed.playlists = parsed.playlists || [];
  const existingIndex = parsed.playlists.findIndex(
    (p) =>
      p.creator === "我" &&
      String(p.name).trim().toLowerCase() === String(plName).trim().toLowerCase()
  );

  if (existingIndex !== -1) {
    // 直接追加到已有歌单（无二次确认）
    const target = parsed.playlists[existingIndex];
    const currentIds = new Set((target.tracks || []).map((t) => String(t.id)));
    let added = 0;
    tracks.forEach((item) => {
      if (!currentIds.has(String(item.id))) {
        target.tracks.push(item);
        added++;
      }
    });
    parsed.playlists[existingIndex] = target;
    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
    // 通知其他组件本地歌单数据已更新
    try {
      window.dispatchEvent(new Event("qqmusic:music-updated"));
    } catch {
      console.warn("[PlaylistDetail] 派发 qqmusic:music-updated 事件失败");
    }
    ElMessage.success(`已追加 ${added} 首歌曲到《${target.name}》`);
    return;
  }

  // 若没有“我”创建的同名歌单，询问是否创建并添加
  try {
    await ElMessageBox.confirm(
      `是否创建新歌单《${plName}》并添加 ${tracks.length} 首歌曲？`,
      "创建歌单并添加",
      { confirmButtonText: "创建并添加", cancelButtonText: "取消", type: "info" }
    );
  } catch (err) {
    console.warn("[PlaylistDetail] 创建新歌单确认弹窗失败", err);
    return;
  }

  // 新建并添加
  try {
    const newPlaylist = {
      id: `pl_${Date.now()}`,
      name: plName,
      cover: plCover,
      creator: "我",
      tracks,
    };
    parsed.playlists.unshift(newPlaylist);
    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsed));
    // 通知其他组件本地歌单数据已更新
    try {
      window.dispatchEvent(new Event("qqmusic:music-updated"));
    } catch {
      console.warn("[PlaylistDetail] 派发 qqmusic:music-updated 事件失败");
    }
    ElMessage.success(`已创建歌单《${plName}》并添加 ${tracks.length} 首歌曲`);
  } catch (err) {
    console.error("[PlaylistDetail] 创建本地歌单失败", err);
    ElMessage.error("创建歌单失败，请稍后重试");
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadPlaylistDetail();
  // 监听本地歌单更新事件，便于其它页面修改本地数据后主动刷新
  window.addEventListener("qqmusic:music-updated", loadPlaylistDetail);
});

onBeforeUnmount(() => {
  try {
    window.removeEventListener("qqmusic:music-updated", loadPlaylistDetail);
  } catch {
    console.warn("[PlaylistDetail] 移除 qqmusic:music-updated 事件监听器失败");
  }
});
</script>

<style scoped>
.playlist-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 加载状态 */
.loading-container {
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  width: 100%;
  background-color: #ffffff;
}

/* Element Plus 加载组件容器样式 */
.loading-container .el-loading-mask {
  width: auto !important;
  min-width: 100px !important;
  height: auto !important;
}

/* Element Plus 加载组件内部样式 */
.loading-container .el-loading-spinner {
  width: auto !important;
  height: auto !important;
  padding: 20px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

/* Element Plus 加载动画样式 */
.loading-container .el-loading-spinner .circular {
  margin-bottom: 10px !important;
}

/* 保证 Element Plus 加载提示文字为单行，避免每个字换行显示 */
.loading-container .el-loading-text {
  white-space: nowrap !important;
  display: inline-block !important;
  line-height: 1.2 !important;
  max-width: 100% !important;
  overflow: visible !important;
  word-break: normal !important;
  width: auto !important;
  height: auto !important;
  font-size: 16px !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 确保加载文字容器有足够宽度 */
.loading-container .el-loading-spinner > div {
  width: auto !important;
  min-width: 100px !important;
  text-align: center !important;
}

/* 针对Element Plus加载组件的文本容器 */
.loading-container .el-loading-spinner .el-loading-text {
  display: block !important;
  white-space: nowrap !important;
  width: auto !important;
  height: auto !important;
  line-height: 1.5 !important;
  font-size: 16px !important;
  overflow: visible !important;
  word-break: keep-all !important;
  text-overflow: clip !important;
  margin-top: 10px !important;
  padding: 0 10px !important;
}

/* 错误状态 */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.error-icon {
  width: 60px;
  height: 60px;
  background-color: #e74c3c;
  border-radius: 50%;
  margin-bottom: 10px;
}

.error-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

/* 歌单内容 */
.playlist-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 歌单头部 */
.playlist-header {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 小型三个点加载指示器 */
.song-loading-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 4px;
}
.song-loading-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  opacity: 0.9;
  animation: dot 1s infinite linear;
}
.song-loading-indicator .dot:nth-child(2) {
  animation-delay: 0.12s;
}
.song-loading-indicator .dot:nth-child(3) {
  animation-delay: 0.24s;
}
@keyframes dot {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0);
  }
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 20px;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-type {
  color: #1890ff;
  font-size: 12px;
  margin-bottom: 8px;
}

.playlist-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.playlist-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.playlist-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 歌曲列表 */
.song-list {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.list-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.list-count {
  color: #999;
  font-size: 14px;
}

/* 歌曲列表容器 */
.songs-container {
  max-height: 600px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #fafafa;
}

.song-index {
  width: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.song-info {
  flex: 1;
  margin-right: 20px;
}

.song-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.song-album {
  width: 150px;
  color: #999;
  font-size: 12px;
  margin-right: 20px;
}

.song-duration {
  width: 60px;
  color: #999;
  font-size: 12px;
  text-align: right;
  margin-right: 20px;
}

.song-actions {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #1890ff;
}

.download-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover {
  color: #1890ff;
}

/* 图标样式（简化版，实际项目中可以使用图标库） */
.icon-user::before {
  content: "👤";
}
.icon-play::before {
  content: "▶️";
}
.icon-collect::before {
  content: "⭐";
}
.icon-play-all::before {
  content: "▶️";
}
.icon-heart::before {
  content: "❤️";
}
.icon-add::before {
  content: "+";
}
.icon-plus::before {
  content: "+";
}

/* 添加歌曲按钮样式 */
.btn-add {
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #73d13d;
}

/* 添加歌曲对话框样式 */
.add-song-dialog .dialog-content {
  padding: 10px 0;
}

.add-song-dialog .search-box {
  margin-bottom: 20px;
}

.add-song-dialog .song-selection-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.add-song-dialog .song-selection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.add-song-dialog .song-selection-item:hover {
  background-color: #fafafa;
}

.add-song-dialog .song-selection-item.selected {
  background-color: #e6f7ff;
}

.add-song-dialog .song-selection-info {
  flex: 1;
}

.add-song-dialog .song-selection-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.add-song-dialog .song-selection-artist {
  font-size: 12px;
  color: #999;
}

.add-song-dialog .song-selection-check {
  width: 20px;
}

.add-song-dialog .empty-tip {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.add-song-dialog .dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}

.add-song-dialog .selected-count {
  margin-right: auto;
  color: #666;
  font-size: 14px;
}

/* 添加到我的歌单对话框样式 */
.add-to-playlist-dialog .dialog-content {
  padding: 10px 0;
}

.add-to-playlist-dialog .playlist-info-text {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.add-to-playlist-dialog .target-playlist-list {
  max-height: 400px;
  overflow-y: auto;
}

.add-to-playlist-dialog .target-playlist-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  border: 2px solid transparent;
}

.add-to-playlist-dialog .target-playlist-item:hover {
  background-color: #f5f5f5;
}

.add-to-playlist-dialog .target-playlist-item.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.add-to-playlist-dialog .target-playlist-cover {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
}

.add-to-playlist-dialog .target-playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.add-to-playlist-dialog .target-playlist-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.add-to-playlist-dialog .target-playlist-count {
  font-size: 13px;
  color: #999;
}

.add-to-playlist-dialog .target-playlist-check {
  display: flex;
  align-items: center;
}

.add-to-playlist-dialog .empty-playlists {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.add-to-playlist-dialog .dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}
</style>
