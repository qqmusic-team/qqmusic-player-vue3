// localStorage数据修复工具
const MUSIC_KEY = "qqmusic_profile_music_v1";

console.log("=== QQ音乐播放器 localStorage 数据修复工具 ===");

// 读取当前数据
try {
  const savedMusic = localStorage.getItem(MUSIC_KEY);
  
  if (savedMusic) {
    console.log("\n1. 当前localStorage数据:");
    console.log(savedMusic);
    
    const parsedMusic = JSON.parse(savedMusic);
    
    console.log("\n2. 数据分析:");
    console.log("   likedSongs类型:", typeof parsedMusic.likedSongs);
    console.log("   likedSongs是否为数组:", Array.isArray(parsedMusic.likedSongs));
    console.log("   likedSongs原始长度:", (parsedMusic.likedSongs || []).length);
    console.log("   likedSongs索引:", Object.keys(parsedMusic.likedSongs || {}));
    
    // 修复数据
    console.log("\n3. 修复数据...");
    
    // 确保likedSongs是数组
    if (!Array.isArray(parsedMusic.likedSongs)) {
      parsedMusic.likedSongs = Object.values(parsedMusic.likedSongs || {});
      console.log("   ✓ 已将likedSongs转换为数组");
    }
    
    // 过滤掉无效元素
    const originalLength = parsedMusic.likedSongs.length;
    parsedMusic.likedSongs = parsedMusic.likedSongs
      .filter(song => song && song.id && song.name && song.artist)
      .map(song => ({ ...song, id: String(song.id) }));
    
    if (parsedMusic.likedSongs.length !== originalLength) {
      console.log(`   ✓ 已过滤掉${originalLength - parsedMusic.likedSongs.length}个无效元素`);
    }
    
    // 确保索引连续
    parsedMusic.likedSongs = Array.from(parsedMusic.likedSongs);
    
    console.log("\n4. 修复后数据:");
    console.log("   likedSongs长度:", parsedMusic.likedSongs.length);
    console.log("   likedSongs索引:", Object.keys(parsedMusic.likedSongs));
    console.log("   likedSongs内容:", parsedMusic.likedSongs);
    
    // 保存修复后的数据
    localStorage.setItem(MUSIC_KEY, JSON.stringify(parsedMusic));
    console.log("\n5. 数据已修复并保存到localStorage!");
    
  } else {
    console.log("\nlocalStorage中没有找到qqmusic_profile_music_v1数据。");
    console.log("将创建一个新的空数据结构...");
    
    const newData = { playlists: [], likedSongs: [] };
    localStorage.setItem(MUSIC_KEY, JSON.stringify(newData));
    console.log("已创建新的空数据结构。");
  }
  
} catch (error) {
  console.error("\n修复过程中发生错误:", error);
  console.log("\n尝试重置数据...");
  
  // 重置数据
  const newData = { playlists: [], likedSongs: [] };
  localStorage.setItem(MUSIC_KEY, JSON.stringify(newData));
  console.log("数据已重置为空结构。");
}

console.log("\n=== 修复完成! ===");
console.log("请刷新页面查看效果。");