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

export function getPlayHistory(): Map<number | string, PlayRecord> {
  try {
    const data = localStorage.getItem(PLAY_HISTORY_KEY);
    if (!data) return new Map();
    
    const records = JSON.parse(data);
    const map = new Map<number | string, PlayRecord>();
    records.forEach((record: PlayRecord) => {
      map.set(record.id, record);
    });
    return map;
  } catch (error) {
    console.error("读取播放历史失败:", error);
    return new Map();
  }
}

export function savePlayHistory(history: Map<number | string, PlayRecord>): void {
  try {
    const records = Array.from(history.values());
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
  const history = getPlayHistory();
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
