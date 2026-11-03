import { useState, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { fetchTeacherList, deleteSubmission, fetchTeacherStats, SubmissionListItem, SubmissionType, TeacherStats } from '@/services/homework'
import { useIdentity } from '@/store/identity'
import { ClipboardCheck, ChevronRight, LogOut, Trash2, Users, FileCheck, Hourglass, Star, ChartColumn, ChartBarBig } from 'lucide-react-taro'

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
  const { role, setRole } = useIdentity()
  const [pending, setPending] = useState<SubmissionListItem[]>([])
  const [graded, setGraded] = useState<SubmissionListItem[]>([])
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, g, s] = await Promise.all([
        fetchTeacherList('pending'),
        fetchTeacherList('graded'),
        fetchTeacherStats(),
      ])
      setPending(p)
      setGraded(g)
      setStats(s)
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

  const TYPE_ORDER: SubmissionType[] = ['fragment', 'conceptualization', 'session', 'mood']

  const renderItemCard = (item: SubmissionListItem, isPendingTab: boolean) => (
    <Card key={item.id} onClick={() => openGrade(item.id)}>
      <CardContent className="p-4">
        <View className="flex flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <View className="flex flex-row items-center gap-2 mb-2">
              <Text className="block text-base font-medium text-foreground">{item.student_name}</Text>
              {item.student_no ? (
                <View className="rounded-md px-1 py-1" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
                  <Text className="block text-xs" style={{ color: '#5B8C7B' }}>{item.student_no}</Text>
                </View>
              ) : null}
              {isPendingTab && (
                <View className="w-2 h-2 rounded-full bg-destructive" />
              )}
            </View>
            <Text className="block text-sm text-muted-foreground mb-2">{item.title}</Text>
            <Text className="block text-xs text-muted-foreground">
              {formatTime(item.created_at)}
              {!isPendingTab ? ` · ${item.status === 'reviewed' ? '已查看' : '已批改'}` : ''}
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
  )

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
            {isPendingTab ? '暂无待处理作业' : '暂无已处理记录'}
          </Text>
        </View>
      )
    }
    return (
      <ScrollView scrollY style={{ height: 'calc(100vh - 220px)' }} className="flex flex-col">
        {TYPE_ORDER.map((t) => {
          const group = list.filter(i => i.type === t)
          if (group.length === 0) return null
          // 二级：按主题/个案（group 字段）分组，并保持出现顺序
          const gs: { k: string; items: SubmissionListItem[] }[] = []
          group.forEach(it => {
            const k = it.group?.trim() || '未分类'
            let g = gs.find(x => x.k === k)
            if (!g) { g = { k, items: [] }; gs.push(g) }
            g.items.push(it)
          })
          return (
            <View key={t} className="mb-4">
              <View className="flex flex-row items-center gap-2 mb-2 px-1">
                <View className="w-1 h-4 rounded-full bg-primary" />
                <Text className="block text-base font-semibold text-foreground">{TYPE_LABEL[t]}</Text>
                <Text className="block text-sm text-muted-foreground">{group.length}</Text>
              </View>
              {gs.map(g => {
                // 三级（完整咨询专用）：个案下按阶段 sub 分组
                const subs: { k: string; items: SubmissionListItem[] }[] = []
                g.items.forEach(it => {
                  const sk = it.sub?.trim() || ''
                  let sg = subs.find(x => x.k === sk)
                  if (!sg) { sg = { k: sk, items: [] }; subs.push(sg) }
                  sg.items.push(it)
                })
                const hasSub = subs.length > 1 || (subs.length === 1 && subs[0].k !== '')
                return (
                  <View key={g.k} className="mb-2">
                    <View className="flex flex-row items-center gap-2 px-2 py-1">
                      <Text className="block text-sm font-semibold text-foreground">{g.k}</Text>
                      <Text className="block text-xs text-muted-foreground">{g.items.length}</Text>
                    </View>
                    <View className="flex flex-col gap-3">
                      {subs.map(sg => {
                        if (!hasSub) {
                          return <View key={g.k + sg.k} className="flex flex-col gap-3">{sg.items.map(item => renderItemCard(item, isPendingTab))}</View>
                        }
                        return (
                          <View key={g.k + sg.k}>
                            <View className="flex flex-row items-center gap-2 px-3 py-1">
                              <View className="w-1 h-3 rounded-full bg-muted" />
                              <Text className="block text-xs font-medium text-muted-foreground">{sg.k || '其他阶段'}</Text>
                              <Text className="block text-xs text-muted-foreground">{sg.items.length}</Text>
                            </View>
                            <View className="flex flex-col gap-3 mt-1">
                              {sg.items.map(item => renderItemCard(item, isPendingTab))}
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}
      </ScrollView>
    )
  }

  const renderOverview = () => {
    if (!stats) {
      return (
        <View className="flex flex-col items-center gap-2 py-12">
          <ChartColumn size={36} color="#9AA19A" />
          <Text className="block text-sm text-muted-foreground">暂无统计数据</Text>
        </View>
      )
    }
    const { overview, byType, byStudent } = stats
    const total = overview.total || 1
    const maxType = Math.max(1, ...byType.map(t => t.count))

    return (
      <ScrollView scrollY style={{ height: 'calc(100vh - 220px)' }} className="flex flex-col space-y-4">
        {/* 概览卡 */}
        <View className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <View className="flex flex-row items-center gap-2 mb-1">
                <Users size={16} color="#5B8C7B" />
                <Text className="block text-xs text-muted-foreground">参与学生</Text>
              </View>
              <Text className="block text-2xl font-bold text-foreground">{overview.studentCount}</Text>
              <Text className="block text-xs text-muted-foreground mt-1">人</Text>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <View className="flex flex-row items-center gap-2 mb-1">
                <FileCheck size={16} color="#5B8C7B" />
                <Text className="block text-xs text-muted-foreground">累计提交</Text>
              </View>
              <Text className="block text-2xl font-bold text-foreground">{overview.total}</Text>
              <Text className="block text-xs text-muted-foreground mt-1">份作业</Text>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <View className="flex flex-row items-center gap-2 mb-1">
                <Hourglass size={16} color="#C0654F" />
                <Text className="block text-xs text-muted-foreground">待处理</Text>
              </View>
              <Text className="block text-2xl font-bold text-foreground">{overview.pending}</Text>
              <Text className="block text-xs text-muted-foreground mt-1">份待批改/查看</Text>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <View className="flex flex-row items-center gap-2 mb-1">
                <Star size={16} color="#5B8C7B" />
                <Text className="block text-xs text-muted-foreground">平均分</Text>
              </View>
              <Text className="block text-2xl font-bold text-foreground">{overview.avgScore || '—'}</Text>
              <Text className="block text-xs text-muted-foreground mt-1">已批改作业</Text>
            </CardContent>
          </Card>
        </View>

        {/* 处理进度 */}
        <Card>
          <CardContent className="p-4">
            <View className="flex flex-row items-center gap-2 mb-3">
              <ChartBarBig size={16} color="#5B8C7B" />
              <Text className="block text-base font-semibold text-foreground">作业处理进度</Text>
            </View>
            <View className="flex flex-col gap-3">
              <View>
                <View className="flex flex-row items-center justify-between mb-1">
                  <Text className="block text-sm text-foreground">已处理 ({overview.graded + overview.reviewed}/{total})</Text>
                  <Text className="block text-xs text-muted-foreground">{Math.round(((overview.graded + overview.reviewed) / total) * 100)}%</Text>
                </View>
                <Progress value={Math.round(((overview.graded + overview.reviewed) / total) * 100)} />
              </View>
              <View>
                <View className="flex flex-row items-center justify-between mb-1">
                  <Text className="block text-sm text-foreground">待处理 ({overview.pending}/{total})</Text>
                  <Text className="block text-xs text-muted-foreground">{Math.round((overview.pending / total) * 100)}%</Text>
                </View>
                <Progress value={Math.round((overview.pending / total) * 100)} />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* 各类型完成分布 */}
        <Card>
          <CardContent className="p-4">
            <View className="flex flex-row items-center gap-2 mb-3">
              <ChartBarBig size={16} color="#5B8C7B" />
              <Text className="block text-base font-semibold text-foreground">各类练习完成分布</Text>
            </View>
            <View className="flex flex-col gap-4">
              {byType.map((t) => (
                <View key={t.type}>
                  <View className="flex flex-row items-center justify-between mb-1">
                    <View className="flex flex-row items-center gap-2">
                      <Text className="block text-sm text-foreground">{t.label}</Text>
                      <Text className="block text-xs text-muted-foreground">{t.count} 份</Text>
                    </View>
                    <Badge variant="secondary">{Math.round((t.count / total) * 100)}%</Badge>
                  </View>
                  <Progress value={Math.round((t.count / maxType) * 100)} />
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* 学生完成榜 */}
        <Card>
          <CardContent className="p-4">
            <View className="flex flex-row items-center gap-2 mb-3">
              <Users size={16} color="#5B8C7B" />
              <Text className="block text-base font-semibold text-foreground">学生完成榜</Text>
            </View>
            {byStudent.length === 0 ? (
              <Text className="block text-sm text-muted-foreground py-4 text-center">暂无学生提交</Text>
            ) : (
              <View className="flex flex-col gap-3">
                {byStudent.map((s, i) => (
                  <View key={s.name} className="flex flex-row items-center gap-3">
                    <View className="w-6 flex items-center justify-center">
                      <Text className="block text-sm font-semibold text-muted-foreground">{i + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex flex-row items-center justify-between mb-1">
                        <View className="flex flex-row items-center gap-2 min-w-0">
                          <Text className="block text-sm text-foreground">{s.name}</Text>
                          {s.no ? (
                            <View className="rounded-md px-1 py-1" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
                              <Text className="block text-xs" style={{ color: '#5B8C7B' }}>{s.no}</Text>
                            </View>
                          ) : null}
                        </View>
                        <View className="flex flex-row items-center gap-2">
                          {s.pending > 0 && (
                            <Text className="block text-xs" style={{ color: '#C0654F' }}>待处理 {s.pending}</Text>
                          )}
                          <Text className="block text-xs text-muted-foreground">{s.total} 份</Text>
                        </View>
                      </View>
                      <Progress value={Math.round((s.total / (byStudent[0].total || 1)) * 100)} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    )
  }

  return (
    <View className="min-h-screen bg-page">
      <View className="bg-primary px-4 pt-6 pb-5">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="block text-white text-xl font-semibold">教师工作台</Text>
            <Text className="block text-white text-base mt-1 opacity-85">学生作业查看与反馈</Text>
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
              待处理{pending.length > 0 ? ` (${pending.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="graded">已处理</TabsTrigger>
            <TabsTrigger value="overview">
              数据概览{stats && stats.overview.total > 0 ? ` (${stats.overview.total})` : ''}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <View className="pt-3">{renderList(pending, true)}</View>
          </TabsContent>
          <TabsContent value="graded">
            <View className="pt-3">{renderList(graded, false)}</View>
          </TabsContent>
          <TabsContent value="overview">
            <View className="pt-3">
              {loading ? (
                <View className="flex flex-col gap-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </View>
              ) : renderOverview()}
            </View>
          </TabsContent>
        </Tabs>
      </View>
    </View>
  )
}
