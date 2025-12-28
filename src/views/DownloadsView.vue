<template>
  
  <div class="downloads-view">
    <h2 class="page-title">本地和下载</h2>

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane :label="`下载歌曲${downloadedSongs.length}`" name="downloaded">
        <div class="empty">
          <div class="empty-icon">⬇️</div>
          <div class="empty-title">没有已下载的歌曲</div>
          <el-button class="empty-btn" @click="goMusicHall">去音乐馆逛逛</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`正在下载${downloadingSongs.length}`" name="downloading">
        <div class="empty">
          <div class="empty-icon">⏳</div>
          <div class="empty-title">暂无正在下载</div>
          <el-button class="empty-btn" @click="goMusicHall">去音乐馆逛逛</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref("downloaded");

// 先空数组，后续你做真实下载再填
const downloadedSongs = ref([]);
const downloadingSongs = ref([]);

const goMusicHall = () => {
  router.push("/musicHall"); // 跳转到音乐馆页面
};
</script>

<style scoped>
.downloads-view {
  padding: 16px 20px;
}

.page-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 12px;
}

.empty {
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.empty-icon {
  font-size: 56px;
}

.empty-title {
  font-size: 16px;
  color: #666;
}

.empty-btn {
  margin-top: 6px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
}
</style>
