<template>
  <div class="header-control">
    <div class="search-box" :class="{ 'search-focused': isSearchFocused }">
      <span class="icon search-icon"
        ><svg
          t="1767016151971"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="5139"
          width="200"
          height="200"
        >
          <path
            d="M1004.082586 927.096906L800.240221 723.244546c23.601011-30.58835 43.083591-64.055604 58.207831-99.921944 23.261141-55.338924 35.066645-114.126534 35.066645-174.623493 0-60.506955-11.805504-119.284569-35.066645-174.623493-22.461445-53.399662-54.659183-101.40138-95.673562-142.655669-41.014379-41.254288-88.806177-73.571979-141.965931-96.253341C565.689552 11.915462 507.14185 0 446.864807 0c-60.267047 0-118.824744 11.915462-173.943752 35.406515-53.159754 22.571403-100.941555 54.999053-141.96593 96.253341-41.024375 41.244292-73.222113 89.146048-95.673562 142.655668C12.020422 329.654448 0.224914 388.432062 0.224914 448.939017c0 60.496959 11.795508 119.274573 35.066645 174.623493 22.461445 53.399662 54.659183 101.411377 95.673562 142.655669 41.024375 41.254288 88.806177 73.561983 141.965931 96.253341 55.119007 23.491053 113.676705 35.296557 173.943752 35.296557 60.277043 0 118.824744-11.915462 173.943751-35.296557 36.326165-15.474107 70.123293-35.406515 100.951552-59.587306l203.492498 203.502494c21.66175 21.66175 57.178223 21.66175 78.949931 0 21.641758-22.121575 21.641758-57.638048-0.12995-79.289802zM446.864807 805.973038c-195.825418 0-355.204717-160.188991-355.204717-357.153975 0-196.964984 159.269341-357.153975 355.204717-357.153975 195.825418 0 355.204717 160.188991 355.204717 357.153975 0.009996 196.964984-159.379299 357.153975-355.204717 357.153975z m0 0"
            p-id="5140"
          ></path></svg
      ></span>
      <input
        :value="searchQuery"
        @input="handleSearchInput"
        @focus="handleFocus"
        @blur="handleBlur"
        placeholder="搜索本地歌曲..."
        class="search-input"
      />
      <span
        v-if="searchQuery"
        class="icon clear-icon"
        @click="clearSearch"
        :class="{ pulse: isSearchFocused }"
        >✕</span
      >
    </div>

    <div class="actions">
      <select :value="sortBy" @change="handleSortChange" class="sort-select">
        <option value="name">歌名A-Z</option>
        <option value="artist">歌手A-Z</option>
        <option value="duration">时长(短-长)</option>
      </select>

      <button
        class="btn-icon sort-btn"
        @click="toggleSortDirection"
        :class="{ active: sortDirection === 'desc' }"
      >
        {{ sortDirection === "asc" ? "↑" : "↓" }}
      </button>

      <button class="btn-primary import-btn" @click="handleImport" :disabled="isImporting">
        <span v-if="isImporting" class="loading-wrapper">
          <span class="loading-spinner"></span>
          <span class="loading-dots">
            <span :class="{ active: isDotActive(0) }">•</span>
            <span :class="{ active: isDotActive(1) }">•</span>
            <span :class="{ active: isDotActive(2) }">•</span>
          </span>
        </span>
        {{ isImporting ? "上传中" : "上传文件夹" }}
      </button>

      <button class="btn-secondary upload-btn" @click="handleUpload" :disabled="isImporting">
        <span v-if="isImporting" class="loading-wrapper">
          <span class="loading-spinner"></span>
          <span class="loading-dots">
            <span :class="{ active: isDotActive(0) }">•</span>
            <span :class="{ active: isDotActive(1) }">•</span>
            <span :class="{ active: isDotActive(2) }">•</span>
          </span>
        </span>
        {{ isImporting ? "上传中" : "上传文件" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

// Props
interface Props {
  searchQuery?: string;
  sortBy?: string;
  sortDirection?: string;
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: "",
  sortBy: "name",
  sortDirection: "asc",
});

// Emits
const emit = defineEmits<{
  "update:searchQuery": [value: string];
  "update:sortBy": [value: string];
  "update:sortDirection": [value: string];
  import: [];
  upload: [];
}>();

// Reactive data
const isSearchFocused = ref(false);
const isImporting = ref(false);
const loadingProgress = ref(0);
const loadingPhase = ref(0); // 用于跟踪加载动画的阶段
const dotIndex = ref(0); // 用于加载点动画
let dotInterval: number | null = null;
let progressInterval: number | null = null;

// 计算属性 - 确定哪个加载点应该处于活动状态
const isDotActive = (index: number) => {
  return index === dotIndex.value;
};

// Methods
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:searchQuery", target.value);
};

