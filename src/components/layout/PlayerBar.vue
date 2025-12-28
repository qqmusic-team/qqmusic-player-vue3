<template>
  <div class="player-bar">
    <!-- 左侧：歌曲信息 -->
    <div class="song-info">
      <div class="cover-wrapper">
        <img
          :src="currentSong.cover || 'https://via.placeholder.com/64x64'"
          alt="歌曲封面"
          class="song-cover"
        />
      </div>
      <div class="song-details">
        <div class="song-name">{{ currentSong.name }}</div>
        <div class="song-artist">{{ currentSong.artist }} - {{ currentSong.album }}</div>
      </div>
      <div class="song-actions">
        <button @click="toggleFavorite" class="action-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 16.5L2.7 12.15C1.7 11.55 1.2 10.35 1.5 9.15C1.8 7.95 3 7.35 4.2 7.8L9 10.8L13.8 7.8C15 7.35 16.2 7.95 16.5 9.15C16.8 10.35 16.3 11.55 15.3 12.15L9 16.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 中间：播放控制 -->
    <div class="player-controls">
      <div class="controls-group">
        <button @click="togglePlayMode" class="control-btn play-mode-btn">
          <!-- 循环播放图标 -->
          <!-- <svg

            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            title="循环播放"
          >
            <path
              d="M7 7V4C7 2.89543 7.89543 2 9 2H16C17.1046 2 18 2.89543 18 4V8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8V5M7 7H11C12.1046 7 13 7.89543 13 9V16C13 17.1046 12.1046 18 11 18H7C5.89543 18 5 17.1046 5 16V9C5 7.89543 5.89543 7 7 7Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg> -->
          <svg
            v-if="playMode === 'sequence'"
            t="1766927985971"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="5418"
            width="24"
            height="24"
            title="循环播放"
          >
            <path
              d="M861.742545 520.005818c13.963636 0 25.460364 10.146909 27.648 23.458909l0.372364 4.514909v77.730909a183.435636 183.435636 0 0 1-174.033454 183.20291l-9.448728 0.279272H229.981091l90.437818 90.437818a28.439273 28.439273 0 0 1 3.258182 36.305455l-3.258182 3.909818a28.439273 28.439273 0 0 1-36.305454 3.258182l-3.909819-3.258182-136.192-136.192a33.978182 33.978182 0 0 1-3.490909-44.218182l3.490909-4.049454 133.911273-133.911273a28.439273 28.439273 0 0 1 43.52 36.305455l-3.258182 3.909818-87.412363 87.365818-4.049455 4.142545h479.557818a127.441455 127.441455 0 0 0 127.255273-119.714909l0.232727-7.773091v-77.730909c0-15.453091 12.520727-27.973818 27.973818-27.973818z m-122.135272-438.923636l3.956363 3.258182L879.709091 220.532364a33.978182 33.978182 0 0 1 8.192 13.079272l0.651636 2.187637c2.606545 9.774545 0.791273 20.48-5.399272 28.951272l-3.444364 4.049455-133.911273 133.911273a28.439273 28.439273 0 0 1-43.52-36.305455l3.258182-3.909818 87.412364-87.365818 4.049454-4.189091-479.604363 0.046545a127.441455 127.441455 0 0 0-127.208728 119.714909l-0.232727 7.726546v77.730909a28.020364 28.020364 0 0 1-55.621818 4.561455l-0.372364-4.561455V398.429091a183.435636 183.435636 0 0 1 173.986909-183.202909l9.448728-0.232727h476.346181L703.301818 124.555636a28.439273 28.439273 0 0 1-3.304727-36.305454l3.258182-3.909818a28.439273 28.439273 0 0 1 36.305454-3.258182z"
              fill="#333333"
              p-id="5419"
            >
            </path>
          </svg>
          <svg v-else-if="playMode === 'random'" title="随机播放" t="1766928514145" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7295" width="24" height="24"><path d="M775.261091 145.408a14.848 14.848 0 0 1 16.151273 3.258182l131.816727 131.770182 1.675636 2.234181a10.333091 10.333091 0 0 1-1.675636 12.427637L791.412364 426.821818l-2.792728 2.187637a14.848 14.848 0 0 1-22.528-12.70691v-38.120727l0.325819-3.258182a16.896 16.896 0 0 1 4.654545-8.657454l43.380364-43.426909-3.258182-7.912728h-57.250909l-9.681455 0.186182c-121.995636 5.399273-214.388364 112.453818-214.016 252.369455 3.165091 176.174545-117.480727 307.944727-278.807273 307.944727H114.594909l-3.397818-0.325818a16.896 16.896 0 0 1-13.498182-16.570182v-21.550545l0.325818-3.397819a16.896 16.896 0 0 1 16.570182-13.498181h136.797091l9.914182-0.232728c121.576727-5.12 211.269818-104.168727 213.550545-240.546909v-11.729454l0.139637-11.543273c4.794182-168.448 124.741818-296.494545 278.900363-296.494545h56.180364l3.304727-7.959273-42.356363-42.356364-2.141091-2.606545a16.896 16.896 0 0 1-2.839273-9.402182V159.185455l0.418909-3.49091a14.848 14.848 0 0 1 8.750545-10.24z m-155.136 634.833455a16.896 16.896 0 0 1 14.056727 2.466909l4.189091 2.885818 6.935273 4.468363a209.268364 209.268364 0 0 0 108.683636 30.068364h93.696l3.397818 0.325818c7.68 1.582545 13.498182 8.378182 13.498182 16.570182v21.550546l-0.325818 3.397818a16.896 16.896 0 0 1-16.570182 13.498182h-93.742545l-13.032728-0.325819a263.912727 263.912727 0 0 1-152.855272-57.530181 13.265455 13.265455 0 0 1 2.094545-22.155637l26.530909-13.870545zM251.438545 259.537455l13.405091 0.325818a269.312 269.312 0 0 1 134.376728 42.356363l4.189091 2.792728a16.896 16.896 0 0 1 1.861818 26.251636l-16.290909 15.313455-3.072 2.280727-3.397819 1.489454a16.942545 16.942545 0 0 1-10.891636-0.279272l-3.397818-1.675637-5.399273-3.444363-5.585454-3.258182a216.948364 216.948364 0 0 0-105.797819-26.763637H114.641455L111.243636 314.647273a16.896 16.896 0 0 1-13.498181-16.570182V276.48l0.325818-3.444364a16.896 16.896 0 0 1 16.570182-13.498181h136.79709z" fill="#333333" p-id="7296"></path></svg>

         <svg v-else title="单曲循环" t="1766928891025" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10555" width="24" height="24"><path d="M526.378667 448h24.490666v213.248h-32.554666v-174.122667c-12.842667 12.245333-29.269333 21.205333-48.981334 26.88v-32.256c9.557333-2.389333 19.413333-6.570667 30.165334-12.544 10.752-6.570667 19.712-13.44 26.88-21.205333z" fill="#000000" p-id="10556"></path><path d="M746.666667 128v256l170.666666-128z" fill="#000000" p-id="10557"></path><path d="M901.333333 554.666667c0 156.117333-126.549333 282.666667-282.666666 282.666666H405.333333c-156.117333 0-282.666667-126.549333-282.666666-282.666666S249.216 272 405.333333 272h362.666667v-32H405.333333c-173.781333 0-314.666667 140.885333-314.666666 314.666667S231.552 869.333333 405.333333 869.333333h213.333334c173.781333 0 314.666667-140.885333 314.666666-314.666666h-32z" fill="#000000" p-id="10558"></path></svg>
        </button>
        <button @click="playPrev" class="control-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L12 12L18 18M6 6H9V18H6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button @click="togglePlay" class="play-btn">
          <svg
            v-if="isPlaying"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="11" y="7" width="5" height="22" rx="2" fill="currentColor" />
            <rect x="20" y="7" width="5" height="22" rx="2" fill="currentColor" />
          </svg>
          <svg
            v-else
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 9L26 18L12 27V9Z" fill="currentColor" />
          </svg>
        </button>
        <button @click="playNext" class="control-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L12 12L6 18M18 6H15V18H18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button @click="togglePlayList" class="control-btn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H16M4 18H12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- 进度条控制 -->
      <div class="progress-container">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar-wrapper">
          <div class="progress-bar" @click="handleProgressClick" :style="{ width: progress + '%' }">
            <div class="progress-thumb"></div>
          </div>
        </div>
        <span class="total-time">{{ formatTime(totalTime) }}</span>
      </div>
    </div>

    <!-- 右侧：音量控制 -->
    <div class="volume-controls">
      <button @click="showComments" class="action-btn-large">
        <svg t="1766930034886" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5432" width="28" height="28"><path d="M481.578667 968.832l-157.909334-158.293333H85.418667A85.290667 85.290667 0 0 1 0 725.12L0.426667 128.042667C0.426667 80.768 38.4 42.666667 85.845333 42.666667h852.778667c47.189333 0 85.418667 38.101333 85.376 85.418666l-0.426667 597.12c0 47.146667-38.229333 85.333333-85.376 85.333334h-237.781333l-158.549333 158.293333a42.624 42.624 0 0 1-60.288 0z m456.704-243.712L938.666667 128.042667s-852.906667-0.128-852.906667 0.042666c0 0-0.384 597.077333-0.298667 597.077334H341.333333c11.306667 0 22.186667 4.48 30.165334 12.501333l140.330666 140.629333 140.8-140.672a42.624 42.624 0 0 1 30.165334-12.458666h255.488zM277.333333 512a64 64 0 1 1 0-128 64 64 0 0 1 0 128z m234.666667 0a64 64 0 1 1 0-128 64 64 0 0 1 0 128z m234.666667 0a64 64 0 1 1 0-128 64 64 0 0 1 0 128z" fill="#3D3D3D" p-id="5433"></path></svg>
      </button>
      <button @click="shareSong" class="action-btn-large">
        <svg t="1766929895057" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9128" width="28" height="28"><path d="M978.359727 445.198908c-25.076263 0-45.546682 20.982179-44.52316 46.058442 0.51176 6.652886 0.51176 13.817533 0.51176 20.470419 0 240.527421-202.145386 434.9964-445.74337 422.202388-214.427637-11.25873-387.914437-184.74553-399.173167-399.173167-12.794012-243.597984 181.163207-445.74337 422.202388-445.74337 6.652886 0 13.817533 0 20.470419 0.511761 25.076263 1.023521 46.058442-18.935137 46.058443-44.523161 0-24.052742-18.935137-43.49964-42.98788-44.523161-25.588024-1.023521-52.199568-0.51176-78.811112 2.558802C209.695501 29.137645 15.226522 232.818313 0.897229 481.022141c-17.911616 307.056282 234.898056 560.377715 542.466099 541.954338 248.203828-14.841054 451.372735-208.798272 477.472519-455.978579 2.558802-26.611544 3.582323-52.711328 2.558802-78.811113-2.047042-24.052742-21.49394-42.98788-45.034922-42.987879z" p-id="9129"></path><path d="M1017.253523 194.948038l-89.046322 154.039901c-12.282251 21.49394-39.405556 28.658586-60.899496 16.376335-10.74697-6.141126-17.911616-15.864575-20.470418-27.123304-3.070563-11.25873-1.535281-23.029221 4.605844-33.776192l38.893796-67.552382c-335.714869 51.687808-347.99712 325.99142-347.99712 337.761911-0.51176 22.0057-18.935137 39.917317-40.940838 39.917317h-1.023521c-22.517461-0.51176-40.429077-19.446898-39.917317-41.964359 0-3.582323 2.558802-93.652166 57.828933-189.863135 48.617245-84.952238 147.387016-190.886656 346.461839-225.174607l-62.434777-35.823233c-21.49394-12.282251-28.658586-39.405556-16.376335-60.899496 6.141126-10.74697 15.864575-17.911616 27.123305-20.982179 11.25873-3.070563 23.029221-1.535281 33.776191 4.605844L1000.877188 133.536781c10.74697 6.141126 17.911616 15.864575 20.982179 27.123305 3.070563 11.25873 1.535281 23.540982-4.605844 34.287952z" p-id="9130"></path></svg>
      </button>
      <div class="volume-wrapper">
        <button @click="toggleMute" class="action-btn-large">
          <svg
            v-if="volume === 0 || isVolumeMuted"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18.5C13.0376 18.5 15.5 16.0376 15.5 13C15.5 9.96243 13.0376 7.5 10 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 11.5V14.5L4 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M21.5 3.5L2.5 22.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else-if="volume < 50"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18.5C13.0376 18.5 15.5 16.0376 15.5 13C15.5 9.96243 13.0376 7.5 10 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 11.5V14.5L4 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18.5C13.0376 18.5 15.5 16.0376 15.5 13C15.5 9.96243 13.0376 7.5 10 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 11.5V14.5L4 17.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18.5 8V16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.5 11V13"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div
          class="volume-slider-wrapper"
          @mouseenter="showVolumeSlider = true"
          @mouseleave="showVolumeSlider = false"
        >
          <div v-show="showVolumeSlider" class="volume-slider">
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="volume"
              @input="handleVolumeChange"
              class="volume-input"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 播放列表弹窗 -->
  <div v-if="showPlayList" class="playlist-overlay">
    <div class="playlist-container">
      <div class="playlist-header">
        <h3>播放列表</h3>
        <button @click="togglePlayList" class="close-btn">×</button>
      </div>
      <div class="playlist-content">
        <div
          v-for="(song, index) in playList"
          :key="song.id"
          class="playlist-item"
          :class="{ active: song.id === currentSong.id }"
        >
          <div class="song-info-item">
            <span class="song-index">{{ index + 1 }}</span>
            <div class="song-details-item">
              <div class="song-name-item">{{ song.name }}</div>
              <div class="song-artist-item">{{ song.artist }} - {{ song.album }}</div>
            </div>
          </div>
          <div class="song-duration">03:45</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

