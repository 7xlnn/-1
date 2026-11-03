import { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useIdentity } from '@/store/identity'
import { UI_ASSETS } from '@/data/ui-assets'
import { UserRound, LockKeyhole, IdCard } from 'lucide-react-taro'

/** 教师口令（统一修改入口）。仅设此处即可全局生效。 */
export const TEACHER_PASSCODE = 'cbt2026'

export default function IdentityPage() {
  const { role, studentName, studentNo, setRole, setStudentName, setStudentNo } = useIdentity()
  const [nameInput, setNameInput] = useState(studentName)
  const [noInput, setNoInput] = useState(studentNo)
  const [showTeacher, setShowTeacher] = useState(role === 'teacher')
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [passcode, setPasscode] = useState('')
  const isTeacher = role === 'teacher'

  const handleSave = () => {
    const name = nameInput.trim()
    const no = noInput.trim()
    if (!no) {
      Taro.showToast({ title: '请填写学号', icon: 'none' })
      return
    }
    if (!name) {
      Taro.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }
    setStudentName(name)
    setStudentNo(no)
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 500)
  }

  const chooseRole = (r: 'student' | 'teacher') => {
    setRole(r)
    if (r === 'student') {
      setNameInput(studentName)
      setNoInput(studentNo)
    }
  }

  // 教师登录：输入口令解锁（教师无需姓名）
  const unlockTeacher = () => {
    if (passcode.trim() === TEACHER_PASSCODE) {
      setShowTeacher(true)
      setRole('teacher')
      setTeacherOpen(false)
      setPasscode('')
      Taro.showToast({ title: '教师身份已解锁', icon: 'success' })
    } else {
      Taro.showToast({ title: '口令错误', icon: 'none' })
    }
  }

  return (
    <View className="min-h-screen bg-page pb-16">
      {/* 顶部氛围图 + 身份标题 */}
      <View className="relative overflow-hidden">
        <Image src={UI_ASSETS.identityArt} className="w-full h-44" mode="aspectFill" />
        <View className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(31,61,45,0.18) 0%, rgba(24,44,33,0.66) 100%)' }} />
        <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <Text className="block text-2xl text-white font-semibold">
            {isTeacher ? '教师身份' : '欢迎使用，朋友'}
          </Text>
          <Text className="block text-sm mt-1" style={{ color: 'rgba(255,255,255,0.88)' }}>
            {isTeacher ? '解锁后查看并批改学生作业' : '填写姓名，你的练习与作业将以它提交'}
          </Text>
        </View>
      </View>

      <View className="px-4 -mt-3">
        {showTeacher && (
          <View className="flex flex-row gap-2 mb-4">
            <Button
              className="flex-1"
              variant={!isTeacher ? 'default' : 'outline'}
              onClick={() => chooseRole('student')}
            >
              <Text className="block">我是学生</Text>
            </Button>
            <Button
              className="flex-1"
              variant={isTeacher ? 'default' : 'outline'}
              onClick={() => chooseRole('teacher')}
            >
              <Text className="block">我是教师</Text>
            </Button>
          </View>
        )}

        {!isTeacher ? (
          <Card>
            <CardContent className="p-4">
              <Text className="block text-sm text-muted-foreground mb-2">学号</Text>
              <View className="bg-secondary rounded-lg px-3 py-1 mb-4">
                <View className="flex flex-row items-center gap-2">
                  <IdCard size={16} color="#9AA19A" />
                  <Input
                    value={noInput}
                    onInput={(e) => setNoInput(e.detail.value)}
                    placeholder="请输入学号，用于关联你的作业"
                  />
                </View>
              </View>
              <Text className="block text-sm text-muted-foreground mb-2">姓名</Text>
              <View className="bg-secondary rounded-lg px-3 py-1 mb-4">
                <Input
                  value={nameInput}
                  onInput={(e) => setNameInput(e.detail.value)}
                  placeholder="请输入姓名"
                />
              </View>
              </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <Text className="block text-sm text-muted-foreground leading-relaxed">
                已通过口令解锁教师身份。教师可在工作台查看学生提交的全部练习与情绪周记。
              </Text>
            </CardContent>
          </Card>
        )}

        <View className="mt-5 flex flex-col gap-3">
          {isTeacher ? (
            <Button className="w-full" onClick={() => Taro.navigateTo({ url: '/pages/teacher/index' })}>
              <View className="flex flex-row items-center justify-center gap-1">
                <UserRound size={16} color="#ffffff" />
                <Text className="block text-primary-foreground">进入教师工作台</Text>
              </View>
            </Button>
          ) : (
            <Button className="w-full" onClick={handleSave}>
              <Text className="block">保存</Text>
            </Button>
          )}
        </View>

        {/* 教师口令登录（隐藏入口） */}
        {!showTeacher && (
          <View className="mt-10">
            {teacherOpen ? (
              <Card>
                <CardContent className="p-4">
                  <Text className="block text-sm text-muted-foreground mb-2">输入教师口令</Text>
                  <View className="bg-secondary rounded-lg px-3 py-1 mb-3">
                    <Input
                      password
                      value={passcode}
                      onInput={(e) => setPasscode(e.detail.value)}
                      placeholder="请输入口令"
                      confirmType="done"
                    />
                  </View>
                  <View className="flex flex-row gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setTeacherOpen(false)}>
                      <Text className="block">取消</Text>
                    </Button>
                    <Button className="flex-1" onClick={unlockTeacher}>
                      <Text className="block">解锁</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            ) : (
              <Button variant="ghost" className="w-full" onClick={() => setTeacherOpen(true)}>
                <View className="flex flex-row items-center justify-center gap-1">
                  <LockKeyhole size={14} color="#9AA19A" />
                  <Text className="text-sm text-muted-foreground">教师登录</Text>
                </View>
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  )
}