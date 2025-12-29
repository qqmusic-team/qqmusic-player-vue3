<template>
  <div class="recommend-view">
    <!-- 顶部：Hi + 听歌报告 -->
    <div class="topbar">
      <h2 class="hello">Hi {{ username }} 今天为你推荐</h2>
      <div class="report" @click="goReport">
        查看你的听歌报告 <span class="arrow">›</span>
      </div>
    </div>

    <!-- 顶部横向推荐：左大卡 + 右侧小卡横滑 -->
    <div class="hero-row">
      <!-- 左侧大卡 -->
      <div class="hero-card" @click="playHero">
        <div class="hero-left">
          <div class="hero-title">{{ hero.title }}</div>
          <div class="hero-sub">{{ hero.subtitle }}</div>

          <div class="play-btn">
            <span class="triangle"></span>
          </div>
        </div>

        <div class="hero-right">
          <img class="hero-cover" :src="hero.cover" alt="" />
          <div class="hero-vinyl"></div>
        </div>
      </div>

      <!-- 右侧：横向小卡 -->
      <div class="top-scroll">
        <div
          v-for="item in topCards"
          :key="item.id"
          class="top-card"
          @click="openTopCard(item)"
        >
          <img class="top-img" :src="item.cover" alt="" />
          <div class="top-label">{{ item.label }}</div>

          <!-- 右下角小圆点（装饰，像你图里那样） -->
          <div class="corner-dot" />
        </div>
      </div>
    </div>

    <!-- 分区 1：你的私荐歌单（网格） -->
    <SectionTitle title="你的私荐歌单" />

    <div class="grid">
      <div
        v-for="p in personalPlaylists"
        :key="p.id"
        class="grid-card"
        :class="{ 'enlarged': enlargedCardId === p.id }"
        @click="handleCardClick(p, $event, openPlaylist)"
      >
        <div class="img-wrap">
          <img class="grid-img" :src="p.cover" alt="" />
          <div class="count">{{ p.countText }}</div>
        </div>
        <div class="grid-name">{{ p.name }}</div>
      </div>
    </div>

    <!-- 分区 2：累一天了，听点轻松的（横滑） -->
    <SectionTitle title="累一天了，听点轻松的" icon="🫶" />

    <div class="hscroll">
      <div
        v-for="p in relaxPlaylists"
        :key="p.id"
        class="h-card"
        :class="{ 'enlarged': enlargedCardId === p.id }"
        @click="handleCardClick(p, $event, openPlaylist)"
      >
        <img class="h-img" :src="p.cover" alt="" />
        <div class="h-meta">
          <div class="h-name">{{ p.name }}</div>
          <div class="h-sub">{{ p.desc }}</div>
        </div>
        <div class="h-count">{{ p.countText }}</div>
      </div>
    </div>

    <!-- 分区 3：听「{{ likeKeyword }}」也会喜欢（歌曲列表样式） -->
    <div class="row-head">
      <div class="row-left">
        <div class="row-title">听「{{ likeKeyword }}」也会喜欢</div>
        <div class="play-all" @click="playAllSongs">
          <span class="play-icon"></span>
        </div>
      </div>
    </div>

    <div class="song-list">
      <div
        v-for="s in likeSongs"
        :key="s.id"
        class="song-item"
        @click="playSong(s)"
      >
        <img class="song-cover" :src="s.cover" alt="" />
        <div class="song-info">
          <div class="song-name">
            {{ s.name }}
            <span v-if="s.tag" class="tag">{{ s.tag }}</span>
          </div>
          <div class="song-artist">{{ s.artist }}</div>
        </div>
      </div>
    </div>

    <!-- 分区 4：根据你爱的歌曲推荐（大图横滑） -->
    <SectionTitle title="根据你爱的歌曲推荐" />

    <div class="big-scroll">
      <div
        v-for="p in lovedPlaylists"
        :key="p.id"
        class="big-card"
        @click="openPlaylist(p)"
      >
        <img class="big-img" :src="p.cover" alt="" />
        <div class="big-name">{{ p.name }}</div>
        <div class="big-count">{{ p.countText }}</div>
      </div>
    </div>

    <!-- 分区 5：红心歌曲预定（列表） -->
    <div class="row-head">
      <div class="row-left">
        <div class="row-title">红心歌曲预定</div>
        <div class="play-all" @click="playAllHeart">
          <span class="play-icon"></span>
        </div>
      </div>
    </div>

    <div class="heart-list">
      <div
        v-for="s in heartSongs"
        :key="s.id"
        class="heart-item"
        @click="playSong(s)"
      >
        <img class="heart-cover" :src="s.cover" alt="" />
        <div class="heart-info">
          <div class="heart-name">
            {{ s.name }}
            <span v-if="s.badge" class="badge">{{ s.badge }}</span>
          </div>
          <div class="heart-artist">{{ s.artist }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, h, reactive, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  useBanner,
  usePersonalized,
  usePersonalizedNewSong,
  usePlaylistByCategory,
  useSimilarSongs,
  useSimilarPlaylists
} from '@/utils/api';
import { useNumberFormat } from '@/utils/number';

