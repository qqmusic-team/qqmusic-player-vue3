import { describe, it, expect } from 'vitest'
import { uniqueById, dedupeById, diversify } from '../recommend'

describe('recommend utils', () => {
  it('uniqueById removes duplicates preserving first', () => {
    const list = [{id:1},{id:2},{id:1},{id:3},{id:'2'}]
    const u = uniqueById(list)
    expect(u.map(x=>x.id)).toEqual([1,2,3])
  })

  it('dedupeById filters against seen set', ()=>{
    const seen = new Set([1,'a'])
    const list = [{id:1},{id:2},{id:'a'},{id:3}]
    const out = dedupeById(list, seen)
    expect(out.map(x=>x.id)).toEqual([2,3])
    // seen updated
    expect(seen.has('2')).toBe(true)
  })

  it('diversify spreads groups', ()=>{
    const items = [
      {id:1,group:'A'},{id:2,group:'A'},{id:3,group:'B'},{id:4,group:'B'},{id:5,group:'C'},{id:6,group:'A'}
    ]
    const out = diversify(items, 5, i=>i.group)
    // Should include items from multiple groups in round-robin order
    expect(out.length).toBe(5)
    // ensure not all from same group
    const groups = new Set(out.map(i=>i.group))
    expect(groups.size).toBeGreaterThan(1)
  })

  it('global dedupe across multiple lists', ()=>{
    const a = [{id:1},{id:2},{id:3}]
    const b = [{id:2},{id:4},{id:3}]
    const c = [{id:5},{id:1},{id:6}]
    const seen = new Set()

    const aU = dedupeById(uniqueById(a), seen)
    const bU = dedupeById(uniqueById(b), seen)
    const cU = dedupeById(uniqueById(c), seen)

    // ensure no overlap across final arrays
    const all = [...aU,...bU,...cU].map(x=>x.id)
    const uniq = Array.from(new Set(all))
    expect(all.length).toBe(uniq.length)
    // check expected items present
    expect(all).toEqual(expect.arrayContaining([1,2,3,4,5,6].slice(0, all.length)))
  })
})
