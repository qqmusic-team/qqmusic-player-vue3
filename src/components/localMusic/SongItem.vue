<template>
  <div class="song-item" :class="{ 'current-song': isCurrentSong }" @click="handleClick">
    <div class="song-index">{{ index + 1 }}</div>
    <div class="song-info">
      <div class="song-name">{{ song.name }}</div>
      <div class="song-meta">
        <span class="song-artist">{{ song.artist }}</span>
        <span class="song-album">{{ song.album }}</span>
      </div>
    </div>
    <div class="song-duration">{{ formatDuration(song.duration) }}</div>
    <div class="song-actions">
      <el-button 
        type="text" 
        size="small" 
        @click.stop="handlePlay"
        icon="el-icon-play"
        :icon="isCurrentSong && isPlaying ? 'el-icon-pause' : 'el-icon-play'"
      ></el-button>
      <el-button 
        type="text" 
        size="small" 
        @click.stop="handleAddToPlaylist"
        icon="el-icon-plus"
      ></el-button>
      <el-button 
        type="text" 
        size="small" 
        @click.stop="handleMore"
        icon="el-icon-more"
      ></el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'play', 'add-to-playlist', 'more'])

const store = useStore()

const isCurrentSong = computed(() => {
  return props.isCurrent || (store.state.player.currentSong?.id === props.song.id)
})

const isPlaying = computed(() => {
  return store.state.player.playing
})

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleClick = () => {
  emit('click', props.song, props.index)
}

const handlePlay = () => {
  emit('play', props.song, props.index)
}

const handleAddToPlaylist = () => {
  emit('add-to-playlist', props.song)
}

const handleMore = () => {
  emit('more', props.song)
}
</script>

<style scoped>
.song-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #f5f5f5;
}

.song-item.current-song {
  background-color: #e6f7ff;
  color: #1890ff;
}

.song-index {
  width: 40px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.song-artist,
.song-album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin-right: 10px;
  max-width: 150px;
}

.song-album {
  max-width: 200px;
}

.song-duration {
  width: 60px;
  text-align: right;
  font-size: 12px;
  color: #999;
}

.song-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-item:hover .song-actions {
  opacity: 1;
}

.song-item.current-song .song-actions {
  opacity: 1;
}

.song-actions .el-button {
  color: #666;
}

.song-actions .el-button:hover {
  color: #1890ff;
}

.song-item.current-song .song-actions .el-button {
  color: #1890ff;
}
</style>