<template>
  <div class="album-item" @click="handleClick">
    <div class="album-cover">
      <img :src="album.cover || defaultCover" :alt="album.name" />
      <div class="play-overlay">
        <el-button
          type="text"
          icon="el-icon-play"
          size="small"
          @click.stop="handlePlayAll"
          class="play-button"
        ></el-button>
      </div>
    </div>
    <div class="album-info">
      <div class="album-name" :title="album.name">{{ album.name }}</div>
      <div class="album-artist" :title="album.artist">{{ album.artist }}</div>
      <div class="album-stats">{{ album.songCount }} 首歌曲</div>
    </div>
    <div class="album-actions">
      <el-button type="text" size="small" @click.stop="handleMore" icon="el-icon-more"></el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  album: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["click", "play-all", "more"]);

const defaultCover = require("@/assets/default-cover.jpg");

// 处理点击事件
const handleClick = () => {
  emit("click", props.album, props.index);
};

// 播放专辑所有歌曲
const handlePlayAll = () => {
  emit("play-all", props.album);
};

// 更多操作
const handleMore = () => {
  emit("more", props.album);
};
</script>

<style scoped>
.album-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.album-item:hover {
  background-color: #f5f5f5;
}

.album-cover {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  flex-shrink: 0;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.album-item:hover .album-cover img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-item:hover .play-overlay {
  opacity: 1;
}

.play-button {
  color: white !important;
  font-size: 20px !important;
}

.play-button:hover {
  color: #1890ff !important;
}

.album-info {
  flex: 1;
  min-width: 0;
}

.album-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-stats {
  font-size: 12px;
  color: #999;
}

.album-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-item:hover .album-actions {
  opacity: 1;
}

.album-actions .el-button {
  color: #666;
}

.album-actions .el-button:hover {
  color: #1890ff;
}
</style>
