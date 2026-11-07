import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useIdentity } from '@/store/identity'

export type SubmissionType = 'fragment' | 'conceptualization' | 'session' | 'mood'

export interface SubmissionListItem {
  id: number
  student_name: string
  type: SubmissionType
  title: string
  group: string | null
  sub: string | null
  status: 'pending' | 'graded' | 'reviewed'
  score: number | null
  comment: string | null
  graded_at: string | null
  created_at: string
  student_no?: string
}

export interface SubmissionDetail extends SubmissionListItem {
  student_id: string
  content: Record<string, unknown>
}

const BASE = '/api/homework'

/** 教师口令由服务器校验，前端不会保存或内置任何口令。 */
export async function loginTeacher(passcode: string): Promise<void> {
  await Network.request({
    url: `${BASE}/teacher/login`,
    method: 'POST',
    data: { passcode },
  })
}

// 提交作业
export async function submitHomework(params: {
  studentName: string
  studentId: string
  type: SubmissionType
  title: string
  group?: string
  sub?: string
  content: unknown
}): Promise<number> {
  const res = await Network.request({
    url: `${BASE}/submit`,
    method: 'POST',
    data: params,
  })
  console.log('[homework] submit response:', res.data)
  return (res.data as { id: number }).id
}

// 学生查看自己的提交
export async function fetchMySubmissions(studentId: string): Promise<SubmissionListItem[]> {
  const res = await Network.request({
    url: `${BASE}/mine?studentId=${encodeURIComponent(studentId)}`,
    method: 'GET',
  })
  console.log('[homework] mine response:', res.data)
  return (res.data as { list: SubmissionListItem[] }).list ?? []
}

// 教师查看列表
export async function fetchTeacherList(status?: 'pending' | 'graded' | 'processed'): Promise<SubmissionListItem[]> {
  const qs = status ? `?status=${status}` : ''
  const res = await Network.request({
    url: `${BASE}/teacher/list${qs}`,
    method: 'GET',
  })
  console.log('[homework] teacher list response:', res.data)
  const list = (res.data as { list: SubmissionListItem[] }).list ?? []
  // 后端返回字段为 student_id（学号），映射为 student_no 供前端展示
  return list.map((it) => ({ ...it, student_no: (it as unknown as { student_id?: string }).student_id || '' }))
}

// 详情
export async function fetchSubmission(id: number): Promise<SubmissionDetail> {
  const res = await Network.request({
    url: `${BASE}/detail/${id}`,
    method: 'GET',
  })
  console.log('[homework] detail response:', res.data)
  return (res.data as { submission: SubmissionDetail }).submission
}

// 教师批改
export async function gradeSubmission(
  id: number,
  params: { score: number; comment: string },
): Promise<void> {
  const res = await Network.request({
    url: `${BASE}/grade/${id}`,
    method: 'POST',
    data: params,
  })
  console.log('[homework] grade response:', res.data)
}

/** 提交前置：确保学生已设置姓名，否则引导去身份页并返回 false */
export function ensureStudentName(): boolean {
  const { studentName } = useIdentity.getState()
  if (studentName.trim()) return true
  Taro.showModal({
    title: '先设置姓名',
    content: '老师需要知道这份作业是谁提交的，请先填写你的姓名。',
    confirmText: '去设置',
    success: (r) => {
      if (r.confirm) Taro.navigateTo({ url: '/pages/identity/index' })
    },
  })
  return false
}

// 情绪记录：标记为已查看（教师端，不评分）
export async function markSubmissionReviewed(id: number): Promise<void> {
  const res = await Network.request({
    url: `${BASE}/review/${id}`,
    method: 'POST',
  })
  console.log('[homework] review response:', res.data)
}

// ===== 班级完成数据统计（教师端）=====
export interface TeacherStats {
  updatedAt: string
  overview: {
    studentCount: number
    total: number
    pending: number
    graded: number
    reviewed: number
    avgScore: number
  }
  byType: {
    type: SubmissionType
    label: string
    count: number
    pending: number
    graded: number
  }[]
  byStudent: {
    no: string
    name: string
    total: number
    pending: number
    graded: number
    byType: Record<SubmissionType, number>
  }[]
}

// 教师端：班级完成数据统计
export async function fetchTeacherStats(): Promise<TeacherStats | null> {
  const res = await Network.request({
    url: `${BASE}/teacher/stats`,
    method: 'GET',
  })
  console.log('[homework] teacher stats response:', res.data)
  return (res.data as TeacherStats) ?? null
}

export interface RecoveredDraft {
  key: string
  data: string
  updated_at: string
}

/** 教师端：仅查看浏览器本机缓存恢复的草稿，不会写入或删除数据。 */
export async function fetchRecoveredDrafts(): Promise<RecoveredDraft[]> {
  const res = await Network.request({
    url: `${BASE}/teacher/recovered-drafts`,
    method: 'GET',
  })
  return (res.data as { list: RecoveredDraft[] }).list ?? []
}

export async function deleteSubmission(id: number): Promise<void> {
  const res = await Network.request({
    url: `${BASE}/${id}`,
    method: 'DELETE',
  })
  console.log('[homework] delete response:', res.data)
}

/** 通用提交：自动带上学生身份，返回新作业 id */
export async function submitAsStudent(params: {
  type: SubmissionType
  title: string
  group?: string
  sub?: string
  content: unknown
}): Promise<number> {
  const { studentName, studentId } = useIdentity.getState()
  return submitHomework({
    studentName: studentName.trim(),
    studentId,
    type: params.type,
    title: params.title,
    group: params.group,
    sub: params.sub,
    content: params.content,
  })
}
