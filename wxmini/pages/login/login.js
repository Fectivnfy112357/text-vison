// pages/login/login.js
const app = getApp()
const { auth } = require('../../api/index.js')
const { showToast, showLoading, hideLoading } = require('../../utils/utils.js')

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
    canIUseNicknameComp: wx.canIUse('input.type.nickname')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      source: options.source || 'direct'
    })
  },

  /**
   * 微信登录
   */
  async onWxLogin() {
    if (this.data.isLogging) {
      return
    }

    try {
      this.setData({ isLogging: true })
      showLoading('登录中...')

      // 1. 获取微信登录code
      const loginRes = await this.getWxLoginCode()
      
      // 2. 获取用户信息（可选）
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