const clearSearch = () => {
  emit("update:searchQuery", "");
};

const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:sortBy", target.value);
};

const toggleSortDirection = () => {
  emit("update:sortDirection", props.sortDirection === "asc" ? "desc" : "asc");
};

const handleImport = () => {
  isImporting.value = true;
  loadingProgress.value = 0;
  loadingPhase.value = 0;

  startDotAnimation();
  startProgressSimulation();

  emit("import");

  const timer = setTimeout(() => {
    stopDotAnimation();
    stopProgressSimulation();
    isImporting.value = false;
  }, 2000);

  return () => {
    clearTimeout(timer);
    stopDotAnimation();
    stopProgressSimulation();
  };
};

const handleUpload = () => {
  isImporting.value = true;
  loadingProgress.value = 0;
  loadingPhase.value = 0;

  startDotAnimation();
  startProgressSimulation();

  emit("upload");

  const timer = setTimeout(() => {
    stopDotAnimation();
    stopProgressSimulation();
    isImporting.value = false;
  }, 2000);

  return () => {
    clearTimeout(timer);
    stopDotAnimation();
    stopProgressSimulation();
  };
};

// 加载点动画控制
const startDotAnimation = () => {
  if (dotInterval) return;
  dotInterval = window.setInterval(() => {
    dotIndex.value = (dotIndex.value + 1) % 3;
  }, 400);
};

const stopDotAnimation = () => {
  if (dotInterval) {
    clearInterval(dotInterval);
    dotInterval = null;
    dotIndex.value = 0;
  }
};

// 进度模拟
const startProgressSimulation = () => {
  if (progressInterval) return;
  progressInterval = window.setInterval(() => {
    if (loadingProgress.value < 90) {
      loadingProgress.value += Math.random() * 5;

      // 根据进度更新加载阶段
      if (loadingProgress.value > 30) loadingPhase.value = 1;
      if (loadingProgress.value > 60) loadingPhase.value = 2;
    }
  }, 200);
};

const stopProgressSimulation = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
    loadingProgress.value = 0;
    loadingPhase.value = 0;
  }
};

const handleFocus = () => {
  // 添加微小延迟以获得更流畅的动画效果
  setTimeout(() => {
    isSearchFocused.value = true;
  }, 50);
};

const handleBlur = () => {
  // 添加微小延迟以获得更流畅的动画效果
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 100);
};

// 添加错误处理和重试逻辑
const handleImportError = () => {
  console.error("导入音乐文件时发生错误");
  stopDotAnimation();
  stopProgressSimulation();
  isImporting.value = false;

  // 添加错误反馈动画
  showErrorFeedback();
};

