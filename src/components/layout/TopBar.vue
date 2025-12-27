<template>
  <header class="topbar">
    <div class="navigation-controls">
      <svg
        id="back-button"
        t="1766749559081"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4292"
        width="200"
        height="200"
        @click="handleBackClick"
        :class="{ disabled: true }"
      >
        <path
          d="M896 544H250.4l242.4 242.4L448 832 173.6 557.6 128 512l45.6-45.6L448 192l45.6 45.6L250.4 480H896v64z"
          p-id="4293"
        ></path>
      </svg>
      <svg
        id="forward-button"
        t="1766749625777"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4442"
        width="200"
        height="200"
        @click="handleForwardClick"
        :class="{ disabled: true }"
      >
        <path
          d="M128 480h645.6L530.4 237.6 576 192l274.4 274.4L896 512l-45.6 45.6L576 832l-45.6-45.6L773.6 544H128v-64z"
          p-id="4443"
        ></path>
      </svg>
    </div>
    <div class="actions" @click="navigateToProfile">
      <svg
        t="1766749986779"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="5607"
        width="200"
        height="200"
        :class="{ animate: isLoggingIn }"
      >
        <path
          d="M725.333333 721.066667l-38.4-38.4H379.733333l-38.4 38.4V768h384v-46.933333z m85.333334-38.4v170.666666H256v-170.666666h4.266667l85.333333-85.333334h375.466667l89.6 85.333334z m-85.333334-320c0 106.666667-85.333333 192-192 192S341.333333 469.333333 341.333333 362.666667 426.666667 170.666667 533.333333 170.666667 725.333333 256 725.333333 362.666667z m-85.333333 0C640 302.933333 593.066667 256 533.333333 256S426.666667 302.933333 426.666667 362.666667s46.933333 106.666667 106.666666 106.666666S640 422.4 640 362.666667z"
          fill="#444444"
          p-id="5608"
        ></path></svg
      >点击登录
      <!-- 加载指示器 -->
      <div v-if="isLoggingIn" class="loading-indicator"></div>
    </div>

    <!-- 错误提示组件 -->
    <div v-if="showError" class="error-toast" :class="{ show: showError }">
      {{ errorMessage }}
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 错误提示相关状态
const errorMessage = ref("");
const showError = ref(false);

// 显示错误信息
const displayError = (message, error = null) => {
  errorMessage.value = message;
  showError.value = true;

  // 记录详细错误到控制台
  if (error) {
    console.error("操作错误详情:", error);
  }

  // 3秒后自动隐藏错误提示
  setTimeout(() => {
    showError.value = false;
  }, 3000);
};

// 创建点击波纹效果
const createRipple = (event) => {
  const target = event.currentTarget;
  if (!target) return;

  // 创建波纹元素
  const ripple = document.createElement("span");
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  // 设置波纹样式
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.position = "absolute";
  ripple.style.borderRadius = "50%";
  ripple.style.background = "rgba(255, 255, 255, 0.6)";
  ripple.style.transform = "scale(0)";
  ripple.style.animation = "ripple 0.6s ease-out";
  ripple.style.pointerEvents = "none";

  // 添加波纹并在动画结束后移除
  target.appendChild(ripple);
  setTimeout(() => {
    if (target.contains(ripple)) {
      target.removeChild(ripple);
    }
  }, 600);

  // 添加点击动画类
  target.classList.add("animate");
  setTimeout(() => {
    target.classList.remove("animate");
  }, 300);
};

// 后退按钮点击处理 - 只保留视觉反馈
const handleBackClick = (event) => {
  // 创建点击波纹效果
  createRipple(event);
  console.log("后退按钮点击 - 功能开发中");
};

// 前进按钮点击处理 - 只保留视觉反馈
const handleForwardClick = (event) => {
  // 创建点击波纹效果
  createRipple(event);
  console.log("前进按钮点击 - 功能开发中");
};

// 登录状态管理
const isLoggingIn = ref(false);

// 跳转到个人中心
const navigateToProfile = async (event) => {
  if (isLoggingIn.value) return;

  try {
    isLoggingIn.value = true;

    // 创建点击波纹效果
    if (event) createRipple(event);

    // 模拟登录过程（实际应用中可能需要调用登录API）
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 暂时禁用路由跳转，只保留视觉反馈
    console.log("进入个人中心 - 功能开发中");
  } catch (error) {
    displayError("操作失败", error);
  } finally {
    // 无论成功失败，都要重置登录状态
    setTimeout(() => {
      isLoggingIn.value = false;
    }, 300);
  }
};

onMounted(() => {
  console.log("TopBar 组件已挂载");
});

onUnmounted(() => {
  console.log("TopBar 组件已卸载");
});
</script>

<style scoped>
.icon {
  width: 25px;
  height: 25px;
  margin-bottom: 4px;
  vertical-align: middle;
  margin-right: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  fill: #333;
  position: relative;
  overflow: hidden;
}

/* 悬停效果增强 */
.icon:hover:not(.disabled) {
  transform: scale(1.1);
  opacity: 0.8;
  fill: #1890ff; /* 悬停时变为主题色 */
}

/* 点击反馈效果 */
.icon:active:not(.disabled) {
  transform: scale(0.95);
  transition: all 0.1s ease;
}

/* 禁用状态样式 */
.icon.disabled {
  cursor: not-allowed;
  opacity: 0.4;
  fill: #999;
}

/* 添加点击波纹效果容器 */
#back-button,
#forward-button {
  position: relative;
  overflow: visible;
}

/* 点击波纹动画 */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* 激活状态动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.icon.animate {
  animation: pulse 0.3s ease;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  transition: background-color 0.3s ease;
}

.navigation-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
}

.search {
  width: 320px;
  background: #f2f2f2;
  border-radius: 18px;
  padding: 6px 12px;
  transition: all 0.3s ease;
}

.search input {
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .icon {
    width: 22px;
    height: 22px;
  }

  .topbar {
    padding: 0 12px;
  }
}

/* 错误提示样式 */
.error-toast {
  position: fixed;
  top: 70px;
  right: 20px;
  background-color: #ff4d4f;
  color: white;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 1000;
  max-width: 300px;
}

.error-toast.show {
  opacity: 1;
  transform: translateY(0);
}

/* 增加动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.error-toast {
  animation: slideOut 0.3s ease forwards;
}

.error-toast.show {
  animation: slideIn 0.3s ease forwards;
}

/* actions区域样式 */
.actions {
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.actions:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.actions:active {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(0.98);
}

/* 加载指示器样式 */
.loading-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
}

@keyframes spin {
  0% {
    transform: translateY(-50%) rotate(0deg);
  }
  100% {
    transform: translateY(-50%) rotate(360deg);
  }
}

/* actions响应式调整 */
@media (max-width: 768px) {
  .actions {
    padding: 4px 8px;
  }

  .actions span {
    font-size: 14px;
  }

  .loading-indicator {
    width: 14px;
    height: 14px;
    right: -16px;
  }
}
</style>
