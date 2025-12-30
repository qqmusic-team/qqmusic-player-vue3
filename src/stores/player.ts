import { defineStore, storeToRefs } from "pinia";
import { useDetail, useSongUrl } from "@/utils/api";
import { onMounted, onUnmounted, watch, ref, computed } from "vue";
import type { Song } from "@/models/song";
import type { SongUrl } from "@/models/song_url";

// 扩展 Song 接口以支持本地歌曲
interface LocalSong extends Song {
  blobUrl?: string;
  path?: string;
  artist?: string;
  album?: string;
  duration?: number;
  folder?: string;
  playCount?: number;
  addTime?: number;
}

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
  const currentBlobUrl = ref<string | null>(null); // 当前 Blob URL

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

    // 清理 Blob URL
    if (currentBlobUrl.value) {
      URL.revokeObjectURL(currentBlobUrl.value);
      currentBlobUrl.value = null;
    }

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

  const playLocalSong = (song: LocalSong) => {
    if (!song || !song.id) return;
    console.log("[Player Store] playLocalSong 被调用:", song.name, song.id);
    isPlaying.value = false;

    const songId = typeof song.id === "number" ? song.id : parseInt(song.id as string);
    console.log("[Player Store] 解析后的 songId:", songId, "当前 id.value:", id.value);

    // 检查是否是同一首歌且正在播放
    if (songId == id.value && isPlaying.value) {
      console.log("[Player Store] 同一首歌正在播放，暂停");
      isPlaying.value = false;
      audio.pause();
      return;
    }

    // 检查是否是同一首歌但暂停状态
    if (songId == id.value && !isPlaying.value) {
      console.log("[Player Store] 同一首歌暂停状态，继续播放");
      isPlaying.value = true;
      audio.play();
      return;
    }

    // 清理旧的 Blob URL
    if (currentBlobUrl.value) {
      URL.revokeObjectURL(currentBlobUrl.value);
      currentBlobUrl.value = null;
    }

    // 使用 blobUrl 播放
    const audioUrl = song.blobUrl || song.path;
    if (!audioUrl) {
      console.error("播放本地歌曲失败: 缺少音频 URL");
      isPlaying.value = false;
      return;
    }

    console.log("[Player Store] 设置音频源:", audioUrl);
    audio.src = audioUrl;
    currentBlobUrl.value = song.blobUrl || null;

    audio
      .play()
      .then(() => {
        console.log("[Player Store] 音频播放成功");
        isPlaying.value = true;
        songUrl.value = { url: audioUrl, id: songId } as SongUrl;
        url.value = audioUrl;
        id.value = songId;
        song.value = song;
        console.log(
          "[Player Store] 更新后的状态 - isPlaying:",
          isPlaying.value,
          "song:",
          song.value
        );
        pushPlayList(false, song);
      })
      .catch((error) => {
        console.error("播放本地歌曲失败:", error);
        isPlaying.value = false;

        // 清理失败的 Blob URL
        if (currentBlobUrl.value) {
          URL.revokeObjectURL(currentBlobUrl.value);
          currentBlobUrl.value = null;
        }
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
    playLocalSong,
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
