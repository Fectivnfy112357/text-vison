
import React from 'react'
import { Button, Swiper, Grid, GridItem, Popup, Toast } from 'react-vant'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store'
import AuthModal from '../../components/common/AuthModal'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useUserStore()
  // @ts-ignore
  const [showAuthModal, setShowAuthModal] = React.useState(false)
  // @ts-ignore
  const [currentBanner, setCurrentBanner] = React.useState(0)

  // 产品介绍轮播数据
  const banners = [
    {
      title: '文生视界',
      subtitle: 'AI驱动的创意生成平台',
      description: '让AI为您的创意插上翅膀，将文字转化为令人惊艳的视觉作品',
      gradient: 'from-purple-600 via-blue-600 to-pink-600',
      icon: '✨'
    },
    {
      title: 'AI智能生成',
      subtitle: '先进的AI技术驱动',
      description: '将您的文字描述转化为精美的视觉作品，释放无限创意潜能',
      gradient: 'from-blue-500 via-purple-500 to-indigo-600',
      icon: '🎨'
    },
    {
      title: '高质量输出',
      subtitle: '专业级别的创作体验',
      description: '生成高分辨率图片和动态视频，满足各种创作需求',
      gradient: 'from-pink-500 via-rose-500 to-purple-600',
      icon: '🚀'
    },
    {
      title: '快速便捷',
      subtitle: '秒级响应，即时创作',
      description: '快速生成精美作品，让创意不再等待，随时随地开始创作',
      gradient: 'from-green-500 via-teal-500 to-blue-600',
      icon: '⚡'
    }
  ]

  // 功能特色数据 - 垂直布局适配小屏幕
  const features = [
    {
      title: 'AI图片生成',
      description: '文字描述生成精美图片',
      icon: '🎨',
      color: 'from-purple-400 to-blue-500',
      action: () => handleFeatureClick('/generate')
    },
    {
      title: 'AI视频生成',
      description: '创意文案生成动态视频',
      icon: '🎬',
      color: 'from-pink-400 to-purple-500',
      action: () => handleFeatureClick('/generate')
    },
    {
      title: '模板库',
      description: '丰富的创作模板',
      icon: '📚',
      color: 'from-blue-400 to-indigo-500',
      action: () => handleFeatureClick('/templates')
    },
    {
      title: '生成历史',
      description: '管理你的创作记录',
      icon: '📝',
      color: 'from-green-400 to-teal-500',
      action: () => handleFeatureClick('/history')
    }
  ]

  // 统计数据
  const stats = [
    { number: '10,000+', label: '创作作品' },
    { number: '5,000+', label: '活跃用户' },
    { number: '99%', label: '用户满意度' }
  ]

  // 处理功能点击
  const handleFeatureClick = (path: string) => {
    if (!isAuthenticated && (path === '/generate' || path === '/history')) {
      setShowAuthModal(true)
      return
    }
    navigate(path)
  }

  // 处理快速生成点击
  const handleQuickGenerate = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    navigate('/generate')
  }

  // 处理登录注册
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    Toast.success('登录成功！')
  }

  // 轮播自动切换
  // @ts-ignore
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 产品介绍轮播区域 */}
      <div className="mb-6">
        <Swiper 
          autoplay={4000} 
          className="rounded-none"
          onChange={(index) => setCurrentBanner(index)}
        >
          {banners.map((banner, index) => (
            <div 
              key={index} 
              className={`h-56 bg-gradient-to-br ${banner.gradient} flex flex-col justify-center items-center text-white px-6 relative overflow-hidden`}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-4 right-4 text-4xl opacity-20">
                {banner.icon}
              </div>
              
              {/* 内容 */}
              <div className="relative z-10 text-center">
                <div className="text-3xl mb-2">{banner.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
                <p className="text-lg opacity-90 mb-2">{banner.subtitle}</p>
                <p className="text-sm opacity-80 leading-relaxed max-w-xs">
                  {banner.description}
                </p>
              </div>
              
              {/* 指示器 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentBanner ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </Swiper>
      </div>

      <div className="px-4">
        {/* 用户登录注册入口 - 大按钮设计 */}
        {!isAuthenticated ? (
          <div className="mb-6">
            <Button 
              type="primary" 
              size="large" 
              block
              className="h-16 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 border-none shadow-lg"
              onClick={() => setShowAuthModal(true)}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">👋</span>
                <span>登录 / 注册</span>
              </div>
            </Button>
            <p className="text-center text-sm text-gray-500 mt-2">
              登录后解锁全部功能
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="mobile-card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0) || '用'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    欢迎回来，{user?.name || '用户'}！
                  </h3>
                  <p className="text-sm text-gray-600">继续您的创作之旅</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 快速生成入口 */}
        <div className="mb-6">
          <Button 
            type="primary" 
            size="large" 
            block
            className="h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 border-none shadow-md"
            onClick={handleQuickGenerate}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">🚀</span>
              <span>开始创作</span>
            </div>
          </Button>
        </div>

        {/* 功能特色展示卡片 - 垂直布局适配小屏幕 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">✨</span>
            功能特色
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className="mobile-card cursor-pointer hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 统计数据展示 */}
        <div className="mb-6">
          <div className="mobile-card bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <h3 className="text-lg font-semibold mb-4 text-center">平台数据</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-2xl font-bold">{stat.number}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 新用户指南 */}
        <div className="mobile-card mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📖</span>
            新用户指南
          </h3>
          <div className="space-y-4">
            {[
              { step: 1, text: '输入创意描述', detail: '用文字描述您想要的图片或视频' },
              { step: 2, text: '选择生成类型和风格', detail: '选择图片或视频，设置尺寸和艺术风格' },
              { step: 3, text: '等待AI生成精美作品', detail: '几秒钟后即可获得专业级作品' }
            ].map((guide, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {guide.step}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{guide.text}</div>
                  <div className="text-sm text-gray-600 mt-1">{guide.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部CTA */}
        <div className="mobile-card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 text-center mb-8">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            准备好释放您的创造力了吗？
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            加入文生视界，开启您的AI创作之旅
          </p>
          <Button 
            type="primary" 
            size="large"
            className="bg-gradient-to-r from-purple-500 to-blue-500 border-none shadow-md"
            onClick={handleQuickGenerate}
          >
            立即开始创作
          </Button>
        </div>
      </div>

      {/* 登录注册弹窗 */}
      <AuthModal 
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default Home