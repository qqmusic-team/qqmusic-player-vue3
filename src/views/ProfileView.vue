<template>
  <div class="profile-page">
    <!-- 顶部用户信息区 -->
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

        <div class="desc">{{ user.desc || "暂无" }}</div>

        <div class="meta">
          <span>粉丝：{{ user.followers }}</span>
          <span class="dot">·</span>
          <span>关注：{{ user.following }}</span>
        </div>
      </div>
    </div>

    <!-- 下方内容区：tabs -->
    <div class="profile-tabs">
      <el-tabs v-model="activeTab" class="tabs">
        <!-- 我喜欢 -->
        <el-tab-pane label="我喜欢" name="liked">
          <div class="qq-toolbar">
            <div class="qq-left">
              <el-button
                round
                class="qq-btn"
                :icon="VideoPlay"
                @click="playAll('liked')"
              >
                播放
              </el-button>
              <el-button
                round
                class="qq-btn"
                :icon="Download"
                @click="downloadSelected('liked')"
              >
                下载
              </el-button>
              <el-button
                round
                class="qq-btn"
                :icon="List"
                @click="toggleBatch('liked')"
              >
                批量
              </el-button>
            </div>

            <div class="qq-right">
              <el-input
                v-model="likedKeyword"
                placeholder="搜索"
                clearable
                class="qq-search"
              />
            </div>
          </div>

          <el-table
            :data="filteredLikedSongs"
            style="width: 100%"
            header-cell-class-name="song-th"
            :row-class-name="({ row }) => (isPlayingRow(row) ? 'playing-row' : '')"
            @row-dblclick="play"
            @selection-change="(val) => handleSelectionChange('liked', val)"
          >
            <el-table-column v-if="batchMode.liked" type="selection" width="54" />

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
            <el-table-column label="时长" width="110">
              <template #default="{ row }">
                {{ row.duration || "--:--" }}
              </template>
            </el-table-column>

            <!-- hover 四按钮 + 更多 -->
            <el-table-column label="" width="220" align="right">
              <template #default="{ row }">
                <div class="row-actions">
                  <el-button
                    circle
                    text
                    :icon="isLiked(row) ? StarFilled : Star"
                    title="加入我喜欢"
                    @click.stop="toggleLike(row)"
                  />
                  <el-button
                    circle
                    text
                    :icon="Download"
                    title="下载"
                    @click.stop="downloadOne(row)"
                  />
                  <el-button
                    circle
                    text
                    :icon="Plus"
                    title="添加"
                    @click.stop="addToQueue(row)"
                  />

                  <el-dropdown
                    trigger="click"
                    @command="(cmd) => handleMore(cmd, row, 'liked')"
                  >
                    <el-button
                      circle
                      text
                      :icon="MoreFilled"
                      title="更多"
                      @click.stop
                    />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="play">播放</el-dropdown-item>
                        <el-dropdown-item command="add">添加到播放列表</el-dropdown-item>
                        <el-dropdown-item command="download">下载</el-dropdown-item>
                        <el-dropdown-item command="comments">查看评论</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 本地歌曲 -->
        <el-tab-pane label="本地歌曲" name="local">
          <div class="qq-toolbar">
            <div class="qq-left">
              <el-button
                round
                class="qq-btn"
                :icon="VideoPlay"
                @click="playAll('local')"
              >
                播放
              </el-button>
              <el-button
                round
                class="qq-btn"
                :icon="Download"
                @click="downloadSelected('local')"
              >
                下载
              </el-button>
              <el-button
                round
                class="qq-btn"
                :icon="List"
                @click="toggleBatch('local')"
              >
                批量
              </el-button>
            </div>

            <div class="qq-right">
              <el-input
                v-model="localKeyword"
                placeholder="搜索"
                clearable
                class="qq-search"
              />
            </div>
          </div>

          <el-table
            :data="filteredLocalSongs"
            style="width: 100%"
            header-cell-class-name="song-th"
            :row-class-name="({ row }) => (isPlayingRow(row) ? 'playing-row' : '')"
            @row-dblclick="play"
            @selection-change="(val) => handleSelectionChange('local', val)"
          >
            <el-table-column v-if="batchMode.local" type="selection" width="54" />

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
            <el-table-column label="时长" width="110">
              <template #default="{ row }">
                {{ row.duration || "--:--" }}
              </template>
            </el-table-column>

            <el-table-column label="" width="220" align="right">
              <template #default="{ row }">
                <div class="row-actions">
                  <el-button
                    circle
                    text
                    :icon="isLiked(row) ? StarFilled : Star"
                    title="加入我喜欢"
                    @click.stop="toggleLike(row)"
                  />
                  <el-button
                    circle
                    text
                    :icon="Download"
                    title="下载"
                    @click.stop="downloadOne(row)"
                  />
                  <el-button
                    circle
                    text
                    :icon="Plus"
                    title="添加"
                    @click.stop="addToQueue(row)"
                  />

                  <el-dropdown
                    trigger="click"
                    @command="(cmd) => handleMore(cmd, row, 'local')"
                  >
                    <el-button
                      circle
                      text
                      :icon="MoreFilled"
                      title="更多"
                      @click.stop
                    />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="play">播放</el-dropdown-item>
                        <el-dropdown-item command="add">添加到播放列表</el-dropdown-item>
                        <el-dropdown-item command="download">下载</el-dropdown-item>
                        <el-dropdown-item command="comments">查看评论</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 最近播放 -->
        <el-tab-pane label="最近播放" name="recent">
          <div class="qq-toolbar">
            <div class="qq-left">
              <el-button
                round
                class="qq-btn"
                :icon="VideoPlay"
                @click="playAll('recent')"
              >
                播放
              </el-button>
              <el-button
                round
                class="qq-btn"
                :icon="Download"
                @click="downloadSelected('recent')"
              >
                下载
              </el-button>
              <el-button
                round
                class="qq-btn"
                :icon="List"
                @click="toggleBatch('recent')"
              >
                批量
              </el-button>
            </div>

            <div class="qq-right">
              <el-input
                v-model="recentKeyword"
                placeholder="搜索"
                clearable
                class="qq-search"
              />
            </div>
          </div>

          <el-table
            :data="filteredRecentSongs"
            style="width: 100%"
            header-cell-class-name="song-th"
            :row-class-name="({ row }) => (isPlayingRow(row) ? 'playing-row' : '')"
            @row-dblclick="play"
            @selection-change="(val) => handleSelectionChange('recent', val)"
          >
            <el-table-column v-if="batchMode.recent" type="selection" width="54" />

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
            <el-table-column label="时长" width="110">
              <template #default="{ row }">
                {{ row.duration || "--:--" }}
              </template>
            </el-table-column>

            <el-table-column label="" width="220" align="right">
              <template #default="{ row }">
                <div class="row-actions">
                  <el-button
                    circle
                    text
                    :icon="isLiked(row) ? StarFilled : Star"
                    title="加入我喜欢"
                    @click.stop="toggleLike(row)"
                  />
                  <el-button
                    circle
                    text
                    :icon="Download"
                    title="下载"
                    @click.stop="downloadOne(row)"
                  />
                  <el-button
                    circle
                    text
                    :icon="Plus"
                    title="添加"
                    @click.stop="addToQueue(row)"
                  />

                  <el-dropdown
                    trigger="click"
                    @command="(cmd) => handleMore(cmd, row, 'recent')"
                  >
                    <el-button
                      circle
                      text
                      :icon="MoreFilled"
                      title="更多"
                      @click.stop
                    />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="play">播放</el-dropdown-item>
                        <el-dropdown-item command="add">添加到播放列表</el-dropdown-item>
                        <el-dropdown-item command="download">下载</el-dropdown-item>
                        <el-dropdown-item command="comments">查看评论</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import localAvatar from "../../avatar.jpg";

