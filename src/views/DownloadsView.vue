<template>
  <div class="downloads-view">
    <div class="profile-nav">
      <NavigationControls
        @back="handleBack"
        @forward="handleForward"
      />
    </div>
    <h2 class="page-title">本地和下载</h2>

    <el-tabs v-model="activeTab">
      <!-- 已下载 -->
      <el-tab-pane :label="`下载歌曲(${downloadedSongs.length})`" name="downloaded">
        <div class="list">
          <div
            v-for="song in downloadedSongs"
            :key="song.id"
            class="download-row"
          >
            <!-- 和 profile 页面完全一样的结构 -->
            <div class="song-cell">
              <img
                class="cover"
                :src="song.cover || defaultCover"
                alt=""
              />
              <div class="meta2">
                <div class="title">
                  {{ song.name }}
                </div>
                <div class="sub">
                  {{ song.artist }} · {{ song.time }}
                </div>
              </div>
            </div>

            <div class="row-actions">
              <el-button text size="small" @click="play(song)">
                播放
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 正在下载（做样子，默认空） -->
      <el-tab-pane :label="`正在下载(0)`" name="downloading">
        <div class="empty">
          <div class="empty-title">暂无正在下载</div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import NavigationControls from "@/components/layout/NavigationControls.vue";
/* tab */
const activeTab = ref("downloaded");
const router = useRouter();

const handleBack = () => {
  router.replace({ name: "recommend" }); // 或 router.replace("/recommend")
};
const handleForward = () => router.forward();
/* 默认封面（备用） */

const downloadedSongs = ref([
  {
    id: "d1",
    name: "晴天",
    artist: "周杰伦",
    cover:
      "././src/assets/imgs/sun-day.jpg",
    time: "2024-05-01 14:32",
  },
  {
    id: "d2",
    name: "稻香",
    artist: "周杰伦",
    cover:
      "././src/assets/imgs/daoxiang.jpg",
    time: "2024-05-02 09:18",
  },
  {
    id: "d3",
    name: "夜曲",
    artist: "周杰伦",
    cover:
      "https://p1.music.126.net/4JHj9s8pHq2n9nXv2c7p7Q==/109951165779738588.jpg",
    time: "2024-05-03 21:46",
  },
  {
    id: "d4",
    name: "起风了",
    artist: "吴青峰",
    cover:
      "https://p1.music.126.net/2Q4R8vY5j8RZx4sGv0c7AQ==/109951164197113290.jpg",
    time: "2024-05-05 10:11",
  },
]);

/* 模拟播放 */
function play(song) {
  alert("播放：" + song.name);
}
</script>

<style scoped>
.downloads-view {
  padding: 16px 20px;
}

.profile-nav {
  margin-bottom: 10px;
  margin-top: -10px;
}

.page-title {
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 12px;
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
}

/* 单行（和 profile 表格一行一样） */
.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 6px;
  border-radius: 6px;
}

.download-row:hover {
  background: #f9fafb;
}

/* song-cell：完全复用你 profile 页 */
.song-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  background: #eee;
}

.meta2 {
  min-width: 0;
  flex: 1;
}

.title {
  font-weight: 700;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* hover 操作区（和 profile 一样） */
.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.download-row:hover .row-actions {
  opacity: 1;
}

/* 空状态 */
.empty {
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-icon {
  font-size: 56px;
}

.empty-title {
  font-size: 16px;
  color: #666;
}

:deep(.el-tabs__item) {
  font-size: 16px;
}
</style>
