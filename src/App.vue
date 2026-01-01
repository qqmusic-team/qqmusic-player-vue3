<script setup>
  import { ref } from 'vue';
  import HomeView from './views/HomeView.vue';
  import ErrorModal from './components/common/ErrorModal.vue';

  const errorModalVisible = ref(false);
  const errorMessage = ref('');
  const errorDetails = ref(null);
  const retryCallback = ref(null);

  const showError = (message, details = null, retry = null) => {
    errorMessage.value = message;
    errorDetails.value = details;
    retryCallback.value = retry;
    errorModalVisible.value = true;
  };

  const handleCloseErrorModal = () => {
    errorModalVisible.value = false;
    errorMessage.value = '';
    errorDetails.value = null;
    retryCallback.value = null;
  };

  const handleRetryError = async () => {
    if (retryCallback.value) {
      try {
        await retryCallback.value();
        handleCloseErrorModal();
      } catch (error) {
        console.error('重试失败:', error);
      }
    }
  };

  window.showErrorModal = showError;
</script>

<template>
  <HomeView />
  <ErrorModal
    :visible="errorModalVisible"
    :error-message="errorMessage"
    :error-details="errorDetails"
    @close="handleCloseErrorModal"
    @retry="handleRetryError"
  />
</template>

<style>
/* 全局样式重置 */
</style>