// 播放器状态管理
const isPlaying = ref(false);
const currentTime = ref(0);
const totalTime = ref(0);
const progress = ref(0);
const volume = ref(80);
const isVolumeMuted = ref(false);
const lastVolume = ref(80);
const playMode = ref("sequence"); // sequence循环, random随机, single单曲循环
const showVolumeSlider = ref(false);
const showPlayList = ref(false);

// 当前播放歌曲信息
const currentSong = ref({
  id: "1",
  name: "示例歌曲",
  artist: "歌手名称",
  album: "专辑名称",
  cover: "",
  url: "",
});

// 播放列表
const playList = ref([
  {
    id: "1",
    name: "示例歌曲",
    artist: "歌手名称",
    album: "专辑名称",
    cover: "",
    url: "",
  },
  {
    id: "2",
    name: "示例歌曲2",
    artist: "歌手名称2",
    album: "专辑名称2",
    cover: "",
    url: "",
  },
]);

// 音频元素引用
let audio = null;

// 时间格式化函数
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 播放控制方法
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (audio) {
    if (isPlaying.value) {
      audio.play();
    } else {
      audio.pause();
    }
  }
};

// 下一首
const playNext = () => {
  // 实现下一首逻辑
  console.log("播放下一首");
};

// 上一首
const playPrev = () => {
  // 实现上一首逻辑
  console.log("播放上一首");
};

