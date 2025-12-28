# 网易云音乐 API 功能说明文档

## 1. 项目概述

本文档详细说明了基于 Vue 3 + TypeScript 开发的网易云音乐播放器应用中实现的 API 调用功能。这些 API 功能主要位于`src/utils`文件夹中，通过`http.ts`和`api.ts`文件实现对网易云音乐 API 的封装，支持搜索、歌曲、歌单、推荐等多种功能。

## 2. 环境配置要求

### 2.1 .env 配置文件

在项目根目录下的`.env`文件中，需要配置以下环境变量：

```env
# API基础URL（示例）
VITE_API_BASE_URL=https://netease-cloud-music-api-phi-olive.vercel.app

# API请求超时时间（毫秒）
VITE_API_TIMEOUT=10000
```

### 2.2 依赖安装

项目依赖于以下关键包：

- axios: 用于 HTTP 请求
- pinia: 用于状态管理
- vue: 前端框架
- typescript: 类型系统

## 3. API 功能分类

网易云 API 调用功能按模块分为以下几类：

1. **搜索相关 API** - 提供搜索歌曲、搜索建议、热门搜索等功能
2. **歌曲相关 API** - 提供歌曲详情、歌曲 URL、歌词等功能
3. **歌单相关 API** - 提供歌单详情、歌曲列表等功能
4. **推荐相关 API** - 提供推荐歌单、推荐歌曲、推荐资源等功能
5. **评论相关 API** - 提供获取评论、发表评论等功能
6. **用户相关 API** - 提供用户详情、登录等功能

## 4. API 功能详细说明

### 4.1 搜索相关 API

#### 4.1.1 useSearch - 搜索功能

**功能说明**: 根据关键词搜索歌曲、歌手、专辑等内容。

**参数说明**:

- `keyword`: string - 搜索关键词
- `type`: number - 搜索类型（1:歌曲, 10:歌手, 100:专辑, 1000:歌单, 1002:用户）
- `limit`: number - 返回结果数量
- `offset`: number - 偏移量，用于分页

**返回值格式**:

```typescript
{
  result: {
    songs: Array<{
      id: number;
      name: string;
      artists: Array<{ id: number; name: string }>;
      album: { id: number; name: string };
      duration: number;
      // 其他字段...
    }>;
    // 其他搜索结果...
  }
  code: number;
}
```

**使用示例**:

```typescript
import { useSearch } from "@/utils/api";

// 搜索周杰伦的歌曲
const searchResult = await useSearch("周杰伦", 1, 10, 0);
console.log(searchResult.result.songs);
```

#### 4.1.2 useSearchSuggest - 搜索建议

**功能说明**: 获取搜索关键词的联想建议。

**参数说明**:

- `keyword`: string - 搜索关键词

**返回值格式**:

```typescript
{
  result: {
    allMatch: Array<{ keyword: string; type: number }>;
    songs: Array<{
      id: number;
      name: string;
      artists: Array<{ id: number; name: string }>;
    }>;
    // 其他建议...
  }
  code: number;
}
```

**使用示例**:

```typescript
import { useSearchSuggest } from "@/utils/api";

// 获取搜索建议
const suggestResult = await useSearchSuggest("周杰");
console.log(suggestResult.result.allMatch);
```

#### 4.1.3 useSearchHot - 热门搜索

**功能说明**: 获取热门搜索关键词列表。

**参数说明**: 无

**返回值格式**:

```typescript
{
  data: Array<{
    first: string; // 关键词
    second: number; // 热度
    iconType: number; // 图标类型
  }>;
  code: number;
}
```

**使用示例**:

```typescript
import { useSearchHot } from "@/utils/api";

// 获取热门搜索
const hotResult = await useSearchHot();
console.log(hotResult.data);
```

### 4.2 歌曲相关 API

#### 4.2.1 useSongDetail - 获取歌曲详情

**功能说明**: 获取歌曲的详细信息。

**参数说明**:

- `ids`: number | string | Array<number> - 歌曲 ID 或 ID 数组

**返回值格式**:

```typescript
{
  songs: Array<{
    id: number;
    name: string;
    artists: Array<{ id: number; name: string }>;
    album: { id: number; name: string };
    duration: number;
    mp3Url?: string;
    // 其他字段...
  }>;
  code: number;
}
```

