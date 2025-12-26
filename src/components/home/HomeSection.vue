<template>
  <section class="block">
    <div class="header">
      <h2>{{ title }}</h2>
      <span class="more">></span>
    </div>
    <div class="body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
</style>
