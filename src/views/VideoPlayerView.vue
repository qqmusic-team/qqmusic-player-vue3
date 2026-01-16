<template>
  <div class="video-player-view">
    <div class="content-container">
      <h2 class="page-title">视频播放</h2>

      <!-- 视频播放器卡片 -->
      <div
        class="video-card"
        ref="videoCardRef"
        @mouseenter="showControls = true"
        @mouseleave="showControls = false"
      >
        <div class="video-ratio-wrapper">
          <video
            ref="videoRef"
            class="video-element"
            @click="togglePlay"
            @timeupdate="handleTimeUpdate"
            @loadedmetadata="handleLoadedMetadata"
            @ended="handleEnded"
            @waiting="isBuffering = true"
            @playing="isBuffering = false"
            @canplay="isBuffering = false"
            @progress="handleProgress"
            crossorigin="anonymous"
            playsinline
          ></video>

          <!-- 播放/暂停 居中图标 (仅暂停时显示) -->
          <div class="center-play-btn" v-if="!isPlaying && !isBuffering" @click="togglePlay">
            <div class="play-icon-circle">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <!-- 缓冲动画 -->
          <div class="buffering-spinner" v-if="isBuffering">
            <div class="spinner-icon"></div>
          </div>
        </div>

        <!-- 底部控制栏 -->
        <div class="controls-container" :class="{ visible: showControls || !isPlaying }">
          <!-- 进度条 -->
          <div class="progress-section">
            <span class="time-display current">{{ formatTime(currentTime) }}</span>

            <div
              class="progress-bar-wrapper"
              ref="progressBarRef"
              @mousedown="startDrag"
              @touchstart="startDrag"
              @click="handleProgressClick"
            >
              <div class="progress-track">
                <!-- 缓冲条 -->
                <div class="buffered-bar" :style="{ width: bufferedPercentage + '%' }"></div>
                <!-- 播放进度条 -->
                <div class="played-bar" :style="{ width: playPercentage + '%' }"></div>
                <!-- 拖拽滑块 -->
                <div class="thumb" :style="{ left: playPercentage + '%' }">
                  <div class="thumb-dot"></div>
                </div>
              </div>
            </div>

            <span class="time-display total">{{ formatTime(duration) }}</span>
          </div>

          <!-- 控制按钮行 -->
          <div class="controls-row">
            <div class="left-controls">
              <!-- 播放/暂停按钮 -->
              <button class="icon-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
                <svg
                  v-if="isPlaying"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <!-- 音量控制 -->
              <div
                class="volume-control"
                @mouseenter="showVolumeSlider = true"
                @mouseleave="showVolumeSlider = false"
              >
                <button class="icon-btn" @click="toggleMute">
                  <svg
                    v-if="volume === 0"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <path
                      d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path
                      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                    />
                  </svg>
                </button>
                <div class="volume-slider-wrapper" :class="{ visible: showVolumeSlider }">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    v-model.number="volume"
                    @input="handleVolumeChange"
                    class="volume-slider"
                  />
                </div>
              </div>
            </div>

            <div class="right-controls">
              <!-- 倍速选择 -->
              <div class="rate-control" ref="rateMenuRef">
                <span class="rate-text" @click="toggleRateMenu">{{ playbackRate }}x</span>
                <div class="rate-menu" v-if="showRateMenu">
                  <div
                    v-for="rate in [0.5, 1.0, 1.25, 1.5, 2.0]"
                    :key="rate"
                    class="rate-option"
                    :class="{ active: playbackRate === rate }"
                    @click="changeRate(rate)"
                  >
                    {{ rate }}x
                  </div>
                </div>
              </div>

              <!-- 全屏按钮 -->
              <button
                class="icon-btn"
                @click="toggleFullScreen"
                :title="isFullscreen ? '退出全屏' : '全屏'"
              >
                <svg
                  v-if="!isFullscreen"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path
                    d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path
                    d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Hls from "hls.js";
import { ElMessage } from "element-plus";

const videoRef = ref<HTMLVideoElement | null>(null);
const videoCardRef = ref<HTMLElement | null>(null);
const progressBarRef = ref<HTMLElement | null>(null);
const rateMenuRef = ref<HTMLElement | null>(null);

// 默认视频 URL (测试用 HLS)
// 如果想测试 MP4，可以换成: https://media.w3.org/2010/05/sintel/trailer.mp4
// HLS 测试: https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
const defaultUrl = "https://media.w3.org/2010/05/sintel/trailer.mp4";
const videoUrl = ref(defaultUrl);

// 状态
const isPlaying = ref(false);
const isBuffering = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const bufferedPercentage = ref(0);
const volume = ref(1);
const playbackRate = ref(1.0);
const showControls = ref(false);
const showRateMenu = ref(false);
const showVolumeSlider = ref(false);
const isDragging = ref(false);
const isFullscreen = ref(false);

let hls: Hls | null = null;

// 计算属性
const playPercentage = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// 初始化
onMounted(() => {
  // 这里可以根据 route.params.id 获取实际视频 URL
  // const id = route.params.id;
  // fetchVideoUrl(id).then(url => videoUrl.value = url);

  initVideo();

  // 点击外部关闭倍速菜单
  document.addEventListener("click", handleClickOutside);
  // 绑定全局鼠标事件以处理拖拽
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("touchend", handleDragEnd);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
});

onUnmounted(() => {
  if (hls) {
    hls.destroy();
  }
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
  document.removeEventListener("touchmove", handleDragMove);
  document.removeEventListener("touchend", handleDragEnd);
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});