**使用示例**:

```typescript
import { useSongDetail } from "@/utils/api";

// 获取单首歌曲详情
const songDetail = await useSongDetail(1330877411);
console.log(songDetail.songs[0]);

// 获取多首歌曲详情
const songsDetail = await useSongDetail([1330877411, 1330877412]);
console.log(songsDetail.songs);
```

#### 4.2.2 useSongUrl - 获取歌曲 URL

**功能说明**: 获取歌曲的播放链接。

**参数说明**:

- `id`: number - 歌曲 ID
- `level`: string - 音质等级（standard: 标准, higher: 较高, exhigh: 极高, lossless: 无损）

**返回值格式**:

```typescript
{
  data: Array<{
    id: number;
    url: string; // 播放链接
    code: number; // 状态码
    type?: string; // 音频格式
    size?: number; // 文件大小
  }>;
  code: number;
}
```

**使用示例**:

```typescript
import { useSongUrl } from "@/utils/api";

// 获取歌曲播放链接
const songUrl = await useSongUrl(1330877411, "standard");
console.log(songUrl.data[0].url);
```

#### 4.2.3 useLyric - 获取歌词

**功能说明**: 获取歌曲的歌词内容。

**参数说明**:

- `id`: number - 歌曲 ID

**返回值格式**:

```typescript
{
  lrc?: {
    lyric: string;      // 歌词内容
    version: number;
  };
  tlyric?: {
    lyric: string;      // 翻译歌词
    version: number;
  };
  code: number;
}
```

**使用示例**:

```typescript
import { useLyric } from "@/utils/api";

// 获取歌词
const lyric = await useLyric(1330877411);
console.log(lyric.lrc?.lyric);
console.log(lyric.tlyric?.lyric);
```

### 4.3 歌单相关 API

#### 4.3.1 usePlaylistDetail - 获取歌单详情

**功能说明**: 获取歌单的详细信息和歌曲列表。

**参数说明**:

- `id`: number - 歌单 ID

**返回值格式**:

```typescript
{
  playlist: {
    id: number;
    name: string;
    coverImgUrl: string;
    description: string;
    tracks: Array<{
      id: number;
      name: string;
      artists: Array<{ id: number; name: string }>;
      album: { id: number; name: string };
      duration: number;
      // 其他字段...
    }>;
    trackCount: number;
    // 其他字段...
  }
  code: number;
}
```

**使用示例**:

```typescript
import { usePlaylistDetail } from "@/utils/api";

// 获取歌单详情
const playlistDetail = await usePlaylistDetail(3778678);
console.log(playlistDetail.playlist.name);
console.log(playlistDetail.playlist.tracks);
```

### 4.4 推荐相关 API

#### 4.4.1 usePersonalized - 获取推荐歌单

**功能说明**: 获取个性化推荐歌单。

**参数说明**:

- `limit`: number - 返回结果数量

**返回值格式**:

```typescript
{
  result: Array<{
    id: number;
    name: string;
    coverImgUrl: string;
    playCount: number;
    // 其他字段...
  }>;
  code: number;
}
```

**使用示例**:

```typescript
import { usePersonalized } from "@/utils/api";

// 获取推荐歌单
const personalized = await usePersonalized(10);
console.log(personalized.result);
```

#### 4.4.2 useRecommendSongs - 获取推荐歌曲

**功能说明**: 获取每日推荐歌曲（需要登录）。

**参数说明**: 无

**返回值格式**:

```typescript
{
  data: {
    dailySongs: Array<{
      id: number;
      name: string;
      artists: Array<{ id: number; name: string }>;
      album: { id: number; name: string };
      // 其他字段...
    }>;
    recommendReasons?: Array<{ songId: number; reason: string }>;
  };
  code: number;
}
```

**使用示例**:

```typescript
import { useRecommendSongs } from "@/utils/api";

// 获取推荐歌曲（需要登录）
try {
  const recommendSongs = await useRecommendSongs();
  console.log(recommendSongs.data.dailySongs);
} catch (error) {
  console.error("获取推荐歌曲失败，可能需要登录");
}
```

#### 4.4.3 useRecommendResource - 获取推荐资源

**功能说明**: 获取推荐歌单和专辑（需要登录）。

**参数说明**: 无

**返回值格式**:

