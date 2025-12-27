<template>
  <div class="profile-page">
    <!-- 顶部用户信息区 -->
    <div class="profile-top">
      <!-- 头像区 -->
      <div class="avatar-wrap">
        <img class="avatar" :src="user.avatar" alt="avatar" />
      </div>
      <!-- 信息区 -->
      <div class="info-wrap">
        <div class="name-row">
          <div class="name">{{ user.name }}</div>
          <!-- 会员等级 -->
          <div class="badges">
            <span class="badge vip">VIP{{ user.vipYear }}年</span>
            <span class="badge level">Lv.{{ user.level }}</span>
          </div>
        </div>
        <!-- 个性签名 -->
        <div class="desc">{{ user.desc || "暂无" }}</div>
        <!-- 关注信息 -->
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
          <div class="toolbar">
            <el-input
              v-model="likedKeyword"
              placeholder="搜索：歌曲 / 歌手 / 专辑"
              clearable
              class="search"
            />
            <el-button @click="addMockSong('liked')">添加歌曲</el-button>
            <el-button type="danger" plain @click="clearList('liked')">清空</el-button>
          </div>

          <el-table
            :data="filteredLikedSongs"
            style="width: 100%"
            header-cell-class-name="song-th"
            :row-class-name="rowClassName"
            @row-dblclick="play"
          >
            <el-table-column type="index" width="70" label="序号" />
            <el-table-column prop="name" label="歌曲" min-width="220" />
            <el-table-column prop="artist" label="歌手" min-width="180" />
            <el-table-column prop="album" label="专辑" min-width="180" />

            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <span v-if="isPlayingRow(row)" class="playing-badge">正在播放</span>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" @click="play(row)">播放</el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="removeSong('liked', $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 本地歌曲 -->
        <el-tab-pane label="本地歌曲" name="local">
          <div class="toolbar">
            <el-input
              v-model="localKeyword"
              placeholder="搜索：歌曲 / 歌手 / 专辑"
              clearable
              class="search"
            />
            <el-button @click="addMockSong('local')">添加歌曲</el-button>
            <el-button type="danger" plain @click="clearList('local')">清空</el-button>
          </div>

          <el-table
            :data="filteredLocalSongs"
            style="width: 100%"
            header-cell-class-name="song-th"
            :row-class-name="rowClassName"
            @row-dblclick="play"
          >
            <el-table-column type="index" width="70" label="序号" />
            <el-table-column prop="name" label="歌曲" min-width="220" />
            <el-table-column prop="artist" label="歌手" min-width="180" />
            <el-table-column prop="album" label="专辑" min-width="180" />

            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <span v-if="isPlayingRow(row)" class="playing-badge">正在播放</span>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" @click="play(row)">播放</el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="removeSong('local', $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 最近播放 -->
        <el-tab-pane label="最近播放" name="recent">
          <div class="toolbar">
            <el-input
              v-model="recentKeyword"
              placeholder="搜索：歌曲 / 歌手 / 专辑"
              clearable
              class="search"
            />
            <el-button type="danger" plain @click="clearList('recent')">清空</el-button>
          </div>

          <el-table
            :data="filteredRecentSongs"
            style="width: 100%"
            header-cell-class-name="song-th"
            :row-class-name="rowClassName"
            @row-dblclick="play"
          >
            <el-table-column type="index" width="70" label="序号" />
            <el-table-column prop="name" label="歌曲" min-width="220" />
            <el-table-column prop="artist" label="歌手" min-width="180" />
            <el-table-column prop="album" label="专辑" min-width="180" />

            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <span v-if="isPlayingRow(row)" class="playing-badge">正在播放</span>
                <span v-else class="muted">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" @click="play(row)">播放</el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="removeSong('recent', $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import localAvatar from "../../avatar.jpg";

/** 用户信息（mock） */
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

/** localStorage key */
const STORAGE_KEY = "qqmusic_profile_lists_v1";

/** 三个列表（默认 mock） */
const likedSongs = ref([
  { name: "因为爱情", artist: "陈奕迅 / 王菲", album: "热门歌曲合集" },
  { name: "寂寞沙洲冷", artist: "苏晗", album: "寂寞沙洲冷" },
]);

const localSongs = ref([
  { name: "起风了", artist: "吴青峰", album: "加油,你是最棒的" },
  { name: "走马", artist: "陈粒", album: "如也" },
]);

const recentSongs = ref([
  { name: "无人之岛", artist: "赵侃旻", album: "无人之岛" },
  { name: "雨天", artist: "孙燕姿", album: "My Story 2006 新歌+精选" },
]);

/** 搜索关键字 */
const likedKeyword = ref("");
const localKeyword = ref("");
const recentKeyword = ref("");

/** 当前播放（标记） */
const nowPlaying = ref(null); // { name, artist, album }

/** 工具：搜索匹配 */
const matchSong = (song, kw) => {
  const k = kw.trim().toLowerCase();
  if (!k) return true;
  return [song.name, song.artist, song.album].some((v) =>
    String(v || "").toLowerCase().includes(k)
  );
};

/** 过滤后的列表 */
const filteredLikedSongs = computed(() =>
  likedSongs.value.filter((s) => matchSong(s, likedKeyword.value))
);
const filteredLocalSongs = computed(() =>
  localSongs.value.filter((s) => matchSong(s, localKeyword.value))
);
const filteredRecentSongs = computed(() =>
  recentSongs.value.filter((s) => matchSong(s, recentKeyword.value))
);

/** 判断同一首歌（高亮） */
const isSameSong = (a, b) => {
  if (!a || !b) return false;
  return a.name === b.name && a.artist === b.artist && a.album === b.album;
};

/** 行样式：高亮正在播放 */
const rowClassName = ({ row }) => {
  return isSameSong(row, nowPlaying.value) ? "playing-row" : "";
};

const isPlayingRow = (row) => isSameSong(row, nowPlaying.value);

/** 播放：并写入最近播放（去重置顶，最多30首） */
const play = (song) => {
  if (!song) return;
  nowPlaying.value = { ...song };

  // 更新最近播放：去重 + 置顶
  const list = recentSongs.value;
  const idx = list.findIndex((s) => isSameSong(s, song));
  if (idx !== -1) list.splice(idx, 1);
  list.unshift({ ...song });

  // 最多保留 30 条
  if (list.length > 30) list.length = 30;
  // 选择播放后切换到最近播放 tab
  activeTab.value = "recent";
};

/** 删除歌曲 */
const removeSong = (type, index) => {
  const map = {
    liked: likedSongs,
    local: localSongs,
    recent: recentSongs,
  };
  const target = map[type];
  if (!target?.value) return;

  const removed = target.value[index];
  target.value.splice(index, 1);

  // 如果删掉的是正在播放那首，清空播放状态
  if (removed && isSameSong(removed, nowPlaying.value)) {
    nowPlaying.value = null;
  }
};

/** 清空列表 */
const clearList = (type) => {
  if (type === "liked") likedSongs.value = [];
  if (type === "local") localSongs.value = [];
  if (type === "recent") recentSongs.value = [];

  // 如果清空后当前播放不存在了，也清掉
  const all = [...likedSongs.value, ...localSongs.value, ...recentSongs.value];
  if (nowPlaying.value && !all.some((s) => isSameSong(s, nowPlaying.value))) {
    nowPlaying.value = null;
  }
};

/** 添加 mock 歌曲 */
const addMockSong = (type) => {
  const pool = [
    { name: "晴天", artist: "周杰伦", album: "叶惠美" },
    { name: "稻香", artist: "周杰伦", album: "魔杰座" },
    { name: "红色高跟鞋", artist: "蔡健雅", album: "若你碰到他" },
    { name: "小幸运", artist: "田馥甄", album: "我的少女时代" },
    { name: "光年之外", artist: "邓紫棋", album: "光年之外" },
  ];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const song = { ...pick };

  if (type === "liked") likedSongs.value.unshift(song);
  if (type === "local") localSongs.value.unshift(song);
};

/** 读取/保存 localStorage */
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (Array.isArray(data.liked)) likedSongs.value = data.liked;
    if (Array.isArray(data.local)) localSongs.value = data.local;
    if (Array.isArray(data.recent)) recentSongs.value = data.recent;
    if (data.nowPlaying) nowPlaying.value = data.nowPlaying;
  } catch (e) {
    console.warn("读取本地存储失败：", e);
  }
});

watch(
  [likedSongs, localSongs, recentSongs, nowPlaying],
  () => {
    const data = {
      liked: likedSongs.value,
      local: localSongs.value,
      recent: recentSongs.value,
      nowPlaying: nowPlaying.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

/* 工具条 */
.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 10px 0 12px;
}

.search {
  max-width: 360px;
}

/* 正在播放标记 */
.playing-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #22c55e;
  color: #fff;
}

.muted {
  color: #9ca3af;
}

/* 高亮当前播放行（Element Plus 表格行类名） */
:deep(.playing-row td) {
  background: #ecfdf5 !important;
}
</style>
