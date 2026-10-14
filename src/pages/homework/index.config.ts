export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '我的作业' })
  : { navigationBarTitleText: '我的作业' }
