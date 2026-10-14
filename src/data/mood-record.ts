/**
 * 情绪/思维记录表（贝克功能失调性思维记录表 DTR）单条记录。
 * 字段与《情绪记录表.xlsx》各列一一对应。
 */
export interface ThoughtRecordEntry {
  /** 日期，如「周一 10/12」 */
  date: string
  /** 情境：引发情绪的事件/思维/回忆 + 生理感觉 */
  situation: string
  /** 自动思维：脑中出现的思维/意象 */
  automaticThought: string
  /** 对自动思维的相信程度（0-100） */
  thoughtBelief: number
  /** 情绪（悲伤、焦虑、愤怒等） */
  emotion: string
  /** 情绪强烈程度（0-100） */
  emotionIntensity: number
  /** 适合的反应：识别到的认知歪曲 */
  distortions: string[]
  /** 适合的反应：使用了底部 7 个引导问题中的哪一个（1-7），未做反应时为 null */
  usedQuestion: number | null
  /** 适合的反应：对自动思维形成的平衡反应 */
  adaptiveResponse: string
  /** 对适应性反应的相信程度（0-100），未做反应时为 null */
  responseBelief: number | null
  /** 结果：现在对自动思维的相信程度（0-100），未做反应时为 null */
  resultBelief: number | null
  /** 结果：现在的情绪及强度（文本，如「焦虑 40%」） */
  resultEmotion: string
  /** 结果：会做/做了什么 */
  resultAction: string
}

/** 一周情绪记录（一组思维记录条目） */
export interface ThoughtRecordWeek {
  /** 记录归属：个案 id（来访者 AI 填写）或 'self'（咨询师本人） */
  ownerId: string
  /** 会谈序号（完整咨询用），咨询师本人为 null */
  sessionIndex: number | null
  /** 周起始标签，如「第 3 次会谈前一周」 */
  weekLabel: string
  entries: ThoughtRecordEntry[]
}

/** 情绪三栏记录表底部 7 个引导问题（用于形成对自动思维的平衡反应） */
export const CBT_GUIDE_QUESTIONS: string[] = [
  '有什么证据证明这个自动思维是真的？什么证明它是假的？',
  '有没有替代性的解释？',
  '可能发生的最糟糕的情况是什么？我能怎么应对？',
  '可能发生的最好的结果是什么？',
  '最现实的结果是什么？',
  '如果相信自动思维会有什么影响？改变会有什么影响？',
  '如果____（朋友）在这种情境下有了这种自动思维，我会对他/她说什么？'
]

/** 常见认知歪曲清单（用于咨询师自我记录时勾选） */
export const COGNITIVE_DISTORTIONS: string[] = [
  '非黑即白',
  '灾难化',
  '贴标签',
  '以偏概全',
  '心理过滤',
  '忽视正面',
  '读心术',
  '预言未来',
  '情绪推理',
  '应该陈述',
  '个人化',
  '责备他人'
]

/** DTR 表的逐列填写指引（用于 AI 生成与页面提示） */
export const DTR_INSTRUCTION =
  '当你注意到情绪开始变糟，问问自己：「此时我的脑中在想什么？」并尽快在自动思维一栏粗略记录下你的想法或脑中出现的画面。'