```typescript
{
  recommend: Array<{
    id: number;
    type: number;
    name: string;
    copywriter: string;
    picUrl: string;
    // 其他字段...
  }>;
  code: number;
}
```

**使用示例**:

```typescript
import { useRecommendResource } from "@/utils/api";

// 获取推荐资源（需要登录）
try {
  const recommendResource = await useRecommendResource();
  console.log(recommendResource.recommend);
} catch (error) {
  console.error("获取推荐资源失败，可能需要登录");
}
```

### 4.5 评论相关 API

#### 4.5.1 useComment - 获取评论

**功能说明**: 获取歌曲、歌单等的评论。

**参数说明**:

- `type`: number - 评论类型（0:歌曲, 1:MV, 2:歌单, 3:专辑, 4:电台, 5:视频）
- `id`: number - 资源 ID
- `limit`: number - 返回评论数量
- `offset`: number - 偏移量，用于分页

**返回值格式**:

```typescript
{
  comments: Array<{
    id: number;
    user: {
      userId: number;
      nickname: string;
      avatarUrl: string;
    };
    content: string;
    time: number;
    likedCount: number;
    // 其他字段...
  }>;
  total: number;
  code: number;
}
```

**使用示例**:

```typescript
import { useComment } from "@/utils/api";

// 获取歌曲评论
const comments = await useComment(0, 1330877411, 20, 0);
console.log(comments.comments);

// 获取歌单评论
const playlistComments = await useComment(2, 3778678, 20, 0);
console.log(playlistComments.comments);
```

### 4.6 用户相关 API

#### 4.6.1 useUserDetail - 获取用户详情

**功能说明**: 获取用户的详细信息。

**参数说明**:

- `uid`: number - 用户 ID

**返回值格式**:

```typescript
{
  profile: {
    userId: number;
    nickname: string;
    avatarUrl: string;
    backgroundUrl: string;
    signature: string;
    // 其他字段...
  }
  code: number;
}
```

**使用示例**:

```typescript
import { useUserDetail } from "@/utils/api";

// 获取用户详情
try {
  const userDetail = await useUserDetail(32953014);
  console.log(userDetail.profile.nickname);
} catch (error) {
  console.error("获取用户详情失败");
}
```

#### 4.6.2 useLogin - 登录功能

**功能说明**: 网易云音乐账号登录。

**参数说明**:

- `phone`: string - 手机号
- `password`: string - 密码（需加密）

**返回值格式**:

```typescript
{
  account: {
    id: number;
    userName: string;
    // 其他字段...
  }
  profile: {
    userId: number;
    nickname: string;
    // 其他字段...
  }
  token: string;
  code: number;
}
```

**使用示例**:

```typescript
import { useLogin } from "@/utils/api";

// 用户登录
try {
  const loginResult = await useLogin("13800138000", "encrypted_password");
  console.log("登录成功:", loginResult.profile.nickname);
} catch (error) {
  console.error("登录失败:", error.message);
}
```

## 5. 状态管理集成

项目使用 Pinia 进行状态管理，主要包含以下几个 store：

### 5.1 searchStore

管理搜索相关的状态，包括搜索关键词、搜索结果、搜索历史等。

**主要方法**:

- `doSearch(keyword, type)`: 执行搜索
- `loadMore()`: 加载更多搜索结果
- `fetchSuggestions(keyword)`: 获取搜索建议
- `addSearchHistory(keyword)`: 添加搜索历史
- `removeSearchHistory(keyword)`: 删除搜索历史
- `clearSearchHistory()`: 清空搜索历史

### 5.2 personalizedStore

管理推荐歌单相关的状态。

**主要方法**:

- `fetchPersonalized()`: 获取推荐歌单
- `loadMore()`: 加载更多推荐歌单
- `refresh()`: 刷新推荐歌单
- `getPlaylistById(id)`: 根据 ID 获取歌单

### 5.3 playerStore

管理播放器相关的状态，包括当前播放的歌曲、播放状态、播放列表等。

**主要方法**:

- `playSong(song)`: 播放指定歌曲
- `togglePlay()`: 切换播放/暂停
- `next()`: 下一首
- `previous()`: 上一首
- `setPlayMode(mode)`: 设置播放模式

## 6. 兼容性处理

项目通过`compatibility.ts`提供了以下兼容性处理：

