import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useIdentity } from '@/store/identity'
import { GraduationCap, UserRound, ShieldCheck } from 'lucide-react-taro'

export default function IdentityPage() {
  const { role, studentName, teacherName, setRole, setStudentName, setTeacherName } = useIdentity()
  const [nameInput, setNameInput] = useState(role === 'teacher' ? teacherName : studentName)
  const [tapCount, setTapCount] = useState(0)
  const [showTeacher, setShowTeacher] = useState(role === 'teacher')

  const handleSave = () => {
    const name = nameInput.trim()
    if (!name) {
      Taro.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }
    if (role === 'teacher') setTeacherName(name)
    else setStudentName(name)
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  // 隐藏入口：连续点 logo 7 次解锁教师角色
  const onLogoTap = () => {
    if (showTeacher) return
    const next = tapCount + 1
    if (next >= 7) {
      setShowTeacher(true)
      Taro.showToast({ title: '已解锁教师身份', icon: 'none' })
    }
    setTapCount(next)
  }

  const chooseRole = (r: 'student' | 'teacher') => {
    setRole(r)
    setNameInput(r === 'teacher' ? teacherName : studentName)
  }

  return (
    <View className="min-h-screen bg-page px-4 pt-6 pb-16">
      <View className="flex flex-col items-center mb-6" onClick={onLogoTap}>
        <View
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: 'rgba(91,140,123,0.12)' }}
        >
          {role === 'teacher' ? (
            <ShieldCheck size={30} color="#5B8C7B" />
          ) : (
            <GraduationCap size={30} color="#5B8C7B" />
          )}
        </View>
        <Text className="block text-lg font-semibold text-foreground">身份设置</Text>
      </View>

      {showTeacher && (
        <View className="flex flex-row gap-2 mb-4">
          <Button
            className="flex-1"
            variant={role === 'student' ? 'default' : 'outline'}
            onClick={() => chooseRole('student')}
          >
            <Text className="block">我是学生</Text>
          </Button>
          <Button
            className="flex-1"
            variant={role === 'teacher' ? 'default' : 'outline'}
            onClick={() => chooseRole('teacher')}
          >
            <Text className="block">我是教师</Text>
          </Button>
        </View>
      )}

      <Card>
        <CardContent className="p-4">
          <Text className="block text-sm text-muted-foreground mb-2">
            {role === 'teacher' ? '教师姓名' : '你的姓名'}
          </Text>
          <View className="bg-secondary rounded-lg px-3 py-1 mb-4">
            <Input
              value={nameInput}
              onInput={(e) => setNameInput(e.detail.value)}
              placeholder={role === 'teacher' ? '请输入教师姓名' : '提交作业时显示的姓名'}
            />
          </View>
          <Text className="block text-xs text-muted-foreground leading-relaxed">
            {role === 'teacher'
              ? '教师可在工作台查看并批改学生提交的所有练习作业。'
              : '你的练习记录与情绪周记会以这个姓名提交给教师，教师批改后可在「我的作业」查看分数与评语。'}
          </Text>
        </CardContent>
      </Card>

      <View className="mt-5 flex flex-col gap-3">
        <Button className="w-full" onClick={handleSave}>
          <Text className="block">保存</Text>
        </Button>
        {role === 'teacher' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => Taro.navigateTo({ url: '/pages/teacher/index' })}
          >
            <View className="flex flex-row items-center justify-center gap-1">
              <UserRound size={16} color="#5B8C7B" />
              <Text className="block">进入教师工作台</Text>
            </View>
          </Button>
        )}
      </View>

      {!showTeacher && (
        <Text className="block text-center text-xs text-muted-foreground mt-10">
          （版本 v1.0 · 学生端）
        </Text>
      )}
    </View>
  )
}
