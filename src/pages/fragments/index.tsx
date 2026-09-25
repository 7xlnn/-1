import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ChevronRight, Target } from 'lucide-react-taro'
import { fragmentGroups, fragments } from '@/data/fragments'

const FragmentsPage = () => {
  const router = useRouter()
  const group = fragmentGroups.find(g => g.id === router.params.id)
  const list = fragments.filter(f => f.category === router.params.id)

  if (!group) {
    return (
      <View className="p-6">
        <Text className="text-lg text-muted-foreground">未找到该练习组</Text>
      </View>
    )
  }

  return (
    <View className="min-h-full bg-background">
      <View className="bg-primary px-5 pt-10 pb-8 rounded-b-3xl">
        <Text className="block text-white text-lg font-bold">{group.name}</Text>
        <Text className="block text-white text-opacity-85 text-lg mt-2 leading-relaxed">{group.desc}</Text>
      </View>

      <View className="px-4 -mt-4">
        {list.map(ex => (
          <View
            key={ex.id}
            className="bg-card rounded-2xl border border-border p-4 mb-3 shadow-sm"
            onClick={() => Taro.navigateTo({ url: `/pages/fragment-brief/index?id=${ex.id}` })}
          >
            <View className="flex flex-row items-center justify-between">
              <Text className="block text-lg font-semibold text-foreground flex-1 pr-2">{ex.title}</Text>
              <ChevronRight size={16} color="#9AA19A" />
            </View>
            <Text className="block text-lg text-muted-foreground mt-1 leading-relaxed">{ex.subtitle}</Text>
            <View className="mt-2 flex flex-row items-center gap-2">
              <Target size={12} color="#5B8C7B" />
              <Text className="text-sm text-primary">{ex.goals[0]}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default FragmentsPage
