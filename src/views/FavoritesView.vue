<template>
  <div class="favorites-view">
    <div class="favorites-header">
      <h1 class="title">我喜欢的音乐</h1>
      <p class="subtitle">收藏你喜欢的歌曲</p>
    </div>
    <div class="favorites-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="likedSongs.length === 0" class="placeholder">
        <div class="placeholder-icon">❤️</div>
        <div class="placeholder-text">暂无喜欢的歌曲</div>
        <div class="placeholder-subtitle">去音乐馆发现更多好音乐吧</div>
      </div>
      <div v-else class="songs-list-container">
        <div class="songs-list-header">
          <div class="header-item index">#</div>
          <div class="header-item title">标题</div>
          <div class="header-item artist">歌手</div>
          <div class="header-item album">专辑</div>
          <div class="header-item duration">时长</div>
          <div class="header-item actions"></div>
        </div>
        <div class="songs-list">
          <div
            v-for="(song, index) in numberedSongs"
            :key="song.id || `liked_${index}`"
            class="song-item"
            @click="playSong(song, index)"
          >
            <div class="song-item-content">
              <div class="item index">
                <template v-if="playerStore.id === song.id && playerStore.isPlaying">
                  <div class="playing-container">
                    <span class="song-number">{{ song.displayNumber }}</span>
                    <div class="playing-index">
                      <svg t="1767950000000" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1500" width="14" height="14">
                        <path d="M256 128l512 384-512 384V128z" fill="#c20c0c" p-id="1501"></path>
                      </svg>
                    </div>
                  </div>
                </template>
                <template v-else>
                  {{ song.displayNumber }}
                </template>

              </div>
              <div class="item title">
                <div class="song-name" :class="{ 'playing': playerStore.id === song.id }">{{ song.name }}</div>
              </div>
              <div class="item artist">{{ song.artist }}</div>
              <div class="item album">{{ song.album }}</div>
              <div class="item duration">{{ formatDuration(song.duration) }}</div>
              <div class="item actions">
                <button
                  class="favorite-btn"
                  :class="{ 'active': true }"
                  @click.stop="toggleFavorite(song)"
                  title="取消收藏"
                >
                  <svg t="1767589971368" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5074" width="20" height="20">
                    <path d="M523.733333 841.024l33.173334-32.576 99.690666-97.813333c70.976-69.632 120.32-117.973333 138.709334-135.893334 59.008-57.514667 93.248-121.28 99.626666-184.234666 6.250667-61.44-15.488-119.744-61.589333-164.672-44.992-43.84-98.88-61.909333-157.034667-52.906667-49.365333 7.616-101.034667 34.624-150.016 78.848a21.333333 21.333333 0 0 1-28.586666 0c-48.981333-44.224-100.650667-71.232-150.016-78.869333-58.154667-8.96-112.042667 9.088-157.034667 52.928-46.101333 44.928-67.84 103.210667-61.610667 164.693333 6.4 62.933333 40.64 126.72 99.648 184.213333a100207.573333 100207.573333 0 0 1 145.92 142.826667l24.256 23.765333L512 852.522667l11.733333-11.498667z m-11.733333 11.52l-1.493333 1.429333A2.133333 2.133333 0 0 1 512 853.333333c0.512 0 1.045333 0.213333 1.493333 0.64l-1.493333-1.450666z m157.781333-721.792c71.637333-11.093333 138.901333 11.477333 193.344 64.533333 55.317333 53.930667 81.834667 124.992 74.282667 199.530667-7.466667 73.642667-46.549333 146.368-112.32 210.474667-18.346667 17.898667-67.669333 66.218667-138.453333 135.637333-31.829333 31.232-65.706667 64.448-99.84 97.984L553.6 871.466667l-13.184 12.949333a40.554667 40.554667 0 0 1-56.832 0l-114.602667-112.64-24.213333-23.722667a677626.346667 677626.346667 0 0 0-145.856-142.762666C133.141333 541.184 94.08 468.48 86.613333 394.816c-7.552-74.538667 18.944-145.6 74.282667-199.530667 54.442667-53.056 121.706667-75.605333 193.344-64.533333 53.162667 8.213333 107.093333 34.688 157.781333 76.949333 50.709333-42.24 104.618667-68.736 157.781334-76.949333z" fill="#c20c0c" p-id="5075"></path>
                  </svg>
                </button>
                <!-- 操作菜单按钮 -->
                <button
                  class="menu-btn"
                  @click.stop="toggleMenu(index)"
                  title="更多操作"
                >
                  <svg t="1766749300123" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1402" width="20" height="20">
                    <path d="M512 640c35.344 0 64-28.656 64-64s-28.656-64-64-64-64 28.656-64 64 28.656 64 64 64z m0-384c35.344 0 64-28.656 64-64s-28.656-64-64-64-64 28.656-64 64 28.656 64 64 64z m0 512c35.344 0 64-28.656 64-64s-28.656-64-64-64-64 28.656-64 64 28.656 64 64 64z" fill="#666" p-id="1403"></path>
                  </svg>
                </button>
                <!-- 操作菜单 -->
                <div
                  v-if="activeMenuIndex === index"
                  class="song-menu"
                  @click.stop
                >
                  <div class="menu-item" @click="playSong(song, index)">
                    <svg t="1766749330123" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1452" width="16" height="16">
                      <path d="M896 512c0 4.4-3.6 8-8 8H136c-4.4 0-8-3.6-8-8s3.6-8 8-8h752c4.4 0 8 3.6 8 8z" fill="#333" p-id="1453"></path>
                      <path d="M768 480l-448 256c-27.9 16-64-2.2-64-32V256c0-29.8 36.1-48 64-32l448 256c27.9 16 27.9 52 0 68z" fill="#333" p-id="1454"></path>
                    </svg>
                    <span>播放</span>
                  </div>
                  <div class="menu-item" @click="playNext(song)">
                    <svg t="1766749360123" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1502" width="16" height="16">
                      <path d="M896 512c0 4.4-3.6 8-8 8H440c-4.4 0-8-3.6-8-8s3.6-8 8-8h448c4.4 0 8 3.6 8 8z" fill="#333" p-id="1503"></path>
                      <path d="M640 256H136c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h504l-144 144c-27.9 27.9-27.9 73.1 0 100.9s73.1 27.9 100.9 0l224-224c27.9-27.9 27.9-73.1 0-100.9l-224-224c-27.9-27.9-73.1-27.9-100.9 0s-27.9 73.1 0 100.9L640 256z" fill="#333" p-id="1504"></path>
                    </svg>
                    <span>下一首播放</span>
                  </div>
                  <div class="menu-item" @click="playList(song, index)">
                    <svg t="1766749390123" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1552" width="16" height="16">
                      <path d="M896 64H128c-35.3 0-64 28.7-64 64v768c0 35.3 28.7 64 64 64h768c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64zM688 832H224V192h464v640z" fill="#333" p-id="1553"></path>
                      <path d="M736 320H352c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32zM736 448H352c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32zM736 576H352c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32zM736 704H352c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32z" fill="#333" p-id="1554"></path>
                    </svg>
                    <span>播放列表</span>
                  </div>
                  <div class="menu-item" @click="toggleFavorite(song)">
                    <svg t="1767589971368" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1602" width="16" height="16">
                      <path d="M523.733333 841.024l33.173334-32.576 99.690666-97.813333c70.976-69.632 120.32-117.973333 138.709334-135.893334 59.008-57.514667 93.248-121.28 99.626666-184.234666 6.250667-61.44-15.488-119.744-61.589333-164.672-44.992-43.84-98.88-61.909333-157.034667-52.906667-49.365333 7.616-101.034667 34.624-150.016 78.848a21.333333 21.333333 0 0 1-28.586666 0c-48.981333-44.224-100.650667-71.232-150.016-78.869333-58.154667-8.96-112.042667 9.088-157.034667 52.928-46.101333 44.928-67.84 103.210667-61.610667 164.693333 6.4 62.933333 40.64 126.72 99.648 184.213333a100207.573333 100207.573333 0 0 1 145.92 142.826667l24.256 23.765333L512 852.522667l11.733333-11.498667z m-11.733333 11.52l-1.493333 1.429333A2.133333 2.133333 0 0 1 512 853.333333c0.512 0 1.045333 0.213333 1.493333 0.64l-1.493333-1.450666z m157.781333-721.792c71.637333-11.093333 138.901333 11.477333 193.344 64.533333 55.317333 53.930667 81.834667 124.992 74.282667 199.530667-7.466667 73.642667-46.549333 146.368-112.32 210.474667-18.346667 17.898667-67.669333 66.218667-138.453333 135.637333-31.829333 31.232-65.706667 64.448-99.84 97.984L553.6 871.466667l-13.184 12.949333a40.554667 40.554667 0 0 1-56.832 0l-114.602667-112.64-24.213333-23.722667a677626.346667 677626.346667 0 0 0-145.856-142.762666C133.141333 541.184 94.08 468.48 86.613333 394.816c-7.552-74.538667 18.944-145.6 74.282667-199.530667 54.442667-53.056 121.706667-75.605333 193.344-64.533333 53.162667 8.213333 107.093333 34.688 157.781333 76.949333 50.709333-42.24 104.618667-68.736 157.781334-76.949333z" fill="#c20c0c" p-id="1603"></path>
                    </svg>
                    <span>取消收藏</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePlayerStore } from '../stores/player';