// ✅ Element Plus Icons（按需引入，给 el-button 的 :icon 用）
import {
  VideoPlay,
  Download,
  List,
  Plus,
  MoreFilled,
  Star,
  StarFilled,
} from "@element-plus/icons-vue";

/** 用户信息 */
const user = {
  name: "幸运函",
  vipYear: 6,
  level: 8,
  desc: "",
  followers: 2,
  following: 4,
  avatar: localAvatar,
};

const activeTab = ref("liked");

/** 默认封面 */
const defaultCover = "https://via.placeholder.com/48x48.png?text=%E2%99%AA";

/** localStorage key */
const STORAGE_KEY = "qqmusic_profile_lists_v2";
const DOWNLOAD_KEY = "qqmusic_downloads_v1";

/** 工具：生成 id */
const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

/** 三个列表（mock） */
const likedSongs = ref([
  {
    id: uid(),
    name: "因为爱情",
    artist: "陈奕迅 / 王菲",
    album: "热门歌曲合集",
    duration: "03:01",
    cover: "",
  },
  { id: uid(), name: "寂寞沙洲冷", artist: "苏晗", album: "寂寞沙洲冷", duration: "04:07", cover: "" },
]);

const localSongs = ref([
  { id: uid(), name: "起风了", artist: "吴青峰", album: "加油,你是最棒的", duration: "04:12", cover: "" },
  { id: uid(), name: "走马", artist: "陈粒", album: "如也", duration: "04:25", cover: "" },
]);

const recentSongs = ref([
  { id: uid(), name: "无人之岛", artist: "赵侃旻", album: "无人之岛", duration: "03:58", cover: "" },
  { id: uid(), name: "雨天", artist: "孙燕姿", album: "My Story 2006 新歌+精选", duration: "04:10", cover: "" },
]);

/** 下载（mock：已下载列表） */
const downloadedSongs = ref([]);

/** 搜索关键字 */
const likedKeyword = ref("");
const localKeyword = ref("");
const recentKeyword = ref("");

