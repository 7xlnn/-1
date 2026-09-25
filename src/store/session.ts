import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { ClientProfile } from '@/data/types'

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

/** 存档内容 */
interface PersistData {
  messages: ChatMsg[]
  /** 用于在 brief 页展示进度 */
  updatedAt: number
}

interface SessionState {
  /** 当前智能体（来访者）档案 */
  profile: ClientProfile | null
  /** 当前对话记录 */
  messages: ChatMsg[]
  /** 片段练习 id */
  fragmentId: string | null
  /** 完整咨询个案 id */
  caseId: string | null
  /** 完整咨询中当前会谈序号（从 1 开始） */
  sessionIndex: number
  /** 智能体扮演侧重（片段练习专用） */
  agentFocus: string
  /** 来访者当下状态描述（供智能体保持状态） */
  clientState: string
  /** 本次会谈/练习目标 */
  sessionGoal: string
  /** 督导反馈使用的练习/会谈标题 */
  sessionTitle: string
  /** 对话页"结束"按钮跳转地址 */
  endUrl: string
  /** 对话页"结束"按钮文案 */
  endLabel: string
  /** 已生成、等待反馈页展示的督导反馈（避免超长 URL 参数） */
  pendingFeedback: unknown
  setPendingFeedback: (d: unknown) => void
  startSession: (p: {
    profile: ClientProfile
    fragmentId?: string | null
    caseId?: string | null
    sessionIndex?: number
    agentFocus?: string
    clientState?: string
    sessionGoal?: string
    sessionTitle?: string
    endUrl: string
    endLabel: string
    /** true=忽略存档重新开始；默认读取已有存档续练 */
    fresh?: boolean
  }) => void
  addMessage: (msg: ChatMsg) => void
  /** 替换最后一条用户消息之后的内容（重新生成时使用），不持久化差异由 addMessage 保证 */
  setMessages: (msgs: ChatMsg[]) => void
  /** 清除当前会话的本地存档（反馈完成后调用） */
  clearPersisted: () => void
  resetAll: () => void
}

/** 根据会话标识生成存档 key */
const storageKey = (caseId: string | null, sessionIndex: number, fragmentId: string | null): string =>
  caseId ? `cbt:sess:${caseId}:${sessionIndex}` : `cbt:frag:${fragmentId ?? 'unknown'}`

/** 供 brief 页读取某个会话的历史进度（静态方法式工具） */
export function readPersisted(key: string): PersistData | null {
  try {
    return (Taro.getStorageSync(key) as PersistData) || null
  } catch {
    return null
  }
}

export function buildStorageKey(caseId: string | null, sessionIndex: number, fragmentId: string | null): string {
  return storageKey(caseId, sessionIndex, fragmentId)
}

export const useSessionStore = create<SessionState>((set, get) => ({
  profile: null,
  messages: [],
  fragmentId: null,
  caseId: null,
  sessionIndex: 1,
  agentFocus: '',
  clientState: '',
  sessionGoal: '',
  sessionTitle: '',
  endUrl: '',
  endLabel: '',
  pendingFeedback: null,
  setPendingFeedback: d => set({ pendingFeedback: d }),
  startSession: p => {
    const key = storageKey(p.caseId ?? null, p.sessionIndex ?? 1, p.fragmentId ?? null)
    let messages: ChatMsg[] = []
    if (!p.fresh) {
      const saved = readPersisted(key)
      if (saved?.messages?.length) messages = saved.messages
    } else {
      try {
        Taro.removeStorageSync(key)
      } catch {
        /* ignore */
      }
    }
    set({
      profile: p.profile,
      messages,
      fragmentId: p.fragmentId ?? null,
      caseId: p.caseId ?? null,
      sessionIndex: p.sessionIndex ?? 1,
      agentFocus: p.agentFocus ?? '',
      clientState: p.clientState ?? '',
      sessionGoal: p.sessionGoal ?? '',
      sessionTitle: p.sessionTitle ?? '',
      endUrl: p.endUrl,
      endLabel: p.endLabel
    })
  },
  addMessage: msg => {
    const s = get()
    const messages = [...s.messages, msg]
    const key = storageKey(s.caseId, s.sessionIndex, s.fragmentId)
    try {
      Taro.setStorageSync(key, { messages, updatedAt: Date.now() } as PersistData)
    } catch {
      /* ignore quota */
    }
    set({ messages })
  },
  setMessages: msgs => {
    const s = get()
    const key = storageKey(s.caseId, s.sessionIndex, s.fragmentId)
    try {
      Taro.setStorageSync(key, { messages: msgs, updatedAt: Date.now() } as PersistData)
    } catch {
      /* ignore */
    }
    set({ messages: msgs })
  },
  clearPersisted: () => {
    const s = get()
    const key = storageKey(s.caseId, s.sessionIndex, s.fragmentId)
    try {
      Taro.removeStorageSync(key)
    } catch {
      /* ignore */
    }
  },
  resetAll: () =>
    set({
      profile: null,
      messages: [],
      fragmentId: null,
      caseId: null,
      sessionIndex: 1,
      agentFocus: '',
      clientState: '',
      sessionGoal: '',
      sessionTitle: '',
      endUrl: '',
      endLabel: '',
      pendingFeedback: null
    })
}))
