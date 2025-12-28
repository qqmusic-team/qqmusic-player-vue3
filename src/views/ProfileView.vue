<template>
  <div class="profile-page">
    <!-- 顶部导航（只负责本页返回/前进，不传路由操作，传禁用状态） -->
    <div class="profile-nav">
      <NavigationControls
        @back="handleBack"
        @forward="handleForward"
        :can-back="canBack"
        :can-forward="canForward"
      />
    </div>

    <!-- 顶部用户信息区（保留：头像+昵称+VIP+粉丝关注） -->
    <div class="profile-top">
      <div class="avatar-wrap">
        <img class="avatar" :src="user.avatar" alt="avatar" />
      </div>

      <div class="info-wrap">
        <div class="name-row">
          <div class="name">{{ user.name }}</div>

          <div class="badges">
            <span class="badge vip">VIP{{ user.vipYear }}年</span>
            <span class="badge level">Lv.{{ user.level }}</span>
          </div>
        </div>

        <div class="desc">{{ user.signature || "这个人很懒，什么也没写～" }}</div>

        <div class="meta">
          <span>粉丝：{{ user.followers }}</span>
          <span class="dot">·</span>
          <span>关注：{{ user.following }}</span>
        </div>
      </div>
    </div>

    <!-- 下方模块区：3个模块（不和侧边栏重复） -->
    <div class="profile-tabs">
      <el-tabs v-model="activeTab" class="tabs">
        <!-- 模块 1：音乐 -->
        <el-tab-pane label="音乐" name="music">
          <div class="section">
            <div class="section-hd">
              <div class="section-title">我喜欢的音乐</div>
              <div class="section-actions">
                <el-button round class="qq-btn" :icon="VideoPlay" @click="playLiked">
                  播放
                </el-button>
              </div>
            </div>

            <!-- 仿手机那种“我喜欢的音乐”卡片 -->
            <div class="liked-card" @click="openLikedDrawer">
              <img class="liked-cover" :src="likedCover" alt="" />
              <div class="liked-meta">
                <div class="liked-name">我喜欢的音乐</div>
                <div class="liked-sub">
                  {{ likedSongs.length }} 首 · 播放 {{ likedPlayCount }} 次
                </div>
              </div>
              <div class="liked-right">
                <el-button circle :icon="VideoPlay" />
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-hd">
              <div class="section-title">我创建的歌单</div>
              <div class="section-actions">
                <el-button round class="qq-btn" :icon="Plus" @click="createPlaylist">
                  新建歌单
                </el-button>
              </div>
            </div>

            <!-- 歌单列表（像你第一张图那种列表风格） -->
            <div class="playlist-list">
              <div
                v-for="pl in playlists"
                :key="pl.id"
                class="playlist-row"
                @click="openPlaylist(pl)"
              >
                <img class="pl-cover" :src="pl.cover || defaultCover" alt="" />
                <div class="pl-meta">
                  <div class="pl-name">{{ pl.name }}</div>
                  <div class="pl-sub">
                    歌单 · {{ pl.tracks.length }} 首 · {{ pl.creator }}
                  </div>
                </div>

                <div class="pl-actions" @click.stop>
                  <el-button circle text :icon="MoreFilled" @click="openPlaylist(pl)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 喜欢歌曲抽屉（不改路由，在本页内看表格） -->
          <el-drawer
            v-model="likedDrawerOpen"
            size="60%"
            :with-header="false"
            class="drawer"
          >
            <div class="drawer-hd">
              <div class="drawer-title">我喜欢的音乐（{{ likedSongs.length }}）</div>
              <div class="drawer-actions">
                <el-input
                  v-model="likedKeyword"
                  placeholder="搜索喜欢的歌"
                  clearable
                  class="drawer-search"
                />
                <el-button round class="qq-btn" :icon="VideoPlay" @click="playLiked">
                  播放
                </el-button>
              </div>
            </div>

            <el-table
              :data="filteredLikedSongs"
              style="width: 100%"
              header-cell-class-name="song-th"
              :row-class-name="({ row }) => (isPlayingRow(row) ? 'playing-row' : '')"
              @row-dblclick="playSong"
            >
              <el-table-column label="歌名/歌手" min-width="360">
                <template #default="{ row }">
                  <div class="song-cell">
                    <img class="cover" :src="row.cover || defaultCover" alt="" />
                    <div class="meta2">
                      <div class="title">
                        {{ row.name }}
                        <span v-if="isPlayingRow(row)" class="playing-dot">●</span>
                      </div>
                      <div class="sub">{{ row.artist }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="album" label="专辑" min-width="220" />
              <el-table-column prop="duration" label="时长" width="110" />

              <el-table-column label="" width="140" align="right">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button circle text :icon="VideoPlay" title="播放" @click.stop="playSong(row)" />
                    <el-button circle text :icon="StarFilled" title="喜欢" />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-drawer>

          <!-- 歌单详情抽屉（点歌单进去，看歌单的歌：像你第二张图） -->
          <el-drawer
            v-model="playlistDrawerOpen"
            size="70%"
            :with-header="false"
            class="drawer"
          >
            <div class="drawer-hd">
              <div class="drawer-title">
                {{ currentPlaylist?.name || "歌单" }}
                <span class="drawer-sub">（{{ currentPlaylist?.tracks?.length || 0 }} 首）</span>
              </div>

              <div class="drawer-actions">
                <el-input
                  v-model="playlistKeyword"
                  placeholder="搜索歌单内歌曲"
                  clearable
                  class="drawer-search"
                />
                <el-button round class="qq-btn" :icon="VideoPlay" @click="playPlaylist">
                  播放
                </el-button>
              </div>
            </div>

            <el-table
              :data="filteredPlaylistTracks"
              style="width: 100%"
              header-cell-class-name="song-th"
              :row-class-name="({ row }) => (isPlayingRow(row) ? 'playing-row' : '')"
              @row-dblclick="playSong"
            >
              <el-table-column label="歌名/歌手" min-width="360">
                <template #default="{ row }">
                  <div class="song-cell">
                    <img class="cover" :src="row.cover || defaultCover" alt="" />
                    <div class="meta2">
                      <div class="title">
                        {{ row.name }}
                        <span v-if="isPlayingRow(row)" class="playing-dot">●</span>
                      </div>
                      <div class="sub">{{ row.artist }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="album" label="专辑" min-width="220" />
              <el-table-column prop="duration" label="时长" width="110" />
              <el-table-column label="" width="140" align="right">
                <template #default="{ row }">
                  <div class="row-actions">
                    <el-button circle text :icon="VideoPlay" title="播放" @click.stop="playSong(row)" />
                    <el-button circle text :icon="Plus" title="添加到播放列表" />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-drawer>
        </el-tab-pane>

        <!-- 模块 2：听歌报告 -->
        <el-tab-pane label="听歌报告" name="report">
          <div class="report-wrap">
            <div class="report-card">
              <div class="report-title">听歌报告</div>
              <div class="report-main">
                <div class="report-big">
                  本月已听 <span class="report-num">{{ report.monthCount }}</span> 首
                </div>
                <div class="report-sub">（示例数据，后期可用 API 替换）</div>
              </div>

              <div class="report-row">
                <div class="kw-title">#今日关键字</div>
                <div class="kw">{{ report.keyword }}</div>
                <div class="kw-desc">
                  {{ report.keywordDesc }}
                </div>
              </div>
            </div>

            <div class="report-card">
              <div class="report-title">今日最常听</div>
              <div class="top-song">
                <img class="top-cover" :src="report.topSong.cover || defaultCover" alt="" />
                <div class="top-meta">
                  <div class="top-name">{{ report.topSong.name }}</div>
                  <div class="top-sub">{{ report.topSong.artist }} · {{ report.topSong.album }}</div>
                </div>
                <el-button round class="qq-btn" :icon="VideoPlay" @click="playSong(report.topSong)">
                  播放
                </el-button>
              </div>

              <div class="comments-title">精选评论（示例）</div>
              <div class="comment-list">
                <div v-for="c in report.comments" :key="c.id" class="comment-item">
                  <img class="comment-avatar" :src="c.avatar" alt="" />
                  <div class="comment-body">
                    <div class="comment-name">{{ c.user }}</div>
                    <div class="comment-content">{{ c.content }}</div>
                    <div class="comment-meta">👍 {{ c.likes }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 模块 3：个人资料 -->
        <el-tab-pane label="个人资料" name="info">
          <div class="info-wrap2">
            <div class="info-card">
              <div class="info-hd">
                <div class="info-title">个人详细资料</div>
                <el-button round class="qq-btn" :icon="Edit" @click="editOpen = true">
                  编辑
                </el-button>
              </div>

              <el-descriptions :column="2" border>
                <el-descriptions-item label="昵称">{{ user.name }}</el-descriptions-item>
                <el-descriptions-item label="生日">{{ user.birthday }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ user.gender }}</el-descriptions-item>
                <el-descriptions-item label="地区">{{ user.region }}</el-descriptions-item>
                <el-descriptions-item label="签名" :span="2">{{ user.signature }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <!-- 编辑资料弹窗 -->
          <el-dialog v-model="editOpen" title="编辑个人资料" width="520px">
            <el-form :model="editForm" label-width="80px">
              <el-form-item label="昵称">
                <el-input v-model="editForm.name" />
              </el-form-item>
              <el-form-item label="生日">
                <el-input v-model="editForm.birthday" placeholder="例如：2004-06-18" />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="editForm.gender" placeholder="选择">
                  <el-option label="女" value="女" />
                  <el-option label="男" value="男" />
                  <el-option label="保密" value="保密" />
                </el-select>
              </el-form-item>
              <el-form-item label="地区">
                <el-input v-model="editForm.region" placeholder="例如：广东 深圳" />
              </el-form-item>
              <el-form-item label="签名">
                <el-input v-model="editForm.signature" type="textarea" :rows="3" />
              </el-form-item>
            </el-form>

            <template #footer>
              <el-button @click="editOpen = false">取消</el-button>
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </template>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import NavigationControls from "@/components/layout/NavigationControls.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import localAvatar from "@/assets/imgs/avatar.jpg";

import {
  VideoPlay,
  Plus,
  MoreFilled,
  StarFilled,
  Edit,
} from "@element-plus/icons-vue";

// --------------- 核心：局部状态栈（实现本页前进/后退） ---------------
// 存储页面内的操作历史状态
const historyStack = ref([]);
// 当前状态的指针（指向 historyStack 的索引）
const currentHistoryIndex = ref(-1);

// 定义页面的「核心状态」：记录需要回退/前进的关键信息
function getCurrentPageState() {
  return {
    activeTab: activeTab.value, // 当前标签页
    likedDrawerOpen: likedDrawerOpen.value, // 喜欢抽屉是否打开
    playlistDrawerOpen: playlistDrawerOpen.value, // 歌单抽屉是否打开
    currentPlaylistId: currentPlaylist.value?.id || null, // 当前打开的歌单ID
  };
}

// 初始化状态栈：页面加载时存入初始状态
function initHistory() {
  const initState = getCurrentPageState();
  historyStack.value = [initState];
  currentHistoryIndex.value = 0;
}

// 新增状态到栈中（每次操作页面时调用）
function pushHistoryState() {
  const newState = getCurrentPageState();
  // 1. 如果当前不是在栈的末尾（比如回退了几步后又操作），先截断后面的历史
  if (currentHistoryIndex.value < historyStack.value.length - 1) {
    historyStack.value.splice(currentHistoryIndex.value + 1);
  }
  // 2. 存入新状态，指针前进
  historyStack.value.push(newState);
  currentHistoryIndex.value = historyStack.value.length - 1;
}

// 前进/后退按钮禁用状态（传给子组件）
const canBack = computed(() => currentHistoryIndex.value > 0);
const canForward = computed(() =>
  currentHistoryIndex.value < historyStack.value.length - 1
);

// 后退：指针减1，恢复历史状态
const handleBack = () => {
  if (currentHistoryIndex.value <= 0) return; // 已经是最开始的状态
  currentHistoryIndex.value--;
  const prevState = historyStack.value[currentHistoryIndex.value];
  // 恢复状态到页面
  activeTab.value = prevState.activeTab;
  likedDrawerOpen.value = prevState.likedDrawerOpen;
  playlistDrawerOpen.value = prevState.playlistDrawerOpen;
  // 恢复当前歌单
  if (prevState.currentPlaylistId) {
    currentPlaylist.value = playlists.value.find(
      (pl) => pl.id === prevState.currentPlaylistId
    );
  } else {
    currentPlaylist.value = null;
  }
};

// 前进：指针加1，恢复历史状态
const handleForward = () => {
  if (currentHistoryIndex.value >= historyStack.value.length - 1) return; // 已经是最新状态
  currentHistoryIndex.value++;
  const nextState = historyStack.value[currentHistoryIndex.value];
  // 恢复状态到页面
  activeTab.value = nextState.activeTab;
  likedDrawerOpen.value = nextState.likedDrawerOpen;
  playlistDrawerOpen.value = nextState.playlistDrawerOpen;
  if (nextState.currentPlaylistId) {
    currentPlaylist.value = playlists.value.find(
      (pl) => pl.id === nextState.currentPlaylistId
    );
  } else {
    currentPlaylist.value = null;
  }
};
// --------------- 状态栈逻辑结束 ---------------

/** localStorage keys */
const PROFILE_KEY = "qqmusic_profile_user_v1";
const MUSIC_KEY = "qqmusic_profile_music_v1";

/** 默认封面 */
const defaultCover = "https://via.placeholder.com/80x80.png?text=%E2%99%AA";

/** 用户信息（示例，可编辑保存） */
const user = reactive({
  name: "幸运函",
  vipYear: 6,
  level: 8,
  followers: 2,
  following: 4,
  avatar: localAvatar,

  birthday: "2006-06-21",
  gender: "男",
  region: "未知",
  signature: "今天也要听很多好听的歌～",
});

/** Tabs：默认音乐模块 */
const activeTab = ref("music");

/** 播放状态（只做样子） */
const nowPlaying = ref(null);
const isSameSong = (a, b) => a && b && a.name === b.name && a.artist === b.artist && a.album === b.album;
const isPlayingRow = (row) => isSameSong(row, nowPlaying.value);

function playSong(song) {
  nowPlaying.value = { ...song };
}

/** ========= 模块1：音乐（喜欢 + 歌单） ========= */

/** 我喜欢的音乐（示例数据） */
const likedSongs = ref([
  {
    name: "无人之岛",
    artist: "赵侃旻",
    album: "无人之岛",
    duration: "03:58",
    cover: "https://p2.music.126.net/6v0vU6oB0pT3JxY9e7v3xQ==/109951165779738588.jpg",
  },
  {
    name: "走马",
    artist: "陈粒",
    album: "如也",
    duration: "04:25",
    cover: "https://p2.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg",
  },
  {
    name: "起风了",
    artist: "吴青峰",
    album: "加油,你是最棒的",
    duration: "04:12",
    cover: "https://p2.music.126.net/1JQG6mTg7yq3cQdP8cC0KQ==/109951164197113289.jpg",
  },
]);

const likedCover = computed(() => likedSongs.value[0]?.cover || defaultCover);
const likedPlayCount = ref(1913); // 模拟

/** 歌单（示例数据） */
const playlists = ref([
  {
    id: "pl_2024",
    name: "2024年度歌单",
    creator: user.name,
    cover: "https://p2.music.126.net/4JHj9s8pHq2n9nXv2c7p7Q==/109951165779738588.jpg",
    tracks: [
      {
        name: "晴天",
        artist: "周杰伦",
        album: "叶惠美",
        duration: "04:29",
        cover: "https://p2.music.126.net/6v0vU6oB0pT3JxY9e7v3xQ==/109951165779738588.jpg",
      },
      {
        name: "稻香",
        artist: "周杰伦",
        album: "魔杰座",
        duration: "03:43",
        cover: "https://p2.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg",
      },
      {
        name: "夜曲",
        artist: "周杰伦",
        album: "十一月的萧邦",
        duration: "03:46",
        cover: "https://p2.music.126.net/1JQG6mTg7yq3cQdP8cC0KQ==/109951164197113289.jpg",
      },
    ],
  },
  {
    id: "pl_relax",
    name: "累一天了，听点轻松的",
    creator: user.name,
    cover: "https://p2.music.126.net/0Vxgq5mH5Xy6bKqgGmW4yQ==/109951165079117290.jpg",
    tracks: [
      { name: "雨天", artist: "孙燕姿", album: "My Story", duration: "04:10", cover: "" },
      { name: "因为爱情", artist: "陈奕迅 / 王菲", album: "热门歌曲合集", duration: "03:01", cover: "" },
    ],
  },
]);

/** 抽屉：喜欢 & 歌单 */
const likedDrawerOpen = ref(false);
const playlistDrawerOpen = ref(false);
const currentPlaylist = ref(null);

/** 搜索 */
const likedKeyword = ref("");
const playlistKeyword = ref("");

const matchSong = (song, kw) => {
  const k = kw.trim().toLowerCase();
  if (!k) return true;
  return [song.name, song.artist, song.album].some((v) =>
    String(v || "").toLowerCase().includes(k)
  );
};

const filteredLikedSongs = computed(() =>
  likedSongs.value.filter((s) => matchSong(s, likedKeyword.value))
);

const filteredPlaylistTracks = computed(() => {
  const list = currentPlaylist.value?.tracks || [];
  return list.filter((s) => matchSong(s, playlistKeyword.value));
});

/** 打开喜欢 */
function openLikedDrawer() {
  likedDrawerOpen.value = true;
  pushHistoryState(); // 记录操作状态
}

function playLiked() {
  if (filteredLikedSongs.value.length) playSong(filteredLikedSongs.value[0]);
}

/** 打开歌单详情（本页抽屉，不改路由） */
function openPlaylist(pl) {
  currentPlaylist.value = pl;
  playlistKeyword.value = "";
  playlistDrawerOpen.value = true;
  pushHistoryState(); // 记录操作状态
}

function playPlaylist() {
  const list = filteredPlaylistTracks.value;
  if (list.length) playSong(list[0]);
}

/** 新建歌单（示例） */
async function createPlaylist() {
  const name = prompt("输入歌单名：");
  if (!name) return;

  playlists.value.unshift({
    id: `pl_${Date.now()}`,
    name,
    creator: user.name,
    cover: defaultCover,
    tracks: [],
  });
  pushHistoryState(); // 记录操作状态
}

/** ========= 模块2：听歌报告（示例数据） ========= */
const report = reactive({
  monthCount: 531,
  keyword: "自己",
  keywordDesc:
    "最近你听的歌曲中频繁出现了“自己”这个词，像是在提醒你：保持坚定、保持热爱。",
  topSong: {
    name: "温柔",
    artist: "五月天",
    album: "我们",
    duration: "04:29",
    cover: "https://p2.music.126.net/6v0vU6oB0pT3JxY9e7v3xQ==/109951165779738588.jpg",
  },
  comments: [
    {
      id: "c1",
      user: "小丸子",
      avatar: "https://via.placeholder.com/40x40.png?text=U",
      content: "这首歌真的会把人拉回某个夏天。",
      likes: 532,
    },
    {
      id: "c2",
      user: "阿拉丁",
      avatar: "https://via.placeholder.com/40x40.png?text=U",
      content: "听着听着就安静下来了。",
      likes: 318,
    },
    {
      id: "c3",
      user: "星星",
      avatar: "https://via.placeholder.com/40x40.png?text=U",
      content: "原来我也在寻找“温柔”。",
      likes: 210,
    },
  ],
});

/** ========= 模块3：个人资料（可编辑保存） ========= */
const editOpen = ref(false);
const editForm = reactive({
  name: user.name,
  birthday: user.birthday,
  gender: user.gender,
  region: user.region,
  signature: user.signature,
});

function saveProfile() {
  user.name = editForm.name;
  user.birthday = editForm.birthday;
  user.gender = editForm.gender;
  user.region = editForm.region;
  user.signature = editForm.signature;

  editOpen.value = false;
  pushHistoryState(); // 记录操作状态
}

/** ========= 监听操作 & 初始化 ========= */
// 监听标签切换，自动存入状态
watch(activeTab, () => {
  pushHistoryState();
});

// 监听抽屉关闭，记录状态
watch(likedDrawerOpen, (newVal) => {
  if (!newVal) pushHistoryState();
});

watch(playlistDrawerOpen, (newVal) => {
  if (!newVal) pushHistoryState();
});

/** ========= 持久化（保存到 localStorage） ========= */
onMounted(() => {
  // 初始化状态栈
  initHistory();

  try {
    const u = localStorage.getItem(PROFILE_KEY);
    if (u) {
      const parsed = JSON.parse(u);
      Object.assign(user, parsed);
      Object.assign(editForm, {
        name: user.name,
        birthday: user.birthday,
        gender: user.gender,
        region: user.region,
        signature: user.signature,
      });
    }

    const m = localStorage.getItem(MUSIC_KEY);
    if (m) {
      const parsed = JSON.parse(m);
      if (Array.isArray(parsed.likedSongs)) likedSongs.value = parsed.likedSongs;
      if (Array.isArray(parsed.playlists)) playlists.value = parsed.playlists;
      if (typeof parsed.likedPlayCount === "number") likedPlayCount.value = parsed.likedPlayCount;
    }
  } catch (e) {
    console.warn("读取本地存储失败：", e);
  }
});

watch(
  () => ({ ...user }),
  () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  },
  { deep: true }
);

watch(
  [likedSongs, playlists, likedPlayCount],
  () => {
    localStorage.setItem(
      MUSIC_KEY,
      JSON.stringify({
        likedSongs: likedSongs.value,
        playlists: playlists.value,
        likedPlayCount: likedPlayCount.value,
      })
    );
  },
  { deep: true }
);
</script>

<style scoped>
.profile-page {
  padding: 16px 20px;
}

/* 顶部用户信息区 */
.profile-top {
  display: flex;
  gap: 28px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.avatar-wrap {
  width: 160px;
  display: flex;
  justify-content: center;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e7eb;
}

.info-wrap {
  flex: 1;
  padding-top: 6px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.name {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.1;
}

.badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  background: #f3f4f6;
}

.badge.vip {
  background: #22c55e;
  color: white;
}

.badge.level {
  background: #8b5cf6;
  color: white;
}

.desc {
  margin-top: 14px;
  color: #6b7280;
}

.meta {
  margin-top: 18px;
  color: #111827;
  font-size: 14px;
}

.dot {
  margin: 0 10px;
  color: #9ca3af;
}

/* tabs */
.profile-tabs {
  margin-top: 6px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
}

:deep(.song-th) {
  font-weight: 700;
}

/* 通用按钮 */
.qq-btn {
  background: #f3f4f6;
  border: none;
}

/* 模块区块 */
.section {
  margin-bottom: 18px;
}
.section-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 10px;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
}
.section-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* “我喜欢的音乐”卡片 */
.liked-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  cursor: pointer;
}
.liked-card:hover {
  background: #f3f4f6;
}
.liked-cover {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  background: #eee;
}
.liked-meta {
  flex: 1;
  min-width: 0;
}
.liked-name {
  font-weight: 900;
  font-size: 18px;
  color: #111;
}
.liked-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
}
.liked-right {
  display: flex;
  align-items: center;
}

