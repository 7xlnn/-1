export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '批改作业' })
  : { navigationBarTitleText: '批改作业' }