// 播放排序变化音效提示（模拟）
const playSortSound = () => {
  // 实际项目中可以使用Web Audio API或AudioContext来播放声音
  // 这里只是演示微交互的思想
  try {
    // 仅作为示例，实际项目中应使用适当的音效文件
    if (typeof window !== "undefined") {
      // 创建一个简单的提示音
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = props.sortDirection === "asc" ? 800 : 600;
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;

      oscillator.start();

      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  } catch (error) {
    // 忽略音频错误，不影响核心功能
    console.log("无法播放音效", error);
  }
};

// 显示成功反馈
const showSuccessFeedback = () => {
  const importBtn = document.querySelector(".import-btn") as HTMLElement;
  if (importBtn) {
    // 添加成功脉冲效果
    importBtn.classList.add("success-pulse");
    setTimeout(() => {
      importBtn.classList.remove("success-pulse");
    }, 1000);
  }
};

// 显示错误反馈
const showErrorFeedback = () => {
  const importBtn = document.querySelector(".import-btn") as HTMLElement;
  if (importBtn) {
    // 添加错误抖动效果
    importBtn.classList.add("error-shake");
    setTimeout(() => {
      importBtn.classList.remove("error-shake");
    }, 600);
  }
};

// 键盘导航优化
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;

  // Escape键清除搜索并失焦
  if (event.key === "Escape" && isSearchFocused.value) {
    clearSearch();
    target.blur();
  }

  // Enter键提交搜索
  if (event.key === "Enter" && isSearchFocused.value) {
    emit("update:searchQuery", target.value);
  }
};

let searchDebounceTimer: number | null = null;

// 清理资源
onUnmounted(() => {
  stopDotAnimation();
  stopProgressSimulation();
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});
</script>

<style scoped>
/* 使用CSS变量确保与主题一致 */
:root {
  --el-color-primary: #1890ff;
  --el-border-color: #dcdfe6;
  --el-border-color-hover: #c0c4cc;
  --el-bg-color: #f5f7fa;
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;
  --el-border-radius-base: 4px;
  --el-box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  --typing-animation: typing 0.3s ease-in-out;
}

/* 响应式设计优化 */
.header-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  transition: var(--transition-fast);
}

/* 搜索框样式 - 优化版本 */
.search-box {
  position: relative;
  width: 240px;
  min-width: 200px;
  background-color: #fff;
  border-radius: 20px;
  border: 1px solid var(--el-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: var(--transition-base);
  overflow: hidden;
  transform-origin: center;
}

.search-box.search-focused {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  transform: translateY(-1px);
  animation: searchFocusPulse 0.4s ease-out;
}

@keyframes searchFocusPulse {
  0% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.02) translateY(-1px);
  }
  100% {
    transform: scale(1) translateY(-1px);
  }
}

.search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  transition: var(--transition-base);
  outline: none;
  background-color: transparent;
  color: var(--el-text-color-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 输入动画效果 */
.search-input.typing {
  animation: typing 0.3s ease-in-out;
}

@keyframes typing {
  0%,
  100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.98);
  }
}

/* 清除动画效果 */
.search-input.clearing {
  animation: clearing 0.15s ease-in-out;
}

@keyframes clearing {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}

.search-box .icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  user-select: none;
}

.search-box .search-icon {
  left: 12px;
  color: var(--el-text-color-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box.search-focused .search-icon {
  color: var(--el-color-primary);
  transform: translateY(-50%) scale(1.1);
  animation: searchIconBounce 0.4s ease-out;
}

@keyframes searchIconBounce {
  0%,
  100% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) scale(1.2);
  }
}

.search-box .clear-icon {
  right: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.6;
}

.search-box .clear-icon:hover {
  opacity: 1;
  background-color: var(--el-bg-color);
  transform: translateY(-50%) scale(1.15);
}

.search-box .clear-icon:active {
  transform: translateY(-50%) scale(0.85);
  transition: transform 0.1s;
}

.search-box .clear-icon.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.2);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

/* 操作按钮区域 */
.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

