// 推荐歌单状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePersonalized } from '../utils/api';
import type { Playlist } from '../models/playlist';

/**
 * 推荐歌单状态管理
 */
export const usePersonalizedStore = defineStore('personalized', () => {
  // 状态定义
  /** 推荐歌单列表 */
  const playlists = ref<Playlist[]>([]);
  /** 是否正在加载 */
  const loading = ref<boolean>(false);
  /** 是否已加载 */
  const loaded = ref<boolean>(false);
  /** 当前页码 */
  const currentPage = ref<number>(1);
  /** 每页数量 */
  const pageSize = ref<number>(30);
  /** 是否有更多数据 */
  const hasMore = ref<boolean>(true);
  /** 加载失败信息 */
  const error = ref<string | null>null;

  // 计算属性
  /** 格式化后的推荐歌单列表 */
  const formattedPlaylists = computed(() => {
    return playlists.value.map(playlist => ({
      ...playlist,
      // 格式化播放数量
      playCountFormatted: formatPlayCount(playlist.playCount)
    }));
  });

  /** 是否已加载但没有数据 */
  const isEmpty = computed(() => {
    return loaded.value && playlists.value.length === 0;
  });

  // 方法定义
  /**
   * 获取推荐歌单
   * @param limit 获取数量
   * @param refresh 是否刷新（重新获取）
   */
  const fetchPersonalized = async (limit: number = 30, refresh: boolean = false) => {
    // 如果已经加载过且不是刷新模式，则直接返回
    if (loaded.value && !refresh) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const res = await usePersonalized(limit);

      if (res.data && res.data.result) {
        // 如果是刷新，替换数据；否则追加
        if (refresh || currentPage.value === 1) {
          playlists.value = res.data.result;
          currentPage.value = 1;
        } else {
          playlists.value.push(...res.data.result);
        }

        // 判断是否还有更多数据
        hasMore.value = res.data.result.length === pageSize.value;
        loaded.value = true;
      }
    } catch (err) {
      console.error('获取推荐歌单失败:', err);
      error.value = '获取推荐歌单失败，请稍后重试';
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载更多推荐歌单
   */
  const loadMore = async () => {
    if (loading.value || !hasMore.value) {
      return;
    }

    currentPage.value++;
    await fetchPersonalized(pageSize.value);
  };

  /**
   * 刷新推荐歌单
   */
  const refresh = async () => {
    await fetchPersonalized(pageSize.value, true);
  };

  /**
   * 格式化播放数量
   * @param count 播放数量
   * @returns 格式化后的播放数量字符串
   */
  const formatPlayCount = (count: number): string => {
    if (count >= 100000000) {
      return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  /**
   * 根据ID获取歌单信息
   * @param id 歌单ID
   * @returns 歌单信息
   */
  const getPlaylistById = (id: number): Playlist | undefined => {
    return playlists.value.find(playlist => playlist.id === id);
  };

  /**
   * 清空推荐歌单
   */
  const clear = () => {
    playlists.value = [];
    loaded.value = false;
    currentPage.value = 1;
    hasMore.value = true;
    error.value = null;
  };

  /**
   * 获取随机推荐歌单
   * @param count 获取数量
   * @returns 随机推荐歌单列表
   */
  const getRandomPlaylists = (count: number = 6): Playlist[] => {
    if (playlists.value.length <= count) {
      return playlists.value.slice();
    }

    const shuffled = [...playlists.value].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  /**
   * 过滤推荐歌单
   * @param keyword 关键词
   * @returns 过滤后的歌单列表
   */
  const filterPlaylists = (keyword: string): Playlist[] => {
    if (!keyword.trim()) {
      return playlists.value;
    }

    const lowerKeyword = keyword.toLowerCase();
    return playlists.value.filter(playlist => 
      playlist.name.toLowerCase().includes(lowerKeyword) ||
      (playlist.copywriter && playlist.copywriter.toLowerCase().includes(lowerKeyword))
    );
  };

  /**
   * 初始化加载推荐歌单
   */
  const initialize = async () => {
    if (!loaded.value) {
      await fetchPersonalized();
    }
  };

  return {
    // 状态
    playlists,
    loading,
    loaded,
    currentPage,
    pageSize,
    hasMore,
    error,
    
    // 计算属性
    formattedPlaylists,
    isEmpty,
    
    // 方法
    fetchPersonalized,
    loadMore,
    refresh,
    formatPlayCount,
    getPlaylistById,
    clear,
    getRandomPlaylists,
    filterPlaylists,
    initialize
  };
});
