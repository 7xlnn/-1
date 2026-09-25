export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'CBT 练心场' })
  : { navigationBarTitleText: 'CBT 练心场' }
