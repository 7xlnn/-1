import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { HeartPulse, Plus, X, Check, Trash2, PencilLine, Send, CircleCheck } from 'lucide-react-taro'
import { UI_ASSETS } from '@/data/ui-assets'
import { ThoughtRecordCard } from '@/components/thought-record-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { COGNITIVE_DISTORTIONS, CBT_GUIDE_QUESTIONS } from '@/data/mood-record'
import type { ThoughtRecordEntry } from '@/data/mood-record'
import { submitAsStudent, ensureStudentName } from '@/services/homework'
import { useIdentity } from '@/store/identity'

const storageKeyFor = (role: string) => `my-mood-week-${role}`
const submittedKeyFor = (role: string) => `my-mood-week-submitted-${role}`
// 角色隔离改造前的通用 key（学生历史记录存于此）
const LEGACY_STORAGE_KEY = 'my-mood-week'
const LEGACY_SUBMITTED_KEY = 'my-mood-week-submitted'

/** 一次性迁移：把旧的通用周记数据归到学生角色下 */
const migrateLegacyEntries = (role: string): ThoughtRecordEntry[] => {
  if (role !== 'student') return []
  try {
    const legacy = Taro.getStorageSync(LEGACY_STORAGE_KEY)
    if (Array.isArray(legacy) && legacy.length > 0) {
      Taro.setStorageSync(storageKeyFor('student'), legacy)
      Taro.removeStorageSync(LEGACY_STORAGE_KEY)
      return legacy
    }
  } catch {
    /* 忽略迁移异常 */
  }
  return []
}

const migrateLegacySubmitted = (role: string): boolean => {
  if (role !== 'student') return false
  try {
    if (Taro.getStorageSync(LEGACY_SUBMITTED_KEY)) {
      Taro.setStorageSync(submittedKeyFor('student'), true)
      Taro.removeStorageSync(LEGACY_SUBMITTED_KEY)
      return true
    }
  } catch {
    /* 忽略迁移异常 */
  }
  return false
}

/** 步进器：用于 0-100 的相信/强度数字 */
const Stepper = ({
  value,
  onChange
}: {
  value: number
  onChange: (v: number) => void
}) => (
  <View className="flex flex-row items-center gap-3">
    <View
      className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
      onClick={() => onChange(Math.max(0, value - 5))}
    >
      <Text className="text-xl text-foreground">−</Text>
    </View>
    <Text className="text-lg font-semibold text-foreground w-16 text-center">{value}%</Text>
    <View
      className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
      onClick={() => onChange(Math.min(100, value + 5))}
    >
      <Text className="text-xl text-foreground">+</Text>
    </View>
  </View>
)

const emptyDraft = (): ThoughtRecordEntry => ({
  date: '',
  situation: '',
  automaticThought: '',
  thoughtBelief: 80,
  emotion: '',
  emotionIntensity: 70,
  distortions: [],
  usedQuestion: null,
  adaptiveResponse: '',
  responseBelief: null,
  resultBelief: null,
  resultEmotion: '',
  resultEmotionIntensity: null,
  resultAction: ''
})

