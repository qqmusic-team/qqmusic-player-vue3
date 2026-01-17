<template>
  <div class="recent-play-view">
    <!-- 页面标题和操作 -->
    <div class="page-header">
      <h2 class="page-title">最近播放</h2>
      <div v-if="playHistory.length > 0" class="page-actions">
        <el-button text size="small" @click="confirmClearHistory">清空全部</el-button>
      </div>
    </div>

    <!-- 最近播放列表 -->
    <div class="playlist-list">
      <!-- 空数据状态 -->
      <div v-if="playHistory.length === 0" class="empty-state">
        <div class="empty-message">暂无播放历史</div>
        <div class="empty-tip">播放歌曲后，会在这里显示</div>
      </div>

      <!-- 播放历史列表 -->
      <div
        v-else
        v-for="record in playHistory"
        :key="record.id"
        class="playlist-row"
        @click="playSong(record)"
      >
        <img class="pl-cover" :src="record.cover || defaultCover" alt="" />
        <div class="pl-meta">
          <div class="pl-name">{{ record.name }}</div>
          <div class="pl-sub">
            <span>{{ record.artist }}</span>
            <span class="dot-separator">·</span>
            <span>{{ new Date(record.lastPlayedAt).toLocaleString() }}</span>
            <span class="dot-separator">·</span>
            <span>播放 {{ record.playCount }} 次</span>
          </div>
        </div>

        <div class="pl-actions" @click.stop>
          <el-button circle text :icon="Delete" @click="deletePlayRecord(record.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getPlayHistory, removePlayRecord, clearAllPlayHistory, recordPlay } from "@/utils/playHistory";
import { usePlayerStore } from "@/stores/player";

// 定义组件名称
defineOptions({ name: "RecentPlayView" });

// 默认封面图片
const defaultCover = "https://p3.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg";

// 播放历史列表
const playHistory = ref([]);

// 播放器状态管理
const playerStore = usePlayerStore();

// 加载播放历史
const loadPlayHistory = () => {
  playHistory.value = getPlayHistory();
};

// 播放歌曲
const playSong = (song) => {
  // 直接调用 recordPlay 函数来增加播放次数
  recordPlay({
    id: song.id,
    name: song.name,
    artist: song.artist,
    album: song.album,
    cover: song.cover
  });
  // 将字符串类型的 ID 转换为数字类型
  const numericSong = {
    ...song,
    id: typeof song.id === 'string' ? parseInt(song.id, 10) : song.id
  };
  // 调用播放器的 playSong 方法来播放歌曲
  playerStore.playSong(numericSong);
  // 重新加载播放历史列表以更新界面显示
  loadPlayHistory();
};

// 删除单条播放记录
const deletePlayRecord = (recordId) => {
  ElMessageBox.confirm("确定要删除这条播放记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      removePlayRecord(recordId);
      loadPlayHistory();
      ElMessage.success("删除成功");
    })
    .catch(() => {
      // 取消删除，不做任何操作
    });
};

// 确认清空全部播放历史
const confirmClearHistory = () => {
  ElMessageBox.confirm("确定要清空所有播放历史吗？此操作不可恢复。", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error",
  })
    .then(() => {
      clearAllPlayHistory();
      loadPlayHistory();
      ElMessage.success("播放历史已清空");
    })
    .catch(() => {
      // 取消清空，不做任何操作
    });
};

// 监听本地存储变化
const handleStorageChange = () => {
  loadPlayHistory();
};

onMounted(() => {
  loadPlayHistory();
  // 添加本地存储变化监听
  window.addEventListener("storage", handleStorageChange);
});

onUnmounted(() => {
  // 移除本地存储变化监听
  window.removeEventListener("storage", handleStorageChange);
});
</script>

<style scoped>
.recent-play-view {
  padding: 20px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.2px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
}

.playlist-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-message {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 12px;
}

.playlist-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.playlist-row:hover {
  background-color: #fafafa;
}

.pl-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 16px;
}

.pl-meta {
  flex: 1;
  min-width: 0;
}

.pl-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl-sub {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dot-separator {
  margin: 0 8px;
}

.pl-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-row:hover .pl-actions {
  opacity: 1;
}
</style>
