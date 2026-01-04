<template>
  <div class="recommend-view">
    <!-- 顶部：Hi + 听歌报告 -->
    <div class="topbar">
      <h2 class="hello">Hi {{ username }} 今天为你推荐</h2>
      <div class="report" @click="goReport">
        查看你的听歌报告 <span class="arrow">›</span>
      </div>
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
      <SectionTitle title="你的私荐歌单" />
      <div class="section-count">共 {{ personalPlaylists.length }} 个</div>
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
    <SectionTitle title="累一天了，听点轻松的" />

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

    <!-- 分区 3：听「{{ likeKeyword }}」也会喜欢（歌曲列表样式） -->
    <div class="row-head">
      <div class="row-left">
        <div class="row-title">听「{{ likeKeyword }}」也会喜欢</div>
        <div class="play-all" @click="playAllSongs">
          <span class="play-icon"></span>
        </div>
      </div>
    </div>

    <div class="song-list">
      <div v-if="loading.likeSongs">
        <div v-for="i in 5" :key="'loading-' + i" class="song-item loading-card">
          <div class="loading-placeholder song-placeholder"></div>
          <div class="song-info">
            <div class="loading-text"></div>
            <div class="loading-text small"></div>
          </div>
        </div>
      </div>
      <div v-else-if="errors.likeSongs" class="song-list-error">
        <div class="error-message">{{ errors.likeSongs }}</div>
        <button class="retry-btn" @click="fetchLikeSongsData">重试</button>
      </div>
      <div
        v-else
        v-for="s in likeSongs"
        :key="s.id"
        class="song-item"
        @click="playSong(s)"
      >
        <img class="song-cover" :src="s.cover" alt="" loading="lazy" />
        <div class="song-info">
          <div class="song-name">
            {{ s.name }}
            <span v-if="s.tag" class="tag">{{ s.tag }}</span>
          </div>
          <div class="song-artist">{{ s.artist }}</div>
        </div>
        <button class="download-btn" @click.stop="downloadSong(s)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor"/>
            <path d="M4 18H20V20H4V18Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 分区 4：根据你爱的歌曲推荐（大图横滑） -->
    <SectionTitle title="根据你爱的歌曲推荐" />

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
          <span class="play-icon"></span>
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
            <img class="target-playlist-cover" :src="playlist.cover || img2" alt="" loading="lazy" />
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
import { usePersonalized, usePersonalizedWithLimit, usePersonalizedNewSong, useBanner, usePlaylistByCategory, useSimilarSongs, usePlayListTrackAll, useDownloadSong } from "@/utils/api";
import { uniqueById, dedupeById, diversify } from "@/utils/recommend";
import { ElMessage } from "element-plus";

// 导入本地图片
import img1 from '../assets/imgs/1.png';
import img2 from '../assets/imgs/2.png';
import img3 from '../assets/imgs/3.png';
import img4 from '../assets/imgs/4.png';
import img5 from '../assets/imgs/5.png';
import img6 from '../assets/imgs/6.png';
import img7 from '../assets/imgs/7.png';
import img8 from '../assets/imgs/8.png';
import img9 from '../assets/imgs/9.png';
import img10 from '../assets/imgs/10.png';
import img11 from '../assets/imgs/11.png';
import img12 from '../assets/imgs/12.png';
import img13 from '../assets/imgs/13.png';
import img14 from '../assets/imgs/14.png';
import sunDay from '../assets/imgs/sun-day.jpg';

/**
 * ✅ 后期接 API：
 * 你只需要把下面这些 mock 数组替换成接口返回的数据即可
 * 比如 onMounted(async()=> { personalPlaylists.value = await api... })
 */

// DEBUG 开关：在开发时开启可以打印详细日志，生产构建请保持 false
const DEBUG = false;
const debug = (...args) => { if (DEBUG) console.log(...args); };

const username = ref("幸运函");
const likeKeyword = ref("身骑白马");

// 添加歌单到我的歌单相关状态
const addPlaylistDialogVisible = ref(false);
const selectedPlaylist = ref(null);
const selectedTargetPlaylistId = ref(null);
const userPlaylists = ref([]);
const addingSongs = ref(false);

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
  likeSongs: true,
  lovedPlaylists: true,
  heartSongs: true,
  general: true
});

const errors = reactive({
  hero: "",
  topCards: "",
  personalPlaylists: "",
  relaxPlaylists: "",
  likeSongs: "",
  lovedPlaylists: "",
  heartSongs: ""
});

/** 顶部大卡 */
const hero = reactive({
  id: "hero1",
  title: "放松吧",
  subtitle: "尝试来点儿音乐提提神吧～",
  cover: img1,
});

