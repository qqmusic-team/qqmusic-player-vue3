<template>
  <div class="player-bar">
    <!-- 左侧：歌曲信息 -->
    <div class="song-info">
      <div class="cover-wrapper">
        <img
          :src="currentSong.cover || 'https://via.placeholder.com/64x64'"
          alt="歌曲封面"
          class="song-cover"
        />
      </div>
      <div class="song-details">
        <div class="song-name">{{ currentSong.name }}</div>
        <div class="song-artist">{{ currentSong.artist }} - {{ currentSong.album }}</div>
      </div>
      <div class="song-actions">
        <button @click="toggleFavorite" class="action-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 16.5L2.7 12.15C1.7 11.55 1.2 10.35 1.5 9.15C1.8 7.95 3 7.35 4.2 7.8L9 10.8L13.8 7.8C15 7.35 16.2 7.95 16.5 9.15C16.8 10.35 16.3 11.55 15.3 12.15L9 16.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 中间：播放控制 -->
    <div class="player-controls">
      <div class="controls-group">
        <button @click="togglePlayMode" class="control-btn play-mode-btn">
          <!-- 循环播放图标 -->
          <svg
            v-if="playMode === 'sequence'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            title="循环播放"
          >
            <path
              d="M7 7V4C7 2.89543 7.89543 2 9 2H16C17.1046 2 18 2.89543 18 4V8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8V5M7 7H11C12.1046 7 13 7.89543 13 9V16C13 17.1046 12.1046 18 11 18H7C5.89543 18 5 17.1046 5 16V9C5 7.89543 5.89543 7 7 7Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else-if="playMode === 'random'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            title="随机播放"
          >
            <path
              d="M14 2L18 6L14 10M17 4H21V8M7 7V4C7 2.89543 7.89543 2 9 2H16C17.1046 2 18 2.89543 18 4V8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8V5M7 7H11C12.1046 7 13 7.89543 13 9V16C13 17.1046 12.1046 18 11 18H7C5.89543 18 5 17.1046 5 16V9C5 7.89543 5.89543 7 7 7Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 20C2 18.8954 2.89543 18 4 18H8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            title="单曲循环"
          >
            <path
              d="M7 7V4C7 2.89543 7.89543 2 9 2H16C17.1046 2 18 2.89543 18 4V8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8V5M7 7H11C12.1046 7 13 7.89543 13 9V16C13 17.1046 12.1046 18 11 18H7C5.89543 18 5 17.1046 5 16V9C5 7.89543 5.89543 7 7 7Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 16V18C16 19.1046 16.8954 20 18 20H20C21.1046 20 22 19.1046 22 18V16C22 14.8954 21.1046 14 20 14H18C16.8954 14 16 14.8954 16 16Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button @click="playPrev" class="control-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L12 12L18 18M6 6H9V18H6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button @click="togglePlay" class="play-btn">
          <svg
            v-if="isPlaying"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="11" y="7" width="5" height="22" rx="2" fill="currentColor" />
            <rect x="20" y="7" width="5" height="22" rx="2" fill="currentColor" />
          </svg>
          <svg
            v-else
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 9L26 18L12 27V9Z" fill="currentColor" />
          </svg>
        </button>
        <button @click="playNext" class="control-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L12 12L6 18M18 6H15V18H18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button @click="togglePlayList" class="control-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H16M4 18H12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- 进度条控制 -->
      <div class="progress-container">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar-wrapper">
          <div class="progress-bar" @click="handleProgressClick" :style="{ width: progress + '%' }">
            <div class="progress-thumb"></div>
          </div>
        </div>
        <span class="total-time">{{ formatTime(totalTime) }}</span>
      </div>
    </div>

    <!-- 右侧：音量控制 -->
    <div class="volume-controls">
      <button @click="showComments" class="action-btn-large">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10 12L14 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button @click="shareSong" class="action-btn-large">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C10.0508 4 8.28369 4.78934 6.92893 6.14302L5.41421 7.65778C6.72843 9.02299 8.27157 9.75 10 9.75C14.4183 9.75 18 6.25646 18 1.73607C18 1.55575 18 1.381 17.9973 1.20714"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C13.9492 20 15.7163 19.2107 17.0711 17.857C18.5858 16.3422 17.2716 14.977 16 13.612C11.5817 13.612 8 17.1055 8 21.626C8 21.8063 8 21.981 8.00267 22.1549"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="volume-wrapper">
        <button @click="toggleMute" class="action-btn-large">
          <svg
            v-if="volume === 0 || isVolumeMuted"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18.5C13.0376 18.5 15.5 16.0376 15.5 13C15.5 9.96243 13.0376 7.5 10 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 11.5V14.5L4 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21.5 3.5L2.5 22.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else-if="volume < 50"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18.5C13.0376 18.5 15.5 16.0376 15.5 13C15.5 9.96243 13.0376 7.5 10 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 11.5V14.5L4 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18.5C13.0376 18.5 15.5 16.0376 15.5 13C15.5 9.96243 13.0376 7.5 10 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 11.5V14.5L4 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18.5 8V16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.5 11V13"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div
          class="volume-slider-wrapper"
          @mouseenter="showVolumeSlider = true"
          @mouseleave="showVolumeSlider = false"
        >
          <div v-show="showVolumeSlider" class="volume-slider">
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="volume"
              @input="handleVolumeChange"
              class="volume-input"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 播放列表弹窗 -->
  <div v-if="showPlayList" class="playlist-overlay">
    <div class="playlist-container">
      <div class="playlist-header">
        <h3>播放列表</h3>
        <button @click="togglePlayList" class="close-btn">×</button>
      </div>
      <div class="playlist-content">
        <div
          v-for="(song, index) in playList"
          :key="song.id"
          class="playlist-item"
          :class="{ active: song.id === currentSong.id }"
        >
          <div class="song-info-item">
            <span class="song-index">{{ index + 1 }}</span>
            <div class="song-details-item">
              <div class="song-name-item">{{ song.name }}</div>
              <div class="song-artist-item">{{ song.artist }} - {{ song.album }}</div>
            </div>
          </div>
          <div class="song-duration">03:45</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

