<template>
  <div class="album-list-container">
    <div class="album-grid" :class="{ 'is-scrolled': isScrolled }">
      <AlbumCard
        v-for="(album, index) in albums"
        :key="album.name"
        :album="album"
        :isActive="activeAlbum === album.name"
        :animation-delay="index * 50"
        @select="handleAlbumClick"
      />

      <EmptyState v-if="albums.length === 0" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import AlbumCard from "./AlbumCard.vue";
import EmptyState from "./EmptyState.vue";

// Props定义
const props = defineProps({
  audioList: {
    type: Array,
    default: () => [],
  },
});

// 状态管理
const activeAlbum = ref("");
const isPressed = ref(false);

const isScrolled = ref(false);

// 计算专辑列表
const albums = computed(() => {
  const grouped = {};

  props.audioList.forEach((audio) => {
    const albumName = audio.album || "未知专辑";
    const artist = audio.artist || "未知艺术家";

    if (!grouped[albumName]) {
      grouped[albumName] = {
        name: albumName,
        artists: new Set(),
        cover: audio.cover || null,
        count: 0,
      };
    }
    grouped[albumName].artists.add(artist);
    grouped[albumName].count++;
  });

  return Object.values(grouped)
    .map((album) => {
      let displayArtist;
      if (album.artists.size > 1) {
        displayArtist = "未知";
      } else if (album.artists.size === 1) {
        displayArtist = Array.from(album.artists)[0];
      } else {
        displayArtist = "未知艺术家";
      }

      return {
        name: album.name,
        artist: displayArtist,
        cover: album.cover,
        count: album.count,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
});

// 处理专辑点击
const handleAlbumClick = (albumName) => {
  if (isPressed.value) return;

  isPressed.value = true;
  activeAlbum.value = albumName;

  // 模拟延迟，使激活状态有明显的视觉反馈
  setTimeout(() => {
    isPressed.value = false;
    // 发射选中事件
    emit("select", albumName);
  }, 200);
};

// 滚动事件处理
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  isScrolled.value = scrollTop > 20;
};

// 生命周期钩子
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  handleScroll(); // 初始化滚动状态
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 事件定义
const emit = defineEmits(["select"]);
</script>

<style scoped>
.album-list-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-background-page, #f5f7fa);
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  transition: background-color 0.3s ease;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--image-size-md), 1fr));
  gap: var(--grid-gap-lg);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding-bottom: 40px;
}

/* 滚动状态样式 */
.album-grid.is-scrolled {
  padding-top: 20px;
  animation: adjustOnScroll 0.3s ease;
}

@keyframes adjustOnScroll {
  from {
    padding-top: 30px;
    opacity: 0.95;
  }
  to {
    padding-top: 20px;
    opacity: 1;
  }
}

/* 加载动画效果 */
.album-grid::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #409eff, transparent);
  transform: translateX(-100%);
  animation: loadingProgress 2s ease-in-out infinite;
}

@keyframes loadingProgress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 响应式布局 */
@media (max-width: var(--breakpoint-xs)) {
  .album-list-container {
    padding: 12px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(var(--image-size-sm), 1fr));
    gap: var(--grid-gap-sm);
    padding-bottom: 30px;
  }
}

@media (min-width: calc(var(--breakpoint-xs) + 1px)) and (max-width: var(--breakpoint-sm)) {
  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--image-size-md) - 30px), 1fr));
    gap: var(--grid-gap-md);
  }
}

@media (min-width: calc(var(--breakpoint-sm) + 1px)) and (max-width: var(--breakpoint-md)) {
  .album-list-container {
    padding: 24px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--image-size-md) - 10px), 1fr));
    gap: var(--grid-gap-lg);
  }
}

@media (min-width: calc(var(--breakpoint-md) + 1px)) and (max-width: var(--breakpoint-lg)) {
  .album-list-container {
    padding: 30px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--image-size-md) + 10px), 1fr));
    gap: 24px;
  }
}

@media (min-width: calc(var(--breakpoint-lg) + 1px)) {
  .album-list-container {
    padding: 40px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(calc(var(--image-size-md) + 30px), 1fr));
    gap: 28px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .album-list-container {
    padding: 16px;
    touch-action: manipulation;
  }

  .album-grid {
    gap: 16px;
  }
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .album-grid {
    transition: none;
  }

  .album-grid.is-scrolled {
    animation: none;
  }

  .album-grid::before {
    animation: none;
    display: none;
  }
}

/* 打印样式 */
@media print {
  .album-list-container {
    padding: 0;
  }

  .album-grid {
    gap: 10px;
    page-break-inside: avoid;
  }

  .album-grid::before {
    display: none;
  }
}
</style>
