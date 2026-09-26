import { View, Text } from '@tarojs/components'
import type { ThoughtRecordEntry } from '@/data/mood-record'

/** 强度条：0-100 映射为 5 段宽度 */
const barWidth = (v: number) => {
  if (v >= 80) return 'w-full'
  if (v >= 60) return 'w-4/5'
  if (v >= 40) return 'w-3/5'
  if (v >= 20) return 'w-2/5'
  return 'w-1/5'
}

interface Props {
  entry: ThoughtRecordEntry
  /** 是否显示 DTR 后半部分（适合的反应 / 结果）。早期记录该部分为空。 */
  showResponse?: boolean
}

const FieldBlock = ({ label, value }: { label: string; value: string }) => (
  <View className="mt-2">
    <Text className="block text-sm text-primary font-medium">{label}</Text>
    <Text className="block text-base leading-relaxed mt-1 text-foreground">
      {value}
    </Text>
  </View>
)

export const ThoughtRecordCard = ({ entry, showResponse = true }: Props) => {
  const hasResponse = showResponse && !!entry.adaptiveResponse
  return (
    <View className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">{entry.date}</Text>
        <View className="flex flex-row items-center gap-1">
          <Text className="text-sm text-muted-foreground">{entry.emotion}</Text>
          <Text className="text-sm text-muted-foreground">{entry.emotionIntensity}%</Text>
        </View>
      </View>

      {/* 情绪强度条 */}
      <View className="mt-2 h-2 rounded-full bg-secondary">
        <View className={`h-2 rounded-full bg-primary ${barWidth(entry.emotionIntensity)}`} />
      </View>

      <FieldBlock label="情境" value={entry.situation} />
      <View className="mt-2">
        <View className="flex flex-row items-center justify-between">
          <Text className="block text-sm text-primary font-medium">自动思维</Text>
          <Text className="text-sm text-muted-foreground">相信 {entry.thoughtBelief}%</Text>
        </View>
        <Text className="block text-base leading-relaxed text-foreground mt-1">
          {entry.automaticThought}
        </Text>
      </View>

      {entry.distortions.length > 0 && (
        <View className="flex flex-row flex-wrap gap-2 mt-3">
          {entry.distortions.map(d => (
            <View key={d} className="rounded-full bg-accent px-2 py-1">
              <Text className="text-sm text-accent-foreground">{d}</Text>
            </View>
          ))}
        </View>
      )}

      {hasResponse && (
        <>
          <View className="my-3 h-px bg-border" />
          <FieldBlock label="适合的反应" value={entry.adaptiveResponse} />
          <Text className="block text-sm text-muted-foreground mt-1">
            对反应的相信程度：{entry.responseBelief ?? '—'}%
          </Text>
          <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'rgba(91,140,123,0.07)' }}>
            <Text className="block text-sm text-primary font-medium">结果</Text>
            <Text className="block text-base leading-relaxed text-foreground mt-1">
              现在对自动思维的相信：{entry.resultBelief ?? '—'}%
            </Text>
            <Text className="block text-base leading-relaxed text-foreground mt-1">
              现在情绪：{entry.resultEmotion || '—'}
            </Text>
            <Text className="block text-base leading-relaxed text-foreground mt-1">
              行动：{entry.resultAction || '—'}
            </Text>
          </View>
        </>
      )}
    </View>
  )
}
