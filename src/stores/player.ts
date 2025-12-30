import { defineStore, storeToRefs } from "pinia";
import { useDetail, useSongUrl } from "@/utils/api";
import { onMounted, onUnmounted, watch, ref, computed } from "vue";
import type { Song } from "@/models/song";
import type { SongUrl } from "@/models/song_url";

const KEYS = {
  volume: "PLAYER-VOLUME",
};

export const usePlayerStore = defineStore("player", () => {
  // State
  const audio = new Audio();
  const loopType = ref(0); // 循环模式 0 单曲循环 1 列表循环 2随机播放
  const volume = ref(parseInt(localStorage.getItem(KEYS.volume) || "60")); // 音量
  const playList = ref<Song[]>([]); // 播放列表
  const showPlayList = ref(false);
  const id = ref(0);
  const url = ref("");
  const songUrl = ref<SongUrl>({} as SongUrl);
  const song = ref<Song>({} as Song);
  const isPlaying = ref(false); // 是否播放中
  const isPause = ref(false); // 是否暂停
  const sliderInput = ref(false); // 是否正在拖动进度条
  const ended = ref(false); // 是否播放结束
  const muted = ref(false); // 是否静音
  const currentTime = ref(0); // 当前播放时间
  const duration = ref(0); // 总播放时长

  // Getters
  const playListCount = computed(() => playList.value.length);
  const thisIndex = computed(() => playList.value.findIndex((song) => song.id === id.value));
  const nextSong = computed<Song>(() => {
    if (thisIndex.value === playListCount.value - 1) {
      return playList.value.first();
    } else {
      const nextIndex = thisIndex.value + 1;
      return playList.value[nextIndex];
    }
  });
  const prevSong = computed<Song>(() => {
    if (thisIndex.value === 0) {
      return playList.value.last();
    } else {
      const prevIndex = thisIndex.value - 1;
      return playList.value[prevIndex];
    }
  });

  // Actions
  const init = () => {
    audio.volume = volume.value / 100;
  };

  const pushPlayList = (replace: boolean, ...list: Song[]) => {
    if (replace) {
      playList.value = list;
      return;
    }
    list.forEach((song) => {
      if (playList.value.filter((s) => s.id == song.id).length <= 0) {
        playList.value.push(song);
      }
    });
  };

  // Method to set entire playlist (used by LocalMusicView)
  const setPlaylist = (list: Song[]) => {
    playList.value = list;
  };

  // Method to set current index (used by LocalMusicView)
  const setCurrentIndex = (index: number) => {
    if (index >= 0 && index < playList.value.length) {
      const song = playList.value[index];
      if (song) {
        play(song.id);
      }
    }
  };

  const clearPlayList = () => {
    songUrl.value = {} as SongUrl;
    url.value = "";
    id.value = 0;
    song.value = {} as Song;
    isPlaying.value = false;
    isPause.value = false;
    sliderInput.value = false;
    ended.value = false;
    muted.value = false;
    currentTime.value = 0;
    playList.value = [] as Song[];
    showPlayList.value = false;
    audio.load();
    setTimeout(() => {
      duration.value = 0;
    }, 500);
  };

  const play = async (songId: number) => {
    if (songId == id.value) return;
    isPlaying.value = false;
    const data = await useSongUrl(songId);
    audio.src = data.url;
    audio
      .play()
      .then(() => {
        isPlaying.value = true;
        songUrl.value = data;
        url.value = data.url;
        id.value = songId;
        songDetail();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const playEnd = () => {
    console.log("播放结束");
    switch (loopType.value) {
      case 0:
        rePlay();
        break;
      case 1:
        next();
        break;
      case 2:
        randomPlay();
        break;
    }
  };

  const songDetail = async () => {
    song.value = await useDetail(id.value);
    pushPlayList(false, song.value);
  };

  const rePlay = () => {
    setTimeout(() => {
      currentTime.value = 0;
      audio.play();
    }, 1500);
  };

  const next = () => {
    if (loopType.value === 2) {
      randomPlay();
    } else {
      play(nextSong.value.id);
    }
  };

  const prev = () => {
    play(prevSong.value.id);
  };

  const randomPlay = () => {
    play(playList.value.sample().id);
  };

  const togglePlay = () => {
    if (!song.value.id) return;
    isPlaying.value = !isPlaying.value;
    if (!isPlaying.value) {
      audio.pause();
      isPause.value = true;
    } else {
      audio.play();
      isPause.value = false;
    }
  };

  const setPlay = () => {
    if (!song.value.id) return;
    isPlaying.value = true;
    audio.play();
    isPause.value = false;
  };

  const setPause = () => {
    if (!song.value.id) return;
    isPlaying.value = false;
    audio.pause();
    isPause.value = true;
  };

  const toggleLoop = () => {
    if (loopType.value == 2) {
      loopType.value = 0;
    } else {
      loopType.value++;
    }
  };

  const toggleMuted = () => {
    muted.value = !muted.value;
    audio.muted = muted.value;
  };

  const setVolume = (n: number) => {
    n = n > 100 ? 100 : n;
    n = n < 0 ? 0 : n;
    volume.value = n;
    audio.volume = n / 100;
    localStorage.setItem("PLAYER-VOLUME", n.toString());
  };

  const onSliderChange = (val: number) => {
    currentTime.value = val;
    sliderInput.value = false;
    audio.currentTime = val;
  };

  const onSliderInput = () => {
    sliderInput.value = true;
  };

  const interval = () => {
    if (isPlaying.value && !sliderInput.value) {
      currentTime.value = parseInt(audio.currentTime.toString());
      duration.value = parseInt(audio.duration.toString());
      ended.value = audio.ended;
    }
  };

  return {
    // State
    loopType,
    volume,
    playList,
    showPlayList,
    id,
    url,
    songUrl,
    song,
    isPlaying,
    isPause,
    sliderInput,
    ended,
    muted,
    currentTime,
    duration,
    // Getters
    playListCount,
    thisIndex,
    nextSong,
    prevSong,
    // Actions
    init,
    pushPlayList,
    setPlaylist,
    setCurrentIndex,
    clearPlayList,
    play,
    playEnd,
    songDetail,
    rePlay,
    next,
    prev,
    randomPlay,
    togglePlay,
    setPlay,
    setPause,
    toggleLoop,
    toggleMuted,
    setVolume,
    onSliderChange,
    onSliderInput,
    interval,
  };
});

export const userPlayerInit = () => {
  let timer: number;
  const playerStore = usePlayerStore();
  const { init, interval, playEnd } = playerStore;
  const { ended } = storeToRefs(playerStore);

  // 监听播放结束
  watch(ended, (endedValue) => {
    if (!endedValue) return;
    playEnd();
  });

  // 启动定时器
  onMounted(() => {
    init();
    console.log("启动定时器");
    timer = setInterval(interval, 1000);
  });
  // 清除定时器
  onUnmounted(() => {
    console.log("清除定时器");
    clearInterval(timer);
  });
};
