
import * as React from 'react'
import { 
  NavBar, 
  Cell, 
  CellGroup, 
  Button, 
  Toast, 
  Dialog, 
  Field, 
  Popup,
  Switch,
  ActionSheet
} from 'react-vant'
import { useNavigate } from 'react-router-dom'
import { useUserStore, useMobileStore, useGenerationStore } from '../../store'
import AuthModal from '../../components/common/AuthModal'
import { shareContent, copyToClipboard, getDeviceInfo } from '../../utils'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUserStore()
  const { deviceInfo } = useMobileStore()
  const { history } = useGenerationStore()
  
  // @ts-ignore
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  // @ts-ignore
  const [showEditProfile, setShowEditProfile] = React.useState(false)
  // @ts-ignore
  const [showChangePassword, setShowChangePassword] = React.useState(false)
  // @ts-ignore
  const [showSettings, setShowSettings] = React.useState(false)
  // @ts-ignore
  const [showAbout, setShowAbout] = React.useState(false)
  
  // 编辑资料表单
  // @ts-ignore
  const [editForm, setEditForm] = React.useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  
  // 修改密码表单
  // @ts-ignore
  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 设置选项
  // @ts-ignore
  const [settings, setSettings] = React.useState({
    notifications: true,
    autoSave: true,
    highQuality: false,
    darkMode: false
  })

  // 处理登录成功
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    Toast.success('登录成功！')
  }

  // 处理退出登录
  const handleLogout = () => {
    Dialog.confirm({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    }).then(() => {
      logout()
      Toast.success('已退出登录')
      navigate('/home')
    }).catch(() => {
      // 用户取消
    })
  }

  // 处理编辑资料
  const handleEditProfile = async () => {
    if (!editForm.name.trim()) {
      Toast.fail('用户名不能为空')
      return
    }

    try {
      const { authAPI } = await import('../../lib/api')
      await authAPI.updateProfile(editForm.name.trim())
      Toast.success('资料更新成功')
      setShowEditProfile(false)
      // 这里应该更新用户状态，但由于API限制，暂时跳过
    } catch (error) {
      console.error('更新资料失败:', error)
      Toast.fail(error instanceof Error ? error.message : '更新失败，请重试')
    }
  }

  // 处理修改密码
  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Toast.fail('请填写完整信息')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      Toast.fail('新密码长度至少6位')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.fail('两次输入的密码不一致')
      return
    }

    try {
      const { authAPI } = await import('../../lib/api')
      await authAPI.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      Toast.success('密码修改成功')
      setShowChangePassword(false)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('修改密码失败:', error)
      Toast.fail(error instanceof Error ? error.message : '修改失败，请重试')
    }
  }

  // 分享应用
  const handleShareApp = async () => {
    const shareData = {
      title: '文生视界 - AI创作平台',
      text: '发现文生视界，让AI为您的创意插上翅膀！',
      url: window.location.origin
    }

    const success = await shareContent(shareData)
    if (success) {
      Toast.success('分享成功')
    } else {
      // 降级方案：复制链接
      const copied = await copyToClipboard(shareData.url)
      if (copied) {
        Toast.success('链接已复制到剪贴板')
      } else {
        Toast.fail('分享失败')
      }
    }
  }

  // 清除缓存
  const handleClearCache = () => {
    Dialog.confirm({
      title: '清除缓存',
      message: '确定要清除所有缓存数据吗？这将删除本地保存的模板和历史记录缓存。',
      confirmButtonText: '清除',
      cancelButtonText: '取消',
    }).then(() => {
      // 清除localStorage中的缓存
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('mobile_api_cache_') || key.includes('template') || key.includes('generation')) {
          localStorage.removeItem(key)
        }
      })
      Toast.success('缓存已清除')
    }).catch(() => {
      // 用户取消
    })
  }

  // 获取用户统计信息
  const getUserStats = () => {
    return {
      totalGenerations: history.length,
      joinDate: user ? new Date(user.id).toLocaleDateString() : '未知',
      deviceType: deviceInfo?.platform || '未知设备'
    }
  }

  const stats = getUserStats()

  // 如果未登录，显示登录提示 - 果冻感设计
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <NavBar 
          title={
            <div className="flex items-center">
              <span className="mr-2 text-xl animate-bounce-soft">👤</span>
              <span className="font-bold text-mist-800">个人中心</span>
            </div>
          }
          className="mobile-header backdrop-blur-md bg-white/80 border-b border-mist-200/50"
        />
        <div className="mobile-content">
          <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-mist-200 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-bold mb-3 text-mist-800">欢迎来到个人中心</h2>
            <p className="text-mist-600 mb-8">登录后查看个人信息和管理设置</p>
            <button
              className="w-full px-6 py-4 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-xl font-bold shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowAuthModal(true)}
            >
              <span className="mr-2">✨</span>
              登录 / 注册
            </button>
          </div>
        </div>
        
        <AuthModal 
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      <NavBar 
        title={
          <div className="flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">👤</span>
            <span className="font-bold text-mist-800">个人中心</span>
          </div>
        }
        className="mobile-header backdrop-blur-md bg-white/80 border-b border-mist-200/50"
      />
      
      <div className="mobile-content">
        {/* 用户信息卡片 - 果冻感设计 */}
        <div className="mobile-card mb-6 backdrop-blur-md bg-gradient-to-r from-mist-100/80 to-sky-100/80 border border-mist-200/50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-mist-500 to-sky-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-jelly animate-pulse">
              {user?.name?.charAt(0) || '用'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-mist-800">{user?.name || '用户'}</h3>
              <p className="text-sm text-mist-600 bg-white/60 px-2 py-1 rounded-lg inline-block mt-1">{user?.email}</p>
              <p className="text-xs text-mist-500 mt-2 flex items-center">
                <span className="mr-1">📅</span>
                加入时间：{stats.joinDate}
              </p>
            </div>
            <button
              className="px-4 py-2 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-xl font-medium shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowEditProfile(true)}
            >
              编辑
            </button>
          </div>
        </div>

        {/* 用户统计 - 果冻感设计 */}
        <div className="mobile-card mb-6 backdrop-blur-md bg-white/80 border border-mist-200/50">
          <h4 className="text-lg font-bold mb-6 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">📊</span>
            我的统计
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-mist-100/80 to-sky-100/80 rounded-xl p-4 border border-mist-200/50 shadow-soft">
              <div className="text-2xl font-bold text-mist-600 mb-1">{stats.totalGenerations}</div>
              <div className="text-sm text-mist-500 font-medium">创作数量</div>
            </div>
            <div className="bg-gradient-to-br from-sky-100/80 to-blue-100/80 rounded-xl p-4 border border-sky-200/50 shadow-soft">
              <div className="text-2xl font-bold text-sky-600 mb-1">
                {Math.floor(stats.totalGenerations / 7) || 0}
              </div>
              <div className="text-sm text-sky-500 font-medium">周平均</div>
            </div>
            <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 rounded-xl p-4 border border-green-200/50 shadow-soft">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.totalGenerations > 0 ? '100%' : '0%'}
              </div>
              <div className="text-sm text-green-500 font-medium">成功率</div>
            </div>
          </div>
        </div>

        {/* 功能菜单 - 果冻感设计 */}
        <div className="mobile-card mb-6 backdrop-blur-md bg-white/80 border border-mist-200/50">
          <h4 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">🎨</span>
            我的创作
          </h4>
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-mist-100/80 to-sky-100/80 rounded-xl border border-mist-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => navigate('/history')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">📸</span>
                <span className="font-medium text-mist-800">我的创作</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-mist-600 bg-white/60 px-2 py-1 rounded-lg mr-2">{stats.totalGenerations}个作品</span>
                <span className="text-mist-500">›</span>
              </div>
            </button>
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-100/80 to-orange-100/80 rounded-xl border border-yellow-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => navigate('/templates')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">⭐</span>
                <span className="font-medium text-mist-800">收藏模板</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-100/80 to-pink-100/80 rounded-xl border border-purple-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowChangePassword(true)}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">🔒</span>
                <span className="font-medium text-mist-800">修改密码</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
          </div>
        </div>

        {/* 设置菜单 - 果冻感设计 */}
        <div className="mobile-card mb-6 backdrop-blur-md bg-white/80 border border-mist-200/50">
          <h4 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">⚙️</span>
            应用设置
          </h4>
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-100/80 to-sky-100/80 rounded-xl border border-blue-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowSettings(true)}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">🛠️</span>
                <span className="font-medium text-mist-800">应用设置</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-100/80 to-pink-100/80 rounded-xl border border-red-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={handleClearCache}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">🗑️</span>
                <span className="font-medium text-mist-800">清除缓存</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-xl border border-green-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={handleShareApp}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">📤</span>
                <span className="font-medium text-mist-800">分享应用</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
          </div>
        </div>

        {/* 帮助与反馈 - 果冻感设计 */}
        <div className="mobile-card mb-6 backdrop-blur-md bg-white/80 border border-mist-200/50">
          <h4 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">💬</span>
            帮助与反馈
          </h4>
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 rounded-xl border border-indigo-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowAbout(true)}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">ℹ️</span>
                <span className="font-medium text-mist-800">关于我们</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-100/80 to-cyan-100/80 rounded-xl border border-teal-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => Toast.info('功能开发中...')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">💭</span>
                <span className="font-medium text-mist-800">意见反馈</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
            <button
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-100/80 to-slate-100/80 rounded-xl border border-gray-200/50 shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => Toast.info('功能开发中...')}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">🛡️</span>
                <span className="font-medium text-mist-800">隐私政策</span>
              </div>
              <span className="text-mist-500">›</span>
            </button>
          </div>
        </div>

        {/* 退出登录 - 果冻感设计 */}
        <div className="mobile-card backdrop-blur-md bg-white/80 border border-red-200/50">
          <button
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
            onClick={handleLogout}
          >
            <span className="mr-2 text-xl">🚪</span>
            退出登录
          </button>
        </div>
      </div>

      {/* 编辑资料弹窗 - 果冻感设计 */}
      <Popup 
        visible={showEditProfile} 
        onClose={() => setShowEditProfile(false)}
        position="bottom"
        round
        closeable
        title={
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">✏️</span>
            <span className="font-bold text-mist-800">编辑资料</span>
          </div>
        }
        className="backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="p-6 bg-gradient-to-br from-cream-50/80 to-mist-50/80">
          <div className="mb-4">
            <label className="block text-sm font-medium text-mist-700 mb-2">用户名</label>
            <input
              type="text"
              placeholder="请输入用户名"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/80 border border-mist-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-mist-400/50 transition-all duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-mist-700 mb-2">邮箱</label>
            <input
              type="email"
              placeholder="邮箱地址"
              value={editForm.email}
              disabled
              className="w-full px-4 py-3 bg-gray-100/80 border border-gray-200/50 rounded-xl text-gray-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowEditProfile(false)}
            >
              取消
            </button>
            <button
              className="flex-1 px-6 py-3 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-xl font-medium shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={handleEditProfile}
            >
              保存
            </button>
          </div>
        </div>
      </Popup>

      {/* 修改密码弹窗 - 果冻感设计 */}
      <Popup 
        visible={showChangePassword} 
        onClose={() => setShowChangePassword(false)}
        position="bottom"
        round
        closeable
        title={
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">🔒</span>
            <span className="font-bold text-mist-800">修改密码</span>
          </div>
        }
        className="backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="p-6 bg-gradient-to-br from-cream-50/80 to-mist-50/80">
          <div className="mb-4">
            <label className="block text-sm font-medium text-mist-700 mb-2">当前密码</label>
            <input
              type="password"
              placeholder="请输入当前密码"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/80 border border-mist-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-mist-400/50 transition-all duration-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-mist-700 mb-2">新密码</label>
            <input
              type="password"
              placeholder="请输入新密码（至少6位）"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/80 border border-mist-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-mist-400/50 transition-all duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-mist-700 mb-2">确认密码</label>
            <input
              type="password"
              placeholder="请再次输入新密码"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/80 border border-mist-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-mist-400/50 transition-all duration-300"
            />
          </div>
          <div className="flex space-x-3">
            <button
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setShowChangePassword(false)}
            >
              取消
            </button>
            <button
              className="flex-1 px-6 py-3 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-xl font-medium shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={handleChangePassword}
            >
              确认修改
            </button>
          </div>
        </div>
      </Popup>

      {/* 应用设置弹窗 - 果冻感设计 */}
      <Popup 
        visible={showSettings} 
        onClose={() => setShowSettings(false)}
        position="bottom"
        round
        closeable
        title={
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">⚙️</span>
            <span className="font-bold text-mist-800">应用设置</span>
          </div>
        }
        className="backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="p-6 bg-gradient-to-br from-cream-50/80 to-mist-50/80">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-mist-200/50 shadow-soft">
              <div className="flex items-center">
                <span className="mr-3 text-xl">🔔</span>
                <span className="font-medium text-mist-800">推送通知</span>
              </div>
              <Switch 
                checked={settings.notifications}
                onChange={(checked) => setSettings({ ...settings, notifications: checked })}
                className="text-mist-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-mist-200/50 shadow-soft">
              <div className="flex items-center">
                <span className="mr-3 text-xl">💾</span>
                <span className="font-medium text-mist-800">自动保存</span>
              </div>
              <Switch 
                checked={settings.autoSave}
                onChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                className="text-mist-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-mist-200/50 shadow-soft">
              <div className="flex items-center">
                <span className="mr-3 text-xl">✨</span>
                <span className="font-medium text-mist-800">高质量模式</span>
              </div>
              <Switch 
                checked={settings.highQuality}
                onChange={(checked) => setSettings({ ...settings, highQuality: checked })}
                className="text-mist-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-mist-200/50 shadow-soft">
              <div className="flex items-center">
                <span className="mr-3 text-xl">🌙</span>
                <span className="font-medium text-mist-800">深色模式</span>
              </div>
              <Switch 
                checked={settings.darkMode}
                onChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                className="text-mist-500"
              />
            </div>
          </div>
        </div>
      </Popup>

      {/* 关于我们弹窗 - 果冻感设计 */}
      <Popup 
        visible={showAbout} 
        onClose={() => setShowAbout(false)}
        position="bottom"
        round
        closeable
        title={
          <div className="flex items-center justify-center">
            <span className="mr-2 text-xl">ℹ️</span>
            <span className="font-bold text-mist-800">关于文生视界</span>
          </div>
        }
        className="backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="p-6 bg-gradient-to-br from-cream-50/80 to-mist-50/80">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-mist-200 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-4xl">✨</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-mist-800">文生视界</h3>
            <p className="text-mist-600 mb-2 bg-white/60 px-3 py-1 rounded-lg inline-block">版本 1.0.0</p>
            <p className="text-sm text-mist-500">AI驱动的创意生成平台</p>
          </div>
          
          <div className="space-y-6 text-sm">
            <div className="bg-white/80 rounded-xl p-4 border border-mist-200/50 shadow-soft">
              <h4 className="font-bold mb-3 text-mist-800 flex items-center">
                <span className="mr-2">📖</span>
                产品介绍
              </h4>
              <p className="text-mist-600 leading-relaxed">文生视界是一款基于先进AI技术的创意生成平台，能够将您的文字描述转化为精美的图片和动态视频，释放无限创意潜能。</p>
            </div>
            
            <div className="bg-white/80 rounded-xl p-4 border border-mist-200/50 shadow-soft">
              <h4 className="font-bold mb-3 text-mist-800 flex items-center">
                <span className="mr-2">🎯</span>
                核心功能
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-mist-600">
                  <span className="mr-2">🖼️</span>
                  <span>AI图片生成</span>
                </div>
                <div className="flex items-center text-mist-600">
                  <span className="mr-2">🎬</span>
                  <span>AI视频生成</span>
                </div>
                <div className="flex items-center text-mist-600">
                  <span className="mr-2">📚</span>
                  <span>丰富模板库</span>
                </div>
                <div className="flex items-center text-mist-600">
                  <span className="mr-2">📝</span>
                  <span>创作历史管理</span>
                </div>
                <div className="flex items-center text-mist-600">
                  <span className="mr-2">🎨</span>
                  <span>多种艺术风格</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 rounded-xl p-4 border border-mist-200/50 shadow-soft">
              <h4 className="font-bold mb-3 text-mist-800 flex items-center">
                <span className="mr-2">📱</span>
                设备信息
              </h4>
              <div className="space-y-2 text-mist-600">
                <p className="flex items-center">
                  <span className="mr-2">💻</span>
                  设备类型：{stats.deviceType}
                </p>
                <p className="flex items-center">
                  <span className="mr-2">🌐</span>
                  浏览器：{navigator.userAgent.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default Profile