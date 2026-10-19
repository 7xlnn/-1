export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '知愈心理' })
  : { navigationBarTitleText: '知愈心理' }
