<template>
  <div class="player-mini" v-if="currentSong">
    <div class="player-content">
      <div class="song-info">
        <div class="song-cover">
          <img :src="currentSong.cover || defaultCover" :alt="currentSong.name" />
        </div>
        <div class="song-details">
          <div class="song-name" :title="currentSong.name">{{ currentSong.name }}</div>
          <div class="song-artist" :title="currentSong.artist">{{ currentSong.artist }}</div>
        </div>
      </div>

      <div class="controls">
        <el-button 
          type="text" 
          icon="el-icon-pre" 
          size="small" 
          @click="handlePrev"
        ></el-button>
        <el-button 
          type="text" 
          :icon="playing ? 'el-icon-pause' : 'el-icon-play'" 
          size="small" 
          @click="handlePlayPause"
          class="play-button"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-next" 
          size="small" 
          @click="handleNext"
        ></el-button>
      </div>

      <div class="progress-area">
        <div class="time-display">{{ currentTimeFormat }}</div>
        <el-slider
          v-model="progressPercent"
          :format-tooltip="formatTooltip"
          @change="handleProgressChange"
          class="progress-slider"
        ></el-slider>
        <div class="time-display">{{ durationFormat }}</div>
      </div>

      <div class="extra-controls">
        <el-button 
          type="text" 
          icon="el-icon-volume-up" 
          size="small"
          @click="handleVolume"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-loop" 
          size="small" 
          @click="handleLoop"
          :class="{ active: loopMode !== 0 }"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-list" 
          size="small" 
          @click="handlePlaylist"
        ></el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits(['open-playlist', 'open-volume'])

const store = useStore()
const defaultCover = require('@/assets/default-cover.jpg')

// 从 store 获取状态
const currentSong = computed(() => store.state.player.currentSong)
const playing = computed(() => store.state.player.playing)
const currentTime = computed(() => store.state.player.currentTime)
const duration = computed(() => store.state.player.duration)
const loopMode = computed(() => store.state.player.loopMode)

// 进度百分比
const progressPercent = ref(0)

// 监听 currentTime 变化更新进度条
watch(currentTime, (newTime) => {
  if (duration.value && duration.value > 0) {
    progressPercent.value = (newTime / duration.value) * 100
  }
})

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const currentTimeFormat = computed(() => formatTime(currentTime.value))
const durationFormat = computed(() => formatTime(duration.value))

// 格式化滑块提示
const formatTooltip = (val) => {
  const time = (val / 100) * duration.value
  return formatTime(time)
}

// 播放控制方法
const handlePlayPause = () => {
  store.dispatch('player/playPause')
}

const handlePrev = () => {
  store.dispatch('player/prev')
}

const handleNext = () => {
  store.dispatch('player/next')
}

// 进度控制
const handleProgressChange = (val) => {
  const seekTime = (val / 100) * duration.value
  store.dispatch('player/seek', seekTime)
}

// 循环模式切换
const handleLoop = () => {
  store.dispatch('player/toggleLoopMode')
}

// 打开播放列表
const handlePlaylist = () => {
  emit('open-playlist')
}

// 打开音量控制
const handleVolume = () => {
  emit('open-volume')
}
</script>

<style scoped>
.player-mini {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.player-content {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  height: 70px;
}

.song-info {
  display: flex;
  align-items: center;
  width: 300px;
  flex-shrink: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  overflow: hidden;
  border-radius: 4px;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name,
.song-artist {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 30px;
}

.controls .el-button {
  margin: 0 10px;
  color: #333;
}

.controls .el-button:hover {
  color: #1890ff;
}

.play-button {
  font-size: 18px !important;
}

.progress-area {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 300px;
}

.time-display {
  font-size: 12px;
  color: #999;
  min-width: 45px;
  text-align: center;
}

.progress-slider {
  flex: 1;
  margin: 0 10px;
}

.extra-controls {
  display: flex;
  align-items: center;
  width: 150px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.extra-controls .el-button {
  margin-left: 15px;
  color: #666;
}

.extra-controls .el-button:hover {
  color: #1890ff;
}

.extra-controls .el-button.active {
  color: #1890ff;
}
</style>