// 播放器状态管理
const isPlaying = ref(false);
const currentTime = ref(0);
const totalTime = ref(0);
const progress = ref(0);
const volume = ref(80);
const isVolumeMuted = ref(false);
const lastVolume = ref(80);
const playMode = ref("sequence"); // sequence循环, random随机, single单曲循环
const showVolumeSlider = ref(false);
const showPlayList = ref(false);

// 当前播放歌曲信息
const currentSong = ref({
  id: "1",
  name: "示例歌曲",
  artist: "歌手名称",
  album: "专辑名称",
  cover: "",
  url: "",
});

// 播放列表
const playList = ref([
  {
    id: "1",
    name: "示例歌曲",
    artist: "歌手名称",
    album: "专辑名称",
    cover: "",
    url: "",
  },
  {
    id: "2",
    name: "示例歌曲2",
    artist: "歌手名称2",
    album: "专辑名称2",
    cover: "",
    url: "",
  },
]);

// 音频元素引用
let audio = null;

// 时间格式化函数
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 播放控制方法
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (audio) {
    isPlaying.value ? audio.play() : audio.pause();
  }
};

// 下一首
const playNext = () => {
  // 实现下一首逻辑
  console.log("播放下一首");
};

// 上一首
const playPrev = () => {
  // 实现上一首逻辑
  console.log("播放上一首");
};

// 进度条点击事件
const handleProgressClick = (e) => {
  if (!audio) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * totalTime.value;
  audio.currentTime = newTime;
  currentTime.value = newTime;
  progress.value = percent * 100;
};

// 音量控制
const toggleMute = () => {
  if (!audio) return;
  isVolumeMuted.value = !isVolumeMuted.value;
  if (isVolumeMuted.value) {
    lastVolume.value = volume.value;
    audio.volume = 0;
    volume.value = 0;
  } else {
    audio.volume = lastVolume.value / 100;
    volume.value = lastVolume.value;
  }
};

// 调整音量
const handleVolumeChange = () => {
  if (!audio) return;
  audio.volume = volume.value / 100;
  if (volume.value > 0 && isVolumeMuted.value) {
    isVolumeMuted.value = false;
  } else if (volume.value === 0) {
    isVolumeMuted.value = true;
  }
};

// 切换播放模式
const togglePlayMode = () => {
  const modes = ["sequence", "random", "single"];
  const currentIndex = modes.indexOf(playMode.value);
  playMode.value = modes[(currentIndex + 1) % modes.length];
};

// 切换播放列表显示
const togglePlayList = () => {
  showPlayList.value = !showPlayList.value;
};

// 收藏当前歌曲
const toggleFavorite = () => {
  console.log("切换收藏状态");
};

// 评论
const showComments = () => {
  console.log("显示评论");
};

// 分享
const shareSong = () => {
  console.log("分享歌曲");
};

// 初始化音频元素
const initAudio = () => {
  audio = new Audio();
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateTotalTime);
  audio.addEventListener("ended", handleSongEnd);
};

