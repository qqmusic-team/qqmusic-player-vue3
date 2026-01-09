import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  useBanner,
  usePersonalized,
  usePersonalizedNewSong,
  usePersonalizedMv,
  usePersonalizedDjProgram,
  useVideoTimelineRecommend,
  useTopListDetail,
  usePlayListTrackAll,
  useVideoDetail,
} from "@/utils/api";
import { cachedRequest, generateCacheKey } from "@/utils/requestCache";
import type { Banner } from "@/models/banner";
import type {
  Personalized,
  PersonalizedNewSong,
  PersonalizedMv,
  DjProgram,
} from "@/models/personalized";
import type { TopListDetail } from "@/models/toplist_detail";
import type { Song } from "@/models/song";
import type { Video } from "@/models/video";

// 缓存时间配置
const CACHE_DURATION = {
  BANNER: 5 * 60 * 1000, // 轮播图缓存5分钟
  PERSONALIZED: 3 * 60 * 1000, // 推荐歌单缓存3分钟
  NEW_SONG: 3 * 60 * 1000, // 新歌推荐缓存3分钟
  MV: 3 * 60 * 1000, // MV推荐缓存3分钟
  DJ: 3 * 60 * 1000, // 电台推荐缓存3分钟
  TOP_LIST: 10 * 60 * 1000, // 排行榜缓存10分钟
};

