import { create } from 'zustand'
import type { ClientProfile } from '@/data/types'

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
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
  }) => void
  addMessage: (msg: ChatMsg) => void
  resetAll: () => void
}

export const useSessionStore = create<SessionState>(set => ({
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
  startSession: p =>
    set({
      profile: p.profile,
      messages: [],
      fragmentId: p.fragmentId ?? null,
      caseId: p.caseId ?? null,
      sessionIndex: p.sessionIndex ?? 1,
      agentFocus: p.agentFocus ?? '',
      clientState: p.clientState ?? '',
      sessionGoal: p.sessionGoal ?? '',
      sessionTitle: p.sessionTitle ?? '',
      endUrl: p.endUrl,
      endLabel: p.endLabel
    }),
  addMessage: msg => set(s => ({ messages: [...s.messages, msg] })),
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
