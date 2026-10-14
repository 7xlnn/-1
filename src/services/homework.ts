import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useIdentity } from '@/store/identity'

export type SubmissionType = 'fragment' | 'conceptualization' | 'session' | 'mood'

export interface SubmissionListItem {
  id: number
  student_name: string
  type: SubmissionType
  title: string
  status: 'pending' | 'graded'
  score: number | null
  comment: string | null
  graded_at: string | null
  created_at: string
}

export interface SubmissionDetail extends SubmissionListItem {
  student_id: string
  content: Record<string, unknown>
}

const BASE = '/api/homework'

// 提交作业
export async function submitHomework(params: {
  studentName: string
  studentId: string
  type: SubmissionType
  title: string
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
export async function fetchTeacherList(status?: 'pending' | 'graded'): Promise<SubmissionListItem[]> {
  const qs = status ? `?status=${status}` : ''
  const res = await Network.request({
    url: `${BASE}/teacher/list${qs}`,
    method: 'GET',
  })
  console.log('[homework] teacher list response:', res.data)
  return (res.data as { list: SubmissionListItem[] }).list ?? []
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

// 删除作业（教师端）
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
  content: unknown
}): Promise<number> {
  const { studentName, studentId } = useIdentity.getState()
  return submitHomework({
    studentName: studentName.trim(),
    studentId,
    type: params.type,
    title: params.title,
    content: params.content,
  })
}
