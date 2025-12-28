// 播放器状态管理
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Song } from '../models/song';
import type { SongUrl } from '../models/song_url';
import { useSongUrl, useSongDetail } from '../utils/api';

// 播放模式枚举
export enum PlayMode {
  /** 顺序播放 */
  SEQUENCE = 0,
  /** 随机播放 */
  RANDOM = 1,
  /** 单曲循环 */
  LOOP = 2
}

/**
 * 播放器状态管理
 */
export const usePlayerStore = defineStore('player', () => {
  // 状态定义
  /** 播放列表 */
  const playList = ref<Song[]>([]);
  /** 当前歌曲索引 */
  const currentIndex = ref<number>(-1);
  /** 播放状态 */
  const playing = ref<boolean>(false);
  /** 播放模式 */
  const playMode = ref<PlayMode>(PlayMode.SEQUENCE);
  /** 音量 */
  const volume = ref<number>(80);
  /** 是否静音 */
  const muted = ref<boolean>(false);
  /** 当前播放进度（秒） */
  const currentTime = ref<number>(0);
  /** 歌曲总时长（秒） */
  const duration = ref<number>(0);
  /** 播放速度 */
  const playbackRate = ref<number>(1);
  /** 是否加载中 */
  const loading = ref<boolean>(false);
  /** 当前歌曲的URL信息 */
  const currentSongUrl = ref<SongUrl | null>(null);
  /** 是否自动播放 */
  const autoPlay = ref<boolean>(true);

  // 计算属性
  /** 当前播放的歌曲 */
  const currentSong = computed(() => {
    return playList.value[currentIndex.value] || null;
  });

  /** 播放百分比 */
  const progressPercent = computed(() => {
    return duration.value ? Math.round((currentTime.value / duration.value) * 100) : 0;
  });

  /** 播放模式文本 */
  const playModeText = computed(() => {
    const modeTexts = ['顺序播放', '随机播放', '单曲循环'];
    return modeTexts[playMode.value] || '顺序播放';
  });

  // 方法定义
  /**
   * 设置播放列表
   * @param songs 歌曲列表
   * @param index 开始播放的索引
   */
  const setPlayList = async (songs: Song[], index: number = 0) => {
    playList.value = songs;
    currentIndex.value = index;
    await loadSongUrl(songs[index]);
    if (autoPlay.value) {
      playing.value = true;
    }
  };

  /**
   * 加载歌曲URL
   * @param song 歌曲信息
   */
  const loadSongUrl = async (song: Song | null) => {
    if (!song) return;
    
    loading.value = true;
    try {
      const res = await useSongUrl(song.id);
      if (res.data && res.data.length > 0) {
        currentSongUrl.value = res.data[0];
      } else {
        console.error('歌曲URL加载失败:', song.name);
      }
    } catch (error) {
      console.error('加载歌曲URL出错:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 播放歌曲
   * @param song 歌曲信息
   */
  const playSong = async (song: Song) => {
    const index = playList.value.findIndex(s => s.id === song.id);
    
    if (index > -1) {
      currentIndex.value = index;
    } else {
      playList.value.push(song);
      currentIndex.value = playList.value.length - 1;
    }
    
    await loadSongUrl(song);
    playing.value = true;
  };

  /**
   * 切换播放状态
   */
  const togglePlay = () => {
    if (!currentSong.value) return;
    playing.value = !playing.value;
  };

  /**
   * 播放下一首
   */
  const playNext = async () => {
    if (playList.value.length === 0) return;
    
    let index = currentIndex.value;
    
    switch (playMode.value) {
      case PlayMode.RANDOM:
        // 随机播放，确保不是当前歌曲
        if (playList.value.length > 1) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * playList.value.length);
          } while (randomIndex === index && playList.value.length > 1);
          index = randomIndex;
        }
        break;
      case PlayMode.SEQUENCE:
      case PlayMode.LOOP:
      default:
        // 顺序播放，循环到开始
        index = (index + 1) % playList.value.length;
        break;
    }
    
    currentIndex.value = index;
    await loadSongUrl(playList.value[index]);
    playing.value = true;
  };

  /**
   * 播放上一首
   */
  const playPrev = async () => {
    if (playList.value.length === 0) return;
    
    let index = currentIndex.value;
    
    switch (playMode.value) {
      case PlayMode.RANDOM:
        // 随机播放，确保不是当前歌曲
        if (playList.value.length > 1) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * playList.value.length);
          } while (randomIndex === index && playList.value.length > 1);
          index = randomIndex;
        }
        break;
      case PlayMode.SEQUENCE:
      case PlayMode.LOOP:
      default:
        // 顺序播放，循环到末尾
        index = (index - 1 + playList.value.length) % playList.value.length;
        break;
    }
    
    currentIndex.value = index;
    await loadSongUrl(playList.value[index]);
    playing.value = true;
  };

  /**
   * 切换播放模式
   */
  const togglePlayMode = () => {
    playMode.value = (playMode.value + 1) % 3;
  };

  /**
   * 设置音量
   * @param value 音量值(0-100)
   */
  const setVolume = (value: number) => {
    volume.value = Math.max(0, Math.min(100, value));
    if (value > 0 && muted.value) {
      muted.value = false;
    }
  };

  /**
   * 切换静音
   */
  const toggleMute = () => {
    muted.value = !muted.value;
  };

  /**
   * 设置播放进度
   * @param time 时间（秒）
   */
  const setCurrentTime = (time: number) => {
    currentTime.value = Math.max(0, Math.min(duration.value, time));
  };

  /**
   * 设置歌曲总时长
   * @param time 时间（秒）
   */
  const setDuration = (time: number) => {
    duration.value = time;
  };

  /**
   * 设置播放速度
   * @param rate 播放速度
   */
  const setPlaybackRate = (rate: number) => {
    playbackRate.value = rate;
  };

  /**
   * 添加歌曲到播放列表
   * @param song 歌曲信息
   */
  const addToPlayList = (song: Song) => {
    // 检查是否已存在
    const index = playList.value.findIndex(s => s.id === song.id);
    if (index === -1) {
      playList.value.push(song);
    }
  };

  /**
   * 从播放列表删除歌曲
   * @param index 歌曲索引
   */
  const removeFromPlayList = async (index: number) => {
    if (index < 0 || index >= playList.value.length) return;
    
    // 如果删除的是当前播放的歌曲
    if (index === currentIndex.value) {
      // 如果是最后一首，播放前一首
      if (index === playList.value.length - 1 && playList.value.length > 1) {
        currentIndex.value--;
        await loadSongUrl(playList.value[currentIndex.value]);
      } else if (playList.value.length > 1) {
        // 否则播放下一首
        await loadSongUrl(playList.value[index]);
      } else {
        // 只有一首歌，清空播放列表
        currentIndex.value = -1;
        playing.value = false;
      }
    } else if (index < currentIndex.value) {
      // 如果删除的是当前歌曲之前的歌曲，索引减1
      currentIndex.value--;
    }
    
    playList.value.splice(index, 1);
  };

  /**
   * 清空播放列表
   */
  const clearPlayList = () => {
    playList.value = [];
    currentIndex.value = -1;
    playing.value = false;
    currentSongUrl.value = null;
    currentTime.value = 0;
    duration.value = 0;
  };

  /**
   * 随机打乱播放列表
   */
  const shufflePlayList = () => {
    if (playList.value.length <= 1) return;
    
    const currentSong = playList.value[currentIndex.value];
    
    // Fisher-Yates 洗牌算法
    for (let i = playList.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playList.value[i], playList.value[j]] = [playList.value[j], playList.value[i]];
    }
    
    // 找到当前歌曲的新位置
    currentIndex.value = playList.value.findIndex(s => s.id === currentSong.id);
  };

  /**
   * 格式化时间为 mm:ss
   * @param seconds 秒数
   * @returns 格式化后的时间字符串
   */
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 监听当前歌曲变化，重置时间
  watch(currentSong, () => {
    currentTime.value = 0;
    duration.value = 0;
  });

  // 监听播放模式变化
  watch(playMode, (newMode, oldMode) => {
    // 从随机模式切换到其他模式时，恢复播放列表顺序
    if (oldMode === PlayMode.RANDOM && newMode !== PlayMode.RANDOM) {
      // 这里可以添加恢复原播放列表顺序的逻辑
    }
  });

  return {
    // 状态
    playList,
    currentIndex,
    playing,
    playMode,
    volume,
    muted,
    currentTime,
    duration,
    playbackRate,
    loading,
    currentSongUrl,
    autoPlay,
    
    // 计算属性
    currentSong,
    progressPercent,
    playModeText,
    
    // 方法
    setPlayList,
    loadSongUrl,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    togglePlayMode,
    setVolume,
    toggleMute,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    addToPlayList,
    removeFromPlayList,
    clearPlayList,
    shufflePlayList,
    formatTime
  };
});