/* 排序选择器 - Element Plus风格增强版 */
.sort-select {
  padding: 7px 12px;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color);
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-base);
  outline: none;
  color: var(--el-text-color-primary);
  position: relative;
  min-width: 120px;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="%23909399" d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.8 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L859.2 335c11.9-14.2 0.9-35-18.8-35z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sort-select:hover {
  border-color: var(--el-border-color-hover);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.sort-select:focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
  transform: translateY(-1px);
}

.sort-select:active {
  border-color: var(--el-border-color-hover);
  transform: translateY(0);
  transform: scale(0.99);
  transition: transform 0.1s;
}

/* 排序变化动画 */
.actions.sort-animating .sort-select,
.actions.sort-animating .sort-btn {
  animation: sortChange 0.3s ease-out;
}

@keyframes sortChange {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(24, 144, 255, 0.2);
  }
}

/* 排序按钮 - 自定义按钮增强版 */
.btn-icon {
  border: 1px solid var(--el-border-color);
  background: white;
  padding: 7px 12px;
  cursor: pointer;
  border-radius: var(--el-border-radius-base);
  font-size: 16px;
  transition: var(--transition-base);
  outline: none;
  color: var(--el-text-color-primary);
  line-height: 1;
  position: relative;
  min-width: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 使用伪元素创建背景扩散效果，但优化性能 */
.btn-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  will-change: width, height;
}

.btn-icon:hover::before {
  width: 80px;
  height: 80px;
}

.btn-icon:hover {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color-hover);
  transform: translateY(-1px) translateZ(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.btn-icon:active {
  transform: translateY(0) scale(0.95) translateZ(0);
  transition: transform 0.1s;
}

/* 排序按钮优化 */
.btn-icon.sort-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon.sort-btn.active {
  background-color: var(--el-color-primary);
  color: white;
  border-color: var(--el-color-primary);
  transform: translateY(-1px) translateZ(0);
  box-shadow: 0 3px 8px rgba(24, 144, 255, 0.3);
  animation: sortBtnActive 0.3s ease-out;
}

@keyframes sortBtnActive {
  0% {
    transform: scale(1) translateZ(0);
  }
  50% {
    transform: scale(1.1) translateZ(0);
  }
  100% {
    transform: scale(1) translateY(-1px) translateZ(0);
  }
}

/* 优化闪光动画性能 */
.btn-icon.sort-btn::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  will-change: opacity, transform;
}

.btn-icon.sort-btn.active::after {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0;
    transform: translateX(-100%) rotate(45deg) translateZ(0);
  }
  20% {
    opacity: 0.3;
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: translateX(100%) rotate(45deg) translateZ(0);
  }
}

/* 主要按钮样式 - 替代ElementPlus的primary按钮 */
.btn-primary {
  background-color: var(--el-color-primary);
  color: white;
  border: 1px solid var(--el-color-primary);
  padding: 8px 16px;
  border-radius: var(--el-border-radius-base);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-base);
  outline: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(24, 144, 255, 0.3);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  transform: translateZ(0); /* 触发硬件加速 */
  will-change: transform, box-shadow;
}

/* 按钮背景扩散效果 - 性能优化 */
.btn-primary::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  will-change: width, height;
}

.btn-primary:hover::before {
  width: 200px;
  height: 200px;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  transform: translateY(-1px) translateZ(0);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  animation: btnHover 0.3s ease-out;
}

@keyframes btnHover {
  0% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-2px) translateZ(0);
  }
  100% {
    transform: translateY(-1px) translateZ(0);
  }
}

.btn-primary:active {
  background-color: #096dd9;
  border-color: #096dd9;
  transform: translateY(0) scale(0.95) translateZ(0);
  transition: transform 0.1s;
}

.btn-primary:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary:disabled::before {
  display: none;
}

/* 按钮按下状态 */
.btn-primary.pressed {
  transform: scale(0.95) translateZ(0);
  transition: transform 0.1s;
}

/* 优化成功脉冲动画性能 */
.btn-primary.success-pulse {
  animation: successPulse 1s ease-out;
}

