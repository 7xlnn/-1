import { useEffect, useState } from 'react'
import { View, Text, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { allExercises } from '@/data/fragments'
import { cases } from '@/data/cases'
import { useSessionStore } from '@/store/session'
import { useProgressStore } from '@/store/progress'
import { CircleCheck, ChartNoAxesColumn, ClipboardList, House, ListChecks, Send } from 'lucide-react-taro'
import { submitAsStudent, ensureStudentName } from '@/services/homework'

/** 六维评分定义（与后端一致） */
const DIMENSIONS = [
  { key: 'empathy', label: '共情与关系' },
  { key: 'socratic', label: '苏格拉底式提问' },
  { key: 'collaboration', label: '合作与引导' },
  { key: 'agenda', label: '结构化与议程' },
  { key: 'technique', label: '技术运用准确' },
  { key: 'homework', label: '作业与巩固' }
]

interface FeedbackResult {
  feedback: string
  scores: Record<string, number> | null
  sessionCheck?: {
    metGoals?: string[]
    unmetGoals?: string[]
    homework?: string
  } | null
}

interface AskItem {
  q: string
  a: string
}

/** 极简 Markdown -> 可被 RichText 使用的 HTML（仅覆盖督导模板用到的语法） */
function mdToHtml(md: string): string {
  const lines = md.replace(/\r/g, '').split('\n')
  const out: string[] = []
  for (let raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (/^##\s+/.test(line)) {
      out.push(`<h3 style="font-size:17px;font-weight:600;margin:14px 0 6px;color:#2F3430;">${inline(line.replace(/^##\s+/, ''))}</h3>`)
    } else if (/^#\s+/.test(line)) {
      out.push(`<h2 style="font-size:19px;font-weight:700;margin:12px 0 6px;color:#2F3430;">${inline(line.replace(/^#\s+/, ''))}</h2>`)
    } else if (/^[-·*]\s+/.test(line)) {
      out.push(`<p style="margin:4px 0;line-height:1.7;color:#3C423E;">· ${inline(line.replace(/^[-·*]\s+/, ''))}</p>`)
    } else {
      out.push(`<p style="margin:6px 0;line-height:1.7;color:#3C423E;">${inline(line)}</p>`)
    }
  }
  return out.join('')
}

function inline(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;">$1</strong>')
}

const FeedbackPage = () => {
  const { profile, messages, fragmentId, caseId, sessionIndex, pendingFeedback, clearPersisted } = useSessionStore()
  const [data, setData] = useState<FeedbackResult | null>(
    pendingFeedback as FeedbackResult | null
  )
  const [loading, setLoading] = useState(!pendingFeedback)
  const [error, setError] = useState('')
  const [asks, setAsks] = useState<AskItem[]>([])
  const [askInput, setAskInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isFragment = !!fragmentId
  const ex = isFragment ? allExercises.find(e => e.id === fragmentId) : null
  const currentCase = !isFragment ? cases.find(c => c.id === caseId) : null
  const session = currentCase?.sessions.find(s => s.index === sessionIndex)
  const title = ex?.title ?? session?.title ?? '本次练习'

  useEffect(() => {
    if (pendingFeedback) {
      setLoading(false)
      return
    }
    if (!profile || (!ex && !session)) return
    if (!messages.length) return

    const fetchFeedback = async () => {
      setLoading(true)
      try {
        console.log('[CBT feedback request] /api/cbt/feedback', messages.length, 'turns')
        const res = await Network.request({
          url: '/api/cbt/feedback',
          method: 'POST',
          data: {
            profile,
            messages,
            taskType: ex?.taskType ?? 'session',
            userWork: '',
            sessionGoal: ex ? ex.goals.join('；') : session?.goal ?? '',
            sessionTitle: isFragment ? '' : `${sessionIndex} 次会谈 · ${session?.title ?? ''}`
          }
        })
        console.log('[CBT feedback response]', res.data)
        const body = res.data as FeedbackResult
        setData({
          feedback: body.feedback ?? '',
          scores: body.scores ?? null,
          sessionCheck: body.sessionCheck ?? null
        })
        // 写入学习进度（仅当存在有效评分）
        const sc = body.scores && typeof body.scores === 'object' ? body.scores : null
        if (sc) {
          const vals = Object.values(sc).map(Number).filter(Number.isFinite)
          const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0
          useProgressStore.getState().addRecord({
            kind: isFragment ? 'fragment' : 'session',
            title,
            category: ex?.categoryName ?? session?.title ?? title,
            avg,
            scores: sc
          })
          console.log('[CBT progress] 已记录练习：', title, '均分', avg)
        }
      } catch (e) {
        console.error('[CBT feedback error]', e)
        setError('获取督导反馈失败，请重试')
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const backHome = () => {
    // 反馈已查看，清除本次会话存档
    clearPersisted()
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  const askSupervisor = async () => {
    const q = askInput.trim()
    if (!q || asking || !data?.feedback) return
    setAsking(true)
    try {
      const res = await Network.request({
        url: '/api/cbt/ask-supervisor',
        method: 'POST',
        data: {
          title,
          clientName: profile?.name ?? '来访者',
          report: data.feedback,
          question: q
        }
      })
      setAsks(prev => [...prev, { q, a: (res.data as { reply?: string }).reply ?? '' }])
      setAskInput('')
    } catch (e) {
      console.error('[CBT ask-supervisor error]', e)
      Taro.showToast({ title: '追问失败，请重试', icon: 'none' })
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return (
      <View className="min-h-full bg-background flex items-center justify-center">
        <Text className="text-lg text-muted-foreground">督导正在回看你的咨询记录…</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View className="min-h-full bg-background p-6 flex flex-col items-center justify-center">
        <Text className="block text-lg text-muted-foreground">{error || '暂无反馈'}</Text>
        <Button variant="outline" className="mt-4 rounded-full" onClick={backHome}>
          <Text className="text-lg">返回首页</Text>
        </Button>
      </View>
    )
  }

  const scores = (data.scores && typeof data.scores === 'object') ? data.scores : null
  const avg = scores
    ? Math.round((DIMENSIONS.reduce((sum, d) => sum + Number(scores[d.key] ?? 0), 0) / DIMENSIONS.length) * 10) / 10
    : null

  const submitHomework = async () => {
    if (submitting || submitted) return
    if (!ensureStudentName()) return
    setSubmitting(true)
    try {
      await submitAsStudent({
        type: isFragment ? 'fragment' : 'session',
        title,
        content: {
          summary: title,
          messages,
          feedback: data.feedback,
          scores: data.scores,
          sessionCheck: data.sessionCheck,
        },
      })
      setSubmitted(true)
      Taro.showToast({ title: '已提交给老师', icon: 'success' })
    } catch (e) {
      console.error('[homework submit error]', e)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="min-h-full bg-background pb-10">
      {/* 评分头部 */}
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl flex flex-row items-center gap-4">
        <View className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' }}>
          <Text className="text-white text-2xl font-bold">{avg ?? '—'}</Text>
        </View>
        <View className="flex-1">
          <Text className="block text-white text-lg font-bold">督导反馈</Text>
          <Text className="block text-base mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</Text>
        </View>
      </View>

      <View className="px-4 -mt-4">
        {/* 六维技能评分 */}
        {scores && (
          <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
            <View className="flex flex-row items-center gap-2">
              <ChartNoAxesColumn size={16} color="#5B8C7B" />
              <Text className="text-lg font-semibold text-foreground">本次技能评分</Text>
              <Text className="block flex-1 text-right text-base text-muted-foreground">满分 10</Text>
            </View>
            <View className="mt-4 flex flex-col gap-3">
              {DIMENSIONS.map(d => {
                const v = scores[d.key] ?? 0
                return (
                  <View key={d.key}>
                    <View className="flex flex-row items-center mb-1">
                      <Text className="block flex-1 text-base text-foreground">{d.label}</Text>
                      <Text className="text-base font-semibold text-primary">{v}</Text>
                    </View>
                    <View className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${v * 10}%` }}
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 文字反馈（Markdown） */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <RichText nodes={mdToHtml(data.feedback)} />
        </View>

        {/* 完整咨询：目标核对 + 下周作业 */}
        {!isFragment && data.sessionCheck && (
          <View className="bg-card rounded-2xl border border-border shadow-sm mt-3 overflow-hidden">
            <View className="flex flex-row items-center gap-2 px-4 py-3" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
              <ListChecks size={16} color="#5B8C7B" />
              <Text className="text-lg font-semibold text-foreground">本次会谈目标核对</Text>
            </View>
            <View className="p-4 flex flex-col gap-3">
              {data.sessionCheck.metGoals?.length ? (
                <View className="flex flex-col gap-2">
                  <Text className="text-base font-medium text-primary">✓ 已逐步达成</Text>
                  {data.sessionCheck.metGoals.map((g, i) => (
                    <Text key={i} className="block text-base leading-relaxed" style={{ color: '#3C423E' }}>
                      <Text className="text-primary">{g}</Text>
                    </Text>
                  ))}
                </View>
              ) : null}
              {data.sessionCheck.unmetGoals?.length ? (
                <View className="flex flex-col gap-2 pt-1 border-t border-border">
                  <Text className="text-base font-medium text-muted-foreground">↗ 待继续推进</Text>
                  {data.sessionCheck.unmetGoals.map((g, i) => (
                    <Text key={i} className="block text-base leading-relaxed" style={{ color: '#6B6F68' }}>
                      • {g}
                    </Text>
                  ))}
                </View>
              ) : null}
              {data.sessionCheck.homework ? (
                <View className="flex flex-row items-start gap-2 pt-3 border-t border-border">
                  <ClipboardList size={18} color="#5B8C7B" className="mt-1" />
                  <View className="flex-1">
                    <Text className="block text-base font-semibold text-foreground mb-1">下周作业</Text>
                    <Text className="block text-base leading-relaxed" style={{ color: '#3C423E' }}>
                      {data.sessionCheck.homework}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* 追问督导对话区 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2 mb-3">
            <CircleCheck size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">还有什么想请督导指点？</Text>
          </View>
          <Text className="block text-base mb-3 leading-relaxed" style={{ color: '#6B6F68' }}>
            对刚才的练习或反馈有问题，可以直接向督导追问，例如：「我这个情境里该怎么先共情再提问？」
          </Text>

          {asks.length > 0 && (
            <View className="flex flex-col gap-3 mb-3">
              {asks.map((it, i) => (
                <View key={i} className="flex flex-col gap-2">
                  <View className="self-end max-w-full bg-primary rounded-2xl rounded-br-sm px-4 py-2">
                    <Text className="block text-base leading-relaxed" style={{ color: '#ffffff' }}>{it.q}</Text>
                  </View>
                  <View className="self-start max-w-full bg-secondary rounded-2xl rounded-bl-sm px-4 py-2">
                    <Text className="block text-base leading-relaxed" style={{ color: '#2F3430' }}>{it.a}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View className="flex-1 bg-secondary rounded-2xl px-4 py-2">
              <Input
                className="w-full text-base bg-transparent"
                placeholder="输入你的问题…"
                value={askInput}
                onInput={e => setAskInput(e.detail.value)}
                disabled={asking}
                confirmType="send"
                onConfirm={askSupervisor}
              />
            </View>
            <Button size="sm" className="rounded-full flex-shrink-0" onClick={askSupervisor} disabled={asking}>
              <Text className="text-base">{asking ? '回答中' : '追问'}</Text>
            </Button>
          </View>
        </View>

        <View className="mt-4 flex flex-col gap-2">
          <Button
            variant={submitted ? 'outline' : 'default'}
            className="w-full rounded-full"
            onClick={submitHomework}
            disabled={submitting || submitted}
          >
            {submitted ? (
              <>
                <CircleCheck size={16} color="#5B8C7B" />
                <Text className="text-base ml-1">已提交，等待老师批改</Text>
              </>
            ) : (
              <>
                <Send size={16} color={submitting ? '#9AA19A' : '#ffffff'} />
                <Text className={`text-base ml-1 ${submitting ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
                  {submitting ? '提交中…' : '提交给老师'}
                </Text>
              </>
            )}
          </Button>
          <Button variant="ghost" className="w-full rounded-full" onClick={backHome}>
            <House size={16} color="#5B8C7B" />
            <Text className="text-base text-primary ml-1">返回首页继续练习</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default FeedbackPage
