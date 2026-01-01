import type { DJBanner, DJCategory, DJRadio, DJProgram } from "@/models/dj";
import {
  useDjCatelist,
  useDjRecommend,
  useDjHot,
  useDjProgram,
  useDjProgramToplist,
  useDjRadioHot,
  useDjCategoryRecommend,
} from "@/utils/api";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useDJStore = defineStore("dj", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestCount = ref(0);

  const djBanners = ref<DJBanner[]>([]);
  const djCategories = ref<DJCategory[]>([]);
  const hotRadios = ref<DJRadio[]>([]);
  const recommendRadios = ref<DJRadio[]>([]);
  const radioPrograms = ref<DJProgram[]>([]);
  const currentCategory = ref<number | null>(null);
  const currentRadioId = ref<number | null>(null);
  const programCount = ref(0);
  const hasMorePrograms = ref(true);

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
    retry: (() => Promise<void>) | null = null,
    code: number | null = null
  ) => {
    if (typeof window !== "undefined" && (window as Record<string, unknown>).showErrorModal) {
      (window as Record<string, unknown>).showErrorModal(message, details, retry, code);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const setDjBanners = (banners: DJBanner[]) => {
    djBanners.value = banners;
  };

  const setDjCategories = (categories: DJCategory[]) => {
    djCategories.value = categories;
  };

  const setHotRadios = (radios: DJRadio[]) => {
    hotRadios.value = radios;
  };

  const setRecommendRadios = (radios: DJRadio[]) => {
    recommendRadios.value = radios;
  };

  const setRadioPrograms = (programs: DJProgram[]) => {
    radioPrograms.value = programs;
  };

  const appendRadioPrograms = (programs: DJProgram[]) => {
    radioPrograms.value = [...radioPrograms.value, ...programs];
  };

  const setCurrentCategory = (categoryId: number | null) => {
    currentCategory.value = categoryId;
  };

  const setCurrentRadioId = (radioId: number | null) => {
    currentRadioId.value = radioId;
  };

  const setProgramCount = (count: number) => {
    programCount.value = count;
  };

  const setHasMorePrograms = (hasMore: boolean) => {
    hasMorePrograms.value = hasMore;
  };

  const getDjCategories = async () => {
    if (djCategories.value.length) return;
    try {
      startRequest();
      error.value = null;
      const categories = await useDjCatelist();
      if (Array.isArray(categories)) {
        djCategories.value = categories;
      } else {
        console.warn("电台分类数据格式不正确:", categories);
        djCategories.value = [];
      }
    } catch (err) {
      setError("获取电台分类失败");
      showErrorModal("获取电台分类失败", { error: err }, getDjCategories);
      console.error("获取电台分类失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjRecommend = async () => {
    if (recommendRadios.value.length) return;
    try {
      startRequest();
      error.value = null;
      const radios = await useDjRecommend();
      if (Array.isArray(radios)) {
        recommendRadios.value = radios;
      } else {
        console.warn("推荐电台数据格式不正确:", radios);
        recommendRadios.value = [];
      }
    } catch (err) {
      setError("获取推荐电台失败");
      showErrorModal("获取推荐电台失败", { error: err }, getDjRecommend);
      console.error("获取推荐电台失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjHot = async (cateId?: number) => {
    try {
      startRequest();
      error.value = null;
      const radios = await useDjHot(cateId, 6);
      if (Array.isArray(radios)) {
        hotRadios.value = radios;
      } else {
        console.warn("热门电台数据格式不正确:", radios);
        hotRadios.value = [];
      }
    } catch (err) {
      setError("获取热门电台失败");
      showErrorModal("获取热门电台失败", { error: err, cateId }, () => getDjHot(cateId));
      console.error("获取热门电台失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjPrograms = async (rid: number, limit: number = 30, offset: number = 0) => {
    try {
      startRequest();
      error.value = null;
      const { count, programs } = await useDjProgram(rid, limit, offset);
      if (Array.isArray(programs)) {
        if (offset === 0) {
          radioPrograms.value = programs;
        } else {
          radioPrograms.value = [...radioPrograms.value, ...programs];
        }
        programCount.value = count;
        hasMorePrograms.value = offset + programs.length < count;
      } else {
        console.warn("电台节目数据格式不正确:", programs);
        if (offset === 0) {
          radioPrograms.value = [];
        }
      }
    } catch (err) {
      setError("获取电台节目失败");
      showErrorModal("获取电台节目失败", { error: err, rid, offset }, () =>
        getDjPrograms(rid, limit, offset)
      );
      console.error("获取电台节目失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjProgramToplist = async (limit: number = 30, offset: number = 0) => {
    try {
      startRequest();
      error.value = null;
      const { count, toplist } = await useDjProgramToplist(limit, offset);
      if (Array.isArray(toplist)) {
        if (offset === 0) {
          radioPrograms.value = toplist;
        } else {
          radioPrograms.value = [...radioPrograms.value, ...toplist];
        }
        programCount.value = count;
        hasMorePrograms.value = offset + toplist.length < count;
      } else {
        console.warn("电台节目榜单数据格式不正确:", toplist);
        if (offset === 0) {
          radioPrograms.value = [];
        }
      }
    } catch (err) {
      setError("获取电台节目榜单失败");
      showErrorModal("获取电台节目榜单失败", { error: err, offset }, () =>
        getDjProgramToplist(limit, offset)
      );
      console.error("获取电台节目榜单失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjRadioHot = async (cateId?: number, limit: number = 30, offset: number = 0) => {
    try {
      startRequest();
      error.value = null;
      const { djRadios } = await useDjRadioHot(cateId, limit, offset);
      if (Array.isArray(djRadios)) {
        if (offset === 0) {
          hotRadios.value = djRadios;
        } else {
          hotRadios.value = [...hotRadios.value, ...djRadios];
        }
      } else {
        console.warn("电台列表数据格式不正确:", djRadios);
        if (offset === 0) {
          hotRadios.value = [];
        }
      }
    } catch (err) {
      setError("获取电台列表失败");
      showErrorModal("获取电台列表失败", { error: err, cateId, offset }, () =>
        getDjRadioHot(cateId, limit, offset)
      );
      console.error("获取电台列表失败:", err);
    } finally {
      endRequest();
    }
  };

  const getDjCategoryRecommend = async () => {
    try {
      startRequest();
      error.value = null;
      const radios = await useDjCategoryRecommend();
      if (Array.isArray(radios)) {
        recommendRadios.value = radios;
      } else {
        console.warn("分类推荐电台数据格式不正确:", radios);
        recommendRadios.value = [];
      }
    } catch (err) {
      setError("获取分类推荐电台失败");
      showErrorModal("获取分类推荐电台失败", { error: err }, getDjCategoryRecommend);
      console.error("获取分类推荐电台失败:", err);
    } finally {
      endRequest();
    }
  };

  const initRadioPage = async () => {
    try {
      error.value = null;
      await Promise.all([getDjCategories(), getDjHot(), getDjProgramToplist()]);
    } catch (err) {
      if (!error.value) {
        error.value = "加载电台数据失败，请稍后重试";
      }
      showErrorModal("加载电台数据失败，请稍后重试", { error: err }, initRadioPage);
      console.error("初始化电台页面失败:", err);
    }
  };

  return {
    loading,
    error,
    isLoading,
    hasError,
    djBanners,
    djCategories,
    hotRadios,
    recommendRadios,
    radioPrograms,
    currentCategory,
    currentRadioId,
    programCount,
    hasMorePrograms,
    setDjBanners,
    setDjCategories,
    setHotRadios,
    setRecommendRadios,
    setRadioPrograms,
    appendRadioPrograms,
    setCurrentCategory,
    setCurrentRadioId,
    setProgramCount,
    setHasMorePrograms,
    clearError,
    showErrorModal,
    startRequest,
    endRequest,
    setError,
    getDjCategories,
    getDjRecommend,
    getDjHot,
    getDjPrograms,
    getDjProgramToplist,
    getDjRadioHot,
    getDjCategoryRecommend,
    initRadioPage,
  };
});
