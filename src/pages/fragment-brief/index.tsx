import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { BookOpen, MessageCircle, Lightbulb, ListChecks } from 'lucide-react-taro'
import { allExercises } from '@/data/fragments'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store/session'

const FragmentBriefPage = () => {
  const router = useRouter()
  const ex = allExercises.find(e => e.id === router.params.id)
  const startSession = useSessionStore(s => s.startSession)

  if (!ex) {
    return (
      <View className="p-6">
        <Text className="text-lg text-muted-foreground">未找到该练习</Text>
      </View>
    )
  }

  const isConcept = ex.taskType === 'conceptualization'

  const handleStart = () => {
    startSession({
      profile: ex.client,
      fragmentId: ex.id,
      agentFocus: ex.agentFocus,
      clientState: ex.client.chiefComplaint,
      sessionGoal: ex.goals.join('；'),
      sessionTitle: ex.title,
      endUrl: isConcept
        ? `/pages/conceptualization/index?id=${ex.id}`
        : `/pages/feedback/index?id=${ex.id}`,
      endLabel: isConcept ? '结束对话，去完成概念化' : '结束练习，请督导反馈'
    })
    Taro.navigateTo({ url: '/pages/chat/index' })
  }

  return (
    <View className="min-h-full bg-background pb-28">
      <View className="px-4 pt-4">
        {/* 任务说明 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <View className="flex flex-row items-center gap-2">
            <ListChecks size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">本次任务</Text>
          </View>
          <Text className="block text-lg leading-relaxed text-foreground mt-3">{ex.briefing}</Text>
        </View>

        {/* 知识卡 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <BookOpen size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">练习要点</Text>
          </View>
          <View className="mt-3 flex flex-col gap-3">
            {ex.points.map((p, i) => (
              <View key={i}>
                <Text className="block text-lg font-medium text-foreground">{p.title}</Text>
                <Text className="block text-lg leading-relaxed text-muted-foreground mt-1">{p.desc}</Text>
                {p.example && (
                  <Text className="block text-sm text-primary mt-1 leading-relaxed">{p.example}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 来访者档案 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <MessageCircle size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">来访者档案</Text>
          </View>
          <View className="mt-3 flex flex-col gap-2">
            <InfoRow label="姓名" value={ex.client.name} />
            <InfoRow label="年龄" value={`${ex.client.age} 岁`} />
            <InfoRow label="性别" value={ex.client.gender} />
            <InfoRow label="职业" value={ex.client.occupation} />
          </View>
          <View className="mt-3 bg-secondary bg-opacity-70 rounded-xl p-3">
            <Text className="block text-lg leading-relaxed text-foreground">主诉：{ex.client.chiefComplaint}</Text>
          </View>
          <View className="mt-2 bg-primary bg-opacity-5 rounded-xl p-3">
            <Text className="block text-lg leading-relaxed text-foreground">背景：{ex.client.background}</Text>
          </View>
        </View>

        {/* 结束后任务说明 */}
        {isConcept && (
          <View className="bg-secondary bg-opacity-70 rounded-2xl p-4 mt-3 flex flex-row items-start gap-2">
            <Lightbulb size={15} color="#5B8C7B" />
            <Text className="block flex-1 text-lg leading-relaxed text-muted-foreground">
              对话结束后，请依据访谈内容填写横向与纵向概念化，提交后再由督导点评。
            </Text>
          </View>
        )}
      </View>

      <View className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3">
        <Button className="w-full rounded-full" onClick={handleStart}>
          <Text className="text-lg text-primary-foreground">进入咨询室</Text>
        </Button>
      </View>
    </View>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex flex-row">
    <Text className="text-lg text-muted-foreground w-10">{label}</Text>
    <Text className="block flex-1 text-lg text-foreground">{value}</Text>
  </View>
)

export default FragmentBriefPage
