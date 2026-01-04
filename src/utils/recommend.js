// Utilities for recommendation deduplication and diversification (JS, not TS)
// - dedupeById(list, seenSet): filters out items whose id is in seenSet
// - uniqueById(list): removes duplicated ids inside a list (preserve first)
// - diversify(list, maxItems, preferKeys): returns a diversified subset by shuffling and spreading similar keys

export function uniqueById(list = []) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const id = item && (item.id ?? item.name);
    if (!id) continue;
    if (seen.has(String(id))) continue;
    seen.add(String(id));
    out.push(item);
  }
  return out;
}

export function dedupeById(list = [], seenSet = new Set()) {
  return list.filter((item) => {
    const id = item && (item.id ?? item.name);
    if (!id) return false;
    if (seenSet.has(String(id))) return false;
    seenSet.add(String(id));
    return true;
  });
}

export function diversify(list = [], maxItems = 6, keyForSpread = (i) => i) {
  if (!Array.isArray(list) || list.length === 0) return [];

  // Simple diversification: group by keyForSpread and take round-robin from groups
  const groups = new Map();
  for (const item of list) {
    const key = keyForSpread(item) || '__';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const groupArrays = Array.from(groups.values()).map((g) => [...g]);
  const out = [];
  let index = 0;
  while (out.length < maxItems) {
    let progressed = false;
    for (const g of groupArrays) {
      if (g.length > index) {
        out.push(g[index]);
        if (out.length === maxItems) break;
        progressed = true;
      }
    }
    if (!progressed) break;
    index++;
  }

  return out;
}