// 更新进度
const updateProgress = () => {
  if (!audio) return;
  currentTime.value = audio.currentTime;
  totalTime.value = audio.duration || 0;
  progress.value = totalTime.value > 0 ? (currentTime.value / totalTime.value) * 100 : 0;
};

// 更新总时长
const updateTotalTime = () => {
  if (!audio) return;
  totalTime.value = audio.duration || 0;
};

// 处理歌曲结束
const handleSongEnd = () => {
  if (playMode.value === "single") {
    audio.currentTime = 0;
    audio.play();
  } else {
    playNext();
  }
};

// 监听播放状态变化
watch(isPlaying, (newValue) => {
  if (audio) {
    newValue ? audio.play() : audio.pause();
  }
});

// 监听音量变化
watch(volume, (newValue) => {
  if (audio) {
    audio.volume = newValue / 100;
  }
});

// 组件挂载时初始化
onMounted(() => {
  initAudio();
});

// 组件卸载时清理
onUnmounted(() => {
  if (audio) {
    audio.removeEventListener("timeupdate", updateProgress);
    audio.removeEventListener("loadedmetadata", updateTotalTime);
    audio.removeEventListener("ended", handleSongEnd);
    audio.pause();
    audio = null;
  }
});
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

/* 左侧：歌曲信息 */
.song-info {
  display: flex;
  align-items: center;
  flex: 0 0 250px;
  gap: 12px;
}

.cover-wrapper {
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.song-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.song-cover:hover {
  transform: scale(1.05);
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* 增大右侧功能按钮尺寸并优化样式 */
.action-btn-large {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 16px;
  flex-shrink: 0;
}

.action-btn-large:hover {
  background-color: #f0f0f0;
  color: #333;
  transform: scale(1.05);
}

.action-btn-large:active {
  transform: scale(0.95);
}

/* 中间：播放控制 */
.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.control-btn:hover {
  color: #333;
}

/* 播放模式按钮增强样式 */
.play-mode-btn {
  position: relative;
  width: 32px;
  height: 32px;
}

.play-mode-btn:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #c20c0c;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(194, 12, 12, 0.3);
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 12px rgba(194, 12, 12, 0.4);
}

/* 进度条控制 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.current-time,
.total-time {
  font-size: 12px;
  color: #999;
  min-width: 40px;
  text-align: center;
}

.progress-bar-wrapper {
  flex: 1;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #c20c0c;
  position: relative;
  transition: width 0.1s ease;
}

.progress-bar-wrapper:hover .progress-bar {
  background-color: #e81010;
}

.progress-thumb {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  background-color: white;
  border: 2px solid #c20c0c;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.progress-bar-wrapper:hover .progress-thumb {
  opacity: 1;
}

/* 右侧：音量控制 */
.volume-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 260px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.volume-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider-wrapper {
  position: relative;
}

.volume-slider {
  position: absolute;
  bottom: 30px;
  right: -50px;
  width: 35px;
  height: 120px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.volume-input {
  transform: rotate(-90deg);
  width: 80px;
  cursor: pointer;
}

/* 播放列表弹窗 */
.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1001;
}

.playlist-container {
  width: 100%;
  max-width: 800px;
  max-height: 50vh;
  background-color: white;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.playlist-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
  max-height: 40vh;
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
}

.playlist-item:hover {
  background-color: #f9f9f9;
}

.playlist-item.active {
  background-color: #f0f0f0;
}

.song-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.song-index {
  font-size: 14px;
  color: #999;
  width: 20px;
  text-align: center;
}

.song-details-item {
  flex: 1;
  min-width: 0;
}

.song-name-item {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist-item {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 12px;
  color: #999;
  margin-left: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .player-bar {
    padding: 0 10px;
    height: 70px;
  }

  .song-info {
    flex: 0 0 180px;
    gap: 8px;
  }

  .cover-wrapper {
    width: 48px;
    height: 48px;
  }

  .volume-controls {
    flex: 0 0 auto;
    gap: 12px;
    padding-left: 8px;
    width: auto;
  }

  .action-btn-large {
    width: 28px;
    height: 28px;
  }

  .action-btn-large svg {
    width: 20px;
    height: 20px;
  }

  .volume-slider {
    display: none;
  }

  .song-details {
    display: none;
  }
}

@media (max-width: 480px) {
  .player-bar {
    padding: 0 8px;
    height: 64px;
  }

  .volume-controls {
    gap: 8px;
  }

  .action-btn-large {
    width: 32px;
    height: 32px;
  }

  .action-btn-large svg {
    width: 20px;
    height: 20px;
  }

  .play-mode-btn {
    width: 28px;
    height: 28px;
  }

  .play-mode-btn svg {
    width: 22px;
    height: 22px;
  }
}
</style>