import { getLikedSongs, setLikedSongs } from '../utils/likedSongs';

defineOptions({ name: "FavoritesView" });

const playerStore = usePlayerStore();
const likedSongs = ref([]);
const loading = ref(true);
const activeMenuIndex = ref(-1);

// 计算属性：为每首歌提供正确的编号
const numberedSongs = computed(() => {
  // 确保数组索引连续
  const validSongs = Array.from(likedSongs.value.filter(Boolean));

  // 为每首歌添加正确的编号
  return validSongs.map((song, index) => ({
    ...song,
    displayNumber: index + 1
  }));
});

// 加载喜欢的歌曲数据
const loadLikedSongs = () => {
  try {
    loading.value = true;
    likedSongs.value = getLikedSongs();
  } catch (error) {
    console.error("[我喜欢] 加载喜欢的歌曲失败:", error);
    likedSongs.value = [];
  } finally {
    loading.value = false;
  }
};

// 格式化歌曲时长
const formatDuration = (duration) => {
  if (!duration) return "0:00";

  let totalSeconds = 0;

  if (typeof duration === "string") {
    // 去除可能的空格
    duration = duration.trim();

    // 检查是否是 "mm:ss" 格式
    const timeMatch = duration.match(/^(\d+):(\d{2})$/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1]);
      const seconds = parseInt(timeMatch[2]);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        totalSeconds = minutes * 60 + seconds;
      }
    } else {
      // 尝试解析为纯数字字符串
      const numVal = parseFloat(duration);
      if (!isNaN(numVal)) {
        // 如果数字很大，可能是毫秒
        if (numVal > 1000) {
          totalSeconds = Math.floor(numVal / 1000);
        } else {
          totalSeconds = Math.floor(numVal);
        }
      }
    }
  }
  else if (typeof duration === "number") {
    // 如果数字很大，可能是毫秒
    if (duration > 1000) {
      totalSeconds = Math.floor(duration / 1000);
    } else {
      totalSeconds = Math.floor(duration);
    }
  }

  // 格式化输出
  if (totalSeconds > 0) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return "0:00";
};

