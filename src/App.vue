<script setup>
import { ref, onMounted} from "vue";
import HomeView from "./views/HomeView.vue";

import LoginView from "./views/LoginView.vue";
import { useUserStore } from "./stores/user";

const errorModalVisible = ref(false);
const errorMessage = ref("");
const errorDetails = ref(null);
const statusCode = ref(null);
const retryCallback = ref(null);

const showError = (message, details = null, retry = null, code = null) => {
  errorMessage.value = message;
  errorDetails.value = details;
  statusCode.value = code;
  retryCallback.value = retry;
  errorModalVisible.value = true;
};




window.showErrorModal = showError;

// 初始化用户状态
const userStore = useUserStore();
onMounted(() => {
  // 检查是否有保存的Cookie并初始化登录状态
  userStore.initUserStatus();
});

</script>

<template>
  <HomeView />


  <LoginView />
</template>

<style>
/* 全局样式重置 */
</style>