// 进度条点击事件
const handleProgressClick = (e) => {
  if (!audio) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * totalTime.value;
  audio.currentTime = newTime;
  currentTime.value = newTime;
  progress.value = percent * 100;
};

// 音量控制
const toggleMute = () => {
  if (!audio) return;
  isVolumeMuted.value = !isVolumeMuted.value;
  if (isVolumeMuted.value) {
    lastVolume.value = volume.value;
    audio.volume = 0;
    volume.value = 0;
  } else {
    audio.volume = lastVolume.value / 100;
    volume.value = lastVolume.value;
  }
};

// 调整音量
const handleVolumeChange = () => {
  if (!audio) return;
  audio.volume = volume.value / 100;
  if (volume.value > 0 && isVolumeMuted.value) {
    isVolumeMuted.value = false;
  } else if (volume.value === 0) {
    isVolumeMuted.value = true;
  }
};

// 切换播放模式
const togglePlayMode = () => {
  const modes = ["sequence", "random", "single"];
  const currentIndex = modes.indexOf(playMode.value);
  playMode.value = modes[(currentIndex + 1) % modes.length];
};

// 切换播放列表显示
const togglePlayList = () => {
  showPlayList.value = !showPlayList.value;
};

// 收藏当前歌曲
const toggleFavorite = () => {
  console.log("切换收藏状态");
};

