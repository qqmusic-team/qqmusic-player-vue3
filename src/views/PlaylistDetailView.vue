<template>
  <div class="playlist-detail">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载歌单详情中...</div>
    </div>

    <div v-else-if="playlistDetail" class="playlist-content">
      <!-- 歌单头部信息 -->
      <div class="playlist-header">
        <img class="playlist-cover" :src="playlistDetail.coverImgUrl" alt="歌单封面" />
        <div class="playlist-info">
          <div class="playlist-type">歌单</div>
          <h1 class="playlist-name">{{ playlistDetail.name }}</h1>
          <div class="playlist-desc">{{ playlistDetail.description }}</div>
          <div class="playlist-stats">
            <span class="stat-item">
              <i class="icon-user"></i>
              <span>{{ playlistDetail.creator.nickname }}</span>
            </span>
            <span class="stat-item">
              <i class="icon-play"></i>
              <span>{{ formatNumber(playlistDetail.playCount) }}</span>
            </span>
            <span class="stat-item">
              <i class="icon-collect"></i>
              <span>{{ formatNumber(playlistDetail.subscribedCount) }}</span>
            </span>
          </div>
          <div class="playlist-actions">
            <button class="btn-primary" @click="playAll">
              <i class="icon-play-all"></i>
              播放全部
            </button>
            <button class="btn-secondary" @click="collectPlaylist">
              <i class="icon-heart"></i>
              {{ isCollected ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 歌单歌曲列表 -->
      <div class="song-list">
        <div class="list-header">
          <div class="list-title">歌曲列表</div>
          <div class="list-count">(共 {{ playlistDetail.trackCount }} 首)</div>
        </div>
        <div class="songs-container">
          <div
            v-for="(song, index) in playlistDetail.tracks"
            :key="song.id"
            class="song-item"
            @click="playSong(song, index)"
          >
            <div class="song-index">{{ index + 1 }}</div>
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ formatArtists(song.ar) }}</div>
            </div>
            <div class="song-album">{{ song.al.name }}</div>
            <div class="song-duration">{{ formatDuration(song.dt) }}</div>
            <div class="song-actions">
              <button class="action-btn" @click.stop="addToList(song)">
                <i class="icon-add"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <div class="error-icon"></div>
      <div class="error-text">加载歌单详情失败，请稍后重试</div>
      <button class="btn-primary" @click="loadPlaylistDetail">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayListDetail } from '@/utils/api';
import { useNumberFormat } from '@/utils/number';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const playlistDetail = ref(null);
const isCollected = ref(false);

// 获取歌单ID
const playlistId = computed(() => route.params.id);

// 格式化数字
const formatNumber = useNumberFormat;

// 格式化歌手名称
const formatArtists = (artists) => {
  if (!artists) return '';
  return artists.map(ar => ar.name).join(', ');
};

// 格式化时长
const formatDuration = (ms) => {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// 加载歌单详情
const loadPlaylistDetail = async () => {
  if (!playlistId.value) return;

  loading.value = true;
  try {
    const data = await usePlayListDetail(playlistId.value);
    playlistDetail.value = data;
  } catch (error) {
    console.error('加载歌单详情失败:', error);
    ElMessage.error('加载歌单详情失败');
    playlistDetail.value = null;
  } finally {
    loading.value = false;
  }
};

// 播放全部歌曲
const playAll = () => {
  if (!playlistDetail.value || !playlistDetail.value.tracks) {
    ElMessage.warning('暂无歌曲可播放');
    return;
  }

  // 这里可以调用播放服务，播放全部歌曲
  console.log('播放全部歌曲:', playlistDetail.value.tracks);
  ElMessage.success(`开始播放《${playlistDetail.value.name}》`);
};

// 播放单首歌曲
const playSong = (song, index) => {
  console.log('播放歌曲:', song, '索引:', index);
  ElMessage.success(`开始播放《${song.name}》`);
};

// 收藏歌单
const collectPlaylist = () => {
  isCollected.value = !isCollected.value;
  ElMessage.success(isCollected.value ? '收藏成功' : '取消收藏成功');
};

// 添加到播放列表
const addToList = (song) => {
  console.log('添加歌曲到播放列表:', song);
  ElMessage.success('已添加到播放列表');
};

// 组件挂载时加载数据
onMounted(() => {
  loadPlaylistDetail();
});
</script>

<style scoped>
.playlist-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 14px;
}

/* 错误状态 */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

.error-icon {
  width: 60px;
  height: 60px;
  background-color: #e74c3c;
  border-radius: 50%;
  margin-bottom: 10px;
}

.error-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

/* 歌单内容 */
.playlist-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 歌单头部 */
.playlist-header {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 20px;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-type {
  color: #1890ff;
  font-size: 12px;
  margin-bottom: 8px;
}

.playlist-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.playlist-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.playlist-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 歌曲列表 */
.song-list {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.list-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.list-count {
  color: #999;
  font-size: 14px;
}

/* 歌曲列表容器 */
.songs-container {
  max-height: 600px;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: #fafafa;
}

.song-index {
  width: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.song-info {
  flex: 1;
  margin-right: 20px;
}

.song-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.song-album {
  width: 150px;
  color: #999;
  font-size: 12px;
  margin-right: 20px;
}

.song-duration {
  width: 60px;
  color: #999;
  font-size: 12px;
  text-align: right;
  margin-right: 20px;
}

.song-actions {
  width: 40px;
  text-align: center;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  transition: color 0.2s;
}

.action-btn:hover {
  color: #1890ff;
}

/* 图标样式（简化版，实际项目中可以使用图标库） */
.icon-user::before { content: '👤'; }
.icon-play::before { content: '▶️'; }
.icon-collect::before { content: '⭐'; }
.icon-play-all::before { content: '▶️'; }
.icon-heart::before { content: '❤️'; }
.icon-add::before { content: '+'; }
</style>
