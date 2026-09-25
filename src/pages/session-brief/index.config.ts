export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '会谈说明' })
  : { navigationBarTitleText: '会谈说明' }