// 评论
const showComments = () => {
  console.log("显示评论");
};

// 分享
const shareSong = () => {
  console.log("分享歌曲");
};

// 初始化音频元素
const initAudio = () => {
  audio = new Audio();
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateTotalTime);
  audio.addEventListener("ended", handleSongEnd);
};

// 更新进度
const updateProgress = () => {
  if (!audio) return;
  currentTime.value = audio.currentTime;
  totalTime.value = audio.duration || 0;
  progress.value = totalTime.value > 0 ? (currentTime.value / totalTime.value) * 100 : 0;
};

// 更新总时长
const updateTotalTime = () => {
  if (!audio) return;
  totalTime.value = audio.duration || 0;
};

// 处理歌曲结束
const handleSongEnd = () => {
  if (playMode.value === "single") {
    audio.currentTime = 0;
    audio.play();
  } else {
    playNext();
  }
};

// 监听播放状态变化
watch(isPlaying, (newValue) => {
  if (audio) {
    if (newValue) {
      audio.play();
    } else {
      audio.pause();
    }
  }
});

// 监听音量变化
watch(volume, (newValue) => {
  if (audio) {
    audio.volume = newValue / 100;
  }
});

// 组件挂载时初始化
onMounted(() => {
  initAudio();
});

// 组件卸载时清理
onUnmounted(() => {
  if (audio) {
    audio.removeEventListener("timeupdate", updateProgress);
    audio.removeEventListener("loadedmetadata", updateTotalTime);
    audio.removeEventListener("ended", handleSongEnd);
    audio.pause();
    audio = null;
  }
});
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

