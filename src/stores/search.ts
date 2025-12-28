// 搜索状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSearch, useSearchSuggest } from '../utils/api';
import type { Song } from '../models/song';
import type { SearchType } from '../models/search';

/**
 * 搜索状态管理
 */
export const useSearchStore = defineStore('search', () => {
  // 状态定义
  /** 搜索关键词 */
  const keyword = ref<string>('');
  /** 搜索历史记录 */
  const searchHistory = ref<string[]>([]);
  /** 搜索结果 - 歌曲列表 */
  const songResults = ref<Song[]>([]);
  /** 搜索建议列表 */
  const suggestions = ref<string[]>([]);
  /** 当前搜索类型 */
  const searchType = ref<SearchType>(SearchType.SONG);
  /** 是否正在搜索 */
  const searching = ref<boolean>(false);
  /** 当前页码 */
  const currentPage = ref<number>(1);
  /** 每页数量 */
  const pageSize = ref<number>(30);
  /** 是否有更多结果 */
  const hasMore = ref<boolean>(true);
  /** 是否显示搜索建议 */
  const showSuggestions = ref<boolean>(false);

  // 计算属性
  /** 格式化后的搜索历史（最多显示10条） */
  const formattedHistory = computed(() => {
    return searchHistory.value.slice(0, 10);
  });

  /** 搜索是否有结果 */
  const hasResults = computed(() => {
    return songResults.value.length > 0;
  });

  // 方法定义
  /**
   * 执行搜索
   * @param searchKeyword 搜索关键词
   * @param type 搜索类型
   * @param page 页码，默认为1（新搜索）
   */
  const doSearch = async (searchKeyword: string, type: SearchType = SearchType.SONG, page: number = 1) => {
    if (!searchKeyword.trim()) return;

    keyword.value = searchKeyword;
    searchType.value = type;
    searching.value = true;

    try {
      // 如果是第一页，清空之前的结果
      if (page === 1) {
        songResults.value = [];
        currentPage.value = 1;
      } else {
        currentPage.value = page;
      }

      const offset = (page - 1) * pageSize.value;
      const res = await useSearch(searchKeyword, type, pageSize.value, offset);

      if (res.data && res.data.result) {
        const { result } = res.data;
        
        // 根据搜索类型处理结果
        switch (type) {
          case SearchType.SONG:
            if (result.songs) {
              // 如果是第一页，直接赋值，否则追加
              if (page === 1) {
                songResults.value = result.songs;
              } else {
                songResults.value.push(...result.songs);
              }
              // 判断是否还有更多结果
              hasMore.value = result.songs.length === pageSize.value;
            } else {
              hasMore.value = false;
            }
            break;
          // 可以根据需要添加其他类型的处理
        }

        // 保存到搜索历史
        saveToHistory(searchKeyword);
      }
    } catch (error) {
      console.error('搜索出错:', error);
    } finally {
      searching.value = false;
      showSuggestions.value = false;
    }
  };

  /**
   * 加载更多搜索结果
   */
  const loadMore = async () => {
    if (searching.value || !hasMore.value || !keyword.value) return;
    
    await doSearch(keyword.value, searchType.value, currentPage.value + 1);
  };

  /**
   * 获取搜索建议
   * @param query 搜索关键词
   */
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      suggestions.value = [];
      return;
    }

    try {
      const res = await useSearchSuggest(query);
      
      if (res.data && res.data.result && res.data.result.allMatch) {
        suggestions.value = res.data.result.allMatch.slice(0, 8).map((item: any) => item.keyword);
      } else {
        suggestions.value = [];
      }

      showSuggestions.value = suggestions.value.length > 0;
    } catch (error) {
      console.error('获取搜索建议出错:', error);
      suggestions.value = [];
    }
  };

  /**
   * 保存到搜索历史
   * @param text 搜索关键词
   */
  const saveToHistory = (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // 移除重复项
    const index = searchHistory.value.indexOf(trimmedText);
    if (index > -1) {
      searchHistory.value.splice(index, 1);
    }

    // 添加到开头
    searchHistory.value.unshift(trimmedText);

    // 保持历史记录数量
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10);
    }

    // 持久化到本地存储
    persistHistory();
  };

  /**
   * 从历史记录中搜索
   * @param text 历史记录中的关键词
   */
  const searchFromHistory = async (text: string) => {
    if (text) {
      await doSearch(text, searchType.value);
    }
  };

  /**
   * 清除搜索历史
   */
  const clearHistory = () => {
    searchHistory.value = [];
    persistHistory();
  };

  /**
   * 从历史记录中移除单个项目
   * @param index 索引
   */
  const removeFromHistory = (index: number) => {
    if (index >= 0 && index < searchHistory.value.length) {
      searchHistory.value.splice(index, 1);
      persistHistory();
    }
  };

  /**
   * 切换搜索类型
   * @param type 搜索类型
   */
  const changeSearchType = async (type: SearchType) => {
    if (searchType.value !== type && keyword.value) {
      searchType.value = type;
      await doSearch(keyword.value, type);
    } else {
      searchType.value = type;
    }
  };

  /**
   * 持久化搜索历史到本地存储
   */
  const persistHistory = () => {
    try {
      localStorage.setItem('music_search_history', JSON.stringify(searchHistory.value));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
  };

  /**
   * 从本地存储加载搜索历史
   */
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('music_search_history');
      if (saved) {
        searchHistory.value = JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error);
      searchHistory.value = [];
    }
  };

  /**
   * 清除搜索状态
   */
  const clearSearch = () => {
    keyword.value = '';
    songResults.value = [];
    suggestions.value = [];
    showSuggestions.value = false;
    currentPage.value = 1;
    hasMore.value = true;
  };

  /**
   * 隐藏搜索建议
   */
  const hideSuggestions = () => {
    showSuggestions.value = false;
  };

  /**
   * 选择搜索建议
   * @param suggestion 建议项
   */
  const selectSuggestion = async (suggestion: string) => {
    keyword.value = suggestion;
    await doSearch(suggestion, searchType.value);
  };

  // 初始化时加载历史记录
  loadHistory();

  return {
    // 状态
    keyword,
    searchHistory,
    songResults,
    suggestions,
    searchType,
    searching,
    currentPage,
    pageSize,
    hasMore,
    showSuggestions,
    
    // 计算属性
    formattedHistory,
    hasResults,
    
    // 方法
    doSearch,
    loadMore,
    fetchSuggestions,
    saveToHistory,
    searchFromHistory,
    clearHistory,
    removeFromHistory,
    changeSearchType,
    clearSearch,
    hideSuggestions,
    selectSuggestion
  };
});
