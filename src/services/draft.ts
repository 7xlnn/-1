import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useIdentity } from '@/store/identity'
import { buildStorageKey, useSessionStore } from '@/store/session'
import { useProgressStore } from '@/store/progress'

/**
 * 云端草稿存储：把只存在本地的记录（练习进度、AI 对话、情绪周记草稿）
 * 按学号备份到云端 drafts 表，换设备/换浏览器后可恢复，避免"今天写完明天找不到"。
 * 所有写操作只异步 fire-and-forget，绝不阻塞/影响本地主流程。
 */

const BASE = '/api/homework/draft'

interface CloudDraft {
  key: string
  data: string // JSON 字符串
  updated_at: string
}

/** 当前学生稳定标识（学号）；未登录学号时为设备随机 ID（同设备仍可用） */
function sid(): string {
  return useIdentity.getState().studentId || ''
}

/** 单条 upsert 到云端 */
async function upsert(key: string, data: unknown): Promise<void> {
  const studentId = sid()
  if (!studentId) return
  try {
    const res = await Network.request({
      url: BASE,
      method: 'POST',
      data: { studentId, key, data: JSON.stringify(data) },
    })
    console.log('[draft] upsert ok', key, res.data)
  } catch (e) {
    console.warn('[draft] upsert failed', key, e)
  }
}

/** 读取某 key 的本地原始值 */
function readLocal(key: string): unknown {
  try {
    return Taro.getStorageSync(key)
  } catch {
    return null
  }
}

/** 把某 key 当前本地值推送到云端（本地无值则跳过） */
export async function pushKey(key: string): Promise<void> {
  const val = readLocal(key)
  if (val === '' || val === null || val === undefined) return
  await upsert(key, val)
}

/* ---------- 防抖批量推送（对话/进度高频写入时合并请求） ---------- */
let pendingPush = new Set<string>()
let pushTimer: ReturnType<typeof setTimeout> | null = null

/** 写入本地后调用，异步防抖备份到云端 */
export function queuePush(key: string): void {
  pendingPush.add(key)
  if (pushTimer) return
  pushTimer = setTimeout(async () => {
    pushTimer = null
    const keys = Array.from(pendingPush)
    pendingPush.clear()
    for (const k of keys) await pushKey(k)
  }, 800)
}

/* ---------- 启动/登录后的云端恢复 ---------- */
function mergeIntoLocal(key: string, cloud: CloudDraft): void {
  let local: unknown = null
  try {
    local = Taro.getStorageSync(key)
  } catch {
    local = null
  }
  // 本地没有该记录：直接采用云端
  if (local === '' || local === null || local === undefined) {
    try {
      Taro.setStorageSync(key, JSON.parse(cloud.data))
    } catch {
      /* data 非 JSON 时原样写入 */
      void 0
    }
    return
  }
  // 本地有记录：以 updatedAt 较新者为准（对象形如 { ..., updatedAt }）
  if (typeof local === 'object' && local !== null && !Array.isArray(local)) {
    const lu = (local as { updatedAt?: number }).updatedAt ?? 0
    try {
      const c = JSON.parse(cloud.data)
      const cu = (c?.updatedAt as number | undefined) ?? 0
      if (cu > lu) Taro.setStorageSync(key, c)
    } catch {
      /* 云端非对象，保持本地 */
    }
  }
}

/**
 * 拉取当前学生全部云端草稿并合并回本地。
 * 返回是否成功（供调用方决定是否重载 store）。
 */
export async function pullToLocal(): Promise<boolean> {
  const studentId = sid()
  if (!studentId) return false
  try {
    const res = await Network.request({
      url: `${BASE}?studentId=${encodeURIComponent(studentId)}`,
      method: 'GET',
    })
    const list = (res.data as { list?: CloudDraft[] }).list ?? []
    console.log('[draft] pull', list.length, '条')
    for (const d of list) mergeIntoLocal(d.key, d)
    return true
  } catch (e) {
    console.warn('[draft] pull failed', e)
    return false
  }
}

/** 启动/登录后调用：拉取云端并让各本地 store 重新载入 */
export async function hydrateDrafts(): Promise<void> {
  const ok = await pullToLocal()
  if (!ok) return
  // 对话与情绪周记在页面挂载时读 storage，天然生效。
  // 练习进度是模块级单例，需手动重载。
  useProgressStore.getState().reload()
}

/** 登录/切换身份后：把当前所有已知本地记录整批备份到云端（防丢） */
export async function backupAllLocal(): Promise<void> {
  const s = useSessionStore.getState()
  const role = useIdentity.getState().role
  // 当前会话 + 进度 + 情绪周记（含已提交标记）
  const sessionKey = buildStorageKey(s.caseId, s.sessionIndex, s.fragmentId)
  const keys = [
    sessionKey,
    'cbt:progress:records',
    `my-mood-week-${role}`,
    `my-mood-week-submitted-${role}`,
  ]
  for (const k of keys) await pushKey(k)
}