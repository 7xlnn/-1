import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ChevronRight } from 'lucide-react-taro'
import { fragmentGroups, fragments } from '@/data/fragments'

const FragmentsPage = () => {
  const router = useRouter()
  const group = fragmentGroups.find(g => g.id === router.params.id)
  const list = fragments.filter(f => f.category === router.params.id)

  if (!group) {
    return (
      <View className="p-6">
        <Text className="text-sm text-muted-foreground">未找到该练习组</Text>
      </View>
    )
  }

  return (
    <View className="min-h-full bg-background">
      <View className="bg-primary px-5 pt-10 pb-7 rounded-b-3xl">
        <Text className="block text-white text-lg font-bold">{group.name}</Text>
        <Text className="block text-sm mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{group.desc}</Text>
      </View>

      <View className="px-4 -mt-4">
        {list.map(ex => (
          <View
            key={ex.id}
            className="flex flex-row items-center rounded-2xl border border-border bg-card p-4 mb-2 shadow-sm"
            onClick={() => Taro.navigateTo({ url: `/pages/fragment-brief/index?id=${ex.id}` })}
          >
            <View className="flex-1 pr-2">
              <Text className="block text-base font-medium text-foreground leading-snug">{ex.title}</Text>
            </View>
            <ChevronRight size={16} color="#9AA19A" />
          </View>
        ))}
      </View>
    </View>
  )
}

export default FragmentsPage