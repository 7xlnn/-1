import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Layers, ChevronRight, Leaf, Sparkles, ChartBar, ClipboardCheck, Settings } from 'lucide-react-taro'
import { fragmentGroups } from '@/data/fragments'
import { useIdentity } from '@/store/identity'

const IndexPage = () => {
  const { studentName, role } = useIdentity()
  return (
    <View className="min-h-full bg-background">
      {/* 顶部品牌区 */}
      <View className="bg-primary px-5 pt-12 pb-10 rounded-b-3xl">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-2">
            <Leaf size={20} color="#ffffff" />
            <Text className="text-white text-lg font-bold">知愈心理</Text>
          </View>
          <View
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onClick={() => Taro.navigateTo({ url: '/pages/identity/index' })}
          >
            <Settings size={18} color="#ffffff" />
          </View>
        </View>
        <Text className="block text-lg mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
          在安全的模拟咨询室里，{'\n'}把 CBT 的每一项技术练成你的本能。
        </Text>
      </View>

      <View className="px-4 -mt-5">
        {/* 片段练习 */}
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

        {/* 学习进度入口 */}
        <View
          className="flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm mt-4"
          onClick={() => Taro.navigateTo({ url: '/pages/progress/index' })}
        >
          <View className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
            <ChartBar size={18} color="#5B8C7B" />
          </View>
          <View className="flex-1">
            <Text className="block text-lg font-semibold text-foreground">我的学习进度</Text>
            <Text className="block text-lg text-muted-foreground mt-1">练习次数 / 技术完成度 / 分数走势</Text>
          </View>
          <ChevronRight size={16} color="#9AA19A" />
        </View>

        {/* 我的作业 / 教师工作台 */}
        {role === 'teacher' ? (
          <View
            className="flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm mt-4"
            onClick={() => Taro.navigateTo({ url: '/pages/teacher/index' })}
          >
            <View className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
              <ClipboardCheck size={18} color="#5B8C7B" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-semibold text-foreground">教师工作台</Text>
              <Text className="block text-lg text-muted-foreground mt-1">查看并批改学生作业</Text>
            </View>
            <ChevronRight size={16} color="#9AA19A" />
          </View>
        ) : (
          <View
            className="flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm mt-4"
            onClick={() => Taro.navigateTo({ url: '/pages/homework/index' })}
          >
            <View className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
              <ClipboardCheck size={18} color="#5B8C7B" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-semibold text-foreground">我的作业</Text>
              <Text className="block text-lg text-muted-foreground mt-1">
                {studentName ? '查看提交状态与老师批改' : '先设置姓名，即可提交作业'}
              </Text>
            </View>
            <ChevronRight size={16} color="#9AA19A" />
          </View>
        )}

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