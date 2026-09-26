import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { BookOpen, MessageCircle, ListChecks, ClipboardList, History, NotebookPen } from 'lucide-react-taro'
import { cases } from '@/data/cases'
import { Button } from '@/components/ui/button'
import { useSessionStore, readPersisted, buildStorageKey } from '@/store/session'

const SessionBriefPage = () => {
  const router = useRouter()
  const c = cases.find(x => x.id === router.params.caseId)
  const index = Number(router.params.index)
  const session = c?.sessions.find(s => s.index === index)
  const startSession = useSessionStore(s => s.startSession)

  if (!c || !session) {
    return (
      <View className="p-6">
        <Text className="text-lg text-muted-foreground">未找到该会谈</Text>
      </View>
    )
  }

  const key = buildStorageKey(c.id, index, null)
  const saved = readPersisted(key)
  const hasSaved = !!(saved && saved.messages.length)
  const turnCount = saved?.messages.length ?? 0

  const handleStart = (fresh: boolean) => {
    startSession({
      profile: c.client,
      caseId: c.id,
      sessionIndex: index,
      agentFocus: `这是 CBT 咨询的第 ${index}/${c.sessions.length} 次会谈。本次会谈你的状态：${session.clientState}`,
      clientState: session.clientState,
      sessionGoal: session.goal,
      sessionTitle: `第 ${index} 次 · ${session.title}`,
      endUrl: `/pages/feedback/index?caseId=${c.id}&index=${index}`,
      endLabel: '结束会谈，请督导反馈',
      fresh
    })
    Taro.navigateTo({ url: '/pages/chat/index' })
  }

  return (
    <View className="min-h-full bg-background pb-28">
      <View className="px-4 pt-4">
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <Text className="block text-sm text-primary font-medium">
            第 {index} / {c.sessions.length} 次会谈
          </Text>
          <Text className="block text-lg font-semibold text-foreground mt-1">{session.title}</Text>
        </View>

        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <ListChecks size={15} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">本次练习目标</Text>
          </View>
          <Text className="block text-lg leading-relaxed text-foreground mt-3">{session.goal}</Text>
        </View>

        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <BookOpen size={15} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">会谈结构</Text>
          </View>
          <View className="mt-3 flex flex-col gap-2">
            {session.structure.map((item, i) => (
              <View key={i} className="flex flex-row items-start gap-2">
                <Text className="text-sm text-primary mt-0">{i + 1}.</Text>
                <Text className="block flex-1 text-lg leading-relaxed text-foreground">{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <ClipboardList size={15} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">督导提示</Text>
          </View>
          <View className="mt-3 flex flex-col gap-2">
            {session.hints.map((h, i) => (
              <Text key={i} className="block text-lg leading-relaxed text-muted-foreground">· {h}</Text>
            ))}
          </View>
          <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'rgba(239,236,228,0.7)' }}>
            <Text className="block text-lg leading-relaxed text-foreground">会谈后作业：{session.homework}</Text>
          </View>
        </View>

        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <MessageCircle size={15} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">来访者此刻状态</Text>
          </View>
          <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'rgba(239,236,228,0.7)' }}>
            <Text className="block text-lg leading-relaxed text-foreground">{session.clientState}</Text>
          </View>
          <View className="mt-2 flex flex-row">
            <Text className="text-lg text-muted-foreground w-16">来访者</Text>
            <Text className="block flex-1 text-lg text-foreground">
              {c.client.name}，{c.client.age} 岁，{c.client.occupation}
            </Text>
          </View>
        </View>

        {/* 来访者情绪记录表 */}
        <View
          className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3 flex flex-row items-center"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/mood-record/index?caseId=${c.id}&index=${index}`
            })
          }
        >
          <View className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
            <NotebookPen size={18} color="#5B8C7B" />
          </View>
          <View className="flex-1 px-3">
            <Text className="block text-lg font-medium text-foreground">来访者情绪记录表</Text>
            <Text className="block text-base text-muted-foreground mt-1 leading-relaxed">
              查看 TA 在会谈前自己记录的一周情绪与思维
            </Text>
          </View>
        </View>
      </View>

      <View
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {hasSaved && (
          <View className="flex flex-row items-center gap-2 bg-secondary rounded-xl px-3 py-2">
            <History size={15} color="#5B8C7B" />
            <Text className="block flex-1 text-base text-foreground">
              已有 {turnCount} 条对话记录，可继续本次会谈
            </Text>
          </View>
        )}
        <Button className="w-full rounded-full" onClick={() => handleStart(false)}>
          <Text className="text-lg text-primary-foreground">
            {hasSaved ? '继续本次会谈' : '开始本次会谈'}
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

export default SessionBriefPage
