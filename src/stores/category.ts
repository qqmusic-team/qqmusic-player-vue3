import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  usePlayListCatList,
  usePlaylistByCategory,
  useTopPlaylistHighquality,
  userArtistList,
} from "@/utils/api";
import type { PlayListCat } from "@/models/playlist_cat";
import type { PlayListDetail } from "@/models/playlist";
import type { Artist } from "@/models/artist";

export const useCategoryStore = defineStore("category", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestCount = ref(0);

  const categories = ref<PlayListCat[]>([]);
  const categoryLabels = ref<string[]>([]);
  const playlists = ref<PlayListDetail[]>([]);
  const artists = ref<Artist[]>([]);

  const currentCategory = ref("全部");
  const currentSort = ref("recommend");
  const currentType = ref(-1);
  const currentArea = ref(-1);
  const currentInitial = ref("");
  const currentPage = ref(1);
  const pageSize = ref(30);
  const hasMore = ref(true);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
  }

  const playlistCache = ref<Map<string, CacheItem<PlayListDetail[]>>>(new Map());
  const artistCache = ref<Map<string, CacheItem<Artist[]>>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = <T>(cacheItem: CacheItem<T> | undefined): boolean => {
    if (!cacheItem) return false;
    return Date.now() < cacheItem.expiresAt;
  };

  const setCache = <T>(cache: Map<string, CacheItem<T>>, key: string, data: T) => {
    const now = Date.now();
    cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    });
  };

  const getCache = <T>(cache: Map<string, CacheItem<T>>, key: string): T | null => {
    const cacheItem = cache.get(key) as CacheItem<T> | undefined;
    if (isCacheValid(cacheItem)) {
      return cacheItem!.data;
    }
    cache.delete(key);
    return null;
  };

  const clearCache = () => {
    playlistCache.value.clear();
    artistCache.value.clear();
  };

  const clearPlaylistCache = () => {
    playlistCache.value.clear();
  };

  const clearArtistCache = () => {
    artistCache.value.clear();
  };

  const startRequest = () => {
    requestCount.value++;
    if (requestCount.value === 1) {
      loading.value = true;
    }
  };

  const endRequest = () => {
    requestCount.value--;
    if (requestCount.value === 0) {
      loading.value = false;
    }
  };

  const setError = (errorMessage: string) => {
    if (!error.value) {
      error.value = errorMessage;
    }
  };

  const showErrorModal = (
    message: string,
    details: Record<string, unknown> | null = null,
    retry: (() => Promise<unknown>) | null = null,
    code: number | null = null
  ) => {
    if (
      typeof window !== "undefined" &&
      (window as unknown as Record<string, unknown>).showErrorModal
    ) {
      const showErrorModalFn = (window as unknown as Record<string, unknown>).showErrorModal as (
        message: string,
        details: Record<string, unknown> | null,
        retry: (() => Promise<unknown>) | null,
        code: number | null
      ) => void;
      showErrorModalFn(message, details, retry, code);
    }
  };

  const getCategories = async () => {
    if (categories.value.length > 0) return;

    try {
      startRequest();
      error.value = null;
      const result = await usePlayListCatList();
      categories.value = Object.freeze(result.sub || []) as PlayListCat[];
      categoryLabels.value = Object.freeze(result.categories || []) as string[];
    } catch (err) {
      setError("获取分类列表失败");
      showErrorModal("获取分类列表失败", { error: err }, getCategories);
      console.error("获取分类列表失败:", err);
    } finally {
      endRequest();
    }
  };

  const getPlaylistsByCategory = async (
    category: string,
    page: number = 1,
    limit: number = 30,
    append: boolean = false
  ) => {
    const cacheKey = `${category}_${page}_${limit}`;

    if (!append) {
      const cachedData = getCache(playlistCache.value, cacheKey);
      if (cachedData) {
        playlists.value = cachedData;
        currentCategory.value = category;
        currentPage.value = page;
        hasMore.value = cachedData.length >= limit;
        return cachedData;
      }
    }

    try {
      startRequest();
      error.value = null;

      let newPlaylists: PlayListDetail[] = [];

      if (category === "全部" || currentSort.value === "recommend") {
        const result = await useTopPlaylistHighquality({
          cat: category === "全部" ? "全部" : category,
          limit: limit,
        });
        newPlaylists = result.playlists || [];
        hasMore.value = result.more || false;
      } else {
        newPlaylists = await usePlaylistByCategory(category, limit);
        hasMore.value = newPlaylists.length >= limit;
      }

      if (append) {
        playlists.value = [...playlists.value, ...newPlaylists];
      } else {
        playlists.value = newPlaylists;
        setCache(playlistCache.value, cacheKey, newPlaylists);
      }

      currentCategory.value = category;
      currentPage.value = page;

      return newPlaylists;
    } catch (err) {
      setError("获取歌单列表失败");
      showErrorModal(
        "获取歌单列表失败",
        { error: err, category, page },
        () => getPlaylistsByCategory(category, page, limit, append),
        null
      );
      console.error("获取歌单列表失败:", err);
      return [];
    } finally {
      endRequest();
    }
  };

  const getArtists = async (
    type: number = -1,
    area: number = -1,
    initial: string = "",
    page: number = 1,
    limit: number = 30,
    append: boolean = false
  ) => {
    const cacheKey = `${type}_${area}_${initial}_${page}_${limit}`;

    if (!append) {
      const cachedData = getCache(artistCache.value, cacheKey);
      if (cachedData) {
        artists.value = cachedData;
        currentType.value = type;
        currentArea.value = area;
        currentInitial.value = initial;
        currentPage.value = page;
        hasMore.value = cachedData.length >= limit;
        return cachedData;
      }
    }

    try {
      startRequest();
      error.value = null;

      const pageData = {
        type: type,
        area: area,
        initial: initial,
        page: page,
        limit: limit,
      };

      const newArtists = await userArtistList(pageData);

      if (append) {
        artists.value = [...artists.value, ...newArtists];
      } else {
        artists.value = newArtists;
        setCache(artistCache.value, cacheKey, newArtists);
      }

      currentType.value = type;
      currentArea.value = area;
      currentInitial.value = initial;
      currentPage.value = page;
      hasMore.value = newArtists.length >= limit;

      return newArtists;
    } catch (err) {
      setError("获取歌手列表失败");
      showErrorModal(
        "获取歌手列表失败",
        { error: err, type, area, initial, page },
        () => getArtists(type, area, initial, page, limit, append),
        null
      );
      console.error("获取歌手列表失败:", err);
      return [];
    } finally {
      endRequest();
    }
  };

  const loadMorePlaylists = async () => {
    if (!hasMore.value || isLoading.value) return [];

    const nextPage = currentPage.value + 1;
    return await getPlaylistsByCategory(currentCategory.value, nextPage, pageSize.value, true);
  };

  const loadMoreArtists = async () => {
    if (!hasMore.value || isLoading.value) return [];

    const nextPage = currentPage.value + 1;
    return await getArtists(
      currentType.value,
      currentArea.value,
      currentInitial.value,
      nextPage,
      pageSize.value,
      true
    );
  };

  const refreshPlaylists = async () => {
    currentPage.value = 1;
    hasMore.value = true;
    return await getPlaylistsByCategory(currentCategory.value, 1, pageSize.value, false);
  };

  const refreshArtists = async () => {
    currentPage.value = 1;
    hasMore.value = true;
    return await getArtists(
      currentType.value,
      currentArea.value,
      currentInitial.value,
      1,
      pageSize.value,
      false
    );
  };

  const clearError = () => {
    error.value = null;
  };

  const resetCategoryState = () => {
    playlists.value = [];
    currentCategory.value = "全部";
    currentSort.value = "recommend";
    currentPage.value = 1;
    hasMore.value = true;
    error.value = null;
  };

  const resetArtistState = () => {
    artists.value = [];
    currentType.value = -1;
    currentArea.value = -1;
    currentInitial.value = "";
    currentPage.value = 1;
    hasMore.value = true;
    error.value = null;
  };

  return {
    loading,
    error,
    isLoading,
    hasError,
    categories,
    categoryLabels,
    playlists,
    artists,
    currentCategory,
    currentSort,
    currentType,
    currentArea,
    currentInitial,
    currentPage,
    hasMore,
    getCategories,
    getPlaylistsByCategory,
    getArtists,
    loadMorePlaylists,
    loadMoreArtists,
    refreshPlaylists,
    refreshArtists,
    clearError,
    resetCategoryState,
    resetArtistState,
    clearCache,
    clearPlaylistCache,
    clearArtistCache,
  };
});
