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
          <span v-else class="playing-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.5 14.5V9.5M10 16.5V7.5M13.5 15.5V8.5M17 14V10"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </div>

        <div class="info">
          <div class="name truncate">{{ song.name }}</div>
          <div class="sub-info truncate">{{ song.artist }} - {{ song.album }}</div>
        </div>

        <div class="duration">{{ formatTime(song.duration) }}</div>

        <div class="actions">
          <button
            class="btn-icon play-btn"
            :class="{ active: song.id === currentSong?.id }"
            @click.stop="handlePlay(song)"
            :title="song.id === currentSong?.id && isPlaying ? '暂停' : '播放'"
            aria-label="播放/暂停"
          >
            <svg
              v-if="song.id === currentSong?.id && isPlaying"
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
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
              aria-hidden="true"
            >
              <path d="M12 9L26 18L12 27V9Z" fill="currentColor" />
            </svg>
          </button>
          <button
            class="btn-icon danger"
            @click.stop="handleDelete(song.id, song.name)"
            title="删除"
            aria-label="删除歌曲"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 3.75h6c.414 0 .75.336.75.75V6h3a.75.75 0 0 1 0 1.5h-.75l-.73 12.042A2.25 2.25 0 0 1 15.026 21H8.974a2.25 2.25 0 0 1-2.244-1.458L6 7.5h-.75a.75.75 0 0 1 0-1.5h3V4.5c0-.414.336-.75.75-.75ZM9.75 6h4.5V5.25h-4.5V6Z"
                fill="currentColor"
              />
              <path
                d="M10.5 10.5v7.5M13.5 10.5v7.5"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
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
  if (!songItem || !songItem.id) {
    ElMessage.warning("歌曲信息不完整，无法播放");
    return;
  }

  const isSameSong = songItem.id === currentSong.value?.id;

  if (isSameSong && isPlaying.value) {
    playerStore.togglePlay();
    return;
  }

  if (isSameSong && !isPlaying.value) {
    playerStore.togglePlay();
    return;
  }

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
.song-list-container {
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
  border-radius: 12px;
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
  background: transparent;
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
  transition: opacity 0.2s ease;
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
  opacity: 0;
  transition: opacity 0.2s ease;
}

.song-row:hover::before {
  opacity: 1;
}

.song-row:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 播放状态样式增强 */
.song-row.is-playing {
  color: var(--el-color-primary);
  background-color: rgba(24, 144, 255, 0.08);
  font-weight: 500;
}

.song-row.is-playing::before {
  opacity: 1;
}

/* 播放状态的额外视觉效果 */
.song-row.is-playing::after {
  display: none;
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
  transition: color 0.2s ease;
}

.song-row:hover .index-number {
  color: var(--el-text-color-primary);
}

.playing-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--el-color-primary);
}

.playing-icon svg {
  width: 18px;
  height: 18px;
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
  transition: color 0.2s ease;
  position: relative;
  display: inline-block;
}

.song-row:hover .name {
  color: var(--el-color-primary);
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
  transition: opacity 0.2s ease;
  z-index: 2;
}

.song-row:hover .actions {
  opacity: 1;
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
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  color: var(--el-text-color-regular);
  width: 28px;
  height: 28px;
  position: relative;
  overflow: hidden;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

.btn-icon.play-btn svg {
  width: 24px;
  height: 24px;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
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
  background-color: rgba(0, 0, 0, 0.08);
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

  .btn-icon svg {
    width: 18px;
    height: 18px;
  }

  .btn-icon.play-btn svg {
    width: 20px;
    height: 20px;
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