const initVideo = () => {
  const video = videoRef.value;
  if (!video) return;

  if (videoUrl.value.endsWith(".m3u8") || videoUrl.value.includes("m3u8")) {
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl.value);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          ElMessage.error("视频加载失败，请刷新重试");
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl.value;
    } else {
      ElMessage.warning("您的浏览器不支持 HLS 播放");
    }
  } else {
    // MP4 直接设置 src
    video.src = videoUrl.value;
  }

  video.volume = volume.value;
};

// 事件处理
const togglePlay = () => {
  const video = videoRef.value;
  if (!video) return;

  if (video.paused) {
    video.play().catch((err) => {
      console.error("播放失败:", err);
      ElMessage.error("播放失败");
    });
    isPlaying.value = true;
  } else {
    video.pause();
    isPlaying.value = false;
  }
};

const handleTimeUpdate = () => {
  if (!videoRef.value || isDragging.value) return;
  currentTime.value = videoRef.value.currentTime;
  handleProgress(); // 更新缓冲
};

const handleLoadedMetadata = () => {
  if (!videoRef.value) return;
  duration.value = videoRef.value.duration;
};

const handleEnded = () => {
  isPlaying.value = false;
  showControls.value = true;
};

const handleProgress = () => {
  const video = videoRef.value;
  if (!video || !video.buffered.length) return;

  // 找到当前时间段的缓冲范围
  const time = video.currentTime;
  for (let i = 0; i < video.buffered.length; i++) {
    if (video.buffered.start(i) <= time && video.buffered.end(i) >= time) {
      bufferedPercentage.value = (video.buffered.end(i) / video.duration) * 100;
      break;
    }
  }
};

// 进度条拖拽逻辑
const handleProgressClick = (e: MouseEvent) => {
  if (!progressBarRef.value || !videoRef.value) return;
  const rect = progressBarRef.value.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, clickX / rect.width));

  videoRef.value.currentTime = percentage * duration.value;
  currentTime.value = videoRef.value.currentTime;
};

const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  handleDragMove(e);
};

const handleDragMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !progressBarRef.value) return;

  let clientX;
  if (e instanceof MouseEvent) {
    clientX = e.clientX;
  } else {
    clientX = e.touches[0].clientX;
  }

  const rect = progressBarRef.value.getBoundingClientRect();
  const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

  // 拖拽时只更新 UI，不设置 video.currentTime，避免卡顿
  currentTime.value = percentage * duration.value;
};

const handleDragEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  // 拖拽结束时真正跳转
  if (videoRef.value) {
    videoRef.value.currentTime = currentTime.value;
  }
};

// 音量控制
const handleVolumeChange = () => {
  if (videoRef.value) {
    videoRef.value.volume = volume.value;
  }
};

const toggleMute = () => {
  if (volume.value > 0) {
    volume.value = 0;
  } else {
    volume.value = 1;
  }
  handleVolumeChange();
};

// 倍速控制
const toggleRateMenu = (e: Event) => {
  e.stopPropagation();
  showRateMenu.value = !showRateMenu.value;
};

const changeRate = (rate: number) => {
  playbackRate.value = rate;
  if (videoRef.value) {
    videoRef.value.playbackRate = rate;
  }
  showRateMenu.value = false;
};

const handleClickOutside = (e: Event) => {
  if (rateMenuRef.value && !rateMenuRef.value.contains(e.target as Node)) {
    showRateMenu.value = false;
  }
};

// 全屏控制
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

const toggleFullScreen = () => {
  const container = videoCardRef.value;
  if (!container) return;

  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => {
      console.error("全屏失败:", err);
    });
  } else {
    document.exitFullscreen();
  }
};

// 工具函数
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
</script>

<style scoped>
.video-player-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.video-card {
  position: relative;
  width: 100%;
  background: #000;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-ratio-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

/* 居中播放按钮 */
.center-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none; /* 让点击穿透到 video 元素，或者在父级处理点击 */
}

.play-icon-circle {
  width: 64px;
  height: 64px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform 0.2s;
}

.video-card:hover .play-icon-circle {
  transform: scale(1.1);
  background: rgba(24, 144, 255, 0.8); /* 品牌色 */
}

/* 缓冲动画 */
.buffering-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.spinner-icon {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 底部控制栏 */
.controls-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 20;
}

.controls-container.visible {
  opacity: 1;
}

/* 进度条区域 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
}

.time-display {
  color: #fff;
  font-size: 12px;
  min-width: 45px;
  text-align: center;
}

.progress-bar-wrapper {
  flex: 1;
  height: 20px; /* 增加点击区域 */
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.buffered-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  transition: width 0.2s linear;
}

.played-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #1890ff; /* 品牌色 */
  border-radius: 3px;
}

.thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}

.thumb-dot {
  width: 6px;
  height: 6px;
  background: #1890ff;
  border-radius: 50%;
}

.progress-bar-wrapper:hover .thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

/* 控制按钮行 */
.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.left-controls,
.right-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #fff;
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s, opacity 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

/* 倍速控制 */
.rate-control {
  position: relative;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.rate-text {
  padding: 5px 10px;
  border-radius: 4px;
}

.rate-text:hover {
  background: rgba(255, 255, 255, 0.1);
}

.rate-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  padding: 5px 0;
  margin-bottom: 10px;
  min-width: 60px;
}

.rate-option {
  padding: 5px 15px;
  text-align: center;
  font-size: 13px;
  color: #ccc;
  transition: all 0.2s;
}

.rate-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.rate-option.active {
  color: #1890ff;
}

/* 音量控制 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
}

.volume-slider-wrapper {
  width: 0;
  overflow: hidden;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
}

.volume-control:hover .volume-slider-wrapper,
.volume-slider-wrapper.visible {
  width: 80px;
}

.volume-slider {
  width: 70px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}
</style>
