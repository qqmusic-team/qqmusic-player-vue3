# 推荐模块 API 集成指南

## 1. API接口选择依据

根据推荐模块（RecommendView.vue）的数据需求，我们需要以下API接口：

| 数据需求 | 推荐使用的网易云音乐API | 接口说明 |
|---------|------------------------|--------|
| 顶部横幅（hero） | /banner | 获取轮播图数据，选择一个作为主要推荐 |
| 顶部横向小卡（topCards） | /personalized | 获取推荐歌单，取前几个作为横向小卡 |
| 私荐歌单（personalPlaylists） | /personalized | 获取个性化推荐歌单 |
| 轻松歌曲（relaxPlaylists） | /top/playlist?cat=轻松 | 获取轻松类型的歌单 |
| 类似喜欢歌曲（likeSongs） | /simi/song | 根据用户喜欢的歌曲推荐相似歌曲 |
| 爱的歌曲推荐（lovedPlaylists） | /simi/playlist | 根据用户喜欢的歌曲推荐相似歌单 |
| 红心歌曲预定（heartSongs） | /personalized/newsong | 获取最新推荐歌曲 |

**选择理由**：
1. 这些API都是网易云音乐官方推荐的个性化推荐接口
2. 接口返回的数据结构与前端组件需求匹配
3. 接口支持必要的参数配置，如分类筛选、数量控制等
4. 所有接口都支持身份验证，能返回个性化内容

## 2. 请求参数配置方法

### 2.1 公共参数

大多数API都支持以下公共参数：
- `limit`：返回数量，默认30
- `offset`：偏移量，用于分页
- `timestamp`：时间戳，防止缓存

### 2.2 接口特定参数

| API | 必要参数 | 可选参数 |
|-----|---------|---------|
| /banner | `type`：轮播类型（1: pc, 2: android, 3: iphone, 4: ipad） | 无 |
| /personalized | 无 | `limit`：返回数量 |
| /top/playlist | `cat`：歌单分类 | `limit`, `offset`, `order`（hot/new） |
| /simi/song | `id`：歌曲ID | `limit` |
| /simi/playlist | `id`：歌曲ID | `limit` |
| /personalized/newsong | 无 | `limit` |

### 2.3 参数配置示例

```typescript
// 获取推荐歌单，限制返回10个
const { result } = await http.get<{ result: Personalized[] }>('/personalized', { limit: 10 })

// 获取轻松类型歌单
const { playlists } = await http.get<{ playlists: PlayListDetail[] }>('/top/playlist', { 
  cat: '轻松',
  limit: 6
})

// 根据歌曲ID获取相似歌曲
const { songs } = await http.get<{ songs: Song[] }>('/simi/song', { 
  id: 123456,
  limit: 10
})
```

## 3. 身份验证机制实现

网易云音乐API使用Cookie进行身份验证，登录后会获取到包含用户信息的Cookie。

### 3.1 登录获取Cookie

```typescript
// 手机号登录
export async function useLogin(phone: string, password: string) {
    return await http.get<{
        code: number,
        cookie: string,
        token: string,
    }>("login/cellphone", {phone: phone, password: password})
}

// 保存登录信息
const loginResult = await useLogin(phone, password);
if (loginResult.code === 200) {
    // 保存Cookie到localStorage或Cookie
    localStorage.setItem('cookie', loginResult.cookie);
}
```

### 3.2 请求中携带Cookie

在http.ts中，已经配置了`withCredentials: true`，这会自动携带Cookie：

```typescript
axios.defaults.withCredentials = true
```

### 3.3 验证登录状态

```typescript
export async function useLoginStatus() {
    return await http.get<{
        data: {
            code: number,
            profile: UserProfile
        },
    }>("login/status")
}
```

## 4. 请求头设置规范

### 4.1 必要的请求头

根据网易云音乐API要求，以下是必要的请求头：

| 请求头 | 值 | 说明 |
|-------|-----|------|
| Content-Type | application/json | POST请求时需要 |
| Referer | https://music.163.com | 防盗链验证 |
| User-Agent | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 | 模拟浏览器请求 |

### 4.2 请求头配置

在http.ts中添加请求头配置：

```typescript
axios.interceptors.request.use(
    (config: AxiosRequestConfig | any) => {
        config.headers = {
            ...config.headers,
            'Referer': 'https://music.163.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        
        if (config.method === 'post') {
            config.headers['Content-Type'] = 'application/json';
        }
        
        config.params = {
            ...config.params,
            t: Date.now(),
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
```

## 5. 错误处理策略

### 5.1 HTTP状态码处理

| 状态码 | 说明 | 处理策略 |
|-------|------|---------|
| 200 | 请求成功 | 正常处理响应数据 |
| 400 | 请求参数错误 | 提示用户输入正确参数 |
| 401 | 未登录/登录过期 | 跳转到登录页面 |
| 403 | 没有权限 | 提示用户没有权限 |
| 404 | 资源不存在 | 显示空状态 |
| 500 | 服务器错误 | 提示服务器错误，稍后重试 |

