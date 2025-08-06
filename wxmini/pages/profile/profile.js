// pages/profile/profile.js
const app = getApp()
const { auth, user } = require('../../api/index.js')
const { analytics } = require('../../utils/analytics')
const { storage } = require('../../utils/storage')
const { utils } = require('../../utils/utils')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 加载状态
    loading: true,
    refreshing: false,
    
    // 用户信息
    userInfo: null,
    isLoggedIn: false,
    
    // 用户统计
    userStats: {
      totalWorks: 0,
      totalImages: 0,
      totalVideos: 0,
      totalConversions: 0,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalDownloads: 0,
      memberDays: 0,
      level: 1,
      exp: 0,
      nextLevelExp: 100
    },
    
    // 会员信息
    memberInfo: {
      isMember: false,
      memberType: '',
      expireTime: null,
      remainingDays: 0,
      benefits: []
    },
    
    // 功能菜单
    menuItems: [
      {
        id: 'works',
        title: '我的作品',
        icon: 'image',
        count: 0,
        path: '/pages/history/history'
      },
      {
        id: 'favorites',
        title: '我的收藏',
        icon: 'heart',
        count: 0,
        path: '/pages/favorites/favorites'
      },
      {
        id: 'downloads',
        title: '下载记录',
        icon: 'download',
        count: 0,
        path: '/pages/downloads/downloads'
      },
      {
        id: 'templates',
        title: '我的模板',
        icon: 'template',
        count: 0,
        path: '/pages/my-templates/my-templates'
      }
    ],
    
    // 设置选项
    settingItems: [
      {
        id: 'account',
        title: '账号设置',
        icon: 'user',
        path: '/pages/account/account'
      },
      {
        id: 'privacy',
        title: '隐私设置',
        icon: 'shield',
        path: '/pages/privacy/privacy'
      },
      {
        id: 'notification',
        title: '消息通知',
        icon: 'bell',
        path: '/pages/notification/notification'
      },
      {
        id: 'theme',
        title: '主题设置',
        icon: 'palette',
        action: 'toggleTheme'
      },
      {
        id: 'language',
        title: '语言设置',
        icon: 'globe',
        path: '/pages/language/language'
      },
      {
        id: 'cache',
        title: '清理缓存',
        icon: 'trash',
        action: 'clearCache'
      },
      {
        id: 'feedback',
        title: '意见反馈',
        icon: 'message',
        path: '/pages/feedback/feedback'
      },
      {
        id: 'about',
        title: '关于我们',
        icon: 'info',
        path: '/pages/about/about'
      }
    ],
    
    // 主题设置
    isDarkMode: false,
    
    // 缓存大小
    cacheSize: '0MB'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus()
    this.loadThemeSettings()
    this.calculateCacheSize()
    
    // 记录页面访问
    analytics.trackPageView('profile', {
      source: options.source || 'direct'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (this.data.isLoggedIn) {
      this.loadUserData()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = app.globalData.userInfo
    const isLoggedIn = !!userInfo
    
    this.setData({
      userInfo,
      isLoggedIn,
      loading: false
    })
    
    if (isLoggedIn) {
      this.loadUserData()
    }
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      this.setData({ loading: true })
      
      // 并行加载用户统计和会员信息
      const [statsRes, memberRes] = await Promise.all([
        user.getUserStats(),
        user.getMemberInfo()
      ])
      
      if (statsRes.success) {
        this.setData({
          userStats: statsRes.data,
          'menuItems[0].count': statsRes.data.totalWorks,
          'menuItems[1].count': statsRes.data.totalFavorites || 0,
          'menuItems[2].count': statsRes.data.totalDownloads,
          'menuItems[3].count': statsRes.data.totalTemplates || 0
        })
      }
      
      if (memberRes.success) {
        this.setData({
          memberInfo: memberRes.data
        })
      }
      
    } catch (error) {
      console.error('加载用户数据失败:', error)
      utils.showToast('加载失败，请重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    try {
      this.setData({ refreshing: true })
      
      if (this.data.isLoggedIn) {
        await this.loadUserData()
      }
      
      this.calculateCacheSize()
      
    } catch (error) {
      console.error('刷新数据失败:', error)
    } finally {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 加载主题设置
   */
  loadThemeSettings() {
    const isDarkMode = storage.get('isDarkMode', false)
    this.setData({ isDarkMode })
  },

  /**
   * 计算缓存大小
   */
  calculateCacheSize() {
    try {
      wx.getStorageInfo({
        success: (res) => {
          const sizeKB = res.currentSize
          const sizeMB = (sizeKB / 1024).toFixed(2)
          this.setData({
            cacheSize: `${sizeMB}MB`
          })
        }
      })
    } catch (error) {
      console.error('计算缓存大小失败:', error)
    }
  },

  /**
   * 用户头像点击
   */
  onAvatarTap() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt()
      return
    }
    
    // 显示头像操作选项
    wx.showActionSheet({
      itemList: ['查看头像', '更换头像'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.previewAvatar()
        } else if (res.tapIndex === 1) {
          this.changeAvatar()
        }
      }
    })
    
    analytics.trackEvent('profile_avatar_tap')
  },

  /**
   * 预览头像
   */
  previewAvatar() {
    if (this.data.userInfo?.avatarUrl) {
      wx.previewImage({
        urls: [this.data.userInfo.avatarUrl]
      })
    }
  },

  /**
   * 更换头像
   */
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.uploadAvatar(tempFilePath)
      }
    })
  },

  /**
   * 上传头像
   */
  async uploadAvatar(filePath) {
    try {
      wx.showLoading({ title: '上传中...' })
      
      const uploadRes = await user.uploadFile(filePath, 'avatar')
      
      if (uploadRes.success) {
        const updateRes = await user.updateUserInfo({
          avatarUrl: uploadRes.data.url
        })
        
        if (updateRes.success) {
          this.setData({
            'userInfo.avatarUrl': uploadRes.data.url
          })
          
          // 更新全局用户信息
          app.globalData.userInfo.avatarUrl = uploadRes.data.url
          
          utils.showToast('头像更新成功')
          analytics.trackEvent('profile_avatar_update')
        }
      }
      
    } catch (error) {
      console.error('上传头像失败:', error)
      utils.showToast('上传失败，请重试')
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 会员卡片点击
   */
  onMemberCardTap() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt()
      return
    }
    
    wx.navigateTo({
      url: '/pages/member/member'
    })
    
    analytics.trackEvent('profile_member_tap')
  },

  /**
   * 菜单项点击
   */
  onMenuItemTap(e) {
    const { item } = e.currentTarget.dataset
    
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt()
      return
    }
    
    if (item.path) {
      wx.navigateTo({
        url: item.path
      })
    }
    
    analytics.trackEvent('profile_menu_tap', {
      menu_id: item.id,
      menu_title: item.title
    })
  },

  /**
   * 设置项点击
   */
  onSettingItemTap(e) {
    const { item } = e.currentTarget.dataset
    
    if (item.action) {
      this.handleSettingAction(item.action)
    } else if (item.path) {
      wx.navigateTo({
        url: item.path
      })
    }
    
    analytics.trackEvent('profile_setting_tap', {
      setting_id: item.id,
      setting_title: item.title
    })
  },

  /**
   * 处理设置操作
   */
  handleSettingAction(action) {
    switch (action) {
      case 'toggleTheme':
        this.toggleTheme()
        break
      case 'clearCache':
        this.clearCache()
        break
    }
  },

  /**
   * 切换主题
   */
  toggleTheme() {
    const isDarkMode = !this.data.isDarkMode
    
    this.setData({ isDarkMode })
    storage.set('isDarkMode', isDarkMode)
    
    // 通知其他页面主题变更
    wx.setStorageSync('themeChanged', Date.now())
    
    utils.showToast(isDarkMode ? '已切换到深色模式' : '已切换到浅色模式')
    
    analytics.trackEvent('profile_theme_toggle', {
      theme: isDarkMode ? 'dark' : 'light'
    })
  },

  /**
   * 清理缓存
   */
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: `当前缓存大小：${this.data.cacheSize}\n确定要清理缓存吗？`,
      success: (res) => {
        if (res.confirm) {
          this.performClearCache()
        }
      }
    })
  },

  /**
   * 执行清理缓存
   */
  performClearCache() {
    try {
      wx.showLoading({ title: '清理中...' })
      
      // 清理图片缓存
      wx.clearStorage({
        success: () => {
          // 重新设置必要的数据
          const userInfo = app.globalData.userInfo
          if (userInfo) {
            storage.set('userInfo', userInfo)
          }
          
          this.setData({ cacheSize: '0MB' })
          utils.showToast('缓存清理完成')
          
          analytics.trackEvent('profile_cache_clear')
        },
        fail: () => {
          utils.showToast('清理失败，请重试')
        },
        complete: () => {
          wx.hideLoading()
        }
      })
      
    } catch (error) {
      console.error('清理缓存失败:', error)
      utils.showToast('清理失败，请重试')
      wx.hideLoading()
    }
  },

  /**
   * 登录按钮点击
   */
  onLoginTap() {
    wx.navigateTo({
      url: '/pages/login/login?source=profile'
    })
    
    analytics.trackEvent('profile_login_tap')
  },

  /**
   * 显示登录提示
   */
  showLoginPrompt() {
    wx.showModal({
      title: '登录提示',
      content: '请先登录后再使用此功能',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.onLoginTap()
        }
      }
    })
  },

  /**
   * 分享页面
   */
  onShareAppMessage() {
    analytics.trackEvent('profile_share')
    
    return {
      title: 'AI创作神器 - 让创意无限可能',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    analytics.trackEvent('profile_share_timeline')
    
    return {
      title: 'AI创作神器 - 让创意无限可能',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})