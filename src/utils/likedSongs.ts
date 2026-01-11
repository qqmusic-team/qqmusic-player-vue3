import { ref } from 'vue';
import { likeSong, getUserLikeSongs, useLoginStatus } from './api';
import { Song as ApiSong, SongAr } from '../models/song';
import http from './http';

// 定义歌曲类型
export interface LikedSong {
  id: string | number;
  name: string;
  artist: string | string[];
  album?: string;
  duration?: number | string;
  [key: string]: unknown;
}

// 创建响应式信号
export const likedSongsSignal = ref<LikedSong[]>([]);

// 初始化信号
export async function initializeSignal() {
  try {
    const likedSongs = await fetchLikedSongs();
    likedSongsSignal.value = likedSongs;
  } catch (error) {
    console.error("初始化喜欢的歌曲失败:", error);
    likedSongsSignal.value = [];
  }

  // 监听自定义事件，实时更新喜欢的歌曲
  window.addEventListener("qqmusic:song-liked-changed", () => {
    fetchLikedSongs().then(likedSongs => {
      setLikedSongs(likedSongs);
    });
  });
}

// 从API获取喜欢的歌曲
export async function fetchLikedSongs(): Promise<LikedSong[]> {
  try {
    console.log("[DEBUG] 开始获取喜欢的歌曲");
    const loginStatusRes = await useLoginStatus();
    console.log("[DEBUG] 登录状态响应:", loginStatusRes);

    if (loginStatusRes.data.code === 200 && loginStatusRes.data.profile) {
      const userId = loginStatusRes.data.profile.userId;
      console.log("[DEBUG] 用户ID:", userId);

      // 获取喜欢的歌曲列表（直接调用http.get，添加时间戳避免缓存）
      const likedSongsRes = await http.get<{ ids: number[]; songs: ApiSong[] }>('/likelist', {
        uid: userId,
        limit: 1000,
        offset: 0,
        timestamp: Date.now() // 添加时间戳参数，避免缓存问题
      });
      console.log("[DEBUG] 喜欢的歌曲API响应:", JSON.stringify(likedSongsRes, null, 2));
      console.log("[DEBUG] 获取到的ids数量:", likedSongsRes.ids?.length || 0);
      console.log("[DEBUG] 获取到的songs数量:", likedSongsRes.songs?.length || 0);

      const { ids, songs } = likedSongsRes;

      // 如果没有喜欢的歌曲，直接返回空数组
      if ((!ids || ids.length === 0) && (!songs || songs.length === 0)) {
        console.log("[DEBUG] 没有喜欢的歌曲");
        return [];
      }

      // 直接使用getUserLikeSongs返回的songs数组，确保顺序正确
      if (songs && songs.length > 0) {
        const convertedSongs = songs.map((song: ApiSong) => ({
          id: song.id,
          name: song.name,
          artist: song.ar?.map((a: SongAr) => a.name).join(', ') || '未知歌手',
          album: song.al?.name || '未知专辑',
          duration: song.dt || 0
        }));
        console.log("[DEBUG] 转换后的歌曲数量:", convertedSongs.length);
        return convertedSongs;
      }

      // 如果songs数组为空，回退到原来的实现
      console.log("[DEBUG] songs数组为空，回退到使用ids获取歌曲详情");
      const { songs: detailSongs } = await http.get<{ songs: ApiSong[] }>('/song/detail', { ids: ids.join(',') });
      console.log("[DEBUG] 歌曲详情API响应:", detailSongs);
      console.log("[DEBUG] 获取到的歌曲详情数量:", detailSongs?.length || 0);

      // 创建歌曲ID到歌曲对象的映射
      const songMap = new Map<number, LikedSong>();
      detailSongs?.forEach((song: ApiSong) => {
        songMap.set(song.id, {
          id: song.id,
          name: song.name,
          artist: song.ar?.map((a: SongAr) => a.name).join(', ') || '未知歌手',
          album: song.al?.name || '未知专辑',
          duration: song.dt || 0
        });
      });

      // 按照原始ids数组的顺序重新排序歌曲
      const convertedSongs = ids.map(id => songMap.get(id)!).filter(Boolean) as LikedSong[];
      console.log("[DEBUG] 排序后的歌曲数量:", convertedSongs.length);
      return convertedSongs;
    } else {
      console.log("[DEBUG] 登录状态未获取或用户未登录");
      return [];
    }
  } catch (error) {
    console.error("[DEBUG] 获取喜欢的歌曲失败:", error);
    return [];
  }
}

// 获取喜欢的歌曲
export function getLikedSongs(): LikedSong[] {
  return likedSongsSignal.value;
}

// 设置喜欢的歌曲（仅更新信号，不保存到本地存储）
export function setLikedSongs(songs: LikedSong[]): void {
  likedSongsSignal.value = songs;
  // 发送自定义事件通知其他组件
  window.dispatchEvent(new Event("qqmusic:liked-songs-updated"));
}



// 切换歌曲的喜欢状态
export async function toggleLikedSong(song: LikedSong): Promise<boolean> {
  try {
    const songId = Number(song.id);
    const isCurrentlyLiked = isSongLiked(song);
    const newFavoriteStatus = !isCurrentlyLiked;

    // 调用API切换喜欢状态
    const res = await likeSong(songId, newFavoriteStatus);
    if (res.code === 200) {
      // 重新获取喜欢的歌曲列表以确保数据准确
      const updatedLikedSongs = await fetchLikedSongs();
      setLikedSongs(updatedLikedSongs);
      return true;
    } else {
      console.error("收藏操作失败:", res);
      return false;
    }
  } catch (error) {
    console.error("切换喜欢状态失败:", error);
    return false;
  }
}

// 从后端检查歌曲是否已收藏
export async function checkSongLikedFromBackend(song: LikedSong): Promise<boolean> {
  try {
    const loginStatusRes = await useLoginStatus();
    if (loginStatusRes.data.code === 200 && loginStatusRes.data.profile) {
      const userId = loginStatusRes.data.profile.userId;
      const likedSongsRes = await getUserLikeSongs(userId, 1000, 0);
      const songId = Number(song.id);
      return likedSongsRes.ids.some(id => id === songId);
    }
    return false;
  } catch (error) {
    console.error("[DEBUG] 从后端检查歌曲喜欢状态失败:", error);
    return false;
  }
}

// 检查歌曲是否已收藏
export function isSongLiked(song: LikedSong): boolean {
  const songId = Number(song.id);
  return likedSongsSignal.value.some(item => Number(item.id) === songId);
}

// 初始化信号
initializeSignal();
