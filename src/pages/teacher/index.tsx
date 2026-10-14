import { useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { fetchTeacherList, deleteSubmission, SubmissionListItem, SubmissionType } from '@/services/homework'
import { useIdentity } from '@/store/identity'
import { ClipboardCheck, ChevronRight, LogOut, Trash2 } from 'lucide-react-taro'

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

export default function TeacherPage() {
  const { role, teacherName, setRole } = useIdentity()
  const [pending, setPending] = useState<SubmissionListItem[]>([])
  const [graded, setGraded] = useState<SubmissionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, g] = await Promise.all([
        fetchTeacherList('pending'),
        fetchTeacherList('graded'),
      ])
      setPending(p)
      setGraded(g)
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useDidShow(() => {
    if (role !== 'teacher') {
      Taro.redirectTo({ url: '/pages/identity/index' })
      return
    }
    load()
  })

  const openGrade = (id: number) => {
    Taro.navigateTo({ url: `/pages/teacher-grade/index?id=${id}` })
  }

  const handleDelete = (id: number) => {
    Taro.showModal({
      title: '删除作业',
      content: '确定删除这条作业吗？删除后学生端也将不再显示。',
      confirmText: '删除',
      confirmColor: '#c0654f',
      success: async (r) => {
        if (!r.confirm) return
        try {
          await deleteSubmission(id)
          Taro.showToast({ title: '已删除', icon: 'success' })
          load()
        } catch (e) {
          Taro.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  }

  const renderList = (list: SubmissionListItem[], isPendingTab: boolean) => {
    if (loading) {
      return (
        <View className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </View>
      )
    }
    if (list.length === 0) {
      return (
        <View className="flex flex-col items-center gap-2 py-12">
          <ClipboardCheck size={36} color="#9AA19A" />
          <Text className="block text-sm text-muted-foreground">
            {isPendingTab ? '暂无待批改作业' : '暂无已批改记录'}
          </Text>
        </View>
      )
    }
    return (
      <ScrollView scrollY style={{ height: 'calc(100vh - 210px)' }} className="flex flex-col gap-3">
        {list.map((item) => (
          <Card key={item.id} onClick={() => openGrade(item.id)}>
            <CardContent className="p-4">
              <View className="flex flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Badge variant="secondary">{TYPE_LABEL[item.type] || item.type}</Badge>
                    <Text className="block text-base font-medium text-foreground">{item.student_name}</Text>
                    {isPendingTab && (
                      <View className="w-2 h-2 rounded-full bg-destructive" />
                    )}
                  </View>
                  <Text className="block text-sm text-muted-foreground mb-2">{item.title}</Text>
                  <Text className="block text-xs text-muted-foreground">
                    {formatTime(item.created_at)}
                    {!isPendingTab ? ' · 已批改' : ''}
                  </Text>
                </View>
                <View
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(192,101,79,0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                >
                  <Trash2 size={16} color="#c0654f" />
                </View>
                <ChevronRight size={18} color="#9AA19A" />
              </View>
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    )
  }

  return (
    <View className="min-h-screen bg-page">
      <View className="bg-primary px-4 pt-6 pb-5">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="block text-white text-xl font-semibold">教师工作台</Text>
            <Text className="block text-white text-base mt-1 opacity-85">{teacherName || '老师'} · 学生作业批改</Text>
          </View>
          <View
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onClick={() => { setRole('student'); Taro.switchTab({ url: '/pages/index/index' }) }}
          >
            <LogOut size={18} color="#ffffff" />
          </View>
        </View>
      </View>

      <View className="px-4 pt-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="pending">
              待批改{pending.length > 0 ? ` (${pending.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="graded">已批改</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <View className="pt-3">{renderList(pending, true)}</View>
          </TabsContent>
          <TabsContent value="graded">
            <View className="pt-3">{renderList(graded, false)}</View>
          </TabsContent>
        </Tabs>
      </View>
    </View>
  )
}
