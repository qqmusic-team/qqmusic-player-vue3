<template>
  <div class="home-container">
    <Sidebar />
    <div class="main-content">
      <TopBar />
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </div>
    <PlayerBar />
  </div>
</template>

<script setup>
import Sidebar from "../components/layout/Sidebar.vue";
import TopBar from "../components/layout/TopBar.vue";
import PlayerBar from "../components/layout/PlayerBar.vue";
</script>

<style scoped>
.home-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; /* 为PlayerBar留出空间 */
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