/** 顶部横向小卡 */
const topCards = ref([
  {
    id: "t1",
    cover: img2,
    label: "Daily 30",
  },
  {
    id: "t2",
    cover: img3,
    label: "雷达模式",
  },
  {
    id: "t3",
    cover: img4,
    label: "杜比专区",
  },
  {
    id: "t4",
    cover: sunDay,
    label: "Favorites",
  },
]);

/** 你的私荐歌单（网格） */
const personalPlaylists = ref([
  {
    id: "p1",
    name: "「独享时光」独处是一个人的清欢",
    cover: img5,
    countText: "1.8亿",
  },
  {
    id: "p2",
    name: "短视频纯音乐｜抄作业/中勿扰",
    cover: img6,
    countText: "54.7万",
  },
  {
    id: "p3",
    name: "卷王必备：无痛学习bgm",
    cover: img7,
    countText: "152.0万",
  },
  {
    id: "p4",
    name: "一起刷题 加油",
    cover: img8,
    countText: "530.9万",
  },
  {
    id: "p5",
    name: "看书+学习｜帮你静心的纯音乐",
    cover: img9,
    countText: "923.6万",
  },
  {
    id: "p6",
    name: "热歌精选：共享宅家欢乐时光",
    cover: img10,
    countText: "9.5亿",
  },
]);

/** 累一天了（横滑） */
const relaxPlaylists = ref([
  {
    id: "r1",
    name: "静心纯音乐｜专注于内心安宁世界",
    desc: "适合放空/助眠/学习",
    cover: img11,
    countText: "2189.0万",
  },
  {
    id: "r2",
    name: "Piano Opus - Solo Piano",
    desc: "钢琴｜轻音乐",
    cover: img12,
    countText: "2.0万",
  },
  {
    id: "r3",
    name: "大案纪实｜真实案件（永久免费）",
    desc: "故事/播客/电台",
    cover: img13,
    countText: "246.8万",
  },
  {
    id: "r4",
    name: "5分钟心理学",
    desc: "私人心灵救援队",
    cover: img14,
    countText: "1288.8万",
  },
]);

/** 听「xx」也会喜欢（歌曲列表） */
const likeSongs = ref([
  {
    id: "s1",
    name: "清透",
    artist: "陈粒",
    cover: img1,
    tag: "SQ",
  },
  {
    id: "s2",
    name: "小孩",
    artist: "罗森涛",
    cover: img2,
    tag: "独家",
  },
  {
    id: "s3",
    name: "爱情讯息",
    artist: "洪一诺",
    cover: img3,
    tag: "",
  },
  {
    id: "s4",
    name: "最初的记忆",
    artist: "云汐",
    cover: img4,
    tag: "MV",
  },
  {
    id: "s5",
    name: "戒不掉",
    artist: "田馥甄",
    cover: img5,
    tag: "",
  },
]);

/** 根据你爱的歌曲推荐（大图横滑） */
const lovedPlaylists = ref([
  {
    id: "l1",
    name: "嘿 Siri，放点时下最火的歌曲",
    cover: "https://images.unsplash.com/photo-1542728929-8a2b4f9b4b36?auto=format&fit=crop&w=1100&q=60",
    countText: "1.4亿",
  },
  {
    id: "l2",
    name: "抖音流行热歌：大街小巷都在听",
    cover: "https://images.unsplash.com/photo-1520975693411-4c65e3c9cd7b?auto=format&fit=crop&w=1100&q=60",
    countText: "4969.2万",
  },
  {
    id: "l3",
    name: "古风戏腔：戏里戏外无人说",
    cover: "https://images.unsplash.com/photo-1520975958225-45c113f2f8cc?auto=format&fit=crop&w=1100&q=60",
    countText: "1.1亿",
  },
  {
    id: "l4",
    name: "一曲惊鸿梦：古风醉人间",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1100&q=60",
    countText: "1910.6万",
  },
]);

/** 红心歌曲预定（列表） */
const heartSongs = ref([
  {
    id: "h1",
    name: "Time is broken",
    artist: "Huuui",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=60",
    badge: "臻品母带",
  },
  {
    id: "h2",
    name: "Chance",
    artist: "Aspyer / Kyle Reynolds / Carly Jay",
    cover: "https://images.unsplash.com/photo-1520975693411-4c65e3c9cd7b?auto=format&fit=crop&w=300&q=60",
    badge: "臻品母带",
  },
  {
    id: "h3",
    name: "Take me hand（治愈版）",
    artist: "Leon不太冷的邓王鑫",
    cover: "https://images.unsplash.com/photo-1520975682072-9a9f0a62c87d?auto=format&fit=crop&w=300&q=60",
    badge: "全景声",
  },
]);

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

