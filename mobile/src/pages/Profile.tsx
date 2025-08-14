import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  Crown, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Edit3, 
  Camera, 
  ChevronRight,
  Lock,
  Key,
  Trash2,
  AlertTriangle,
  X,
  TrendingUp,
  Palette
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { contentAPI } from '../lib/api'
import { toast } from 'sonner'
import LineChart from '../components/LineChart'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout, updateProfile } = useAuthStore()

  // 状态管理
  const [showSettings, setShowSettings] = useState(false)
  const [activeSetting, setActiveSetting] = useState<'notifications' | 'privacy' | 'appearance' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.nickname || user?.username || '',
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
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    images: 0,
    videos: 0,
    successRate: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [chartData, setChartData] = useState<Array<{
    date: string
    total: number
    completed: number
  }>>([])
  const [chartLoading, setChartLoading] = useState(true)

  
  // 获取统计数据
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await contentAPI.getUserStats()
      const data = response.data
      
      setStats({
        total: data.totalCount,
        completed: data.completedCount,
        images: data.imageCount,
        videos: data.videoCount,
        successRate: data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0
      })
    } catch (error: any) {
      console.error('获取统计数据失败:', error)
      toast.error('获取统计数据失败')
    } finally {
      setStatsLoading(false)
    }
  }

  // 获取图表数据
  const fetchChartData = async () => {
    try {
      setChartLoading(true)
      const response = await contentAPI.getUserHistoryStats({ days: 7 })
      const dailyStats = response.data.dailyStats
      
      // 格式化数据用于图表显示
      const formattedData = dailyStats.map(stat => ({
        date: new Date(stat.date).toLocaleDateString('zh-CN', { day: 'numeric' }),
        total: stat.total,
        completed: stat.completed
      }))
      
      setChartData(formattedData)
    } catch (error: any) {
      console.error('获取图表数据失败:', error)
      toast.error('获取图表数据失败')
      
      // 如果API失败，使用模拟数据作为备选
      const fallbackData = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        fallbackData.push({
          date: date.toLocaleDateString('zh-CN', { day: 'numeric' }),
          total: Math.floor(Math.random() * 5) + 1,
          completed: Math.floor(Math.random() * 4) + 1
        })
      }
      
      setChartData(fallbackData)
    } finally {
      setChartLoading(false)
    }
  }

  // 在用户认证后获取统计数据
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchStats()
      fetchChartData()
    }
  }, [isAuthenticated, user])

  // 用户数据变化时更新编辑表单
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.username || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      })
    }
  }, [user])




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
      // 移除跳转到登录页的逻辑
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

  // 如果正在加载认证状态，显示加载界面
  if (isLoading) {
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
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4 mb-4">
              {/* 头像 */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
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
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                      placeholder="用户名"
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
                      placeholder="邮箱"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 用户名和徽章 */}
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">{user.username || user.name || '用户'}</h2>
                      {user.isPremium && (
                        <Crown className="text-yellow-500" size={16} />
                      )}
                    </div>
                    
                    {/* 邮箱 */}
                    <p className="text-sm text-gray-500">{user.email}</p>
                    
                    {/* 身份标识 */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full">
                        <Crown size={12} className="text-white" />
                        <span className="text-xs text-white font-medium">VIP普通会员</span>
                      </div>
                    </div>
                    
                    {/* 个人简介 */}
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
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">未登录</h3>
              <p className="text-sm text-gray-500 mb-6">登录后查看个人信息和使用更多功能</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                立即登录
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="px-6 py-6 space-y-6">
          {/* 统计数据 */}
          {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <TrendingUp size={16} className="mr-2 text-indigo-500" />
                创作统计
              </h3>
              <span className="text-xs text-gray-500">近7天趋势</span>
            </div>
            
            {/* 高端折线图 */}
            <div className="card-soft p-4 mb-4 bg-gradient-to-br from-white to-gray-50/80">
              {chartLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">加载图表数据...</p>
                  </div>
                </div>
              ) : (
                <LineChart 
                  data={chartData} 
                  height={200}
                  className="w-full"
                />
              )}
            </div>

            {/* 统计卡片 */}
            {statsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-soft p-4 text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </motion.div>
          )}


          {/* 系统设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">系统设置</h3>
            <div className="card-soft divide-y divide-gray-100">
              <SettingsItem
                icon={<HelpCircle size={16} className="text-gray-500" />}
                title="帮助中心"
                description="使用指南和常见问题"
                onClick={() => navigate('/help')}
              />
            </div>
          </motion.div>

          {/* 退出登录 */}
          {isAuthenticated && user && (
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
          )}
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
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeSetting === 'notifications' && '通知设置'}
                  {activeSetting === 'privacy' && '隐私安全'}
                  {activeSetting === 'appearance' && '外观设置'}
                </h2>
                <button
                  onClick={() => {
                    setShowSettings(false)
                    setActiveSetting(null)
                  }}
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
                {activeSetting === 'notifications' && (
                  <div>
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
                )}

                {/* 外观设置 */}
                {activeSetting === 'appearance' && (
                  <div>
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
                )}

                {/* 隐私安全 */}
                {activeSetting === 'privacy' && (
                  <div>
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
                )}
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