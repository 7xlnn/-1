export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '咨询个案' })
  : { navigationBarTitleText: '咨询个案' }
