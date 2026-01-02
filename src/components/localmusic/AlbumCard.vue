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
        <span class="icon">💿</span>
      </div>
      <div class="play-overlay">
        <div class="play-button"></div>
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  padding: 12px;
  background-color: var(--color-background, #ffffff);
  position: relative;
  overflow: hidden;
  animation: cardSlideIn 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
  transform: translateY(-2px) scale(0.98);
}

.album-card:active::before {
  opacity: 1;
}

.album-card:hover {
  transform: translateY(-5px);
  background-color: var(--color-background-soft, #f8f8f8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 激活状态 */
.album-card.card-active {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  animation: pulseHighlight 2s ease-in-out infinite;
}

@keyframes pulseHighlight {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(24, 144, 255, 0);
  }
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
  transform: translateY(-2px);
  animation: subtleBounce 1.5s ease-in-out infinite;
}

@keyframes subtleBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
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
  animation: recordSpin 6s linear infinite;
}

@keyframes recordSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.album-card:hover .cover-placeholder .icon {
  transform: scale(1.05);
  animation: recordSpin 4s linear infinite, pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  animation: imageLoadIn 0.6s ease-out;
}

@keyframes imageLoadIn {
  from {
    opacity: 0;
    filter: blur(5px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

.album-card:hover .cover-img {
  transform: scale(1.05);
  animation: recordSpinSlow 10s linear infinite;
}

@keyframes recordSpinSlow {
  from {
    transform: scale(1.05) rotate(0deg);
  }
  to {
    transform: scale(1.05) rotate(360deg);
  }
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
  transition: all 0.3s ease;
  padding: 8px;
  transform: translateY(8px);
}

.album-card:hover .play-overlay {
  opacity: 1;
  transform: translateY(0);
  animation: fadeInOverlay 0.4s ease-out;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%);
  }
  to {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%);
  }
}

.play-button {
  width: 32px;
  height: 32px;
  background-color: #409eff; /* Element Plus primary color */
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transform: scale(0.9);
  animation: buttonPop 0.3s ease-out;
}

@keyframes buttonPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(0.9);
    opacity: 1;
  }
}

.play-button::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 0 6px 10px;
  border-color: transparent transparent transparent white;
  transition: transform 0.2s ease;
}

.album-card:hover .play-button {
  transform: scale(1);
  animation: bounceIn 0.4s ease;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.play-button:hover {
  transform: scale(1.1) !important;
  background-color: #66b1ff; /* Element Plus hover color */
  animation: pulseButton 1s ease-in-out infinite;
}

@keyframes pulseButton {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
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
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(-5px);
  animation: badgeSlideIn 0.5s ease-out 0.2s forwards;
}

@keyframes badgeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.album-card:hover .album-badge {
  opacity: 1;
  transform: translateY(0);
  background-color: rgba(64, 158, 255, 0.8); /* Element Plus primary color with transparency */
}

.info {
  padding: 4px 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  animation: infoFadeIn 0.5s ease-out 0.3s forwards;
  opacity: 0;
}

@keyframes infoFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.album-card:hover .info {
  transform: translateY(-2px);
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
  animation: textHighlight 0.3s ease;
}

@keyframes textHighlight {
  0% {
    color: var(--color-text, #303133);
  }
  50% {
    color: #409eff;
    transform: scale(1.02);
  }
  100% {
    color: #409eff;
  }
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

  .play-button {
    transform: scale(0.9);
    opacity: 0.8;
  }

  .album-card:active .play-button {
    transform: scale(0.85);
  }

  .album-badge {
    opacity: 1;
    transform: none;
  }

  /* 触摸时的动画优化 */
  .album-card:active {
    animation: touchFeedback 0.2s ease-out;
  }

  @keyframes touchFeedback {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
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

  .play-button::after {
    border-width: 7px 0 7px 12px;
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

  .play-button::after {
    border-width: 8px 0 8px 14px;
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

  .play-button::after {
    border-width: 9px 0 9px 16px;
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
