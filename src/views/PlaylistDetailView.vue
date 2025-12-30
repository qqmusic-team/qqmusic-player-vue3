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
            <button v-if="playlistId.toString().startsWith('pl_')" class="btn-add" @click="openAddSongDialog">
              <i class="icon-plus"></i>
              添加歌曲
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

    <el-dialog v-model="addSongDialogVisible" title="添加歌曲到歌单" width="600px" class="add-song-dialog">
      <div class="dialog-content">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索歌曲"
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
        <div class="song-selection-list">
          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="song-selection-item"
            :class="{ selected: isSongSelected(song.id) }"
            @click="toggleSongSelection(song)"
          >
            <div class="song-selection-info">
              <div class="song-selection-name">{{ song.name }}</div>
              <div class="song-selection-artist">{{ song.artist }}</div>
            </div>
            <div class="song-selection-check">
              <el-checkbox :model-value="isSongSelected(song.id)" />
            </div>
          </div>
          <div v-if="filteredSongs.length === 0" class="empty-tip">
            没有找到相关歌曲
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <span class="selected-count">已选择 {{ selectedSongs.length }} 首歌曲</span>
          <el-button @click="addSongDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddSongs" :disabled="selectedSongs.length === 0">
            确定添加
          </el-button>
        </span>
      </template>
    </el-dialog>
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

// 添加歌曲相关状态
const addSongDialogVisible = ref(false);
const searchKeyword = ref('');
const selectedSongs = ref([]);
const allAvailableSongs = ref([]);