/* 左侧：歌曲信息 */
.song-info {
  display: flex;
  align-items: center;
  flex: 0 0 250px;
  gap: 12px;
}

.cover-wrapper {
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.song-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.song-cover:hover {
  transform: scale(1.05);
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

/* 增大右侧功能按钮尺寸并优化样式 */
.action-btn-large {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 16px;
  flex-shrink: 0;
}

.action-btn-large:hover {
  background-color: #f0f0f0;
  color: #333;
  transform: scale(1.05);
}

.action-btn-large:active {
  transform: scale(0.95);
}

/* 中间：播放控制 */
.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.control-btn:hover {
  color: #333;
}

/* 播放模式按钮增强样式 */
.play-mode-btn {
  position: relative;
  width: 32px;
  height: 32px;
}

.play-mode-btn:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #c20c0c;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(194, 12, 12, 0.3);
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 12px rgba(194, 12, 12, 0.4);
}

/* 进度条控制 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 600px;
}

.current-time,
.total-time {
  font-size: 12px;
  color: #999;
  min-width: 40px;
  text-align: center;
}

.progress-bar-wrapper {
  flex: 1;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #c20c0c;
  position: relative;
  transition: width 0.1s ease;
}

.progress-bar-wrapper:hover .progress-bar {
  background-color: #e81010;
}

.progress-thumb {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  background-color: white;
  border: 2px solid #c20c0c;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.progress-bar-wrapper:hover .progress-thumb {
  opacity: 1;
}

/* 右侧：音量控制 */
.volume-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 260px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.volume-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider-wrapper {
  position: relative;
}

.volume-slider {
  position: absolute;
  bottom: 30px;
  right: -50px;
  width: 35px;
  height: 120px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.volume-input {
  transform: rotate(-90deg);
  width: 80px;
  cursor: pointer;
}

/* 播放列表弹窗 */
.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1001;
}

.playlist-container {
  width: 100%;
  max-width: 800px;
  max-height: 50vh;
  background-color: white;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.playlist-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.playlist-content {
  flex: 1;
  overflow-y: auto;
  max-height: 40vh;
}

.playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-bottom: 1px solid #f5f5f5;
}

.playlist-item:hover {
  background-color: #f9f9f9;
}

.playlist-item.active {
  background-color: #f0f0f0;
}

.song-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.song-index {
  font-size: 14px;
  color: #999;
  width: 20px;
  text-align: center;
}

.song-details-item {
  flex: 1;
  min-width: 0;
}

.song-name-item {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist-item {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 12px;
  color: #999;
  margin-left: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .player-bar {
    padding: 0 10px;
    height: 70px;
  }

  .song-info {
    flex: 0 0 180px;
    gap: 8px;
  }

  .cover-wrapper {
    width: 48px;
    height: 48px;
  }

  .volume-controls {
    flex: 0 0 auto;
    gap: 12px;
    padding-left: 8px;
    width: auto;
  }

  .action-btn-large {
    width: 28px;
    height: 28px;
  }

  .action-btn-large svg {
    width: 20px;
    height: 20px;
  }

  .volume-slider {
    display: none;
  }

  .song-details {
    display: none;
  }
}

@media (max-width: 480px) {
  .player-bar {
    padding: 0 8px;
    height: 64px;
  }

  .volume-controls {
    gap: 8px;
  }

  .action-btn-large {
    width: 32px;
    height: 32px;
  }

  .action-btn-large svg {
    width: 20px;
    height: 20px;
  }

  .play-mode-btn {
    width: 28px;
    height: 28px;
  }

  .play-mode-btn svg {
    width: 22px;
    height: 22px;
  }
}
</style>
