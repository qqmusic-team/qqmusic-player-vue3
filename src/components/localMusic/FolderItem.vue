<template>
  <div class="folder-item" @click="handleClick">
    <div class="folder-icon">
      <el-icon :size="24" class="icon-folder">
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
        >
          <path
            d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32z"
            fill="#409EFF"
          ></path>
        </svg>
      </el-icon>
    </div>
    <div class="folder-info">
      <div class="folder-name" :title="folder.name">{{ folder.name }}</div>
      <div class="folder-stats">{{ folder.songCount }} 首歌曲 · {{ formatSize(folder.size) }}</div>
    </div>
    <div class="folder-actions">
      <el-button
        type="text"
        size="small"
        @click.stop="handlePlayAll"
        icon="el-icon-play"
      ></el-button>
      <el-button type="text" size="small" @click.stop="handleMore" icon="el-icon-more"></el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  folder: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["click", "play-all", "more"]);

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 处理点击事件
const handleClick = () => {
  emit("click", props.folder, props.index);
};

// 播放文件夹中所有歌曲
const handlePlayAll = () => {
  emit("play-all", props.folder);
};

// 更多操作
const handleMore = () => {
  emit("more", props.folder);
};
</script>

<style scoped>
.folder-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.folder-item:hover {
  background-color: #f5f5f5;
}

.folder-icon {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.icon-folder {
  font-size: 32px;
}

.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-stats {
  font-size: 12px;
  color: #999;
}

.folder-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.folder-item:hover .folder-actions {
  opacity: 1;
}

.folder-actions .el-button {
  color: #666;
}

.folder-actions .el-button:hover {
  color: #1890ff;
}
</style>
