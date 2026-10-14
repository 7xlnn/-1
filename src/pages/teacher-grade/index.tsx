import { useState, useCallback, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { SubmissionViewer } from '@/components/submission-viewer'
import { fetchSubmission, gradeSubmission, SubmissionDetail, SubmissionType } from '@/services/homework'
import { Minus, Plus, Eye } from 'lucide-react-taro'

const TYPE_LABEL: Record<SubmissionType, string> = {
  fragment: '片段练习',
  conceptualization: '概念化',
  session: '完整咨询',
  mood: '情绪周记',
}

const QUICK_SCORES = [60, 70, 80, 85, 90, 95, 100]

export default function TeacherGradePage() {
  const router = useRouter()
  const id = Number(router.params.id)
  const [detail, setDetail] = useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(85)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchSubmission(id)
      setDetail(data)
      if (data.status === 'graded' && data.score !== null) {
        setScore(data.score)
        setComment(data.comment || '')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const changeScore = (delta: number) => {
    setScore((s) => Math.max(0, Math.min(100, s + delta)))
  }

  const submit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await gradeSubmission(id, { score, comment: comment.trim() })
      Taro.showToast({ title: '批改已提交', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 800)
    } catch (e) {
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const graded = detail?.status === 'graded'
  const isMood = detail?.type === 'mood'

  return (
    <View className="min-h-screen bg-page pb-28">
      <View className="px-4 pt-4 flex flex-col gap-3">
        {loading || !detail ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <View className="flex flex-row items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary">{TYPE_LABEL[detail.type] || detail.type}</Badge>
                  <Text className="block text-base font-semibold text-foreground">{detail.student_name}</Text>
                  {graded && <Badge>已批改</Badge>}
                </View>
                <Text className="block text-lg text-foreground font-medium">{detail.title}</Text>
              </CardContent>
            </Card>

            <SubmissionViewer content={detail.content} />

            {!isMood ? (
              <Card>
              <CardContent className="p-4">
                <Text className="block text-base text-primary font-medium mb-3">评分</Text>
                <View className="flex flex-row items-center justify-between mb-4">
                  <Button variant="outline" size="icon" onClick={() => changeScore(-1)}>
                    <Minus size={18} color="#3d4a3f" />
                  </Button>
                  <View className="flex flex-row items-baseline gap-1">
                    <Text className="text-4xl font-bold text-primary">{score}</Text>
                    <Text className="block text-base text-muted-foreground">/100</Text>
                  </View>
                  <Button variant="outline" size="icon" onClick={() => changeScore(1)}>
                    <Plus size={18} color="#3d4a3f" />
                  </Button>
                </View>
                <View className="flex flex-row flex-wrap gap-2 mb-4">
                  {QUICK_SCORES.map((q) => (
                    <View
                      key={q}
                      onClick={() => setScore(q)}
                      className={`px-3 py-2 rounded-full border ${
                        score === q ? 'bg-primary border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <Text className={`block text-sm ${score === q ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {q}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text className="block text-base text-primary font-medium mb-2">评语</Text>
                <View className="rounded-xl bg-secondary p-3">
                  <Textarea
                    value={comment}
                    onInput={(e) => setComment(e.detail.value)}
                    placeholder="肯定做得好的地方，指出可改进的技术点……"
                    maxlength={500}
                    style={{ width: '100%', minHeight: '120px', backgroundColor: 'transparent' }}
                  />
                </View>
              </CardContent>
            </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <Eye size={20} color="#9AA19A" />
                    <Text className="block text-sm text-muted-foreground">情绪记录仅查看，不参与评分</Text>
                  </CardContent>
                </Card>
              )}
          </>
        )}
      </View>

      {!loading && detail && !isMood && (
        <View
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            padding: '12px 16px',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e2da',
            zIndex: 100,
          }}
        >
          <Button className="flex-1" onClick={submit} disabled={submitting}>
            <Text className="block">{submitting ? '提交中…' : graded ? '更新批改' : '提交批改'}</Text>
          </Button>
        </View>
      )}
    </View>
  )
}
