# 网易云音乐 API 调用文档
https://binaryify.github.io/NeteaseCloudMusicApi/#/?id=neteasecloudmusicapi（api原文档）
## 目录

- [基础设置](#基础设置)
- [认证相关](#认证相关)
- [歌曲相关](#歌曲相关)
- [歌单相关](#歌单相关)
- [歌手相关](#歌手相关)
- [专辑相关](#专辑相关)
- [视频相关](#视频相关)
- [搜索相关](#搜索相关)
- [个性化推荐](#个性化推荐)
- [错误处理](#错误处理)
- [调用频率限制](#调用频率限制)
- [认证方式详解](#认证方式详解)
- [注意事项](#注意事项)

## 基础设置

### API 基础 URL

API 基础 URL 存储在 localStorage 中，键名为'BASE_URL'。

```javascript
axios.defaults.baseURL = localStorage.getItem("BASE_URL")?.toString();
```

### 请求配置

- 超时时间: 20 秒
- 最大请求体大小: 5MB
- 自动携带凭证: true

```javascript
axios.defaults.timeout = 20 * 1000;
axios.defaults.maxBodyLength = 5 * 1024 * 1024;
axios.defaults.withCredentials = true;
```

### 请求拦截器

每次请求会自动添加时间戳参数以避免缓存问题。

```javascript
axios.interceptors.request.use(
  (config: AxiosRequestConfig | any) => {
    config.params = {
      ...config.params,
      t: Date.now(),
    };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
```

### 实际应用示例

```typescript
// 搜索义勇军进行曲示例（来自 LocalMusicView.vue）
const response = await http.get<{
  result?: {
    songs?: Song[];
  };
  code: number;
}>("search", {
  keywords: "义勇军进行曲",
  type: 1, // 1: 单曲搜索
  limit: 1, // 只获取第一个结果
});

// 处理响应结果
if (response.code === 200 && response.result?.songs?.length > 0) {
  console.log("搜索结果:", response.result.songs[0]);
  songInfo.value = response.result.songs[0];
} else {
  error.value = "未找到相关歌曲信息";
}
```

## 认证相关

### useLogin

**功能**: 手机号登录

**函数签名**:

```typescript
useLogin(phone: string, password: string): Promise<{
    code: number;
    cookie: string;
    token: string;
}>
```

**参数说明**:

- `phone`: 手机号
- `password`: 登录密码

**请求示例**:

```javascript
const response = await useLogin("13800138000", "password123");
```

**响应示例**:

```json
{
  "code": 200,
  "cookie": "NMTID=...",
  "token": "..."
}
```

### useLoginStatus

**功能**: 获取登录状态

**函数签名**:

```typescript
useLoginStatus(): Promise<{
    data: {
        code: number;
        profile: UserProfile;
    };
}>
```

**请求示例**:

```javascript
const status = await useLoginStatus();
```

**响应示例**:

```json
{
  "data": {
    "code": 200,
    "profile": {
      "userId": 1234567,
      "nickname": "用户名",
      "avatarUrl": "https://p2.music.126.net/...",
      "gender": 0,
      "birthday": 0,
      "city": 0,
      "province": 0,
      "signature": "个性签名",
      "description": "",
      "backgroundUrl": "https://p2.music.126.net/..."
    }
  }
}
```

## 歌曲相关

### useSongUrl

**功能**: 获取歌曲 URL

**函数签名**:

```typescript
useSongUrl(id: number): Promise<{
    data: Array<{
        id: number;
        url: string;
        br: number;
        size: number;
        type: string;
        encodeType: string;
    }>;
}>
```

**参数说明**:

- `id`: 歌曲 ID

**请求示例**:

```javascript
const songUrl = await useSongUrl(12345678);
```

**响应示例**:

```json
{
  "data": [
    {
      "id": 12345678,
      "url": "https://music.163.com/song/media/outer/url?id=12345678.mp3",
      "br": 320000,
      "size": 9876543,
      "type": "mp3",
      "encodeType": "mp3"
    }
  ]
}
```

### useSongDetail

**功能**: 获取歌曲详情

**函数签名**:

```typescript
useSongDetail(ids: string): Promise<{
    songs: Song[];
    privileges: Array<{
        id: number;
        fee: number;
        payed: number;
        cp: number;
        maxbr: number;
        fl: number;
        toast: boolean;
    }>;
}>
```

**参数说明**:

- `ids`: 歌曲 ID 列表，多个 ID 用逗号分隔

**请求示例**:

```javascript
const songDetail = await useSongDetail("12345678,87654321");
```

**响应示例**:

```json
{
  "songs": [
    {
      "id": 12345678,
      "name": "歌曲名称",
      "ar": [
        {
          "id": 1234,
          "name": "歌手名"
        }
      ],
      "al": {
        "id": 5678,
        "name": "专辑名",
        "picUrl": "https://p2.music.126.net/..."
      },
      "dt": 240000
    }
  ],
  "privileges": [
    {
      "id": 12345678,
      "fee": 0,
      "payed": 0,
      "cp": 123,
      "maxbr": 320000,
      "fl": 320000,
      "toast": false
    }
  ]
}
```

### useSongLyric

**功能**: 获取歌词

**函数签名**:

```typescript
useSongLyric(id: number): Promise<{
    lrc?: {
        version: number;
        lyric: string;
    };
    tlyric?: {
        version: number;
        lyric: string;
    };
    klyric?: {
        version: number;
        lyric: string;
    };
}>
```

**参数说明**:

- `id`: 歌曲 ID

**请求示例**:

```javascript
const lyric = await useSongLyric(12345678);
```

**响应示例**:

```json
{
  "lrc": {
    "version": 1,
    "lyric": "[00:00.000] 作曲 : 歌手名\n[00:01.000] 作词 : 作词人\n[00:15.000] 歌曲内容..."
  },
  "tlyric": {
    "version": 1,
    "lyric": "[00:15.000] Translation content..."
  }
}
```

## 歌单相关

### usePlayListDetail

**功能**: 获取歌单详情

**函数签名**:

```typescript
usePlayListDetail(id: number): Promise<{
    playlist: PlayListDetail;
}>
```

**参数说明**:

- `id`: 歌单 ID

**请求示例**:

```javascript
const playlistDetail = await usePlayListDetail(12345678);
```

**响应示例**:

```json
{
  "playlist": {
    "id": 12345678,
    "name": "歌单名称",
    "coverImgUrl": "https://p2.music.126.net/...",
    "description": "歌单描述",
    "creator": {
      "id": 1234,
      "nickname": "创建者昵称",
      "avatarUrl": "https://p2.music.126.net/..."
    },
    "tracks": [
      {
        "id": 87654321,
        "name": "歌曲名称",
        "ar": [
          {
            "id": 1234,
            "name": "歌手名"
          }
        ],
        "al": {
          "id": 5678,
          "name": "专辑名",
          "picUrl": "https://p2.music.126.net/..."
        },
        "dt": 240000
      }
    ],
    "trackCount": 1,
    "subscribedCount": 1000,
    "playCount": 10000
  }
}
```

### useUserPlaylist

**功能**: 获取用户歌单

**函数签名**:

```typescript
useUserPlaylist(uid: number, limit?: number, offset?: number): Promise<{
    playlist: Array<{
        id: number;
        name: string;
        coverImgUrl: string;
        trackCount: number;
    }>;
    more: boolean;
    count: number;
}>
```

**参数说明**:

- `uid`: 用户 ID
- `limit`: 返回数量，默认 30
- `offset`: 偏移量，默认 0

**请求示例**:

```javascript
const userPlaylists = await useUserPlaylist(1234567, 20, 0);
```

**响应示例**:

```json
{
  "playlist": [
    {
      "id": 12345678,
      "name": "歌单1",
      "coverImgUrl": "https://p2.music.126.net/...",
      "trackCount": 50
    },
    {
      "id": 87654321,
      "name": "歌单2",
      "coverImgUrl": "https://p2.music.126.net/...",
      "trackCount": 30
    }
  ],
  "more": false,
  "count": 2
}
```

## 歌手相关

### useArtistDetail

**功能**: 获取歌手详情

**函数签名**:

```typescript
useArtistDetail(id: number): Promise<{
    artist: Artist;
    hotSongs: Song[];
    code: number;
}>
```

**参数说明**:

- `id`: 歌手 ID

**请求示例**:

```javascript
const artistDetail = await useArtistDetail(1234567);
```

**响应示例**:

```json
{
  "artist": {
    "id": 1234567,
    "name": "歌手名称",
    "img1v1Url": "https://p2.music.126.net/...",
    "alias": ["别名1", "别名2"],
    "musicSize": 100,
    "albumSize": 20,
    "mvSize": 10
  },
  "hotSongs": [
    {
      "id": 87654321,
      "name": "热门歌曲1",
      "ar": [
        {
          "id": 1234567,
          "name": "歌手名称"
        }
      ],
      "al": {
        "id": 5678,
        "name": "专辑名",
        "picUrl": "https://p2.music.126.net/..."
      },
      "dt": 240000
    }
  ],
  "code": 200
}
```

### useArtistMv

**功能**: 获取歌手 MV 列表

**函数签名**:

```typescript
useArtistMv(id: number, limit?: number, offset?: number): Promise<{
    mvs: Mv[];
    code: number;
}>
```

**参数说明**:

- `id`: 歌手 ID
- `limit`: 返回数量，默认 30
- `offset`: 偏移量，默认 0

**请求示例**:

```javascript
const artistMvs = await useArtistMv(1234567, 20, 0);
```

**响应示例**:

```json
{
  "mvs": [
    {
      "id": 12345678,
      "name": "MV名称",
      "cover": "https://p2.music.126.net/...",
      "artistName": "歌手名称",
      "playCount": 100000,
      "publishTime": "2023-01-01",
      "duration": 300000
    }
  ],
  "code": 200
}
```

## 专辑相关

### useAlbumDetail

**功能**: 获取专辑详情

**函数签名**:

```typescript
useAlbumDetail(id: number): Promise<{
    album: {
        id: number;
        name: string;
        artist: {
            id: number;
            name: string;
        };
        publishTime: number;
        description: string;
        picUrl: string;
        tracks: Song[];
    };
    code: number;
}>
```

**参数说明**:

- `id`: 专辑 ID

**请求示例**:

```javascript
const albumDetail = await useAlbumDetail(12345678);
```

**响应示例**:

```json
{
  "album": {
    "id": 12345678,
    "name": "专辑名称",
    "artist": {
      "id": 1234567,
      "name": "歌手名称"
    },
    "publishTime": 1640995200000,
    "description": "专辑描述",
    "picUrl": "https://p2.music.126.net/...",
    "tracks": [
      {
        "id": 87654321,
        "name": "歌曲名称",
        "ar": [
          {
            "id": 1234567,
            "name": "歌手名称"
          }
        ],
        "al": {
          "id": 12345678,
          "name": "专辑名称",
          "picUrl": "https://p2.music.126.net/..."
        },
        "dt": 240000
      }
    ]
  },
  "code": 200
}
```

## 视频相关

### useMvDetail

**功能**: 获取 MV 详情

**函数签名**:

```typescript
useMvDetail(id: number): Promise<{
    data: {
        id: number;
        name: string;
        artistName: string;
        cover: string;
        playCount: number;
        publishTime: string;
        duration: number;
        description: string;
    };
    code: number;
}>
```

**参数说明**:

- `id`: MV ID

**请求示例**:

```javascript
const mvDetail = await useMvDetail(12345678);
```

**响应示例**:

```json
{
  "data": {
    "id": 12345678,
    "name": "MV名称",
    "artistName": "歌手名称",
    "cover": "https://p2.music.126.net/...",
    "playCount": 100000,
    "publishTime": "2023-01-01",
    "duration": 300000,
    "description": "MV描述"
  },
  "code": 200
}
```

### useMvUrl

**功能**: 获取 MV 播放地址

**函数签名**:

```typescript
useMvUrl(id: number, r?: number): Promise<{
    data: {
        id: number;
        url: string;
        size: number;
        r: number;
    }[];
    code: number;
}>
```

**参数说明**:

- `id`: MV ID
- `r`: 分辨率，默认 1080

**请求示例**:

```javascript
const mvUrl = await useMvUrl(12345678, 720);
```

**响应示例**:

```json
{
  "data": [
    {
      "id": 12345678,
      "url": "https://music.163.com/song/media/outer/url?id=12345678.mp4",
      "size": 50000000,
      "r": 720
    }
  ],
  "code": 200
}
```

## 搜索相关

### useSearch

**功能**: 搜索

**函数签名**:

```typescript
useSearch(keywords: string, type?: number, limit?: number, offset?: number): Promise<{
    result?: {
        songs?: Song[];
        playlists?: Array<{
            id: number;
            name: string;
            coverImgUrl: string;
            description: string;
            trackCount: number;
        }>;
        artists?: Array<{
            id: number;
            name: string;
            img1v1Url: string;
            albumSize: number;
            musicSize: number;
        }>;
        albums?: Array<{
            id: number;
            name: string;
            artist: {
                id: number;
                name: string;
            };
            picUrl: string;
            publishTime: number;
            size: number;
        }>;
        mvs?: Mv[];
    };
    code: number;
}>
```

**参数说明**:

- `keywords`: 搜索关键词
- `type`: 搜索类型，1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1004: MV, 1014: 歌词
- `limit`: 返回数量，默认 30
- `offset`: 偏移量，默认 0

**请求示例**:

```javascript
const searchResult = await useSearch("周杰伦", 1, 20, 0);
```

**响应示例**:

```json
{
  "result": {
    "songs": [
      {
        "id": 12345678,
        "name": "歌曲名称",
        "ar": [
          {
            "id": 1234,
            "name": "周杰伦"
          }
        ],
        "al": {
          "id": 5678,
          "name": "专辑名",
          "picUrl": "https://p2.music.126.net/..."
        },
        "dt": 240000
      }
    ]
  },
  "code": 200
}
```

### useSearchSuggest

**功能**: 搜索建议

**函数签名**:

```typescript
useSearchSuggest(keywords: string, type?: string): Promise<{
    result?: {
        allMatch?: Array<{
            keyword: string;
            type: number;
            score: number;
        }>;
        songs?: Array<{
            id: number;
            name: string;
            artists: Array<{
                id: number;
                name: string;
            }>;
            albumname: string;
        }>;
        albums?: Array<{
            id: number;
            name: string;
            artistname: string;
        }>;
        artists?: Array<{
            id: number;
            name: string;
        }>;
        playlists?: Array<{
            id: number;
            name: string;
            trackCount: number;
        }>;
        mvs?: Array<{
            id: number;
            name: string;
            artistName: string;
        }>;
    };
    code: number;
}>
```

**参数说明**:

- `keywords`: 搜索关键词
- `type`: 搜索类型，默认为'all'

**请求示例**:

```javascript
const suggestions = await useSearchSuggest("周杰伦");
```

**响应示例**:

```json
{
  "result": {
    "allMatch": [
      {
        "keyword": "周杰伦",
        "type": 1,
        "score": 10000
      }
    ],
    "songs": [
      {
        "id": 12345678,
        "name": "青花瓷",
        "artists": [
          {
            "id": 6452,
            "name": "周杰伦"
          }
        ],
        "albumname": "我很忙"
      }
    ]
  },
  "code": 200
}
```

### useSearchHotDetail

**功能**: 热搜列表详情

**函数签名**:

```typescript
useSearchHotDetail(): Promise<{
    data?: Array<{
        first: string;
        second: number;
        third?: any;
        iconType?: number;
        iconUrl?: string;
    }>;
    code: number;
}>
```

**请求示例**:

```javascript
const hotSearches = await useSearchHotDetail();
```

**响应示例**:

```json
{
  "data": [
    {
      "first": "热门搜索词1",
      "second": 1,
      "iconType": 1,
      "iconUrl": "https://p2.music.126.net/..."
    },
    {
      "first": "热门搜索词2",
      "second": 2
    }
  ],
  "code": 200
}
```

## 个性化推荐

### useBanner

**功能**: 获取轮播图

**函数签名**:

```typescript
useBanner(type?: number): Promise<{
    banners: Banner[];
    code: number;
}>
```

**参数说明**:

- `type`: 资源类型，0: pc, 1: android, 2: iphone, 3: ipad

**请求示例**:

```javascript
const banners = await useBanner(0);
```

**响应示例**:

```json
{
  "banners": [
    {
      "imageUrl": "https://p2.music.126.net/...",
      "targetId": 12345678,
      "targetType": 1,
      "titleColor": "#ffffff",
      "typeTitle": "歌单",
      "exclusive": false
    }
  ],
  "code": 200
}
```

### usePersonalized

**功能**: 获取推荐歌单

**函数签名**:

```typescript
usePersonalized(limit?: number): Promise<{
    result: Personalized[];
    code: number;
}>
```

**参数说明**:

- `limit`: 返回数量，默认 30

**请求示例**:

```javascript
const personalizedPlaylists = await usePersonalized(20);
```

**响应示例**:

```json
{
  "result": [
    {
      "id": 12345678,
      "name": "推荐歌单1",
      "picUrl": "https://p2.music.126.net/...",
      "playCount": 1000000,
      "description": "歌单描述",
      "copywriter": "编辑推荐"
    }
  ],
  "code": 200
}
```

### usePersonalizedNewSong

**功能**: 获取推荐新歌曲

**函数签名**:

```typescript
usePersonalizedNewSong(limit?: number): Promise<{
    result: Array<{
        id: number;
        name: string;
        song?: Song;
        artists: Array<{
            id: number;
            name: string;
        }>;
        album: {
            id: number;
            name: string;
        };
        publishTime: number;
    }>;
    code: number;
}>
```

**参数说明**:

- `limit`: 返回数量，默认 10

**请求示例**:

```javascript
const newSongs = await usePersonalizedNewSong(15);
```

**响应示例**:

```json
{
  "result": [
    {
      "id": 12345678,
      "name": "新歌名称",
      "artists": [
        {
          "id": 1234,
          "name": "歌手名"
        }
      ],
      "album": {
        "id": 5678,
        "name": "专辑名"
      },
      "publishTime": 1640995200000
    }
  ],
  "code": 200
}
```

### usePersonalizedMv

**功能**: 获取推荐 MV

**函数签名**:

```typescript
usePersonalizedMv(limit?: number): Promise<{
    result: Array<{
        id: number;
        name: string;
        artistName: string;
        cover: string;
        playCount: number;
        publishTime: string;
        duration: number;
    }>;
    code: number;
}>
```

**参数说明**:

- `limit`: 返回数量，默认 10

**请求示例**:

```javascript
const recommendedMvs = await usePersonalizedMv(15);
```

**响应示例**:

```json
{
  "result": [
    {
      "id": 12345678,
      "name": "MV名称",
      "artistName": "歌手名称",
      "cover": "https://p2.music.126.net/...",
      "playCount": 100000,
      "publishTime": "2023-01-01",
      "duration": 300000
    }
  ],
  "code": 200
}
```

### useTopListDetail

**功能**: 获取排行榜详情

**函数签名**:

```typescript
useTopListDetail(): Promise<{
    list: TopListDetail[];
    code: number;
}>
```

**请求示例**:

```javascript
const topLists = await useTopListDetail();
```

**响应示例**:

```json
{
  "list": [
    {
      "id": 19723756,
      "name": "热歌榜",
      "coverImgUrl": "https://p2.music.126.net/...",
      "updateFrequency": "每日更新",
      "tracks": [
        {
          "first": "歌手名",
          "second": "歌曲名称",
          "duration": 240000
        }
      ],
      "playCount": 10000000
    }
  ],
  "code": 200
}
```

## 错误处理

### 常见错误码

| 错误码 | 说明            | 处理建议                   |
| ------ | --------------- | -------------------------- |
| 400    | 请求参数错误    | 检查参数格式和内容是否正确 |
| 401    | 未授权/登录过期 | 重新登录获取新的 token     |
| 403    | 没有权限        | 检查用户是否有足够权限     |
| 404    | 资源不存在      | 确认请求的 ID 是否正确     |
| 429    | 请求过于频繁    | 实现请求限流，降低请求频率 |
| 500    | 服务器错误      | 稍后重试，或联系服务提供商 |

### 实际错误处理示例

```typescript
// 来自 LocalMusicView.vue 的错误处理示例
try {
  const response = await http.get<{...}>('search', {...});
  // 处理响应
} catch (err: unknown) {
  // 类型安全的错误处理
  const errorMessage = err instanceof Error ? err.message : "网络请求失败";
  error.value = errorMessage;
  console.error("搜索歌曲失败:", err);
}
```

## 调用频率限制

### 限制说明

- 单 IP 请求频率限制：每分钟最多 120 次请求
- 单用户请求频率限制：每分钟最多 60 次请求
- 特殊接口（如搜索）可能有更严格的限制

### 最佳实践

- 实现请求缓存机制，避免重复请求相同数据
- 使用请求队列和限流策略，控制并发请求数量
- 在用户交互触发的 API 调用中添加防抖和节流处理
- 对于批量操作，实现分批请求处理

### 示例：实现简单的限流机制

```javascript
class APILimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requestTimestamps = [];
  }

  async waitForSlot() {
    const now = Date.now();
    // 清除过期的请求时间戳
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    // 如果请求数达到上限，等待最旧的请求过期
    if (this.requestTimestamps.length >= this.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + this.timeWindow - now;
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      return this.waitForSlot(); // 递归检查，确保有足够的 slots
    }

    // 添加当前请求时间戳
    this.requestTimestamps.push(Date.now());
    return;
  }

  async executeWithLimit(apiCall) {
    await this.waitForSlot();
    return apiCall();
  }
}

// 使用示例
const limiter = new APILimiter();
const result = await limiter.executeWithLimit(() => useSongUrl(12345678));
```

## 认证方式详解

### Cookie 认证

- 登录成功后，服务器会返回 cookie，包含用户认证信息
- 后续请求会自动携带这些 cookie（因为`withCredentials: true`）
- 建议在本地存储 cookie，以便在页面刷新后恢复登录状态

### Token 认证

- 部分 API 可能需要在请求头中携带 Authorization token
- 登录成功后会返回 token，可以存储在 localStorage 或 sessionStorage 中

### 认证实现示例

```javascript
// 登录后保存token和cookie
const response = await useLogin("phone", "password");
localStorage.setItem("USER-TOKEN", response.token);
localStorage.setItem("USER-COOKIE", response.cookie);
document.cookie = response.cookie;

// 在axios拦截器中添加token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("USER-TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 页面加载时恢复登录状态
onMounted(async () => {
  const token = localStorage.getItem("USER-TOKEN");
  const cookie = localStorage.getItem("USER-COOKIE");
  if (token && cookie) {
    document.cookie = cookie;
    const status = await useLoginStatus();
    // 处理登录状态
  }
});
```

## 注意事项

1. **数据缓存**：对于不常变动的数据（如歌曲详情、歌手信息等），建议实现本地缓存机制
2. **错误重试**：对于网络波动导致的请求失败，可以实现自动重试机制，但注意不要无限重试
3. **响应数据处理**：部分 API 返回的数据结构可能会变化，建议在使用前进行数据验证
4. **隐私保护**：不要在日志中记录用户敏感信息，如密码、完整的 cookie 等
5. **跨域问题**：如果遇到跨域问题，可以配置代理服务器转发请求
6. **权限检查**：对于需要登录的页面，可以在路由守卫中实现权限检查
7. **空值安全处理**：使用可选链操作符 (`?.`) 和默认值，避免访问未定义属性导致的运行时错误

```javascript
// 路由守卫示例
router.beforeEach((to, from, next) => {
  // 检查是否需要权限
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const userStore = useUserStore();
    if (userStore.isLogin) {
      next();
    } else {
      // 显示登录弹窗或跳转到登录页
      userStore.showLogin = true;
      next(false);
    }
  } else {
    next();
  }
});
```

## 更新日志

- 文档版本：1.1
- 更新日期：2024-01-01
- 主要更新：
  - 添加了 HTTP 工具使用章节，反映实际 API 调用方式
  - 更新了搜索相关章节，移除了 `useSearch` 函数的推荐使用，改为使用 `http.get` 直接调用
  - 添加了实际项目中的搜索请求示例（来自 LocalMusicView.vue）
  - 更新了错误处理示例，反映项目中的实际错误处理方式
  - 添加了空值安全处理的注意事项
  - 调整了文档结构，使内容更符合实际项目使用场景