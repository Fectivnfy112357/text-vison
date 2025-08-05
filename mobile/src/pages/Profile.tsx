import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  Crown, 
  Heart, 
  Download, 
  Share2, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Edit3, 
  Camera, 
  Award, 
  ChevronRight,
  Palette,
  Lock,
  Key,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useGenerationStore } from '../store/useGenerationStore'
import { toast } from 'sonner'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore()
  const { history } = useGenerationStore()

  // 状态管理
  const [showSettings, setShowSettings] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  })
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
  }, [isAuthenticated])

  // 统计数据
  const stats = React.useMemo(() => {
    const totalGenerations = history.length
    const completedGenerations = history.filter(item => item.status === 'completed').length
    const imageGenerations = history.filter(item => item.type === 'image').length
    const videoGenerations = history.filter(item => item.type === 'video').length
    
    return {
      total: totalGenerations,
      completed: completedGenerations,
      images: imageGenerations,
      videos: videoGenerations,
      successRate: totalGenerations > 0 ? Math.round((completedGenerations / totalGenerations) * 100) : 0
    }
  }, [history])

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB限制
        toast.error('头像文件大小不能超过5MB')
        return
      }
      // 这里应该上传到服务器并更新用户头像
      toast.success('头像上传成功')
    }
  }

  // 处理个人信息更新
  const handleUpdateProfile = async () => {
    try {
      await updateProfile(editForm)
      setIsEditing(false)
      toast.success('个人信息更新成功')
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || error.toString())
    }
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('已安全退出')
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || error.toString())
    }
  }

  // 设置项组件
  const SettingsItem: React.FC<{
    icon: React.ReactNode
    title: string
    description?: string
    value?: string
    onClick?: () => void
    showArrow?: boolean
    danger?: boolean
  }> = ({ icon, title, description, value, onClick, showArrow = true, danger = false }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
        danger ? 'text-red-600' : 'text-gray-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl ${
          danger ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
        <div className="text-left">
          <div className="font-medium">{title}</div>
          {description && (
            <div className="text-sm text-gray-500">{description}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {value && (
          <span className="text-sm text-gray-500">{value}</span>
        )}
        {showArrow && (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </div>
    </button>
  )

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="safe-area-top px-6 py-6 bg-white/80 backdrop-blur-sm border-b border-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-gray-800">个人中心</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft"
          >
            <Settings size={18} className="text-gray-600" />
          </button>
        </div>

        {/* 用户信息卡片 */}
        <motion.div
          className="card-soft p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="text-white" size={24} />
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-1 -right-1 p-1 bg-primary-500 rounded-full cursor-pointer">
                  <Camera size={12} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="用户名"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="邮箱"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
                    {user.isPremium && (
                      <Crown className="text-yellow-500" size={16} />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                  )}
                </div>
              )}
            </div>

            {/* 编辑按钮 */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleUpdateProfile()
                } else {
                  setIsEditing(true)
                }
              }}
              className="p-2 rounded-xl bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
            >
              <Edit3 size={16} />
            </button>
          </div>

          {/* 会员状态 */}
          {user.isPremium ? (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Crown className="text-yellow-500" size={16} />
                <span className="text-sm font-medium text-yellow-700">高级会员</span>
              </div>
              <span className="text-xs text-yellow-600">有效期至 2024-12-31</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/premium')}
              className="w-full p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium flex items-center justify-center space-x-2"
            >
              <Crown size={16} />
              <span>升级高级会员</span>
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-6 py-6 space-y-6">
          {/* 统计数据 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">创作统计</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="card-soft p-4 text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">{stats.total}</div>
                <div className="text-xs text-gray-500">总创作数</div>
              </div>
              <div className="card-soft p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.successRate}%</div>
                <div className="text-xs text-gray-500">成功率</div>
              </div>
              <div className="card-soft p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.images}</div>
                <div className="text-xs text-gray-500">图片生成</div>
              </div>
              <div className="card-soft p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.videos}</div>
                <div className="text-xs text-gray-500">视频生成</div>
              </div>
            </div>
          </motion.div>

          {/* 快捷操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">快捷操作</h3>
            <div className="card-soft divide-y divide-gray-100">
              <SettingsItem
                icon={<Heart size={16} className="text-red-500" />}
                title="我的收藏"
                description="查看收藏的模板和作品"
                onClick={() => navigate('/favorites')}
              />
              <SettingsItem
                icon={<Download size={16} className="text-blue-500" />}
                title="下载记录"
                description="管理已下载的内容"
                onClick={() => navigate('/downloads')}
              />
              <SettingsItem
                icon={<Share2 size={16} className="text-green-500" />}
                title="分享记录"
                description="查看分享的作品"
                onClick={() => navigate('/shares')}
              />
              <SettingsItem
                icon={<Award size={16} className="text-yellow-500" />}
                title="成就徽章"
                description="查看获得的成就"
                onClick={() => navigate('/achievements')}
              />
            </div>
          </motion.div>

          {/* 系统设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">系统设置</h3>
            <div className="card-soft divide-y divide-gray-100">
              <SettingsItem
                icon={<Bell size={16} className="text-blue-500" />}
                title="通知设置"
                description="管理推送和提醒"
                onClick={() => setShowSettings(true)}
              />
              <SettingsItem
                icon={<Shield size={16} className="text-green-500" />}
                title="隐私安全"
                description="账户安全和隐私设置"
                onClick={() => setShowSettings(true)}
              />
              <SettingsItem
                icon={<Palette size={16} className="text-purple-500" />}
                title="外观设置"
                description="主题和显示设置"
                onClick={() => setShowSettings(true)}
              />
              <SettingsItem
                icon={<HelpCircle size={16} className="text-gray-500" />}
                title="帮助中心"
                description="使用指南和常见问题"
                onClick={() => navigate('/help')}
              />
            </div>
          </motion.div>

          {/* 退出登录 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-soft">
              <SettingsItem
                icon={<LogOut size={16} />}
                title="退出登录"
                onClick={() => setShowLogoutConfirm(true)}
                showArrow={false}
                danger
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
          >
            {/* 设置头部 */}
            <div className="safe-area-top px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">设置</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* 设置内容 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* 通知设置 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">通知设置</h3>
                  <div className="card-soft divide-y divide-gray-100">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">推送通知</div>
                        <div className="text-sm text-gray-500">接收应用推送消息</div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.push ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.push ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">邮件通知</div>
                        <div className="text-sm text-gray-500">接收邮件提醒</div>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.email ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 外观设置 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">外观设置</h3>
                  <div className="card-soft divide-y divide-gray-100">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">深色模式</div>
                        <div className="text-sm text-gray-500">使用深色主题</div>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          darkMode ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 隐私安全 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">隐私安全</h3>
                  <div className="card-soft divide-y divide-gray-100">
                    <SettingsItem
                      icon={<Key size={16} className="text-blue-500" />}
                      title="修改密码"
                      description="更改登录密码"
                      onClick={() => navigate('/change-password')}
                    />
                    <SettingsItem
                      icon={<Lock size={16} className="text-green-500" />}
                      title="隐私设置"
                      description="管理个人信息可见性"
                      onClick={() => navigate('/privacy')}
                    />
                    <SettingsItem
                      icon={<Trash2 size={16} className="text-red-500" />}
                      title="删除账户"
                      description="永久删除账户和数据"
                      onClick={() => navigate('/delete-account')}
                      danger
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 退出确认对话框 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">确认退出</h3>
                <p className="text-gray-600 mb-6">确定要退出登录吗？</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                  >
                    退出
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile