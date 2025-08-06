// pages/account/account.js
const app = getApp()
const { auth } = require('../../api/index.js')
const { utils } = require('../../utils/utils.js')
const { analytics } = require('../../utils/analytics.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 加载状态
    loading: false,
    
    // 用户信息
    userInfo: null,
    
    // 密码修改相关
    showPasswordModal: false,
    passwordForm: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    
    // 密码显示状态
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    
    // 账号设置选项
    accountItems: [
      {
        id: 'password',
        title: '修改密码',
        icon: 'lock',
        desc: '定期修改密码保护账号安全',
        action: 'changePassword'
      },
      {
        id: 'phone',
        title: '手机号码',
        icon: 'phone',
        desc: '用于登录和找回密码',
        value: '',
        action: 'bindPhone'
      },
      {
        id: 'email',
        title: '邮箱地址',
        icon: 'email',
        desc: '用于接收重要通知',
        value: '',
        action: 'bindEmail'
      },
      {
        id: 'wechat',
        title: '微信绑定',
        icon: 'wechat',
        desc: '已绑定当前微信账号',
        value: '已绑定',
        action: 'unbindWechat'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo()
    
    // 记录页面访问
    analytics.trackPageView('account', {
      source: options.source || 'direct'
    })
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      this.setData({ loading: true })
      
      const userInfo = app.globalData.userInfo
      if (userInfo) {
        this.setData({ userInfo })
        this.updateAccountItems(userInfo)
      }
      
    } catch (error) {
      console.error('加载用户信息失败:', error)
      utils.showToast('加载失败，请重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 更新账号设置项
   */
  updateAccountItems(userInfo) {
    const accountItems = this.data.accountItems.map(item => {
      if (item.id === 'phone') {
        item.value = userInfo.phone || '未绑定'
      } else if (item.id === 'email') {
        item.value = userInfo.email || '未绑定'
      }
      return item
    })
    
    this.setData({ accountItems })
  },

  /**
   * 账号设置项点击
   */
  onAccountItemTap(e) {
    const { item } = e.currentTarget.dataset
    
    if (item.action) {
      this.handleAccountAction(item.action)
    }
    
    analytics.trackEvent('account_item_tap', {
      item_id: item.id,
      item_title: item.title
    })
  },

  /**
   * 处理账号操作
   */
  handleAccountAction(action) {
    switch (action) {
      case 'changePassword':
        this.showChangePasswordModal()
        break
      case 'bindPhone':
        this.bindPhone()
        break
      case 'bindEmail':
        this.bindEmail()
        break
      case 'unbindWechat':
        this.unbindWechat()
        break
    }
  },

  /**
   * 显示修改密码弹窗
   */
  showChangePasswordModal() {
    this.setData({
      showPasswordModal: true,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
    })
  },

  /**
   * 隐藏修改密码弹窗
   */
  hideChangePasswordModal() {
    this.setData({ showPasswordModal: false })
  },

  /**
   * 密码输入
   */
  onPasswordInput(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`passwordForm.${field}`]: value
    })
  },

  /**
   * 切换密码显示状态
   */
  togglePasswordShow(e) {
    const { field } = e.currentTarget.dataset
    const showField = `show${field.charAt(0).toUpperCase() + field.slice(1)}`
    
    this.setData({
      [showField]: !this.data[showField]
    })
  },

  /**
   * 提交密码修改
   */
  async submitPasswordChange() {
    const { passwordForm } = this.data
    
    // 验证输入
    if (!passwordForm.oldPassword) {
      utils.showToast('请输入当前密码')
      return
    }
    
    if (!passwordForm.newPassword) {
      utils.showToast('请输入新密码')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      utils.showToast('新密码至少6位')
      return
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      utils.showToast('两次输入的密码不一致')
      return
    }
    
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      utils.showToast('新密码不能与当前密码相同')
      return
    }
    
    try {
      const result = await auth.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      
      if (result.success) {
        utils.showToast('密码修改成功')
        this.hideChangePasswordModal()
        
        // 记录操作
        analytics.trackEvent('password_change_success')
        
        // 提示重新登录
        setTimeout(() => {
          wx.showModal({
            title: '密码修改成功',
            content: '为了账号安全，请重新登录',
            showCancel: false,
            success: () => {
              // 清除登录状态
              app.setToken(null)
              app.setUserInfo(null)
              
              // 跳转到登录页
              wx.reLaunch({
                url: '/pages/login/login'
              })
            }
          })
        }, 1000)
      }
      
    } catch (error) {
      console.error('修改密码失败:', error)
      utils.showToast(error.message || '修改失败，请重试')
      
      analytics.trackEvent('password_change_error', {
        error: error.message
      })
    }
  },

  /**
   * 绑定手机号
   */
  bindPhone() {
    utils.showToast('功能开发中')
  },

  /**
   * 绑定邮箱
   */
  bindEmail() {
    utils.showToast('功能开发中')
  },

  /**
   * 解绑微信
   */
  unbindWechat() {
    wx.showModal({
      title: '解绑微信',
      content: '解绑后将无法使用微信登录，确定要解绑吗？',
      success: (res) => {
        if (res.confirm) {
          utils.showToast('功能开发中')
        }
      }
    })
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack()
  }
})