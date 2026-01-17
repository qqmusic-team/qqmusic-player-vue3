<template>
  <div class="grid-container" ref="containerRef" role="grid" aria-label="艺术家列表">
    <!-- 艺术家网格项，使用v-memo优化渲染性能 -->
    <div
      v-for="(artist, index) in visibleArtists"
      :key="artist.name"
      class="grid-item"
      :class="{ 'artist-selected': selectedArtist === artist.name }"
      @click="handleArtistClick(artist, $event)"
      @mouseenter="handleMouseEnter($event, index)"
      @mouseleave="handleMouseLeave($event, index)"
      @keydown.enter="handleArtistClick(artist, $event)"
      @keydown.space.prevent="handleArtistClick(artist, $event)"
      @keydown.right="handleArrowNavigation($event, index, 'next')"
      @keydown.left="handleArrowNavigation($event, index, 'prev')"
      @keydown.down="handleArrowNavigation($event, index, 'down')"
      @keydown.up="handleArrowNavigation($event, index, 'up')"
      tabindex="0"
      role="button"
      :aria-label="`${artist.name}，${artist.count}首歌曲`"
      :aria-selected="selectedArtist === artist.name"
      v-memo="[artist.name, selectedArtist]"
    >
      <!-- 艺术家头像，使用v-once优化静态渲染 -->
      <div class="artist-avatar" v-once>
        <div
          class="avatar-inner"
          :class="{ 'avatar-pulse': pulseStates[index] }"
          role="img"
          :aria-label="`${artist.name}的头像`"
        >
          <span class="avatar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" fill="currentColor" opacity="0.95" />
              <path
                d="M4.5 20.25c.9-3.9 4.1-6.75 7.5-6.75s6.6 2.85 7.5 6.75"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                opacity="0.95"
              />
            </svg>
          </span>
          <div v-if="selectedArtist === artist.name" class="selected-indicator" role="presentation">
            <span class="check-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.25 7.5 10.5 17.25 6 12.75"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div class="artist-info" role="group" :aria-labelledby="`artist-name-${index}`">
        <div class="artist-name" :id="`artist-name-${index}`">{{ artist.name }}</div>
        <div class="artist-count">{{ artist.count }} 首歌曲</div>
      </div>
    </div>

    <!-- 加载状态，当loading为true时显示 -->
    <div v-if="loading" class="loading-container" role="status" aria-busy="true" aria-live="polite">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 空状态，当没有艺术家数据时显示 -->
    <div v-else-if="artists.length === 0" class="empty-state" role="alert" aria-live="assertive">
      暂无艺术家信息，请导入本地音乐文件
    </div>
    <!-- 虚拟化占位符容器，用于虚拟滚动 -->
    <div
      v-if="useVirtualization && artists.length > 0"
      class="virtualization-spacer"
      :style="{ height: totalHeight + 'px' }"
      role="presentation"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick, shallowRef } from "vue";

/**
 * 组件属性定义
 */
const props = defineProps({
  /**
   * 歌曲列表数据
   */
  songs: {
    type: Array,
    default: () => [],
  },
  /**
   * 是否处于加载状态
   */
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * 当前选中的艺术家名称
   */
  selectedArtist: {
    type: String,
    default: "",
  },
  /**
   * 是否启用虚拟滚动
   */
  useVirtualization: {
    type: Boolean,
    default: true,
  },
  /**
   * 启用虚拟化的阈值，超过此数量才会使用虚拟滚动
   */
  virtualizationThreshold: {
    type: Number,
    default: 20,
  },
  /**
   * 头像是否需要动态更新
   */
  dynamicAvatar: {
    type: Boolean,
    default: false,
  },
});

/**
 * 组件事件定义
 */
const emit = defineEmits(["select", "update:selectedArtist"]);

// 容器引用，用于虚拟滚动和获取列数
const containerRef = ref(null);
// 是否启用虚拟化
const isVirtualized = ref(false);
// 虚拟滚动起始索引
const startIndex = ref(0);
// 虚拟滚动结束索引
const endIndex = ref(20);
// 预估每个item高度
const itemHeight = ref(160);
// 可见元素数量（包括缓冲区）
const visibleCount = ref(20);
// 优化的脉冲状态存储，避免频繁修改DOM类名
const pulseStates = shallowRef({});

