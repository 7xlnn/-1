/** 来访者档案（智能体人设） */
export interface ClientProfile {
  id: string
  /** 化名 */
  name: string
  gender: '男' | '女'
  age: number
  occupation: string
  /** 主诉（一句话） */
  chiefComplaint: string
  /** 背景故事 */
  background: string
  /** 典型情境 */
  situations: string[]
  /** 自动思维 */
  automaticThoughts: string[]
  /** 情绪 */
  emotions: string[]
  /** 行为/应对策略 */
  behaviors: string[]
  /** 童年经历 */
  childhood: string
  /** 核心信念 */
  coreBeliefs: string[]
  /** 中间信念：态度 */
  attitudes: string[]
  /** 中间信念：规则 */
  rules: string[]
  /** 中间信念：假设 */
  assumptions: string[]
  /** 说话风格提示 */
  speechStyle: string
  /** 关键词标签 */
  tags: string[]
}

/** 学习要点 */
export interface LearningPoint {
  title: string
  desc: string
  example?: string
}

/** 片段练习定义 */
export interface FragmentExercise {
  id: string
  category: string
  categoryName: string
  title: string
  subtitle: string
  /** 建议对话轮数 */
  suggestedTurns: number
  /** 练习目标 */
  goals: string[]
  /** 学习要点 */
  points: LearningPoint[]
  /** 来访者档案 */
  client: ClientProfile
  /** 对话阶段提示（给咨询师的任务） */
  briefing: string
  /** 结束后的互动任务类型 */
  taskType: 'conceptualization' | 'empathy' | 'upr' | 'genuineness' | 'automatic' | 'intermediate' | 'core'
  /** 对话智能体的行为侧重 */
  agentFocus: string
}

/** 完整咨询的单次会谈 */
export interface CounselingSession {
  index: number
  title: string
  goal: string
  /** 会谈结构要点 */
  structure: string[]
  /** 本次重点练习的技术 */
  skills: string[]
  /** 会谈中的提示（咨询师侧） */
  hints: string[]
  /** 布置给来访者的作业 */
  homework: string
  /** 建议对话轮数 */
  suggestedTurns: number
  /** 来访者本次的状态/知情程度（给智能体） */
  clientState: string
}

/** 完整咨询个案 */
export interface CounselingCase {
  id: string
  title: string
  theme: string
  difficulty: '入门' | '进阶'
  description: string
  client: ClientProfile
  /** 治疗概览 */
  overview: string[]
  sessions: CounselingSession[]
}
