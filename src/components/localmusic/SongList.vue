<template>
  <div class="song-list-container">
    <div v-if="songs.length === 0" class="empty-state">暂无歌曲，请点击右上角导入</div>

    <TransitionGroup name="list" tag="div" class="songs-wrapper">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="song-row"
        :class="{
          'is-playing': currentSong?.id === song.id,
          'is-selected': props.selectedSongs.has(song.id),
        }"
        @click="handleRowClick(song, $event)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = -1"
      >
        <div class="checkbox">
          <input
            type="checkbox"
            :checked="props.selectedSongs.has(song.id)"
            @click.stop="handleCheckboxClick(song.id)"
          />
        </div>
        <div class="index">
          <span v-if="currentSong?.id !== song.id" class="index-number">{{ index + 1 }}</span>
          <span v-else class="playing-icon">🎵</span>
        </div>

        <div class="info">
          <div class="name truncate">{{ song.name }}</div>
          <div class="sub-info truncate">{{ song.artist }} - {{ song.album }}</div>
        </div>

        <div class="duration">{{ formatTime(song.duration) }}</div>

        <div class="actions">
          <button
            class="btn-icon"
            :class="{ active: song.id === currentSong?.id }"
            @click.stop="handlePlay(song)"
            :title="song.id === currentSong?.id && isPlaying ? '暂停' : '播放'"
            aria-label="播放/暂停"
          >
            {{ song.id === currentSong?.id && isPlaying ? "⏸️" : "▶️" }}
          </button>
          <button
            class="btn-icon danger"
            @click.stop="handleDelete(song.id, song.name)"
            title="删除"
            aria-label="删除歌曲"
          >
            🗑️
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "@/stores/player";
import type { LocalSong } from "@/stores/player";

// 使用 player store
const playerStore = usePlayerStore();
const { song: currentSong, isPlaying } = storeToRefs(playerStore);

// Props
interface Props {
  songs: LocalSong[];
  selectedSongs: Set<string | number>;
}

const props = withDefaults(defineProps<Props>(), {
  songs: () => [],
  selectedSongs: () => new Set(),
});

const emit = defineEmits<{
  delete: [id: string | number];
  "selection-change": [selectedIds: Set<string | number>];
}>();

// 当前悬停的索引，用于更精细的交互反馈
const hoveredIndex = ref(-1);

// 处理播放按钮点击，直接使用 playerStore
const handlePlay = (songItem: LocalSong) => {
  console.log("[SongList] handlePlay 被调用:", songItem);

  if (!songItem || !songItem.id) {
    console.error("[SongList] 歌曲信息不完整:", songItem);
    ElMessage.warning("歌曲信息不完整，无法播放");
    return;
  }

  console.log("[SongList] 当前播放歌曲 ID:", currentSong.value?.id, "点击歌曲 ID:", songItem.id);
  console.log("[SongList] 当前播放状态:", isPlaying.value);

  const isSameSong = songItem.id === currentSong.value?.id;
  console.log("[SongList] 是否同一首歌:", isSameSong);

  if (isSameSong && isPlaying.value) {
    console.log("[SongList] 同一首歌正在播放，切换为暂停");
    playerStore.togglePlay();
    return;
  }

  if (isSameSong && !isPlaying.value) {
    console.log("[SongList] 同一首歌暂停状态，继续播放");
    playerStore.togglePlay();
    return;
  }

  console.log("[SongList] 播放新歌:", songItem.name);
  ElMessage.success(`正在播放: ${songItem.name}`);

  playerStore.playLocalSong(songItem);
};

// 处理多选框点击
const handleCheckboxClick = (id: string | number) => {
  const newSelected = new Set(props.selectedSongs);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  emit("selection-change", newSelected);
};

// 处理行点击
const handleRowClick = (song: LocalSong, event: MouseEvent) => {
  // 如果点击的不是按钮和复选框，则播放歌曲
  const target = event.target as HTMLElement;
  if (!target.closest(".btn-icon") && !target.closest(".checkbox")) {
    handlePlay(song);
  }
};

// 处理删除，添加确认提示
const handleDelete = (id: string | number, name: string) => {
  if (confirm(`确定要删除歌曲 "${name}" 吗？`)) {
    emit("delete", id);
    ElMessage.success(`已删除歌曲: ${name}`);
  }
};

// 格式化时间
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
</script>

<style scoped>
/* 使用全局CSS变量确保与项目主题一致 */
:root {
  /* Element Plus 主题变量 - 与HeaderControl.vue保持一致 */
  --el-color-primary: #1890ff;
  --el-border-color: #dcdfe6;
  --el-border-color-hover: #c0c4cc;
  --el-bg-color: #f5f7fa;
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;
  --el-border-radius-base: 4px;
  --el-box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --el-color-danger: #f56c6c;
  --animation-duration: 0.3s;

  /* 项目全局变量 */
  --font-size-normal: 14px;
  --font-size-small: 12px;
  --font-size-large: 16px;
}

.song-list-container {
  width: 100%;
  min-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px 24px;
}

/* 列表容器 */
.songs-wrapper {
  width: 100%;
}

.song-row {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid var(--el-border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.05));
  background-size: 200% 100%;
  background-position: 100% 0;
  font-size: var(--font-size-normal);
}

/* 选中状态 */
.song-row.is-selected {
  background-color: rgba(24, 144, 255, 0.1);
  border-left: 4px solid var(--el-color-primary);
}

