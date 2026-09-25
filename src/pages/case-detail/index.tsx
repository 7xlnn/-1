import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ChevronRight, UserRound, FileText, Briefcase } from 'lucide-react-taro'
import { cases } from '@/data/cases'

const CaseDetailPage = () => {
  const router = useRouter()
  const c = cases.find(x => x.id === router.params.id)

  if (!c) {
    return (
      <View className="p-6">
        <Text className="text-lg text-muted-foreground">未找到该个案</Text>
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
        <Text className="block text-white text-opacity-85 text-lg mt-2 leading-relaxed">
          {c.theme} · {c.sessions.length} 次会谈 · {c.difficulty}
        </Text>
        <View className="mt-3 bg-white bg-opacity-12 rounded-xl p-3">
          <Text className="block text-white text-opacity-90 text-lg leading-relaxed">{c.description}</Text>
        </View>
      </View>

      <View className="px-4 -mt-4 pb-8">
        {/* 来访者档案卡 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mb-4">
          <View className="flex flex-row items-center gap-2 mb-1">
            <FileText size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">来访者档案 · {c.client.name}</Text>
          </View>
          <View className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <Briefcase size={15} color="#6E756E" />
            <Text className="text-base text-muted-foreground">
              {c.client.gender} · {c.client.age} 岁 · {c.client.occupation}
            </Text>
            <View className="bg-accent rounded-full px-2 py-1">
              <Text className="text-sm text-foreground">{c.difficulty}</Text>
            </View>
          </View>
          <View className="mt-3">
            <Text className="block text-base font-medium text-primary">主诉</Text>
            <Text className="block text-lg text-foreground leading-relaxed mt-1">{c.client.chiefComplaint}</Text>
          </View>
          <View className="mt-3">
            <Text className="block text-base font-medium text-primary">背景</Text>
            <Text className="block text-lg text-foreground leading-relaxed mt-1">{c.client.background}</Text>
          </View>
          {c.client.tags.length > 0 && (
            <View className="flex flex-row flex-wrap gap-2 mt-3">
              {c.client.tags.map(t => (
                <View key={t} className="bg-secondary rounded-full px-2 py-1">
                  <Text className="text-sm text-muted-foreground">{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {c.sessions.map(s => (
          <View
            key={s.index}
            className="bg-card rounded-2xl border border-border p-4 mb-3 shadow-sm flex flex-row items-center"
            onClick={() => Taro.navigateTo({ url: `/pages/session-brief/index?caseId=${c.id}&index=${s.index}` })}
          >
            <View className="w-9 h-9 rounded-full bg-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
              <Text className="text-lg font-semibold text-primary">{s.index}</Text>
            </View>
            <View className="flex-1 px-3">
              <Text className="block text-lg font-medium text-foreground">{s.title}</Text>
              <Text className="block text-sm text-muted-foreground mt-1 leading-relaxed">{s.goal}</Text>
            </View>
            <ChevronRight size={16} color="#9AA19A" />
          </View>
        ))}
      </View>
    </View>
  )
}

export default CaseDetailPage
