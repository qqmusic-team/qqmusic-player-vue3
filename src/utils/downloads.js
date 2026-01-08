const DB_NAME = 'qqmusic_downloads_db';
const DB_VERSION = 1;
const STORE_NAME = 'downloads';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error || new Error('IndexedDB open error'));
  });
}

export async function saveFile(id, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ id: String(id), blob });
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error || new Error('saveFile failed'));
    tx.oncomplete = () => db.close();
  });
}

export async function getFile(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(String(id));
    req.onsuccess = (e) => {
      const r = e.target.result;
      resolve(r ? r.blob : null);
    };
    req.onerror = (e) => reject(e.target.error || new Error('getFile failed'));
    tx.oncomplete = () => db.close();
  });
}

export async function deleteFile(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(String(id));
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error || new Error('deleteFile failed'));
    tx.oncomplete = () => db.close();
  });
}
