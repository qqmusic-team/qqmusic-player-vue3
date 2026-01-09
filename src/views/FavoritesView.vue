<template>
  <div class="favorites-view">
    <div class="favorites-header">
      <h1 class="title">我喜欢的音乐</h1>
      <p class="subtitle">收藏你喜欢的歌曲</p>
    </div>
    <div class="favorites-content">
      <div class="placeholder">
        <div class="placeholder-icon">❤️</div>
        <div class="placeholder-text">暂无喜欢的歌曲</div>
        <div class="placeholder-subtitle">去音乐馆发现更多好音乐吧</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "FavoritesView" });
</script>

<style scoped>
.favorites-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.favorites-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.favorites-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.placeholder {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.placeholder-subtitle {
  font-size: 14px;
  color: #999;
}
</style>
