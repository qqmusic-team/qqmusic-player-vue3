<template>
  <div class="player-bar">
    <!-- 左侧：歌曲信息 -->
    <div class="song-info">
      <div class="cover-wrapper">
        <img
          :src="displaySongInfo.cover || 'https://via.placeholder.com/64x64'"
          alt="歌曲封面"
          class="song-cover"
        />
      </div>
      <div class="song-details">
        <div class="song-name">{{ displaySongInfo.name }}</div>
        <div class="song-artist">{{ displaySongInfo.artist }} - {{ displaySongInfo.album }}</div>
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
          <svg
            title="循环播放"
            v-if="loopType === 0"
            t="1766984316091"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1455"
            width="40"
            height="40"
          >
            <path
              d="M361.5 727.8c-119.1 0-215.9-96.9-215.9-215.9 0-119.1 96.9-215.9 215.9-215.9 2.3 0 4.6-0.2 6.8-0.6v58.3c0 12.3 14 19.4 23.9 12.1l132.6-97.6c8.1-6 8.1-18.2 0-24.2l-132.6-97.6c-9.9-7.3-23.9-0.2-23.9 12.1v58.1c-2.2-0.4-4.5-0.6-6.8-0.6-39.8 0-78.5 7.9-115 23.4-35.2 15-66.8 36.3-94 63.5s-48.6 58.8-63.5 94c-15.5 36.5-23.4 75.2-23.4 115s7.9 78.5 23.4 115c15 35.2 36.3 66.8 63.5 94s58.8 48.6 94 63.5c36.5 15.5 75.2 23.4 115 23.4 22.1 0 40-17.9 40-40s-17.9-40-40-40zM938.2 396.9c-15-35.2-36.3-66.8-63.5-94s-58.8-48.6-94-63.5c-36.5-15.5-75.2-23.4-115-23.4-22.1 0-40 17.9-40 40s17.9 40 40 40c119.1 0 215.9 96.9 215.9 215.9 0 119.1-96.9 215.9-215.9 215.9-4.1 0-8.1 0.6-11.8 1.8v-60.8c0-12.3-14-19.4-23.9-12.1l-132.6 97.6c-8.1 6-8.1 18.2 0 24.2L629.9 876c9.9 7.3 23.9 0.2 23.9-12.1V806c3.7 1.2 7.7 1.8 11.8 1.8 39.8 0 78.5-7.9 115-23.4 35.2-15 66.8-36.3 94-63.5s48.6-58.8 63.5-94c15.5-36.5 23.4-75.2 23.4-115s-7.8-78.5-23.3-115z"
              p-id="1456"
            ></path>
          </svg>
          <svg
            v-else-if="loopType === 1"
            title="随机播放"
            t="1766984564602"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1768"
            width="40"
            height="40"
          >
            <path
              d="M914.2 705L796.4 596.8c-8.7-8-22.7-1.8-22.7 10V688c-69.5-1.8-134-39.7-169.3-99.8l-45.1-77 47-80.2c34.9-59.6 98.6-97.4 167.4-99.8v60.1c0 11.8 14 17.9 22.7 10l117.8-108.1c5.8-5.4 5.8-14.6 0-19.9L796.4 165c-8.7-8-22.7-1.8-22.7 10v76H758c-4.7 0-9.3 0.8-13.5 2.3-36.5 4.7-72 16.6-104.1 35-42.6 24.4-78.3 59.8-103.1 102.2L513 432l-24.3-41.5c-24.8-42.4-60.5-77.7-103.1-102.2C343 263.9 294.5 251 245.3 251H105c-22.1 0-40 17.9-40 40s17.9 40 40 40h140.3c71.4 0 138.3 38.3 174.4 99.9l47 80.2-45.1 77c-36.2 61.7-103 99.9-174.4 99.9H105c-22.1 0-40 17.9-40 40s17.9 40 40 40l142 0.1h0.2c49.1 0 97.6-12.9 140.2-37.3 42.7-24.4 78.3-59.8 103.2-102.2l22.4-38.3 22.4 38.3c24.8 42.4 60.5 77.8 103.2 102.2 33.1 18.9 69.6 30.9 107.3 35.4 3.8 1.2 7.8 1.8 11.9 1.8l15.9 0.1v55c0 11.8 14 17.9 22.7 10L914.2 725c5.9-5.5 5.9-14.7 0-20z"
              p-id="1769"
            ></path>
          </svg>
          <svg
            v-else
            title="单曲循环"
            t="1766984509534"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1611"
            width="40"
            height="40"
          >
            <path
              d="M361.5 727.8c-119.1 0-215.9-96.9-215.9-215.9 0-119.1 96.9-215.9 215.9-215.9 2.3 0 4.6-0.2 6.8-0.6v58.3c0 12.3 14 19.4 23.9 12.1l132.6-97.6c8.1-6 8.1-18.2 0-24.2l-132.6-97.6c-9.9-7.3-23.9-0.2-23.9 12.1v58.1c-2.2-0.4-4.5-0.6-6.8-0.6-39.8 0-78.5 7.9-115 23.4-35.2 15-66.8 36.3-94 63.5s-48.6 58.8-63.5 94c-15.5 36.5-23.4 75.2-23.4 115s7.9 78.5 23.4 115c15 35.2 36.3 66.8 63.5 94s58.8 48.6 94 63.5c36.5 15.5 75.2 23.4 115 23.4 22.1 0 40-17.9 40-40s-17.9-40-40-40zM938.2 396.9c-15-35.2-36.3-66.8-63.5-94s-58.8-48.6-94-63.5c-36.5-15.5-75.2-23.4-115-23.4-22.1 0-40 17.9-40 40s17.9 40 40 40c119.1 0 215.9 96.9 215.9 215.9 0 119.1-96.9 215.9-215.9 215.9-4.1 0-8.1 0.6-11.8 1.8v-60.8c0-12.3-14-19.4-23.9-12.1l-132.6 97.6c-8.1 6-8.1 18.2 0 24.2L629.9 876c9.9 7.3 23.9 0.2 23.9-12.1V806c3.7 1.2 7.7 1.8 11.8 1.8 39.8 0 78.5-7.9 115-23.4 35.2-15 66.8-36.3 94-63.5s48.6-58.8 63.5-94c15.5-36.5 23.4-75.2 23.4-115s-7.8-78.5-23.3-115z"
              p-id="1612"
            ></path>
            <path
              d="M512.8 660.6c22.1-0.1 39.9-18.1 39.8-40.2l-1.2-214.1c-0.1-22-18-39.8-40-39.8h-0.2c-22.1 0.1-39.9 18.1-39.8 40.2l1.2 214.1c0.1 22 18 39.8 40 39.8h0.2z"
              p-id="1613"
            ></path>
          </svg>
        </button>
        <button @click="playPrev" class="control-btn">
          <svg
            t="1766983997030"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1141"
            width="40"
            height="40"
          >
            <path
              d="M928 335.1c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1-55.3-23.4-114-35.2-174.5-35.2S395.7 73.1 340.4 96.5c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.2 174.5c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5S951.3 390.4 928 335.1zM514.9 877.9c-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3 203.1 0 368.3 165.2 368.3 368.3 0 203-165.2 368.3-368.3 368.3z"
              p-id="1142"
            ></path>
            <path
              d="M685.9 339.9c-12.4-7.1-27.6-7.1-40 0l-233.8 135c-3.1 1.8-5.8 3.9-8.3 6.4V356.6c0-22.1-17.9-40-40-40s-40 17.9-40 40v306c0 22.1 17.9 40 40 40s40-17.9 40-40V537.9c2.4 2.4 5.2 4.6 8.3 6.4l233.8 135c6.2 3.6 13.1 5.4 20 5.4s13.8-1.8 20-5.4c12.4-7.1 20-20.3 20-34.6v-270c0-14.4-7.6-27.6-20-34.8z m-60 235.4l-113.8-65.7 113.8-65.7v131.4z"
              p-id="1143"
            ></path>
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
            t="1766984122416"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1298"
            width="40"
            height="40"
          >
            <path
              d="M101.9 684.1c22.6 53.4 54.9 101.3 96.1 142.5 41.2 41.2 89.1 73.5 142.5 96.1 55.3 23.4 114 35.2 174.5 35.2s119.2-11.9 174.5-35.2c53.4-22.6 101.3-54.9 142.5-96.1 41.2-41.2 73.5-89.1 96.1-142.5 23.4-55.3 35.2-114 35.2-174.5s-11.9-119.2-35.2-174.5c-22.6-53.4-54.9-101.3-96.1-142.5-41.2-41.2-89.1-73.5-142.5-96.1-55.3-23.4-114-35.2-174.5-35.2S395.7 73.1 340.4 96.5c-53.4 22.6-101.3 54.9-142.5 96.1-41.2 41.2-73.5 89.1-96.1 142.5-23.4 55.3-35.2 114-35.2 174.5s11.9 119.2 35.3 174.5z m413-542.8c203.1 0 368.3 165.2 368.3 368.3 0 203.1-165.2 368.3-368.3 368.3-203.1 0-368.3-165.2-368.3-368.3 0-203.1 165.2-368.3 368.3-368.3z"
              p-id="1299"
            ></path>
            <path
              d="M343.9 679.2c12.4 7.1 27.6 7.1 40 0l233.8-135c3.1-1.8 5.8-3.9 8.3-6.4v124.7c0 22.1 17.9 40 40 40s40-17.9 40-40v-306c0-22.1-17.9-40-40-40s-40 17.9-40 40v124.7c-2.4-2.4-5.2-4.6-8.3-6.4l-233.8-135c-6.2-3.6-13.1-5.4-20-5.4s-13.8 1.8-20 5.4c-12.4 7.1-20 20.3-20 34.6v270c0 14.4 7.6 27.7 20 34.8z m60-235.3l113.8 65.7-113.8 65.7V443.9z"
              p-id="1300"
            ></path>
          </svg>
        </button>
        <button @click="togglePlayList" class="control-btn">
          <svg
            t="1766984632128"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1920"
            width="25"
            height="25"
          >
            <path
              d="M133 181.9h753c22.1 0 40-17.9 40-40s-17.9-40-40-40H133c-22.1 0-40 17.9-40 40s17.9 40 40 40zM886 473.2H133c-22.1 0-40 17.9-40 40s17.9 40 40 40h753c22.1 0 40-17.9 40-40s-17.9-40-40-40zM572 846.6H133c-22.1 0-40 17.9-40 40s17.9 40 40 40h439c22.1 0 40-17.9 40-40s-17.9-40-40-40zM905.6 724.7L679.8 594.4c-12.4-7.1-27.6-7.1-40 0-12.4 7.1-20 20.3-20 34.6v260.8c0 14.3 7.6 27.5 20 34.6 6.2 3.6 13.1 5.4 20 5.4s13.8-1.8 20-5.4L905.6 794c12.4-7.1 20-20.3 20-34.6s-7.6-27.5-20-34.7z m-205.8 95.8V698.3l105.8 61.1-105.8 61.1z"
              p-id="1921"
            ></path>
          </svg>
        </button>
      </div>

      <!-- 进度条控制 -->
      <div class="progress-container">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar-wrapper" @click="handleProgressClick" ref="progressBarWrapper">
          <div class="progress-bar">
            <div
              class="progress-thumb"
              @mousedown="handleThumbMouseDown"
              :class="{ dragging: isDragging }"
            ></div>
          </div>
        </div>
        <span class="total-time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 右侧：音量控制 -->
    <div class="volume-controls">
      <!--显示评论，暂时不实现具体功能-->
      <button @click="showComments" class="action-btn-large">
        <svg
          t="1766984924205"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2074"
          width="33"
          height="33"
        >
          <path
            d="M238.764926 448.999557a61.4 61.4 0 1 0 119.513264-28.220906 61.4 61.4 0 1 0-119.513264 28.220906Z"
            p-id="2075"
          ></path>
          <path
            d="M457.762316 448.989146a61.4 61.4 0 1 0 119.513264-28.220906 61.4 61.4 0 1 0-119.513264 28.220906Z"
            p-id="2076"
          ></path>
          <path
            d="M667.058581 448.969083a61.4 61.4 0 1 0 119.513265-28.220906 61.4 61.4 0 1 0-119.513265 28.220906Z"
            p-id="2077"
          ></path>
          <path
            d="M919.7 83.6h-814c-22.1 0-40 17.9-40 40v603c0 22.1 17.9 40 40 40h257.1L478 920.2c7.5 10 19.3 16 31.9 16h0.1c12.5 0 24.3-5.8 31.9-15.8l116.8-153.8h261c22.1 0 40-17.9 40-40v-603c0-22.1-17.9-40-40-40z m-40 603H638.8c-12.5 0-24.3 5.9-31.9 15.8l-96.7 127.4-95.5-127.2c-7.6-10.1-19.4-16-32-16h-237v-523h734v523z"
            p-id="2078"
          ></path>
        </svg>
      </button>
      <!--分享歌曲按钮，暂时不实现具体功能-->
      <button @click="shareSong" class="action-btn-large">
        <svg
          t="1766985005428"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="6325"
          width="33"
          height="33"
        >
          <path
            d="M826.48 660.9c-60.456 0-109.88 32.358-132.9 82.596L401.373 619.203c17.045-26.404 26.41-58.768 26.41-93.666 0-14.459-1.706-28.943-5.12-42.573l186.572-144.752c24.72 18.729 56.253 29.798 91.177 29.798 84.347 0 147.38-63.012 147.38-146.432 0-83.45-63.054-146.462-147.38-146.462-84.352 0-146.535 63.011-146.535 146.462 0 21.29 4.265 40.868 11.07 57.892L392.837 411.433c-34.068-51.087-90.301-86.856-154.194-86.856-104.192-0.26-188.866 83.989-189.122 188.18a23.803 23.803 0 0 0 0 0.856c-0.2 104.192 84.106 188.815 188.298 189.015h0.83c39.188 0 75.811-10.194 105.635-28.928l335.683 143.032c4.27 79.176 65.602 137.923 146.509 137.923 84.372 0 146.554-62.992 146.554-146.437s-63.058-147.313-146.529-147.313h-0.02z"
            p-id="6326"
          ></path>
        </svg>
      </button>
      <div class="volume-wrapper">
        <!-- 音量控制按钮 -->
        <button @click="toggleMute" class="action-btn-large">
          <svg
            v-if="volume > 0"
            t="1766985266600"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1220"
            width="40"
            height="40"
          >
            <path
              d="M632.217815 5.11991a63.99888 63.99888 0 0 0-69.75878 13.439765L325.663179 255.99552H159.90608a63.99888 63.99888 0 0 0-63.99888 63.99888v383.99328a63.99888 63.99888 0 0 0 63.99888 63.99888h165.757099l236.795856 237.435845A63.99888 63.99888 0 0 0 607.89824 1023.98208a53.759059 53.759059 0 0 0 24.319575-5.11991A63.99888 63.99888 0 0 0 671.89712 959.9832V63.99888a63.99888 63.99888 0 0 0-39.679305-58.87897zM287.90384 639.9888H223.90496V383.99328h63.99888z m255.99552 165.757099l-127.99776-127.99776V346.233941l127.99776-127.99776zM847.89404 277.11515a63.99888 63.99888 0 0 0-95.99832 85.7585A218.236181 218.236181 0 0 1 799.89488 511.99104a221.436125 221.436125 0 0 1-47.359171 149.117391 63.99888 63.99888 0 0 0 4.479922 90.23842A63.99888 63.99888 0 0 0 799.89488 767.98656a63.99888 63.99888 0 0 0 47.359171-21.11963A349.433885 349.433885 0 0 0 927.89264 511.99104a353.273818 353.273818 0 0 0-79.9986-234.87589z"
              fill="#383B48"
              p-id="1221"
            ></path>
          </svg>
          <svg
            v-else
            t="1766985165225"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1070"
            width="40"
            height="40"
          >
            <path
              d="M536.310615 5.11991a63.99888 63.99888 0 0 0-69.75878 13.439765L229.755979 255.99552H63.99888a63.99888 63.99888 0 0 0-63.99888 63.99888v383.99328a63.99888 63.99888 0 0 0 63.99888 63.99888h165.757099l236.795856 237.435845A63.99888 63.99888 0 0 0 511.99104 1023.98208a53.759059 53.759059 0 0 0 24.319575-5.11991A63.99888 63.99888 0 0 0 575.98992 959.9832V63.99888a63.99888 63.99888 0 0 0-39.679305-58.87897zM191.99664 639.9888H127.99776V383.99328h63.99888z m255.99552 165.757099l-127.99776-127.99776V346.233941l127.99776-127.99776zM914.543995 511.99104l90.87841-90.238421a63.99888 63.99888 0 1 0-90.87841-90.878409l-90.23842 90.878409-90.238421-90.878409a63.99888 63.99888 0 0 0-90.87841 90.878409L734.067154 511.99104l-90.87841 90.238421a63.99888 63.99888 0 0 0 90.87841 90.87841l90.238421-90.87841 90.23842 90.87841a63.99888 63.99888 0 1 0 90.87841-90.87841z"
              fill="#383B48"
              p-id="1071"
            ></path>
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
          @click="playSongFromList(song)"
        >
          <div class="song-info-item">
            <span class="song-index">{{ index + 1 }}</span>
            <div class="song-details-item">
              <div class="song-name-item">{{ formatSongInfo(song).name }}</div>
              <div class="song-artist-item">
                {{ formatSongInfo(song).artist }} - {{ formatSongInfo(song).album }}
              </div>
            </div>
          </div>
          <div class="song-duration">
            {{
              formatSongInfo(song).duration ? formatTime(formatSongInfo(song).duration) : "00:00"
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { usePlayerStore } from "@/stores/player";
import { storeToRefs } from "pinia";

const playerStore = usePlayerStore();

const { isPlaying, currentTime, duration, volume, loopType, playList, showPlayList, song, ended } =
  storeToRefs(playerStore);

const { togglePlay, next, prev, toggleLoop, setVolume, playEnd: handlePlayEnd } = playerStore;

const currentSong = computed(
  () => song.value || { id: 0, name: "", artist: "", album: "", cover: "" }
);

const displaySongInfo = computed(() => {
  const s = song.value;
  if (!s) {
    return { name: "", artist: "", album: "", cover: "" };
  }

  if (s.artist !== undefined) {
    return {
      name: s.name,
      artist: s.artist,
      album: s.album,
      cover: s.cover,
    };
  } else {
    return {
      name: s.name,
      artist: s.ar?.map((a) => a.name).join(", ") || "",
      album: s.al?.name || "",
      cover: s.al?.picUrl || "",
    };
  }
});

const formatSongInfo = (s) => {
  if (!s) {
    return { name: "", artist: "", album: "", duration: 0 };
  }

  if (s.artist !== undefined) {
    return {
      name: s.name,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
    };
  } else {
    return {
      name: s.name,
      artist: s.ar?.map((a) => a.name).join(", ") || "",
      album: s.al?.name || "",
      duration: s.dt,
    };
  }
};

const playSongFromList = (song) => {
  if (song.artist !== undefined) {
    playerStore.playLocalSong(song);
  } else {
    playerStore.play(song.id);
  }
};
const progress = computed(() => {
  if (duration.value > 0) {
    return (currentTime.value / duration.value) * 100;
  }
  return 0;
});

const showVolumeSlider = ref(false);
const isDragging = ref(false);
const progressBarWrapper = ref(null);

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const handleProgressClick = (e) => {
  if (isDragging.value) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;
  // 使用playerStore的onSliderChange方法更新播放时间
  playerStore.onSliderChange(newTime);
};

const handleThumbMouseDown = (e) => {
  isDragging.value = true;
  e.preventDefault();

  const wrapper = e.currentTarget.parentElement.parentElement;
  const rect = wrapper.getBoundingClientRect();

  const handleMouseMove = (moveEvent) => {
    const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
    const newTime = percent * duration.value;
    // 使用onSliderInput来更新滑块位置，但不立即改变播放时间
    playerStore.sliderInput = true;
    // 直接更新currentTime以实时显示拖拽位置
    playerStore.currentTime = newTime;
    // 实时更新CSS自定义属性
    wrapper.style.setProperty("--progress-percent", `${percent * 100}%`);
  };

  const handleMouseUp = () => {
    isDragging.value = false;
    playerStore.sliderInput = false;
    // 拖拽结束后，使用onSliderChange更新实际播放时间
    playerStore.onSliderChange(playerStore.currentTime);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleVolumeChange = () => {
  setVolume(volume.value);
};
const toggleMute = () => {
  volume.value = volume.value === 0 ? 100 : 0;
  console.log("[播放器栏] 静音:", volume.value);
  handleVolumeChange();
};
const togglePlayMode = () => {
  toggleLoop();
};

const playNext = () => {
  next();
};

const playPrev = () => {
  prev();
};

const togglePlayList = () => {
  playerStore.showPlayList = !playerStore.showPlayList;
};

const toggleFavorite = () => {
  console.log("[播放器栏] 收藏当前歌曲:", currentSong.value.name);
};

const showComments = () => {
  console.log("[播放器栏] 打开评论");
};

const shareSong = () => {
  console.log("[播放器栏] 分享当前歌曲");
};

watch(ended, (endedValue) => {
  if (endedValue) {
    handlePlayEnd();
  }
});

watch(isPlaying, (newVal) => {
  console.log("[播放器栏] isPlaying 状态变化:", newVal);
});

watch(
  song,
  (newVal) => {
    console.log("[播放器栏] song 状态变化:", newVal);
  },
  { deep: true }
);

// 监听进度变化，更新CSS自定义属性以实现动态颜色过渡
watch(
  progress,
  (newProgress) => {
    if (progressBarWrapper.value) {
      progressBarWrapper.value.style.setProperty("--progress-percent", `${newProgress}%`);
    }
  },
  { immediate: true }
);

// 初始化播放器和启动定时器
let timer;
onMounted(() => {
  console.log("[播放器栏] 初始化播放器");
  playerStore.init();

  console.log("[播放器栏] 启动定时器更新播放进度");
  timer = setInterval(() => {
    playerStore.interval();
  }, 1000);
});

// 清理定时器
onUnmounted(() => {
  console.log("[播放器栏] 清理定时器");
  clearInterval(timer);
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

/* 确保按钮有足够的点击区域和清晰的视觉反馈 */
.control-btn,
.play-mode-btn,
.play-btn,
.action-btn-large {
  /* 确保按钮有足够的可点击区域 */
  min-width: 32px;
  min-height: 32px;
  /* 增加触摸目标大小，适用于移动设备 */
  touch-action: manipulation;
  /* 优化点击反馈 */
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover,
.play-mode-btn:hover,
.play-btn:hover,
.action-btn-large:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

.control-btn:active,
.play-mode-btn:active,
.play-btn:active,
.action-btn-large:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* 增大右侧功能按钮尺寸并优化样式 */
.action-btn-large {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #666;
  border-radius: 50%;
  font-size: 16px;
  flex-shrink: 0;
}

.action-btn-large:hover {
  background-color: #f0f0f0;
  color: #333;
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
  color: #666;
  padding: 4px;
}

.control-btn:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}

/* 播放模式按钮增强样式 */
.play-mode-btn {
  position: relative;
  width: 40px;
  height: 40px;
}

.play-mode-btn:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #26db75;
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

/* 进度条交互优化 */
.progress-bar-wrapper {
  flex: 1;
  height: 4px;
  background: linear-gradient(
    90deg,
    #000000 0%,
    #000000 var(--progress-percent, 0%),
    #e0e0e0 var(--progress-percent, 0%),
    #e0e0e0 100%
  );
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  /* 增加悬停区域大小 */
  padding: 5px 0;
  margin: -5px 0;
  transition: background 0.1s ease;
}

.progress-bar {
  height: 100%;
  width: 100%;
  background: transparent;
  position: relative;
}

.progress-bar-wrapper:hover {
  background: linear-gradient(
    90deg,
    #000000 0%,
    #000000 var(--progress-percent, 0%),
    #d0d0d0 var(--progress-percent, 0%),
    #d0d0d0 100%
  );
}

.progress-thumb {
  position: absolute;
  left: calc(var(--progress-percent, 0%) - 5px);
  top: 50%;
  transform: translateY(-50%) scale(1);
  width: 14px;
  height: 14px;
  background-color: black;
  border: 2px solid #000000;
  border-radius: 50%;
  opacity: 1;
  transition: opacity 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar-wrapper:hover .progress-thumb {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
}

.progress-thumb.dragging {
  opacity: 1 !important;
  transform: translateY(-50%) scale(1.3) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border-color: #c20c0c;
}

/* Remove the dragging class style for progress-bar since it's transparent now */

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

  /* 增强在小屏幕上的交互元素可点击性 */
  .control-btn,
  .play-mode-btn {
    min-width: 32px;
    min-height: 32px;
    /* 增大点击区域 */
  }
}
</style>