### 6.1 浏览器检测

检测用户浏览器类型，确保在不同浏览器环境下的兼容性。

### 6.2 安全 Fetch 调用

提供了带超时、重试和降级处理的安全 Fetch 调用功能。

### 6.3 localStorage 降级

当 localStorage 不可用时，自动降级到使用 Cookie 存储数据。

### 6.4 URL 参数处理

提供了 URL 参数的解析和构建功能，确保在不同环境下的一致性。

## 7. 错误处理

### 7.1 通用错误处理策略

1. **超时处理**: API 调用超时后自动重试或返回友好错误提示
2. **网络错误**: 网络异常时提供离线模式或缓存数据
3. **权限错误**: 对于需要登录的 API，返回明确的错误信息并引导用户登录
4. **数据格式错误**: 对 API 返回的数据进行格式校验，确保应用不会因数据异常而崩溃

### 7.2 常见错误码说明

| 错误码 | 说明         | 处理方式           |
| ------ | ------------ | ------------------ |
| 400    | 请求参数错误 | 检查参数格式       |
| 401    | 未授权       | 引导用户登录       |
| 403    | 权限不足     | 显示权限错误提示   |
| 404    | 资源不存在   | 显示资源不存在提示 |
| 500    | 服务器错误   | 显示服务器错误提示 |
| -1001  | 网络错误     | 重试或使用离线模式 |

## 8. 使用建议

### 8.1 性能优化

1. **缓存策略**: 对不常变化的数据（如歌曲详情）实现缓存，减少重复请求
2. **批量请求**: 多个歌曲详情请求可合并为一个批量请求
3. **懒加载**: 对非核心数据采用懒加载策略
4. **防抖节流**: 搜索输入实现防抖，减少无效请求

### 8.2 安全建议

1. **参数验证**: 所有 API 参数在发送前进行验证，防止注入攻击
2. **错误处理**: 避免将详细错误信息暴露给用户
3. **跨域处理**: 正确配置 CORS，避免跨域安全问题
4. **敏感数据**: 不在 localStorage 中存储敏感信息

## 9. 示例代码

### 9.1 基本 API 调用示例

```typescript
import { useSearch, useSongDetail, usePlaylistDetail } from "@/utils/api";

// 搜索歌曲
async function searchMusic(keyword) {
  try {
    const result = await useSearch(keyword, 1, 20, 0);
    return result.result.songs;
  } catch (error) {
    console.error("搜索失败:", error);
    return [];
  }
}

// 获取歌曲详情
async function getSongInfo(songId) {
  try {
    const result = await useSongDetail(songId);
    return result.songs[0];
  } catch (error) {
    console.error("获取歌曲详情失败:", error);
    return null;
  }
}

// 获取歌单
async function getPlaylist(playlistId) {
  try {
    const result = await usePlaylistDetail(playlistId);
    return result.playlist;
  } catch (error) {
    console.error("获取歌单失败:", error);
    return null;
  }
}
```

### 9.2 与 Vue 组件集成示例

```vue
<template>
  <div>
    <h2>{{ playlist.name || "歌单详情" }}</h2>
    <div class="songs-list">
      <div v-for="song in playlist.tracks" :key="song.id" class="song-item">
        <span>{{ song.name }}</span>
        <span>{{ song.artists.map((artist) => artist.name).join("、") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePlaylistDetail } from "@/utils/api";

const route = useRoute();
const playlist = ref({ tracks: [] });
const loading = ref(true);

onMounted(async () => {
  const playlistId = Number(route.params.id);
  if (playlistId) {
    try {
      const result = await usePlaylistDetail(playlistId);
      playlist.value = result.playlist;
    } catch (error) {
      console.error("获取歌单失败:", error);
    } finally {
      loading.value = false;
    }
  }
});
</script>
```

## 10. 总结

本项目实现了网易云音乐 API 的完整调用功能，支持搜索、歌曲、歌单、推荐、评论和用户等多个模块。通过 TypeScript 的类型定义和 Pinia 的状态管理，使得 API 调用更加安全和高效。同时，项目还提供了完善的兼容性处理和错误处理机制，确保应用在不同环境下的稳定性。

开发者可以通过本文档了解如何使用这些 API 功能，并根据示例代码快速集成到自己的 Vue 组件中。
