﻿<template>
  <div class="profile-page">
    <!-- 顶部导航（只负责本页返回/前进，不传路由操作，传禁用状态） -->

    <!-- 顶部用户信息区（保留：头像+昵称+VIP+粉丝关注） -->
    <div class="profile-top">
      <div class="avatar-wrap">
        <img class="avatar" :src="user?.avatar || defaultCoverImg" alt="avatar" />
      </div>

      <div class="info-wrap">
        <div class="name-row">
          <div class="name">{{ user?.name || "加载中..." }}</div>
        </div>

        <div class="desc">{{ user?.signature || "这个人很懒，什么也没写～" }}</div>
      </div>
    </div>

    <!-- 下方模块区：3个模块（不和侧边栏重复） -->
    <div class="profile-tabs">
      <el-tabs v-model="activeTab" class="tabs">
        <!-- 模块 1：音乐 -->
        <el-tab-pane label="音乐" name="music">
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
              <!-- 加载状态 -->
              <div v-if="isLoading" class="loading-state">
                <el-skeleton :rows="3" animated />
              </div>

              <!-- 错误状态 -->
              <div v-else-if="loadError" class="error-state">
                <div class="error-message">加载歌单失败，请稍后重试</div>
                <el-button type="primary" @click="handleReload">重新加载</el-button>
              </div>

              <!-- 空数据状态 -->
              <div v-else-if="playlists.length === 0" class="empty-state">
                <div class="empty-message">暂无创建的歌单</div>
              </div>

              <!-- 歌单列表 -->
              <div
                v-else
                v-for="pl in playlists"
                :key="pl.id"
                class="playlist-row"
                @click="openPlaylist(pl)"
              >
                <img class="pl-cover" :src="pl.cover || defaultCover" alt="" />
                <div class="pl-meta">
                  <div class="pl-name">{{ pl.name }}</div>
                  <div class="pl-sub">歌单 · {{ pl.tracks.length }} 首 · {{ pl.creator }}</div>
                </div>

                <div class="pl-actions" @click.stop>
                  <el-button circle text :icon="MoreFilled" @click="openPlaylist(pl)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 歌单详情抽屉（点歌单进去，看歌单的歌：像你第二张图） -->
          <el-drawer v-model="playlistDrawerOpen" size="70%" :with-header="false" class="drawer">
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
              @row-click="playSong"
            >
              <el-table-column label="歌名/歌手" min-width="360">
                <template #default>
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
                <template>
                  <div class="row-actions">
                    <el-button circle text :icon="Plus" title="添加到播放列表" />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-drawer>
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
                <el-descriptions-item label="昵称">{{
                  user?.name || "未知用户"
                }}</el-descriptions-item>
                <el-descriptions-item label="生日">{{ user?.birthday || "" }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{
                  user?.gender || "保密"
                }}</el-descriptions-item>
                <el-descriptions-item label="地区">{{ user?.region || "" }}</el-descriptions-item>
                <el-descriptions-item label="签名" :span="2">{{
                  user?.signature || ""
                }}</el-descriptions-item>
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
defineOptions({ name: "ProfileView" });

