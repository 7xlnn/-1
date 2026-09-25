import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Layers, UserRound, ChevronRight, Leaf, Sparkles } from 'lucide-react-taro'
import { fragmentGroups } from '@/data/fragments'
import { cases } from '@/data/cases'

type Filter = '全部' | '入门' | '进阶'
const FILTERS: Filter[] = ['全部', '入门', '进阶']

const IndexPage = () => {
  const [filter, setFilter] = useState<Filter>('全部')
  const shownCases = filter === '全部' ? cases : cases.filter(c => c.difficulty === filter)
  return (
    <View className="min-h-full bg-background">
      {/* 顶部品牌区 */}
      <View className="bg-primary px-5 pt-12 pb-10 rounded-b-3xl">
        <View className="flex flex-row items-center gap-2">
          <Leaf size={20} color="#ffffff" />
          <Text className="text-white text-lg font-bold">CBT 练心场</Text>
        </View>
        <Text className="block text-lg mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
          在安全的模拟咨询室里，{'\n'}把 CBT 的每一项技术练成你的本能。
        </Text>
      </View>

      <View className="px-4 -mt-5">
        {/* 模块一 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <View className="flex flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
              <Layers size={18} color="#5B8C7B" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-semibold text-foreground">片段练习</Text>
              <Text className="block text-lg text-muted-foreground mt-1">单项技术刻意练习</Text>
            </View>
          </View>
          <View className="mt-3 flex flex-col">
            {fragmentGroups.map(g => (
              <View
                key={g.id}
                className="flex flex-row items-center py-3 border-t border-border"
                onClick={() => Taro.navigateTo({ url: `/pages/fragments/index?id=${g.id}` })}
              >
                <View className="flex-1">
                  <Text className="block text-lg text-foreground">{g.name}</Text>
                  <Text className="block text-lg text-muted-foreground mt-1">{g.desc}</Text>
                </View>
                <ChevronRight size={16} color="#9AA19A" />
              </View>
            ))}
          </View>
        </View>

        {/* 模块二 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-4">
          <View className="flex flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <UserRound size={18} color="#2F3430" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-semibold text-foreground">完整咨询</Text>
              <Text className="block text-lg text-muted-foreground mt-1">陪一位来访者走完全程</Text>
            </View>
          </View>
          {/* 难度筛选 */}
          <View className="mt-3 flex flex-row gap-2">
            {FILTERS.map(f => {
              const active = f === filter
              return (
                <View
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 border ${
                    active
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
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

        {/* 理念卡 */}
        <View className="mt-4 rounded-2xl p-4 flex flex-row items-start gap-3" style={{ backgroundColor: 'rgba(239,236,228,0.7)' }}>
          <Sparkles size={16} color="#5B8C7B" />
          <Text className="block flex-1 text-lg leading-relaxed text-muted-foreground">
            每个练习都有 AI 扮演的来访者与你对话，结束后由“督导”依据 CBT 专业标准给出反馈。建议按基本技术 → 概念化 → 自动思维 → 信念工作的顺序练习。
          </Text>
        </View>

        <View className="h-8" />
      </View>
    </View>
  )
}

export default IndexPage
