import { useEffect, useState } from 'react'
import { View, Text, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { allExercises } from '@/data/fragments'
import { cases } from '@/data/cases'
import { useSessionStore } from '@/store/session'
import { ChartNoAxesColumn, House } from 'lucide-react-taro'

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
        setData({ feedback: body.feedback ?? '', scores: body.scores ?? null })
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

        <View className="mt-4 flex flex-col gap-2">
          <Button className="w-full rounded-full" onClick={backHome}>
            <House size={16} color="#ffffff" />
            <Text className="text-lg text-primary-foreground ml-1">返回首页继续练习</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default FeedbackPage