/**
 * 优化的计算艺术家列表
 * 使用缓存机制避免重复计算
 */
const artists = computed(() => {
  // 快速检查必要条件
  if (!props.songs || !Array.isArray(props.songs) || props.songs.length === 0) {
    return [];
  }

  // 避免重复计算，使用缓存键
  const cacheKey = props.songs.map((song) => song.artist).join("|");

  // 使用闭包函数缓存结果
  const cachedResult = computeArtistsWithCache(props.songs, cacheKey);
  return cachedResult;
});

/**
 * 计算艺术家的缓存函数
 * @param {Array} songs - 歌曲列表
 * @param {String} cacheKey - 缓存键，用于判断是否需要重新计算
 * @returns {Array} 计算后的艺术家列表
 */
let cachedArtists = null;
let lastCacheKey = "";
function computeArtistsWithCache(songs, cacheKey) {
  // 如果输入相同，返回缓存结果
  if (cachedArtists && cacheKey === lastCacheKey) {
    return cachedArtists;
  }

  // 否则重新计算
  const map = new Map(); // 使用Map代替普通对象，提高大量数据处理效率

  // 批量处理歌曲数据
  songs.forEach((song) => {
    if (song && song.artist) {
      const artist = song.artist;
      const existing = map.get(artist);
      if (existing) {
        existing.count++;
      } else {
        map.set(artist, { name: artist, count: 1 });
      }
    }
  });

  // 转换为数组并排序
  const result = Array.from(map.values()).sort((a, b) => b.count - a.count);

  // 更新缓存
  cachedArtists = result;
  lastCacheKey = cacheKey;

  return result;
}

/**
 * 计算可见艺术家（用于虚拟化）
 */
const visibleArtists = computed(() => {
  // 当数据量小于阈值或未启用虚拟化时，直接返回所有艺术家
  if (!isVirtualized.value || artists.value.length <= props.virtualizationThreshold) {
    return artists.value;
  }

  // 否则返回当前可见的一部分艺术家
  return artists.value.slice(startIndex.value, endIndex.value);
});

/**
 * 计算总高度（用于虚拟化）
 */
const totalHeight = computed(() => {
  if (!isVirtualized.value || artists.value.length <= props.virtualizationThreshold) {
    return 0;
  }
  return artists.value.length * itemHeight.value;
});

/**
 * 初始化虚拟化
 * 计算可见数量，绑定滚动事件等
 */
const initVirtualization = () => {
  if (!props.useVirtualization || !containerRef.value) return;

  // 检测容器可见高度
  const containerHeight = containerRef.value.clientHeight;

  // 计算可显示数量，额外显示4个作为缓冲
  visibleCount.value = Math.ceil(containerHeight / itemHeight.value) + 4;

  // 检查是否需要启用虚拟化
  isVirtualized.value = artists.value.length > props.virtualizationThreshold;

  if (isVirtualized.value) {
    // 初始设置显示范围
    updateVisibleRange(0);

    // 绑定滚动事件
    containerRef.value.addEventListener("scroll", handleScroll);
  }
};

/**
 * 更新可见范围
 * @param {Number} scrollTop - 滚动位置
 */
const updateVisibleRange = (scrollTop) => {
  if (!isVirtualized.value) return;

  // 计算起始索引
  const newStartIndex = Math.floor(scrollTop / itemHeight.value);
  // 计算结束索引
  const newEndIndex = Math.min(newStartIndex + visibleCount.value, artists.value.length);

  // 向上缓冲2个元素，提升滚动体验
  startIndex.value = Math.max(0, newStartIndex - 2);
  endIndex.value = newEndIndex;
};

/**
 * 节流函数，用于限制高频事件的触发频率
 * @param {Function} func - 要执行的函数
 * @param {Number} wait - 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, wait) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * 防抖函数，用于延迟执行函数，避免连续触发
 * @param {Function} func - 要执行的函数
 * @param {Number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流处理滚动事件，优化性能
 */
const handleScroll = throttle((event) => {
  const scrollTop = event.target.scrollTop;
  updateVisibleRange(scrollTop);
}, 16); // 约60fps

/**
 * 处理艺术家点击事件
 * @param {Object} artist - 艺术家对象
 */
