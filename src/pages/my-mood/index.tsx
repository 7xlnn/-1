import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { HeartPulse, Plus, X, Check, Trash2, PencilLine } from 'lucide-react-taro'
import { ThoughtRecordCard } from '@/components/thought-record-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { COGNITIVE_DISTORTIONS } from '@/data/mood-record'
import type { ThoughtRecordEntry } from '@/data/mood-record'

const STORAGE_KEY = 'my-mood-week'

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
  adaptiveResponse: '',
  responseBelief: null,
  resultBelief: null,
  resultEmotion: '',
  resultAction: ''
})

const MyMoodPage = () => {
  const [entries, setEntries] = useState<ThoughtRecordEntry[]>(() => {
    try {
      return Taro.getStorageSync(STORAGE_KEY) || []
    } catch {
      return []
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
      Taro.setStorageSync(STORAGE_KEY, next)
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
      {/* 头部 */}
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <View className="flex flex-row items-center gap-2">
          <HeartPulse size={18} color="#ffffff" />
          <Text className="text-white text-lg font-bold">我的情绪周记</Text>
        </View>
        <Text className="block mt-2 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
          用咨询师的 DTR 记录表观察自己。先照顾好自己，才能照顾好来访者。
        </Text>
      </View>

      <View className="px-4 -mt-4 pt-2">
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
                  <Text className="block text-sm text-primary font-medium mb-1">日期 / 时间</Text>
                  <Input
                    className="rounded-xl bg-card text-base"
                    value={draft.date}
                    placeholder="如 周三 晚 / 10-15 09:30"
                    onInput={e => setDraft({ ...draft, date: e.detail.value })}
                  />
                </View>

                <View>
                  <Text className="block text-sm text-primary font-medium mb-1">
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
                  <Text className="block text-sm text-primary font-medium mb-1">
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
                    <Text className="text-base text-muted-foreground">对它的相信程度</Text>
                    <Stepper
                      value={draft.thoughtBelief}
                      onChange={v => setDraft({ ...draft, thoughtBelief: v })}
                    />
                  </View>
                </View>

                <View>
                  <Text className="block text-sm text-primary font-medium mb-1">情绪</Text>
                  <Input
                    className="rounded-xl bg-card text-base"
                    value={draft.emotion}
                    placeholder="如 焦虑、悲伤、愤怒"
                    onInput={e => setDraft({ ...draft, emotion: e.detail.value })}
                  />
                  <View className="flex flex-row items-center justify-between mt-2">
                    <Text className="text-base text-muted-foreground">情绪强烈程度</Text>
                    <Stepper
                      value={draft.emotionIntensity}
                      onChange={v => setDraft({ ...draft, emotionIntensity: v })}
                    />
                  </View>
                </View>

                <View>
                  <Text className="block text-sm text-primary font-medium mb-2">
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

                <View>
                  <Text className="block text-sm text-primary font-medium mb-1">
                    适合的反应（选作）：换个角度，我可以怎么想？
                  </Text>
                  <Textarea
                    className="rounded-xl bg-card border border-border text-base"
                    value={draft.adaptiveResponse}
                    autoHeight
                    onInput={e => setDraft({ ...draft, adaptiveResponse: e.detail.value })}
                    placeholder="证据是什么？有没有别的解释？最坏会怎样、我能应对吗？"
                  />
                </View>
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