@keyframes successPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
    background-color: var(--el-color-primary);
    transform: translateZ(0);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
    background-color: #52c41a;
    transform: translateZ(0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
    background-color: var(--el-color-primary);
    transform: translateZ(0);
  }
}

/* 优化错误抖动动画性能 */
.btn-primary.error-shake {
  animation: errorShake 0.6s ease-in-out;
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0) translateZ(0);
  }
  20%, 60% {
    transform: translateX(-5px) translateZ(0);
  }
  40%, 80% {
    transform: translateX(5px) translateZ(0);
  }
}

/* 次要按钮样式 - 上传文件按钮 */
.btn-secondary {
  background-color: white;
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary);
  padding: 8px 16px;
  border-radius: var(--el-border-radius-base);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition-base);
  outline: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  transform: translateZ(0);
  will-change: transform, box-shadow;
}

.btn-secondary::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(24, 144, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  will-change: width, height;
}

.btn-secondary:hover::before {
  width: 200px;
  height: 200px;
}

.btn-secondary:hover {
  background-color: rgba(24, 144, 255, 0.05);
  border-color: #40a9ff;
  color: #40a9ff;
  transform: translateY(-1px) translateZ(0);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  animation: btnSecondaryHover 0.3s ease-out;
}

@keyframes btnSecondaryHover {
  0% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-2px) translateZ(0);
  }
  100% {
    transform: translateY(-1px) translateZ(0);
  }
}

.btn-secondary:active {
  background-color: rgba(24, 144, 255, 0.1);
  border-color: #096dd9;
  color: #096dd9;
  transform: translateY(0) scale(0.95) translateZ(0);
  transition: transform 0.1s;
}

.btn-secondary:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary:disabled::before {
  display: none;
}

.btn-secondary.success-pulse {
  animation: successPulseSecondary 1s ease-out;
}

@keyframes successPulseSecondary {
  0% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
    background-color: white;
    color: var(--el-color-primary);
    transform: translateZ(0);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
    background-color: #52c41a;
    color: white;
    transform: translateZ(0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
    background-color: white;
    color: var(--el-color-primary);
    transform: translateZ(0);
  }
}

.btn-secondary.error-shake {
  animation: errorShake 0.6s ease-in-out;
}

/* 导入按钮的加载状态容器 - 性能优化 */
.loading-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  transform: translateZ(0);
}

/* 增强的加载动画 - 优化性能 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: relative;
  transform: translateZ(0); /* 触发硬件加速 */
  will-change: transform;
}

/* 加载点动画 - 优化性能 */
.loading-dots {
  display: flex;
  gap: 2px;
  align-items: center;
  transform: translateZ(0);
}

.loading-dots span {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transition: background-color 0.3s ease, transform 0.3s ease;
  opacity: 0.7;
  animation: dotFade 0.4s ease-in-out;
  transform: translateZ(0);
  will-change: transform, opacity, background-color;
}

@keyframes dotFade {
  0%,
  100% {
    opacity: 0.7;
    transform: translateZ(0);
  }
  50% {
    opacity: 1;
    transform: translateZ(0);
  }
}

.loading-dots span.active {
  background-color: white;
  transform: scale(1.3) translateZ(0);
  opacity: 1;
  animation: dotActive 0.4s ease-in-out;
}

@keyframes dotActive {
  0% {
    transform: scale(1) translateZ(0);
  }
  50% {
    transform: scale(1.5) translateZ(0);
  }
  100% {
    transform: scale(1.3) translateZ(0);
  }
}

/* 增强版旋转动画 - 优化性能 */
@keyframes spin {
  0% {
    transform: rotate(0deg) translateZ(0);
    border-top-color: rgba(255, 255, 255, 0.7);
  }
  50% {
    transform: rotate(180deg) translateZ(0);
    border-top-color: white;
  }
  100% {
    transform: rotate(360deg) translateZ(0);
    border-top-color: rgba(255, 255, 255, 0.7);
  }
}

