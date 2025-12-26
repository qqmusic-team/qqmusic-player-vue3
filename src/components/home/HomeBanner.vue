<template>
  <div class="banner-row">
    <div class="banner large">LOST & FOUND</div>
    <div class="banner small">MAMORU MIYANO</div>
  </div>
</template>

<style scoped>
.banner-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.banner {
  height: 160px;
  border-radius: 12px;
  color: #fff;
  padding: 20px;
}

.large {
  background: #111;
}

.small {
  background: #333;
}
</style>
