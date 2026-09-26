import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { UserRound, ChevronRight } from 'lucide-react-taro'
import { cases } from '@/data/cases'

type Filter = '全部' | '入门' | '进阶'
const FILTERS: Filter[] = ['全部', '入门', '进阶']

const CasePage = () => {
  const [filter, setFilter] = useState<Filter>('全部')
  const shownCases = filter === '全部' ? cases : cases.filter(c => c.difficulty === filter)
  return (
    <View className="min-h-full bg-background">
      {/* 顶部 */}
      <View className="bg-primary px-5 pt-12 pb-10 rounded-b-3xl">
        <View className="flex flex-row items-center gap-2">
          <UserRound size={20} color="#ffffff" />
          <Text className="text-white text-lg font-bold">完整咨询</Text>
        </View>
        <Text className="block text-lg mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
          陪一位来访者，从评估走到告别，{'\n'}练就完整的一次治疗。
        </Text>
      </View>

      <View className="px-4 -mt-5">
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          {/* 难度筛选 */}
          <View className="flex flex-row gap-2">
            {FILTERS.map(f => {
              const active = f === filter
              return (
                <View
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 border ${
                    active ? 'bg-primary border-primary' : 'bg-background border-border'
                  }`}
                >
                  <Text className={`text-base ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {f}
                  </Text>
                </View>
              )
            })}
          </View>
          <View className="mt-1 flex flex-col">
            {shownCases.map(c => (
              <View
                key={c.id}
                className="flex flex-row items-center py-3 border-t border-border"
                onClick={() => Taro.navigateTo({ url: `/pages/case-detail/index?id=${c.id}` })}
              >
                <View className="flex-1 pr-2">
                  <View className="flex flex-row items-center gap-2">
                    <Text className="text-lg text-foreground">{c.title}</Text>
                    <View
                      className={`rounded-full px-2 py-1 ${
                        c.difficulty === '入门' ? 'bg-primary' : 'bg-accent'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          c.difficulty === '入门' ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {c.difficulty}
                      </Text>
                    </View>
                  </View>
                  <Text className="block text-lg text-muted-foreground mt-1">{c.theme} · {c.sessions.length} 次会谈</Text>
                </View>
                <ChevronRight size={16} color="#9AA19A" />
              </View>
            ))}
            {shownCases.length === 0 && (
              <Text className="block py-4 text-base text-muted-foreground text-center">该难度下暂无个案</Text>
            )}
          </View>
        </View>

        <View className="h-8" />
      </View>
    </View>
  )
}

export default CasePage