/* 进度条动画背景效果 - 性能优化 */
.btn-primary:disabled::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: progress-stripes 1.5s linear infinite;
  will-change: transform;
  transform: translateZ(0);
}

@keyframes progress-stripes {
  0% {
    transform: translateX(-100%) translateZ(0);
  }
  100% {
    transform: translateX(100%) translateZ(0);
  }
}

/* 加载状态下按钮的脉动效果 - 优化性能 */
.btn-primary:disabled {
  animation: pulse-soft 2s ease-in-out infinite;
}

@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
    transform: translateZ(0);
  }
  50% {
    opacity: 0.9;
    transform: translateZ(0);
  }
}

/* 移除旧的导入按钮样式 */
.import-btn {
  min-width: 100px;
  transition: all 0.2s ease;
}

/* 响应式设计保持不变，但增加硬件加速 */
@media (max-width: 768px) {
  .header-control {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 0 5px;
  }

  .search-box {
    width: 100%;
    margin-bottom: 5px;
    border-radius: 18px;
    order: 1;
  }

  .search-input {
    padding: 10px 36px 10px 36px;
    font-size: 15px;
  }

  .actions {
    order: 2;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    align-items: center;
  }

  .sort-select {
    grid-column: 1;
    flex: 1;
    padding: 9px;
    font-size: 14px;
  }

  .btn-icon {
    grid-column: 2;
    padding: 8px 10px;
    font-size: 16px;
  }

  .btn-primary {
    grid-column: 3;
    padding: 9px 12px;
    font-size: 13px;
    min-width: 70px;
    justify-content: center;
  }

  /* 移动设备上简化动画以提高性能 */
  .btn-primary:hover {
    transform: none;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
  }

  .btn-icon:hover {
    transform: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .sort-select:hover {
    transform: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
}

/* 其他响应式样式保持不变，仅在必要时添加 transform: translateZ(0) */
@media (min-width: 768px) and (max-width: 991px) {
  .header-control {
    gap: 12px;
    padding: 0 10px;
    justify-content: space-between;
    align-items: center;
  }

  .search-box {
    box-shadow: var(--el-box-shadow-light);
    width: 100%;
    max-width: 350px;
    flex-shrink: 0;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    align-items: center;
  }

  .sort-select {
    padding: 7px 10px;
    font-size: 14px;
    min-width: 120px;
  }

  .btn-icon {
    padding: 6px 10px;
  }

  .btn-primary {
    padding: 7px 12px;
    min-width: 85px;
  }
}

@media (max-width: 480px) {
  .header-control {
    padding: 0 8px;
    margin-bottom: 12px;
  }

  .search-input {
    font-size: 16px;
    padding: 11px 36px 11px 36px;
  }

  .actions {
    grid-template-columns: 1fr auto;
    gap: 6px;
  }

  .btn-icon {
    grid-column: 2;
    grid-row: 1;
  }

  .btn-primary {
    grid-column: 1 / -1;
    grid-row: 2;
    margin-top: 4px;
  }

  .search-box .icon {
    font-size: 17px;
    width: 26px;
    height: 26px;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
  }

  /* 小型设备上减少动画复杂度 */
  @keyframes shimmer {
    0% {
      opacity: 0;
      transform: translateX(-100%) translateZ(0);
    }
    100% {
      opacity: 0;
      transform: translateX(100%) translateZ(0);
    }
  }

  @keyframes successPulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
      transform: translateZ(0);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(82, 196, 26, 0);
      transform: translateZ(0);
    }
  }
}

@media (min-width: 480px) and (max-width: 640px) {
  .actions {
    grid-template-columns: 1fr auto auto;
  }

  .btn-primary {
    grid-column: 3;
  }
}

@media (min-width: 1200px) {
  .header-control {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;
  }

  .search-box {
    width: 300px;
  }
}