### 5.2 错误处理实现

在http.ts中完善错误处理：

```typescript
axios.interceptors.response.use(
    (response) => {
        // 检查业务错误
        if (response.data.code !== 200) {
            return Promise.reject(new Error(response.data.msg || '请求失败'));
        }
        return response;
    },
    function (error) {
        // 网络错误处理
        if (!error.response) {
            if (error.message.includes('timeout')) {
                return Promise.reject(new Error('请求超时，请稍后重试'));
            }
            return Promise.reject(new Error('网络错误，请检查网络连接'));
        }
        
        // HTTP状态码处理
        const { status } = error.response;
        switch (status) {
            case 401:
                // 跳转到登录页
                router.push('/login');
                return Promise.reject(new Error('登录已过期，请重新登录'));
            case 403:
                return Promise.reject(new Error('没有权限访问该资源'));
            case 404:
                return Promise.reject(new Error('请求的资源不存在'));
            case 500:
                return Promise.reject(new Error('服务器错误，请稍后重试'));
            default:
                return Promise.reject(new Error(`请求失败，状态码：${status}`));
        }
    }
);
```

### 5.3 组件中错误处理

在组件中使用try/catch处理API调用错误：

```typescript
import { ref, onMounted, reactive } from 'vue';
import { usePersonalized } from '@/utils/api';
import { ElMessage } from 'element-plus';

const personalPlaylists = ref([]);
const loading = ref(false);
const error = ref('');

onMounted(async () => {
    loading.value = true;
    try {
        personalPlaylists.value = await usePersonalized();
    } catch (err: any) {
        error.value = err.message;
        ElMessage.error(err.message);
    } finally {
        loading.value = false;
    }
});
```

## 6. 响应数据解析流程

### 6.1 数据模型映射

根据API返回的数据结构，我们已经定义了相应的TypeScript接口，如：
- `Personalized`：推荐歌单
- `Song`：歌曲信息
- `PlayListDetail`：歌单详情

### 6.2 数据解析示例

```typescript
// 获取推荐歌单
export async function usePersonalized() {
    const { result } = await http.get<{ result: Personalized[] }>('/personalized')
    // 将API返回的数据映射到前端需要的格式
    return result.map(item => ({
        id: item.id,
        name: item.name,
        cover: item.picUrl,
        count: item.playCount,
        description: item.copywriter
    }));
}

// 获取推荐歌曲
export async function usePersonalizedNewSong() {
    const { result } = await http.get<{ result: PersonalizedNewSong[] }>('/personalized/newsong')
    return result.map(item => ({
        id: item.id,
        name: item.song.name,
        artist: item.song.artists.map(ar => ar.name).join(','),
        cover: item.picUrl,
        album: item.song.album.name
    }));
}
```

### 6.3 数据转换工具函数

创建工具函数来处理常见的数据转换：

```typescript
// src/utils/transform.ts

// 格式化播放次数
export function formatPlayCount(count: number): string {
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
}

// 格式化艺术家列表
export function formatArtists(artists: any[]): string {
    return artists.map(ar => ar.name).join(', ');
}

// 格式化歌曲时长
export function formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
```

## 7. 调用频率限制和安全规范

### 7.1 调用频率限制

网易云音乐API有严格的调用频率限制，建议：
1. 对相同API的请求进行缓存
2. 实现请求节流（throttle）或防抖（debounce）
3. 避免短时间内发送大量请求

### 7.2 缓存实现

使用localStorage或sessionStorage缓存API响应：

```typescript
// 带缓存的API调用
export async function usePersonalizedWithCache() {
    const cacheKey = 'personalized_playlists';
    const cacheTimeKey = 'personalized_playlists_time';
    const cacheDuration = 10 * 60 * 1000; // 10分钟
    
    // 检查缓存
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    
    if (cachedData && cachedTime) {
        const now = Date.now();
        if (now - parseInt(cachedTime) < cacheDuration) {
            return JSON.parse(cachedData);
        }
    }
    
    // 缓存不存在或已过期，重新请求
    const data = await usePersonalized();
    
    // 更新缓存
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimeKey, Date.now().toString());
    
    return data;
}
```

### 7.3 安全规范

1. **不要暴露API密钥**：所有API请求都通过后端代理，不要在前端代码中暴露API密钥
2. **使用HTTPS**：确保所有API请求都使用HTTPS
3. **保护用户数据**：不要在前端存储敏感的用户数据
4. **验证用户输入**：对用户输入的参数进行验证，防止XSS攻击
5. **使用CSP**：配置内容安全策略，防止恶意脚本执行

## 8. 完整的API调用代码示例

### 8.1 推荐模块API调用实现

