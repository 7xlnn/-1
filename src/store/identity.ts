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
    if (raw && typeof raw === 'object') {
      const studentId = raw.studentId || genId()
      return {
        role: raw.role === 'teacher' ? 'teacher' : 'student',
        studentName: raw.studentName || '',
        teacherName: raw.teacherName || '老师',
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
    const cur = (Taro.getStorageSync(KEY) || {}) as Record<string, unknown>
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
