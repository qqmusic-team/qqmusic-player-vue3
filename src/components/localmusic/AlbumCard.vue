<template>
  <div
    class="album-card"
    :class="{ 'card-active': isActive }"
    @click="$emit('select', album.name)"
    :style="{ animationDelay: `${animationDelay}ms` }"
  >
    <div class="cover-wrapper">
      <img
        v-if="album.cover"
        :src="album.cover"
        class="cover-img"
        :alt="album.name"
        loading="lazy"
      />
      <div v-else class="cover-placeholder">
        <span class="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
              stroke="currentColor"
              stroke-width="1.4"
              opacity="0.9"
            />
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path d="M12 12h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
        </span>
      </div>
      <div class="play-overlay">
        <div class="play-button" aria-hidden="true">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 9L26 18L12 27V9Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div class="album-badge">
        <span class="badge-count">{{ album.count }}</span>
      </div>
    </div>

    <div class="info">
      <div class="name" :title="album.name">{{ album.name }}</div>
      <div class="artist" :title="album.artist">{{ album.artist }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  album: {
    type: Object,
    required: true,
    default: () => ({
      name: "",
      artist: "",
      cover: null,
      count: 0,
    }),
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  animationDelay: {
    type: Number,
    default: 0,
  },
});

defineEmits(["select", "mousedown", "mouseup", "mouseleave"]);
</script>

<style scoped>
.album-card {
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 12px;
  padding: 12px;
  background-color: var(--color-background, #ffffff);
  position: relative;
  overflow: hidden;
  opacity: 1;
}

.album-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(24, 144, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

/* 点击效果 */
.album-card:active {
  background-color: var(--color-background-soft, #f8f8f8);
}

.album-card:active::before {
  opacity: 1;
}

.album-card:hover {
  background-color: var(--color-background-soft, #f8f8f8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 激活状态 */
.album-card.card-active {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.cover-wrapper {
  width: 100%;
  aspect-ratio: var(--aspect-ratio-square);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;
  background-color: #f0f0f0;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  transform-origin: center;
}

.album-card:hover .cover-wrapper {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder .icon {
  font-size: 36px;
  opacity: 0.6;
  transition: transform 0.3s ease;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder .icon svg {
  width: 1em;
  height: 1em;
}

.album-card:hover .cover-placeholder .icon {
  transform: none;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: none;
}

.album-card:hover .cover-img {
  transform: none;
}

/* 悬停时的播放遮罩 */
.play-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 8px;
}

.album-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 32px;
  height: 32px;
  background-color: #409eff; /* Element Plus primary color */
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.play-button svg {
  width: 18px;
  height: 18px;
  color: #fff;
}

.album-card:hover .play-button {
  transform: none;
}

.play-button:hover {
  background-color: #66b1ff; /* Element Plus hover color */
}

.album-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 9px;
  padding: 3px 6px;
  border-radius: 10px;
  opacity: 1;
}

.album-card:hover .album-badge {
  background-color: rgba(64, 158, 255, 0.8); /* Element Plus primary color with transparency */
}

.info {
  padding: 4px 0;
  opacity: 1;
}

.info .name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text, #303133);
  transition: color 0.2s ease;
}

.album-card:hover .info .name {
  color: #409eff; /* Element Plus link color */
}

.info .artist {
  font-size: 11px;
  color: #606266; /* Element Plus text secondary color */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.album-card:hover .info .artist {
  color: #909399; /* Element Plus text placeholder color */
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .album-card:hover {
    transform: none;
    background-color: var(--color-background, #ffffff);
  }

  .album-card:hover .cover-img,
  .album-card:hover .cover-placeholder .icon,
  .album-card:hover .info,
  .album-card:hover .cover-wrapper {
    transform: none;
    animation: none;
  }

  .play-overlay {
    opacity: 1;
    transform: none;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 100%);
  }

  .album-badge {
    opacity: 1;
    transform: none;
  }
}

/* 平板设备 */
@media (min-width: var(--breakpoint-sm)) {
  .cover-wrapper {
    margin-bottom: 12px;
  }

  .cover-placeholder .icon {
    font-size: 44px;
  }

  .play-button {
    width: 36px;
    height: 36px;
  }

  .play-button svg {
    width: 20px;
    height: 20px;
  }

  .info .name {
    font-size: var(--font-size-small, 14px);
    margin-bottom: 5px;
  }

  .info .artist {
    font-size: 12px;
  }
}

/* 桌面设备 */
@media (min-width: var(--breakpoint-md)) {
  .cover-placeholder .icon {
    font-size: 48px;
  }

  .play-button {
    width: 40px;
    height: 40px;
  }

  .play-button svg {
    width: 22px;
    height: 22px;
  }

  .play-overlay {
    padding: 12px;
  }
}

/* 大屏幕设备 */
@media (min-width: var(--breakpoint-xl)) {
  .cover-placeholder .icon {
    font-size: 56px;
  }

  .play-button {
    width: 44px;
    height: 44px;
  }

  .play-button svg {
    width: 24px;
    height: 24px;
  }

  .info .name {
    font-size: var(--font-size-normal, 15px);
  }

  .info .artist {
    font-size: 13px;
  }
}

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
