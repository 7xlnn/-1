import { useState, useRef } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store/session'
import type { ChatMsg, Coverage } from '@/store/session'
import { UI_ASSETS } from '@/data/ui-assets'
import { Send, Flag, Target, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react-taro'

interface ChatRoomProps {
  /** 结束练习/会谈后跳转的页面 */
  endUrl: string
  endLabel: string
}

const ChatRoom = ({ endUrl, endLabel }: ChatRoomProps) => {
  const { profile, messages, addMessage, setMessages, agentFocus, clientState, sessionGoal, sessionTitle, setPendingSummary } = useSessionStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<Coverage | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  /** 中断标志：stop 置 true，请求返回后据此丢弃回复 */
  const abortRef = useRef(false)

  const scrollToBottom = () => {
    setTimeout(() => {
      Taro.createSelectorQuery()
        .select('#msg-list')
        .node()
        .exec(() => {})
    }, 50)
  }

  /** 调用来访者接口；context 为发送时的完整消息（含最后一条用户消息） */
  const requestReply = async (context: ChatMsg[]) => {
    console.log('[CBT chat request] /api/cbt/chat', context.length, 'turns')
    const res = await Network.request({
      url: '/api/cbt/chat',
      method: 'POST',
      data: { profile, messages: context, agentFocus, clientState, sessionGoal }
    })
    console.log('[CBT chat response]', res.data)
    if (abortRef.current) return
    const reply = (res.data as { reply?: string })?.reply || '（来访者沉默了片刻）'
    addMessage({ role: 'assistant', content: reply })
    scrollToBottom()
  }

  /** 发送新的一条咨询师消息 */
  const send = async () => {
    const text = input.trim()
    if (!text || loading || !profile) return
    setInput('')
    setFailed(false)
    addMessage({ role: 'user', content: text })
    scrollToBottom()
    await runWith([...messages, { role: 'user' as const, content: text }])
  }

  /** 重新生成：丢弃最后一条来访者回复（若有），重发最后一条用户消息 */
  const regenerate = async () => {
    if (loading || !profile) return
    let base = [...messages]
    if (base.length && base[base.length - 1].role === 'assistant') base = base.slice(0, -1)
    if (!base.length || base[base.length - 1].role !== 'user') return
    setMessages(base)
    setFailed(false)
    scrollToBottom()
    await runWith(base)
  }

  /** 统一的请求执行器，处理 loading / 停止 / 失败 */
  const runWith = async (context: ChatMsg[]) => {
    abortRef.current = false
    setLoading(true)
    try {
      await requestReply(context)
    } catch (e) {
      console.error('[CBT chat error]', e)
      if (!abortRef.current) {
        setFailed(true)
        Taro.showToast({ title: '网络异常，可点击重新生成', icon: 'none' })
      }
    } finally {
      if (!abortRef.current) setLoading(false)
      else setLoading(false)
    }
  }

  /** 停止生成：立即解锁输入；途中的回复返回后丢弃 */
  const stop = () => {
    abortRef.current = true
    setLoading(false)
    setFailed(false)
    Taro.showToast({ title: '已停止，可继续对话', icon: 'none' })
  }

  /** 结束前请求 AI 达成度小结（B：软引导，不强制） */
  const requestSummary = async (): Promise<Coverage> => {
    console.log('[CBT summary request]', messages.length, 'turns')
    const res = await Network.request({
      url: '/api/cbt/summary',
      method: 'POST',
      data: { profile, messages, sessionTitle }
    })
    console.log('[CBT summary response]', res.data)
    const d = res.data as { covered?: string[]; missed?: string[] }
    return { covered: d?.covered ?? [], missed: d?.missed ?? [] }
  }

  /** 点击"结束"：先弹达成度小结，学生决定继续或结束 */
  const onEnd = async () => {
    if (!profile || !messages.length) {
      Taro.navigateTo({ url: endUrl })
      return
    }
    setSummaryLoading(true)
    try {
      const cov = await requestSummary()
      setSummaryData(cov)
      setSummaryOpen(true)
    } catch (e) {
      console.warn('[CBT summary error]', e)
      Taro.showToast({ title: '小结生成失败，已前往反馈页', icon: 'none' })
      setPendingSummary(null)
      Taro.navigateTo({ url: endUrl })
    } finally {
      setSummaryLoading(false)
    }
  }

  /** 确认结束：把小结暂存给反馈页/作业，并前往反馈 */
  const confirmEnd = () => {
    setPendingSummary(summaryData)
    setSummaryOpen(false)
    setSummaryData(null)
    Taro.navigateTo({ url: endUrl })
  }

  /** 继续对话：关掉小结层，留在咨询室 */
  const keepTalking = () => {
    setSummaryOpen(false)
    setSummaryData(null)
  }

  /** 是否可重新生成（至少存在一条用户消息且当前不在加载） */
  const canRegenerate =
    !loading &&
    messages.length > 0 &&
    (() => {
      const last = messages[messages.length - 1]
      return last.role === 'user' || last.role === 'assistant'
    })()

  return (
    <>
    <View className="flex flex-col h-full bg-background">
      {/* 咨询室氛围头图横幅 */}
      <View className="relative h-28 overflow-hidden" style={{ backgroundColor: '#5B8C7B' }}>
        <Image src={UI_ASSETS.caseArt} mode="aspectFill" className="w-full h-full" />
        <View className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(31,61,45,0.82) 0%, rgba(31,61,45,0.35) 55%, rgba(31,61,45,0.05) 100%)' }} />
        <View className="absolute inset-0 flex flex-col justify-center px-5">
          <Text className="block text-white text-xs font-medium tracking-wide">{sessionTitle || '知愈心理 · 咨询室'}</Text>
          <View className="flex flex-row items-center gap-2 mt-1">
            <View className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
              <Text className="text-white text-base font-semibold">{profile?.name.slice(0, 1) || '访'}</Text>
            </View>
            <Text className="block text-white text-base font-semibold">
              咨询师 · 与 {profile?.name || '来访者'} 的对话
            </Text>
          </View>
        </View>
      </View>

      {/* 本阶段目标胶囊 */}
      {sessionGoal ? (
        <View className="px-4 pt-3">
          <View className="bg-secondary rounded-2xl border border-border">
            <View
              className="flex flex-row items-center gap-2 px-4 py-3"
              onClick={() => setGoalOpen(v => !v)}
            >
              <Target size={17} color="#5B8C7B" />
              <Text className="block flex-1 text-base font-medium text-foreground">本阶段目标</Text>
              {goalOpen ? <ChevronUp size={16} color="#9AA19A" /> : <ChevronDown size={16} color="#9AA19A" />}
            </View>
            {goalOpen && (
              <View className="px-4 pb-3 -mt-1">
                <Text className="block text-base leading-relaxed text-muted-foreground">{sessionGoal}</Text>
              </View>
            )}
          </View>
        </View>
      ) : null}

      <ScrollView id="msg-list" scrollY className="flex-1 px-4 py-4" scrollWithAnimation>
        <View className="flex flex-col gap-4 pb-4">
          {messages.length === 0 && (
            <View className="py-8 px-4">
              <View className="bg-card rounded-2xl border border-border p-5 flex flex-col items-center" style={{ boxShadow: '0 4px 16px rgba(91,140,123,0.08)' }}>
                <Text className="block text-lg text-foreground font-medium">咨询开始</Text>
                <Text className="block text-base text-muted-foreground mt-2 text-center leading-relaxed">
                  主动和来访者打个招呼吧{'\n'}可以这样开启：……最近感觉怎么样？今天想从哪里聊起？
                </Text>
              </View>
            </View>
          )}
          {messages.map((m, i) =>
            m.role === 'assistant' ? (
              <View key={i} className="flex flex-row items-start gap-2">
                <View className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(91,140,123,0.14)' }}>
                  <Text className="text-lg" style={{ color: '#3f6b5c' }}>{profile?.name.slice(0, 1)}</Text>
                </View>
                <View className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[78%]" style={{ boxShadow: '0 1px 3px rgba(31,61,45,0.06)' }}>
                  <Text className="block text-lg leading-relaxed text-foreground">{m.content}</Text>
                </View>
              </View>
            ) : (
              <View key={i} className="flex flex-row items-start justify-end gap-2">
                <View className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[78%]" style={{ background: 'linear-gradient(135deg,#5B8C7B,#4a7a69)' }}>
                  <Text className="block text-lg leading-relaxed text-white">{m.content}</Text>
                </View>
              </View>
            )
          )}
          {loading && (
            <View className="flex flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(91,140,123,0.14)' }}>
                <Text className="text-lg" style={{ color: '#3f6b5c' }}>{profile?.name.slice(0, 1)}</Text>
              </View>
              <View className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <Text className="text-base text-muted-foreground">来访者正在输入…</Text>
              </View>
            </View>
          )}

          {/* 操作条：停止生成 / 失败重新生成 */}
          {loading ? (
            <View className="flex justify-center">
              <Button variant="outline" size="sm" onClick={stop}>
                <Text className="text-base">停止生成</Text>
              </Button>
            </View>
          ) : failed ? (
            <View className="flex justify-center">
              <Button variant="outline" size="sm" onClick={regenerate}>
                <RefreshCw size={15} color="#5B8C7B" />
                <Text className="text-base text-primary ml-1">重新生成</Text>
              </Button>
            </View>
          ) : canRegenerate ? (
            <View className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={regenerate}>
                <RefreshCw size={14} color="#6E756E" />
                <Text className="text-base text-muted-foreground ml-1">重新生成来访者回复</Text>
              </Button>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="bg-card border-t border-border px-3 py-3 pb-4">
        <View className="flex flex-row items-center gap-2">
          <View className="flex-1 bg-secondary rounded-full px-4 py-2">
            <Input
              className="w-full text-lg"
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
          <Button variant="ghost" size="sm" onClick={onEnd} disabled={summaryLoading}>
            <Flag size={15} color="#6E756E" />
            <Text className="text-base text-muted-foreground ml-1">{summaryLoading ? '督导正在小结…' : endLabel}</Text>
          </Button>
        </View>
      </View>
    </View>

    {/* 结束前达成度小结弹层（B：软引导，学生可继续或结束） */}
    {summaryOpen && (
      <View
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,20,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
        }}
      >
        <View className="bg-card rounded-2xl mx-5 w-full max-w-md px-5 pt-5 pb-4" style={{ maxHeight: '78%', overflowY: 'auto' }}>
          <Text className="block text-xl font-bold text-foreground text-center">本次练习小结</Text>
          <Text className="block text-sm text-muted-foreground text-center mt-1">
            由督导助手根据你们的对话回看生成（不影响评分，仅供参考）
          </Text>

          <View className="mt-3">
            <Text className="block text-base font-semibold text-foreground">已经聊到的</Text>
            {(summaryData?.covered?.length ?? 0) ? (
              <View className="mt-2 flex flex-col gap-2">
                {summaryData!.covered.map((t, i) => (
                  <View key={i} className="bg-secondary bg-opacity-70 rounded-lg px-3 py-2 flex flex-row items-start gap-2">
                    <Text className="text-primary font-semibold mt-px">✓</Text>
                    <Text className="block flex-1 text-base leading-relaxed text-foreground">{t}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="block text-base text-muted-foreground mt-1">—</Text>
            )}
          </View>

          <View className="mt-3">
            <Text className="block text-base font-semibold text-foreground">可以再深入的</Text>
            {(summaryData?.missed?.length ?? 0) ? (
              <View className="mt-2 flex flex-col gap-2">
                {summaryData!.missed.map((t, i) => (
                  <View key={i} className="bg-card border border-border rounded-lg px-3 py-2 flex flex-row items-start gap-2">
                    <Text className="text-muted-foreground font-semibold mt-px">·</Text>
                    <Text className="block flex-1 text-base leading-relaxed text-foreground">{t}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="block text-base text-muted-foreground mt-1">没有明显欠缺，可以结束</Text>
            )}
          </View>

          <View className="mt-4 flex flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={keepTalking}>
              <Text className="text-base">继续聊聊</Text>
            </Button>
            <Button className="flex-1" onClick={confirmEnd}>
              <Text className="text-base">就到这里，去反馈</Text>
            </Button>
          </View>
        </View>
      </View>
    )}
    </>
  )
}

export default ChatRoom
