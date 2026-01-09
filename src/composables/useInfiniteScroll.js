import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

/**
 * 节流函数 - 限制函数执行频率
 * @param {Function} fn 要节流的函数
 * @param {number} delay 节流延迟时间
 * @returns {Function} 节流后的函数
 */
function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId = null;

  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

export function useInfiniteScroll(options = {}) {
  const {
    threshold = 200,
    debounceTime = 150, // 优化：减少防抖时间提高响应速度
    onLoadMore,
    hasMore = true,
    isLoading = false,
    scrollContainerRef = null,
  } = options;

  const scrollContainer = ref(null);
  const isScrolling = ref(false);
  const debounceTimer = ref(null);
  const isInitialized = ref(false);

  const getScrollInfo = (container) => {
    if (!container) {
      return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
    }

    if (container === window) {
      return {
        scrollTop:
          window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
        scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
        clientHeight: window.innerHeight || document.documentElement.clientHeight,
      };
    }

    return {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
    };
  };

  const checkScrollPosition = () => {
    if (!scrollContainer.value) {
      return false;
    }

    const { scrollTop, scrollHeight, clientHeight } = getScrollInfo(scrollContainer.value);
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom <= threshold;
  };

  const handleScroll = () => {
    // 使用 requestAnimationFrame 优化滚动性能
    if (isScrolling.value) {
      return;
    }

    if (!isLoading.value && hasMore.value && checkScrollPosition()) {
      isScrolling.value = true;

      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
      }

      debounceTimer.value = setTimeout(() => {
        if (onLoadMore && !isLoading.value && hasMore.value) {
          onLoadMore();
        }
        debounceTimer.value = null;
        // 延迟重置滚动状态，避免频繁触发
        setTimeout(() => {
          isScrolling.value = false;
        }, 100);
      }, debounceTime);
    }
  };

  // 使用节流优化滚动事件处理
  const throttledHandleScroll = throttle(handleScroll, 100);

  const attachScrollListener = (container) => {
    if (!container) {
      return;
    }

    scrollContainer.value = container;
    container.addEventListener("scroll", throttledHandleScroll, { passive: true });
    isInitialized.value = true;
  };

  const detachScrollListener = () => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener("scroll", throttledHandleScroll);
      scrollContainer.value = null;
    }
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
      debounceTimer.value = null;
    }
    isInitialized.value = false;
  };

  const resetScroll = () => {
    if (scrollContainer.value && scrollContainer.value !== window) {
      scrollContainer.value.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  };

  const updateScrollContainer = (newContainer) => {
    detachScrollListener();
    if (newContainer) {
      attachScrollListener(newContainer);
    }
  };

  const initializeScrollListener = async () => {
    await nextTick();

    if (scrollContainerRef && scrollContainerRef.value) {
      attachScrollListener(scrollContainerRef.value);
    } else {
      attachScrollListener(window);
    }
  };

  onMounted(() => {
    initializeScrollListener();
  });

  if (scrollContainerRef) {
    watch(
      () => scrollContainerRef.value,
      (newContainer, oldContainer) => {
        if (newContainer !== oldContainer) {
          updateScrollContainer(newContainer);
        }
      },
      { immediate: true }
    );
  }

  onUnmounted(() => {
    detachScrollListener();
  });

  return {
    scrollContainer,
    isScrolling,
    isInitialized,
    attachScrollListener,
    detachScrollListener,
    resetScroll,
    updateScrollContainer,
  };
}
