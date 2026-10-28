import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChevronRight } from 'lucide-react-taro'
import { cases } from '@/data/cases'
import { UI_ASSETS } from '@/data/ui-assets'

type Filter = '全部' | '入门' | '进阶'
const FILTERS: Filter[] = ['全部', '入门', '进阶']

const practiceTagsOf = (c: (typeof cases)[number]) => {
  const set = new Set<string>()
  c.sessions.forEach((s) => {
    s.skills.slice(0, 2).forEach((k) => set.add(k))
  })
  return [...set].slice(0, 2).join(' · ')
}

const CasePage = () => {
  const [filter, setFilter] = useState<Filter>('全部')
  const shownCases = filter === '全部' ? cases : cases.filter(c => c.difficulty === filter)
  return (
    <View className="min-h-full bg-background">
      {/* 顶部氛围图 */}
      <View className="relative overflow-hidden">
        <Image src={UI_ASSETS.caseArt} className="w-full h-56" mode="aspectFill" />
        <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.12) 0%, rgba(24,44,33,0.7) 100%)' }} />
        <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <Text className="block text-2xl text-white font-semibold">完整咨询</Text>
          <Text className="block text-base mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
            陪一位来访者，从评估走到告别，{'\n'}练就完整的一次治疗。
          </Text>
        </View>
      </View>

      <View className="px-4 -mt-3">
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
            {shownCases.map((c) => (
              <View
                key={c.id}
                className="flex flex-row items-center py-4 border-t border-border"
                onClick={() => Taro.navigateTo({ url: `/pages/case-detail/index?id=${c.id}` })}
              >
                {/* 来访者首字图标 */}
                <View className="w-11 h-11 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
                  <Text className="block text-lg text-primary font-semibold">
                    {c.client.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1 pr-2 min-w-0">
                  <View className="flex flex-row items-center gap-2">
                    <Text className="text-lg font-semibold text-foreground truncate whitespace-nowrap min-w-0">{c.title}</Text>
                    <View
                      className={`rounded-full px-2 py-1 shrink-0 ${
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
                  <Text className="block text-lg text-muted-foreground mt-1 leading-snug">
                    {c.client.age}岁 · {c.client.tags.join(' · ')}
                    {'\n'}
                    {practiceTagsOf(c)}
                  </Text>
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