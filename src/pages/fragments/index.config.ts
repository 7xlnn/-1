export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '片段练习' })
  : { navigationBarTitleText: '片段练习' }