export const useMusicHallStore = defineStore("musicHall", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestCount = ref(0);

  const banners = ref<Banner[]>([]);
  const personalized = ref<Personalized[]>([]);
  const personalizedNewSong = ref<PersonalizedNewSong[]>([]);
  const personalizedMv = ref<PersonalizedMv[]>([]);
  const djProgram = ref<DjProgram[]>([]);
  const videos = ref<Video[]>([]);
  const topListDetail = ref<TopListDetail[]>([]);
  const videoDetailsCache = ref<Map<string, Video>>(new Map());

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

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

  const getBanners = async () => {
    if (banners.value.length) return;
    try {
      startRequest();
      error.value = null;

      // 使用请求缓存
      const cacheKey = generateCacheKey("banners", {});
      const result = await cachedRequest(cacheKey, useBanner, CACHE_DURATION.BANNER);

      if (Array.isArray(result)) {
        banners.value = result;
      } else {
        console.warn("轮播图数据格式不正确:", result);
        banners.value = [];
      }
    } catch (err) {
      setError("获取轮播图数据失败");
      showErrorModal("获取轮播图数据失败", { error: err }, getBanners);
      console.error("获取轮播图数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getPersonalized = async () => {
    if (personalized.value.length) return;
    try {
      startRequest();
      error.value = null;

      const cacheKey = generateCacheKey("personalized", {});
      const result = await cachedRequest(cacheKey, usePersonalized, CACHE_DURATION.PERSONALIZED);

      if (Array.isArray(result)) {
        personalized.value = result;
      } else {
        console.warn("推荐歌单数据格式不正确:", result);
        personalized.value = [];
      }
    } catch (err) {
      setError("获取推荐歌单数据失败");
      showErrorModal("获取推荐歌单数据失败", { error: err }, getPersonalized);
      console.error("获取推荐歌单数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getPersonalizedNewSong = async () => {
    if (personalizedNewSong.value.length) return;
    try {
      startRequest();
      error.value = null;

      const cacheKey = generateCacheKey("personalizedNewSong", {});
      const result = await cachedRequest(cacheKey, usePersonalizedNewSong, CACHE_DURATION.NEW_SONG);

      if (Array.isArray(result)) {
        personalizedNewSong.value = result;
      } else {
        console.warn("新歌推荐数据格式不正确:", result);
        personalizedNewSong.value = [];
      }
    } catch (err) {
      setError("获取新歌推荐数据失败");
      showErrorModal("获取新歌推荐数据失败", { error: err }, getPersonalizedNewSong);
      console.error("获取新歌推荐数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getPersonalizedMv = async () => {
    if (personalizedMv.value.length) return;
    try {
      startRequest();
      error.value = null;

      const cacheKey = generateCacheKey("personalizedMv", {});
      const result = await cachedRequest(cacheKey, usePersonalizedMv, CACHE_DURATION.MV);

      if (Array.isArray(result)) {
        personalizedMv.value = result;
      } else {
        console.warn("MV推荐数据格式不正确:", result);
        personalizedMv.value = [];
      }
    } catch (err) {
      setError("获取MV推荐数据失败");
      showErrorModal("获取MV推荐数据失败", { error: err }, getPersonalizedMv);
      console.error("获取MV推荐数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjProgram = async () => {
    if (djProgram.value.length) return;
    try {
      startRequest();
      error.value = null;

      const cacheKey = generateCacheKey("djProgram", {});
      const result = await cachedRequest(cacheKey, usePersonalizedDjProgram, CACHE_DURATION.DJ);

      if (Array.isArray(result)) {
        djProgram.value = result;
      } else {
        console.warn("电台节目数据格式不正确:", result);
        djProgram.value = [];
      }
    } catch (err) {
      setError("获取电台节目数据失败");
      showErrorModal("获取电台节目数据失败", { error: err }, getDjProgram);
      console.error("获取电台节目数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getVideos = async (offset: number = 0) => {
    try {
      startRequest();
      error.value = null;
      const newVideos = await useVideoTimelineRecommend(offset);
      if (Array.isArray(newVideos)) {
        if (offset === 0) {
          videos.value = newVideos;
        } else {
          videos.value = [...videos.value, ...newVideos];
        }
      } else {
        console.warn("视频推荐数据格式不正确:", newVideos);
        if (offset === 0) {
          videos.value = [];
        }
      }
    } catch (err) {
      setError("获取视频推荐数据失败");
      showErrorModal("获取视频推荐数据失败", { error: err, offset }, () => getVideos(offset), null);
      console.error("获取视频推荐数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getVideoDetail = async (videoId: string): Promise<Video | null> => {
    try {
      const cached = videoDetailsCache.value.get(videoId);
      if (cached) {
        return cached;
      }

      startRequest();
      error.value = null;
      const videoDetail = await useVideoDetail(videoId);

      if (videoDetail && videoDetail.data) {
        videoDetailsCache.value.set(videoId, videoDetail);
        return videoDetail;
      } else {
        console.warn("视频详情数据格式不正确:", videoDetail);
        return null;
      }
    } catch (err) {
      console.error("获取视频详情失败:", err);
      return null;
    } finally {
      endRequest();
    }
  };

  const getTopListDetail = async () => {
    if (topListDetail.value.length) return;
    try {
      startRequest();
      error.value = null;

      const cacheKey = generateCacheKey("topListDetail", {});
      const result = await cachedRequest(cacheKey, useTopListDetail, CACHE_DURATION.TOP_LIST);

      if (Array.isArray(result)) {
        topListDetail.value = result;
      } else {
        console.warn("排行榜数据格式不正确:", result);
        topListDetail.value = [];
      }
    } catch (err) {
      setError("获取排行榜数据失败");
      showErrorModal("获取排行榜数据失败", { error: err }, getTopListDetail);
      console.error("获取排行榜数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getPlaylistSongs = async (id: number): Promise<Song[]> => {
    try {
      startRequest();
      error.value = null;
      const songs = await usePlayListTrackAll(id);
      if (Array.isArray(songs)) {
        return songs;
      } else {
        console.warn("歌单歌曲数据格式不正确:", songs);
        return [];
      }
    } catch (err) {
      setError("获取歌单歌曲数据失败");
      showErrorModal("获取歌单歌曲数据失败", { error: err, playlistId: id }, () =>
        getPlaylistSongs(id).then(() => {})
      );
      console.error("获取歌单歌曲数据失败:", err);
      return [];
    } finally {
      endRequest();
    }
  };

  const initPickedPage = async () => {
    try {
      error.value = null;
      await Promise.all([
        getBanners(),
        getPersonalized(),
        getPersonalizedNewSong(),
        getVideos(),
        getDjProgram(),
        getPersonalizedMv(),
      ]);
    } catch (err) {
      if (!error.value) {
        error.value = "加载数据失败，请稍后重试";
      }
      showErrorModal("加载数据失败，请稍后重试", { error: err }, initPickedPage);
      console.error("初始化音乐馆页面失败:", err);
    }
  };

  const initTopListPage = async () => {
    try {
      error.value = null;
      await getTopListDetail();
    } catch (err) {
      if (!error.value) {
        error.value = "加载排行榜数据失败，请稍后重试";
      }
      showErrorModal("加载排行榜数据失败，请稍后重试", { error: err }, initTopListPage);
      console.error("初始化排行榜页面失败:", err);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    loading,
    error,
    isLoading,
    hasError,
    banners,
    personalized,
    personalizedNewSong,
    personalizedMv,
    djProgram,
    videos,
    topListDetail,
    getBanners,
    getPersonalized,
    getPersonalizedNewSong,
    getPersonalizedMv,
    getDjProgram,
    getVideos,
    getVideoDetail,
    getTopListDetail,
    getPlaylistSongs,
    initPickedPage,
    initTopListPage,
    clearError,
    showErrorModal,
  };
});
