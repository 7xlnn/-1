import { useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store/session'
import { Send, Flag } from 'lucide-react-taro'

interface ChatRoomProps {
  /** 结束练习/会谈后跳转的页面 */
  endUrl: string
  endLabel: string
}

const ChatRoom = ({ endUrl, endLabel }: ChatRoomProps) => {
  const { profile, messages, addMessage, agentFocus, clientState, sessionGoal } = useSessionStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const scrollToBottom = () => {
    setTimeout(() => {
      Taro.createSelectorQuery()
        .select('#msg-list')
        .node()
        .exec(() => {})
    }, 50)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading || !profile) return
    setInput('')
    addMessage({ role: 'user', content: text })
    setLoading(true)
    scrollToBottom()
    try {
      const history = [...messages, { role: 'user' as const, content: text }]
      console.log('[CBT chat request] /api/cbt/chat', history.length, 'turns')
      const res = await Network.request({
        url: '/api/cbt/chat',
        method: 'POST',
        data: {
          profile,
          messages: history,
          agentFocus,
          clientState,
          sessionGoal
        }
      })
      console.log('[CBT chat response]', res.data)
      const reply = (res.data as { reply?: string })?.reply || '（来访者沉默了片刻）'
      addMessage({ role: 'assistant', content: reply })
      scrollToBottom()
    } catch (e) {
      console.error('[CBT chat error]', e)
      Taro.showToast({ title: '网络异常，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex flex-col h-full bg-background">
      <ScrollView scrollY className="flex-1 px-4 py-4" scrollWithAnimation>
        <View className="flex flex-col gap-4 pb-4">
          {messages.length === 0 && (
            <View className="py-10 text-center">
              <Text className="block text-sm text-muted-foreground">
                咨询开始，主动和来访者打个招呼吧
              </Text>
            </View>
          )}
          {messages.map((m, i) =>
            m.role === 'assistant' ? (
              <View key={i} className="flex flex-row items-start gap-2">
                <View className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Text className="text-xs text-muted-foreground">{profile?.name.slice(0, 1)}</Text>
                </View>
                <View className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[78%]">
                  <Text className="block text-sm leading-relaxed text-foreground">{m.content}</Text>
                </View>
              </View>
            ) : (
              <View key={i} className="flex flex-row items-start justify-end gap-2">
                <View className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[78%]">
                  <Text className="block text-sm leading-relaxed text-primary-foreground">{m.content}</Text>
                </View>
              </View>
            )
          )}
          {loading && (
            <View className="flex flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Text className="text-xs text-muted-foreground">{profile?.name.slice(0, 1)}</Text>
              </View>
              <View className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <Text className="text-xs text-muted-foreground">来访者正在输入…</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="bg-card border-t border-border px-3 py-3 pb-4">
        <View className="flex flex-row items-center gap-2">
          <View className="flex-1 bg-secondary rounded-full px-4 py-2">
            <Input
              className="w-full text-sm"
              placeholder="输入你想对来访者说的话…"
              value={input}
              confirmType="send"
              onInput={e => setInput(e.detail.value)}
              onConfirm={send}
            />
          </View>
          <Button size="icon" onClick={send} disabled={loading || !input.trim()} className="rounded-full flex-shrink-0">
            <Send size={17} color="#ffffff" />
          </Button>
        </View>
        <View className="mt-2 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => Taro.navigateTo({ url: endUrl })}>
            <Flag size={15} color="#6E756E" />
            <Text className="text-xs text-muted-foreground ml-1">{endLabel}</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default ChatRoom