/**
 * ✅ API 集成：
 * 已将 mock 数据替换为真实的 API 调用
 */

const username = ref("幸运函");
const likeKeyword = ref("身骑白马");

/** 顶部大卡 */
const hero = reactive({
  title: "放松吧",
  subtitle: "尝试来点儿音乐提提神吧～",
  // 修正图片路径，确保初始图片能正确显示
  cover:
    "./src/assets/imgs/1.png",
});

/** 顶部横向小卡 */
const topCards = ref([]);

/** 你的私荐歌单（网格） */
const personalPlaylists = ref([]);

/** 累一天了（横滑） */
const relaxPlaylists = ref([]);

/** 听「xx」也会喜欢（歌曲列表） */
const likeSongs = ref([]);

/** 根据你爱的歌曲推荐（大图横滑） */
const lovedPlaylists = ref([]);

/** 红心歌曲预定（列表） */
const heartSongs = ref([]);

// 加载状态
const loading = reactive({
  banners: false,
  personalized: false,
  newSong: false,
  relax: false,
  similar: false,
  similarPlaylist: false
});

// 歌单卡片点击放大效果
const enlargedCardId = ref(null);

// 处理卡片点击事件
const handleCardClick = (card, e, openFn) => {
  e.stopPropagation();

  // 如果点击的是已经放大的卡片，则先恢复原状
  if (enlargedCardId.value === card.id) {
    enlargedCardId.value = null;
    return;
  }

  // 放大当前点击的卡片
  enlargedCardId.value = card.id;

  // 调用原始的打开歌单函数
  if (openFn) {
    // 使用setTimeout确保放大动画完成后再打开歌单
    setTimeout(() => {
      openFn(card);
      // 打开歌单后恢复卡片大小
      enlargedCardId.value = null;
    }, 300);
  }
};

// 点击页面空白处恢复卡片大小
const handlePageClick = (e) => {
  // 检查点击的目标是否是卡片或其子元素
  const isCardClick = e.target.closest('.grid-card') || e.target.closest('.h-card');
  if (!isCardClick) {
    enlargedCardId.value = null;
  }
};

// 初始化加载数据
onMounted(async () => {
  // 并行加载所有数据
  await Promise.all([
    loadBanners(),
    loadPersonalized(),
    loadNewSongs(),
    loadRelaxPlaylists(),
    loadSimilarData()
  ]);

  // 添加页面点击事件监听
  document.addEventListener('click', handlePageClick);
});

// 组件卸载前移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handlePageClick);
});

