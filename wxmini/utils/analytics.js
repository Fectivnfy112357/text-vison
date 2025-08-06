// utils/analytics.js
// 数据分析工具类

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.userId = null
    this.deviceInfo = null
    this.initDeviceInfo()
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 初始化设备信息
   */
  initDeviceInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.deviceInfo = {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        model: systemInfo.model,
        brand: systemInfo.brand,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        pixelRatio: systemInfo.pixelRatio,
        language: systemInfo.language,
        wifiEnabled: systemInfo.wifiEnabled,
        locationEnabled: systemInfo.locationEnabled,
        bluetoothEnabled: systemInfo.bluetoothEnabled,
        cameraAuthorized: systemInfo.cameraAuthorized,
        locationAuthorized: systemInfo.locationAuthorized,
        microphoneAuthorized: systemInfo.microphoneAuthorized,
        notificationAuthorized: systemInfo.notificationAuthorized,
        albumAuthorized: systemInfo.albumAuthorized
      }
    } catch (error) {
      console.error('获取设备信息失败:', error)
      this.deviceInfo = {}
    }
  }

  /**
   * 设置用户ID
   */
  setUserId(userId) {
    this.userId = userId
  }

  /**
   * 获取基础事件数据
   */
  getBaseEventData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      deviceInfo: this.deviceInfo,
      appVersion: wx.getAccountInfoSync().miniProgram.version || '1.0.0'
    }
  }

  /**
   * 追踪页面浏览
   */
  trackPageView(pageName, params = {}) {
    const eventData = {
      ...this.getBaseEventData(),
      eventType: 'page_view',
      pageName,
      params
    }
    
    this.sendEvent(eventData)
  }

  /**
   * 追踪用户事件
   */
  trackEvent(eventName, params = {}) {
    const eventData = {
      ...this.getBaseEventData(),
      eventType: 'user_action',
      eventName,
      params
    }
    
    this.sendEvent(eventData)
  }

  /**
   * 追踪错误事件
   */
  trackError(error, context = {}) {
    const eventData = {
      ...this.getBaseEventData(),
      eventType: 'error',
      error: {
        message: error.message || error,
        stack: error.stack,
        name: error.name
      },
      context
    }
    
    this.sendEvent(eventData)
  }

  /**
   * 追踪性能数据
   */
  trackPerformance(metricName, value, params = {}) {
    const eventData = {
      ...this.getBaseEventData(),
      eventType: 'performance',
      metricName,
      value,
      params
    }
    
    this.sendEvent(eventData)
  }

  /**
   * 追踪转化事件
   */
  trackConversion(conversionType, params = {}) {
    const eventData = {
      ...this.getBaseEventData(),
      eventType: 'conversion',
      conversionType,
      params
    }
    
    this.sendEvent(eventData)
  }

  /**
   * 发送事件数据
   */
  sendEvent(eventData) {
    try {
      // 本地存储事件数据
      this.storeEventLocally(eventData)
      
      // 发送到服务器
      this.sendToServer(eventData)
      
    } catch (error) {
      console.error('发送分析事件失败:', error)
    }
  }

  /**
   * 本地存储事件数据
   */
  storeEventLocally(eventData) {
    try {
      const storageKey = 'analytics_events'
      let events = wx.getStorageSync(storageKey) || []
      
      events.push(eventData)
      
      // 限制本地存储的事件数量
      if (events.length > 1000) {
        events = events.slice(-1000)
      }
      
      wx.setStorageSync(storageKey, events)
      
    } catch (error) {
      console.error('本地存储事件失败:', error)
    }
  }

  /**
   * 发送到服务器
   */
  sendToServer(eventData) {
    // 这里可以集成第三方分析服务，如微信小程序数据助手、友盟等
    // 或者发送到自己的服务器
    
    wx.request({
      url: 'https://your-analytics-server.com/api/events',
      method: 'POST',
      data: eventData,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // console.log('分析事件发送成功:', res)
      },
      fail: (error) => {
        console.error('分析事件发送失败:', error)
        // 可以考虑重试机制
      }
    })
  }

  /**
   * 批量发送本地存储的事件
   */
  flushEvents() {
    try {
      const storageKey = 'analytics_events'
      const events = wx.getStorageSync(storageKey) || []
      
      if (events.length === 0) {
        return
      }
      
      wx.request({
        url: 'https://your-analytics-server.com/api/events/batch',
        method: 'POST',
        data: { events },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          // 发送成功后清空本地存储
          wx.removeStorageSync(storageKey)
        },
        fail: (error) => {
          console.error('批量发送事件失败:', error)
        }
      })
      
    } catch (error) {
      console.error('批量发送事件失败:', error)
    }
  }

  /**
   * 获取分析报告
   */
  getAnalyticsReport(timeRange = '7d') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://your-analytics-server.com/api/reports',
        method: 'GET',
        data: {
          userId: this.userId,
          timeRange
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('获取分析报告失败'))
          }
        },
        fail: reject
      })
    })
  }
}

// 创建全局实例
const analytics = new Analytics()

// 监听小程序生命周期
wx.onAppShow(() => {
  analytics.trackEvent('app_show')
})

wx.onAppHide(() => {
  analytics.trackEvent('app_hide')
  analytics.flushEvents() // 应用隐藏时发送缓存的事件
})

// 监听错误
wx.onError((error) => {
  analytics.trackError(error, { source: 'global_error_handler' })
})

// 监听未处理的Promise拒绝
wx.onUnhandledRejection((res) => {
  analytics.trackError(res.reason, { 
    source: 'unhandled_rejection',
    promise: res.promise
  })
})

module.exports = {
  analytics
}