<template>
  <div class="comments-view container">
    <header class="page-header">
      <h2 class="page-title">精选评论《{{ currentSongName }}》（评论歌曲与播放歌曲一致）</h2>
      <el-button
        type="primary"
        :icon="Refresh"
        :loading="cv_isRefreshing"
        @click="cv_handleRefresh"
        data-testid="refresh-btn"
        :disabled="cv_isRefreshing"
      >
        {{ cv_isRefreshing ? '刷新中' : '刷新评论' }}
      </el-button>
    </header>

    <!-- 加载中提示 -->
    <div class="loading-tip" v-if="cv_isRefreshing && !cv_commentList.length">
      正在加载精选评论...
    </div>

    <!-- 空数据提示 -->
    <div class="empty-tip" v-if="!cv_isRefreshing && !cv_commentList.length">
      <p>暂无评论 😟</p>
      <p style="font-size: 12px; color: #999;">提示：请先登录并确保Cookie包含MUSIC_U</p>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list" v-else>
      <div
        class="comment-card"
        v-for="comment in cv_commentList"
        :key="comment.id"
      >
        <!-- 用户照片 -->
        <img
          :src="comment.photo"
          alt="用户照片"
          class="profile-pic"
          loading="lazy"
          @error="handleImgError"
        />
        <div class="comment-content">
          <!-- 用户名 + 评论ID -->
          <div class="user-info">
            <span class="nickname">{{ comment.nickname }}</span>
            <span class="comment-id">ID: {{ comment.id }}</span>
          </div>
          <!-- 评论内容 -->
          <p class="content-text">{{ comment.content }}</p>
          <!-- 点赞数 -->
          <div class="like-count">👍 {{ comment.likedCount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { usePlayerStore } from '@/stores/player';
import http, { getCookie, isCookieExpired } from '@/utils/http';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

// 定义网易云接口返回的原始数据类型
interface NeteaseApiHotComment {
  commentId: number;
  user: {
    nickname: string;
    avatarUrl: string;
  };
  content: string;
  likedCount: number;
}

interface NeteaseApiResponse {
  hotComments: NeteaseApiHotComment[];
  code: number;
}

// 定义前端展示用的评论类型
interface NeteaseRealComment {
  id: string;
  nickname: string;
  photo: string;
  content: string;
  likedCount: number;
}

// 响应式数据
const cv_commentList = ref<NeteaseRealComment[]>([]);
const cv_isRefreshing = ref<boolean>(false);
const userStore = useUserStore();
const playerStore = usePlayerStore();

// 获取当前歌曲名称（直接从playerStore获取）
const currentSongName = computed(() => playerStore.song?.name || '晴天');
const currentSongId = computed(() => playerStore.song?.id?.toString() || '186016'); // 默认歌曲ID

// 图片加载失败兜底
const handleImgError = (e: Event): void => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/109951168843971307.jpg';
};

// 核心：请求网易云真实评论（使用http.ts封装）
const fetchRealComments = async (): Promise<NeteaseRealComment[]> => {
  // 每次调用都获取最新的歌曲ID
  const songId = currentSongId.value;
  // 1. 校验Cookie有效性
  const cookie = getCookie();
  if (!cookie || !cookie.includes('MUSIC_U')) {
    console.warn('⚠️ 无有效Cookie，请先登录');
    userStore.showLogin = true; // 自动打开登录弹窗
    ElMessage.warning('请先登录以获取评论数据');
    return [];
  }

  // 2. 校验Cookie是否即将过期
  if (isCookieExpired()) {
    console.warn('⚠️ Cookie即将过期，请重新登录');
    userStore.showLogin = true;
    ElMessage.warning('登录状态已过期，请重新登录');
    return [];
  }

  try {
    // 3. 调用http.ts的get方法请求热门评论
    // 接口说明：type=0 代表单曲，id=歌曲ID
    const res = await http.get<NeteaseApiResponse>('/comment/hot', {
      type: 0,
      id: songId,
      limit: 20,
      offset: 0
    });

    // 关键修复：添加res空值保护（解决测试中res为undefined的问题）
    if (!res) {
      console.error('❌ 评论请求返回空数据');
      ElMessage.error('服务器未返回数据');
      return [];
    }

    // 4. 校验接口响应状态
    if (res.code !== 200) {
      console.error('❌ 评论请求失败:', res.code);
      ElMessage.error(`评论获取失败，错误码: ${res.code}`);
      return [];
    }

    // 5. 转换为前端展示格式
    if (!res.hotComments || res.hotComments.length === 0) {
      console.warn('⚠️ 未拉取到热门评论');
      return [];
    }

    return res.hotComments.map(item => ({
      id: item.commentId.toString(),
      nickname: item.user.nickname || '匿名用户',
      photo: item.user.avatarUrl || 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/109951168843971307.jpg',
      content: item.content || '无评论内容',
      likedCount: item.likedCount || 0
    }));
  } catch (err) {
    console.error('❌ 请求评论异常:', err);
    ElMessage.error('网络请求失败，请检查网络连接');
    return [];
  }
};

// 刷新评论逻辑
const cv_handleRefresh = async (): Promise<void> => {
  cv_isRefreshing.value = true;
  try {
    const comments = await fetchRealComments(); // 使用当前歌曲ID
    cv_commentList.value = comments;
    if (comments.length > 0) {
      ElMessage.success('评论刷新成功');
    } else {
      ElMessage.info('暂无评论数据');
    }
  } catch (err) {
    console.error('❌ 刷新评论失败:', err);
    cv_commentList.value = [];
    ElMessage.error('评论刷新失败，请稍后重试');
  } finally {
    cv_isRefreshing.value = false;
  }
};



// 监听歌曲变化
watch(
  () => playerStore.song,
  (newSong) => {
    if (newSong && newSong.id && newSong.name) {
      cv_handleRefresh(); // 自动刷新评论
    }
  },
  { deep: true }
);

// 组件挂载时加载评论
onMounted(() => {
  cv_handleRefresh();
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.loading-tip, .empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.comment-card {
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
.profile-pic {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.comment-content {
  flex: 1;
}
.user-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.nickname {
  font-weight: 500;
  color: #333;
}
.comment-id {
  font-size: 12px;
  color: #999;
}
.content-text {
  margin: 0 0 5px 0;
  line-height: 1.5;
  color: #333;
}
.like-count {
  font-size: 12px;
  color: #999;
}
</style>
