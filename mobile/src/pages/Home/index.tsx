
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
    <div className="min-h-screen">
      {/* 产品介绍轮播区域 - 果冻感设计 */}
      <div className="mb-8">
        <Swiper 
          autoplay={4000} 
          className="rounded-none"
          onChange={(index) => setCurrentBanner(index)}
        >
          {banners.map((banner, index) => (
            <div 
              key={index} 
              className="h-64 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(177, 151, 252, 0.8) 0%, rgba(125, 211, 252, 0.6) 50%, rgba(254, 254, 254, 0.9) 100%)`
              }}
            >
              {/* 背景装饰 - 柔和圆形 */}
              <div className="absolute inset-0">
                <div className="absolute top-8 right-8 w-24 h-24 bg-white/20 rounded-full animate-float" />
                <div className="absolute bottom-12 left-8 w-16 h-16 bg-mist-300/30 rounded-full animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-sky-300/40 rounded-full animate-float" style={{ animationDelay: '4s' }} />
              </div>
              
              {/* 内容 */}
              <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-8">
                <div className="text-4xl mb-4 animate-bounce-soft">{banner.icon}</div>
                <h2 className="text-2xl font-bold mb-3 text-mist-800">{banner.title}</h2>
                <p className="text-lg text-mist-600 mb-3 font-medium">{banner.subtitle}</p>
                <p className="text-sm text-mist-500 leading-relaxed max-w-xs opacity-90">
                  {banner.description}
                </p>
              </div>
              
              {/* 指示器 - 果冻感设计 */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {banners.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      i === currentBanner 
                        ? 'bg-white shadow-jelly scale-125' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    style={{
                      animation: i === currentBanner ? 'pulse-soft 2s infinite' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </Swiper>
      </div>

      <div className="px-4">
        {/* 用户登录注册入口 - 果冻感大按钮设计 */}
        {!isAuthenticated ? (
          <div className="mb-8">
            <button 
              className="w-full h-20 rounded-3xl font-semibold text-lg text-white relative overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #b197fc 0%, #7dd3fc 100%)',
                boxShadow: '0 12px 40px rgba(177, 151, 252, 0.4)'
              }}
              onClick={() => setShowAuthModal(true)}
            >
              {/* 背景动画装饰 */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-2 right-4 w-8 h-8 bg-white/20 rounded-full animate-float" />
              <div className="absolute bottom-3 left-6 w-4 h-4 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
              
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <span className="text-2xl animate-bounce-soft">👋</span>
                <span>登录 / 注册</span>
              </div>
            </button>
            <p className="text-center text-sm text-mist-500 mt-3 font-medium">
              登录后解锁全部功能
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="mobile-card bg-gradient-to-r from-mist-50/80 to-sky-50/80 border-mist-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-mist-500 to-sky-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-jelly">
                  {user?.name?.charAt(0) || '用'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-mist-800 text-lg">
                    欢迎回来，{user?.name || '用户'}！
                  </h3>
                  <p className="text-sm text-mist-600 mt-1">继续您的创作之旅</p>
                </div>
                <div className="w-6 h-6 bg-gradient-to-r from-mist-400 to-sky-400 rounded-full animate-pulse-soft" />
              </div>
            </div>
          </div>
        )}

        {/* 快速生成入口 - 果冻感设计 */}
        <div className="mb-8">
          <button 
            className="w-full h-16 rounded-3xl font-semibold text-lg text-white relative overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f87171 0%, #b197fc 50%, #7dd3fc 100%)',
              boxShadow: '0 12px 40px rgba(248, 113, 113, 0.3)'
            }}
            onClick={handleQuickGenerate}
          >
            {/* 背景动画装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-2 right-6 w-6 h-6 bg-white/20 rounded-full animate-float" />
            <div className="absolute bottom-2 left-8 w-4 h-4 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
            
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <span className="text-2xl animate-bounce-soft">🚀</span>
              <span>开始创作</span>
            </div>
          </button>
        </div>

        {/* 功能特色展示卡片 - 果冻感网格布局 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-mist-800 flex items-center justify-center">
            <span className="mr-3 text-2xl animate-bounce-soft">✨</span>
            功能特色
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className="relative p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(177, 151, 252, 0.1)',
                  boxShadow: '0 8px 32px rgba(177, 151, 252, 0.1)'
                }}
              >
                {/* 背景渐变装饰 */}
                <div 
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br ${feature.color}`}
                />
                
                <div className="relative z-10 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-2xl shadow-jelly`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-mist-800 mb-2 text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-mist-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* 悬浮装饰点 */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-gradient-to-r from-mist-400 to-sky-400 rounded-full animate-pulse-soft" />
              </div>
            ))}
          </div>
        </div>

        {/* 统计数据展示 - 果冻感设计 */}
        <div className="mb-8">
          <div 
            className="mobile-card text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #b197fc 0%, #7dd3fc 100%)',
              boxShadow: '0 12px 40px rgba(177, 151, 252, 0.3)'
            }}
          >
            {/* 背景装饰 */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-float" />
            <div className="absolute bottom-6 left-6 w-12 h-12 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2s' }} />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center">
                <span className="mr-2 text-2xl animate-bounce-soft">📊</span>
                平台数据
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-2xl font-bold drop-shadow-sm">{stat.number}</div>
                    <div className="text-sm opacity-90 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 新用户指南 - 果冻感设计 */}
        <div className="mobile-card mb-8">
          <h3 className="text-xl font-bold mb-6 text-mist-800 flex items-center justify-center">
            <span className="mr-3 text-2xl animate-bounce-soft">📖</span>
            新用户指南
          </h3>
          <div className="space-y-4">
            {[
              { step: 1, text: '输入创意描述', detail: '用文字描述您想要的图片或视频', icon: '✍️' },
              { step: 2, text: '选择生成类型和风格', detail: '选择图片或视频，设置尺寸和艺术风格', icon: '🎨' },
              { step: 3, text: '等待AI生成精美作品', detail: '几秒钟后即可获得专业级作品', icon: '⚡' }
            ].map((guide, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-r from-mist-50/50 to-sky-50/50 border border-mist-200/30">
                <div className="w-12 h-12 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-jelly">
                  {guide.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{guide.icon}</span>
                    <div className="font-semibold text-mist-800">{guide.text}</div>
                  </div>
                  <div className="text-sm text-mist-600 leading-relaxed">{guide.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部CTA - 果冻感设计 */}
        <div 
          className="mobile-card text-center mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(177, 151, 252, 0.1) 0%, rgba(125, 211, 252, 0.1) 100%)',
            border: '1px solid rgba(177, 151, 252, 0.2)'
          }}
        >
          {/* 背景装饰 */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-mist-200/30 rounded-full animate-float" />
          <div className="absolute bottom-4 left-4 w-10 h-10 bg-sky-200/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="text-5xl mb-4 animate-bounce-soft">🎯</div>
            <h3 className="text-xl font-bold text-mist-800 mb-3">
              准备好释放您的创造力了吗？
            </h3>
            <p className="text-sm text-mist-600 mb-6 leading-relaxed">
              加入文生视界，开启您的AI创作之旅
            </p>
            <button 
              className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #b197fc 0%, #7dd3fc 100%)',
                boxShadow: '0 8px 32px rgba(177, 151, 252, 0.3)'
              }}
              onClick={handleQuickGenerate}
            >
              立即开始创作
            </button>
          </div>
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