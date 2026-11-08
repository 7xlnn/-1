import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Network } from '@/network'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { allExercises } from '@/data/fragments'
import { useSessionStore } from '@/store/session'
import { ArrowRightLeft, Layers } from 'lucide-react-taro'

interface ConceptForm {
  situation: string
  thought: string
  emotion: string
  behavior: string
  childhood: string
  coreBelief: string
  attitude: string
  rule: string
  assumption: string
  coping: string
}

const EMPTY: ConceptForm = {
  situation: '', thought: '', emotion: '', behavior: '',
  childhood: '', coreBelief: '', attitude: '', rule: '', assumption: '', coping: ''
}

const draftKeyFor = (id: string) => `cbt:concept:${id}`

function loadDraft(id: string): ConceptForm {
  try {
    const raw = Taro.getStorageSync(draftKeyFor(id)) as { form?: ConceptForm } | ConceptForm | null
    const form = raw && typeof raw === 'object' && 'form' in raw ? raw.form : raw
    return form ? { ...EMPTY, ...form } : EMPTY
  } catch {
    return EMPTY
  }
}

const ConceptualizationPage = () => {
  const router = useRouter()
  const ex = allExercises.find(e => e.id === router.params.id)
  const { messages, setPendingFeedback, setConceptForm } = useSessionStore()
  const [form, setForm] = useState<ConceptForm>(() => loadDraft(router.params.id || 'unknown'))
  const [submitting, setSubmitting] = useState(false)

  if (!ex) {
    return (
      <View className="p-6">
        <Text className="text-lg text-muted-foreground">未找到该练习</Text>
      </View>
    )
  }

  const set = (k: keyof ConceptForm, v: string) => {
    setForm((previous) => {
      const next = { ...previous, [k]: v }
      const key = draftKeyFor(ex.id)
      try {
        Taro.setStorageSync(key, { form: next, updatedAt: Date.now() })
      } catch {
        /* 本机存储不可用时仍允许继续填写 */
      }
      // 异步上传，不影响输入体验。
      import('@/services/draft').then((m) => m.queuePush(key)).catch(() => undefined)
      return next
    })
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    const content = buildSummary(form)
    try {
      console.log('[CBT feedback request] conceptualization submit')
      const res = await Network.request({
        url: '/api/cbt/feedback',
        method: 'POST',
        data: {
          profile: ex.client,
          messages,
          taskType: 'conceptualization',
          userWork: content,
          sessionGoal: ex.goals.join('；'),
          sessionTitle: ''
        }
      })
      console.log('[CBT feedback response]', res.data)
      setConceptForm({ ...form })
      setPendingFeedback(res.data)
      Taro.redirectTo({ url: `/pages/feedback/index?id=${ex.id}` })
    } catch (e) {
      console.error('[CBT feedback error]', e)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="min-h-full bg-background pb-28">
      <View className="px-4 pt-4">
        <Text className="block text-base text-muted-foreground leading-relaxed">
          依据刚才的访谈，完成横向与纵向概念化。
        </Text>

        {/* 横向概念化 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <ArrowRightLeft size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">横向概念化</Text>
          </View>
          <Text className="block text-sm text-muted-foreground mt-1">当下的情境—想法—情绪—行为</Text>
          <View className="mt-3 flex flex-col gap-3">
            <Field label="情境" hint="具体发生了什么事？时间、地点、事件" value={form.situation} onChange={v => set('situation', v)} />
            <Field label="自动思维" hint="那一刻脑子里冒出了什么想法/画面？" value={form.thought} onChange={v => set('thought', v)} />
            <Field label="情绪" hint="有哪些情绪？强度如何？" value={form.emotion} onChange={v => set('emotion', v)} />
            <Field label="行为" hint="做了什么/回避了什么？身体反应？" value={form.behavior} onChange={v => set('behavior', v)} />
          </View>
        </View>

        {/* 纵向概念化 */}
        <View className="bg-card rounded-2xl border border-border p-4 shadow-sm mt-3">
          <View className="flex flex-row items-center gap-2">
            <Layers size={16} color="#5B8C7B" />
            <Text className="text-lg font-semibold text-foreground">纵向概念化</Text>
          </View>
          <Text className="block text-sm text-muted-foreground mt-1">从童年经历到核心信念的深层结构</Text>
          <View className="mt-3 flex flex-col gap-3">
            <Field label="童年经历" hint="与信念形成相关的关键经历" value={form.childhood} onChange={v => set('childhood', v)} />
            <Field label="核心信念" hint="关于自我/他人/世界的最深层信念" value={form.coreBelief} onChange={v => set('coreBelief', v)} />
            <Field label="态度" hint="如：不被认可 是可怕的" value={form.attitude} onChange={v => set('attitude', v)} />
            <Field label="规则" hint="如：我应该/必须…" value={form.rule} onChange={v => set('rule', v)} />
            <Field label="假设" hint="如：如果…就会…" value={form.assumption} onChange={v => set('assumption', v)} />
            <Field label="应对策略" hint="为维持信念发展出的行为模式" value={form.coping} onChange={v => set('coping', v)} />
          </View>
        </View>
      </View>

      <View className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3">
        <Button className="w-full rounded-full" onClick={handleSubmit} disabled={submitting}>
          <Text className="text-lg text-primary-foreground">{submitting ? '督导正在批阅…' : '提交，请督导点评'}</Text>
        </Button>
      </View>
    </View>
  )
}

const Field = ({
  label, hint, value, onChange
}: { label: string; hint: string; value: string; onChange: (v: string) => void }) => (
  <View>
    <View className="flex flex-row items-baseline gap-2">
      <Text className="text-lg font-medium text-foreground">{label}</Text>
      <Text className="text-sm text-muted-foreground">{hint}</Text>
    </View>
    <View className="mt-2">
      <Textarea
        className="min-h-16 border-transparent rounded-xl text-lg"
        style={{ backgroundColor: 'rgba(239,236,228,0.7)' }}
        value={value}
        autoHeight
        onInput={e => onChange(e.detail.value)}
        placeholder="在此填写…"
      />
    </View>
  </View>
)

const buildSummary = (f: ConceptForm) =>
  `【横向概念化】
情境：${f.situation}
自动思维：${f.thought}
情绪：${f.emotion}
行为：${f.behavior}

【纵向概念化】
童年经历：${f.childhood}
核心信念：${f.coreBelief}
中间信念-态度：${f.attitude}
中间信念-规则：${f.rule}
中间信念-假设：${f.assumption}
应对策略：${f.coping}`

export default ConceptualizationPage
