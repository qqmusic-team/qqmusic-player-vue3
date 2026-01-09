import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  useAlbumList,
  useAlbumListStyle,
  useAlbumNew,
  useAlbum,
  useAlbumDetailDynamic,
} from "@/utils/api";
import { cachedRequest, generateCacheKey} from "@/utils/requestCache";
import type { Album, DigitalAlbum } from "@/models/album";
import type { Song } from "@/models/song";

// 缓存时间配置
const CACHE_DURATION = {
  HOT_ALBUMS: 3 * 60 * 1000, // 热门专辑缓存3分钟
  NEW_ALBUMS: 2 * 60 * 1000, // 新专辑缓存2分钟
  ALBUM_DETAIL: 10 * 60 * 1000, // 专辑详情缓存10分钟
};

interface AlbumDynamic {
  isSub: boolean;
  subCount: number;
  shareCount: number;
  commentCount: number;
}

interface RawAlbum {
  id: number;
  name: string;
  picUrl: string;
  publishTime: number;
  price?: number;
  sales?: number;
  badge?: string;
  [key: string]: unknown;
}

interface ProductAlbum {
  albumId: number;
  albumName: string;
  coverUrl: string;
  pubTime: number;
  price?: number;
  saleNum?: number;
  newAlbum?: boolean;
  artistName?: string;
  [key: string]: unknown;
}

const mapUiAreaToStyleArea = (area: string): "Z_H" | "E_A" | "KR" | "JP" | null => {
  switch (area) {
    case "ZH":
      return "Z_H";
    case "EA":
      return "E_A";
    case "KR":
      return "KR";
    // 文档没有 HK，这里做一个最接近的降级（不至于完全不变/报错）
    case "HK":
      return "Z_H";
    default:
      return null;
  }
};

export const useDigitalAlbumStore = defineStore("digitalAlbum", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestCount = ref(0);

  const hotAlbums = ref<DigitalAlbum[]>([]);
  const newAlbums = ref<DigitalAlbum[]>([]);
  const albumList = ref<DigitalAlbum[]>([]);
  const currentAlbum = ref<Album | null>(null);
  const currentAlbumSongs = ref<Song[]>([]);
  const currentAlbumDynamic = ref<AlbumDynamic | null>(null);

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
    details: Record<string, unknown> | null = null,
    retry: (() => Promise<void>) | null = null,
    code: number | null = null
  ) => {
    if (typeof window !== "undefined" && window.showErrorModal) {
      window.showErrorModal(message, details, retry, code);
    }
  };

  const formatAlbum = (album: RawAlbum): DigitalAlbum => {
    return {
      id: album.id,
      name: album.name,
      picUrl: album.picUrl,
      publishTime: album.publishTime,
      artists: [],
      artist: {
        albumSize: 0,
        alias: [],
        briefDesc: "",
        fansCount: 0,
        followed: false,
        id: 0,
        img1v1Id: 0,
        img1v1Id_str: "",
        img1v1Url: "",
        musicSize: 0,
        name: "",
        picId: 0,
        picId_str: "",
        picUrl: "",
        topicPerson: 0,
        trans: "",
      },
      songs: [],
      paid: false,
      onSale: false,
      mark: 0,
      blurPicUrl: "",
      companyId: 0,
      alias: [],
      copyrightId: 0,
      picId: 0,
      pic: 0,
      commentThreadId: "",
      picId_str: "",
      tags: "",
      description: "",
      status: 0,
      subType: "",
      company: "",
      briefDesc: "",
      type: "专辑",
      size: 0,
      price: album.price || 0,
      sales: album.sales || 0,
      badge: album.badge || "",
      releaseDate: album.publishTime ? new Date(album.publishTime).toLocaleDateString("zh-CN") : "",
    };
  };

  const formatProductAlbum = (product: ProductAlbum): DigitalAlbum => {
    return {
      id: product.albumId,
      name: product.albumName,
      picUrl: product.coverUrl,
      publishTime: product.pubTime,
      artists: [
        {
          albumSize: 0,
          alias: [],
          briefDesc: "",
          fansCount: 0,
          followed: false,
          id: 0,
          img1v1Id: 0,
          img1v1Id_str: "",
          img1v1Url: "",
          musicSize: 0,
          name: String(product.artistName || ""),
          picId: 0,
          picId_str: "",
          picUrl: "",
          topicPerson: 0,
          trans: "",
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
        albumSize: 0,
        alias: [],
        briefDesc: "",
        fansCount: 0,
        followed: false,
        id: 0,
        img1v1Id: 0,
        img1v1Id_str: "",
        img1v1Url: "",
        musicSize: 0,
        name: String(product.artistName || ""),
        picId: 0,
        picId_str: "",
        picUrl: "",
        topicPerson: 0,
        trans: "",
      },
      songs: [],
      paid: false,
      onSale: false,
      mark: 0,
    };
  };

  const getHotAlbums = async (area: string = "ALL") => {
    // 如果已有数据且区域未变化，直接返回（利用缓存）
    if (hotAlbums.value.length > 0) {
      console.log("使用已缓存的热门专辑数据");
      return;
    }

    try {
      startRequest();
      error.value = null;

      // 使用请求缓存
      const cacheKey = generateCacheKey("hot-albums", { area });
      const result = await cachedRequest(
        cacheKey,
        () => useAlbumNew(area, 10),
        CACHE_DURATION.HOT_ALBUMS
      );

      console.log("热门专辑API响应:", result);
      if (result && result.albums && Array.isArray(result.albums)) {
        hotAlbums.value = result.albums.slice(0, 10).map(formatAlbum);
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

  const getNewAlbums = async (
    area: string = "ALL",
    limit: number = 10,
    offset: number = 0,
    sort: string = "latest"
  ) => {
    try {
      startRequest();
      error.value = null;

      const styleArea = mapUiAreaToStyleArea(area);

      // 使用请求缓存（只缓存首次加载，分页加载不缓存）
      const cacheKey = generateCacheKey("new-albums", { area, limit, offset, sort });
      const fetchFn = () =>
        styleArea
          ? useAlbumListStyle(styleArea, limit, offset)
          : useAlbumList(area, limit, offset, sort);

      const result =
        offset === 0
          ? await cachedRequest(cacheKey, fetchFn, CACHE_DURATION.NEW_ALBUMS)
          : await fetchFn();

      console.log("新专辑API响应:", result);
      if (result && result.products && Array.isArray(result.products)) {
        const formattedAlbums = result.products.map(formatProductAlbum);
        if (offset === 0) {
          newAlbums.value = formattedAlbums;
        } else {
          // 分页加载时去重
          const existingIds = new Set(newAlbums.value.map((a) => a.id));
          const uniqueNew = formattedAlbums.filter((a) => !existingIds.has(a.id));
          newAlbums.value = [...newAlbums.value, ...uniqueNew];
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
      showErrorModal("获取新专辑数据失败", { error: err, area, offset, sort }, () =>
        getNewAlbums(area, limit, offset, sort)
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

      const styleArea = mapUiAreaToStyleArea(area);
      const result = styleArea
        ? await useAlbumListStyle(styleArea, limit, offset)
        : await useAlbumList(area, limit, offset);

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

      // 使用请求缓存获取专辑详情
      const cacheKey = generateCacheKey("album-detail", { id });
      const result = await cachedRequest(cacheKey, () => useAlbum(id), CACHE_DURATION.ALBUM_DETAIL);

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