// 导入本地图片作为示例歌曲
const img1 = new URL('../assets/imgs/1.png', import.meta.url).href;
const img2 = new URL('../assets/imgs/2.png', import.meta.url).href;
const img3 = new URL('../assets/imgs/3.png', import.meta.url).href;
const img4 = new URL('../assets/imgs/4.png', import.meta.url).href;
const img5 = new URL('../assets/imgs/5.png', import.meta.url).href;

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
    console.log('========== 开始加载歌单详情 ==========');
    console.log('歌单 ID:', playlistId.value);
    console.log('歌单 ID 类型:', typeof playlistId.value);

    if (playlistId.value === 'liked') {
      console.log('加载我喜欢的音乐');
      const MUSIC_KEY = "qqmusic_profile_music_v1";
      const savedMusic = localStorage.getItem(MUSIC_KEY);
      console.log('localStorage 中的数据:', savedMusic);

      if (!savedMusic) {
        console.warn('localStorage 中没有找到音乐数据');
        const likedSongs = [];
        playlistDetail.value = {
          id: 'liked',
          name: '我喜欢的音乐',
          coverImgUrl: 'https://via.placeholder.com/200x200.png?text=%E2%99%AA',
          description: '我收藏的所有喜欢的歌曲',
          creator: { nickname: '我' },
          playCount: 0,
          subscribedCount: 0,
          trackCount: 0,
          tracks: []
        };
        return;
      }

      let parsedMusic;
      try {
        parsedMusic = JSON.parse(savedMusic);
        console.log('解析后的数据:', parsedMusic);
      } catch (parseError) {
        console.error('解析 localStorage 数据失败:', parseError);
        throw new Error('数据解析失败，请清除缓存后重试');
      }

      const likedSongs = parsedMusic.likedSongs || [];
      console.log('喜欢的歌曲数量:', likedSongs.length);

      playlistDetail.value = {
        id: 'liked',
        name: '我喜欢的音乐',
        coverImgUrl: likedSongs.length > 0 && likedSongs[0].cover ? likedSongs[0].cover : 'https://via.placeholder.com/200x200.png?text=%E2%99%AA',
        description: '我收藏的所有喜欢的歌曲',
        creator: { nickname: '我' },
        playCount: parsedMusic.likedPlayCount || 0,
        subscribedCount: 0,
        trackCount: likedSongs.length,
        tracks: likedSongs.map((song, index) => ({
          id: song.id || `liked_${index}`,
          name: song.name,
          ar: [{ name: song.artist }],
          al: { name: song.album },
          dt: song.duration ? parseInt(song.duration.split(':')[0]) * 60000 + parseInt(song.duration.split(':')[1]) * 1000 : 0
        }))
      };
      console.log('我喜欢的音乐加载成功:', playlistDetail.value);

    } else if (playlistId.value.toString().startsWith('pl_')) {
      console.log('加载用户创建的歌单');
      const MUSIC_KEY = "qqmusic_profile_music_v1";
      const savedMusic = localStorage.getItem(MUSIC_KEY);
      console.log('localStorage 中的数据:', savedMusic);

      if (!savedMusic) {
        console.warn('localStorage 中没有找到音乐数据');
        throw new Error('未找到歌单数据，请先创建歌单');
      }

      let parsedMusic;
      try {
        parsedMusic = JSON.parse(savedMusic);
        console.log('解析后的数据:', parsedMusic);
      } catch (parseError) {
        console.error('解析 localStorage 数据失败:', parseError);
        throw new Error('数据解析失败，请清除缓存后重试');
      }

      const playlists = parsedMusic.playlists || [];
      console.log('解析后的歌单列表:', playlists);
      console.log('歌单列表长度:', playlists.length);
      console.log('查找的歌单 ID:', playlistId.value);
      console.log('查找的歌单 ID 类型:', typeof playlistId.value);

      const playlist = playlists.find(pl => {
        console.log('比较歌单:', pl.id, '类型:', typeof pl.id, '与目标:', playlistId.value);
        return String(pl.id) === String(playlistId.value);
      });
      console.log('找到的歌单:', playlist);

      if (!playlist) {
        console.error('歌单不存在，可用的歌单ID:', playlists.map(p => p.id));
        throw new Error(`歌单不存在（ID: ${playlistId.value}）`);
      }

      if (!playlist.tracks || !Array.isArray(playlist.tracks)) {
        console.error('歌单数据格式错误，缺少 tracks 数组');
        playlist.tracks = [];
      }

      playlistDetail.value = {
        id: playlist.id,
        name: playlist.name,
        coverImgUrl: playlist.cover || 'https://via.placeholder.com/200x200.png?text=%E2%99%AA',
        description: `创建者：${playlist.creator}`,
        creator: { nickname: playlist.creator || '我' },
        playCount: 0,
        subscribedCount: 0,
        trackCount: playlist.tracks.length,
        tracks: playlist.tracks.map((song, index) => ({
          id: song.id || `${playlist.id}_${index}`,
          name: song.name,
          ar: [{ name: song.artist }],
          al: { name: song.album },
          dt: song.duration ? parseInt(song.duration.split(':')[0]) * 60000 + parseInt(song.duration.split(':')[1]) * 1000 : 0
        }))
      };
      console.log('用户歌单加载成功:', playlistDetail.value);

    } else {
      console.log('从 API 加载歌单');
      const data = await usePlayListDetail(playlistId.value);
      playlistDetail.value = data;
      console.log('API 歌单加载成功:', playlistDetail.value);
    }

    console.log('========== 歌单详情加载完成 ==========');

  } catch (error) {
    console.error('========== 加载歌单详情失败 ==========');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('歌单 ID:', playlistId.value);

    let errorMessage = '加载歌单详情失败';
    if (error.message.includes('歌单不存在')) {
      errorMessage = error.message;
    } else if (error.message.includes('数据解析失败')) {
      errorMessage = error.message;
    } else if (error.message.includes('未找到歌单数据')) {
      errorMessage = error.message;
    }

    ElMessage.error(errorMessage);
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

// 示例歌曲数据（可以从API或其他地方获取）
const exampleSongs = [
  {
    id: "s1",
    name: "清透",
    artist: "陈粒",
    cover: img1,
    tag: "SQ",
    album: "清透"
  },
  {
    id: "s2",
    name: "小孩",
    artist: "罗森涛",
    cover: img2,
    tag: "独家",
    album: "小孩"
  },
  {
    id: "s3",
    name: "爱情讯息",
    artist: "洪一诺",
    cover: img3,
    tag: "",
    album: "爱情讯息"
  },
  {
    id: "s4",
    name: "最初的记忆",
    artist: "云汐",
    cover: img4,
    tag: "MV",
    album: "最初的记忆"
  },
  {
    id: "s5",
    name: "戒不掉",
    artist: "田馥甄",
    cover: img5,
    tag: "",
    album: "戒不掉"
  }
];

// 过滤后的歌曲列表（用于搜索）
const filteredSongs = computed(() => {
  if (!searchKeyword.value) {
    return allAvailableSongs.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return allAvailableSongs.value.filter(song =>
    song.name.toLowerCase().includes(keyword) ||
    song.artist.toLowerCase().includes(keyword)
  );
});

// 打开添加歌曲对话框
const openAddSongDialog = () => {
  addSongDialogVisible.value = true;
  searchKeyword.value = '';
  selectedSongs.value = [];
  allAvailableSongs.value = [...exampleSongs];
  console.log('打开添加歌曲对话框，可用歌曲数量:', allAvailableSongs.value.length);
};

// 处理搜索
const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value);
};

