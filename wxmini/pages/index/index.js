/**
 * 文生视界微信小程序 - 首页
 * 基于微信小程序 v3.9.0 基础库
 */

const app = getApp()
const { content } = require('../../api/index.js')
const { formatTime, showToast, navigateTo, storage } = require('../../utils/utils.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    userInfo: null,
    hasUserInfo: false,
    
    // 轮播图数据
    banners: [
      {
        id: 1,
        image: '/images/banner1.jpg',
        title: 'AI图像生成',
        desc: '文字描述生成精美图片',
        url: '/pages/create/create?type=image'
      },
      {
        id: 2,
        image: '/images/banner2.jpg',
        title: 'AI视频创作',
        desc: '智能生成短视频内容',
        url: '/pages/create/create?type=video'
      },
      {
        id: 3,
        image: '/images/banner3.jpg',
        title: '模板库',
        desc: '丰富的创作模板等你探索',
        url: '/pages/templates/templates'
      }
    ],
    
    // 功能菜单
    menuItems: [
      {
        id: 'text-to-image',
        icon: '/images/icons/image.png',
        title: '文生图',
        desc: '文字生成图片',
        color: '#FF6B6B',
        url: '/pages/create/create?type=image'
      },
      {
        id: 'text-to-video',
        icon: '/images/icons/video.png',
        title: '文生视频',
        desc: '文字生成视频',
        color: '#4ECDC4',
        url: '/pages/create/create?type=video'
      },
      {
        id: 'image-to-image',
        icon: '/images/icons/transform.png',
        title: '图像转换',
        desc: '图片风格转换',
        color: '#45B7D1',
        url: '/pages/create/create?type=transform'
      },
      {
        id: 'templates',
        icon: '/images/icons/template.png',
        title: '模板库',
        desc: '精选创作模板',
        color: '#96CEB4',
        url: '/pages/templates/templates'
      }
    ],
    
    // 热门模板
    hotTemplates: [],
    
    // 最近生成
    recentWorks: [],
    
    // 加载状态
    loading: true,
    refreshing: false,
    
    // 统计数据
    stats: {
      totalGenerated: 0,
      todayGenerated: 0,
      favoriteCount: 0
    },
    
    // 系统信息
    systemInfo: {},
    
    // 页面状态
    pageReady: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('Index page onLoad:', options)
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 初始化页面数据
    this.initPageData()
    
    // 检查用户登录状态
    this.checkUserLogin()
    
    // 记录页面访问
    this.trackPageView()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('Index page onShow')
    
    // 更新用户信息
    this.updateUserInfo()
    
    // 刷新最近作品
    this.loadRecentWorks()
    
    // 更新统计数据
    this.loadUserStats()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('Index page onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('Index page onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('Index page onPullDownRefresh')
    this.refreshPageData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('Index page onReachBottom')
    // 加载更多最近作品
    this.loadMoreRecentWorks()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '文生视界 - AI创作神器',
      desc: '文字生成图片视频，创意无限可能',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  /**
   * 用户点击右上角分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '文生视界 - AI创作神器',
      query: 'from=timeline',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        systemInfo
      })
      console.log('System info:', systemInfo)
    } catch (error) {
      console.error('Get system info error:', error)
    }
  },

  /**
   * 初始化页面数据
   */
  async initPageData() {
    try {
      // 并行加载数据
      await Promise.all([
        this.loadHotTemplates(),
        this.loadRecentWorks(),
        this.loadUserStats()
      ])
      
      this.setData({
        loading: false,
        pageReady: true
      })
    } catch (error) {
      console.error('Init page data error:', error)
      this.setData({
        loading: false
      })
    }
  },

  /**
   * 检查用户登录状态
   */
  checkUserLogin() {
    const userInfo = app.globalData.userInfo || storage.get('user_info')
    const hasUserInfo = !!userInfo
    
    this.setData({
      userInfo,
      hasUserInfo
    })
    
    console.log('User login status:', hasUserInfo)
  },

  /**
   * 更新用户信息
   */
  updateUserInfo() {
    const userInfo = app.globalData.userInfo || storage.get('user_info')
    const hasUserInfo = !!userInfo
    
    if (this.data.hasUserInfo !== hasUserInfo) {
      this.setData({
        userInfo,
        hasUserInfo
      })
    }
  },

  /**
   * 加载热门模板
   */
  async loadHotTemplates() {
    try {
      const templates = await content.getTemplates({
        category: 'hot',
        limit: 6
      })
      
      this.setData({
        hotTemplates: templates.list || []
      })
    } catch (error) {
      console.error('Load hot templates error:', error)
    }
  },

  /**
   * 加载最近作品
   */
  async loadRecentWorks() {
    try {
      if (!this.data.hasUserInfo) {
        this.setData({ recentWorks: [] })
        return
      }
      
      const { history } = require('../../api/index.js')
      const works = await history.getHistoryList({
        limit: 10,
        page: 1
      })
      
      this.setData({
        recentWorks: works.list || []
      })
    } catch (error) {
      console.error('Load recent works error:', error)
    }
  },

  /**
   * 加载更多最近作品
   */
  async loadMoreRecentWorks() {
    // 实现分页加载逻辑
    console.log('Load more recent works')
  },

  /**
   * 加载用户统计数据
   */
  async loadUserStats() {
    try {
      if (!this.data.hasUserInfo) {
        return
      }
      
      // 用户统计数据已移除
      this.setData({ stats: {} })
    } catch (error) {
      console.error('Load user stats error:', error)
    }
  },

  /**
   * 刷新页面数据
   */
  async refreshPageData() {
    this.setData({ refreshing: true })
    
    try {
      await this.initPageData()
    } catch (error) {
      console.error('Refresh page data error:', error)
    } finally {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    }
  },



  /**
   * 轮播图切换
   */
  onBannerChange(e) {
    const current = e.detail.current
    console.log('Banner change:', current)
    

  },

  /**
   * 轮播图点击
   */
  onBannerTap(e) {
    const index = e.currentTarget.dataset.index
    const banner = this.data.banners[index]
    
    if (banner && banner.url) {

      
      navigateTo(banner.url)
    }
  },

  /**
   * 功能菜单点击
   */
  onMenuTap(e) {
    const index = e.currentTarget.dataset.index
    const menuItem = this.data.menuItems[index]
    
    if (menuItem) {
      // 检查登录状态
      if (!this.data.hasUserInfo && menuItem.id !== 'templates') {
        this.showLoginModal()
        return
      }
      

      
      navigateTo(menuItem.url)
    }
  },

  /**
   * 模板点击
   */
  onTemplateTap(e) {
    const index = e.currentTarget.dataset.index
    const template = this.data.hotTemplates[index]
    
    if (template) {

      
      navigateTo('/pages/create/create', {
        template_id: template.id
      })
    }
  },

  /**
   * 作品点击
   */
  onWorkTap(e) {
    const index = e.currentTarget.dataset.index
    const work = this.data.recentWorks[index]
    
    if (work) {
      navigateTo('/pages/detail/detail', {
        id: work.id
      })
    }
  },

  /**
   * 显示登录弹窗
   */
  showLoginModal() {
    wx.showModal({
      title: '登录提示',
      content: '请先登录后再使用创作功能',
      confirmText: '去登录',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          navigateTo('/pages/login/login')
        }
      }
    })
  },

  /**
   * 查看更多模板
   */
  onViewMoreTemplates() {
    navigateTo('/pages/templates/templates')
  },

  /**
   * 查看更多作品
   */
  onViewMoreWorks() {
    navigateTo('/pages/history/history')
  },

  /**
   * 用户头像点击
   */
  onAvatarTap() {
    if (this.data.hasUserInfo) {
      navigateTo('/pages/profile/profile')
    } else {
      navigateTo('/pages/login/login')
    }
  },

  /**
   * 搜索框点击
   */
  onSearchTap() {
    navigateTo('/pages/search/search')
  },

  /**
   * 通知图标点击
   */
  onNotificationTap() {
    if (!this.data.hasUserInfo) {
      this.showLoginModal()
      return
    }
    
    navigateTo('/pages/notification/notification')
  }
})