import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { BookOpen, MessageCircle, Lightbulb, ListChecks, History, ChevronDown } from 'lucide-react-taro'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { allExercises } from '@/data/fragments'
import { UI_ASSETS } from '@/data/ui-assets'
import { Button } from '@/components/ui/button'
import { useSessionStore, readPersisted, buildStorageKey } from '@/store/session'

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
  const key = buildStorageKey(null, 1, ex.id)
  const saved = readPersisted(key)
  const hasSaved = !!(saved && saved.messages.length)
  const turnCount = saved?.messages.length ?? 0

  const handleStart = (fresh: boolean) => {
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
      endLabel: isConcept ? '结束对话，去完成概念化' : '结束练习，请督导反馈',
      fresh
    })
    Taro.navigateTo({ url: '/pages/chat/index' })
  }

  return (
    <View className="min-h-full bg-background pb-28">
      {/* 氛围头图 */}
      <View className="relative h-32 overflow-hidden">
        <Image src={UI_ASSETS.fragmentArt} mode="aspectFill" className="w-full h-full" />
        <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.30) 0%, rgba(31,61,45,0.86) 100%)' }} />
        <View className="absolute inset-0 flex flex-col justify-end px-5 py-4">
          <Text className="block text-white text-sm font-medium tracking-wide">知愈心理 · 片段练习</Text>
          <Text className="block text-white text-xl font-bold mt-1">{ex.title}</Text>
        </View>
      </View>

      <View className="px-4 mt-4">
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
              <Collapsible key={i}>
                <CollapsibleTrigger className="w-full flex flex-row items-center gap-1">
                  <Text className="block flex-1 text-lg font-medium text-foreground">{p.title}</Text>
                  <ChevronDown size={16} color="#5B8C7B" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Text className="block text-lg leading-relaxed text-muted-foreground mt-1">{p.desc}</Text>
                  {p.example && (
                    <Text className="block text-base text-primary mt-1 leading-relaxed">{p.example}</Text>
                  )}
                </CollapsibleContent>
              </Collapsible>
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
          <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'rgba(239,236,228,0.7)' }}>
            <Text className="block text-lg leading-relaxed text-foreground">主诉：{ex.client.chiefComplaint}</Text>
          </View>
          <View className="mt-2 rounded-xl p-3" style={{ backgroundColor: 'rgba(91,140,123,0.05)' }}>
            <Collapsible>
              <CollapsibleTrigger className="w-full flex flex-row items-center gap-1">
                <Text className="block flex-1 text-lg leading-relaxed text-foreground">背景</Text>
                <ChevronDown size={16} color="#5B8C7B" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Text className="block text-lg leading-relaxed text-foreground mt-1">{ex.client.background}</Text>
              </CollapsibleContent>
            </Collapsible>
          </View>
        </View>

        {/* 结束后任务说明 */}
        {isConcept && (
          <View className="rounded-2xl p-4 mt-3 flex flex-row items-start gap-2" style={{ backgroundColor: 'rgba(239,236,228,0.7)' }}>
            <Lightbulb size={15} color="#5B8C7B" />
            <Text className="block flex-1 text-lg leading-relaxed text-muted-foreground">
              对话结束后，请依据访谈内容填写横向与纵向概念化，提交后再由督导点评。
            </Text>
          </View>
        )}
      </View>

      <View
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {hasSaved && (
          <View className="flex flex-row items-center gap-2 bg-secondary rounded-xl px-3 py-2">
            <History size={15} color="#5B8C7B" />
            <Text className="block flex-1 text-base text-foreground">
              已有 {turnCount} 条对话记录，可继续练习
            </Text>
          </View>
        )}
        <Button className="w-full rounded-full" onClick={() => handleStart(false)}>
          <Text className="text-lg text-primary-foreground">
            {hasSaved ? '继续练习' : '进入咨询室'}
          </Text>
        </Button>
        {hasSaved && (
          <Button variant="outline" className="w-full rounded-full" onClick={() => handleStart(true)}>
            <Text className="text-lg text-primary">重新开始</Text>
          </Button>
        )}
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
