<template>
  <div class="recommend-view">
    <!-- 顶部：Hi + 听歌报告 -->
    <div class="topbar">
      <h2 class="hello">Hi {{ username }} 今天为你推荐</h2>
    </div>

    <!-- 顶部横向推荐：左大卡 + 右侧小卡横滑 -->
    <div class="hero-row">
      <!-- 左侧大卡 -->
      <div v-if="loading.hero" class="loading-card">
        <div class="loading-placeholder hero-placeholder"></div>
      </div>
      <div v-else-if="errors.hero" class="error-card">
        <div class="error-message">{{ errors.hero }}</div>
        <button class="retry-btn" @click="fetchHeroData">重试</button>
      </div>
      <div v-else class="hero-card" @click="playHero">
        <div class="hero-left">
          <div class="hero-title">{{ hero.title }}</div>
          <div class="hero-sub">{{ hero.subtitle }}</div>

          <div class="play-btn">
            <span class="triangle"></span>
          </div>
        </div>

        <div class="hero-right">
          <img class="hero-cover" :src="hero.cover" alt="" loading="lazy" />
          <div class="hero-vinyl"></div>
        </div>
      </div>

      <!-- 右侧：横向小卡 -->
      <div class="top-scroll">
        <div v-if="loading.topCards">
          <div v-for="i in 4" :key="'loading-' + i" class="loading-card top-card">
            <div class="loading-placeholder top-placeholder"></div>
          </div>
        </div>
        <div v-else-if="errors.topCards" class="error-card top-card">
          <div class="error-message">{{ errors.topCards }}</div>
          <button class="retry-btn" @click="fetchTopCardsData">重试</button>
        </div>
        <div
          v-else
          v-for="item in topCards"
          :key="item.id"
          class="top-card"
          @click="openTopCard(item)"
        >
          <img class="top-img" :src="item.cover" alt="" loading="lazy" />
          <div class="top-label">{{ item.label }}</div>

          <!-- 右下角小圆点（装饰，像你图里那样） -->
          <div class="corner-dot" />
        </div>
      </div>
    </div>

    <!-- 分区 1：你的私荐歌单（网格） -->
    <div class="section-row">
      <div class="row-title">你的私荐歌单</div>
      <!-- <SectionTitle title="你的私荐歌单" /> -->
      <!-- <div class="section-count">共 {{ personalPlaylists.length }} 个</div> -->
    </div>

    <div class="grid">
      <div v-if="loading.personalPlaylists">
        <div v-for="i in 6" :key="'loading-' + i" class="grid-card loading-card">
          <div class="loading-placeholder grid-placeholder"></div>
          <div class="loading-text"></div>
        </div>
      </div>
      <div v-else-if="errors.personalPlaylists" class="grid-error">
        <div class="error-message">{{ errors.personalPlaylists }}</div>
        <button class="retry-btn" @click="fetchPersonalPlaylistsData">重试</button>
      </div>
      <div
        v-else
        v-for="p in personalPlaylists"
        :key="p.id"
        class="grid-card"
        @click="openPlaylist(p)"
      >
        <div class="img-wrap">
          <img class="grid-img" :src="p.cover" alt="" loading="lazy" />
          <div class="count">{{ p.countText }}</div>

        </div>
        <div class="grid-name">{{ p.name }}</div>
      </div>
    </div>

    <!-- 分区 2：累一天了，听点轻松的（横滑） -->
    <!-- <SectionTitle title="累一天了，听点轻松的" /> -->
    <div class="row-title">累一天了，听点轻松的</div>
    <div class="hscroll">
      <div v-if="loading.relaxPlaylists">
        <div v-for="i in 4" :key="'loading-' + i" class="h-card loading-card">
          <div class="loading-placeholder h-placeholder"></div>
          <div class="loading-text"></div>
          <div class="loading-text small"></div>
        </div>
      </div>
      <div v-else-if="errors.relaxPlaylists" class="error-card h-card">
        <div class="error-message">{{ errors.relaxPlaylists }}</div>
        <button class="retry-btn" @click="fetchRelaxPlaylistsData">重试</button>
      </div>
      <div
        v-else
        v-for="p in relaxPlaylists"
        :key="p.id"
        class="h-card"
        @click="openPlaylist(p)"
      >
        <img class="h-img" :src="p.cover" alt="" loading="lazy" />
        <div class="h-meta">
          <div class="h-name">{{ p.name }}</div>
          <div class="h-sub">{{ p.desc }}</div>
        </div>
        <div class="h-count">{{ p.countText }}</div>

      </div>
    </div>



    <!-- 分区 4：根据你爱的歌曲推荐（大图横滑） -->
    <!-- <SectionTitle title="根据你爱的歌曲推荐" /> -->
    <div class="row-title">根据你爱的歌曲推荐</div>
    <div class="big-scroll">
      <div v-if="loading.lovedPlaylists">
        <div v-for="i in 4" :key="'loading-' + i" class="big-card loading-card">
          <div class="loading-placeholder big-placeholder"></div>
          <div class="loading-text"></div>
          <div class="loading-text small"></div>
        </div>
      </div>
      <div v-else-if="errors.lovedPlaylists" class="error-card big-card">
        <div class="error-message">{{ errors.lovedPlaylists }}</div>
        <button class="retry-btn" @click="fetchLovedPlaylistsData">重试</button>
      </div>
      <div
        v-else
        v-for="p in lovedPlaylists"
        :key="p.id"
        class="big-card"
        @click="openPlaylist(p)"
      >
        <img class="big-img" :src="p.cover" alt="" loading="lazy" />
        <div class="big-name">{{ p.name }}</div>
        <div class="big-count">{{ p.countText }}</div>

      </div>
    </div>

    <!-- 分区 5：红心歌曲预定（列表） -->
    <div class="row-head">
      <div class="row-left">
        <div class="row-title">红心歌曲预定</div>
        <div class="play-all" @click="playAllHeart">
          <!-- <span class="play-icon"></span> -->
        </div>
      </div>
    </div>

    <div class="heart-list">
      <div v-if="loading.heartSongs">
        <div v-for="i in 3" :key="'loading-' + i" class="heart-item loading-card">
          <div class="loading-placeholder heart-placeholder"></div>
          <div class="heart-info">
            <div class="loading-text"></div>
            <div class="loading-text small"></div>
          </div>
        </div>
      </div>
      <div v-else-if="errors.heartSongs" class="heart-list-error">
        <div class="error-message">{{ errors.heartSongs }}</div>
        <button class="retry-btn" @click="fetchHeartSongsData">重试</button>
      </div>
      <div
        v-else
        v-for="s in heartSongs"
        :key="s.id"
        class="heart-item"
        @click="playSong(s)"
      >
        <img class="heart-cover" :src="s.cover" alt="" loading="lazy" />
        <div class="heart-info">
          <div class="heart-name">
            {{ s.name }}
            <span v-if="s.badge" class="badge">{{ s.badge }}</span>
          </div>
          <div class="heart-artist">{{ s.artist }}</div>
        </div>
        <button class="download-btn" @click.stop="downloadSong(s)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor"/>
            <path d="M4 18H20V20H4V18Z" fill="currentColor"/>
          </svg>
        </button>
        <button class="add-to-playlist-btn" @click.stop="openAddPlaylistDialog({id:s.id, name:s.name, cover:s.cover, countText:'0'})" :title="'添加到我的歌单'">
          <i class="icon-add-playlist">+</i>
        </button>
      </div>
    </div>

    <!-- 添加到我的歌单对话框 -->
    <el-dialog v-model="addPlaylistDialogVisible" title="添加到我的歌单" width="480px" class="add-playlist-dialog" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="playlist-info-text">
          将《{{ selectedPlaylist?.name }}》中的歌曲添加到：
        </div>
        <div class="target-playlist-list">
          <div
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            class="target-playlist-item"
            :class="{ selected: String(selectedTargetPlaylistId) === String(playlist.id) }"
            @click="selectTargetPlaylist(playlist)"
          >
            <img class="target-playlist-cover" :src="playlist.cover || ''" alt="" loading="lazy" />
            <div class="target-playlist-info">
              <div class="target-playlist-name">{{ playlist.name }}</div>
              <div class="target-playlist-count">{{ playlist.tracks?.length || 0 }} 首歌曲</div>
            </div>
            <div class="target-playlist-check" @click.stop>
              <el-checkbox :model-value="String(selectedTargetPlaylistId) === String(playlist.id)" @change="(val) => onCheckboxChange(val, playlist)" />
            </div>
          </div>
          <div v-if="userPlaylists.length === 0" class="empty-playlists">
            暂无歌单，请先创建歌单
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addPlaylistDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddPlaylist" :loading="addingSongs" :disabled="addingSongs || !selectedTargetPlaylistId || userPlaylists.length === 0">
            <span v-if="!addingSongs">确定添加</span>
            <span v-else>添加中...</span>
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineComponent, h, reactive, ref, onMounted} from "vue";
import { useRouter } from "vue-router";
import { usePersonalized, usePersonalizedWithLimit, usePersonalizedNewSong, useBanner, usePlaylistByCategory, useSimilarSongs, usePlayListTrackAll, useDownloadSong, useLoginStatus, getUserLikeSongs, useSongUrl, useTopListDetail } from "@/utils/api";
import { uniqueById, dedupeById, diversify, ensureMinItems } from "@/utils/recommend";
import { ElMessage } from "element-plus";
import { usePlayerStore } from "@/stores/player";

