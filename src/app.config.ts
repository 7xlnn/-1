export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/case/index',
    'pages/my-mood/index',
    'pages/fragments/index',
    'pages/fragment-brief/index',
    'pages/chat/index',
    'pages/conceptualization/index',
    'pages/feedback/index',
    'pages/case-detail/index',
    'pages/session-brief/index',
    'pages/mood-record/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F7F6F2',
    navigationBarTitleText: 'CBT 练心场',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F6F2'
  },
  tabBar: {
    color: '#9AA19A',
    selectedColor: '#5B8C7B',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '片段练习',
        iconPath: './assets/tabbar/layers.png',
        selectedIconPath: './assets/tabbar/layers-active.png'
      },
      {
        pagePath: 'pages/case/index',
        text: '完整咨询',
        iconPath: './assets/tabbar/user-round.png',
        selectedIconPath: './assets/tabbar/user-round-active.png'
      },
      {
        pagePath: 'pages/my-mood/index',
        text: '我的周记',
        iconPath: './assets/tabbar/heart-pulse.png',
        selectedIconPath: './assets/tabbar/heart-pulse-active.png'
      }
    ]
  }
})