/** 当前播放 */
const nowPlaying = ref(null);

/** 批量模式 */
const batchMode = reactive({
  liked: false,
  local: false,
  recent: false,
});

/** 勾选项 */
const selectedMap = reactive({
  liked: [],
  local: [],
  recent: [],
});

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
const filteredLocalSongs = computed(() =>
  localSongs.value.filter((s) => matchSong(s, localKeyword.value))
);
const filteredRecentSongs = computed(() =>
  recentSongs.value.filter((s) => matchSong(s, recentKeyword.value))
);

const isSameSong = (a, b) => {
  if (!a || !b) return false;
  if (a.id && b.id) return a.id === b.id;
  return a.name === b.name && a.artist === b.artist && a.album === b.album;
};

const isPlayingRow = (row) => isSameSong(row, nowPlaying.value);

// ✅ 用于图标：喜欢/已喜欢
const isLiked = (song) => likedSongs.value.some((s) => isSameSong(s, song));

const play = (song) => {
  if (!song) return;
  nowPlaying.value = { ...song };

  // 最近播放：去重置顶
  const list = recentSongs.value;
  const idx = list.findIndex((s) => isSameSong(s, song));
  if (idx !== -1) list.splice(idx, 1);
  list.unshift({ ...song, id: song.id || uid() });
  if (list.length > 30) list.length = 30;

  activeTab.value = "recent";
};

const toggleLike = (song) => {
  if (!song) return;
  const idx = likedSongs.value.findIndex((s) => isSameSong(s, song));
  if (idx === -1) likedSongs.value.unshift({ ...song, id: song.id || uid() });
  else likedSongs.value.splice(idx, 1);
};

const addToQueue = (song) => {
  console.log("添加到播放列表:", song);
};

const downloadOne = (song) => {
  if (!song) return;
  const exists = downloadedSongs.value.some((s) => isSameSong(s, song));
  if (!exists) downloadedSongs.value.unshift({ ...song, id: song.id || uid() });
  console.log("下载:", song);
};

const toggleBatch = (type) => {
  batchMode[type] = !batchMode[type];
  selectedMap[type] = [];
};

const handleSelectionChange = (type, val) => {
  selectedMap[type] = val || [];
};

const downloadSelected = (type) => {
  (selectedMap[type] || []).forEach((s) => downloadOne(s));
};

const playAll = (type) => {
  const map = {
    liked: filteredLikedSongs.value,
    local: filteredLocalSongs.value,
    recent: filteredRecentSongs.value,
  };
  const list = map[type] || [];
  if (list.length === 0) return;
  play(list[0]);
};

const deleteSongByRow = (type, song) => {
  const map = {
    liked: likedSongs,
    local: localSongs,
    recent: recentSongs,
  };
  const target = map[type];
  const idx = target.value.findIndex((s) => isSameSong(s, song));
  if (idx !== -1) target.value.splice(idx, 1);

  if (song && isSameSong(song, nowPlaying.value)) nowPlaying.value = null;
};

const handleMore = (cmd, row, type) => {
  if (cmd === "play") play(row);
  if (cmd === "add") addToQueue(row);
  if (cmd === "download") downloadOne(row);
  if (cmd === "comments") console.log("查看评论:", row);
  if (cmd === "delete") deleteSongByRow(type, row);
};

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.liked)) likedSongs.value = data.liked;
      if (Array.isArray(data.local)) localSongs.value = data.local;
      if (Array.isArray(data.recent)) recentSongs.value = data.recent;
      if (data.nowPlaying) nowPlaying.value = data.nowPlaying;
    }

    const downRaw = localStorage.getItem(DOWNLOAD_KEY);
    if (downRaw) {
      const d = JSON.parse(downRaw);
      if (Array.isArray(d.downloaded)) downloadedSongs.value = d.downloaded;
    }
  } catch (e) {
    console.warn("读取本地存储失败：", e);
  }
});

watch(
  [likedSongs, localSongs, recentSongs, nowPlaying],
  () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        liked: likedSongs.value,
        local: localSongs.value,
        recent: recentSongs.value,
        nowPlaying: nowPlaying.value,
      })
    );
  },
  { deep: true }
);

watch(
  downloadedSongs,
  () => {
    localStorage.setItem(
      DOWNLOAD_KEY,
      JSON.stringify({ downloaded: downloadedSongs.value })
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

/* 顶部工具栏：仿 QQ 音乐（播放/下载/批量 + 搜索） */
.qq-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 10px 0 12px;
}
.qq-left {
  display: flex;
  gap: 12px;
  align-items: center;
}
.qq-btn {
  background: #f3f4f6;
  border: none;
}
.qq-right {
  display: flex;
  align-items: center;
}
.qq-search {
  width: 220px;
}

/* 歌名/歌手 cell（封面 + 两行） */
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

/* 让图标按钮更紧凑一点 */
:deep(.row-actions .el-button.is-text) {
  padding: 6px;
}
</style>
