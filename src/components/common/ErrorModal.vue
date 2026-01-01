<template>
  <transition name="fade">
    <div v-if="visible" class="error-modal-overlay" @click="handleOverlayClick">
      <div class="error-modal" @click.stop>
        <div class="error-modal-header">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#F56C6C" fill-opacity="0.1"/>
              <path d="M12 8V12M12 16H12.01" stroke="#F56C6C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#F56C6C" stroke-width="2"/>
            </svg>
          </div>
          <h2 class="error-title">网络请求失败</h2>
        </div>

        <div class="error-modal-body">
          <div class="error-message">
            <p class="error-main-text">{{ errorMessage || '请求失败，请稍后重试' }}</p>
            <div v-if="errorDetails" class="error-details">
              <div class="error-detail-item" v-for="(value, key) in errorDetails" :key="key">
                <span class="error-detail-label">{{ key }}:</span>
                <span class="error-detail-value">{{ formatErrorValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="error-modal-footer">
          <button class="btn btn-close" @click="handleClose">
            关闭
          </button>
          <button class="btn btn-retry" @click="handleRetry" :disabled="retrying">
            <span v-if="retrying" class="loading-spinner"></span>
            {{ retrying ? '重试中...' : '重试' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  errorDetails: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'retry']);

const retrying = ref(false);

const formatErrorValue = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const handleOverlayClick = () => {
  handleClose();
};

const handleClose = () => {
  emit('close');
};

const handleRetry = async () => {
  if (retrying.value) return;

  retrying.value = true;
  try {
    await emit('retry');
  } finally {
    setTimeout(() => {
      retrying.value = false;
    }, 500);
  }
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.error-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.error-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-modal-header {
  padding: 30px 30px 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.error-modal-body {
  padding: 20px 30px;
  overflow-y: auto;
  flex: 1;
}

.error-message {
  text-align: center;
}

.error-main-text {
  margin: 0 0 15px;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.error-details {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  text-align: left;
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.error-detail-item {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.error-detail-item:last-child {
  margin-bottom: 0;
}

.error-detail-label {
  color: #909399;
  font-weight: 600;
  margin-right: 8px;
}

.error-detail-value {
  color: #606266;
  word-break: break-all;
  font-family: 'Courier New', monospace;
}

.error-modal-footer {
  padding: 20px 30px 30px;
  display: flex;
  gap: 12px;
  justify-content: center;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-close {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-close:hover {
  background: #e4e7ed;
  border-color: #c0c4cc;
}

.btn-retry {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-retry:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.btn-retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .error-modal {
    max-width: 90%;
    margin: 20px;
  }

  .error-modal-header {
    padding: 20px 20px 15px;
  }

  .error-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .error-title {
    font-size: 20px;
  }

  .error-modal-body {
    padding: 15px 20px;
  }

  .error-main-text {
    font-size: 14px;
  }

  .error-modal-footer {
    padding: 15px 20px 20px;
    flex-direction: column;
  }

  .btn {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .error-modal-overlay {
    padding: 10px;
  }

  .error-modal {
    max-width: 100%;
    margin: 0;
    border-radius: 12px;
  }

  .error-modal-header {
    padding: 15px 15px 10px;
  }

  .error-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
  }

  .error-title {
    font-size: 18px;
  }

  .error-modal-body {
    padding: 10px 15px;
  }

  .error-main-text {
    font-size: 13px;
  }

  .error-details {
    padding: 10px;
    font-size: 12px;
  }

  .error-modal-footer {
    padding: 10px 15px 15px;
  }

  .btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
