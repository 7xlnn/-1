import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { LucideTaroProvider } from 'lucide-react-taro';
import '@/app.css';
import { Toaster } from '@/components/ui/toast';
import { useIdentity } from '@/store/identity';
import { Preset } from './presets';

const App = ({ children }: PropsWithChildren) => {
  // 启动时尝试从云端恢复本地草稿（换设备后登录学号即可找回进度/对话/周记）
  useLaunch(() => {
    const { studentId } = useIdentity.getState()
    if (!studentId) return
    import('@/services/draft')
      .then((m) => m.hydrateDrafts())
      .catch((e) => console.warn('[draft] hydrate failed', e))
  })

  return (
    <LucideTaroProvider defaultColor="#000" defaultSize={24}>
      <Preset>{children}</Preset>
      <Toaster />
    </LucideTaroProvider>
  );
};

export default App;