// 播放歌曲
const playSong = (song, index) => {
  // 设置当前播放歌曲和播放列表
  playerStore.setPlaylist(likedSongs.value);
  playerStore.setCurrentIndex(index);
};

// 收藏/取消收藏歌曲
const toggleFavorite = (song) => {
  try {
    let currentLikedSongs = getLikedSongs();
    const songId = String(song.id);
    const songIndex = currentLikedSongs.findIndex(item => String(item.id) === songId);

    if (songIndex >= 0) {
      // 取消收藏：从数组中删除
      currentLikedSongs.splice(songIndex, 1);
    } else {
      // 添加收藏：添加到数组
      const likedSong = {
        id: songId,
        name: song.name,
        artist: song.artist,
        album: song.album,
        cover: song.cover,
        duration: song.duration,
        url: song.url,
        base64: song.base64,
        size: song.size
      };
      currentLikedSongs.push(likedSong);
    }

    // 保存更新后的收藏列表
    setLikedSongs(currentLikedSongs);

    // 更新本地状态
    likedSongs.value = [...currentLikedSongs];

    // 通知其他组件数据已更新
    window.dispatchEvent(new Event("qqmusic:music-updated"));

    // 关闭菜单
    activeMenuIndex.value = -1;
  } catch (error) {
    console.error("[我喜欢] 收藏操作失败:", error);
  }
};