import { computed, onMounted, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/player";
import localAvatar from "@/assets/imgs/avatar.jpg";
import defaultCoverImg from "@/assets/imgs/2.png";

import {
  getUserPlaylist,
  updateUserProfile,
  useLoginStatus,
  usePlayListTrackAll,
} from "@/utils/api";
import { ElMessage } from "element-plus";

import { VideoPlay, Plus, MoreFilled, Edit } from "@element-plus/icons-vue";

const router = useRouter();
const playerStore = usePlayerStore();

// --------------- 核心：局部状态栈（实现本页前进/后退） ---------------
// 存储页面内的操作历史状态
const historyStack = ref([]);
// 当前状态的指针（指向 historyStack 的索引）
const currentHistoryIndex = ref(-1);

// 定义页面的「核心状态」：记录需要回退/前进的关键信息
function getCurrentPageState() {
  return {
    activeTab: activeTab.value, // 当前标签页
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

// 后退：指针减1，恢复历史状态

// 前进：指针加1，恢复历史状态

// --------------- 状态栈逻辑结束 ---------------

/** localStorage keys */
const PROFILE_KEY = "qqmusic_profile_user_v1";
const MUSIC_KEY = "qqmusic_profile_music_v1";

const defaultCover = defaultCoverImg;

/** 用户信息（从API获取） */
const user = reactive({
  name: "加载中...",
  vipYear: 0,
  level: 0,
  followers: 0,
  following: 0,
  avatar: localAvatar, // 使用本地默认头像作为初始值
  userId: 0,

  birthday: "",
  gender: "保密",
  region: "",
  signature: "加载中...",
});

/** Tabs：默认音乐模块 */
const activeTab = ref("music");

/** 播放状态 */
const isPlayingRow = (row) => playerStore.id === row.id;

function playSong(song) {
  // 使用playerStore播放歌曲
  const localSong = {
    id: parseInt(song.id),
    name: song.name,
    artist: song.artist,
    cover: song.cover,
    blobUrl: song.url || song.blobUrl,
  };

  playerStore.pushPlayList(true, localSong);
  playerStore.playLocalSong(localSong);
}

/** ========= 模块1：音乐（喜欢 + 歌单） ========= */

/** 加载状态 */
const isLoading = ref(false);
const loadError = ref(false);

/** 歌单（示例数据） */
const playlists = ref([]);

/** 抽屉：喜欢 & 歌单 */
const playlistDrawerOpen = ref(false);
const currentPlaylist = ref(null);

/** 搜索 */
const playlistKeyword = ref("");

const matchSong = (song, kw) => {
  const k = kw.trim().toLowerCase();
  if (!k) return true;
  return [song.name, song.artist, song.album].some((v) =>
    String(v || "")
      .toLowerCase()
      .includes(k)
  );
};

const filteredPlaylistTracks = computed(() => {
  const list = currentPlaylist.value?.tracks || [];
  return list.filter((s) => matchSong(s, playlistKeyword.value));
});

/** 打开歌单详情（跳转到歌单详情页） */
function openPlaylist(pl) {
  router.push({ name: "playlistDetail", params: { id: pl.id } });
}

function playPlaylist() {
  const list = filteredPlaylistTracks.value;
  if (list.length) playSong(list[0]);
}

/** 新建歌单（示例） */
async function createPlaylist() {
  const name = prompt("输入歌单名：");
  if (!name) return;

  const newPlaylist = {
    id: `pl_${Date.now()}`,
    name,
    creator: user.name,
    cover: defaultCover,
    tracks: [],
  };

  playlists.value.unshift(newPlaylist);
  console.log("创建的新歌单:", newPlaylist);
  console.log("当前歌单列表:", playlists.value);

  // 保存到localStorage
  try {
    const MUSIC_KEY = "qqmusic_profile_music_v1";
    let savedMusic = localStorage.getItem(MUSIC_KEY);
    let parsedMusic = savedMusic ? JSON.parse(savedMusic) : { playlists: [], likedSongs: [] };
    parsedMusic.playlists = playlists.value;
    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
    console.log("歌单已保存到localStorage");

    // 通知其他组件本地歌单数据已更新
    try {
      window.dispatchEvent(new Event("qqmusic:music-updated"));
    } catch (error) {
      console.warn("[Profile] 派发 qqmusic:music-updated 事件失败:", error);
    }
  } catch (error) {
    console.error("保存歌单到localStorage失败:", error);
    ElMessage.error("保存歌单失败，请重试");
  }

  pushHistoryState(); // 记录操作状态
}

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
  updateUserProfile({
    nickname: editForm.name,
    signature: editForm.signature,
  })
    .then(() => {
      user.name = editForm.name;
      user.signature = editForm.signature;
      editOpen.value = false;
      ElMessage.success("个人资料更新成功");
      pushHistoryState();
    })
    .catch((error) => {
      console.error("更新失败:", error);
      ElMessage.error("更新失败，请重试");
    });
}

/** 重新加载数据 */
async function handleReload() {
  // 清除旧的缓存用户数据，确保从API获取最新数据
  localStorage.removeItem(PROFILE_KEY);

  // 设置加载状态
  isLoading.value = true;
  loadError.value = false;

  // 从API加载用户信息和歌曲
  try {
    const profileRes = await useLoginStatus();
    const profile = profileRes.data?.profile;

    if (profile) {
      user.name = profile.nickname || "未知用户";
      user.avatar = profile.avatarUrl || localAvatar;
      user.userId = profile.userId;
      user.signature = profile.signature || "这个人很懒，什么也没写～";
      user.vipYear = profile.vipType >= 1 ? Math.ceil(Math.random() * 10) : 0;
      user.level = Math.ceil(Math.random() * 20);
      user.followers = Math.floor(Math.random() * 10000);
      user.following = Math.floor(Math.random() * 100);

      if (profile.birthday) {
        const date = new Date(profile.birthday);
        user.birthday = date.toISOString().split("T")[0];
      }

      if (profile.gender === 1) {
        user.gender = "男";
      } else if (profile.gender === 2) {
        user.gender = "女";
      } else {
        user.gender = "保密";
      }
    }

    // 加载用户歌单（先展示歌单基本信息，不等待歌曲详情，防止阻塞首屏）
    if (user.userId) {
      const playlistRes = await getUserPlaylist(user.userId, 30, 0);
      const createdPlaylists = playlistRes.filter((pl) => pl.creator?.userId === user.userId);

      // 先获取本地创建的歌单（ID为字符串类型的都是本地歌单）
      const localPlaylists = playlists.value.filter((pl) => typeof pl.id === "string");

      // 合并API返回的歌单和本地创建的歌单，确保本地歌单不会被覆盖
      playlists.value = [
        ...localPlaylists, // 保持本地创建的歌单在前
        ...createdPlaylists.map((pl) => ({
          id: pl.id,
          name: pl.name,
          creator: pl.creator?.nickname || user.name,
          cover: pl.coverImgUrl || defaultCoverImg,
          tracks: [],
        })),
      ];

      // 立即结束加载状态，让页面可交互
      isLoading.value = false;

      // 后台并发加载每个歌单的歌曲，但是添加超时保护，避免单个慢请求阻塞
      const fetchWithTimeout = (id, name, timeout = 7000) =>
        new Promise((resolve) => {
          let settled = false;
          const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            console.warn(`[Profile] fetch tracks timeout: ${name}(${id})`);
            resolve({ id, tracks: [] });
          }, timeout);

          usePlayListTrackAll(id)
            .then((tracks) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              resolve({ id, tracks: tracks || [] });
            })
            .catch((e) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              console.error(`获取歌单 ${name} 的歌曲列表失败:`, e);
              resolve({ id, tracks: [] });
            });
        });

      // 并发触发后台加载（不阻塞当前函数）
      Promise.all(createdPlaylists.map((pl) => fetchWithTimeout(pl.id, pl.name, 7000)))
        .then((results) => {
          results.forEach(({ id, tracks }) => {
            const idx = playlists.value.findIndex((p) => p.id === id);
            if (idx !== -1) playlists.value[idx].tracks = tracks;
          });
        })
        .catch((e) => {
          console.warn("[Profile] 后台加载歌单歌曲发生错误", e);
        });
    }

    ElMessage.success("数据加载成功");
  } catch (error) {
    console.error("加载用户数据失败:", error);
    loadError.value = true;
    ElMessage.error("加载用户数据失败，请稍后重试");
  } finally {
    // 无论成功失败，都结束加载状态
    isLoading.value = false;
  }

  // 更新editForm
  Object.assign(editForm, {
    name: user.name,
    birthday: user.birthday,
    gender: user.gender,
    region: user.region,
    signature: user.signature,
  });
}

