export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '身份设置' })
  : { navigationBarTitleText: '身份设置' }