const MyMoodPage = () => {
  // 周记数据按角色隔离：学生与教师的周记互不串用
  const { role } = useIdentity()
  const isTeacher = role === 'teacher'
  const storageKey = storageKeyFor(role)

  const [entries, setEntries] = useState<ThoughtRecordEntry[]>(() => {
    try {
      return Taro.getStorageSync(storageKeyFor(role)) || migrateLegacyEntries(role)
    } catch {
      return migrateLegacyEntries(role)
    }
  })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ThoughtRecordEntry>(emptyDraft())
  const [editIndex, setEditIndex] = useState<number | null>(null)

  // 弹层打开时隐藏原生 TabBar（否则小程序原生 TabBar 会盖住底部按钮）
  useEffect(() => {
    if (editing) {
      Taro.hideTabBar({ animation: false })
    } else {
      Taro.showTabBar({ animation: false })
    }
    return () => {
      Taro.showTabBar({ animation: false })
    }
  }, [editing])

  const persist = (next: ThoughtRecordEntry[]) => {
    setEntries(next)
    try {
      Taro.setStorageSync(storageKey, next)
    } catch {
      // ignore
    }
  }

  const openAdd = () => {
    setDraft(emptyDraft())
    setEditIndex(null)
    setEditing(true)
  }

  const openEdit = (i: number) => {
    setDraft(entries[i])
    setEditIndex(i)
    setEditing(true)
  }

  const saveDraft = () => {
    if (!draft.date.trim() && !draft.situation.trim()) {
      Taro.showToast({ title: '请至少填写日期或情境', icon: 'none' })
      return
    }
    const next = [...entries]
    if (editIndex === null) {
      next.unshift(draft)
    } else {
      next[editIndex] = draft
    }
    persist(next)
    setEditing(false)
  }

  const removeEntry = (i: number) => {
    persist(entries.filter((_, idx) => idx !== i))
  }

  const [weeklySubmitted, setWeeklySubmitted] = useState<boolean>(() => {
    try {
      return !!Taro.getStorageSync(submittedKeyFor(role)) || migrateLegacySubmitted(role)
    } catch {
      return migrateLegacySubmitted(role)
    }
  })
  const [submitting, setSubmitting] = useState(false)

  // 每周只打包提交一次：把本周所有记录作为 records 数组整体提交，教师端完整可见
  const submitWeek = async () => {
    if (isTeacher) {
      Taro.showToast({ title: '教师角色只记录自己的周记，不会提交给老师', icon: 'none' })
      return
    }
    if (submitting || weeklySubmitted) return
    if (!ensureStudentName()) return
    if (entries.length === 0) {
      Taro.showToast({ title: '本周还没有记录，先记一次吧', icon: 'none' })
      return
    }
    const dates = entries.map((e) => e.date).filter(Boolean).sort()
    const weekLabel = dates.length
      ? `${dates[0]} ~ ${dates[dates.length - 1]}`
      : '本周'
    setSubmitting(true)
    try {
      const records = entries.map((e) => ({
        date: e.date,
        situation: e.situation,
        automaticThought: e.automaticThought,
        thoughtBelief: e.thoughtBelief,
        emotion: e.emotion,
        emotionIntensity: e.emotionIntensity,
        distortions: e.distortions,
        usedQuestion: e.usedQuestion,
        usedQuestionLabel:
          e.usedQuestion !== null ? CBT_GUIDE_QUESTIONS[e.usedQuestion - 1] : '',
        adaptiveResponse: e.adaptiveResponse,
        responseBelief: e.responseBelief,
        resultBelief: e.resultBelief,
        resultEmotion: e.resultEmotion,
        resultEmotionIntensity: e.resultEmotionIntensity,
        resultAction: e.resultAction,
      }))
      await submitAsStudent({
        type: 'mood',
        title: `本周情绪周记 · ${entries.length}条`,
        content: { records, week: weekLabel, count: entries.length },
      })
      setWeeklySubmitted(true)
      try {
        Taro.setStorageSync(submittedKeyFor(role), true)
      } catch {
        // ignore
      }
      Taro.showToast({ title: '本周记录已提交', icon: 'success' })
    } catch (err) {
      console.error('[mood submit error]', err)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleDistortion = (d: string) => {
    const has = draft.distortions.includes(d)
    setDraft({
      ...draft,
      distortions: has
        ? draft.distortions.filter(x => x !== d)
        : [...draft.distortions, d]
    })
  }

  const avgIntensity =
    entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.emotionIntensity, 0) / entries.length)
      : 0
  const respondedCount = entries.filter(e => e.adaptiveResponse).length

  return (
    <View className="min-h-full bg-background pb-10">
      {/* 头部氛围图 */}
      <View className="relative overflow-hidden">
        <Image src={UI_ASSETS.moodArt} className="w-full h-48" mode="aspectFill" />
        <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.1) 0%, rgba(24,44,33,0.66) 100%)' }} />
        <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <View className="flex flex-row items-center gap-2">
            <HeartPulse size={18} color="#ffffff" />
            <Text className="text-white text-xl font-bold">我的情绪周记</Text>
          </View>
          <Text className="block mt-2 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
            用咨询师的 DTR 记录表观察自己。{'\n'}先照顾好自己，才能照顾好来访者。
          </Text>
        </View>
      </View>

      <View className="px-4 -mt-3 pt-2">
        {/* 本周概览 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-row">
          <View className="flex-1 items-center">
            <Text className="block text-2xl font-bold text-primary text-center">{entries.length}</Text>
            <Text className="block text-sm text-muted-foreground text-center mt-1">本周记录</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="block text-2xl font-bold text-primary text-center">
              {entries.length ? avgIntensity : '—'}
            </Text>
            <Text className="block text-sm text-muted-foreground text-center mt-1">平均情绪强度</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center">
            <Text className="block text-2xl font-bold text-primary text-center">{respondedCount}</Text>
            <Text className="block text-sm text-muted-foreground text-center mt-1">做了平衡反应</Text>
          </View>
        </View>

        <Button className="w-full rounded-full mt-3" onClick={openAdd}>
          <Plus size={18} color="#ffffff" />
          <Text className="ml-2 text-lg text-primary-foreground">记录一次情绪</Text>
        </Button>

        {!isTeacher && (
          <Button
            variant={weeklySubmitted ? 'outline' : 'default'}
            className="w-full rounded-full mt-3"
            onClick={submitWeek}
            disabled={submitting || weeklySubmitted}
          >
            {weeklySubmitted ? (
              <>
                <CircleCheck size={18} color="#5B8C7B" />
                <Text className="ml-2 text-lg text-primary">本周记录已提交 {entries.length} 条</Text>
              </>
            ) : (
              <>
                <Send size={18} color="#ffffff" />
                <Text className="ml-2 text-lg text-primary-foreground">提交本周记录给老师</Text>
              </>
            )}
          </Button>
        )}

        {entries.length === 0 && (
          <View className="bg-card rounded-2xl border border-border p-8 shadow-sm mt-3 flex flex-col items-center">
            <Text className="block text-lg text-muted-foreground text-center leading-relaxed">
              还没有记录。{'\n'}下次情绪波动时，试着按下「记录一次情绪」。
            </Text>
          </View>
        )}

        <View className="flex flex-col gap-3 mt-3">
          {entries.map((e, i) => (
            <View key={`${e.date}-${i}`}>
              <ThoughtRecordCard entry={e} />
              <View className="flex flex-row gap-2 mt-2 px-1">
                <View
                  className="flex flex-row items-center bg-secondary rounded-full px-3 py-2"
                  onClick={() => openEdit(i)}
                >
                  <PencilLine size={14} color="#5B8C7B" />
                  <Text className="ml-1 text-sm text-foreground">编辑</Text>
                </View>
                <View
                  className="flex flex-row items-center rounded-full px-3 py-2"
                  style={{ backgroundColor: 'rgba(192,101,79,0.12)' }}
                  onClick={() => removeEntry(i)}
                >
                  <Trash2 size={14} color="#c0654f" />
                  <Text className="ml-1 text-sm text-destructive">删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 编辑弹层 */}
      {editing && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.4)'
          }}
        >
          <View
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '88vh',
              overflow: 'hidden',
              backgroundColor: '#fbfaf6',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px'
            }}
          >
            <View
              className="flex flex-row items-center justify-between px-5 pt-4 pb-3"
              style={{ flexShrink: 0 }}
            >
              <Text className="text-lg font-bold text-foreground">
                {editIndex === null ? '记录一次情绪' : '编辑记录'}
              </Text>
              <View
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                onClick={() => setEditing(false)}
              >
                <X size={18} color="#2f3430" />
              </View>
            </View>

            <ScrollView scrollY className="flex-1" style={{ flex: 1, minHeight: 0 }}>
              <View className="px-5 pb-8 flex flex-col gap-4">
                <View>
                  <Text className="block text-base text-primary font-medium mb-1">日期 / 时间</Text>
                  <Input
                    className="rounded-xl bg-card text-base"
                    value={draft.date}
                    placeholder="如 周三 晚 / 10-15 09:30"
                    onInput={e => setDraft({ ...draft, date: e.detail.value })}
                  />
                </View>

                <View>
                  <Text className="block text-base text-primary font-medium mb-1">
                    情境：发生了什么？有什么生理感觉？
                  </Text>
                  <Textarea
                    className="rounded-xl bg-card border border-border text-base"
                    value={draft.situation}
                    autoHeight
                    onInput={e => setDraft({ ...draft, situation: e.detail.value })}
                    placeholder="事件、回忆或白日梦，以及身体感受…"
                  />
                </View>

                <View>
                  <Text className="block text-base text-primary font-medium mb-1">
                    自动思维：脑中闪过什么念头或画面？
                  </Text>
                  <Textarea
                    className="rounded-xl bg-card border border-border text-base"
                    value={draft.automaticThought}
                    autoHeight
                    onInput={e => setDraft({ ...draft, automaticThought: e.detail.value })}
                    placeholder="此时我的脑中在想什么？"
                  />
                  <View className="flex flex-row items-center justify-between mt-2">
                    <Text className="text-sm text-muted-foreground">对它的相信程度</Text>
                    <Stepper
                      value={draft.thoughtBelief}
                      onChange={v => setDraft({ ...draft, thoughtBelief: v })}
                    />
                  </View>
                </View>

                <View>
                  <Text className="block text-base text-primary font-medium mb-1">情绪</Text>
                  <Input
                    className="rounded-xl bg-card text-base"
                    value={draft.emotion}
                    placeholder="如 焦虑、悲伤、愤怒"
                    onInput={e => setDraft({ ...draft, emotion: e.detail.value })}
                  />
                  <View className="flex flex-row items-center justify-between mt-2">
                    <Text className="text-sm text-muted-foreground">情绪强烈程度</Text>
                    <Stepper
                      value={draft.emotionIntensity}
                      onChange={v => setDraft({ ...draft, emotionIntensity: v })}
                    />
                  </View>
                </View>

                <View>
                  <Text className="block text-base text-primary font-medium mb-2">
                    认知歪曲（选作，可多选）
                  </Text>
                  <View className="flex flex-row flex-wrap gap-2">
                    {COGNITIVE_DISTORTIONS.map(d => {
                      const active = draft.distortions.includes(d)
                      return (
                        <View
                          key={d}
                          className="rounded-full px-3 py-2 border"
                          style={
                            active
                              ? { backgroundColor: '#5b8c7b', borderColor: '#5b8c7b' }
                              : { backgroundColor: '#ffffff', borderColor: '#e8e4da' }
                          }
                          onClick={() => toggleDistortion(d)}
                        >
                          <Text className="text-sm" style={{ color: active ? '#ffffff' : '#6e756e' }}>
                            {d}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </View>

                {/* 适合的反应：先选用的引导问题，再填反应（对应三栏表"先选问题再反应"） */}
                <View>
                  <Text className="block text-base text-primary font-medium mb-1">
                    适合的反应：先用哪个问题来挑战自动思维？
                  </Text>
                  <View className="flex flex-col gap-2">
                    {CBT_GUIDE_QUESTIONS.map((q, idx) => {
                      const active = draft.usedQuestion === idx + 1
                      return (
                        <View
                          key={q}
                          className="rounded-xl border px-3 py-2"
                          style={
                            active
                              ? { backgroundColor: '#5b8c7b', borderColor: '#5b8c7b' }
                              : { backgroundColor: '#ffffff', borderColor: '#e8e4da' }
                          }
                          onClick={() =>
                            setDraft({
                              ...draft,
                              usedQuestion: active ? null : idx + 1,
                              adaptiveResponse: active ? '' : draft.adaptiveResponse
                            })
                          }
                        >
                          <Text
                            className="block text-sm leading-relaxed"
                            style={{ color: active ? '#ffffff' : '#343a35' }}
                          >
                            {idx + 1}. {q}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                  {draft.usedQuestion !== null && (
                    <View className="mt-3">
                      <Text className="block text-base text-primary font-medium mb-1">
                        基于该问题，我的平衡想法是？
                      </Text>
                      <Textarea
                        className="rounded-xl bg-card border border-border text-base"
                        value={draft.adaptiveResponse}
                        autoHeight
                        onInput={e => setDraft({ ...draft, adaptiveResponse: e.detail.value })}
                        placeholder="用你选的问题，重新审视这条自动思维…"
                      />
                      <View className="flex flex-row items-center justify-between mt-2">
                        <Text className="text-sm text-muted-foreground">对这个反应的相信程度</Text>
                        <Stepper
                          value={draft.responseBelief ?? 50}
                          onChange={v => setDraft({ ...draft, responseBelief: v })}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* 结果部分：三个问题，只有完成反应后才出现 */}
                {draft.usedQuestion !== null && (
                  <View className="rounded-xl p-3" style={{ backgroundColor: 'rgba(91,140,123,0.07)' }}>
                    <Text className="block text-base text-primary font-medium mb-2">结果</Text>
                    <View className="flex flex-row items-center justify-between mb-2">
                      <Text className="text-base text-foreground">现在对自动思维的相信</Text>
                      <Stepper
                        value={draft.resultBelief ?? 30}
                        onChange={v => setDraft({ ...draft, resultBelief: v })}
                      />
                    </View>
                    <View className="mb-2">
                      <Text className="block text-base text-primary font-medium mb-1">现在的情绪</Text>
                      <Input
                        className="rounded-xl bg-card text-base"
                        value={draft.resultEmotion}
                        placeholder="如 焦虑、平静"
                        onInput={e => setDraft({ ...draft, resultEmotion: e.detail.value })}
                      />
                      <View className="flex flex-row items-center justify-between mt-2">
                        <Text className="text-sm text-muted-foreground">情绪强烈程度</Text>
                        <Stepper
                          value={draft.resultEmotionIntensity ?? 30}
                          onChange={v => setDraft({ ...draft, resultEmotionIntensity: v })}
                        />
                      </View>
                    </View>
                    <View>
                      <Text className="block text-base text-primary font-medium mb-1">
                        你会做什么（或做了什么）？
                      </Text>
                      <Textarea
                        className="rounded-xl bg-card border border-border text-base"
                        value={draft.resultAction}
                        autoHeight
                        onInput={e => setDraft({ ...draft, resultAction: e.detail.value })}
                        placeholder="做了平衡反应后，你会怎么做？"
                      />
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            <View
              className="px-5 pt-3 pb-6 bg-card border-t border-border flex flex-row gap-3"
              style={{ flexShrink: 0 }}
            >
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setEditing(false)}>
                <Text className="text-base text-primary">取消</Text>
              </Button>
              <Button className="flex-1 rounded-full" onClick={saveDraft}>
                <Check size={16} color="#ffffff" />
                <Text className="ml-1 text-base text-primary-foreground">保存记录</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default MyMoodPage