/** ========= 监听操作 & 初始化 ========= */
// 监听标签切换，自动存入状态
watch(activeTab, () => {
  pushHistoryState();
});

// 监听抽屉关闭，记录状态

watch(playlistDrawerOpen, (newVal) => {
  if (!newVal) pushHistoryState();
});

/** ========= 持久化（保存到 localStorage） ========= */
// 处理本地歌单更新事件
const handleLocalMusicUpdate = () => {
  console.log("[Profile] 本地歌单或歌曲已更新，重新加载用户歌单数据");
  const cachedMusic = localStorage.getItem(MUSIC_KEY);
  if (cachedMusic) {
    try {
      const musicData = JSON.parse(cachedMusic);
      playlists.value = musicData.playlists || [];
      console.log("[Profile] 成功从localStorage重新加载歌单数据");
    } catch (error) {
      console.error("[Profile] 解析本地歌单数据失败:", error);
    }
  }
};

onMounted(async () => {
  // 初始化状态栈
  initHistory();

  // 先尝试从localStorage加载缓存数据
  const cachedProfile = localStorage.getItem(PROFILE_KEY);
  if (cachedProfile) {
    const profileData = JSON.parse(cachedProfile);
    Object.assign(user, profileData);
  }

  const cachedMusic = localStorage.getItem(MUSIC_KEY);
  if (cachedMusic) {
    const musicData = JSON.parse(cachedMusic);
    playlists.value = musicData.playlists || [];
  }

  // 然后调用handleReload函数尝试加载最新数据
  await handleReload();

  // 更新editForm
  Object.assign(editForm, {
    name: user.name,
    birthday: user.birthday,
    gender: user.gender,
    region: user.region,
    signature: user.signature,
  });

  // 监听本地歌单变化事件
  window.addEventListener("qqmusic:music-updated", handleLocalMusicUpdate);
});

onBeforeUnmount(() => {
  // 移除事件监听，避免内存泄漏
  window.removeEventListener("qqmusic:music-updated", handleLocalMusicUpdate);
});

watch(
  () => ({ ...user }),
  () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  },
  { deep: true }
);

watch(
  () => playlists.value,
  () => {
    localStorage.setItem(
      MUSIC_KEY,
      JSON.stringify({
        playlists: playlists.value,
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

.profile-nav {
  margin-bottom: 10px;
  margin-top: -30px;
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