// 图片资源将从API获取，不再使用本地占位图片

/**
 * ✅ 后期接 API：
 * 你只需要把下面这些 mock 数组替换成接口返回的数据即可
 * 比如 onMounted(async()=> { personalPlaylists.value = await api... })
 */

// DEBUG 开关：在开发时开启可以打印详细日志，生产构建请保持 false
const DEBUG = false;
const debug = (...args) => { if (DEBUG) console.log(...args); };

const username = ref("幸运函");

const lastPlayedSongId = ref(null); // 存储最后播放歌曲ID，用于相似推荐
const refreshing = ref(false);

// 添加歌单到我的歌单相关状态
const addPlaylistDialogVisible = ref(false);
const selectedPlaylist = ref(null);
const selectedTargetPlaylistId = ref(null);
const userPlaylists = ref([]);
const addingSongs = ref(false);

// 从播放历史读取最后播放的歌曲（支持动态更新）
const loadLastPlayedSong = () => {
  try {
    const PLAY_HISTORY_KEY = 'qqmusic_play_history_v1';
    const savedHistory = localStorage.getItem(PLAY_HISTORY_KEY);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      if (Array.isArray(history) && history.length > 0) {
        const lastSong = history[history.length - 1];
        lastPlayedSongId.value = lastSong.id;

        debug('[loadLastPlayedSong] 已加载最后播放歌曲:', lastSong.name, 'ID:', lastSong.id);
        return lastSong.id;
      }
    }
  } catch (e) {
    console.warn('[loadLastPlayedSong] 读取播放历史失败:', e);
  }
  // 如果读取失败，使用默认值

  lastPlayedSongId.value = 28181478; // 默认歌曲ID
  return 28181478;
};

// 监听播放历史变化，实时更新推荐内容
const watchPlayHistoryChanges = () => {
  // 使用 localStorage 事件监听（跨标签页）
  window.addEventListener('storage', (e) => {
    if (e.key === 'qqmusic_play_history_v1') {
      debug('[watchPlayHistoryChanges] 检测到播放历史更新，重新加载推荐...');
      const newSongId = loadLastPlayedSong();
      // 仅在歌曲ID实际改变时重新获取推荐
      if (newSongId !== lastPlayedSongId.value) {

      }
    }
  });
};

// 获取用户创建的歌单
const loadUserPlaylists = () => {
  const MUSIC_KEY = "qqmusic_profile_music_v1";
  const savedMusic = localStorage.getItem(MUSIC_KEY);
  if (savedMusic) {
    try {
      const parsedMusic = JSON.parse(savedMusic);
      userPlaylists.value = parsedMusic.playlists || [];
    } catch (error) {
      console.error('解析用户歌单数据失败:', error);
      userPlaylists.value = [];
    }
  } else {
    userPlaylists.value = [];
  }
};

// 加载状态和错误处理
const loading = reactive({
  hero: true,
  topCards: true,
  personalPlaylists: true,
  relaxPlaylists: true,

  lovedPlaylists: true,
  heartSongs: true,
  general: true
});

const errors = reactive({
  hero: "",
  topCards: "",
  personalPlaylists: "",
  relaxPlaylists: "",

  lovedPlaylists: "",
  heartSongs: ""
});

/** 顶部大卡 */
const hero = reactive({
  id: "",
  title: "",
  subtitle: "",
  cover: "",
});

/** 顶部横向小卡 */
const topCards = ref([]);

/** 你的私荐歌单（网格） */
const personalPlaylists = ref([]);

/** 累一天了（横滑） */
const relaxPlaylists = ref([]);

/** 听「xx」也会喜欢（歌曲列表） */



/** 根据你爱的歌曲推荐（大图横滑） */
const lovedPlaylists = ref([]);

/** 红心歌曲预定（列表） */
const heartSongs = ref([]);

// 缓存歌曲 URL（只是缓存可用的 url 或 null）
const songUrlCache = ref(new Map());

// 确保单首歌的可播放 URL（会写入 songUrlCache）
const ensureSongUrl = async (song) => {
  // 验证song对象的有效性
  if (!song || typeof song !== 'object') {
    console.warn('[ensureSongUrl] Invalid song object provided');
    return null;
  }

  // 解析歌曲ID
  const numericId = typeof song.id === 'string' ? parseInt(song.id, 10) : song.id;

  // 验证ID的有效性
  if (!numericId || isNaN(numericId) || numericId <= 0) {
    console.warn('[ensureSongUrl] Invalid song ID:', song.id);
    return null;
  }

  // 检查缓存
  if (songUrlCache.value.has(numericId)) {
    const cachedUrl = songUrlCache.value.get(numericId);
    console.debug('[ensureSongUrl] Returning cached URL for song', numericId, ':', cachedUrl ? 'Available' : 'Not available');
    return cachedUrl;
  }

  try {
    console.debug('[ensureSongUrl] Fetching URL for song', numericId);
    const songData = await useSongUrl(numericId);

    // 处理API返回的数据
    let url = null;

    if (songData && typeof songData === 'object') {
      // 如果返回的是单个歌曲对象
      if (songData.url && typeof songData.url === 'string' && songData.url.trim() !== '') {
        url = songData.url;
        console.debug('[ensureSongUrl] Got valid URL for song', numericId, ':', url);
      } else {
        console.warn('[ensureSongUrl] Song data returned but no valid URL found for song', numericId);
      }
    } else if (Array.isArray(songData)) {
      // 如果返回的是歌曲数组（兼容旧版API）
      const validSong = songData.find(s => s && s.url && typeof s.url === 'string' && s.url.trim() !== '');
      if (validSong) {
        url = validSong.url;
        console.debug('[ensureSongUrl] Got valid URL from array for song', numericId, ':', url);
      } else {
        console.warn('[ensureSongUrl] No valid song data found in array for song', numericId);
      }
    } else if (songData === null) {
      console.info('[ensureSongUrl] API returned null (no playable URL) for song', numericId);
    } else {
      console.warn('[ensureSongUrl] Unexpected API response type for song', numericId, ':', typeof songData);
    }

    // 缓存结果
    songUrlCache.value.set(numericId, url);
    return url;
  } catch (e) {
    console.error('[ensureSongUrl] Error fetching URL for song', numericId, ':', e);
    // 发生错误时，缓存null值以避免重复请求
    songUrlCache.value.set(numericId, null);
    return null;
  }
};

