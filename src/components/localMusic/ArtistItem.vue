<template>
  <div class="artist-item" @click="handleClick">
    <div class="artist-avatar">
      <div class="avatar-placeholder">
        <span class="artist-initial">{{ getArtistInitial(artist.name) }}</span>
      </div>
    </div>
    <div class="artist-info">
      <div class="artist-name" :title="artist.name">{{ artist.name }}</div>
      <div class="artist-stats">{{ artist.songCount }} 首歌曲</div>
    </div>
    <div class="artist-actions">
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
  artist: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["click", "play-all", "more"]);

// 获取歌手名字的首字母作为占位符
const getArtistInitial = (name) => {
  if (!name) return "?";

  // 处理中文名字
  const chineseFirstChar = name.charAt(0);
  if (/[\u4e00-\u9fa5]/.test(chineseFirstChar)) {
    // 如果是中文，返回第一个字符
    return chineseFirstChar;
  }

  // 处理英文名字，返回大写首字母
  return name.charAt(0).toUpperCase();
};

// 处理点击事件
const handleClick = () => {
  emit("click", props.artist, props.index);
};

// 播放所有歌曲
const handlePlayAll = () => {
  emit("play-all", props.artist);
};

// 更多操作
const handleMore = () => {
  emit("more", props.artist);
};
</script>

<style scoped>
.artist-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.artist-item:hover {
  background-color: #f5f5f5;
}

.artist-avatar {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.artist-info {
  flex: 1;
  min-width: 0;
}

.artist-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-stats {
  font-size: 12px;
  color: #999;
}

.artist-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.artist-item:hover .artist-actions {
  opacity: 1;
}

.artist-actions .el-button {
  color: #666;
}

.artist-actions .el-button:hover {
  color: #1890ff;
}
</style>