```typescript
// src/views/RecommendView.vue
<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useBanner, usePersonalized, usePersonalizedNewSong } from '@/utils/api';
import { formatPlayCount } from '@/utils/transform';
import { ElMessage } from 'element-plus';

const username = ref("幸运函");
const likeKeyword = ref("身骑白马");

// 顶部大卡
const hero = reactive({
    title: "放松吧",
    subtitle: "尝试来点儿音乐提提神吧～",
    cover: "././src/assets/imgs/1.png"
});

// 数据列表
const topCards = ref([]);
const personalPlaylists = ref([]);
const relaxPlaylists = ref([]);
const likeSongs = ref([]);
const lovedPlaylists = ref([]);
const heartSongs = ref([]);

// 加载状态
const loading = reactive({
    personalPlaylists: false,
    relaxPlaylists: false,
    likeSongs: false,
    lovedPlaylists: false,
    heartSongs: false
});

// 获取轮播图（顶部大卡）
onMounted(async () => {
    try {
        const banners = await useBanner();
        if (banners.length > 0) {
            hero.title = banners[0].typeTitle || "放松吧";
            hero.subtitle = banners[0].note || "尝试来点儿音乐提提神吧～";
            hero.cover = banners[0].imageUrl;
        }
    } catch (err: any) {
        ElMessage.error('加载轮播图失败');
    }
});

// 获取推荐歌单
onMounted(async () => {
    loading.personalPlaylists = true;
    try {
        const data = await usePersonalized();
        personalPlaylists.value = data.slice(0, 6).map(item => ({
            id: item.id,
            name: item.name,
            cover: item.picUrl,
            countText: formatPlayCount(item.playCount),
            description: item.copywriter
        }));
        
        // 顶部横向小卡使用前4个推荐歌单
        topCards.value = data.slice(0, 4).map(item => ({
            id: item.id,
            cover: item.picUrl,
            label: item.name
        }));
    } catch (err: any) {
        ElMessage.error('加载推荐歌单失败');
    } finally {
        loading.personalPlaylists = false;
    }
});

// 获取推荐歌曲
onMounted(async () => {
    loading.heartSongs = true;
    try {
        const data = await usePersonalizedNewSong();
        heartSongs.value = data.slice(0, 10).map(item => ({
            id: item.id,
            name: item.name,
            artist: item.artist,
            cover: item.cover,
            album: item.album
        }));
    } catch (err: any) {
        ElMessage.error('加载推荐歌曲失败');
    } finally {
        loading.heartSongs = false;
    }
});

// 获取轻松歌单
onMounted(async () => {
    loading.relaxPlaylists = true;
    try {
        // 这里假设已经实现了获取分类歌单的API
        const data = await usePlaylistByCategory('轻松', 6);
        relaxPlaylists.value = data.map(item => ({
            id: item.id,
            name: item.name,
            cover: item.coverImgUrl,
            countText: formatPlayCount(item.playCount),
            description: item.description
        }));
    } catch (err: any) {
        ElMessage.error('加载轻松歌单失败');
    } finally {
        loading.relaxPlaylists = false;
    }
});

// 播放歌曲
function playSong(song) {
    console.log('播放歌曲:', song);
    // 调用播放服务
}

// 打开歌单
function openPlaylist(playlist) {
    console.log('打开歌单:', playlist);
    // 跳转到歌单详情页
    // router.push(`/playlist/${playlist.id}`);
}
</script>
```

### 8.2 API扩展

在api.ts中添加缺少的API调用：

```typescript
// src/utils/api.ts

// 根据分类获取歌单
export async function usePlaylistByCategory(cat: string, limit: number = 30, offset: number = 0) {
    const { playlists } = await http.get<{ playlists: PlayListDetail[] }>('top/playlist', {
        cat: cat,
        limit: limit,
        offset: offset
    });
    return playlists;
}

// 根据歌曲ID获取相似歌曲
export async function useSimilarSongs(id: number, limit: number = 30) {
    const { songs } = await http.get<{ songs: Song[] }>('simi/song', {
        id: id,
        limit: limit
    });
    return songs;
}

// 根据歌曲ID获取相似歌单
export async function useSimilarPlaylists(id: number, limit: number = 10) {
    const { playlists } = await http.get<{ playlists: PlayListDetail[] }>('simi/playlist', {
        id: id,
        limit: limit
    });
    return playlists;
}
```

## 9. 总结

本指南详细说明了如何在推荐模块中集成网易云音乐API，包括：
1. API接口的选择依据
2. 请求参数的配置方法
3. 身份验证机制的实现
4. 请求头的设置规范
5. 错误处理策略
6. 响应数据的解析流程
7. 调用频率限制和安全规范
8. 完整的API调用代码示例

通过遵循本指南，您可以实现一个功能完善、性能优良的推荐模块，为用户提供个性化的音乐推荐体验。