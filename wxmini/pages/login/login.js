// pages/login/login.js
console.log('开始加载登录页模块')
let app, auth, showToast, showLoading, hideLoading

try {
  app = getApp()
  console.log('app对象获取成功:', !!app)
} catch (error) {
  console.error('获取app对象失败:', error)
}

try {
  const authModule = require('../../api/index.js')
  auth = authModule.auth
  console.log('auth模块加载成功:', !!auth)
} catch (error) {
  console.error('auth模块加载失败:', error)
}

try {
  const utils = require('../../utils/utils.js')
  showToast = utils.showToast
  showLoading = utils.showLoading
  hideLoading = utils.hideLoading
  console.log('utils模块加载成功:', !!showToast)
} catch (error) {
  console.error('utils模块加载失败:', error)
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 登录状态
    isLogging: false,
    
    // 页面来源
    source: '',
    
    // 用户信息授权
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    
    // 调试信息
    debugInfo: '页面初始化完成'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('登录页 onLoad 调用，参数:', options)
    try {
      this.setData({
        source: options.source || 'direct',
        debugInfo: 'onLoad完成'
      })
      console.log('登录页 onLoad 完成，当前数据:', this.data)
    } catch (error) {
      console.error('onLoad执行失败:', error)
      this.setData({
        debugInfo: 'onLoad失败: ' + error.message
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('登录页 onShow 调用')
    try {
      this.setData({
        debugInfo: 'onShow完成'
      })
    } catch (error) {
      console.error('onShow执行失败:', error)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('登录页 onReady 调用，页面渲染完成')
    try {
      this.setData({
        debugInfo: 'onReady完成-页面渲染成功'
      })
    } catch (error) {
      console.error('onReady执行失败:', error)
    }
  },

  /**
   * 微信登录
   */
  async onWxLogin() {
    if (this.data.isLogging) {
      return
    }

    // 1. 首先在同步上下文中获取用户信息（可选）
    let userInfo = null
    try {
      if (this.data.canIUseGetUserProfile) {
        const userRes = await this.getUserProfile()
        userInfo = userRes.userInfo
      }
    } catch (error) {
      console.log('用户取消授权或获取用户信息失败:', error)
      // 不阻断登录流程，继续使用code登录
    }

    try {
      this.setData({ isLogging: true })
      showLoading('登录中...')

      // 2. 获取微信登录code
      const loginRes = await this.getWxLoginCode()

      // 3. 调用后端登录接口
      const response = await auth.wxLogin({
        code: loginRes.code,
        userInfo: userInfo
      })

      if (response.success) {
        // 保存登录信息
        app.setToken(response.data.token)
        app.setUserInfo(response.data.user)
        
        showToast('登录成功')
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.navigateBack()
        }, 1500)
      } else {
        console.error("登录失败", response)
        showToast(response.message || '登录失败')
      }

    } catch (error) {
      console.error('微信登录失败:', error)
      showToast('登录失败，请重试')
    } finally {
      this.setData({ isLogging: false })
      hideLoading()
    }
  },

  /**
   * 获取微信登录code
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },

  /**
   * 获取用户信息
   */
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  /**
   * 跳过登录
   */
  onSkipLogin() {
    this.navigateBack()
  }
})