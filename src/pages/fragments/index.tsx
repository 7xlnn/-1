import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ChevronRight, Target, FolderOpen } from 'lucide-react-taro'
import { fragmentGroups, fragments } from '@/data/fragments'
import { UI_ASSETS } from '@/data/ui-assets'

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

  const conceptCount = list.filter(ex => ex.taskType === 'conceptualization').length
  const hasConceptModule = conceptCount > 0
  const plainList = list.filter(ex => ex.taskType !== 'conceptualization')

  return (
    <View className="min-h-full bg-background">
      <View className="relative overflow-hidden">
        <Image src={UI_ASSETS.fragmentArt} className="w-full h-48" mode="aspectFill" />
        <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.12) 0%, rgba(24,44,33,0.66) 100%)' }} />
        <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <Text className="block text-2xl text-white font-semibold">{group.name}</Text>
          <Text className="block text-base mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>{group.desc}</Text>
        </View>
      </View>

      <View className="px-4 mt-2">
        {hasConceptModule && (
          <View
            className="bg-card rounded-2xl border border-border p-4 mb-3 shadow-sm"
            onClick={() => Taro.navigateTo({ url: '/pages/concept-module/index' })}
          >
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <View className="w-9 h-9 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(91,140,123,0.14)' }}>
                  <FolderOpen size={18} color="#5B8C7B" />
                </View>
                <Text className="block text-lg font-semibold text-foreground">概念化</Text>
              </View>
              <ChevronRight size={16} color="#9AA19A" />
            </View>
            <Text className="block text-base text-muted-foreground mt-1 leading-relaxed">
              {conceptCount} 个练习 · 从一个完整个案中整理横向与纵向概念化
            </Text>
            <View className="mt-2 flex flex-row items-center gap-2">
              <Target size={12} color="#5B8C7B" />
              <Text className="text-sm text-primary">点开选择一个练习开始</Text>
            </View>
          </View>
        )}
        {plainList.map(ex => (
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