// 并发获取一组歌曲的 url（不会抛出）
const ensureSongsPlayable = async (songs) => {
  const tasks = songs.map((s) => ensureSongUrl(s));
  await Promise.allSettled(tasks);
};



/** 组件：分区标题 */
const SectionTitle = defineComponent({
  props: { title: String, icon: String },
  setup(props) {
    return () =>
      h("div", { class: "section-title" }, [
        h("div", { class: "st-left" }, [
          props.icon ? h("span", { class: "st-icon" }, props.icon) : null,
          h("div", { class: "st-text" }, props.title),
        ]),
      ]);
  },
});

/** 初始化路由 */
const router = useRouter();
const playerStore = usePlayerStore();

/** 交互（先简单打印，后期接你的播放器 store / api） */
const _goReport = () => {
  router.push({ name: 'profile' });
};

// 用户主动刷新推荐（清除本地缓存并重新获取）
const _refreshAllRecommendations = async () => {
  if (refreshing.value) return;
  refreshing.value = true;
  try {
    debug('[refreshAllRecommendations] 开始清除缓存并重新获取推荐...');
    // 清除所有缓存，强制重新获取
    const keys = ['topCards','personalPlaylists','relaxPlaylists','lovedPlaylists','heartSongs'];
    for (const k of keys) {
      try {
        const fullKey = cacheKey(k);
        localStorage.removeItem(fullKey);
        // 也清除 IndexedDB
        const db = await openDb();
        await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const r = store.delete(fullKey);
          r.onsuccess = () => resolve();
          r.onerror = () => resolve();
        });
      } catch (e) {
        debug('[refreshAllRecommendations] 清除缓存失败', k, e);
      }
    }

    // 重新获取关键推荐数据
    await Promise.all([
      runGuardedFetch('hero', fetchHeroData, 8000),
      runGuardedFetch('topCards', fetchTopCardsData, 8000),
      runGuardedFetch('personalPlaylists', fetchPersonalPlaylistsData, 8000),

    ]);

    // 后台继续加载非关键数据
    Promise.allSettled([
      runGuardedFetch('relaxPlaylists', fetchRelaxPlaylistsData, 8000),
      runGuardedFetch('lovedPlaylists', fetchLovedPlaylistsData, 8000),
      runGuardedFetch('heartSongs', fetchHeartSongsData, 8000)
    ]).then(() => {
      try {
        harmonizeSections();
        debug('[refreshAllRecommendations] 后台刷新完成');
      } catch (e) {
        console.warn('[refreshAllRecommendations] harmonizeSections 失败', e);
      }
    });

    ElMessage.success('推荐已刷新');
    debug('[refreshAllRecommendations] 推荐刷新成功');
  } catch (error) {
    console.error('刷新推荐失败:', error);
    ElMessage.error('刷新失败，请重试');
  } finally {
    refreshing.value = false;
  }
};

// 刷新"听[什么的人]也喜欢"部分（基于最新播放歌曲）
const refreshRecommendLikeSongs = async () => {
  try {
    debug('[refreshRecommendLikeSongs] 基于最新播放歌曲刷新推荐...');
    // 清除缓存
    const fullKey = cacheKey('likeSongs');
    localStorage.removeItem(fullKey);
    try {
      const db = await openDb();
      await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const r = store.delete(fullKey);
        r.onsuccess = () => resolve();
        r.onerror = () => resolve();
      });
    } catch (e) {
      debug('[refreshRecommendLikeSongs] 清除IndexedDB缓存失败', e);
    }
    // 重新获取

    debug('[refreshRecommendLikeSongs] 推荐歌曲已更新');
  } catch (error) {
    console.error('[refreshRecommendLikeSongs] 刷新失败:', error);
  }
};

const playHero = () => {
  console.log('playHero called with:', hero);
  if (hero.id) {
    console.log('Navigating to playlistDetail with id:', hero.id);
    router.push({ name: 'playlistDetail', params: { id: hero.id } });
  } else {
    console.log('No id found in hero data');
  }
};
const openTopCard = (item) => {
  console.log('openTopCard called with:', item);
  if (item.id) {
    console.log('Navigating to playlistDetail with id:', item.id);
    router.push({ name: 'playlistDetail', params: { id: item.id } });
  } else {
    console.log('No id found in top card data');
  }
};
const openPlaylist = (p) => {
  console.log('openPlaylist called with:', p);
  if (p.id) {
    console.log('Navigating to playlistDetail with id:', p.id);
    router.push({ name: 'playlistDetail', params: { id: p.id } });
  } else {
    console.log('No id found in playlist data');
  }
};

const playSong = async (s) => {
  console.log("播放歌曲", s);
  try {
    // 先确保可播放
    const url = await ensureSongUrl(s);
    if (!url) {
      // 无法获取到 url，提示并提供重试
      const errorMessage = `无法播放歌曲「${s.name}」，可能是由于版权限制、网络问题或资源暂时不可用。`;
      if (typeof window !== "undefined" && window.showErrorModal) {
        window.showErrorModal('音频资源不可用', {
          message: errorMessage,
          songId: s.id,
          songName: s.name
        }, async () => {
          // 重试时清除缓存，确保获取最新数据
          const numericId = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
          if (numericId && !isNaN(numericId)) {
            songUrlCache.value.delete(numericId);
          }

          // 重新获取URL并尝试播放
          await ensureSongUrl(s);
          const retryUrl = songUrlCache.value.get(numericId);

          if (retryUrl) {
            playerStore.pushPlayList(false, s);
            await playerStore.play(numericId);
            ElMessage.success(`成功播放歌曲「${s.name}」`);
          } else {
            ElMessage.error('仍无法获取音频资源，可能是版权限制或网络问题');
          }
        });
      } else {
        ElMessage.error(errorMessage);
      }
      return;
    }

    // 有可播放的 url 再加入播放列表并播放
    playerStore.pushPlayList(false, s);
    const numericId = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
    if (!isNaN(numericId) && numericId > 0) {
      await playerStore.play(numericId);
    }

    // 更新最后播放的歌曲ID和名称并保存播放历史（仅在数值 id 时设置 lastPlayedSongId）
    const numericIdForHistory = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
    if (!isNaN(numericIdForHistory) && numericIdForHistory > 0) {
      lastPlayedSongId.value = numericIdForHistory;
    } else {
      lastPlayedSongId.value = null;
    }


    try {
      const PLAY_HISTORY_KEY = 'qqmusic_play_history_v1';
      const raw = localStorage.getItem(PLAY_HISTORY_KEY);
      let arr = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) arr = parsed;
        } catch (e) {
          console.warn('[playSong] 解析播放历史失败，重置历史', e);
          arr = [];
        }
      }
      arr.push({ id: s.id, name: s.name, artist: s.artist, cover: s.cover, time: Date.now() });
      try {
        localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(arr));
      } catch (e) {
        console.warn('[playSong] 保存播放历史失败', e);
      }
    } catch (e) {
      console.warn('[playSong] 更新本地播放历史失败', e);
    }

    // 触发基于最新播放歌曲的推荐刷新

  } catch (e) {
    console.error('[playSong] 播放失败:', e);
    ElMessage.error('播放失败，请查看控制台');
  }
};



