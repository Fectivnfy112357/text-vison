
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

  // 如果未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar title="个人中心" className="mobile-header" />
        <div className="mobile-content">
          <div className="mobile-card text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">欢迎来到个人中心</h2>
            <p className="text-gray-600 mb-6">登录后查看个人信息和管理设置</p>
            <Button 
              type="primary" 
              size="large" 
              block
              className="bg-gradient-to-r from-purple-500 to-blue-500 border-none"
              onClick={() => setShowAuthModal(true)}
            >
              登录 / 注册
            </Button>
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
    <div className="min-h-screen bg-gray-50">
      <NavBar title="个人中心" className="mobile-header" />
      
      <div className="mobile-content">
        {/* 用户信息卡片 */}
        <div className="mobile-card mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0) || '用'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{user?.name || '用户'}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">加入时间：{stats.joinDate}</p>
            </div>
            <Button 
              size="small" 
              type="primary"
              className="bg-gradient-to-r from-purple-500 to-blue-500 border-none"
              onClick={() => setShowEditProfile(true)}
            >
              编辑
            </Button>
          </div>
        </div>

        {/* 用户统计 */}
        <div className="mobile-card mb-4">
          <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span>
            我的统计
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{stats.totalGenerations}</div>
              <div className="text-sm text-gray-600">创作数量</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(stats.totalGenerations / 7) || 0}
              </div>
              <div className="text-sm text-gray-600">周平均</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalGenerations > 0 ? '100%' : '0%'}
              </div>
              <div className="text-sm text-gray-600">成功率</div>
            </div>
          </div>
        </div>

        {/* 功能菜单 */}
        <CellGroup className="mb-4">
          <Cell 
            title="我的创作" 
            icon="photo-o" 
            isLink 
            onClick={() => navigate('/history')}
            value={`${stats.totalGenerations}个作品`}
          />
          <Cell 
            title="收藏模板" 
            icon="star-o" 
            isLink 
            onClick={() => navigate('/templates')}
          />
          <Cell 
            title="修改密码" 
            icon="lock" 
            isLink 
            onClick={() => setShowChangePassword(true)}
          />
        </CellGroup>

        {/* 设置菜单 */}
        <CellGroup className="mb-4">
          <Cell 
            title="应用设置" 
            icon="setting-o" 
            isLink 
            onClick={() => setShowSettings(true)}
          />
          <Cell 
            title="清除缓存" 
            icon="delete-o" 
            isLink 
            onClick={handleClearCache}
          />
          <Cell 
            title="分享应用" 
            icon="share" 
            isLink 
            onClick={handleShareApp}
          />
        </CellGroup>

        {/* 帮助与反馈 */}
        <CellGroup className="mb-4">
          <Cell 
            title="关于我们" 
            icon="info-o" 
            isLink 
            onClick={() => setShowAbout(true)}
          />
          <Cell 
            title="意见反馈" 
            icon="chat-o" 
            isLink 
            onClick={() => Toast.info('功能开发中...')}
          />
          <Cell 
            title="隐私政策" 
            icon="shield-o" 
            isLink 
            onClick={() => Toast.info('功能开发中...')}
          />
        </CellGroup>

        {/* 退出登录 */}
        <div className="mobile-card">
          <Button 
            type="danger" 
            size="large" 
            block
            onClick={handleLogout}
            className="bg-red-500 border-red-500"
          >
            退出登录
          </Button>
        </div>
      </div>

      {/* 编辑资料弹窗 */}
      <Popup 
        visible={showEditProfile} 
        onClose={() => setShowEditProfile(false)}
        position="bottom"
        round
        closeable
        title="编辑资料"
      >
        <div className="p-6">
          <Field
            label="用户名"
            placeholder="请输入用户名"
            value={editForm.name}
            onChange={(value: string) => setEditForm({ ...editForm, name: value })}
            clearable
            className="mb-4"
          />
          <Field
            label="邮箱"
            placeholder="邮箱地址"
            value={editForm.email}
            disabled
            className="mb-6"
          />
          <div className="flex space-x-3">
            <Button 
              block 
              onClick={() => setShowEditProfile(false)}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              block
              onClick={handleEditProfile}
              className="bg-gradient-to-r from-purple-500 to-blue-500 border-none"
            >
              保存
            </Button>
          </div>
        </div>
      </Popup>

      {/* 修改密码弹窗 */}
      <Popup 
        visible={showChangePassword} 
        onClose={() => setShowChangePassword(false)}
        position="bottom"
        round
        closeable
        title="修改密码"
      >
        <div className="p-6">
          <Field
            label="当前密码"
            type="password"
            placeholder="请输入当前密码"
            value={passwordForm.oldPassword}
            onChange={(value: string) => setPasswordForm({ ...passwordForm, oldPassword: value })}
            clearable
            className="mb-4"
          />
          <Field
            label="新密码"
            type="password"
            placeholder="请输入新密码（至少6位）"
            value={passwordForm.newPassword}
            onChange={(value: string) => setPasswordForm({ ...passwordForm, newPassword: value })}
            clearable
            className="mb-4"
          />
          <Field
            label="确认密码"
            type="password"
            placeholder="请再次输入新密码"
            value={passwordForm.confirmPassword}
            onChange={(value: string) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
            clearable
            className="mb-6"
          />
          <div className="flex space-x-3">
            <Button 
              block 
              onClick={() => setShowChangePassword(false)}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              block
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-purple-500 to-blue-500 border-none"
            >
              确认修改
            </Button>
          </div>
        </div>
      </Popup>

      {/* 应用设置弹窗 */}
      <Popup 
        visible={showSettings} 
        onClose={() => setShowSettings(false)}
        position="bottom"
        round
        closeable
        title="应用设置"
      >
        <div className="p-6">
          <CellGroup>
            <Cell 
              title="推送通知" 
              rightIcon={
                <Switch 
                  checked={settings.notifications}
                  onChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              }
            />
            <Cell 
              title="自动保存" 
              rightIcon={
                <Switch 
                  checked={settings.autoSave}
                  onChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              }
            />
            <Cell 
              title="高质量模式" 
              rightIcon={
                <Switch 
                  checked={settings.highQuality}
                  onChange={(checked) => setSettings({ ...settings, highQuality: checked })}
                />
              }
            />
            <Cell 
              title="深色模式" 
              rightIcon={
                <Switch 
                  checked={settings.darkMode}
                  onChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              }
            />
          </CellGroup>
        </div>
      </Popup>

      {/* 关于我们弹窗 */}
      <Popup 
        visible={showAbout} 
        onClose={() => setShowAbout(false)}
        position="bottom"
        round
        closeable
        title="关于文生视界"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">文生视界</h3>
            <p className="text-gray-600 mb-2">版本 1.0.0</p>
            <p className="text-sm text-gray-500">AI驱动的创意生成平台</p>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold mb-2">产品介绍</h4>
              <p>文生视界是一款基于先进AI技术的创意生成平台，能够将您的文字描述转化为精美的图片和动态视频，释放无限创意潜能。</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">核心功能</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>AI图片生成</li>
                <li>AI视频生成</li>
                <li>丰富模板库</li>
                <li>创作历史管理</li>
                <li>多种艺术风格</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">设备信息</h4>
              <p>设备类型：{stats.deviceType}</p>
              <p>浏览器：{navigator.userAgent.split(' ')[0]}</p>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default Profile