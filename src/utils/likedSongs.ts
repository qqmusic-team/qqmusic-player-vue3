const MUSIC_KEY = "qqmusic_profile_music_v1";

// 定义歌曲类型
interface Song {
  id: string | number;
  name: string;
  artist: string | string[];
  [key: string]: unknown;
}

// 定义播放列表类型
interface Playlist {
  id: string | number;
  name: string;
  tracks: Song[];
  trackCount?: number;
  [key: string]: unknown;
}

// 定义本地存储音乐数据类型
interface MusicData {
  likedSongs?: Song[];
  playlists?: Playlist[];
  [key: string]: unknown;
}

// 获取喜欢的歌曲
export function getLikedSongs(): Song[] {
  try {
    const savedMusic = localStorage.getItem(MUSIC_KEY);
    if (savedMusic) {
      const parsedMusic: MusicData = JSON.parse(savedMusic);
      let songsToUse: Song[] = [];

      // 优先使用 playlists 中 ID 为 "liked" 的歌单的 tracks 数组
      const likedPlaylist = (parsedMusic.playlists || []).find((playlist: Playlist) => playlist.id === "liked");
      if (likedPlaylist && likedPlaylist.tracks) {
        songsToUse = likedPlaylist.tracks;
      } else {
        // 如果没有找到，则使用 likedSongs 数组
        songsToUse = parsedMusic.likedSongs || [];
      }

      // 过滤掉无效元素，确保每个元素都有必要的属性
      const filteredSongs = songsToUse.filter((song: Song) => {
        return song && song.id && song.name && song.artist;
      });

      // 强制重建数组以确保索引连续
      return Array.from(filteredSongs);
    }
    return [];
  } catch (error) {
    console.error("获取喜欢的歌曲失败:", error);
    return [];
  }
}

// 设置喜欢的歌曲
export function setLikedSongs(songs: Song[]): void {
  try {
    const savedMusic = localStorage.getItem(MUSIC_KEY);
    let parsedMusic: MusicData;

    if (savedMusic) {
      parsedMusic = JSON.parse(savedMusic) as MusicData;
      parsedMusic.likedSongs = parsedMusic.likedSongs || [];
      parsedMusic.playlists = parsedMusic.playlists || [];

      // 确保数组类型
      if (!Array.isArray(parsedMusic.likedSongs)) {
        parsedMusic.likedSongs = Object.values(parsedMusic.likedSongs || {});
      }

      if (!Array.isArray(parsedMusic.playlists)) {
        parsedMusic.playlists = Object.values(parsedMusic.playlists || {});
      }
    } else {
      parsedMusic = {
        playlists: [{
          id: "liked",
          name: "我喜欢的音乐",
          tracks: [],
          trackCount: 0
        }],
        likedSongs: []
      };
    }

    // 更新likedSongs数组
    parsedMusic.likedSongs = songs;

    // 获取或创建"我喜欢的音乐"歌单
    let likedPlaylist = parsedMusic.playlists.find((playlist: Playlist) => playlist.id === "liked");
    if (!likedPlaylist) {
      likedPlaylist = {
        id: "liked",
        name: "我喜欢的音乐",
        tracks: [],
        trackCount: 0
      } as Playlist;
      parsedMusic.playlists.unshift(likedPlaylist);
    }

    // 更新歌单的tracks
    likedPlaylist.tracks = songs;
    likedPlaylist.trackCount = songs.length;

    // 保存到localStorage
    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
  } catch (error) {
    console.error("保存喜欢的歌曲失败:", error);
  }
}
