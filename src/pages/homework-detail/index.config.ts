export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '作业详情' })
  : { navigationBarTitleText: '作业详情' }
