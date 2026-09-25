export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '练习说明' })
  : { navigationBarTitleText: '练习说明' }
