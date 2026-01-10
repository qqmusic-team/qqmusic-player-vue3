const PLAY_HISTORY_KEY = "qqmusic_play_history_v1";

export interface PlayRecord {
  id: number | string;
  name: string;
  artist: string;
  album: string;
  cover: string;
  playCount: number;
  lastPlayedAt: number;
  playDates: number[];
}

// 配置项：最大播放历史记录数量
export const MAX_HISTORY_RECORDS = 100;

export function getPlayHistory(): PlayRecord[] {
  try {
    const data = localStorage.getItem(PLAY_HISTORY_KEY);
    if (!data) return [];

    const parsedData = JSON.parse(data);
    let records: PlayRecord[];

    // 处理旧版本的数据结构（可能是对象而不是数组）
    if (Array.isArray(parsedData)) {
      records = parsedData;
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // 转换对象为数组（旧版本可能使用Map序列化）
      records = Object.values(parsedData);
    } else {
      return [];
    }

    // 为旧记录添加默认的 playCount 值
    return records
      .map(record => ({
        ...record,
        playCount: record.playCount || 0,
        lastPlayedAt: record.lastPlayedAt || 0,
        playDates: record.playDates || []
      }))
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
  } catch (error) {
    console.error("读取播放历史失败:", error);
    return [];
  }
}

// 内部函数：获取播放历史的 Map 格式（用于内部处理）
function getPlayHistoryMap(): Map<number | string, PlayRecord> {
  try {
    const data = localStorage.getItem(PLAY_HISTORY_KEY);
    if (!data) return new Map();

    const parsedData = JSON.parse(data);
    let records: PlayRecord[];

    // 处理旧版本的数据结构（可能是对象而不是数组）
    if (Array.isArray(parsedData)) {
      records = parsedData;
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // 转换对象为数组（旧版本可能使用Map序列化）
      records = Object.values(parsedData);
    } else {
      return new Map();
    }

    const map = new Map<number | string, PlayRecord>();
    records.forEach((record: PlayRecord) => {
      // 为旧记录添加所有必要的默认值
      map.set(record.id, {
        ...record,
        playCount: record.playCount || 0,
        lastPlayedAt: record.lastPlayedAt || 0,
        playDates: record.playDates || []
      });
    });
    return map;
  } catch (error) {
    console.error("读取播放历史 Map 失败:", error);
    return new Map();
  }
}

export function savePlayHistory(history: Map<number | string, PlayRecord>): void {
  try {
    // 将记录按最后播放时间倒序排列，保留最新的 MAX_HISTORY_RECORDS 条记录
    const records = Array.from(history.values())
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
      .slice(0, MAX_HISTORY_RECORDS);
    localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("保存播放历史失败:", error);
  }
}

export function recordPlay(song: {
  id: number | string;
  name: string;
  artist: string;
  album: string;
  cover: string;
}): void {
  const history = getPlayHistoryMap();
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);

  const existingRecord = history.get(song.id);

  if (existingRecord) {
    existingRecord.playCount++;
    existingRecord.lastPlayedAt = now;

    if (!existingRecord.playDates.includes(today)) {
      existingRecord.playDates.push(today);
    }

    history.set(song.id, existingRecord);
  } else {
    const newRecord: PlayRecord = {
      id: song.id,
      name: song.name,
      artist: song.artist,
      album: song.album,
      cover: song.cover,
      playCount: 1,
      lastPlayedAt: now,
      playDates: [today]
    };
    history.set(song.id, newRecord);
  }

  savePlayHistory(history);
}

export function getTodayPlays(): PlayRecord[] {
  const history = getPlayHistory();
  const today = new Date().setHours(0, 0, 0, 0);

  return Array.from(history.values())
    .filter(record => record.playDates.includes(today))
    .sort((a, b) => b.playCount - a.playCount);
}

export function getMonthPlayCount(): number {
  const history = getPlayHistory();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  return Array.from(history.values())
    .reduce((total, record) => {
      const monthPlays = record.playDates.filter(date => date >= monthStart).length;
      return total + monthPlays;
    }, 0);
}

export function getTopSongToday(): PlayRecord | null {
  const todayPlays = getTodayPlays();
  return todayPlays.length > 0 ? todayPlays[0] : null;
}

export function removePlayRecord(recordId: number | string): void {
  try {
    const history = getPlayHistoryMap();
    history.delete(recordId);
    savePlayHistory(history);
  } catch (error) {
    console.error("删除播放记录失败:", error);
  }
}

// 清空全部播放历史
export function clearAllPlayHistory(): void {
  try {
    localStorage.removeItem(PLAY_HISTORY_KEY);
  } catch (error) {
    console.error("清空播放历史失败:", error);
  }
}