// 获取轮播图（顶部大卡）
const loadBanners = async () => {
  loading.banners = true;
  try {
    const banners = await useBanner();
    if (banners && banners.length > 0) {
      hero.title = banners[0].typeTitle || "放松吧";
      hero.subtitle = banners[0].note || "尝试来点儿音乐提提神吧～";
      // 确保imageUrl存在且有效，否则保持原有封面
      if (banners[0].imageUrl) {
        hero.cover = banners[0].imageUrl;
      }
    }
  } catch (err) {
    ElMessage.error('加载轮播图失败，使用默认图片');
    console.error('加载轮播图失败:', err);
    // 出错时保持原有封面图片
  } finally {
    loading.banners = false;
  }
};

// 获取推荐歌单
const loadPersonalized = async () => {
  loading.personalized = true;
  try {
    const data = await usePersonalized();
    if (data && data.length > 0) {
      personalPlaylists.value = data.slice(0, 6).map(item => ({
        id: item.id,
        name: item.name,
        cover: item.picUrl,
        countText: useNumberFormat(item.playCount)
      }));

      // 顶部横向小卡使用前4个推荐歌单
      topCards.value = data.slice(0, 4).map(item => ({
        id: item.id,
        cover: item.picUrl,
        label: item.name
      }));
    }
  } catch (err) {
    ElMessage.error('加载推荐歌单失败');
    console.error('加载推荐歌单失败:', err);
  } finally {
    loading.personalized = false;
  }
};

// 获取推荐歌曲
const loadNewSongs = async () => {
  loading.newSong = true;
  try {
    const data = await usePersonalizedNewSong();
    if (data && data.length > 0) {
      heartSongs.value = data.slice(0, 10).map(item => ({
        id: item.id,
        name: item.name,
        artist: item.song?.artists?.map(ar => ar.name).join(',') || '未知歌手',
        cover: item.picUrl,
        album: item.song?.album?.name || '未知专辑'
      }));
    }
  } catch (err) {
    ElMessage.error('加载推荐歌曲失败');
    console.error('加载推荐歌曲失败:', err);
  } finally {
    loading.newSong = false;
  }
};

// 获取轻松歌单
const loadRelaxPlaylists = async () => {
  loading.relax = true;
  try {
    const data = await usePlaylistByCategory('轻松', 6);
    if (data && data.length > 0) {
      relaxPlaylists.value = data.map(item => ({
        id: item.id,
        name: item.name,
        cover: item.coverImgUrl,
        countText: useNumberFormat(item.playCount),
        desc: item.description
      }));
    }
  } catch (err) {
    ElMessage.error('加载轻松歌单失败');
    console.error('加载轻松歌单失败:', err);
  } finally {
    loading.relax = false;
  }
};

// 获取相似数据（歌曲和歌单）
const loadSimilarData = async () => {
  // 这里使用默认歌曲ID，实际应用中可以从用户的播放历史或喜欢的歌曲中获取
  const defaultSongId = 123456; // 示例歌曲ID

  // 并行加载相似歌曲和相似歌单
  await Promise.all([
    loadSimilarSongs(defaultSongId),
    loadSimilarPlaylists(defaultSongId)
  ]);
};

// 获取相似歌曲
const loadSimilarSongs = async (songId) => {
  loading.similar = true;
  try {
    const data = await useSimilarSongs(songId, 5);
    if (data && data.length > 0) {
      likeSongs.value = data.map(item => ({
        id: item.id,
        name: item.name,
        artist: item.artists?.map(ar => ar.name).join(',') || '未知歌手',
        cover: item.album?.picUrl || '',
        tag: item.hMusic ? 'SQ' : ''
      }));
    }
  } catch (err) {
    // 相似歌曲加载失败不显示错误信息，避免影响用户体验
    console.error('加载相似歌曲失败:', err);
  } finally {
    loading.similar = false;
  }
};

// 获取相似歌单
const loadSimilarPlaylists = async (songId) => {
  loading.similarPlaylist = true;
  try {
    const data = await useSimilarPlaylists(songId, 4);
    if (data && data.length > 0) {
      lovedPlaylists.value = data.map(item => ({
        id: item.id,
        name: item.name,
        cover: item.coverImgUrl,
        countText: useNumberFormat(item.playCount)
      }));
    }
  } catch (err) {
    // 相似歌单加载失败不显示错误信息，避免影响用户体验
    console.error('加载相似歌单失败:', err);
  } finally {
    loading.similarPlaylist = false;
  }
};

