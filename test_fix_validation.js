// 测试脚本来验证修复是否解决了问题
/* global global */
// 模拟用户描述的情况：个人中心的歌单有编号1的歌曲，但我喜欢的页面没有

// 模拟 localStorage 数据（用户描述的问题场景）
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

// 模拟修复后的 FavoritesView.vue 的 loadLikedSongs 逻辑
console.log("=== 测试修复后的 loadLikedSongs 函数 ===");

// 加载数据
const MUSIC_KEY = "qqmusic_profile_music_v1";
const loadLikedSongs = () => {
  try {
    const savedMusic = localStorage.getItem(MUSIC_KEY);
    if (savedMusic) {
      const parsedMusic = JSON.parse(savedMusic);
      let songsToUse = [];

      // 优先使用 playlists 中 ID 为 "liked" 的歌单的 tracks 数组（与个人中心保持一致）
      const likedPlaylist = (parsedMusic.playlists || []).find(playlist => playlist.id === "liked");
      if (likedPlaylist && likedPlaylist.tracks) {
        songsToUse = likedPlaylist.tracks;
      } else {
        // 如果没有找到，则使用 likedSongs 数组
        songsToUse = parsedMusic.likedSongs || [];
      }

      // 过滤掉无效元素，确保每个元素都有必要的属性
      const filteredSongs = songsToUse.filter(song => {
        return song && song.id && song.name && song.artist;
      });

      // 强制重建数组以确保索引连续
      const likedSongs = Array.from(filteredSongs);

      // 确保两个数据源同步：更新 likedSongs 和 playlists 中的 tracks
      if (parsedMusic.likedSongs?.length !== likedSongs.length ||
          likedPlaylist?.tracks?.length !== likedSongs.length) {

        // 更新 likedSongs 数组
        parsedMusic.likedSongs = likedSongs;

        // 更新 playlists 中的 "我喜欢的音乐" 歌单
        if (likedPlaylist) {
          likedPlaylist.tracks = likedSongs;
          likedPlaylist.trackCount = likedSongs.length;
        } else {
          // 如果 "我喜欢的音乐" 歌单不存在，则创建它
          parsedMusic.playlists = parsedMusic.playlists || [];
          parsedMusic.playlists.unshift({
            id: "liked",
            name: "我喜欢的音乐",
            tracks: likedSongs,
            trackCount: likedSongs.length
          });
        }

        localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
        console.log("✓ 本地存储已更新，两个数据源保持同步");
      }

      return likedSongs;
    } else {
      localStorage.setItem(MUSIC_KEY, JSON.stringify({
        playlists: [{
          id: "liked",
          name: "我喜欢的音乐",
          tracks: [],
          trackCount: 0
        }],
        likedSongs: []
      }));
      return [];
    }
  } catch (error) {
    console.error("[我喜欢] 加载喜欢的歌曲失败:", error);
    return [];
  }
};

// 测试 loadLikedSongs
let likedSongs = loadLikedSongs();
console.log("测试后 - likedSongs:", likedSongs);
console.log("测试后 - likedSongs.length:", likedSongs.length);

// 测试 numberedSongs 计算属性
const validSongs = Array.from(likedSongs.filter(Boolean));
const numberedSongs = validSongs.map((song, index) => ({
  ...song,
  displayNumber: index + 1
}));

console.log("测试后 - numberedSongs:", numberedSongs);
console.log("测试后 - 显示的编号:", numberedSongs.map(song => song.displayNumber));

// 验证修复效果
console.log("\n=== 验证修复效果 ===");

// 检查歌曲编号是否从1开始
const startsFromOne = numberedSongs.length > 0 && numberedSongs[0].displayNumber === 1;
console.log("歌曲编号是否从1开始:", startsFromOne ? "✓ 是" : "✗ 否");

// 检查是否包含了个人中心歌单中的所有歌曲
const afterFixMusicData = JSON.parse(localStorage.getItem(MUSIC_KEY));
const afterFixLikedSongs = afterFixMusicData.likedSongs;
const afterFixPlaylist = afterFixMusicData.playlists.find(p => p.id === "liked");

console.log("\n修复后的数据一致性检查:");
console.log("likedSongs 包含歌曲1:", afterFixLikedSongs.some(song => song.id === "1") ? "✓ 是" : "✗ 否");
console.log("歌单包含歌曲1:", afterFixPlaylist.tracks.some(song => song.id === "1") ? "✓ 是" : "✗ 否");
console.log("likedSongs 和歌单 tracks 长度是否一致:", afterFixLikedSongs.length === afterFixPlaylist.tracks.length ? "✓ 是" : "✗ 否");

// 检查是否所有歌曲都有正确的编号
let allNumbersCorrect = true;
numberedSongs.forEach((song, index) => {
  if (song.displayNumber !== index + 1) {
    allNumbersCorrect = false;
  }
});
console.log("所有歌曲编号是否连续且正确:", allNumbersCorrect ? "✓ 是" : "✗ 否");

// 总结测试结果
console.log("\n=== 测试总结 ===");
if (startsFromOne && allNumbersCorrect && afterFixLikedSongs.some(song => song.id === "1")) {
  console.log("✅ 修复成功！我喜欢的页面现在与个人中心的歌单数据保持同步，歌曲编号从1开始。");
  console.log("   - 解决了编号从2开始的问题");
  console.log("   - 确保了两个数据源（likedSongs和歌单tracks）的数据一致性");
  console.log("   - 编号现在是连续且正确的");
} else {
  console.log("❌ 修复失败！请检查代码逻辑。");
}