const handleArtistClick = debounce((artist, e) => {
  // 添加点击动画类
  const el = e?.currentTarget;
  if (el) {
    el.classList.add("artist-clicked");
    setTimeout(() => {
      if (el) {
        el.classList.remove("artist-clicked");
      }
    }, 300);
  }

  // 选中当前艺术家，触发事件
  emit("update:selectedArtist", artist.name);
  emit("select", artist.name);
}, 50);

/**
 * 鼠标进入时的效果 - 优化版本
 * @param {Event} event - 鼠标事件对象
 * @param {Number} index - 当前项的索引
 */
const handleMouseEnter = (event, index) => {
  // 设置脉冲状态，使用shallowRef避免不必要的组件更新
  pulseStates.value[index] = true;

  // 聚焦当前元素以提高可访问性
  if (event.currentTarget) {
    event.currentTarget.focus();
  }
};

/**
 * 鼠标离开时的效果 - 优化版本
 * @param {Event} event - 鼠标事件对象
 * @param {Number} index - 当前项的索引
 */
const handleMouseLeave = (event, index) => {
  // 移除脉冲状态
  delete pulseStates.value[index];
};

/**
 * 获取当前容器的列数，用于键盘导航
 * @returns {Number} 列数
 */
const getColumnCount = () => {
  if (!containerRef.value) return 1;

  const computedStyle = window.getComputedStyle(containerRef.value);
  const gridTemplateColumns = computedStyle.gridTemplateColumns;
  return gridTemplateColumns.split(" ").length;
};

/**
 * 键盘导航处理
 * @param {Number} currentIndex - 当前项的索引
 * @param {String} direction - 导航方向
 */
const handleArrowNavigation = (e, currentIndex, direction) => {
  // 阻止默认行为，避免页面滚动
  e.preventDefault();

  const columnCount = getColumnCount();
  let newIndex = currentIndex;

  // 根据方向计算新索引
  switch (direction) {
    case "next":
      newIndex = Math.min(currentIndex + 1, visibleArtists.value.length - 1);
      break;
    case "prev":
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case "down":
      newIndex = Math.min(currentIndex + columnCount, visibleArtists.value.length - 1);
      break;
    case "up":
      newIndex = Math.max(currentIndex - columnCount, 0);
      break;
  }

  // 如果索引发生了变化，聚焦到新元素
  if (newIndex !== currentIndex) {
    const elements = document.querySelectorAll(".grid-item");
    if (elements[newIndex]) {
      elements[newIndex].focus();
    }
  }
};

/**
 * 处理页面可见性变化，优化性能
 */
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 页面隐藏时，清除所有脉冲状态以节省性能
    pulseStates.value = {};
  }
};

/**
 * 窗口大小变化处理，防抖避免频繁更新
 */
const handleResize = debounce(() => {
  // 重新初始化虚拟化
  initVirtualization();
}, 200);

/**
 * 监听props变化，当相关属性变化时重新初始化虚拟化
 */
watch(
  () => [props.songs, props.useVirtualization, props.virtualizationThreshold],
  () => {
    nextTick(() => {
      initVirtualization();
    });
  },
  { deep: true },
);

/**
 * 组件挂载时的生命周期钩子
 */
onMounted(() => {
  // 初始化虚拟化
  nextTick(() => {
    initVirtualization();
  });

  // 添加事件监听
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("resize", handleResize);
});

/**
 * 组件卸载时的生命周期钩子，清理资源
 */
onUnmounted(() => {
  // 移除事件监听，避免内存泄漏
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("resize", handleResize);

  // 清理滚动事件
  if (containerRef.value) {
    containerRef.value.removeEventListener("scroll", handleScroll);
  }

  // 清理缓存和状态
  cachedArtists = null;
  lastCacheKey = "";
  pulseStates.value = {};
});
</script>

<style scoped>
/* 网格容器样式 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--image-size-md), 1fr));
  gap: var(--grid-gap-lg);
  padding: 16px 24px;
  position: relative;
  min-height: 200px;
  background-color: #fff;
  border-radius: 8px;
}

/* 网格项基础样式 */
.grid-item {
  text-align: center;
  cursor: pointer;
  padding: 15px;
  border-radius: 12px;
  background-color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  outline: none;
}

/* 聚焦效果 - 可访问性 */
.grid-item:focus {
  outline: 2px solid #fda085;
  outline-offset: 2px;
}