/** 路由跳转 */
const router = useRouter();

/** 打开歌单详情 */
const openPlaylist = (p) => {
  console.log('openPlaylist called with:', p);
  if (p && p.id) {
    console.log('Navigating to playlistDetail with id:', p.id);
    router.push({ name: 'playlistDetail', params: { id: p.id } });
  } else {
    console.error('Invalid playlist data:', p);
    ElMessage.warning('歌单信息不完整，无法打开');
  }
};

/** 组件：分区标题 */
const SectionTitle = defineComponent({
  props: { title: String, icon: String },
  setup(props) {
    return () =>
      h("div", { class: "section-title" }, [
        h("div", { class: "st-left" }, [
          props.icon ? h("span", { class: "st-icon" }, props.icon) : null,
          h("div", { class: "st-text" }, props.title),
        ]),
      ]);
  },
});

/** 交互功能实现 */
const goReport = () => {
  console.log("去听歌报告");
  ElMessage.info('听歌报告功能正在开发中');
};

const playHero = () => {
  console.log("播放 hero");
  ElMessage.success('开始播放推荐歌曲');
  // 这里可以调用播放器 store 的播放功能
};

const openTopCard = (item) => {
  console.log("打开 top card", item);
  if (item && item.id) {
    // 和打开歌单的逻辑一样，跳转到歌单详情页
    router.push({ name: 'playlistDetail', params: { id: item.id } });
  } else {
    ElMessage.warning('歌单信息不完整');
  }
};

const playSong = (s) => {
  console.log("播放歌曲", s);
  ElMessage.success(`开始播放《${s.name}》`);
  // 这里可以调用播放器 store 的播放功能
};

const playAllSongs = () => {
  console.log("播放该分区全部歌曲");
  ElMessage.success('开始播放全部推荐歌曲');
  // 这里可以调用播放器 store 的播放全部功能
};

const playAllHeart = () => {
  console.log("播放红心分区全部");
  ElMessage.success('开始播放全部红心歌曲');
  // 这里可以调用播放器 store 的播放全部功能
};


</script>

<style scoped>
.recommend-view {
  padding: 18px 20px 28px;
}

/* 顶部 */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.hello {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}
.report {
  font-size: 14px;
  color: #8b8b8b;
  cursor: pointer;
  user-select: none;
}
.report:hover {
  color: #555;
}
.arrow {
  margin-left: 4px;
}

/* 顶部区域：左大卡 + 右横滑 */
.hero-row {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 18px;
  align-items: stretch;
  margin-bottom: 18px;
}
@media (max-width: 1100px) {
  .hero-row {
    grid-template-columns: 1fr;
  }
}

