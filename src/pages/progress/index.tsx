import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@/components/ui/button'
import { categoryCounts, useProgressStore } from '@/store/progress'
import { TrendingUp, ChartBar, Trophy, ArrowLeft } from 'lucide-react-taro'

const DIMENSIONS = [
  { key: 'empathy', label: '共情与关系' },
  { key: 'socratic', label: '苏格拉底式提问' },
  { key: 'collaboration', label: '合作与引导' },
  { key: 'agenda', label: '结构化与议程' },
  { key: 'technique', label: '技术运用准确' },
  { key: 'homework', label: '作业与巩固' }
]

const ProgressPage = () => {
  const records = useProgressStore(s => s.records)

  const stats = useMemo(() => {
    const cats = categoryCounts(records)
    const total = records.length
    const avgNow = records.length
      ? Math.round((records.reduce((a, b) => a + b.avg, 0) / records.length) * 10) / 10
      : 0
    const latest = [...records].sort((a, b) => a.ts - b.ts)
    const lastAvg = latest.length ? latest[latest.length - 1].avg : null
    return { cats, total, avgNow, lastAvg }
  }, [records])

  const trend = useMemo(() => {
    const latest = [...records].sort((a, b) => a.ts - b.ts).slice(-10)
    return latest
  }, [records])

  const dimAvg = useMemo(() => {
    const dims: Record<string, { sum: number; n: number }> = {}
    for (const r of records) {
      for (const d of DIMENSIONS) {
        const v = Number(r.scores?.[d.key])
        if (Number.isFinite(v)) {
          dims[d.key] = dims[d.key] ?? { sum: 0, n: 0 }
          dims[d.key].sum += v
          dims[d.key].n += 1
        }
      }
    }
    return DIMENSIONS.map(d => {
      const x = dims[d.key]
      return { key: d.key, label: d.label, avg: x ? Math.round((x.sum / x.n) * 10) / 10 : null }
    })
  }, [records])

  const goBack = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  const maxTrend = Math.max(10, ...trend.map(t => Math.ceil(t.avg)))

  return (
    <View className="min-h-full bg-background pb-10">
      {/* 头部 */}
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl flex flex-row items-center gap-4">
        <View
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          onClick={goBack}
        >
          <ArrowLeft size={22} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="block text-white text-lg font-bold">我的学习进度</Text>
          <Text className="block text-base mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
            记录每一步成长，见证每一次进步
          </Text>
        </View>
      </View>

      <View className="px-4 -mt-4">
        {/* 汇总卡片 */}
        <View className="grid grid-cols-3 gap-3 mt-3">
          <View className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col items-center">
            <ChartBar size={18} color="#5B8C7B" />
            <Text className="block text-2xl font-bold text-foreground mt-2">{stats.total}</Text>
            <Text className="block text-sm text-muted-foreground">累计练习</Text>
          </View>
          <View className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col items-center">
            <TrendingUp size={18} color="#5B8C7B" />
            <Text className="block text-2xl font-bold text-foreground mt-2">{stats.avgNow.toFixed(1)}</Text>
            <Text className="block text-sm text-muted-foreground">平均分</Text>
          </View>
          <View className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col items-center">
            <Trophy size={18} color="#5B8C7B" />
            <Text className="block text-2xl font-bold text-foreground mt-2">
              {stats.lastAvg === null ? '—' : stats.lastAvg.toFixed(1)}
            </Text>
            <Text className="block text-sm text-muted-foreground">最近一次</Text>
          </View>
        </View>

        {records.length === 0 ? (
          <View className="bg-card rounded-2xl border border-border p-6 mt-3 flex flex-col items-center">
            <Text className="block text-lg text-muted-foreground">还没有练习记录</Text>
            <Text className="block text-base text-muted-foreground mt-1">先去完成一次片段练习或会谈吧</Text>
            <Button className="mt-4 rounded-full" onClick={goBack}>
              <Text className="text-base text-primary-foreground">去练习</Text>
            </Button>
          </View>
        ) : (
          <>
            {/* 六维技能均值 */}
            <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
              <Text className="block text-lg font-semibold text-foreground mb-3">技能维度均值</Text>
              <View className="flex flex-col gap-3">
                {dimAvg.map(d => (
                  <View key={d.key}>
                    <View className="flex flex-row items-center mb-1">
                      <Text className="block flex-1 text-base text-foreground">{d.label}</Text>
                      <Text className="text-base font-semibold text-primary">{d.avg ?? '—'}</Text>
                    </View>
                    <View className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(d.avg ?? 0) * 10}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 技术完成度 */}
            <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
              <Text className="block text-lg font-semibold text-foreground mb-3">技术练习完成度</Text>
              {stats.cats.length ? (
                <View className="flex flex-col gap-3">
                  {stats.cats.map(c => (
                    <View key={c.name}>
                      <View className="flex flex-row items-center mb-1">
                        <Text className="block flex-1 text-base text-foreground">{c.name}</Text>
                        <Text className="text-base font-semibold text-primary">{c.count} 次</Text>
                      </View>
                      <View className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, c.count * 20)}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="block text-base text-muted-foreground">暂无技术分类数据</Text>
              )}
            </View>

            {/* 督导分走势 */}
            {trend.length > 1 && (
              <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
                <Text className="block text-lg font-semibold text-foreground mb-3">近 10 次分数走势</Text>
                <View className="flex flex-row items-end gap-1" style={{ height: 120 }}>
                  {trend.map((t, i) => (
                    <View
                      key={i}
                      className="flex-1 bg-primary rounded-t flex flex-col items-center justify-end"
                      style={{ height: `${Math.max(6, (t.avg / maxTrend) * 100)}%`, backgroundColor: 'rgba(91,140,123,0.7)' }}
                    >
                      <Text className="text-xs text-primary-foreground pb-1">{t.avg.toFixed(0)}</Text>
                    </View>
                  ))}
                </View>
                <Text className="block text-sm text-muted-foreground mt-2">分数越高代表本次表现越好</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  )
}

export default ProgressPage