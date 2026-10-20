import { create } from 'zustand'
import Taro from '@tarojs/taro'

export type Role = 'student' | 'teacher'

interface IdentityState {
  role: Role
  studentName: string
  teacherName: string
  studentId: string
  setRole: (r: Role) => void
  setStudentName: (n: string) => void
  setTeacherName: (n: string) => void
}

const KEY = 'cbt_identity_v1'

function genId() {
  return 'stu_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function load(): { role: Role; studentName: string; teacherName: string; studentId: string } {
  try {
    const raw = Taro.getStorageSync(KEY)
    // 兼容多端 storage 存储格式：可能直接展开，也可能包裹在 { data: {...} } 内
    const obj = raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw
    if (obj && typeof obj === 'object') {
      const studentId = obj.studentId || genId()
      return {
        role: obj.role === 'teacher' ? 'teacher' : 'student',
        studentName: obj.studentName || '',
        teacherName: obj.teacherName || '老师',
        studentId,
      }
    }
  } catch (e) {
    // ignore
  }
  return { role: 'student', studentName: '', teacherName: '老师', studentId: genId() }
}

const initial = load()

function persist(partial: Partial<IdentityState>) {
  try {
    const cur0 = Taro.getStorageSync(KEY) || {}
    const cur = (cur0 && typeof cur0 === 'object' && 'data' in cur0 ? (cur0 as any).data : cur0) || {}
    Taro.setStorageSync(KEY, { ...cur, ...partial })
  } catch (e) {
    // ignore
  }
}

export const useIdentity = create<IdentityState>((set) => ({
  role: initial.role,
  studentName: initial.studentName,
  teacherName: initial.teacherName,
  studentId: initial.studentId,
  setRole: (role) => {
    persist({ role })
    set({ role })
  },
  setStudentName: (studentName) => {
    persist({ studentName })
    set({ studentName })
  },
  setTeacherName: (teacherName) => {
    persist({ teacherName })
    set({ teacherName })
  },
}))