/* 歌单列表 */
.playlist-list {
  display: flex;
  flex-direction: column;
}
.playlist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 10px;
  cursor: pointer;
}
.playlist-row:hover {
  background: #f9fafb;
}
.pl-cover {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  background: #eee;
}
.pl-meta {
  flex: 1;
  min-width: 0;
}
.pl-name {
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.playlist-row:hover .pl-actions {
  opacity: 1;
}

/* 抽屉 */
.drawer-hd {
  padding: 12px 10px;
  border-bottom: 1px solid #f0f2f5;
}
.drawer-title {
  font-size: 18px;
  font-weight: 900;
}
.drawer-sub {
  font-size: 12px;
  color: #777;
  margin-left: 6px;
}
.drawer-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.drawer-search {
  width: 260px;
}

/* 表格里的“歌名/歌手 cell（封面 + 两行）” */
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

/* 正在播放高亮 */
:deep(.playing-row td) {
  background: #ecfdf5 !important;
}
.playing-dot {
  margin-left: 8px;
  font-size: 12px;
  color: #22c55e;
}

/* hover 行显示 actions */
.row-actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
:deep(.el-table__row:hover) .row-actions {
  opacity: 1;
  transform: translateY(0);
}

/* 报告模块 */
.report-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.report-card {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #f0f2f5;
  padding: 16px;
}
.report-title {
  font-size: 18px;
  font-weight: 900;
}
.report-main {
  margin-top: 10px;
}
.report-big {
  font-size: 18px;
  font-weight: 800;
}
.report-num {
  font-size: 40px;
  font-weight: 900;
}
.report-sub {
  margin-top: 6px;
  color: #777;
  font-size: 12px;
}
.report-row {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
}
.kw-title {
  font-weight: 900;
}
.kw {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 900;
}
.kw-desc {
  margin-top: 10px;
  color: #444;
  line-height: 1.7;
}
.top-song {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.top-cover {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  background: #eee;
}
.top-meta {
  flex: 1;
  min-width: 0;
}
.top-name {
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.top-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.comments-title {
  margin-top: 14px;
  font-weight: 900;
}
.comment-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 10px;
  background: #f9fafb;
}
.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  background: #eee;
}
.comment-body {
  flex: 1;
}
.comment-name {
  font-weight: 900;
}
.comment-content {
  margin-top: 6px;
  color: #333;
  line-height: 1.6;
}
.comment-meta {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
}

/* 个人资料模块 */
.info-wrap2 {
  padding-top: 6px;
}
.info-card {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #f0f2f5;
  padding: 16px;
}
.info-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.info-title {
  font-size: 18px;
  font-weight: 900;
}
</style>
