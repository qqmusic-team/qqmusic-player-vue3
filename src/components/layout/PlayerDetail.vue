<template>
  <Teleport to="body">
    <Transition name="expand">
      <div v-if="visible" class="player-detail-overlay" @click.self="close">
        <div
          class="player-detail-window"
          :style="{ width: '800px', height: '600px' }"
          ref="windowRef"
        >
          <div class="glass-background" :style="{ backgroundImage: `url(${coverUrl})` }"></div>
          <div class="content-container">
            <div class="window-header" @mousedown="startDrag">
              <div class="close-btn" @click="close">×</div>
            </div>

            <div class="main-content">
              <div class="left-panel">
                <div class="album-cover">
                  <img :src="coverUrl" alt="Cover" />
                </div>
                <div class="song-info">
                  <h2>{{ songName }}</h2>
                  <p>歌手: {{ artist }}</p>
                  <p>专辑: {{ album }}</p>
                </div>
              </div>

              <div class="right-panel lyric-container">
                <ul class="lyric-list" :style="{ transform: `translateY(${lyricOffset}px)` }">
                  <li
                    v-for="(line, index) in lyrics"
                    :key="index"
                    :class="{ active: currentLineIndex === index }"
                    @click="seek(line.time)"
                  >
                    {{ line.text }}
                  </li>
                </ul>
                <div v-if="lyrics.length === 0" class="no-lyric">暂无歌词</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { usePlayerStore } from "@/stores/player";
import { storeToRefs } from "pinia";
import type { Song, SongAr } from "@/models/song";
import type { LocalSong } from "@/stores/player";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(["update:visible", "close"]);

const playerStore = usePlayerStore();
const { song, lyric, currentTime } = storeToRefs(playerStore);

const windowRef = ref<HTMLElement | null>(null);

let isDragging = false;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;

const isOnlineSong = (s: Song | LocalSong): s is Song => "ar" in s && "al" in s;

const startDrag = (e: MouseEvent) => {
  if (!windowRef.value) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  const rect = windowRef.value.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;

  windowRef.value.style.transition = "none";
  windowRef.value.style.transform = "none";
  windowRef.value.style.left = `${initialLeft}px`;
  windowRef.value.style.top = `${initialTop}px`;
  windowRef.value.style.position = "fixed";

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging || !windowRef.value) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  windowRef.value.style.left = `${initialLeft + dx}px`;
  windowRef.value.style.top = `${initialTop + dy}px`;
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

const coverUrl = computed(() => {
  if (isOnlineSong(song.value)) return song.value.al?.picUrl;
  return song.value.cover || "https://via.placeholder.com/300";
});

const songName = computed(() => song.value.name || "未知歌曲");
const artist = computed(() => {
  if (isOnlineSong(song.value)) return song.value.ar?.map((a: SongAr) => a.name).join("/");
  return song.value.artist || "未知歌手";
});
const album = computed(() => {
  if (isOnlineSong(song.value)) return song.value.al?.name;
  return song.value.album || "未知专辑";
});

const lyrics = computed(() => lyric.value);

const currentLineIndex = ref(0);
const lyricOffset = ref(0);
const LINE_HEIGHT = 40;

watch(currentTime, (newTime) => {
  if (!lyrics.value.length) return;

  let idx = lyrics.value.findIndex((l) => l.time > newTime) - 1;
  if (idx < 0) {
    if (newTime >= lyrics.value[lyrics.value.length - 1].time) {
      idx = lyrics.value.length - 1;
    } else {
      idx = 0;
    }
  }

  if (currentLineIndex.value !== idx) {
    currentLineIndex.value = idx;
    const containerHeight = 400;
    lyricOffset.value = containerHeight / 2 - idx * LINE_HEIGHT - LINE_HEIGHT / 2;
  }
});

const seek = (time: number) => {
  const audio = document.querySelector("audio");
  if (audio) audio.currentTime = time;
};

const close = () => {
  emit("close");
  emit("update:visible", false);
};
</script>

<style scoped>
.player-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-detail-window {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  background: #333;
  display: flex;
  flex-direction: column;
}

.glass-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.6);
  z-index: 0;
  transform: scale(1.2);
}

.content-container {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.window-header {
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  cursor: grab;
}

.window-header:active {
  cursor: grabbing;
}

.close-btn {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  cursor: pointer;
  line-height: 20px;
  padding: 5px;
  -webkit-app-region: no-drag;
}
.close-btn:hover {
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px 40px;
  gap: 40px;
  color: #fff;
}

.left-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.album-cover {
  width: 300px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info h2 {
  font-size: 24px;
  margin-bottom: 10px;
}
.song-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 5px 0;
}

.right-panel {
  flex: 1;
  height: 400px;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
}

.lyric-list {
  list-style: none;
  padding: 0;
  margin: 0;
  transition: transform 0.3s ease-out;
  text-align: center;
}

.lyric-list li {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
}

.lyric-list li:hover {
  color: rgba(255, 255, 255, 0.9);
}

.lyric-list li.active {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.no-lyric {
  text-align: center;
  margin-top: 150px;
  color: rgba(255, 255, 255, 0.5);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(50px);
}
</style>
