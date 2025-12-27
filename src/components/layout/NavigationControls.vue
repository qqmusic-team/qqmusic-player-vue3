<template>
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
      :class="{ disabled: disabled || backDisabled }"
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
      :class="{ disabled: disabled || forwardDisabled }"
    >
      <path
        d="M128 480h645.6L530.4 237.6 576 192l274.4 274.4L896 512l-45.6 45.6L576 832l-45.6-45.6L773.6 544H128v-64z"
        p-id="4443"
      ></path>
    </svg>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props定义
const props = defineProps({
  /**
   * 是否禁用整个导航控件
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * 是否禁用后退按钮
   */
  backDisabled: {
    type: Boolean,
    default: false
  },
  /**
   * 是否禁用前进按钮
   */
  forwardDisabled: {
    type: Boolean,
    default: false
  },
  /**
   * 按钮尺寸（small、medium、large）
   */
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  /**
   * 按钮主题色
   */
  themeColor: {
    type: String,
    default: '#333'
  },
  /**
   * 悬停时的主题色
   */
  hoverColor: {
    type: String,
    default: '#1890ff'
  }
});

// Emits定义
const emit = defineEmits([
  /**
   * 后退按钮点击事件
   * @param {MouseEvent} event - 鼠标事件对象
   */
  'back',
  /**
   * 前进按钮点击事件
   * @param {MouseEvent} event - 鼠标事件对象
   */
  'forward',
  /**
   * 任何按钮点击事件
   * @param {string} direction - 方向 ('back' 或 'forward')
   * @param {MouseEvent} event - 鼠标事件对象
   */
  'navigate'
]);

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

// 后退按钮点击处理
const handleBackClick = (event) => {
  if (props.disabled || props.backDisabled) return;
  
  // 创建点击波纹效果
  createRipple(event);
  
  // 触发事件
  emit('back', event);
  emit('navigate', 'back', event);
};

// 前进按钮点击处理
const handleForwardClick = (event) => {
  if (props.disabled || props.forwardDisabled) return;
  
  // 创建点击波纹效果
  createRipple(event);
  
  // 触发事件
  emit('forward', event);
  emit('navigate', 'forward', event);
};
</script>

<style scoped>
.navigation-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
}

.icon {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  /* 基础大小，根据size prop会被覆盖 */
  width: 25px;
  height: 25px;
}

/* 尺寸变体 */
.icon.small {
  width: 20px;
  height: 20px;
}

.icon.medium {
  width: 25px;
  height: 25px;
}

.icon.large {
  width: 32px;
  height: 32px;
}

/* 悬停效果增强 */
.icon:hover:not(.disabled) {
  transform: scale(1.1);
  opacity: 0.8;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .navigation-controls {
    gap: 6px;
  }
  
  .icon {
    width: 22px;
    height: 22px;
  }
  
  .icon.small {
    width: 18px;
    height: 18px;
  }
  
  .icon.large {
    width: 28px;
    height: 28px;
  }
}
</style>