// 切换歌曲选择状态
const toggleSongSelection = (song) => {
  const index = selectedSongs.value.findIndex(s => s.id === song.id);
  if (index > -1) {
    selectedSongs.value.splice(index, 1);
  } else {
    selectedSongs.value.push(song);
  }
  console.log('当前选中的歌曲:', selectedSongs.value);
};

// 检查歌曲是否被选中
const isSongSelected = (songId) => {
  return selectedSongs.value.some(s => s.id === songId);
};

// 确认添加歌曲到歌单
const confirmAddSongs = async () => {
  if (selectedSongs.value.length === 0) {
    ElMessage.warning('请至少选择一首歌曲');
    return;
  }

  try {
    console.log('开始添加歌曲到歌单...');
    console.log('歌单ID:', playlistId.value);
    console.log('要添加的歌曲:', selectedSongs.value);

    const MUSIC_KEY = "qqmusic_profile_music_v1";
    const savedMusic = localStorage.getItem(MUSIC_KEY);

    if (!savedMusic) {
      ElMessage.error('未找到歌单数据');
      return;
    }

    const parsedMusic = JSON.parse(savedMusic);
    const playlists = parsedMusic.playlists || [];
    const playlistIndex = playlists.findIndex(pl => String(pl.id) === String(playlistId.value));

    if (playlistIndex === -1) {
      ElMessage.error('歌单不存在');
      return;
    }

    const playlist = playlists[playlistIndex];
    const currentSongIds = playlist.tracks.map(t => t.id);

    let addedCount = 0;
    const newSongs = [];

    selectedSongs.value.forEach(song => {
      if (!currentSongIds.includes(song.id)) {
        newSongs.push({
          id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album || '',
          cover: song.cover || '',
          duration: '3:30'
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      ElMessage.warning('所选歌曲已在歌单中');
      addSongDialogVisible.value = false;
      return;
    }

    playlist.tracks.push(...newSongs);
    parsedMusic.playlists = playlists;

    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
    console.log('保存到localStorage成功');

    ElMessage.success(`成功添加 ${addedCount} 首歌曲到歌单`);
    addSongDialogVisible.value = false;
    selectedSongs.value = [];

    await loadPlaylistDetail();

  } catch (error) {
    console.error('添加歌曲失败:', error);
    ElMessage.error('添加歌曲失败，请重试');
  }
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
.icon-plus::before { content: '+'; }

/* 添加歌曲按钮样式 */
.btn-add {
  background-color: #52c41a;
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

.btn-add:hover {
  background-color: #73d13d;
}

/* 添加歌曲对话框样式 */
.add-song-dialog .dialog-content {
  padding: 10px 0;
}

.add-song-dialog .search-box {
  margin-bottom: 20px;
}

.add-song-dialog .song-selection-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.add-song-dialog .song-selection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.add-song-dialog .song-selection-item:hover {
  background-color: #fafafa;
}

.add-song-dialog .song-selection-item.selected {
  background-color: #e6f7ff;
}

.add-song-dialog .song-selection-info {
  flex: 1;
}

.add-song-dialog .song-selection-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.add-song-dialog .song-selection-artist {
  font-size: 12px;
  color: #999;
}

.add-song-dialog .song-selection-check {
  width: 20px;
}

.add-song-dialog .empty-tip {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.add-song-dialog .dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}

.add-song-dialog .selected-count {
  margin-right: auto;
  color: #666;
  font-size: 14px;
}
</style>
