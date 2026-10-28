import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Settings, ChevronRight, Layers, ChartBar, ClipboardCheck } from 'lucide-react-taro'
import { fragmentGroups } from '@/data/fragments'
import { UI_ASSETS } from '@/data/ui-assets'
import logo from '@/assets/logo.png'
import { useIdentity } from '@/store/identity'

const IndexPage = () => {
  const { studentName, role } = useIdentity()
  return (
    <View className="min-h-full bg-background pb-6">
      {/* ================= 欢迎 Hero ================= */}
      <View className="relative overflow-hidden">
        <Image
          src={UI_ASSETS.homeHero}
          className="w-full h-64"
          mode="aspectFill"
        />
        {/* 柔光遮罩：让文字在图中清晰可读 */}
        <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(33,49,42,0.28) 0%, rgba(31,61,45,0.72) 100%)' }} />
        <View className="absolute inset-x-0 top-0 px-5 pt-10">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-2">
              <Image src={logo} className="w-9 h-9" mode="aspectFit" />
              <Text className="text-white text-lg font-bold tracking-wide">知愈心理</Text>
            </View>
            <View
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
              onClick={() => Taro.navigateTo({ url: '/pages/identity/index' })}
            >
              <Settings size={18} color="#ffffff" />
            </View>
          </View>
        </View>
        <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <Text className="block text-2xl text-white font-semibold leading-snug whitespace-nowrap">
            把咨询室装进口袋，让练习随时随地发生
          </Text>
          <View className="mt-3 flex flex-row gap-2">
            <View className="rounded-full px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Text className="text-sm text-white">模拟来访者 · 实时对话</Text>
            </View>
            <View className="rounded-full px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Text className="text-sm text-white">AI 即时反馈</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 -mt-2">
        {/* ================= 片段练习 大图卡 ================= */}
        <View
          className="relative rounded-2xl overflow-hidden shadow-sm"
          onClick={() => Taro.navigateTo({ url: `/pages/fragments/index?id=${fragmentGroups[0].id}` })}
        >
          <Image src={UI_ASSETS.fragmentArt} className="w-full h-40" mode="aspectFill" />
          <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.05) 0%, rgba(23,43,33,0.62) 100%)' }} />
          <View className="absolute inset-x-0 bottom-0 p-4">
            <View className="flex flex-row justify-between items-center">
              <View>
                <View className="flex flex-row items-center gap-2">
                  <Layers size={16} color="#ffffff" />
                  <Text className="text-white text-lg font-semibold">片段练习</Text>
                </View>
                <Text className="block text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  共情 · 概念化 · 自动思维 · 信念矫正
                </Text>
              </View>
              <View className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }}>
                <ChevronRight size={16} color="#ffffff" />
              </View>
            </View>
          </View>
        </View>

        {/* ================= 完整咨询 大图卡 ================= */}
        <View
          className="relative rounded-2xl overflow-hidden shadow-sm mt-4"
          onClick={() => Taro.navigateTo({ url: '/pages/case/index' })}
        >
          <Image src={UI_ASSETS.caseArt} className="w-full h-40" mode="aspectFill" />
          <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.05) 0%, rgba(23,43,33,0.62) 100%)' }} />
          <View className="absolute inset-x-0 bottom-0 p-4">
            <View className="flex flex-row items-center gap-2">
              <Layers size={16} color="#ffffff" />
              <Text className="text-white text-lg font-semibold">完整咨询</Text>
            </View>
            <Text className="block text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
              陪一位来访者，从评估走到告别
            </Text>
          </View>
          <View className="absolute right-3 bottom-3">
            <View className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.28)' }}>
              <ChevronRight size={16} color="#ffffff" />
            </View>
          </View>
        </View>

        {/* ================= 学习进度 / 我的作业 ================= */}
        <View className="mt-4 flex flex-col gap-3">
          <View
            className="flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            onClick={() => Taro.navigateTo({ url: '/pages/progress/index' })}
          >
            <View className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
              <ChartBar size={20} color="#5B8C7B" />
            </View>
            <View className="flex-1">
              <Text className="block text-lg font-semibold text-foreground">我的学习进度</Text>
              <Text className="block text-lg text-muted-foreground mt-1">练习次数 · 技术完成度 · 分数走势</Text>
            </View>
            <ChevronRight size={16} color="#9AA19A" />
          </View>

          {role === 'teacher' ? (
            <View
              className="flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              onClick={() => Taro.navigateTo({ url: '/pages/teacher/index' })}
            >
              <View className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
                <ClipboardCheck size={20} color="#5B8C7B" />
              </View>
              <View className="flex-1">
                <Text className="block text-lg font-semibold text-foreground">教师工作台</Text>
                <Text className="block text-lg text-muted-foreground mt-1">查看并批改学生作业</Text>
              </View>
              <ChevronRight size={16} color="#9AA19A" />
            </View>
          ) : (
            <View
              className="flex flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              onClick={() => Taro.navigateTo({ url: '/pages/homework/index' })}
            >
              <View className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}>
                <ClipboardCheck size={20} color="#5B8C7B" />
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
        </View>

        <View className="h-4" />
      </View>
    </View>
  )
}

export default IndexPage