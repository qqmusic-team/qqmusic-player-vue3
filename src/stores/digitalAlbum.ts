import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  useAlbumList,
  useAlbumNewest,
  useAlbumNew,
  useAlbumToplist,
  useAlbumSaleboard,
  useAlbum,
  useAlbumDetailDynamic,
} from "@/utils/api";
import type { Album, DigitalAlbum } from "@/models/album";
import type { Song } from "@/models/song";

export const useDigitalAlbumStore = defineStore("digitalAlbum", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestCount = ref(0);

  const hotAlbums = ref<DigitalAlbum[]>([]);
  const newAlbums = ref<DigitalAlbum[]>([]);
  const albumList = ref<DigitalAlbum[]>([]);
  const currentAlbum = ref<Album | null>(null);
  const currentAlbumSongs = ref<Song[]>([]);
  const currentAlbumDynamic = ref<any>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);
  const hasMore = ref(true);

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
    error.value = errorMessage;
  };

  const showErrorModal = (
    message: string,
    details: Record<string, any> | null = null,
    retry: (() => Promise<void>) | null = null,
    code: number | null = null
  ) => {
    if (typeof window !== "undefined" && window.showErrorModal) {
      window.showErrorModal(message, details, retry, code);
    }
  };

  const formatAlbum = (album: any): DigitalAlbum => {
    return {
      ...album,
      price: album.price || 0,
      sales: album.sales || 0,
      badge: album.badge || "",
      releaseDate: album.publishTime ? new Date(album.publishTime).toLocaleDateString("zh-CN") : "",
    };
  };

  const formatProductAlbum = (product: any): DigitalAlbum => {
    return {
      id: product.albumId,
      name: product.albumName,
      picUrl: product.coverUrl,
      publishTime: product.pubTime,
      artists: [
        {
          id: 0,
          name: product.artistName,
          picUrl: "",
        },
      ],
      price: product.price || 0,
      sales: product.saleNum || 0,
      badge: product.newAlbum ? "新专辑" : "",
      releaseDate: product.pubTime ? new Date(product.pubTime).toLocaleDateString("zh-CN") : "",
      type: "专辑",
      size: 0,
      picId: 0,
      blurPicUrl: "",
      companyId: 0,
      alias: [],
      copyrightId: 0,
      pic: 0,
      commentThreadId: "",
      picId_str: "",
      tags: "",
      description: "",
      status: 0,
      subType: "",
      company: "",
      briefDesc: "",
      artist: {
        id: 0,
        name: product.artistName,
        picUrl: "",
      },
      songs: [],
      paid: false,
      onSale: false,
      mark: 0,
    };
  };

  const getHotAlbums = async (area: string = "ALL") => {
    try {
      startRequest();
      error.value = null;
      const result = await useAlbumNew(area, 10);
      console.log("热门专辑API响应:", result);
      if (result && result.albums && Array.isArray(result.albums)) {
        hotAlbums.value = result.albums.slice(0, 4).map(formatAlbum);
        console.log("热门专辑处理后数据:", hotAlbums.value);
      } else {
        console.warn("热门专辑数据格式不正确:", result);
        hotAlbums.value = [];
      }
    } catch (err) {
      setError("获取热门专辑数据失败");
      showErrorModal("获取热门专辑数据失败", { error: err, area }, () => getHotAlbums(area));
      console.error("获取热门专辑数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getNewAlbums = async (area: string = "ALL", limit: number = 10, offset: number = 0) => {
    try {
      startRequest();
      error.value = null;
      const result = await useAlbumList(area, limit, offset);
      console.log("新专辑API响应:", result);
      if (result && result.products && Array.isArray(result.products)) {
        const formattedAlbums = result.products.map(formatProductAlbum);
        if (offset === 0) {
          newAlbums.value = formattedAlbums;
        } else {
          newAlbums.value = [...newAlbums.value, ...formattedAlbums];
        }
        hasMore.value = result.more || false;
        console.log("新专辑处理后数据:", newAlbums.value);
      } else {
        console.warn("新专辑数据格式不正确:", result);
        if (offset === 0) {
          newAlbums.value = [];
        }
        hasMore.value = false;
      }
    } catch (err) {
      setError("获取新专辑数据失败");
      showErrorModal("获取新专辑数据失败", { error: err, area, offset }, () =>
        getNewAlbums(area, limit, offset)
      );
      console.error("获取新专辑数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getAlbumList = async (area: string = "ALL", limit: number = 30, offset: number = 0) => {
    try {
      startRequest();
      error.value = null;
      const result = await useAlbumList(area, limit, offset);
      if (result && result.products && Array.isArray(result.products)) {
        const formattedAlbums = result.products.map(formatProductAlbum);
        if (offset === 0) {
          albumList.value = formattedAlbums;
        } else {
          albumList.value = [...albumList.value, ...formattedAlbums];
        }
        hasMore.value = result.more || false;
      } else {
        console.warn("专辑列表数据格式不正确:", result);
        if (offset === 0) {
          albumList.value = [];
        }
        hasMore.value = false;
      }
    } catch (err) {
      setError("获取专辑列表数据失败");
      showErrorModal("获取专辑列表数据失败", { error: err, area, offset }, () =>
        getAlbumList(area, limit, offset)
      );
      console.error("获取专辑列表数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getAlbumDetail = async (id: number) => {
    try {
      startRequest();
      error.value = null;
      const result = await useAlbum(id);
      if (result && result.album) {
        currentAlbum.value = result.album;
        currentAlbumSongs.value = result.songs || [];
      } else {
        console.warn("专辑详情数据格式不正确:", result);
        currentAlbum.value = null;
        currentAlbumSongs.value = [];
      }
    } catch (err) {
      setError("获取专辑详情数据失败");
      showErrorModal("获取专辑详情数据失败", { error: err, albumId: id }, () => getAlbumDetail(id));
      console.error("获取专辑详情数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const getAlbumDynamic = async (id: number) => {
    try {
      startRequest();
      error.value = null;
      const result = await useAlbumDetailDynamic(id);
      if (result) {
        currentAlbumDynamic.value = result;
      } else {
        console.warn("专辑动态数据格式不正确:", result);
        currentAlbumDynamic.value = null;
      }
    } catch (err) {
      setError("获取专辑动态数据失败");
      showErrorModal("获取专辑动态数据失败", { error: err, albumId: id }, () =>
        getAlbumDynamic(id)
      );
      console.error("获取专辑动态数据失败:", err);
    } finally {
      endRequest();
    }
  };

  const initDigitalAlbumPage = async (area: string = "ALL") => {
    try {
      error.value = null;
      await Promise.all([getHotAlbums(area), getNewAlbums(area)]);
    } catch (err) {
      if (!error.value) {
        error.value = "加载数据失败，请稍后重试";
      }
      showErrorModal("加载数据失败，请稍后重试", { error: err, area }, () =>
        initDigitalAlbumPage(area)
      );
      console.error("初始化数字专辑页面失败:", err);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetAlbums = () => {
    hotAlbums.value = [];
    newAlbums.value = [];
    albumList.value = [];
    currentAlbum.value = null;
    currentAlbumSongs.value = [];
    currentAlbumDynamic.value = null;
    hasMore.value = true;
  };

  return {
    loading,
    error,
    isLoading,
    hasError,
    hotAlbums,
    newAlbums,
    albumList,
    currentAlbum,
    currentAlbumSongs,
    currentAlbumDynamic,
    hasMore,
    getHotAlbums,
    getNewAlbums,
    getAlbumList,
    getAlbumDetail,
    getAlbumDynamic,
    initDigitalAlbumPage,
    clearError,
    showErrorModal,
    resetAlbums,
  };
});
