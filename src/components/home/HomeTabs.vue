<template>
  <div class="tabs">
    <span
      v-for="tab in tabs"
      :key="tab"
      class="tab"
      :class="{ active: tab === '精选' }"
    >
      {{ tab }}
    </span>
  </div>
</template>

<script setup>
const tabs = ['精选', '有声电台', '排行', '歌手', '分类歌单', '数字专辑']
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tab {
  cursor: pointer;
  color: #666;
}

.active {
  color: #1abc9c;
  border-bottom: 2px solid #1abc9c;
}
</style>
