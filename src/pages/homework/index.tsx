import { useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchMySubmissions, SubmissionListItem, SubmissionType } from '@/services/homework'
import { useIdentity } from '@/store/identity'
import { ClipboardCheck, CircleCheck, Clock, Settings } from 'lucide-react-taro'

const TYPE_LABEL: Record<SubmissionType, string> = {
  fragment: '片段练习',
  conceptualization: '概念化',
  session: '完整咨询',
  mood: '情绪周记',
}

function formatTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function HomeworkPage() {
  const { studentName, studentId } = useIdentity()
  const [list, setList] = useState<SubmissionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMySubmissions(studentId)
      setList(data)
    } catch (e) {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useDidShow(() => {
    if (!studentName) {
      Taro.navigateTo({ url: '/pages/identity/index' })
      return
    }
    load()
  })

  const openDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/homework-detail/index?id=${id}` })
  }

  return (
    <View className="min-h-screen bg-page">
      <View className="bg-primary px-4 pt-6 pb-5">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="block text-white text-xl font-semibold">我的作业</Text>
            <Text className="block text-white text-base mt-1 opacity-85">{studentName} 的提交与批改</Text>
          </View>
          <View
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onClick={() => Taro.navigateTo({ url: '/pages/identity/index' })}
          >
            <Settings size={18} color="#ffffff" />
          </View>
        </View>
      </View>

      <View className="px-4 pt-4">
        {loading ? (
          <View className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </View>
        ) : error ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <Text className="block text-muted-foreground text-base">{error}</Text>
              <Button variant="outline" onClick={load}><Text className="block">重新加载</Text></Button>
            </CardContent>
          </Card>
        ) : list.length === 0 ? (
          <Card>
            <CardContent className="p-8 flex flex-col items-center gap-3">
              <ClipboardCheck size={36} color="#9AA19A" />
              <Text className="block text-foreground text-base font-medium">还没有提交过作业</Text>
              <Text className="block text-muted-foreground text-sm text-center leading-relaxed">
                完成片段练习、会谈或情绪周记后，{'\n'}点击「提交给老师」即可在这里查看批改
              </Text>
            </CardContent>
          </Card>
        ) : (
          <ScrollView scrollY className="flex flex-col gap-3" style={{ height: 'calc(100vh - 180px)' }}>
            {list.map((item) => (
              <Card key={item.id} onClick={() => openDetail(item.id)}>
                <CardContent className="p-4">
                  <View className="flex flex-row items-start justify-between mb-2">
                    <View className="flex flex-row items-center gap-2 flex-1 pr-2">
                      <Badge variant="secondary">{TYPE_LABEL[item.type] || item.type}</Badge>
                      <Text className="block text-foreground text-base font-medium flex-1">{item.title}</Text>
                    </View>
                    {item.status === 'graded' ? (
                      <View className="flex flex-row items-center gap-1">
                        <CircleCheck size={16} color="#5B8C7B" />
                        <Text className="block text-primary text-base font-medium">
                          {item.type === 'mood' ? '已批改' : `已批改 · ${item.score}`}
                        </Text>
                      </View>
                    ) : (
                      <View className="flex flex-row items-center gap-1">
                        <Clock size={14} color="#9AA19A" />
                        <Text className="block text-muted-foreground text-sm">待批改</Text>
                      </View>
                    )}
                  </View>
                  <Text className="block text-xs text-muted-foreground">{formatTime(item.created_at)} 提交</Text>
                  {item.status === 'graded' && item.comment && (
                    <View
                      className="mt-2 rounded-lg px-3 py-2"
                      style={{ backgroundColor: 'rgba(91,140,123,0.08)' }}
                    >
                      <Text className="block text-sm text-foreground leading-relaxed">{item.comment}</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}
