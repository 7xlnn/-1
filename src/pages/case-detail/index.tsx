import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ChevronRight, UserRound } from 'lucide-react-taro'
import { cases } from '@/data/cases'

const CaseDetailPage = () => {
  const router = useRouter()
  const c = cases.find(x => x.id === router.params.id)

  if (!c) {
    return (
      <View className="p-6">
        <Text className="text-sm text-muted-foreground">未找到该个案</Text>
      </View>
    )
  }

  return (
    <View className="min-h-full bg-background">
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <View className="flex flex-row items-center gap-2">
          <UserRound size={18} color="#ffffff" />
          <Text className="text-white text-lg font-bold">{c.title}</Text>
        </View>
        <Text className="block text-white text-opacity-85 text-xs mt-2 leading-relaxed">
          {c.theme} · {c.sessions.length} 次会谈 · {c.difficulty}
        </Text>
        <View className="mt-3 bg-white bg-opacity-12 rounded-xl p-3">
          <Text className="block text-white text-opacity-90 text-xs leading-relaxed">{c.description}</Text>
        </View>
      </View>

      <View className="px-4 -mt-4 pb-8">
        {c.sessions.map(s => (
          <View
            key={s.index}
            className="bg-card rounded-2xl border border-border p-4 mb-3 shadow-sm flex flex-row items-center"
            onClick={() => Taro.navigateTo({ url: `/pages/session-brief/index?caseId=${c.id}&index=${s.index}` })}
          >
            <View className="w-9 h-9 rounded-full bg-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
              <Text className="text-sm font-semibold text-primary">{s.index}</Text>
            </View>
            <View className="flex-1 px-3">
              <Text className="block text-sm font-medium text-foreground">{s.title}</Text>
              <Text className="block text-[11px] text-muted-foreground mt-1 leading-relaxed">{s.goal}</Text>
            </View>
            <ChevronRight size={16} color="#9AA19A" />
          </View>
        ))}
      </View>
    </View>
  )
}

export default CaseDetailPage
