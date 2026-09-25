export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '咨询室' })
  : { navigationBarTitleText: '咨询室' }
