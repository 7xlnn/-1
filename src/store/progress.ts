import { create } from 'zustand'
import Taro from '@tarojs/taro'

/** 一次完成的练习/会谈的记录 */
export interface ProgressRecord {
  /** 时间戳 */
  ts: number
  /** 类型：'fragment' 片段练习 / 'session' 完整咨询会谈 */
  kind: 'fragment' | 'session'
  /** 技术/标题 */
  title: string
  /** 技术大类（片段练习 categoryName 或会谈标题） */
  category: string
  /** 督导均分（0-10） */
  avg: number
  /** 六维分 */
  scores: Record<string, number>
}

const KEY = 'cbt:progress:records'

interface ProgressState {
  records: ProgressRecord[]
  /** 记录一次已完成练习（结束时不重复计数） */
  addRecord: (r: Omit<ProgressRecord, 'ts'>) => void
  /** 彻底清空（供调试） */
  clearAll: () => void
}

function load(): ProgressRecord[] {
  try {
    const raw = Taro.getStorageSync(KEY) as ProgressRecord[] | null
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  records: load(),
  addRecord: r => {
    // 同一 (kind,title) 最近 60 秒不重复计数，避免重复返回时叠加
    const now = Date.now()
    const dup = get().records.some(
      p => p.kind === r.kind && p.title === r.title && now - p.ts < 60000
    )
    if (dup) return
    const records = [...get().records, { ...r, ts: now }]
    try {
      Taro.setStorageSync(KEY, records)
    } catch {
      /* ignore quota */
    }
    set({ records })
  },
  clearAll: () => {
    try {
      Taro.removeStorageSync(KEY)
    } catch {
      /* ignore */
    }
    set({ records: [] })
  }
}))

/** 按技术大类统计累计完成次数 */
export function categoryCounts(records: ProgressRecord[]): { name: string; count: number }[] {
  const m = new Map<string, number>()
  for (const r of records) m.set(r.category, (m.get(r.category) ?? 0) + 1)
  return Array.from(m.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}