const playAllHeart = async () => {
  if (!heartSongs.value || heartSongs.value.length === 0) {
    ElMessage.info('当前没有可播放的红心歌曲');
    return;
  }

  await ensureSongsPlayable(heartSongs.value);

  const playable = heartSongs.value.filter((s) => {
    const nid = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
    return nid && !isNaN(nid) && songUrlCache.value.get(nid);
  });

  if (playable.length === 0) {
    if (typeof window !== "undefined" && window.showErrorModal) {
      window.showErrorModal('没有可播放的红心歌曲', { message: '当前红心分区没有可用的音频资源' }, null);
    } else {
      ElMessage.error('当前没有可播放的红心歌曲');
    }
    return;
  }

  playerStore.setPlaylist(playable);
  const first = playable[0];
  const numericId = typeof first.id === 'string' ? parseInt(first.id, 10) : first.id;
  await playerStore.play(numericId);

  lastPlayedSongId.value = first.id;


};

const downloadSong = async (song) => {
  try {
    console.log('开始下载歌曲:', song);

    if (!song.id) {
      ElMessage.error('歌曲ID无效，无法下载');
      return;
    }

    ElMessage.info('正在准备下载...');

    const songId = typeof song.id === 'string' ? parseInt(song.id) : song.id;
    const result = await useDownloadSong(songId);

    if (!result || !result.song || !result.url) {
      ElMessage.error('获取歌曲信息失败');
      return;
    }

    const DOWNLOADS_KEY = "qqmusic_downloads_v1";
    let downloads = [];

    try {
      const savedDownloads = localStorage.getItem(DOWNLOADS_KEY);
      if (savedDownloads) {
        downloads = JSON.parse(savedDownloads);
      }
    } catch (error) {
      console.error('读取下载记录失败:', error);
      downloads = [];
    }

    const existingIndex = downloads.findIndex(d => d.id === song.id);
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const downloadRecord = {
      id: String(song.id),
      name: result.song.name || song.name,
      artist: result.song.ar?.map(a => a.name).join('/') || song.artist,
      cover: result.song.al?.picUrl || song.cover,
      time: timeString,
      url: result.url
    };

    if (existingIndex !== -1) {
      downloads[existingIndex] = downloadRecord;
      ElMessage.success('歌曲已更新');
    } else {
      downloads.unshift(downloadRecord);
      ElMessage.success('下载成功');
    }

    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
    console.log('歌曲下载成功并保存到localStorage:', downloadRecord);

  } catch (error) {
    console.error('下载歌曲失败:', error);
    ElMessage.error('下载失败，请重试');
  }
};

// 打开添加到我的歌单对话框
const openAddPlaylistDialog = (playlist) => {
  console.log('打开添加到我的歌单对话框，歌单:', playlist);
  selectedPlaylist.value = playlist;
  selectedTargetPlaylistId.value = null;
  loadUserPlaylists();
  addPlaylistDialogVisible.value = true;
};

// 选择目标歌单（支持切换：重复点击取消选择）
const selectTargetPlaylist = (playlist) => {
  if (String(selectedTargetPlaylistId.value) === String(playlist.id)) {
    selectedTargetPlaylistId.value = null;
  } else {
    selectedTargetPlaylistId.value = playlist.id;
  }
  debug('选择目标歌单:', playlist, 'selectedId=', selectedTargetPlaylistId.value);
};

// checkbox change 处理（与点击项保持一致）
const onCheckboxChange = (checked, playlist) => {
  if (checked) {
    selectedTargetPlaylistId.value = playlist.id;
  } else if (String(selectedTargetPlaylistId.value) === String(playlist.id)) {
    selectedTargetPlaylistId.value = null;
  }
  debug('checkbox change', checked, 'playlist', playlist);
};

