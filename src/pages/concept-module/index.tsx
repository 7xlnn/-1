import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChevronRight, Brain } from 'lucide-react-taro'
import { fragments } from '@/data/fragments'

const exercises = fragments.filter(f => f.taskType === 'conceptualization')

const ConceptModulePage = () => {
  return (
    <View className="min-h-full bg-background">
      <View className="px-5 pt-8 pb-4">
        <Text className="block text-2xl font-semibold text-foreground">概念化模块</Text>
        <Text className="block text-base text-muted-foreground mt-2 leading-relaxed">
          在一个完整个案中，练习从横向（当下横截面）与纵向（发展脉络）两个角度整理全貌。
        </Text>
      </View>

      <View className="px-4">
        {exercises.map((ex, idx) => (
          <View
            key={ex.id}
            className="bg-card rounded-2xl border border-border p-4 mb-3 shadow-sm"
            onClick={() => Taro.navigateTo({ url: `/pages/fragment-brief/index?id=${ex.id}` })}
          >
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <View className="w-9 h-9 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(91,140,123,0.14)' }}>
                  <Brain size={18} color="#5B8C7B" />
                </View>
                <Text className="block text-base font-semibold text-foreground">练习 {idx + 1}</Text>
              </View>
              <ChevronRight size={16} color="#9AA19A" />
            </View>
            <Text className="block text-base text-muted-foreground mt-2 leading-relaxed">{ex.subtitle}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default ConceptModulePage