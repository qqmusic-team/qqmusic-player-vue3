import { get, post } from "./http";
import { SearchType, SearchResultResponse, SearchSuggestionResponse } from "../models/search";

// 搜索相关API
export const useSearch = async (
  keywords: string,
  type: SearchType = SearchType.SONG,
  limit: number = 30,
  offset: number = 0
): Promise<SearchResultResponse> => {
  try {
    console.log(`[API] 执行搜索: 关键词=${keywords}, 类型=${type}, 限制=${limit}, 偏移=${offset}`);

    // 使用get请求调用搜索接口
    const response = await get<SearchResultResponse>(
      "/cloudsearch",
      {
        keywords,
        type,
        limit,
        offset,
      },
      {
        // 添加超时和重试配置
        timeout: 15000,
        retry: 2,
        retryDelay: 1000,
      }
    );

    console.log("[API] 搜索成功, 返回结果数量:", response.result?.songCount || 0);
    return response;
  } catch (error: any) {
    console.error("[API] 搜索失败:", error);

    // 返回默认值，避免应用崩溃
    return {
      code: error.code || -1,
      message: error.message || "搜索失败",
      result: {},
    };
  }
};

// 搜索建议API
export const useSearchSuggest = async (
  keywords: string,
  type: string = "mobile"
): Promise<SearchSuggestionResponse> => {
  try {
    console.log(`[API] 获取搜索建议: 关键词=${keywords}`);

    const response = await get<SearchSuggestionResponse>("/search/suggest", {
      keywords,
      type,
    });

    return response;
  } catch (error: any) {
    console.error("[API] 获取搜索建议失败:", error);

    // 返回默认值
    return {
      hot: [],
      result: {},
    };
  }
};

// 热门搜索API
export const useSearchHot = async (): Promise<SearchSuggestion[]> => {
  try {
    console.log("[API] 获取热门搜索");

    const response = await get("/search/hot/detail");

    // 检查返回数据结构
    if (response.result && Array.isArray(response.result.hots)) {
      return response.result.hots.map((item: any) => ({
        keyword: item.first,
        type: item.type || 0,
        id: item.track ? item.track.id : 0,
      }));
    }

    return [];
  } catch (error) {
    console.error("[API] 获取热门搜索失败:", error);
    return [];
  }
};

// 登录相关API
export const useLogin = async (phone: string, password: string) => {
  try {
    console.log(`[API] 执行登录: 手机号=${phone}`);
    const response = await post("/login/cellphone", {
      phone,
      password,
    });
    return response;
  } catch (error) {
    console.error("[API] 登录失败:", error);
    throw error;
  }
};

// 获取歌曲详情API
export const useSongDetail = async (ids: number | number[]) => {
  try {
    console.log(`[API] 获取歌曲详情: IDs=${typeof ids === "number" ? ids : ids.join(",")}`);
    const response = await get("/song/detail", {
      ids: typeof ids === "number" ? ids : ids.join(","),
    });
    return response;
  } catch (error) {
    console.error("[API] 获取歌曲详情失败:", error);
    throw error;
  }
};

// 获取歌曲URL API
export const useSongUrl = async (id: number | number[], level: string = "standard") => {
  try {
    console.log(`[API] 获取歌曲URL: ID=${typeof id === "number" ? id : id.join(",")}`);
    const response = await get("/song/url", {
      id: typeof id === "number" ? id : id.join(","),
      level,
    });
    return response;
  } catch (error) {
    console.error("[API] 获取歌曲URL失败:", error);
    throw error;
  }
};

// 获取歌单详情API
export const usePlaylistDetail = async (id: number) => {
  try {
    console.log(`[API] 获取歌单详情: ID=${id}`);
    const response = await get("/playlist/detail", {
      id,
    });
    return response;
  } catch (error) {
    console.error("[API] 获取歌单详情失败:", error);
    throw error;
  }
};

// 获取用户详情API
export const useUserDetail = async (uid: number) => {
  try {
    console.log(`[API] 获取用户详情: UID=${uid}`);
    const response = await get("/user/detail", {
      uid,
    });
    return response;
  } catch (error) {
    console.error("[API] 获取用户详情失败:", error);
    throw error;
  }
};

// 获取歌词API
export const useLyric = async (id: number) => {
  try {
    console.log(`[API] 获取歌词: ID=${id}`);
    const response = await get("/lyric", {
      id,
    });
    return response;
  } catch (error) {
    console.error("[API] 获取歌词失败:", error);
    throw error;
  }
};