// 切换菜单显示
const toggleMenu = (index) => {
  if (activeMenuIndex.value === index) {
    activeMenuIndex.value = -1;
  } else {
    activeMenuIndex.value = index;
  }
};

// 下一首播放
const playNext = (song) => {
  // 获取当前播放列表
  const currentPlaylist = [...playerStore.playList];
  // 获取当前播放索引
  const currentIndex = currentPlaylist.findIndex(item => item.id === playerStore.id);
  // 在当前索引后插入歌曲
  const newPlaylist = [...currentPlaylist];
  if (currentIndex >= 0) {
    // 在当前歌曲后插入
    newPlaylist.splice(currentIndex + 1, 0, song);
  } else {
    // 如果没有当前歌曲，添加到列表开头
    newPlaylist.unshift(song);
  }
  // 更新播放列表
  playerStore.setPlaylist(newPlaylist);
  activeMenuIndex.value = -1;
};

// 播放列表
const playList = (song, index) => {
  playSong(song, index);
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  const target = event.target;
  if (!target.closest('.item.actions')) {
    activeMenuIndex.value = -1;
  }
};

// 监听本地存储变化
const handleStorageChange = () => {
  loadLikedSongs();
};

onMounted(() => {
  loadLikedSongs();

  // 添加本地存储变化监听
  window.addEventListener("storage", handleStorageChange);
  // 添加自定义事件监听
  window.addEventListener("qqmusic:music-updated", loadLikedSongs);
  // 添加点击外部关闭菜单的监听
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("qqmusic:music-updated", loadLikedSongs);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.favorites-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.favorites-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.favorites-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #c20c0c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.placeholder {
  text-align: center;
  animation: fadeIn 0.5s ease;
  padding: 60px 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.placeholder-subtitle {
  font-size: 14px;
  color: #999;
}

/* 歌曲列表 */
.songs-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.songs-list-header {
  display: grid;
  grid-template-columns: 60px 1fr 180px 180px 80px 60px;
  padding: 12px 24px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
  font-weight: 500;
  position: sticky;
  top: 30px; /* 最终微调位置 */
  z-index: 10;
  margin-bottom: 0;
}

.header-item {
  display: flex;
  align-items: center;
}

.header-item.index {
  justify-content: center;
}

.header-item.actions {
  justify-content: center;
}

.songs-list {
  flex: 1;
  overflow-y: auto;
  padding-top: 24px; /* 最终调整顶部内边距 */
}

/* 歌曲项 */
.song-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #fafafa;
}

.song-item-content {
  display: grid;
  grid-template-columns: 60px 1fr 180px 180px 80px 60px;
  padding: 12px 24px;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
}

.song-item .item {
  font-size: 14px;
  color: #333;
}

.song-item .item.index {
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.song-item .playing-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.song-item .song-number {
  color: #c20c0c;
  font-weight: 500;
}

.song-item .playing-index {
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-item .item.title {
  overflow: hidden;
}

.song-item .song-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.song-item .song-name.playing {
  color: #c20c0c;
  font-weight: 500;
}

.song-item .item.artist,
.song-item .item.album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
}

.song-item .item.duration {
  text-align: right;
  font-size: 12px;
  color: #999;
  width: 50px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-item .item.actions {
  display: flex;
  justify-content: center;
}

/* 收藏按钮 */
.favorite-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.favorite-btn:hover {
  background-color: rgba(194, 12, 12, 0.1);
}

.favorite-btn.active svg {
  color: #c20c0c;
}

/* 菜单按钮 */
.menu-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-item:hover .menu-btn {
  opacity: 1;
}

.menu-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 操作菜单 */
.song-menu {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item svg {
  margin-right: 8px;
  flex-shrink: 0;
}

/* 滚动条样式 */
.songs-list::-webkit-scrollbar {
  width: 6px;
}

.songs-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.songs-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.songs-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
