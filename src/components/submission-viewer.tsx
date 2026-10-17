import { View, Text } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  content: Record<string, unknown>
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <View className="mb-3">
      <Text className="block text-sm text-primary font-medium mb-1">{label}</Text>
      <Text className="block text-base text-foreground leading-relaxed whitespace-pre-wrap">{value}</Text>
    </View>
  )
}

// 对话片段
function Messages({ messages }: { messages: unknown }) {
  if (!Array.isArray(messages)) return null
  return (
    <View className="mt-3 rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(239,236,228,0.5)' }}>
      {messages.map((m, i) => {
        const role = (m as { role?: string })?.role
        const text = (m as { content?: string })?.content || ''
        const isUser = role === 'user'
        return (
          <View key={i} className={`px-3 py-2 ${isUser ? '' : 'border-t border-border'}`}>
            <Text className={`block text-xs mb-1 ${isUser ? 'text-primary' : 'text-muted-foreground'}`}>
              {isUser ? '咨询师' : '来访者'}
            </Text>
            <Text className="block text-sm text-foreground leading-relaxed">{text}</Text>
          </View>
        )
      })}
    </View>
  )
}

// 学生向督导的提问
function Asks({ asks }: { asks: unknown }) {
  if (!Array.isArray(asks) || asks.length === 0) return null
  return (
    <Card>
      <CardContent className="p-4">
        <Text className="block text-base text-primary font-medium mb-1">学生向督导的提问（{asks.length}）</Text>
        <Text className="block text-sm text-muted-foreground mb-2">练习后学生主动提出的疑问与督导解答</Text>
        {asks.map((item, i) => {
          const q = (item as { q?: string })?.q || ''
          const a = (item as { a?: string })?.a || ''
          return (
            <View key={i} className="mb-3 last:mb-0">
              <View className="flex-row items-start mb-1">
                <Badge className="mr-2 mt-1" style={{ backgroundColor: 'rgba(196,93,74,0.12)' }}>
                  <Text className="text-xs" style={{ color: '#C45D4A' }}>问 {i + 1}</Text>
                </Badge>
                <Text className="flex-1 block text-sm text-foreground font-medium leading-relaxed">{q}</Text>
              </View>
              <Text className="block text-sm text-muted-foreground leading-relaxed ml-1 whitespace-pre-wrap">督导：{a}</Text>
            </View>
          )
        })}
      </CardContent>
    </Card>
  )
}

// 横纵向概念化字段定义
const HORIZONTAL_FIELDS: { key: string; label: string }[] = [
  { key: 'situation', label: '情境' },
  { key: 'thought', label: '自动思维' },
  { key: 'emotion', label: '情绪' },
  { key: 'behavior', label: '行为' },
]
const VERTICAL_FIELDS: { key: string; label: string }[] = [
  { key: 'childhood', label: '童年经历' },
  { key: 'coreBelief', label: '核心信念' },
  { key: 'attitude', label: '态度' },
  { key: 'rule', label: '规则' },
  { key: 'assumption', label: '假设' },
  { key: 'coping', label: '应对策略' },
]

export function SubmissionViewer({ content }: Props) {
  const c = content || {}
  const keys = Object.keys(c)

  // 概念化：仅对话记录 + 学生填写的横纵向概念化（不显示督导反馈）
  if (c.conceptForm && typeof c.conceptForm === 'object') {
    const form = c.conceptForm as Record<string, string>
    return (
      <View className="flex flex-col gap-3">
        {isString(c.summary) && (
          <Card>
            <CardContent className="p-4">
              <Field label="练习概要" value={c.summary} />
            </CardContent>
          </Card>
        )}
        {Array.isArray(c.messages) && (
          <Card>
            <CardContent className="p-4">
              <Text className="block text-base text-primary font-medium mb-2">对话记录</Text>
              <Messages messages={c.messages} />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <Text className="block text-base text-primary font-medium">横向概念化</Text>
            <Text className="block text-sm text-muted-foreground mb-2">当下的情境—想法—情绪—行为</Text>
            {HORIZONTAL_FIELDS.map(f => (
              <Field key={f.key} label={f.label} value={form[f.key] ?? ''} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Text className="block text-base text-primary font-medium">纵向概念化</Text>
            <Text className="block text-sm text-muted-foreground mb-2">从童年经历到核心信念的深层结构</Text>
            {VERTICAL_FIELDS.map(f => (
              <Field key={f.key} label={f.label} value={form[f.key] ?? ''} />
            ))}
          </CardContent>
        </Card>
        <Asks asks={c.asks} />
      </View>
    )
  }

  // 片段练习 / 会谈：仅概要 + 对话记录（督导反馈仅学生可见，教师端不显示）
  if (isString(c.summary) || Array.isArray(c.messages)) {
    return (
      <View className="flex flex-col gap-3">
        {isString(c.summary) && (
          <Card>
            <CardContent className="p-4">
              <Field label="练习概要" value={c.summary} />
            </CardContent>
          </Card>
        )}
        {Array.isArray(c.messages) && (
          <Card>
            <CardContent className="p-4">
              <Text className="block text-base text-primary font-medium mb-2">对话记录（含学生提问与咨询对话）</Text>
              <Messages messages={c.messages} />
            </CardContent>
          </Card>
        )}
        <Asks asks={c.asks} />
      </View>
    )
  }

  // 情绪周记 / 单条情绪
  if (isString(c.date) || isString(c.situation)) {
    return (
      <Card>
        <CardContent className="p-4">
          {isString(c.date) && <Field label="日期" value={c.date} />}
          {isString(c.situation) && <Field label="情境" value={c.situation} />}
          {isString(c.automaticThought) && (
            <Field
              label={`自动思维（相信度 ${c.thoughtBelief ?? 0}%）`}
              value={c.automaticThought}
            />
          )}
          {isString(c.emotion) && (
            <Field label={`情绪（强度 ${c.emotionIntensity ?? 0}%）`} value={c.emotion} />
          )}
          {isString(c.usedQuestionLabel) && <Field label="使用的问题" value={c.usedQuestionLabel} />}
          {isString(c.adaptiveResponse) && (
            <Field label="适合的反应" value={c.adaptiveResponse} />
          )}
          {isString(c.resultAction) && <Field label="结果·会做什么" value={c.resultAction} />}
        </CardContent>
      </Card>
    )
  }

  // 多条周记
  if (Array.isArray(c.records)) {
    return (
      <View className="flex flex-col gap-3">
        {(c.records as unknown[]).map((r, i) => (
          <SubmissionViewer key={i} content={r as Record<string, unknown>} />
        ))}
      </View>
    )
  }

  // 兜底：按字段展示
  return (
    <Card>
      <CardContent className="p-4">
        {keys.map((k) => {
          const v = c[k]
          if (v === null || v === undefined) return null
          if (isString(v) || typeof v === 'number') {
            return <Field key={k} label={k} value={String(v)} />
          }
          return (
            <View key={k} className="mb-3">
              <Badge variant="secondary">{k}</Badge>
              <Text className="block text-sm text-muted-foreground mt-1">
                {JSON.stringify(v)}
              </Text>
            </View>
          )
        })}
      </CardContent>
    </Card>
  )
}
