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
        @click="openPlaylist(p)"
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
        @click="openPlaylist(p)"
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
import { defineComponent, h, reactive, ref } from "vue";

/**
 * ✅ 后期接 API：
 * 你只需要把下面这些 mock 数组替换成接口返回的数据即可
 * 比如 onMounted(async()=> { personalPlaylists.value = await api... })
 */

const username = ref("幸运函");
const likeKeyword = ref("身骑白马");

/** 顶部大卡 */
const hero = reactive({
  title: "放松吧",
  subtitle: "尝试来点儿音乐提提神吧～",
  // 你也可以换成本地图片 import 的方式
  cover:
    "https://p1.music.126.net/4JHj9s8pHq2n9nXv2c7p7Q==/109951165779738588.jpg",
});

/** 顶部横向小卡 */
const topCards = ref([
  {
    id: "t1",
    cover: "https://p1.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg",
    label: "Daily 30",
  },
  {
    id: "t2",
    cover: "https://p2.music.126.net/U7c0E3r3oH6jA9xk5mJb7A==/109951167455620024.jpg",
    label: "雷达模式",
  },
  {
    id: "t3",
    cover: "https://p2.music.126.net/8Br7bCkYj3uZ0l3g8j2o0Q==/109951165776399725.jpg",
    label: "杜比专区",
  },
  {
    id: "t4",
    cover: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=700&q=60",
    label: "Favorites",
  },
]);

/** 你的私荐歌单（网格） */
const personalPlaylists = ref([
  {
    id: "p1",
    name: "「独享时光」独处是一个人的清欢",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=60",
    countText: "1.8亿",
  },
  {
    id: "p2",
    name: "短视频纯音乐｜抄作业/中勿扰",
    cover: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=900&q=60",
    countText: "54.7万",
  },
  {
    id: "p3",
    name: "卷王必备：无痛学习bgm",
    cover: "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=900&q=60",
    countText: "152.0万",
  },
  {
    id: "p4",
    name: "一起刷题 加油",
    cover: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=900&q=60",
    countText: "530.9万",
  },
  {
    id: "p5",
    name: "看书+学习｜帮你静心的纯音乐",
    cover: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=900&q=60",
    countText: "923.6万",
  },
  {
    id: "p6",
    name: "热歌精选：共享宅家欢乐时光",
    cover: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=60",
    countText: "9.5亿",
  },
]);

/** 累一天了（横滑） */
const relaxPlaylists = ref([
  {
    id: "r1",
    name: "静心纯音乐｜专注于内心安宁世界",
    desc: "适合放空/助眠/学习",
    cover: "https://images.unsplash.com/photo-1520975682072-9a9f0a62c87d?auto=format&fit=crop&w=900&q=60",
    countText: "2189.0万",
  },
  {
    id: "r2",
    name: "Piano Opus - Solo Piano",
    desc: "钢琴｜轻音乐",
    cover: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=60",
    countText: "2.0万",
  },
  {
    id: "r3",
    name: "大案纪实｜真实案件（永久免费）",
    desc: "故事/播客/电台",
    cover: "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=900&q=60",
    countText: "246.8万",
  },
  {
    id: "r4",
    name: "5分钟心理学",
    desc: "私人心灵救援队",
    cover: "https://images.unsplash.com/photo-1520975682072-9a9f0a62c87d?auto=format&fit=crop&w=900&q=60",
    countText: "1288.8万",
  },
]);

/** 听「xx」也会喜欢（歌曲列表） */
const likeSongs = ref([
  {
    id: "s1",
    name: "清透",
    artist: "陈粒",
    cover: "https://p2.music.126.net/R0yq2oZg1Hj2Bqj7y5cZ7g==/109951166855567245.jpg",
    tag: "SQ",
  },
  {
    id: "s2",
    name: "小孩",
    artist: "罗森涛",
    cover: "https://p1.music.126.net/3jmxqXo0rV8xTqg9nT8r-w==/109951167037250140.jpg",
    tag: "独家",
  },
  {
    id: "s3",
    name: "爱情讯息",
    artist: "洪一诺",
    cover: "https://p1.music.126.net/6o6g0v9rSx2pC2Z3S9m5Zw==/109951165659290934.jpg",
    tag: "",
  },
  {
    id: "s4",
    name: "最初的记忆",
    artist: "云汐",
    cover: "https://p2.music.126.net/9x2wT8Jxw3XkqYw8Ck1b9w==/109951164197113290.jpg",
    tag: "MV",
  },
  {
    id: "s5",
    name: "戒不掉",
    artist: "田馥甄",
    cover: "https://p1.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg",
    tag: "",
  },
]);

/** 根据你爱的歌曲推荐（大图横滑） */
const lovedPlaylists = ref([
  {
    id: "l1",
    name: "嘿 Siri，放点时下最火的歌曲",
    cover: "https://images.unsplash.com/photo-1542728929-8a2b4f9b4b36?auto=format&fit=crop&w=1100&q=60",
    countText: "1.4亿",
  },
  {
    id: "l2",
    name: "抖音流行热歌：大街小巷都在听",
    cover: "https://images.unsplash.com/photo-1520975693411-4c65e3c9cd7b?auto=format&fit=crop&w=1100&q=60",
    countText: "4969.2万",
  },
  {
    id: "l3",
    name: "古风戏腔：戏里戏外无人说",
    cover: "https://images.unsplash.com/photo-1520975958225-45c113f2f8cc?auto=format&fit=crop&w=1100&q=60",
    countText: "1.1亿",
  },
  {
    id: "l4",
    name: "一曲惊鸿梦：古风醉人间",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1100&q=60",
    countText: "1910.6万",
  },
]);

/** 红心歌曲预定（列表） */
const heartSongs = ref([
  {
    id: "h1",
    name: "Time is broken",
    artist: "Huuui",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=60",
    badge: "臻品母带",
  },
  {
    id: "h2",
    name: "Chance",
    artist: "Aspyer / Kyle Reynolds / Carly Jay",
    cover: "https://images.unsplash.com/photo-1520975693411-4c65e3c9cd7b?auto=format&fit=crop&w=300&q=60",
    badge: "臻品母带",
  },
  {
    id: "h3",
    name: "Take me hand（治愈版）",
    artist: "Leon不太冷的邓王鑫",
    cover: "https://images.unsplash.com/photo-1520975682072-9a9f0a62c87d?auto=format&fit=crop&w=300&q=60",
    badge: "全景声",
  },
]);

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

/** 交互（先简单打印，后期接你的播放器 store / api） */
const goReport = () => console.log("去听歌报告");
const playHero = () => console.log("播放 hero");
const openTopCard = (item) => console.log("打开 top card", item);
const openPlaylist = (p) => console.log("打开歌单", p);

const playSong = (s) => console.log("播放歌曲", s);
const playAllSongs = () => console.log("播放该分区全部歌曲");
const playAllHeart = () => console.log("播放红心分区全部");
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

/* 红心歌曲预定 */
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
