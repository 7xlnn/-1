export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '来访者情绪记录' })
  : { navigationBarTitleText: '来访者情绪记录' }
