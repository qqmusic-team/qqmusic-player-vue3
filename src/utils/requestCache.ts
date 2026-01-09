/**
 * 请求缓存和去重工具
 * 用于优化 API 请求性能，避免重复请求
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

// 缓存存储
const cache = new Map<string, CacheEntry<unknown>>();

// 进行中的请求存储（用于去重）
const pendingRequests = new Map<string, PendingRequest<unknown>>();

// 默认缓存时间：5分钟
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// 最大缓存条目数
const MAX_CACHE_ENTRIES = 100;

/**
 * 生成缓存键
 */
export function generateCacheKey(url: string, params?: unknown): string {
  const paramStr = params ? JSON.stringify(params) : "";
  return `${url}:${paramStr}`;
}

/**
 * 检查缓存是否有效
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() < entry.expiresAt;
}

/**
 * 清理过期缓存
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  cache.forEach((entry, key) => {
    if (now >= entry.expiresAt) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => cache.delete(key));

  // 如果缓存条目过多，删除最旧的
  if (cache.size > MAX_CACHE_ENTRIES) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const deleteCount = cache.size - MAX_CACHE_ENTRIES;
    for (let i = 0; i < deleteCount; i++) {
      cache.delete(entries[i][0]);
    }
  }
}

/**
 * 带缓存的请求封装
 * @param key 缓存键
 * @param fetcher 实际的请求函数
 * @param duration 缓存有效期（毫秒）
 * @returns 请求结果
 */
export async function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = DEFAULT_CACHE_DURATION
): Promise<T> {
  // 1. 检查缓存
  const cachedEntry = cache.get(key) as CacheEntry<T> | undefined;
  if (isCacheValid(cachedEntry)) {
    console.debug(`[Cache] Hit: ${key}`);
    return cachedEntry.data;
  }

  // 2. 检查是否有相同的请求正在进行
  const pending = pendingRequests.get(key) as PendingRequest<T> | undefined;
  if (pending) {
    console.debug(`[Cache] Dedup: ${key}`);
    return pending.promise;
  }

  // 3. 发起新请求
  console.debug(`[Cache] Fetch: ${key}`);
  const promise = fetcher();

  // 记录进行中的请求
  pendingRequests.set(key, {
    promise: promise as Promise<unknown>,
    timestamp: Date.now(),
  });

  try {
    const data = await promise;

    // 存入缓存
    const now = Date.now();
    cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });

    // 清理过期缓存
    cleanExpiredCache();

    return data;
  } finally {
    // 无论成功失败，都移除进行中的请求记录
    pendingRequests.delete(key);
  }
}

/**
 * 清除指定缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
    console.debug(`[Cache] Cleared: ${key}`);
  } else {
    cache.clear();
    console.debug("[Cache] Cleared all");
  }
}

/**
 * 清除匹配前缀的缓存
 */
export function clearCacheByPrefix(prefix: string): void {
  const keysToDelete: string[] = [];

  cache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => cache.delete(key));
  console.debug(`[Cache] Cleared ${keysToDelete.length} entries with prefix: ${prefix}`);
}

/**
 * 预加载数据到缓存
 */
export function preloadCache<T>(
  key: string,
  data: T,
  duration: number = DEFAULT_CACHE_DURATION
): void {
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + duration,
  });
}

/**
 * 获取缓存状态信息
 */
export function getCacheStats(): { size: number; pending: number } {
  cleanExpiredCache();
  return {
    size: cache.size,
    pending: pendingRequests.size,
  };
}

/**
 * 请求取消控制器管理
 */
const abortControllers = new Map<string, AbortController>();

/**
 * 创建可取消的请求
 */
export function createCancellableRequest(key: string): AbortController {
  // 取消之前相同 key 的请求
  const existing = abortControllers.get(key);
  if (existing) {
    existing.abort();
  }

  const controller = new AbortController();
  abortControllers.set(key, controller);
  return controller;
}

/**
 * 取消请求
 */
export function cancelRequest(key: string): void {
  const controller = abortControllers.get(key);
  if (controller) {
    controller.abort();
    abortControllers.delete(key);
  }
}

/**
 * 清理请求控制器
 */
export function cleanupController(key: string): void {
  abortControllers.delete(key);
}