// 获取评论API
export const useComment = async (
  type: number,
  id: number,
  limit: number = 20,
  offset: number = 0
) => {
  try {
    console.log(`[API] 获取评论: 类型=${type}, ID=${id}`);
    const response = await get("/comment/new", {
      type,
      id,
      limit,
      offset,
    });
    return response;
  } catch (error) {
    console.error("[API] 获取评论失败:", error);
    throw error;
  }
};

// 获取每日推荐歌曲API
export const useRecommendSongs = async () => {
  try {
    console.log("[API] 获取每日推荐歌曲");
    const response = await get("/recommend/songs");
    return response;
  } catch (error) {
    console.error("[API] 获取每日推荐歌曲失败:", error);
    throw error;
  }
};

// 获取每日推荐歌单API
export const useRecommendResource = async () => {
  try {
    console.log("[API] 获取每日推荐歌单");
    const response = await get("/recommend/resource");
    return response;
  } catch (error) {
    console.error("[API] 获取每日推荐歌单失败:", error);
    throw error;
  }
};

// 获取个性化推荐歌单API
export const usePersonalized = async (limit: number = 10) => {
  try {
    console.log(`[API] 获取个性化推荐歌单: 数量=${limit}`);
    const response = await get("/personalized", {
      limit,
    });
    return response;
  } catch (error) {
    console.error("[API] 获取个性化推荐歌单失败:", error);
    throw error;
  }
};

// 搜索历史记录相关API
export const useSearchHistory = async () => {
  try {
    console.log("[API] 获取搜索历史");
    const response = await get("/search/history");
    return response;
  } catch (error) {
    console.error("[API] 获取搜索历史失败:", error);
    throw error;
  }
};

export const useDeleteSearchHistory = async (keywords: string | string[]) => {
  try {
    console.log(`[API] 删除搜索历史: ${Array.isArray(keywords) ? keywords.join(",") : keywords}`);
    const response = await post("/search/history/delete", {
      keywords: Array.isArray(keywords) ? keywords : [keywords],
    });
    return response;
  } catch (error) {
    console.error("[API] 删除搜索历史失败:", error);
    throw error;
  }
};

// 清空搜索历史
export const useClearSearchHistory = async () => {
  try {
    console.log("[API] 清空搜索历史");
    const response = await post("/search/history/clear");
    return response;
  } catch (error) {
    console.error("[API] 清空搜索历史失败:", error);
    throw error;
  }
};

// 播放列表操作相关API
export const useLike = async (id: number, like: boolean = true) => {
  try {
    console.log(`[API] ${like ? "喜欢" : "取消喜欢"}歌曲: ID=${id}`);
    const response = await post("/like", {
      id,
      like,
    });
    return response;
  } catch (error) {
    console.error(`[API] ${like ? "喜欢" : "取消喜欢"}歌曲失败:`, error);
    throw error;
  }
};

// 别名导出，兼容useLikeSong
export const useLikeSong = useLike;

export const usePlaylistCreate = async (name: string) => {
  try {
    console.log(`[API] 创建歌单: ${name}`);
    const response = await post("/playlist/create", {
      name,
    });
    return response;
  } catch (error) {
    console.error("[API] 创建歌单失败:", error);
    throw error;
  }
};

export const usePlaylistDelete = async (ids: number) => {
  try {
    console.log(`[API] 删除歌单: ID=${ids}`);
    const response = await post("/playlist/delete", {
      ids,
    });
    return response;
  } catch (error) {
    console.error("[API] 删除歌单失败:", error);
    throw error;
  }
};

export const usePlaylistTracks = async (
  op: "add" | "del",
  pid: number,
  tracks: number | number[]
) => {
  try {
    console.log(
      `[API] ${op === "add" ? "添加" : "删除"}歌曲到歌单: 歌单ID=${pid}, 歌曲ID=${
        Array.isArray(tracks) ? tracks.join(",") : tracks
      }`
    );
    const response = await post("/playlist/tracks", {
      op,
      pid,
      tracks: Array.isArray(tracks) ? tracks : [tracks],
    });
    return response;
  } catch (error) {
    console.error(`[API] ${op === "add" ? "添加" : "删除"}歌曲到歌单失败:`, error);
    throw error;
  }
};

// 搜索相关类型定义
export type { SearchType, SearchResultResponse, SearchSuggestionResponse } from "../models/search";
