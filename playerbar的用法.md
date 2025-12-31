# PlayerBar.vue 组件使用文档

## 1. 组件概述
PlayerBar.vue 是一个全局音乐播放控制组件，位于项目路径：src\components\layout\PlayerBar.vue。该组件提供统一的音乐播放控制功能，包括播放/暂停、上一曲/下一曲、音量调节、播放进度控制等核心功能。

## 2. 集成方式

### 2.1 全局注册（推荐）
在项目入口文件（如 main.js/main.ts）中进行全局注册：
```javascript
import PlayerBar from '@/components/layout/PlayerBar.vue'
Vue.component('PlayerBar', PlayerBar)
```

### 2.2 局部引入
在需要使用的页面组件中局部引入：
```javascript
import PlayerBar from '@/components/layout/PlayerBar.vue'

export default {
  components: {
    PlayerBar
  }
}
```

## 3. 基础使用方法

在页面模板中添加组件标签：
```html
<template>
  <div>
    <!-- 页面其他内容 -->
    <PlayerBar />
  </div>
</template>
```

## 4. 音乐控制 API

### 4.1 播放控制

#### 播放指定歌曲
```javascript
// 在页面组件中调用
this.$refs.playerBar.playMusic({
  id: 'song_id',          // 歌曲ID，必填
  title: '歌曲标题',       // 歌曲标题，必填
  artist: '艺术家',        // 艺术家名称，必填
  album: '专辑名称',       // 专辑名称，可选
  coverUrl: '封面图片URL', // 封面图片URL，可选
  audioUrl: '音频文件URL'  // 音频文件URL，必填
})
```

#### 暂停播放
```javascript
this.$refs.playerBar.pause()
```

#### 继续播放
```javascript
this.$refs.playerBar.resume()
```

#### 切换播放/暂停状态
```javascript
this.$refs.playerBar.togglePlay()
```

### 4.2 进度控制

#### 跳转到指定播放时间
```javascript
// 跳转到第30秒
this.$refs.playerBar.seekTo(30)
```

#### 获取当前播放进度
```javascript
const currentTime = this.$refs.playerBar.getCurrentTime()
const duration = this.$refs.playerBar.getDuration()
```

### 4.3 音量控制

#### 设置音量
```javascript
// 设置音量为50%（0-100）
this.$refs.playerBar.setVolume(50)
```

#### 切换静音状态
```javascript
this.$refs.playerBar.toggleMute()
```

## 5. 事件监听

### 5.1 播放状态变化
```html
<PlayerBar 
  @play="handlePlay" 
  @pause="handlePause"
  @ended="handlePlayEnd"
/>
```

```javascript
methods: {
  handlePlay() {
    console.log('音乐开始播放')
  },
  handlePause() {
    console.log('音乐暂停播放')
  },
  handlePlayEnd() {
    console.log('音乐播放结束')
    // 可以在这里处理自动播放下一首等逻辑
  }
}
```

### 5.2 进度更新
```html
<PlayerBar @timeUpdate="handleTimeUpdate" />
```

```javascript
methods: {
  handleTimeUpdate(currentTime, duration, percentage) {
    console.log(`当前播放时间: ${currentTime}s / 总时长: ${duration}s (${percentage}%)`)
  }
}
```

## 6. 样式自定义

通过传入 `customClass` 属性自定义组件样式：
```html
<PlayerBar customClass="my-player-bar" />
```

然后在样式文件中定义：
```css
.my-player-bar {
  /* 自定义样式 */
}
```

## 7. 常见问题

### 7.1 跨页面音乐播放保持
PlayerBar.vue 组件默认实现了跨页面音乐播放状态保持，页面切换时无需额外处理。

### 7.2 移动端适配
组件已做响应式设计，在移动端会自动调整布局和交互方式。

### 7.3 浏览器兼容性
支持 Chrome、Firefox、Safari 10+、Edge 等现代浏览器，不支持 IE。

## 8. 示例代码

```html
<template>
  <div>
    <h1>我的音乐页面</h1>
    <div class="song-list">
      <div 
        class="song-item" 
        v-for="song in songList" 
        :key="song.id"
        @click="playSelectedSong(song)"
      >
        {{ song.title }} - {{ song.artist }}
      </div>
    </div>
    <PlayerBar ref="playerBar" @play="onPlay" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      songList: [
        // 歌曲列表数据
      ]
    }
  },
  methods: {
    playSelectedSong(song) {
      this.$refs.playerBar.playMusic({
        id: song.id,
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        audioUrl: song.audioUrl
      })
    },
    onPlay() {
      console.log('音乐开始播放')
    }
  }
}
</script>
```

## 9. 注意事项

1. 确保音频文件 URL 支持跨域访问，否则可能导致播放失败
2. 对于需要登录权限的音频资源，请确保请求头中包含正确的认证信息
3. 组件会在页面卸载时自动暂停播放，如有特殊需求需手动处理
4. 请勿在同一页面中多次实例化 PlayerBar 组件

## 10. 联系方式

如在使用过程中遇到问题，请联系：${maintainer_email}