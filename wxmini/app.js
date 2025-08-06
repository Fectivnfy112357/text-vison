// 文生视界微信小程序 - 应用入口文件
// 基础库版本: v3.9.0

App({
  globalData: {
    version: '1.0.0',
    baseUrl: 'http://localhost:8999', // 后端API地址
    userInfo: null,
    token: null,
    isLogin: false
  },

  onLaunch(options) {
    console.log('文生视界小程序启动', options)
    // 初始化应用
    this.initApp()
  },

  onShow(options) {
    console.log('小程序显示', options)
    
    // 检查登录状态
    this.checkLoginStatus()
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误:', msg)
    
    // 错误上报
    this.reportError(msg)
  },

  /**
   * 版本号比较
   */
  compareVersion(v1, v2) {
    const arr1 = v1.split('.')
    const arr2 = v2.split('.')
    const length = Math.max(arr1.length, arr2.length)
    
    for (let i = 0; i < length; i++) {
      const num1 = parseInt(arr1[i] || '0')
      const num2 = parseInt(arr2[i] || '0')
      
      if (num1 > num2) return 1
      if (num1 < num2) return -1
    }
    
    return 0
  },

  /**
   * 初始化应用
   */
  initApp() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    
    // 设置导航栏
    wx.setNavigationBarTitle({
      title: '文生视界'
    })
    
    // 初始化网络状态监听
    this.initNetworkListener()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('user_token')
    const userInfo = wx.getStorageSync('user_info')
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.isLogin = true
    } else {
      this.globalData.isLogin = false
    }
  },

  /**
   * 初始化网络监听
   */
  initNetworkListener() {
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      if (!res.isConnected) {
        wx.showToast({
          title: '网络连接异常',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 错误上报
   */
  reportError(error) {
    // 这里可以集成错误监控服务
    console.error('应用错误:', error)
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return this.globalData.userInfo
  },

  /**
   * 设置用户信息
   */
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('user_info', userInfo)
  },

  /**
   * 获取Token
   */
  getToken() {
    return this.globalData.token
  },

  /**
   * 设置Token
   */
  setToken(token) {
    this.globalData.token = token
    this.globalData.isLogin = !!token
    
    if (token) {
      wx.setStorageSync('user_token', token)
    } else {
      wx.removeStorageSync('user_token')
      wx.removeStorageSync('user_info')
    }
  },

  /**
   * 检查是否登录
   */
  isLogin() {
    return this.globalData.isLogin
  }
})