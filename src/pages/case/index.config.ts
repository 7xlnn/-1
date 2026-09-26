export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '完整咨询' })
  : { navigationBarTitleText: '完整咨询' }