import { useState, useCallback, useEffect } from 'react'
import { useRouter } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SubmissionViewer } from '@/components/submission-viewer'
import { fetchSubmission, SubmissionDetail, SubmissionType } from '@/services/homework'

const TYPE_LABEL: Record<SubmissionType, string> = {
  fragment: '片段练习',
  conceptualization: '概念化',
  session: '完整咨询',
  mood: '情绪周记',
}

export default function HomeworkDetailPage() {
  const router = useRouter()
  const id = Number(router.params.id)
  const [detail, setDetail] = useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchSubmission(id)
      setDetail(data)
    } catch (e) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <View className="min-h-screen bg-page">
      <View className="px-4 pt-4 flex flex-col gap-3 pb-8">
        {loading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </>
        ) : error || !detail ? (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <Text className="block text-muted-foreground">{error || '未找到作业'}</Text>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <View className="flex flex-row items-center gap-2 mb-2">
                  <Badge variant="secondary">{TYPE_LABEL[detail.type] || detail.type}</Badge>
                  {detail.status === 'graded' ? (
                    <Badge>已批改 · {detail.score}分</Badge>
                  ) : (
                    <Badge variant="outline">待批改</Badge>
                  )}
                </View>
                <Text className="block text-lg font-semibold text-foreground">{detail.title}</Text>
              </CardContent>
            </Card>

            <SubmissionViewer content={detail.content} />

            {detail.status === 'graded' && detail.comment && (
              <Card className="border-primary">
                <CardContent className="p-4">
                  <Text className="block text-base text-primary font-medium mb-2">老师评语</Text>
                  <Text className="block text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {detail.comment}
                  </Text>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </View>
    </View>
  )
}
