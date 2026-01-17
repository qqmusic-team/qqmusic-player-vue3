<template>
  <div class="header-control">
    <div class="search-box" :class="{ 'search-focused': isSearchFocused }">
      <span class="icon search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="M16.2 16.2 21 21"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <input
        :value="searchQuery"
        @input="handleSearchInput"
        @focus="handleFocus"
        @blur="handleBlur"
        type="search"
        placeholder="搜索本地歌曲..."
        class="search-input"
      />
      <span v-if="searchQuery" class="icon clear-icon" @click="clearSearch">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.75 6.75 17.25 17.25M17.25 6.75 6.75 17.25"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
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
import { ref, onUnmounted } from "vue";

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
  isSearchFocused.value = true;
};

const handleBlur = () => {
  isSearchFocused.value = false;
};

// 添加错误处理和重试逻辑

// 播放排序变化音效提示（模拟）

// 显示成功反馈

// 显示错误反馈

// 键盘导航优化

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
.header-control {
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
  height: 36px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-box:hover {
  border-color: var(--el-border-color-hover);
}

.search-box.search-focused {
  border-color: var(--el-color-primary);
  background-color: #fff;
  box-shadow: none;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 36px 0 36px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: transparent;
  color: var(--el-text-color-primary);
  -webkit-appearance: none;
  appearance: none;
}

.search-input[type="search"]::-webkit-search-cancel-button,
.search-input[type="search"]::-webkit-search-decoration,
.search-input[type="search"]::-webkit-search-results-button,
.search-input[type="search"]::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.search-input[type="search"]::-ms-clear,
.search-input[type="search"]::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.45);
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

.search-box .icon svg {
  width: 18px;
  height: 18px;
}

.search-box .search-icon {
  left: 12px;
  color: var(--el-text-color-secondary);
  cursor: default;
  pointer-events: none;
}

.search-box.search-focused .search-icon {
  color: var(--el-color-primary);
  transform: translateY(-50%);
}

.search-box .clear-icon {
  right: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.6;
}

.search-box .clear-icon:hover {
  opacity: 1;
  background-color: var(--el-bg-color);
}

.search-box .clear-icon:active {
  background-color: rgba(0, 0, 0, 0.06);
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
}

.sort-select:focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

.sort-select:active {
  border-color: var(--el-border-color-hover);
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
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-icon:hover {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.btn-icon:active {
  background-color: rgba(0, 0, 0, 0.06);
}

/* 排序按钮优化 */
.btn-icon.sort-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon.sort-btn.active {
  background-color: var(--el-color-primary);
  color: white;
  border-color: var(--el-color-primary);
  box-shadow: 0 3px 8px rgba(24, 144, 255, 0.3);
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
  box-shadow: 0 1px 3px rgba(24, 144, 255, 0.3);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-primary:active {
  background-color: #096dd9;
  border-color: #096dd9;
}

.btn-primary:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(24, 144, 255, 0.05);
  border-color: #40a9ff;
  color: #40a9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-secondary:active {
  background-color: rgba(24, 144, 255, 0.1);
  border-color: #096dd9;
  color: #096dd9;
}

.btn-secondary:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
  opacity: 0.75;
}

.loading-dots span.active {
  background-color: white;
  opacity: 1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
    padding: 0;
  }

  .search-box {
    width: 100%;
    margin-bottom: 5px;
    border-radius: 8px;
    order: 1;
  }

  .search-input {
    height: 36px;
    padding: 0 36px 0 36px;
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
    padding: 0;
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
    padding: 0;
    margin-bottom: 12px;
  }

  .search-input {
    font-size: 16px;
    height: 36px;
    padding: 0 36px 0 36px;
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
    max-width: none;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
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
    transition:
      width 0.7s cubic-bezier(0.4, 0, 0.2, 1),
      height 0.7s cubic-bezier(0.4, 0, 0.2, 1);
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

/* 触摸设备优化 - 简化动画提高性能 */
@media (hover: none) and (pointer: coarse) {
  .btn-primary,
  .btn-icon,
  .clear-icon {
    transform: none !important;
  }

  .search-box.search-focused {
    transform: none !important;
  }

  .sort-select:hover,
  .btn-icon:hover {
    transform: none !important;
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

.search-input:focus-visible {
  outline: none;
  outline-offset: 0;
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
</style>
