export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '概念化模块' })
  : { navigationBarTitleText: '概念化模块' }