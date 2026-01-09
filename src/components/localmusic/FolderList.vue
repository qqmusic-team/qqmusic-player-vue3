<template>
  <div class="folder-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span class="loading-text">正在加载文件夹...</span>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="!loading && folders.length === 0" class="empty-state">
      暂无本地文件夹，请导入本地音乐文件
    </div>

    <!-- 文件夹列表 -->
    <div v-else>
      <div
        v-for="folder in folders"
        :key="folder.path"
        class="folder-item"
        :class="{
          active: activeFolder === folder.path,
          'is-selected': selectedFolders.has(folder.path),
        }"
        @click="handleFolderClick(folder)"
      >
        <div class="folder-header">
          <div class="checkbox-section">
            <input
              type="checkbox"
              :checked="selectedFolders.has(folder.path)"
              @click.stop="handleCheckboxClick(folder)"
              class="folder-checkbox"
            />
          </div>
          <div class="icon-section">
            <span class="folder-icon">📁</span>
            <button
              class="expand-btn"
              @click.stop="toggleFolder(folder)"
              :class="{ expanded: expandedFolders.has(folder.path) }"
            >
              ▶
            </button>
          </div>

          <div class="folder-info">
            <h3 class="folder-name">{{ folder.name }}</h3>
            <p class="folder-meta">
              <span class="folder-path">{{ folder.path }}</span>
              <span class="separator">·</span>
              <span class="count">{{ folder.count }}首</span>
            </p>
          </div>

          <div class="action-section">
            <button
              class="play-btn"
              @click.stop="handlePlayFolder(folder)"
              :title="`播放${folder.name}中的所有歌曲`"
            >
              <span class="play-icon">▶</span>
              <span class="play-text">播放</span>
            </button>
          </div>
        </div>

        <!-- 文件夹展开内容 - 为后续功能预留 -->
        <div v-if="expandedFolders.has(folder.path)" class="folder-content">
          <div class="expand-placeholder">包含 {{ folder.count }} 首歌曲</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  songs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedFolders: {
    type: Set,
    default: () => new Set(),
  },
});

const emit = defineEmits(["play-folder", "folder-click", "toggle-folder", "selection-change"]);

// 响应式数据
const activeFolder = ref(null);
const expandedFolders = ref(new Set());

// 计算文件夹列表
const folders = computed(() => {
  const map = {};

  props.songs.forEach((song) => {
    // 优先使用 song.folder 字段（上传的歌曲）
    // 如果没有 folder 字段，则从 song.path 中提取（导入的歌曲）
    let dirPath = "默认导入文件夹";
    let dirName = "默认导入文件夹";

    if (song.folder) {
      // 使用 song.folder 字段
      dirPath = song.folder;
      dirName = song.folder;
    } else if (song.path && song.path.includes("/")) {
      // 从 song.path 中提取文件夹信息
      const parts = song.path.split("/");
      parts.pop();
      dirPath = parts.join("/");
      dirName = parts[parts.length - 1] || "根目录";
    }

    if (!map[dirPath]) {
      map[dirPath] = {
        name: dirName,
        path: dirPath,
        count: 0,
      };
    }
    map[dirPath].count++;
  });

  return Object.values(map);
});

// 处理文件夹点击
function handleFolderClick(folder) {
  activeFolder.value = folder.path;
  emit("folder-click", folder);
}

// 处理播放文件夹
function handlePlayFolder(folder) {
  emit("play-folder", folder.path);
}

// 切换文件夹展开状态
function toggleFolder(folder) {
  const path = folder.path;
  if (expandedFolders.value.has(path)) {
    expandedFolders.value.delete(path);
  } else {
    expandedFolders.value.add(path);
  }
  emit("toggle-folder", folder, expandedFolders.value.has(path));
}

// 处理文件夹多选框点击
function handleCheckboxClick(folder) {
  const newSelected = new Set(props.selectedFolders);
  if (newSelected.has(folder.path)) {
    newSelected.delete(folder.path);
  } else {
    newSelected.add(folder.path);
  }
  emit("selection-change", newSelected);
}
</script>

<style scoped>
.folder-list {
  padding: 16px 24px;
  background-color: #fff;
  min-height: 200px;
  border-radius: 8px;
}

/* 文件夹项 */
.folder-item {
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 选中状态 */
.folder-item.is-selected {
  background-color: rgba(24, 144, 255, 0.1);
  border-color: #b3d8ff;
}

/* 多选框部分 */
.checkbox-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
}

/* 文件夹多选框样式 */
.folder-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #409eff;
  transition: all 0.3s ease;
}

.folder-checkbox:hover {
  transform: scale(1.1);
}

.folder-item:hover .folder-checkbox {
  opacity: 1;
}

.folder-item:hover {
  background-color: #f8f9fa;
  border-color: #e9ecef;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.folder-item.active {
  background-color: #f0f7ff;
  border-color: #b3d8ff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
}

/* 文件夹头部 */
.folder-header {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  gap: 12px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.folder-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 图标部分 */
.icon-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.folder-icon {
  font-size: 28px;
  color: #ffb800;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.folder-item:hover .folder-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.expand-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: #6c757d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  position: relative;
}

.expand-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(108, 117, 125, 0.08);
  border-radius: 4px;
  transform: scale(0);
  transition: transform 0.2s ease;
}

.expand-btn:hover::before {
  transform: scale(1);
}

.expand-btn:hover {
  color: #409eff;
}

.expand-btn.expanded {
  transform: rotate(90deg);
  color: #409eff;
}

/* 文件夹信息 */
.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.folder-item:hover .folder-name {
  color: #409eff;
}

.folder-meta {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
  flex-wrap: wrap;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.folder-path {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.folder-item:hover .folder-path {
  color: #495057;
}

.separator {
  color: #adb5bd;
}

/* 操作部分 */
.action-section {
  flex-shrink: 0;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.play-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.play-btn:hover::before {
  width: 300px;
  height: 300px;
}

.folder-item:hover .play-btn {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
}

.play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.play-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.play-icon {
  font-size: 12px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.play-btn:hover .play-icon {
  transform: scale(1.2) translateX(1px);
}

.play-text {
  position: relative;
  z-index: 1;
}

/* 文件夹展开内容 */
.folder-content {
  border-top: 1px solid #e9ecef;
  padding: 12px 16px 16px 100px;
  background-color: #fafafa;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-placeholder {
  color: #6c757d;
  font-size: 14px;
  font-style: italic;
  opacity: 0;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #6c757d;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;
}

.loading-spinner::after {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 3px solid transparent;
  border-top: 3px solid rgba(64, 158, 255, 0.3);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.loading-text {
  font-size: 14px;
  animation: pulse 2s ease-in-out infinite;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
    padding-top: 12px;
    padding-bottom: 16px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .folder-list {
    padding: 12px 16px;
  }

  .folder-header {
    padding: 12px;
    gap: 8px;
  }

  .folder-item:hover {
    transform: translateX(1px);
  }

  .folder-icon {
    font-size: 24px;
  }

  .folder-name {
    font-size: 14px;
  }

  .folder-meta {
    font-size: 12px;
    gap: 6px;
  }

  .folder-path {
    max-width: 150px;
  }

  .play-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .play-text {
    display: none;
  }

  .folder-content {
    padding-left: 70px;
  }
}
</style>
