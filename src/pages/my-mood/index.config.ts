export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '我的情绪周记' })
  : { navigationBarTitleText: '我的情绪周记' }
