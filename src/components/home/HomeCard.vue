<template>
  <div class="card">
    <div class="cover"></div>
    <p class="title">{{ title }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String
})
</script>

<style scoped>
.card {
  cursor: pointer;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-4px);
}

.cover {
  height: 120px;
  background: #ddd;
  border-radius: 10px;
}
</style>