// 确认添加歌单到我的歌单
const confirmAddPlaylist = async () => {
  if (!selectedTargetPlaylistId.value) {
    ElMessage.warning('请选择目标歌单');
    return;
  }

  if (!selectedPlaylist.value) {
    ElMessage.error('未选择要添加的歌单');
    return;
  }

  addingSongs.value = true;

  try {
    console.log('开始获取歌单歌曲...');
    console.log('歌单ID:', selectedPlaylist.value.id);

    let songs = [];

    try {
      songs = await usePlayListTrackAll(selectedPlaylist.value.id);
      console.log('成功获取歌单歌曲，共', songs.length, '首');
    } catch (error) {
      console.error('获取歌单歌曲失败:', error);
      ElMessage.error('获取歌单歌曲失败，请重试');
      addingSongs.value = false;
      return;
    }

    if (!songs || songs.length === 0) {
      ElMessage.warning('该歌单暂无歌曲');
      addingSongs.value = false;
      return;
    }

    console.log('准备添加歌曲到目标歌单...');
    console.log('目标歌单ID:', selectedTargetPlaylistId.value);

    const MUSIC_KEY = "qqmusic_profile_music_v1";
    const savedMusic = localStorage.getItem(MUSIC_KEY);

    if (!savedMusic) {
      ElMessage.error('未找到歌单数据');
      addingSongs.value = false;
      return;
    }

    const parsedMusic = JSON.parse(savedMusic);
    const playlists = parsedMusic.playlists || [];
    const targetPlaylistIndex = playlists.findIndex(pl => String(pl.id) === String(selectedTargetPlaylistId.value));

    if (targetPlaylistIndex === -1) {
      ElMessage.error('目标歌单不存在');
      addingSongs.value = false;
      return;
    }

    const targetPlaylist = playlists[targetPlaylistIndex];
    const currentSongIds = targetPlaylist.tracks.map(t => t.id);

    let addedCount = 0;
    const newSongs = [];

    songs.forEach(song => {
      if (!currentSongIds.includes(song.id)) {
        const artists = song.ar && Array.isArray(song.ar) ?
          song.ar.map(a => a.name).join(", ") :
          (song.artists && Array.isArray(song.artists) ?
            song.artists.map(a => a.name).join(", ") : "未知艺术家");

        newSongs.push({
          id: song.id,
          name: song.name,
          artist: artists,
          album: song.al?.name || song.album?.name || '',
          cover: song.al?.picUrl || song.album?.picUrl || '',
          duration: song.dt ? `${Math.floor(song.dt / 60000)}:${String(Math.floor((song.dt % 60000) / 1000)).padStart(2, '0')}` : '3:30'
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      ElMessage.warning('所选歌单的歌曲已在目标歌单中');
      addPlaylistDialogVisible.value = false;
      addingSongs.value = false;
      return;
    }

    targetPlaylist.tracks.push(...newSongs);
    parsedMusic.playlists = playlists;

    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
    console.log('保存到localStorage成功');

    ElMessage.success(`成功添加 ${addedCount} 首歌曲到《${targetPlaylist.name}》`);
    addPlaylistDialogVisible.value = false;
    selectedPlaylist.value = null;
    selectedTargetPlaylistId.value = null;

  } catch (error) {
    console.error('添加歌曲失败:', error);
    ElMessage.error('添加歌曲失败，请重试');
  } finally {
    addingSongs.value = false;
  }
};

/** API数据获取 */
const fetchHeroData = async () => {
  try {
    loading.hero = true;
    console.log("开始获取Hero数据...");
    const banners = await useBanner();

    // 检查API返回的数据是否有效
    if (banners && Array.isArray(banners) && banners.length > 0) {
      console.log("成功获取Hero数据，共", banners.length, "条");
      const firstBanner = banners[0];
      hero.title = firstBanner.typeTitle || "放松吧";
      hero.subtitle = firstBanner.targetType === 1 ? "尝试来点儿音乐提提神吧～" : "为你推荐精彩内容";
      hero.cover = firstBanner.pic;
      console.log("Hero封面URL:", hero.cover);
    } else {
      console.warn("获取到的Hero数据为空或格式不正确");
      // 使用默认数据
    }
    errors.hero = "";
  } catch (error) {
    console.error("获取hero数据失败:", error);
    errors.hero = "获取推荐数据失败，请稍后重试";
  } finally {
    loading.hero = false;
  }
};

const fetchTopCardsData = async () => {
  try {
    loading.topCards = true;
    console.log("开始获取精选内容数据...");
    // 调用API获取精选内容，使用个性化推荐歌单API
    const personalized = await usePersonalizedWithLimit(4);
    console.log("获取到精选内容原始数据:", personalized);

    // 检查API返回的数据是否有效
    if (personalized && Array.isArray(personalized) && personalized.length > 0) {
      console.log("成功获取精选内容数据，共", personalized.length, "条");
      topCards.value = personalized.slice(0, 4).map((playlist, index) => ({
        id: playlist.id || `top-card-${index}`,
        cover: playlist.picUrl || '',
        label: playlist.name || "精选内容"
      }));
      // 写入缓存，便于下次快速展示
      writeCache('topCards', topCards.value);
    } else {
      console.warn("获取到的精选内容为空或格式不正确");
      topCards.value = [];
    }
    errors.topCards = "";
  } catch (error) {
    console.error("获取topCards数据失败:", error);
    // 发生错误时清空数据
    topCards.value = [];
    // 显示错误信息
    errors.topCards = "获取精选内容失败，请稍后重试";
  } finally {
    loading.topCards = false;
  }
};

const fetchPersonalPlaylistsData = async () => {
  try {
    loading.personalPlaylists = true;
    console.log("开始获取私人推荐歌单数据...");
    const personalized = await usePersonalizedWithLimit(6);

    // 检查API返回的数据是否有效
    if (personalized && Array.isArray(personalized) && personalized.length > 0) {
      debug("成功获取私人推荐歌单数据，共", personalized.length, "条");
      personalPlaylists.value = personalized.map((playlist) => ({
        id: playlist.id || `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: playlist.name || "未知歌单",
        cover: playlist.picUrl || '', // 不再使用本地图片，使用空字符串
        countText: playlist.playCount ? (playlist.playCount / 10000).toFixed(1) + "万" : "0"
      }));

      // 如果结果太少，尝试拉取更多作为补充（避免被跨区去重/分发导致显示过少）
      if (personalPlaylists.value.length < 4) {
        try {
          debug('personalPlaylists 少于 4，尝试拉取更多（备用请求）');
          const more = await usePersonalizedWithLimit(20);
          if (more && Array.isArray(more) && more.length > personalized.length) {
            const merged = [...personalPlaylists.value];
            const existingIds = new Set(merged.map(i => String(i.id)));
            for (const pl of more) {
              if (merged.length >= 6) break;
              const id = pl.id || `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              if (existingIds.has(String(id))) continue;
              existingIds.add(String(id));
              merged.push({
                id,
                name: pl.name || '未知歌单',
                cover: pl.picUrl || '',
                countText: pl.playCount ? (pl.playCount / 10000).toFixed(1) + '万' : '0'
              });
            }
            personalPlaylists.value = merged;
            debug('已用更多数据补充 personalPlaylists 至', personalPlaylists.value.length);
          }
        } catch (e) {
          debug('备用拉取 personalPlaylists 失败', e);
        }
      }

      writeCache('personalPlaylists', personalPlaylists.value);
    } else {
      console.warn("获取到的私人推荐歌单数据为空或格式不正确");
      // 使用默认数据
    }
    errors.personalPlaylists = "";
  } catch (error) {
    console.error("获取personalPlaylists数据失败:", error);
    errors.personalPlaylists = "获取推荐歌单失败，请稍后重试";
  } finally {
    loading.personalPlaylists = false;
  }
};

const fetchRelaxPlaylistsData = async () => {
  try {
    loading.relaxPlaylists = true;
    console.log("开始获取放松音乐歌单数据...");
    const relax = await usePlaylistByCategory("轻音乐", 4);

    // 检查API返回的数据是否有效
    if (relax && Array.isArray(relax) && relax.length > 0) {
      console.log("成功获取放松音乐歌单数据，共", relax.length, "条");
      relaxPlaylists.value = relax.map((playlist) => ({
        id: playlist.id || `relax-playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: playlist.name || "未知歌单",
        desc: playlist.description || "适合放松的音乐",
        cover: playlist.coverImgUrl || '',
        countText: playlist.playCount ? (playlist.playCount / 10000).toFixed(1) + "万" : "0"
      }));
      writeCache('relaxPlaylists', relaxPlaylists.value);
      console.log("放松音乐歌单封面URL示例:", relaxPlaylists.value[0]?.cover);
    } else {
      console.warn("获取到的放松音乐歌单数据为空或格式不正确");
      // 使用默认数据
    }
    errors.relaxPlaylists = "";
  } catch (error) {
    console.error("获取relaxPlaylists数据失败:", error);
    errors.relaxPlaylists = "获取放松音乐失败，请稍后重试";
  } finally {
    loading.relaxPlaylists = false;
  }
};





const fetchLovedPlaylistsData = async () => {
  try {
    loading.lovedPlaylists = true;
    console.log("开始获取根据喜爱推荐的歌单数据...");
    const personalized = await usePersonalized();

    // 检查API返回的数据是否有效
    if (personalized && Array.isArray(personalized) && personalized.length > 0) {
      console.log("成功获取根据喜爱推荐的歌单数据，共", personalized.length, "条");
      lovedPlaylists.value = personalized.map((playlist) => ({
        id: playlist.id || `loved-playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: playlist.name || "未知歌单",
        cover: playlist.picUrl || '',
        countText: playlist.playCount ? (playlist.playCount / 100000000).toFixed(1) + "亿" : "0"
      }));
      writeCache('lovedPlaylists', lovedPlaylists.value);
      debug("根据喜爱推荐的歌单封面URL示例:", lovedPlaylists.value[0]?.cover);
    } else {
      console.warn("获取到的根据喜爱推荐的歌单数据为空或格式不正确");
      // 使用默认数据
    }
    errors.lovedPlaylists = "";
  } catch (error) {
    console.error("获取lovedPlaylists数据失败:", error);
    errors.lovedPlaylists = "获取推荐歌单失败，请稍后重试";
  } finally {
    loading.lovedPlaylists = false;
  }
};

const fetchHeartSongsData = async () => {
  try {
    loading.heartSongs = true;
    console.log("开始获取红心歌曲数据...");

    // 调用API获取用户喜欢的歌曲（通常歌单ID为3778678）
    let heartSongsData = [];
    let isUsingFallback = false;

    try {
      // 尝试获取用户喜欢的歌曲歌单
      console.log("尝试调用usePlayListTrackAll(3778678)...");
      heartSongsData = await usePlayListTrackAll(3778678);
      console.log("成功获取用户喜欢的歌曲歌单数据");
    } catch (playlistError) {
      console.warn("获取用户喜欢的歌单失败，使用个性化新歌作为备选:", playlistError);
      // 如果获取喜欢的歌单失败，使用个性化新歌作为备选
      try {
        console.log("尝试使用个性化新歌作为备选...");
        heartSongsData = await usePersonalizedNewSong();
        isUsingFallback = true;
        console.log("成功获取个性化新歌作为红心歌曲备选数据");
      } catch (fallbackError) {
        console.error("获取备选歌曲数据也失败:", fallbackError);
        // 如果两个API都失败，使用空数组
        heartSongsData = [];
      }
    }

    // 检查API返回的数据是否有效
    if (heartSongsData && Array.isArray(heartSongsData) && heartSongsData.length > 0) {
      console.log("成功获取红心歌曲数据，共", heartSongsData.length, "条", isUsingFallback ? "(使用备选数据)" : "");
      heartSongs.value = heartSongsData.slice(0, 3).map((songItem, index) => {
        // 处理不同API响应结构
        const song = songItem.song || songItem;
        console.log(`第${index+1}首红心歌曲原始数据:`, JSON.stringify(song, null, 2));

        // 安全检查artists数组，支持Song类型的ar字段和其他API的artists字段
        const artists = song.ar && Array.isArray(song.ar) ?
          song.ar.map(a => a.name).join("/") :
          (song.artists && Array.isArray(song.artists) ?
            song.artists.map(a => a.name).join("/") : "未知艺术家");

        // 检查封面图片路径，支持多种API响应结构
        let cover = song.al?.picUrl ||
          song.song?.al?.picUrl ||
          song.album?.picUrl ||
          song.song?.album?.picUrl;

        // 验证封面URL的有效性
        if (cover) {
          console.log(`红心歌曲 ${song.name} 的原始封面URL: ${cover}`);

          // 确保封面URL是完整的（包含协议）
          if (!cover.startsWith('http://') && !cover.startsWith('https://')) {
            console.log(`封面URL ${cover} 不是完整URL，使用默认图片`);
            cover = null;
          } else {
            // 确保URL格式正确
            try {
              new URL(cover);
              console.log(`有效封面URL: ${cover}`);
            } catch {
              console.log(`封面URL ${cover} 格式错误，使用默认图片`);
              cover = null;
            }
          }
        }

        // 如果没有有效封面，使用空字符串
        if (!cover) {
          cover = '';
          console.log(`红心歌曲 ${song.name} 没有封面`);
        }

        return {
          id: song.id || songItem.id || `heart-song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: song.name || songItem.name || "未知歌曲",
          artist: artists,
          cover: cover,
          badge: "臻品母带"
        };
      });
      console.log("红心歌曲封面URL示例:", heartSongs.value[0]?.cover);
    } else {
      // 如果API返回空数据，使用默认数据
      console.warn("获取到的红心预定歌曲为空，使用默认数据");
      // 如果API返回空，使用空数组
      heartSongs.value = [];
    }
    errors.heartSongs = "";
  } catch (error) {
    console.error("获取heartSongs数据失败:", error);
    // 显示更详细的错误信息以便调试
    errors.heartSongs = "获取红心歌曲失败，请稍后重试";
  } finally {
    loading.heartSongs = false;
  }
};

// 本地缓存与超时工具
const CACHE_TTL = 1000 * 60 * 30; // 30 分钟（进一步减少缓存时间，增加推荐内容更新频率）
const cacheKey = (key) => `recommend_cache_${key}`;

// 使用 IndexedDB 做异步缓存，避免对主线程造成阻塞。若环境不支持 IndexedDB，回退到 localStorage（但仍在异步任务中解析）
const DB_NAME = 'recommend_cache_db';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

const openDb = () => new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) {
    reject(new Error('IndexedDB 不可用'));
    return;
  }
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const readCache = async (key) => {
  const fullKey = cacheKey(key);
  try {
    const start = performance.now();
    try {
      const db = await openDb();
      return await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const r = store.get(fullKey);
        r.onsuccess = () => {
          const parsed = r.result;
          if (!parsed || !parsed.ts || !parsed.data) return resolve(null);
          if (Date.now() - parsed.ts > CACHE_TTL) return resolve(null);
          debug(`[readCache] ${key} ${Math.round(performance.now() - start)}ms (IndexedDB)`);
          resolve(parsed.data);
        };
        r.onerror = () => resolve(null);
      });
    } catch (idbErr) {
      // 回退到 localStorage，但异步解析以避免阻塞
      debug('[readCache] IndexedDB 不可用或发生错误，回退到 localStorage', idbErr);
      return await new Promise((resolve) => {
        setTimeout(() => {
          try {
            const raw = localStorage.getItem(fullKey);
            if (!raw) return resolve(null);
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.ts || !parsed.data) return resolve(null);
            if (Date.now() - parsed.ts > CACHE_TTL) return resolve(null);
            debug(`[readCache] ${key} ${Math.round(performance.now() - start)}ms (localStorage)`);
            resolve(parsed.data);
          } catch (e) {
            console.warn('[RecommendView] readCache(localStorage) 解析失败', e);
            resolve(null);
          }
        }, 0);
      });
    }
  } catch (e) {
    console.warn('[RecommendView] readCache 失败', e);
    return null;
  }
};

const writeCache = async (key, data) => {
  const fullKey = cacheKey(key);
  try {
    try {
      const db = await openDb();
      return await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const r = store.put({ ts: Date.now(), data }, fullKey);
        r.onsuccess = () => resolve();
        r.onerror = () => {
          console.warn('[RecommendView] writeCache IndexedDB put 失败', r.error);
          resolve();
        };
      });
    } catch (idbErr) {
      debug('[writeCache] IndexedDB 不可用或发生错误，回退到 localStorage', idbErr);
      // 回退到 localStorage（异步）
      setTimeout(() => {
        try {
          localStorage.setItem(fullKey, JSON.stringify({ ts: Date.now(), data }));
        } catch (e) {
          console.warn('[RecommendView] writeCache localStorage 失败', e);
        }
      }, 0);
    }
  } catch (e) {
    console.warn('[RecommendView] writeCache 失败', e);
  }
};

// 单个请求超时辅助（用于避免慢API阻塞页面）
// 注意：直接用 Promise.race 无法取消内部未完成的异步任务，导致内部 finally 不会执行，从而可能保留 loading 标记。
// runGuardedFetch 会在超时后主动设置对应 loading[key] 为 false 以及 errors[key]，以避免“一直加载”的问题。
const runGuardedFetch = (key, fn, ms = 8000) => {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try { errors[key] = '请求超时，请稍后重试'; } catch (e) { debug('[runGuardedFetch] 设置 errors 失败', key, e); }
      try { loading[key] = false; } catch (e) { debug('[runGuardedFetch] 设置 loading 失败', key, e); }
      debug(`[runGuardedFetch] ${key} timed out after ${ms}ms`);
      // resolve to avoid blocking callers
      resolve();
    }, ms);

    // 执行实际请求
    fn()
      .then((res) => {
        if (settled) {
          // 已经超时并 resolve 过，仍然接受后续结果但不抛错
          clearTimeout(timer);
          debug(`[runGuardedFetch] ${key} finished after timeout`);
          return resolve(res);
        }
        settled = true;
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (settled) {
          debug(`[runGuardedFetch] ${key} error after timeout, swallowing`, err);
          return resolve();
        }
        settled = true;
        // 将错误向上抛（使用 resolve 以便 Promise.allSettled 能捕获）
        debug(`[runGuardedFetch] ${key} failed`, err);
        resolve();
      });
  });
};

// 加载所有数据
onMounted(async () => {
  try {
    loading.general = true;

    // 先加载最后播放的歌曲信息，用于动态推荐
    loadLastPlayedSong();

    // 启动播放历史变化监听，实现动态推荐更新
    watchPlayHistoryChanges();

    // 先尝试从异步缓存（IndexedDB / localStorage 回退）读取，异步注入以避免阻塞主线程
    readCache('topCards').then(c => { if (c) topCards.value = c; });
    readCache('personalPlaylists').then(c => { if (c) personalPlaylists.value = c; });
    readCache('relaxPlaylists').then(c => { if (c) relaxPlaylists.value = c; });

    readCache('lovedPlaylists').then(c => { if (c) lovedPlaylists.value = c; });
    readCache('heartSongs').then(c => { if (c) heartSongs.value = c; });

    // 背景迁移：将 legacy localStorage 缓存迁移到 IndexedDB（避免未来同步 localStorage 解析导致主线程卡顿）
    setTimeout(async () => {
      try {
        const keys = ['topCards','personalPlaylists','relaxPlaylists','lovedPlaylists','heartSongs'];
        for (const k of keys) {
          const fullKey = cacheKey(k);
          try {
            const raw = localStorage.getItem(fullKey);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.ts || !parsed.data) continue;
            const existing = await readCache(k);
            if (!existing) {
              await writeCache(k, parsed.data);
              // 移除 localStorage 的老数据，减少未来同步读取负担
              localStorage.removeItem(fullKey);
              debug(`[migrateCache] migrated ${k} to IndexedDB and removed localStorage copy`);
            }
          } catch (e) {
            console.warn('[migrateCache] 迁移', k, '失败', e);
          }
        }
      } catch (e) {
        console.warn('[migrateCache] 失败', e);
      }
    }, 0);

    // 关键优先加载：先加载最重要的几个区块以便快速可交互
    // 分批次加载，减少同时发起的请求数量，避免浏览器请求队列阻塞
    await Promise.all([
      runGuardedFetch('hero', fetchHeroData, 6000),  // Hero 区域优先级最高，超时时间较短
      runGuardedFetch('topCards', fetchTopCardsData, 6000)  // 顶部卡片次之
    ]);

    // 第二批次加载重要内容
    await Promise.all([
      runGuardedFetch('personalPlaylists', fetchPersonalPlaylistsData, 8000),  // 私荐歌单

    ]);

    // 初次加载完成后，尽快去重并写入缓存以展示内容
    try {
      harmonizeSections();
    } catch (e) {
      console.warn('[RecommendView] harmonizeSections 失败', e);
    }
  } catch (error) {
    console.error("关键数据加载失败:", error);
  } finally {
    // 初始渲染就绪，关闭 general loading
    loading.general = false;
  }

  // 后台加载其余非关键数据（不阻塞首屏）
  Promise.allSettled([
    runGuardedFetch('relaxPlaylists', fetchRelaxPlaylistsData, 8000),
    runGuardedFetch('lovedPlaylists', fetchLovedPlaylistsData, 8000),
    runGuardedFetch('heartSongs', fetchHeartSongsData, 8000)
  ]).then(() => {
    try {
      harmonizeSections();
    } catch (e) {
      console.warn('[RecommendView] harmonizeSections 失败 (background)', e);
    }
  }).catch((err) => {
    console.warn('[RecommendView] 后台加载部分数据失败:', err);
  });

  // 后台软刷新：5 分钟后异步刷新推荐数据（不阻塞主线程，用户无感知）
  setTimeout(async () => {
    try {
      debug('[soft-refresh] 开始后台软刷新推荐（5 分钟后）');
      await Promise.allSettled([
        runGuardedFetch('topCards', fetchTopCardsData, 8000),
        runGuardedFetch('personalPlaylists', fetchPersonalPlaylistsData, 8000),
        runGuardedFetch('relaxPlaylists', fetchRelaxPlaylistsData, 8000),

        runGuardedFetch('lovedPlaylists', fetchLovedPlaylistsData, 8000),
        runGuardedFetch('heartSongs', fetchHeartSongsData, 8000)
      ]);
      // 软刷新后重新做一次去重与多样化
      try {
        harmonizeSections();
        debug('[soft-refresh] 后台软刷新完成并更新了推荐');
      } catch (e) {
        debug('[soft-refresh] harmonizeSections 失败', e);
      }
    } catch (e) {
      debug('[soft-refresh] 后台软刷新失败', e);
    }
  }, 1000 * 60 * 5); // 5 分钟后开始
});

// 清除热歌榜缓存的函数


// 简单的数组随机化函数
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


// 全局去重与多样化：按优先级（hero->topCards->personal->relax->like->loved->heart）去重，保证页面不重复展示相同歌单/歌曲
const harmonizeSections = () => {
  const seen = new Set();
  // Hero（对象）优先级最高
  try {
    if (hero && hero.id) {
      seen.add(String(hero.id));
    }

    // 栏目优先级：topCards (4), personalPlaylists (6), relaxPlaylists (4), likeSongs (6), lovedPlaylists (4), heartSongs (3)
    // 去重并选择多样化子集
    const origTop = shuffleArray(uniqueById(topCards.value));
    topCards.value = dedupeById(origTop, seen);
    topCards.value = diversify(topCards.value, 4, (i) => i.label || i.id);
    // ensure minimums to avoid sections becoming too small after去重
    topCards.value = ensureMinItems(topCards.value, origTop, 4);
    writeCache('topCards', topCards.value);

    const origPersonal = shuffleArray(uniqueById(personalPlaylists.value));
    personalPlaylists.value = dedupeById(origPersonal, seen);
    personalPlaylists.value = diversify(personalPlaylists.value, 6, (i) => (i.name && i.name[0]) || i.id);
    personalPlaylists.value = ensureMinItems(personalPlaylists.value, origPersonal, 4);
    writeCache('personalPlaylists', personalPlaylists.value);

    const origRelax = shuffleArray(uniqueById(relaxPlaylists.value));
    relaxPlaylists.value = dedupeById(origRelax, seen);
    relaxPlaylists.value = diversify(relaxPlaylists.value, 4, (i) => (i.name && i.name[0]) || i.id);
    relaxPlaylists.value = ensureMinItems(relaxPlaylists.value, origRelax, 3);
    writeCache('relaxPlaylists', relaxPlaylists.value);



    const origLoved = shuffleArray(uniqueById(lovedPlaylists.value));
    lovedPlaylists.value = dedupeById(origLoved, seen);
    lovedPlaylists.value = diversify(lovedPlaylists.value, 4, (i) => (i.name && i.name[0]) || i.id);
    lovedPlaylists.value = ensureMinItems(lovedPlaylists.value, origLoved, 4);
    writeCache('lovedPlaylists', lovedPlaylists.value);

    const origHeart = shuffleArray(uniqueById(heartSongs.value));
    heartSongs.value = dedupeById(origHeart, seen);
    heartSongs.value = diversify(heartSongs.value, 3, (i) => (i.artist && i.artist.split('/')[0]) || i.id);
    heartSongs.value = ensureMinItems(heartSongs.value, origHeart, 3);
    writeCache('heartSongs', heartSongs.value);

    debug('[RecommendView] harmonizeSections 完成, 每个区去重与多样性已应用');
    debug('[harmonize] counts', {
      top: topCards.value.length,
      personal: personalPlaylists.value.length,
      relax: relaxPlaylists.value.length,

      loved: lovedPlaylists.value.length,
      heart: heartSongs.value.length
    });
  } catch (err) {
    console.error('[RecommendView] harmonizeSections 出错:', err);
  }
};
</script>

<style scoped>
.recommend-view {
  padding: 18px 20px 28px;
}

/* 加载状态样式 */
.loading-card {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.loading-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 不同区域的加载占位符大小 */
.hero-placeholder {
  width: 100%;
  height: 156px;
}

.top-placeholder {
  width: 220px;
  height: 156px;
}

.grid-placeholder {
  width: 100%;
  height: 150px;
  margin-bottom: 8px;
}

.h-placeholder {
  width: 120px;
  height: 120px;
  margin-bottom: 8px;
}

.song-placeholder, .heart-placeholder {
  width: 50px;
  height: 50px;
  margin-right: 12px;
}

.big-placeholder {
  width: 300px;
  height: 160px;
  margin-bottom: 8px;
}

.loading-text {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 6px;
}

.loading-text.small {
  width: 60%;
  height: 12px;
}

/* 错误状态样式 */
.error-card, .grid-error, .song-list-error, .heart-list-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff3f3;
  border: 1px solid #ffcccc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 12px;
}

.retry-btn {
  padding: 6px 16px;
  background-color: #22c55e;
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #16a34a;
}

/* 错误区域特定样式 */
.grid-error {
  grid-column: 1 / -1;
  margin: 20px 0;
}

.song-list-error, .heart-list-error {
  margin: 10px 0;
}

/* 顶部 */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.hello {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.refresh-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  user-select: none;
}
.refresh-btn:hover:not(:disabled) {
  opacity: 0.7;
}
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.loading-spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.report {
  font-size: 14px;
  color: #8b8b8b;
  cursor: pointer;
  user-select: none;
}
.report:hover {
  color: #555;
}
.arrow {
  margin-left: 4px;
}

/* 顶部区域：左大卡 + 右横滑 */
.hero-row {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 18px;
  align-items: stretch;
  margin-bottom: 18px;
}
@media (max-width: 1100px) {
  .hero-row {
    grid-template-columns: 1fr;
  }
}

/* hero 大卡 */
.hero-card {
  height: 156px;
  background: linear-gradient(90deg, #cfe0ff, #dbeafe);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.hero-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hero-title {
  font-size: 28px;
  font-weight: 900;
  color: #111;
}
.hero-sub {
  font-size: 14px;
  color: #222;
  opacity: 0.8;
}
.play-btn {
  width: 42px;
  height: 42px;
  background: #22c55e;
  border-radius: 999px;
  display: grid;
  place-items: center;
}
.triangle {
  width: 0;
  height: 0;
  border-left: 12px solid #0b0b0b;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  margin-left: 2px;
}
.hero-right {
  width: 120px;
  height: 120px;
  position: relative;
}
.hero-cover {
  width: 92px;
  height: 92px;
  border-radius: 8px;
  object-fit: cover;
  position: absolute;
  right: 12px;
  top: 14px;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.hero-vinyl {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, #111 0 18%, #2a2a2a 19% 60%, #111 61% 100%);
  position: absolute;
  right: -8px;
  top: 10px;
  z-index: 1;
  opacity: 0.9;
}

/* 顶部横向小卡 */
.top-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.top-scroll::-webkit-scrollbar {
  height: 6px;
}
.top-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.top-card {
  flex: 0 0 auto;
  width: 220px;
  height: 156px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #f3f4f6;
}
.top-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.top-label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
.corner-dot {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f97316;
  opacity: 0.95;
}

/* 分区标题 */
.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 12px;
}
.section-count {
  font-size: 13px;
  color: #6b7280;
}
.section-title {
  display: flex;
  align-items: center;
  /* keep previous spacing */
}

/* 添加到我的歌单对话框 */
.add-playlist-dialog .dialog-content {
  padding: 10px 0;
}

.add-playlist-dialog .playlist-info-text {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.add-playlist-dialog .target-playlist-list {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 6px;
}

.add-playlist-dialog .target-playlist-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.add-playlist-dialog .target-playlist-item:hover {
  background-color: #fafafa;
}

.add-playlist-dialog .target-playlist-item.selected {
  background-color: #f0f9ff;
  border-color: #60a5fa;
}

.add-playlist-dialog .target-playlist-cover {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 12px;
}

.add-playlist-dialog .target-playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.add-playlist-dialog .target-playlist-name {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.add-playlist-dialog .target-playlist-count {
  font-size: 13px;
  color: #888;
}

.add-playlist-dialog .target-playlist-check {
  display: flex;
  align-items: center;
}

.add-playlist-dialog .empty-playlists {
  text-align: center;
  padding: 36px 12px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 600px) {
  .add-playlist-dialog .el-dialog {
    width: 90% !important;
  }
}
.st-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.st-icon {
  font-size: 18px;
}
.st-text {
  font-size: 18px;
  font-weight: 900;
  color: #111;
}

/* 网格歌单 */
.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
}
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.grid-card {
  cursor: pointer;
}
.img-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
}
.grid-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}
.count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
}
.grid-name {
  margin-top: 8px;
  font-size: 13px;
  color: #111;
  line-height: 1.25;
  max-height: 34px;
  overflow: hidden;
}

/* 横滑卡片（累一天了） */
.hscroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.hscroll::-webkit-scrollbar {
  height: 6px;
}
.hscroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.h-card {
  flex: 0 0 auto;
  width: 360px;
  border-radius: 12px;
  overflow: hidden;
  background: #f7f7f7;
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  cursor: pointer;
  position: relative;
}
.h-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
}
.h-meta {
  padding: 12px 10px 12px 0;
  min-width: 0;
}
.h-name {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 8px;
  border-radius: 999px;
}

/* 行标题（带播放按钮那种） */
.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 12px;
}
.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.row-title {
  font-size: 18px;
  font-weight: 900;
  color: #111;
}
.play-all {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #f3f4f6;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.play-icon {
  width: 0;
  height: 0;
  border-left: 10px solid #111;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  margin-left: 2px;
}

/* 歌曲列表（小图 + 两行） */
.song-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 18px;
}
@media (max-width: 1100px) {
  .song-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .song-list {
    grid-template-columns: 1fr;
  }
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f1f1;
  cursor: pointer;
}
.song-item:hover {
  background: #fafafa;
}
.song-cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.song-info {
  min-width: 0;
  flex: 1;
}
.song-name {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-artist {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag {
  margin-left: 8px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #fff7ed;
  color: #f59e0b;
  font-weight: 800;
  border: 1px solid #fde68a;
}

@media (max-width: 540px) {
  .song-item {
    padding: 8px;
    gap: 10px;
  }
  .song-cover {
    width: 40px;
    height: 40px;
  }
  .song-name {
    font-size: 13px;
  }
  .download-btn, .add-to-playlist-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

.download-btn {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.download-btn:hover {
  background: #f3f4f6;
  color: #22c55e;
}

.download-btn svg {
  flex-shrink: 0;
}

/* 添加到歌单按钮（与下载按钮相同样式） */
.add-to-playlist-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-size: 16px;
  padding: 0;
  margin-left: 6px;
}

.add-to-playlist-btn:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.icon-add-playlist {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 大图横滑（根据你爱的歌曲推荐） */
.big-scroll {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.big-scroll::-webkit-scrollbar {
  height: 6px;
}
.big-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.big-card {
  flex: 0 0 auto;
  width: 220px;
  cursor: pointer;
}
.big-img {
  width: 220px;
  height: 220px;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}
.big-name {
  margin-top: 10px;
  font-size: 13px;
  color: #111;
  line-height: 1.25;
  max-height: 34px;
  overflow: hidden;
}
.big-count {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

/* 红心歌曲预定 */
.heart-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 18px;
}
@media (max-width: 1100px) {
  .heart-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .heart-list {
    grid-template-columns: 1fr;
  }
}

.heart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f1f1;
  cursor: pointer;
}
.heart-item:hover {
  background: #fafafa;
}
.heart-cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.heart-info {
  min-width: 0;
  flex: 1;
}
.heart-name {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.heart-artist {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge {
  margin-left: 8px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #fff7ed;
  color: #f59e0b;
  font-weight: 800;
  border: 1px solid #fde68a;
}

@media (max-width: 540px) {
  .heart-item {
    padding: 8px;
    gap: 10px;
  }
  .heart-cover {
    width: 40px;
    height: 40px;
  }
  .heart-name {
    font-size: 13px;
  }
}
</style>
