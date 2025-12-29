<template>
  <div class="empty-state-container">
    <div class="empty-icon">💿</div>
    <div class="empty-text">暂无本地音乐专辑</div>
    <div class="empty-subtitle">请导入本地音乐文件</div>
  </div>
</template>

<script setup>
// EmptyState组件 - 用于显示专辑列表为空时的状态
</script>

<style scoped>
.empty-state-container {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  animation: fadeInEmptyState 1s ease-out;
  background-color: var(--color-background-soft, #fafafa);
  border-radius: 16px;
  border: 2px dashed #e0e0e0;
  margin-top: 20px;
}

@keyframes fadeInEmptyState {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
  animation: floatAnimation 3s ease-in-out infinite;
  transition: transform 0.3s ease;
}

.empty-state-container:hover .empty-icon {
  transform: scale(1.05);
  animation: floatAnimation 2s ease-in-out infinite, recordSpin 8s linear infinite;
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes recordSpin {
  from {
    transform: rotate(0deg) translateY(0);
  }
  to {
    transform: rotate(360deg) translateY(0);
  }
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text, #303133);
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.empty-state-container:hover .empty-text {
  color: #409eff; /* Element Plus primary color */
}

.empty-subtitle {
  font-size: 14px;
  color: #909399; /* Element Plus text placeholder color */
  transition: color 0.3s ease;
}

.empty-state-container:hover .empty-subtitle {
  color: #606266; /* Element Plus text secondary color */
}

/* 响应式调整 */
@media (min-width: 768px) {
  .empty-state-container {
    padding: 80px 30px;
    margin-top: 40px;
  }
  
  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }
  
  .empty-text {
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .empty-subtitle {
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  .empty-state-container {
    padding: 100px 40px;
  }
  
  .empty-icon {
    font-size: 96px;
  }
  
  .empty-text {
    font-size: 20px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .empty-state-container {
    padding: 50px 16px;
    margin-top: 16px;
  }
  
  .empty-icon {
    font-size: 56px;
  }
  
  .empty-state-container:hover .empty-icon {
    transform: none;
    animation: floatAnimation 3s ease-in-out infinite;
  }
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .empty-state-container {
    animation: none;
  }
  
  .empty-icon {
    animation: none;
  }
  
  .empty-state-container:hover .empty-icon {
    animation: none;
    transform: none;
  }
}
</style>