/** 交互（先简单打印，后期接你的播放器 store / api） */
const goReport = () => console.log("去听歌报告");
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

const playSong = (s) => console.log("播放歌曲", s);
const playAllSongs = () => console.log("播放该分区全部歌曲");
const playAllHeart = () => console.log("播放红心分区全部");

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
      hero.cover = firstBanner.pic || img1;
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
        cover: playlist.picUrl || img2, // 统一使用导入的本地图片
        label: playlist.name || "精选内容"
      }));
      // 写入缓存，便于下次快速展示
      writeCache('topCards', topCards.value);
    } else {
      // 如果API返回空数据，使用默认数据
      console.warn("获取到的精选内容为空或格式不正确");
      // 使用本地默认数据作为备份
      topCards.value = [
        { id: "t1", cover: img2, label: "Daily 30" },
        { id: "t2", cover: img3, label: "雷达模式" },
        { id: "t3", cover: img4, label: "杜比专区" },
        { id: "t4", cover: sunDay, label: "Favorites" }
      ];
    }
    errors.topCards = "";
  } catch (error) {
    console.error("获取topCards数据失败:", error);
    // 使用本地默认数据作为备份
    topCards.value = [
      { id: "t1", cover: img2, label: "Daily 30" },
      { id: "t2", cover: img3, label: "雷达模式" },
      { id: "t3", cover: img4, label: "杜比专区" },
      { id: "t4", cover: sunDay, label: "Favorites" }
    ];
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
        cover: playlist.picUrl || img2, // 统一使用导入的本地图片
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
                cover: pl.picUrl || img2,
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
        cover: playlist.coverImgUrl || img2,
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

const fetchLikeSongsData = async () => {
  try {
    loading.likeSongs = true;
    console.log("开始获取相似歌曲数据...");
    // 使用「身骑白马」的歌曲ID获取相似歌曲（徐佳莹版本ID：28181478）
    const similarSongs = await useSimilarSongs(28181478);
    console.log("获取到相似歌曲原始数据:", similarSongs);

    // 检查API返回的数据是否有效
    if (similarSongs && Array.isArray(similarSongs) && similarSongs.length > 0) {
      console.log("成功获取相似歌曲数据，共", similarSongs.length, "条");
      likeSongs.value = similarSongs.slice(0, 6).map((song, index) => {
        // 安全检查artists数组，注意Song类型定义中是ar字段
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
          debug(`歌曲 ${song.name} 的原始封面URL: ${cover}`);

          // 确保封面URL是完整的（包含协议）
          if (!cover.startsWith('http://') && !cover.startsWith('https://')) {
            debug(`封面URL ${cover} 不是完整URL，使用默认图片`);
            cover = null;
          } else {
            // 确保URL格式正确
            try {
              new URL(cover);
              debug(`有效封面URL: ${cover}`);
            } catch {
              debug(`封面URL ${cover} 格式错误，使用默认图片`);
              cover = null;
            }
          }
        }

        // 如果没有有效封面，使用默认图片
        if (!cover) {
          cover = img2;
          debug(`歌曲 ${song.name} 使用默认封面: ${cover}`);
        }

        debug(`第${index+1}首歌曲 - ID: ${song.id}, 名称: ${song.name}, 封面: ${cover}`);

        return {
          id: song.id || `like-song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: song.name || "未知歌曲",
          artist: artists,
          cover: cover,
          tag: song.fee === 0 ? "" : "付费"
        };
      });
      writeCache('likeSongs', likeSongs.value);
    } else {
      console.warn("获取到的相似歌曲数据为空或格式不正确，使用默认数据");
      // 如果API返回空数据，保持原有默认数据结构
    }
    errors.likeSongs = "";
  } catch (error) {
    console.error("获取likeSongs数据失败:", error);
    errors.likeSongs = "获取相似歌曲失败，请稍后重试";
  } finally {
    loading.likeSongs = false;
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
        cover: playlist.picUrl || img2,
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

        // 如果没有有效封面，使用默认图片
        if (!cover) {
          cover = img2;
          console.log(`红心歌曲 ${song.name} 使用默认封面: ${cover}`);
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
      // 如果API返回空，确保显示默认数据而不是空白
      heartSongs.value = [
        {
          id: "h1",
          name: "Time is broken",
          artist: "Huuui",
          cover: img2,
          badge: "臻品母带",
        },
        {
          id: "h2",
          name: "Chance",
          artist: "Aspyer / Kyle Reynolds / Carly Jay",
          cover: img2,
          badge: "臻品母带",
        },
        {
          id: "h3",
          name: "Take me hand（治愈版）",
          artist: "Leon不太冷的邓王鑫",
          cover: img2,
          badge: "全景声",
        },
      ];
    }
    errors.heartSongs = "";
  } catch (error) {
    console.error("获取heartSongs数据失败:", error);
    // 显示更详细的错误信息以便调试
    errors.heartSongs = "获取红心歌曲失败，请稍后重试";
    // 在严重错误情况下，确保显示默认数据
    heartSongs.value = [
      {
        id: "h1",
        name: "Time is broken",
        artist: "Huuui",
        cover: img2,
        badge: "臻品母带",
      },
      {
        id: "h2",
        name: "Chance",
        artist: "Aspyer / Kyle Reynolds / Carly Jay",
        cover: img2,
        badge: "臻品母带",
      },
      {
        id: "h3",
        name: "Take me hand（治愈版）",
        artist: "Leon不太冷的邓王鑫",
        cover: img2,
        badge: "全景声",
      },
    ];
  } finally {
    loading.heartSongs = false;
  }
};

// 本地缓存与超时工具
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 小时
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

    // 先尝试从异步缓存（IndexedDB / localStorage 回退）读取，异步注入以避免阻塞主线程
    readCache('topCards').then(c => { if (c) topCards.value = c; });
    readCache('personalPlaylists').then(c => { if (c) personalPlaylists.value = c; });
    readCache('relaxPlaylists').then(c => { if (c) relaxPlaylists.value = c; });
    readCache('likeSongs').then(c => { if (c) likeSongs.value = c; });
    readCache('lovedPlaylists').then(c => { if (c) lovedPlaylists.value = c; });
    readCache('heartSongs').then(c => { if (c) heartSongs.value = c; });

    // 背景迁移：将 legacy localStorage 缓存迁移到 IndexedDB（避免未来同步 localStorage 解析导致主线程卡顿）
    setTimeout(async () => {
      try {
        const keys = ['topCards','personalPlaylists','relaxPlaylists','likeSongs','lovedPlaylists','heartSongs'];
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
    await Promise.all([
      runGuardedFetch('hero', fetchHeroData, 8000),
      runGuardedFetch('topCards', fetchTopCardsData, 8000),
      runGuardedFetch('personalPlaylists', fetchPersonalPlaylistsData, 8000),
      runGuardedFetch('likeSongs', fetchLikeSongsData, 8000)
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
});

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
    const origTop = uniqueById(topCards.value);
    topCards.value = dedupeById(origTop, seen);
    topCards.value = diversify(topCards.value, 4, (i) => i.label || i.id);
    writeCache('topCards', topCards.value);

    const origPersonal = uniqueById(personalPlaylists.value);
    personalPlaylists.value = dedupeById(origPersonal, seen);
    personalPlaylists.value = diversify(personalPlaylists.value, 6, (i) => (i.name && i.name[0]) || i.id);
    writeCache('personalPlaylists', personalPlaylists.value);

    const origRelax = uniqueById(relaxPlaylists.value);
    relaxPlaylists.value = dedupeById(origRelax, seen);
    relaxPlaylists.value = diversify(relaxPlaylists.value, 4, (i) => (i.name && i.name[0]) || i.id);
    writeCache('relaxPlaylists', relaxPlaylists.value);

    const origLike = uniqueById(likeSongs.value);
    likeSongs.value = dedupeById(origLike, seen);
    likeSongs.value = diversify(likeSongs.value, 6, (i) => (i.artist && i.artist.split('/')[0]) || i.id);
    writeCache('likeSongs', likeSongs.value);

    const origLoved = uniqueById(lovedPlaylists.value);
    lovedPlaylists.value = dedupeById(origLoved, seen);
    lovedPlaylists.value = diversify(lovedPlaylists.value, 4, (i) => (i.name && i.name[0]) || i.id);
    writeCache('lovedPlaylists', lovedPlaylists.value);

    const origHeart = uniqueById(heartSongs.value);
    heartSongs.value = dedupeById(origHeart, seen);
    heartSongs.value = diversify(heartSongs.value, 3, (i) => (i.artist && i.artist.split('/')[0]) || i.id);
    writeCache('heartSongs', heartSongs.value);

    debug('[RecommendView] harmonizeSections 完成, 每个区去重与多样性已应用');
    debug('[harmonize] counts', {
      top: topCards.value.length,
      personal: personalPlaylists.value.length,
      relax: relaxPlaylists.value.length,
      like: likeSongs.value.length,
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
}
.song-info {
  min-width: 0;
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
}

.download-btn:hover {
  background: #f3f4f6;
  color: #22c55e;
}

.download-btn svg {
  flex-shrink: 0;
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
}
.heart-info {
  min-width: 0;
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
</style>
