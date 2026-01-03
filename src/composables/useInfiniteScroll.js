import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

export function useInfiniteScroll(options = {}) {
  const {
    threshold = 200,
    debounceTime = 300,
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
        isScrolling.value = false;
      }, debounceTime);
    }
  };

  const attachScrollListener = (container) => {
    if (!container) {
      return;
    }

    scrollContainer.value = container;
    container.addEventListener("scroll", handleScroll, { passive: true });
    isInitialized.value = true;
  };

  const detachScrollListener = () => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener("scroll", handleScroll);
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