/* hero 大卡 */
.hero-card {
  height: 156px;
  background: linear-gradient(90deg, #cfe0ff, #dbeafe);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  background: linear-gradient(90deg, #bfdbfe, #dbeafe);
}
.hero-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hero-title {
  font-size: 28px;
  font-weight: 900;
  color: #111;
}
.hero-sub {
  font-size: 14px;
  color: #222;
  opacity: 0.8;
}
.play-btn {
  width: 42px;
  height: 42px;
  background: #22c55e;
  border-radius: 999px;
  display: grid;
  place-items: center;
}
.triangle {
  width: 0;
  height: 0;
  border-left: 12px solid #0b0b0b;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  margin-left: 2px;
}
.hero-right {
  width: 120px;
  height: 120px;
  position: relative;
}
.hero-cover {
  width: 92px;
  height: 92px;
  border-radius: 8px;
  object-fit: cover;
  position: absolute;
  right: 12px;
  top: 14px;
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.hero-vinyl {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, #111 0 18%, #2a2a2a 19% 60%, #111 61% 100%);
  position: absolute;
  right: -8px;
  top: 10px;
  z-index: 1;
  opacity: 0.9;
}

/* 顶部横向小卡 */
.top-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.top-scroll::-webkit-scrollbar {
  height: 6px;
}
.top-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.top-card {
  flex: 0 0 auto;
  width: 220px;
  height: 156px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #f3f4f6;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.top-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.top-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.top-label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
.corner-dot {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f97316;
  opacity: 0.95;
}

/* 分区标题 */
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 12px;
}
.st-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.st-icon {
  font-size: 18px;
}
.st-text {
  font-size: 18px;
  font-weight: 900;
  color: #111;
}

/* 网格歌单 */
.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
}
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.grid-card {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, z-index 0.3s ease;
    z-index: 1;
  }

  .grid-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .grid-card.enlarged {
    transform: scale(1.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 100;
    position: relative;
  }
.img-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
}
.grid-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}
.count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
}
.grid-name {
  margin-top: 8px;
  font-size: 13px;
  color: #111;
  line-height: 1.25;
  max-height: 34px;
  overflow: hidden;
}

/* 横滑卡片（累一天了） */
.hscroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.hscroll::-webkit-scrollbar {
  height: 6px;
}
.hscroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.h-card {
    flex: 0 0 auto;
    width: 360px;
    border-radius: 12px;
    overflow: hidden;
    background: #f7f7f7;
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 12px;
    cursor: pointer;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease, z-index 0.3s ease;
    z-index: 1;
  }

  .h-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    background: #f1f1f1;
  }

  .h-card.enlarged {
    transform: scale(1.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 100;
    position: relative;
  }
.h-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
}
.h-meta {
  padding: 12px 10px 12px 0;
  min-width: 0;
}
.h-name {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 8px;
  border-radius: 999px;
}

/* 行标题（带播放按钮那种） */
.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 12px;
}
.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.row-title {
  font-size: 18px;
  font-weight: 900;
  color: #111;
}
.play-all {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #f3f4f6;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.play-icon {
  width: 0;
  height: 0;
  border-left: 10px solid #111;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  margin-left: 2px;
}

/* 歌曲列表（小图 + 两行） */
.song-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 18px;
}
@media (max-width: 1100px) {
  .song-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .song-list {
    grid-template-columns: 1fr;
  }
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f1f1;
  cursor: pointer;
}
.song-item:hover {
  background: #fafafa;
}
.song-cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}
.song-info {
  min-width: 0;
}
.song-name {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.song-artist {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag {
  margin-left: 8px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #fff7ed;
  color: #f59e0b;
  font-weight: 800;
  border: 1px solid #fde68a;
}

/* 大图横滑（根据你爱的歌曲推荐） */
.big-scroll {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.big-scroll::-webkit-scrollbar {
  height: 6px;
}
.big-scroll::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.big-card {
  flex: 0 0 auto;
  width: 220px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.big-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.big-card:hover .big-img {
  transform: scale(1.05);
}

.big-img {
  width: 220px;
  height: 220px;
  border-radius: 14px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.big-img {
  width: 220px;
  height: 220px;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}
.big-name {
  margin-top: 10px;
  font-size: 13px;
  color: #111;
  line-height: 1.25;
  max-height: 34px;
  overflow: hidden;
}
.big-count {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

/* 红心歌曲列表 */
.heart-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 18px;
}
@media (max-width: 1100px) {
  .heart-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .heart-list {
    grid-template-columns: 1fr;
  }
}

.heart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f1f1f1;
  cursor: pointer;
}
.heart-item:hover {
  background: #fafafa;
}
.heart-cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}
.heart-info {
  min-width: 0;
}
.heart-name {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.heart-artist {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge {
  margin-left: 8px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #fff7ed;
  color: #f59e0b;
  font-weight: 800;
  border: 1px solid #fde68a;
}
</style>