@media (min-width: 1600px) {
  .header-control {
    max-width: 1400px;
  }

  .search-box {
    width: 350px;
  }
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .search-box {
    border-width: 0.5px;
  }

  .btn-primary::before {
    transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1), height 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* 减少动画效果以节省电池（移动设备） */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transform: none !important;
    will-change: auto !important;
  }
}

/* 暗色模式支持 - 增加硬件加速 */
@media (prefers-color-scheme: dark) {
  :root {
    --el-color-primary: #40a9ff;
    --el-border-color: #434343;
    --el-border-color-hover: #585858;
    --el-bg-color: #303030;
    --el-text-color-primary: #f5f5f5;
    --el-text-color-regular: #d0d0d0;
    --el-text-color-secondary: #a0a0a0;
  }

  .search-box,
  .sort-select,
  .btn-icon {
    background-color: #252525;
    border-color: var(--el-border-color);
    transform: translateZ(0);
  }

  .search-input {
    color: var(--el-text-color-primary);
  }

  .btn-primary:disabled {
    background-color: #2c2c2c;
    border-color: #434343;
    color: #8c8c8c;
  }

  .btn-primary:disabled::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  }

  .sort-select {
    background-color: #252525;
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
    background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="%23a0a0a0" d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.8 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L859.2 335c11.9-14.2 0.9-35-18.8-35z"/></svg>');
  }

  .btn-icon {
    background-color: #252525;
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }

  .btn-icon:hover {
    background-color: #333;
  }

  .btn-icon::before {
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* 暗色模式下的成功和错误反馈 */
  @keyframes successPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
      background-color: var(--el-color-primary);
      transform: translateZ(0);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
      background-color: #52c41a;
      transform: translateZ(0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
      background-color: var(--el-color-primary);
      transform: translateZ(0);
    }
  }
}

/* 触摸设备优化 - 简化动画提高性能 */
@media (hover: none) and (pointer: coarse) {
  .btn-primary,
  .btn-icon,
  .clear-icon {
    transform: none !important;
  }

  .btn-primary:active {
    transform: scale(0.97) !important;
  }

  .search-box.search-focused {
    transform: none !important;
  }

  .sort-select:hover,
  .btn-icon:hover {
    transform: none !important;
  }

  .sort-select:active,
  .btn-icon:active {
    transform: scale(0.97) !important;
  }

  /* 触摸设备上禁用复杂动画以提高性能 */
  @keyframes shimmer {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  /* 禁用背景扩散效果 */
  .btn-icon::before,
  .btn-primary::before {
    display: none;
  }
}

/* 无障碍访问增强 */
.search-input:focus-visible,
.sort-select:focus-visible,
.btn-icon:focus-visible,
.btn-primary:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

/* 动画性能优化 - 使用 will-change */
.search-box,
.btn-primary,
.btn-icon,
.sort-select {
  transform: translateZ(0);
  will-change: transform, box-shadow;
}

/* 减少重排的关键优化 */
* {
  box-sizing: border-box;
}

/* 键盘焦点时的额外反馈 */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

/* 优化动画帧率和硬件加速 */
@media (prefers-reduced-motion: no-preference) {
  /* 仅在非减少动画模式下应用完整的动画效果 */
  .search-box,
  .btn-primary,
  .btn-icon,
  .sort-select {
    transform: translateZ(0);
    will-change: transform, box-shadow;
  }
}

/* 移动设备上的性能优化 - 减少动画复杂度 */
@media (max-width: 768px) and (prefers-reduced-motion: no-preference) {
  /* 减少动画持续时间 */
  .search-box,
  .btn-primary,
  .btn-icon,
  .sort-select {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* 简化动画 */
  @keyframes shimmer {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 0.2;
    }
  }

  @keyframes successPulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.3);
    }
    50% {
      box-shadow: 0 0 0 5px rgba(82, 196, 26, 0);
    }
  }

  /* 简化旋转动画 */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