/* 多选框样式 */
.checkbox {
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--el-color-primary);
  transition: all 0.2s ease;
}

.checkbox input[type="checkbox"]:hover {
  transform: scale(1.1);
}

.song-row:hover .checkbox input[type="checkbox"] {
  opacity: 1;
}

.checkbox input[type="checkbox"] {
  opacity: 0.7;
}

/* 添加背景渐变效果 - 与整体设计语言保持一致 */
.song-row::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--el-color-primary);
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}

.song-row:hover::before {
  transform: translateX(0);
}

.song-row:hover {
  background-color: var(--el-bg-color);
  transform: translateX(2px);
  background-position: 0 0;
  box-shadow: var(--el-box-shadow-light);
}

/* 播放状态样式增强 */
.song-row.is-playing {
  color: var(--el-color-primary);
  background-color: rgba(24, 144, 255, 0.08);
  font-weight: 500;
  background-position: 0 0;
}

.song-row.is-playing::before {
  transform: translateX(0);
}

/* 播放状态的额外视觉效果 */
.song-row.is-playing::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.1), transparent);
  animation: sound-wave 1s ease-in-out infinite;
}

@keyframes sound-wave {
  0%,
  100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

.index {
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.index-number {
  color: var(--el-text-color-secondary);
  font-size: var(--font-size-normal);
  transition: all 0.2s ease;
}

.song-row:hover .index-number {
  color: var(--el-text-color-primary);
  transform: scale(1.05);
}

.playing-icon {
  animation: pulse 1.5s infinite;
  font-size: var(--font-size-large);
  filter: drop-shadow(0 0 4px rgba(24, 144, 255, 0.5));
  position: relative;
}

/* 增强的播放图标动画 */
.playing-icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--el-color-primary);
  opacity: 0.2;
  transform: translate(-50%, -50%) scale(0);
  animation: play-ring 2s infinite;
}

@keyframes play-ring {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.info {
  flex: 1;
  min-width: 0;
  margin: 0 15px;
  transition: color 0.2s ease;
  z-index: 1;
}

.name {
  font-size: var(--font-size-normal);
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  position: relative;
  display: inline-block;
}

.song-row:hover .name {
  color: var(--el-color-primary);
  transform: translateX(2px);
}

/* 添加文字悬停动效 */
.name::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--el-color-primary);
  transition: width 0.3s ease;
}

.song-row:hover .name::after {
  width: 100%;
}

.sub-info {
  font-size: var(--font-size-small);
  color: var(--el-text-color-secondary);
  line-height: 1.3;
  transition: color 0.2s ease;
}

.song-row:hover .sub-info {
  color: var(--el-text-color-regular);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.duration {
  width: 60px;
  font-size: var(--font-size-small);
  color: var(--el-text-color-secondary);
  text-align: right;
  transition: color 0.2s ease;
  z-index: 1;
}

.song-row:hover .duration {
  color: var(--el-text-color-regular);
}

.actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.2s ease;
  transform: translateY(2px);
  z-index: 2;
}

.song-row:hover .actions {
  opacity: 1;
  transform: translateY(0);
}

.btn-icon {
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--font-size-normal);
  padding: 4px;
  border-radius: var(--el-border-radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--el-text-color-regular);
  width: 28px;
  height: 28px;
  position: relative;
  overflow: hidden;
}

/* 按钮悬停背景动效 - 与HeaderControl.vue的按钮风格保持一致 */
.btn-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease, height 0.3s ease;
  transform: translate(-50%, -50%);
}

.btn-icon:hover::before {
  width: 100px;
  height: 100px;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
  box-shadow: var(--el-box-shadow-light);
}

.btn-icon.active {
  color: var(--el-color-primary);
}

.btn-icon.danger:hover {
  color: var(--el-color-danger);
  background-color: rgba(245, 108, 108, 0.1);
}

.btn-icon.danger::before {
  background: rgba(245, 108, 108, 0.1);
}

/* 添加按钮点击动画 - 统一的交互反馈 */
.btn-icon:active {
  transform: scale(0.95);
}

/* 空状态样式 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 列表项进入和离开的过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all var(--animation-duration) ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform var(--animation-duration) ease;
}

.list-leave-active {
  position: absolute;
  width: calc(100% - 30px);
}

/* 响应式设计 - 与全局响应式断点保持一致 */
@media (max-width: 1023px) and (min-width: 768px) {
  .song-row {
    padding: 11px 12px;
    font-size: 14px;
  }
}

@media (max-width: 767px) and (min-width: 481px) {
  .song-row {
    padding: 10px;
    font-size: 13px;
  }

  .song-row:hover {
    transform: none;
  }

  .song-row.is-playing::after {
    display: none;
  }

  .index {
    width: 30px;
  }

  .info {
    margin: 0 10px;
  }

  .name {
    font-size: 13px;
  }

  .sub-info {
    font-size: 11px;
  }

  .duration {
    width: 50px;
    font-size: 12px;
  }

  .btn-icon {
    font-size: 14px;
    width: 24px;
    height: 24px;
    padding: 2px;
  }

  .playing-icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .song-row {
    padding: 8px;
    background-size: 150% 100%;
    font-size: 12px;
  }

  .info {
    flex: 1;
    min-width: 0;
  }

  .duration {
    display: none;
  }

  .actions {
    opacity: 1; /* 在小屏幕上始终显示操作按钮 */
    transform: none;
  }
}
</style>
