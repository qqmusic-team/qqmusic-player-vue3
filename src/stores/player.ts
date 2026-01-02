import { defineStore, storeToRefs } from "pinia";
import { useDetail, useSongUrl } from "@/utils/api";
import { onMounted, onUnmounted, watch, ref, computed } from "vue";
import type { Song } from "@/models/song";
import type { SongUrl } from "@/models/song_url";
import { ElMessage } from "element-plus";

// 扩展 Song 接口以支持本地歌曲
export interface LocalSong {
  id: number;
  name: string;
  artist?: string;
  album?: string;
  blobUrl?: string;
  path?: string;
  duration?: number;
  folder?: string;
  playCount?: number;
  addTime?: number;
  base64?: string;
  size?: number;
  cover?: string;
}

const KEYS = {
  volume: "PLAYER-VOLUME",
};

export const usePlayerStore = defineStore("player", () => {
  // State
  const audio = new Audio();
  const loopType = ref(0); // 循环模式 0 单曲循环 1 列表循环 2随机播放
  const volume = ref(parseInt(localStorage.getItem(KEYS.volume) || "60")); // 音量
  const playList = ref<(Song | LocalSong)[]>([]); // 播放列表
  const showPlayList = ref(false);
  const id = ref<string | number>(0); // 支持字符串和数字类型的ID
  const url = ref("");
  const songUrl = ref<SongUrl>({} as SongUrl);
  const song = ref<Song | LocalSong>({} as Song | LocalSong);
  const isPlaying = ref(false); // 是否播放中
  const isPause = ref(false); // 是否暂停
  const sliderInput = ref(false); // 是否正在拖动进度条
  const ended = ref(false); // 是否播放结束
  const muted = ref(false); // 是否静音
  const currentTime = ref(0); // 当前播放时间
  const duration = ref(0); // 总播放时长
  const currentBlobUrl = ref<string | null>(null); // 当前 Blob URL
  const songFiles = ref<Map<string | number, File>>(new Map()); // 存储 File 对象的 Map

  // Getters
  const playListCount = computed(() => playList.value.length);
  const thisIndex = computed(() => playList.value.findIndex((song) => song.id === id.value));
  const nextSong = computed<Song | LocalSong>(() => {
    if (thisIndex.value === playListCount.value - 1) {
      return playList.value.first();
    } else {
      const nextIndex = thisIndex.value + 1;
      return playList.value[nextIndex];
    }
  });
  const prevSong = computed<Song | LocalSong>(() => {
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

    audio.addEventListener("ended", () => {
      console.log("[播放器] 音频播放结束");
      ended.value = true;
    });

    audio.addEventListener("timeupdate", () => {
      if (!sliderInput.value) {
        currentTime.value = parseInt(audio.currentTime.toString());
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      console.log("[播放器] 音频元数据加载完成，时长:", audio.duration);
      duration.value = parseInt(audio.duration.toString());
    });

    audio.addEventListener("error", (e) => {
      console.error("[播放器] 音频播放错误:", e);
      isPlaying.value = false;
    });
  };

  const pushPlayList = (replace: boolean, ...list: (Song | LocalSong)[]) => {
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
  const setPlaylist = (list: (Song | LocalSong)[]) => {
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
    song.value = {} as Song | LocalSong;
    isPlaying.value = false;
    isPause.value = false;
    sliderInput.value = false;
    ended.value = false;
    muted.value = false;
    currentTime.value = 0;
    playList.value = [] as (Song | LocalSong)[];
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
    if (songId === id.value) return;
    isPlaying.value = false;
    const data = await useSongUrl(songId);
    audio.src = data.url;
    audio.load();
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

  const playLocalSong = (songItem: LocalSong) => {
    if (!songItem || !songItem.id) return;
    console.log("[播放器] playLocalSong 被调用:", songItem.name, songItem.id);

    const songId = songItem.id;
    console.log(
      "[播放器] songId 类型:",
      typeof songId,
      "值:",
      songId,
      "当前 id.value:",
      id.value,
      "当前 isPlaying:",
      isPlaying.value
    );

    // 检查是否是同一首歌且正在播放 - 切换为暂停
    if (songId === id.value && isPlaying.value) {
      console.log("[播放器] 同一首歌正在播放，切换为暂停");
      isPlaying.value = false;
      isPause.value = true;
      audio.pause();
      return;
    }

    // 检查是否是同一首歌但暂停状态 - 继续播放
    if (songId === id.value && !isPlaying.value) {
      console.log("[播放器] 同一首歌暂停状态，继续播放");
      isPlaying.value = true;
      isPause.value = false;
      audio.play().catch((error) => {
        console.error("[播放器] 播放失败:", error);
        isPlaying.value = false;
        isPause.value = true;
      });
      return;
    }

    // 播放新歌
    console.log("[播放器] 播放新歌");
    isPlaying.value = false;
    isPause.value = false;

    // 清理旧的 Blob URL
    if (currentBlobUrl.value) {
      URL.revokeObjectURL(currentBlobUrl.value);
      currentBlobUrl.value = null;
    }

    // 从 songFiles Map 中获取 File 对象创建 URL
    let audioUrl: string | undefined;
    const file = songFiles.value.get(songId);

    if (file) {
      audioUrl = URL.createObjectURL(file);
      console.log("[播放器] 从 File 对象创建 Blob URL:", audioUrl);
    } else {
      console.error("[播放器] songFiles Map 中未找到 ID:", songId);
      console.log("[播放器] songFiles Map 中的所有键:", Array.from(songFiles.value.keys()));
      console.log("[播放器] 传入的歌曲对象:", songItem);
      console.log(
        "[播放器] songFiles Map 中的所有值:",
        Array.from(songFiles.value.values()).map((f) => f.name)
      );

      // 尝试从 songItem 对象获取 base64 数据，如果存在则转换为 Blob URL
      if (songItem.base64) {
        console.log("[播放器] 尝试从 base64 数据创建 Blob URL");
        try {
          const base64Data = songItem.base64.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "audio/*" });
          audioUrl = URL.createObjectURL(blob);
          console.log("[播放器] 从 base64 数据创建 Blob URL 成功:", audioUrl);
        } catch (error) {
          console.error("[播放器] 从 base64 数据创建 Blob URL 失败:", error);
          ElMessage.error("无法播放歌曲，请重新导入该歌曲");
        }
      } else {
        console.error("[播放器] 歌曲对象中没有 base64 数据");
        ElMessage.error("无法播放歌曲，请重新导入该歌曲");
      }
    }

    if (!audioUrl) {
      console.error("[播放器] 播放本地歌曲失败: 无法创建音频 URL");
      isPlaying.value = false;
      isPause.value = false;
      return;
    }

    console.log("[播放器] 设置音频源:", audioUrl);
    audio.src = audioUrl;
    currentBlobUrl.value = songItem.blobUrl || audioUrl;
    audio.load();

    audio
      .play()
      .then(() => {
        console.log("[播放器] 音频播放成功");
        isPlaying.value = true;
        isPause.value = false;
        songUrl.value = { url: audioUrl, id: songId } as SongUrl;
        url.value = audioUrl;
        id.value = songId;
        song.value = songItem;
        console.log(
          "[播放器] 更新后的状态 - isPlaying:",
          isPlaying.value,
          "isPause:",
          isPause.value,
          "song:",
          song.value
        );
        pushPlayList(false, songItem);
      })
      .catch((error) => {
        console.error("[播放器] 播放本地歌曲失败:", error);
        isPlaying.value = false;
        isPause.value = false;

        // 清理失败的 Blob URL
        if (currentBlobUrl.value) {
          URL.revokeObjectURL(currentBlobUrl.value);
          currentBlobUrl.value = null;
        }
      });
  };

  // 添加 File 对象到 Map
  const addSongFile = (songId: string | number, file: File) => {
    songFiles.value.set(songId, file);
  };

  // 从 Map 中移除 File 对象
  const removeSongFile = (songId: string | number) => {
    songFiles.value.delete(songId);
  };

  // 设置整个 File 对象 Map
  const setSongFiles = (filesMap: Map<string | number, File>) => {
    songFiles.value = filesMap;
  };

  const playEnd = () => {
    console.log("[播放器] 播放结束");
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
    const numericId = typeof id.value === "string" ? parseInt(id.value, 10) : id.value;
    song.value = await useDetail(numericId);
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
      const nextSongData = nextSong.value;
      if (!nextSongData || !nextSongData.id) {
        console.warn("[播放器] 没有下一首歌曲");
        return;
      }
      // 检查是否是本地歌曲（有 blobUrl 或 path 属性）
      if ((nextSongData as LocalSong).blobUrl || (nextSongData as LocalSong).path) {
        playLocalSong(nextSongData as LocalSong);
      } else {
        play(nextSongData.id);
      }
    }
  };

  const prev = () => {
    const prevSongData = prevSong.value;
    if (!prevSongData || !prevSongData.id) {
      console.warn("[播放器] 没有上一首歌曲");
      return;
    }
    // 检查是否是本地歌曲（有 blobUrl 或 path 属性）
    if ((prevSongData as LocalSong).blobUrl || (prevSongData as LocalSong).path) {
      playLocalSong(prevSongData as LocalSong);
    } else {
      play(prevSongData.id);
    }
  };

  const randomPlay = () => {
    const randomSongData = playList.value.sample();
    if (!randomSongData || !randomSongData.id) {
      console.warn("[播放器] 没有可播放的歌曲");
      return;
    }
    // 检查是否是本地歌曲（有 blobUrl 或 path 属性）
    if ((randomSongData as LocalSong).blobUrl || (randomSongData as LocalSong).path) {
      playLocalSong(randomSongData as LocalSong);
    } else {
      play(randomSongData.id);
    }
  };

  const togglePlay = () => {
    if (!song.value.id) {
      console.warn("[播放器] 没有当前歌曲");
      return;
    }
    isPlaying.value = !isPlaying.value;
    if (!isPlaying.value) {
      audio.pause();
      isPause.value = true;
      console.log("[播放器] 暂停播放");
    } else {
      audio.play().catch((error) => {
        console.error("[播放器] 播放失败:", error);
        isPlaying.value = false;
        isPause.value = true;
      });
      isPause.value = false;
      console.log("[播放器] 继续播放");
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
    songFiles,
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
    addSongFile,
    removeSongFile,
    setSongFiles,
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
  let timer: ReturnType<typeof setInterval>;
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
