import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ClipboardList, RefreshCw, BookOpenCheck } from 'lucide-react-taro'
import { cases } from '@/data/cases'
import { Network } from '@/network'
import { ThoughtRecordCard } from '@/components/thought-record-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ThoughtRecordEntry } from '@/data/mood-record'

interface WeekData {
  weekLabel: string
  entries: ThoughtRecordEntry[]
}

const buildCacheKey = (caseId: string, index: number) => `mood-record:${caseId}:${index}`

const MoodRecordPage = () => {
  const router = useRouter()
  const caseId = router.params.caseId ?? ''
  const index = Number(router.params.index)
  const c = cases.find(x => x.id === caseId)

  const sessionHomework = c?.sessions.find(s => s.index === index)?.homework ?? ''

  const [week, setWeek] = useState<WeekData | null>(() => {
    try {
      const cached = Taro.getStorageSync(buildCacheKey(caseId, index))
      return cached || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(week === null)
  const [error, setError] = useState('')

  const loadRecords = async () => {
    if (!c) return
    setLoading(true)
    setError('')
    try {
      const session = c.sessions.find(s => s.index === index)
      const res = await Network.request({
        url: '/api/cbt/mood-record',
        method: 'POST',
        data: {
          profile: c.client,
          sessionIndex: index,
          totalSessions: c.sessions.length,
          sessionTitle: session?.title,
          sessionGoal: session?.goal
        }
      })
      console.log('[MOOD RECORD] response:', res.data)
      const body = res.data as { weekLabel?: string; entries?: ThoughtRecordEntry[] }
      if (body && Array.isArray(body.entries) && body.entries.length > 0) {
        const data: WeekData = {
          weekLabel: body.weekLabel ?? `第 ${index} 次会谈前一周`,
          entries: body.entries
        }
        setWeek(data)
        try {
          Taro.setStorageSync(buildCacheKey(caseId, index), data)
        } catch {
          // 缓存失败不影响展示
        }
      } else {
        setError('本次没有生成有效记录，请重试')
      }
    } catch (e) {
      console.error('[MOOD RECORD] failed:', e)
      setError('网络或服务异常，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 首次进入：无缓存时自动加载一次
  useEffect(() => {
    if (week === null) {
      void loadRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!c) {
    return (
      <View className="p-6">
        <Text className="text-lg text-muted-foreground">未找到该个案</Text>
      </View>
    )
  }

  return (
    <View className="min-h-full bg-background pb-10">
      {/* 头部 */}
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <View className="flex flex-row items-center gap-2">
          <ClipboardList size={18} color="#ffffff" />
          <Text className="text-white text-lg font-bold">来访者情绪记录表</Text>
        </View>
        <Text className="block mt-2 text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {c.client.name} · 第 {index}/{c.sessions.length} 次会谈前一周
        </Text>
        <Text className="block mt-2 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          这是来访者在会谈前自己记录的一周情绪与思维，可帮助你快速了解其近况与典型模式。
        </Text>
      </View>

      <View className="px-4 -mt-4 pt-2">
        {loading && (
          <View className="flex flex-col gap-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </View>
        )}

        {!loading && error && (
          <View className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col items-center">
            <Text className="block text-lg text-muted-foreground text-center">{error}</Text>
            <Button className="mt-4 rounded-full" onClick={loadRecords}>
              <Text className="text-base text-primary-foreground">重新加载</Text>
            </Button>
          </View>
        )}

        {sessionHomework && (
          <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
            <View className="flex flex-row items-center gap-2 mb-2">
              <BookOpenCheck size={16} color="#5B8C7B" />
              <Text className="text-lg font-semibold text-foreground">本次会谈布置的作业</Text>
            </View>
            <Text className="block text-base leading-relaxed" style={{ color: '#3C423E' }}>
              {sessionHomework}
            </Text>
            <Text className="block text-sm mt-2" style={{ color: '#6B6F68' }}>
              第 {index} 次会谈结束时，您给来访者布置了以上作业，可据此核对下一次的完成情况。
            </Text>
          </View>
        )}

        {!loading && week && (
          <View className="flex flex-col gap-3">
            {week.entries.map((e, i) => (
              <ThoughtRecordCard key={`${e.date}-${i}`} entry={e} />
            ))}
            <Button variant="outline" className="rounded-full mt-1" onClick={loadRecords}>
              <RefreshCw size={16} color="#5B8C7B" />
              <Text className="ml-2 text-base text-primary">重新生成（模拟另一种一周）</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}

export default MoodRecordPage
