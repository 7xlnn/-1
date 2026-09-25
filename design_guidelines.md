# 设计指南 — CBT 练心场

## 品牌定位
面向新手心理咨询师学生的 CBT 刻意练习小程序。气质：午后咨询室般的安全、安静、专业、不评判。浅色、低饱和、档案式信息组织。

## 配色方案（语义类名优先）
| 用途 | 色值 | 使用方式 |
| --- | --- | --- |
| 主色 鼠尾草绿 | `#5B8C7B` | `bg-primary` `text-primary` `border-primary` |
| 背景 米白亚麻 | `#F7F5F0` | `bg-background` |
| 卡片 | `#FFFFFF` | `bg-card`（Card 组件默认） |
| 主文字 | `#2F3430` | `text-foreground` |
| 次文字 | `#6E756E` | `text-muted-foreground` |
| 次级底 | `#EFECE4` | `bg-muted` / `bg-secondary` |
| 边框 | `#E8E4DA` | `border-border`（默认边框色） |
| 警示 陶土红 | `#C0654F` | `bg-destructive` / `text-destructive`，仅小面积 |
| 督导提示 | 陶土橙系 | 使用 Badge / Alert，不自行配色 |

禁止使用指南外颜色；禁止蓝紫渐变、纯黑、高饱和色；图标用 `color` 属性显式传色值。

## 字体排版
- 页面标题：`text-xl font-bold`；区块标题：`text-base font-semibold`。
- 正文：`text-sm leading-relaxed`；辅助说明：`text-xs text-muted-foreground`。
- 垂直排列的 Text 必须加 `block` 类。

## 间距系统
- 页面水平边距：`px-4`；页面区块间距：`space-y-4` / `gap-4`。
- 卡片内边距：`p-4`；列表项间距：`space-y-3`。
- 禁止硬编码 px 与 Tailwind 任意值（如 `w-[340px]`、`text-[14px]`）。

## 组件选型原则（强制）
1. 通用 UI 一律优先来自 `@/components/ui/*`，禁止用 `View/Text` 手搓。
2. 典型映射：
   - 按钮 → `Button`；输入框 → `Input` / `Textarea`（外层 View 包裹，样式放外层）
   - 容器/档案卡 → `Card` / `CardContent` / `CardHeader`
   - 标签 → `Badge`；分段切换 → `Tabs`；弹窗 → `Dialog`
   - 加载态 → `Skeleton`；提示 → `Alert` / Sonner；进度 → `Progress`
   - 步骤指示 → 自绘极简步骤条（仅细圆点+连线，不造通用组件）
3. 页面开发前先列 UI 单元清单并映射到组件库。

## 容器样式
- 卡片：默认圆角 + 细边框 + 轻阴影（Card 自带），不自行叠加。
- 引用/对话片段块：`bg-muted/60 border-l-2 border-primary pl-3`。

## 导航结构
- 无 TabBar：两大模块（片段练习 / 完整咨询）通过首页两个主入口进入，内部页面栈导航。
- 页面跳转：`Taro.navigateTo`；练习中返回用导航栏返回。

## 状态展示
- 加载：`Skeleton` 卡片轮廓；空状态：线性图标 + 一句说明。
- AI 等待：显示"来访者正在输入…"。
- 督导反馈：卡片滑入，陶土橙 Badge 标记。

## 动效
- 200-300ms ease-out 淡入/上移；禁止弹跳闪烁、游戏化奖励动画。

## 小程序约束
- 除 TabBar 外不打包图片资源；本应用无本地图片，图标全部 lucide-react-taro。
- 对话记录随会话存储在前端状态/存储，不依赖大体积本地资源。