/* 选中状态样式 */
.grid-item.artist-selected {
  background-color: #fff0ed;
  box-shadow: 0 4px 12px rgba(253, 160, 133, 0.2);
}

/* 选中状态的头像样式 */
.grid-item.artist-selected .avatar-inner {
  background: linear-gradient(135deg, #ff8a65 0%, #e57373 100%);
  box-shadow: 0 0 0 3px rgba(255, 138, 101, 0.3);
}

/* 悬停效果 */
.grid-item:hover {
  background-color: #f8f9fa;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 点击动画效果 */
.grid-item.artist-clicked {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* 艺术家头像容器 */
.artist-avatar {
  margin-bottom: 12px;
  position: relative;
  width: var(--image-size-sm);
  height: var(--image-size-sm);
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s ease;
}

/* 头像内部样式 */
.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 选中指示器 */
.selected-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 选中图标 */
.check-icon {
  color: #fda085;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.check-icon svg {
  width: 1em;
  height: 1em;
}

/* 头像脉冲动画 */
.avatar-pulse {
}

/* 头像内部装饰 */
.avatar-inner::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 悬停时显示装饰 */
.grid-item:hover .avatar-inner::after {
  opacity: 1;
}

/* 头像图标 */
.avatar-icon {
  font-size: 32px;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon svg {
  width: 1em;
  height: 1em;
}

/* 悬停时图标放大 */
.grid-item:hover .avatar-icon {
  transform: none;
}

/* 艺术家信息容器 */
.artist-info {
  padding: 0 4px;
  transition: all 0.3s ease;
}

/* 艺术家名称 */
.artist-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

/* 悬停或选中时改变颜色 */
.grid-item:hover .artist-name,
.grid-item.artist-selected .artist-name {
  color: #fda085;
}

/* 艺术家歌曲数量 */
.artist-count {
  font-size: 12px;
  color: #999;
  line-height: 1.3;
  transition: all 0.3s ease;
}

/* 加载状态容器 */
.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

/* 加载动画 */
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #fda085;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 加载文字 */
.loading-text {
  font-size: 14px;
  color: #999;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 虚拟化占位符样式 */
.virtualization-spacer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

/* 响应式设计 - 平板设备 */
@media (max-width: var(--breakpoint-sm)) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(var(--image-size-xs), 1fr));
    gap: var(--grid-gap-md);
    padding: 15px;
  }

  .artist-avatar {
    width: var(--image-size-xs);
    height: var(--image-size-xs);
  }

  .avatar-icon {
    font-size: 24px;
  }

  .artist-name {
    font-size: 13px;
  }

  .artist-count {
    font-size: 11px;
  }

  .selected-indicator {
    width: 20px;
    height: 20px;
  }

  .check-icon {
    font-size: 12px;
  }
}

/* 响应式设计 - 移动设备 */
@media (max-width: var(--breakpoint-xs)) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--image-size-xs) - 15px), 1fr));
    gap: var(--grid-gap-sm);
    padding: 12px;
  }

  .grid-item {
    padding: 12px;
    border-radius: var(--border-radius-md);
  }

  .artist-avatar {
    width: calc(var(--image-size-xs) - 10px);
    height: calc(var(--image-size-xs) - 10px);
    margin-bottom: 8px;
  }

  .avatar-icon {
    font-size: 20px;
  }

  .artist-name {
    font-size: 12px;
  }

  .artist-count {
    font-size: 10px;
  }

  .selected-indicator {
    width: 18px;
    height: 18px;
  }

  .check-icon {
    font-size: 11px;
  }
}

/* 响应式设计 - 平板和大屏设备 */
@media (min-width: var(--breakpoint-lg)) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--image-size-md) + 20px), 1fr));
    gap: 24px;
  }

  .artist-avatar {
    width: calc(var(--image-size-sm) + 10px);
    height: calc(var(--image-size-sm) + 10px);
  }

  .avatar-icon {
    font-size: 36px;
  }

  .selected-indicator {
    width: 26px;
    height: 26px;
  }

  .check-icon {
    font-size: 16px;
  }
}

/* 滚动条样式优化 */
.grid-container::-webkit-scrollbar {
  width: 6px;
}

.grid-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.grid-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
  transition: background 0.3s;
}

.grid-container::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
