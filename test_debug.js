// 调试脚本：检查收藏歌曲数据在两个页面之间的一致性
/* global global */

// 模拟 localStorage 数据
const mockLocalStorage = {
  store: {
    "qqmusic_profile_music_v1": JSON.stringify({
      playlists: [
        {
          id: "liked",
          name: "我喜欢的音乐",
          tracks: [
            { id: "1", name: "歌曲1", artist: "歌手1", album: "专辑1", duration: "3:00" },
            { id: "2", name: "歌曲2", artist: "歌手2", album: "专辑2", duration: "4:00" },
            { id: "3", name: "歌曲3", artist: "歌手3", album: "专辑3", duration: "3:30" }
          ],
          trackCount: 3
        }
      ],
      likedSongs: [
        { id: "2", name: "歌曲2", artist: "歌手2", album: "专辑2", duration: "4:00" },
        { id: "3", name: "歌曲3", artist: "歌手3", album: "专辑3", duration: "3:30" }
      ]
    })
  },
  getItem: function(key) { return this.store[key]; },
  setItem: function(key, value) { this.store[key] = value; },
  clear: function() { this.store = {}; }
};

// 模拟环境
global.localStorage = mockLocalStorage;

// 模拟 FavoritesView.vue 的逻辑
console.log("=== 模拟 FavoritesView.vue 逻辑 ===");

// 加载数据
const MUSIC_KEY = "qqmusic_profile_music_v1";
const savedMusic = localStorage.getItem(MUSIC_KEY);
const parsedMusic = savedMusic ? JSON.parse(savedMusic) : { playlists: [], likedSongs: [] };

// FavoritesView 中的 loadLikedSongs 逻辑
const filteredSongs = (parsedMusic.likedSongs || []).filter(song => {
  return song && song.id && song.name && song.artist;
});
const likedSongs = Array.from(filteredSongs);

console.log("FavoritesView - likedSongs:", likedSongs);
console.log("FavoritesView - likedSongs.length:", likedSongs.length);

// FavoritesView 中的 numberedSongs 计算属性逻辑
const validSongs = Array.from(likedSongs.filter(Boolean));
const numberedSongs = validSongs.map((song, index) => ({
  ...song,
  displayNumber: index + 1
}));

console.log("FavoritesView - numberedSongs:", numberedSongs);
console.log("FavoritesView - 显示的编号:", numberedSongs.map(song => song.displayNumber));

// 模拟 ProfileView.vue 的逻辑
console.log("\n=== 模拟 ProfileView.vue 逻辑 ===");

// ProfileView 中的 handleLocalMusicUpdate 逻辑
const musicData = JSON.parse(localStorage.getItem(MUSIC_KEY));
const profileLikedSongs = musicData.likedSongs || [];

console.log("ProfileView - likedSongs:", profileLikedSongs);
console.log("ProfileView - likedSongs.length:", profileLikedSongs.length);

// ProfileView 中的 "我喜欢的音乐" 歌单
const likedPlaylist = {
  id: "liked",
  name: "我喜欢的音乐",
  tracks: profileLikedSongs,
  trackCount: profileLikedSongs.length
};

console.log("ProfileView - 我喜欢的音乐歌单:", likedPlaylist);
console.log("ProfileView - 歌单中的歌曲编号:", likedPlaylist.tracks.map((song, index) => index + 1));

// 检查数据一致性
console.log("\n=== 检查数据一致性 ===");
console.log("FavoritesView 和 ProfileView 中的 likedSongs 是否一致:",
  JSON.stringify(likedSongs) === JSON.stringify(profileLikedSongs));

// 检查个人中心的第一条歌单
const firstPlaylistFromProfile = musicData.playlists[0];
console.log("\n个人中心的第一条歌单:", firstPlaylistFromProfile);
console.log("个人中心歌单的 tracks 数量:", firstPlaylistFromProfile.tracks.length);
console.log("个人中心歌单的歌曲:", firstPlaylistFromProfile.tracks);

// 检查差异
console.log("\n=== 数据差异分析 ===");

// 找出在个人中心歌单中但不在 FavoritesView 中的歌曲
const profileOnlySongs = firstPlaylistFromProfile.tracks.filter(profileSong => {
  return !likedSongs.some(favSong => favSong.id === profileSong.id);
});

console.log("在个人中心歌单中但不在 FavoritesView 中的歌曲:", profileOnlySongs);

// 找出在 FavoritesView 中但不在个人中心歌单中的歌曲
const favOnlySongs = likedSongs.filter(favSong => {
  return !firstPlaylistFromProfile.tracks.some(profileSong => profileSong.id === favSong.id);
});

console.log("在 FavoritesView 中但不在个人中心歌单中的歌曲:", favOnlySongs);

// 检查索引连续性
console.log("\n=== 检查索引连续性 ===");

// 模拟 localStorage 中可能的非连续索引情况
const brokenLikedSongs = [];
brokenLikedSongs[1] = { id: "2", name: "歌曲2", artist: "歌手2" };
brokenLikedSongs[2] = { id: "3", name: "歌曲3", artist: "歌手3" };

console.log("非连续索引的 likedSongs:", brokenLikedSongs);
console.log("非连续索引的 likedSongs.length:", brokenLikedSongs.length);
console.log("非连续索引的 likedSongs[0]:", brokenLikedSongs[0]);

// 应用 FavoritesView 的修复逻辑
const fixedBrokenSongs = Array.from(brokenLikedSongs.filter(Boolean));
console.log("修复后的 likedSongs:", fixedBrokenSongs);
console.log("修复后的 likedSongs.length:", fixedBrokenSongs.length);

// 应用 numberedSongs 逻辑
const fixedNumberedSongs = fixedBrokenSongs.map((song, index) => ({
  ...song,
  displayNumber: index + 1
}));

console.log("修复后的 numberedSongs:", fixedNumberedSongs);
console.log("修复后的显示编号:", fixedNumberedSongs.map(song => song.displayNumber));

console.log("\n=== 调试完成 ===");
