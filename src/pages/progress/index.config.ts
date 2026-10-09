export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '学习进度' })
  : { navigationBarTitleText: '学习进度' }