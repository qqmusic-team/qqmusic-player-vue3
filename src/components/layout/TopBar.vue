<template>
  <header class="topbar">


    <div class="spacer"></div>

    <div class="actions" @click="navigateToProfile" :class="{ loading: isNavigating }">
      <svg
        t="1766749986779"
        class="login-icon"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        p-id="5607"
      >
        <path
          d="M725.333333 721.066667l-38.4-38.4H379.733333l-38.4 38.4V768h384v-46.933333z
             m85.333334-38.4v170.666666H256v-170.666666h4.266667l85.333333-85.333334h375.466667l89.6 85.333334z
             m-85.333334-320c0 106.666667-85.333333 192-192 192S341.333333 469.333333 341.333333 362.666667
             426.666667 170.666667 533.333333 170.666667 725.333333 256 725.333333 362.666667z
             m-85.333333 0C640 302.933333 593.066667 256 533.333333 256S426.666667 302.933333 426.666667 362.666667
             s46.933333 106.666667 106.666666 106.666666S640 422.4 640 362.666667z"
          fill="#444444"
          p-id="5608"
        ></path>
      </svg>

      <span>点击登录</span>

      <div v-if="isNavigating" class="loading-indicator"></div>
    </div>

    <div v-if="showError" class="error-toast" :class="{ show: showError }">
      {{ errorMessage }}
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";


const router = useRouter();

const errorMessage = ref("");
const showError = ref(false);
const isNavigating = ref(false);

const displayError = (message, error = null) => {
  errorMessage.value = message;
  showError.value = true;
  if (error) console.error("操作错误详情:", error);
  setTimeout(() => (showError.value = false), 3000);
};

const navigateToProfile = async (event) => {
  if (isNavigating.value) return;

  try {
    isNavigating.value = true;

    // 波纹效果（可选）
    const target = event?.currentTarget;
    if (target) {
      const ripple = document.createElement("span");
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.position = "absolute";
      ripple.style.borderRadius = "50%";
      ripple.style.background = "rgba(255, 255, 255, 0.6)";
      ripple.style.transform = "scale(0)";
      ripple.style.animation = "ripple 0.6s ease-out";
      ripple.style.pointerEvents = "none";

      target.appendChild(ripple);
      setTimeout(() => target.contains(ripple) && target.removeChild(ripple), 600);
    }

    await router.push({ name: "profile" });
  } catch (error) {
    displayError("跳转到个人中心失败", error);
  } finally {
    setTimeout(() => (isNavigating.value = false), 300);
  }
};
</script>

<style scoped>
.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: flex-start;
}

.spacer {
  flex: 1;
}

.actions {
  margin-left: auto; /* ✅ 永远靠右 */
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  overflow: hidden; /* 波纹不外溢 */
}

.actions:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.actions:active {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(0.98);
}
.actions.loading {
  cursor: not-allowed;
  opacity: 0.7;
}

/* ✅ 用 CSS 控制图标，不要 width/height=200 */
.login-icon {
  width: 22px;
  height: 22px;
  flex: none;
}

/* loading */
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

/* ripple */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(3.2);
    opacity: 0;
  }
}

/* 错误提示 */
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

@media (max-width: 768px) {
  .topbar {
    padding: 0 12px;
  }
  .actions {
    padding: 4px 8px;
  }
  .login-icon {
    width: 20px;
    height: 20px;
  }
  .loading-indicator {
    width: 14px;
    height: 14px;
    right: -16px;
  }
}
</style>
