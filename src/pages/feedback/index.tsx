import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { allExercises } from '@/data/fragments'
import { cases } from '@/data/cases'
import { useSessionStore } from '@/store/session'
import { CircleCheck, TriangleAlert, Lightbulb, BookMarked, House } from 'lucide-react-taro'

interface FeedbackData {
  score: number
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  knowledge: string
}

const FeedbackPage = () => {
  const { profile, messages, fragmentId, caseId, sessionIndex, pendingFeedback } = useSessionStore()
  const [data, setData] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(!pendingFeedback)
  const [error, setError] = useState('')

  const isFragment = !!fragmentId
  const ex = isFragment ? allExercises.find(e => e.id === fragmentId) : null
  const currentCase = !isFragment ? cases.find(c => c.id === caseId) : null
  const session = currentCase?.sessions.find(s => s.index === sessionIndex)

  useEffect(() => {
    if (pendingFeedback) {
      setData(pendingFeedback as FeedbackData)
      setLoading(false)
      return
    }
    if (!profile || (!ex && !session)) return

    const fetchFeedback = async () => {
      setLoading(true)
      try {
        console.log('[CBT feedback request] chat end')
        const res = await Network.request({
          url: '/api/cbt/feedback',
          method: 'POST',
          data: {
            profile,
            messages,
            exerciseTitle: ex?.title ?? `第 ${sessionIndex} 次 · ${session?.title}`,
            exerciseGoal: ex ? ex.goals.join('；') : session?.goal ?? ''
          }
        })
        console.log('[CBT feedback response]', res.data)
        setData(res.data as FeedbackData)
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
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  if (loading) {
    return (
      <View className="min-h-full bg-background flex items-center justify-center">
        <Text className="text-sm text-muted-foreground">督导正在回看你的咨询记录…</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View className="min-h-full bg-background p-6 flex flex-col items-center justify-center">
        <Text className="block text-sm text-muted-foreground">{error || '暂无反馈'}</Text>
        <Button variant="outline" className="mt-4 rounded-full" onClick={backHome}>
          <Text className="text-sm">返回首页</Text>
        </Button>
      </View>
    )
  }

  return (
    <View className="min-h-full bg-background pb-10">
      {/* 评分头部 */}
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl flex flex-row items-center gap-4">
        <View className="w-16 h-16 rounded-full bg-white bg-opacity-15 border-2 border-white border-opacity-40 flex items-center justify-center">
          <Text className="text-white text-2xl font-bold">{data.score}</Text>
        </View>
        <View className="flex-1">
          <Text className="block text-white text-base font-bold">督导反馈</Text>
          <Text className="block text-white text-opacity-85 text-xs mt-1 leading-relaxed">
            {ex?.title ?? session?.title ?? '本次练习'}
          </Text>
        </View>
      </View>

      <View className="px-4 -mt-4">
        <Section icon={<CircleCheck size={15} color="#5B8C7B" />} title="做得好的地方">
          {data.strengths.map((s, i) => (
            <Bullet key={i} text={s} dotClass="bg-primary" />
          ))}
        </Section>

        <Section icon={<TriangleAlert size={15} color="#B07D54" />} title="可以改进的地方">
          {data.improvements.map((s, i) => (
            <Bullet key={i} text={s} dotClass="bg-[#B07D54]" />
          ))}
        </Section>

        <Section icon={<Lightbulb size={15} color="#5B8C7B" />} title="下次可以这样尝试">
          {data.suggestions.map((s, i) => (
            <Bullet key={i} text={s} dotClass="bg-accent" />
          ))}
        </Section>

        <Section icon={<BookMarked size={15} color="#5B8C7B" />} title="知识点回顾">
          <Text className="block text-xs leading-relaxed text-foreground text-opacity-90">{data.knowledge}</Text>
        </Section>

        <View className="mt-4 flex flex-col gap-2">
          <Button className="w-full rounded-full" onClick={backHome}>
            <House size={15} color="#ffffff" />
            <Text className="text-sm text-primary-foreground ml-1">返回首页继续练习</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

const Section = ({
  icon, title, children
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
    <View className="flex flex-row items-center gap-2">
      {icon}
      <Text className="text-sm font-semibold text-foreground">{title}</Text>
    </View>
    <View className="mt-3 flex flex-col gap-2">{children}</View>
  </View>
)

const Bullet = ({ text, dotClass }: { text: string; dotClass: string }) => (
  <View className="flex flex-row items-start gap-2">
    <View className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${dotClass}`} />
    <Text className="block flex-1 text-xs leading-relaxed text-foreground text-opacity-90">{text}</Text>
  </View>
)

export default FeedbackPage
