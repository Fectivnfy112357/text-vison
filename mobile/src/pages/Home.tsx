import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Image, Video, Zap, Star, TrendingUp, ArrowRight } from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { useAuthStore } from '../store/useAuthStore'
import { Template } from '../lib/api'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { popularTemplates, loadPopularTemplates } = useTemplateStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    console.log('[Home] Component mounted, loading popular templates...')
    loadPopularTemplates(4)
  }, [loadPopularTemplates])

  // 监听热门模板状态变化
  useEffect(() => {
    console.log('[Home] Popular templates updated:', popularTemplates)
  }, [popularTemplates])

  const handleCreateClick = () => {
    if (isAuthenticated) {
      navigate('/create')
    } else {
      navigate('/login')
    }
  }

  const handleTemplateClick = (template: Template) => {
    if (isAuthenticated) {
      navigate('/create', { state: { template } })
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {/* 头部区域 */}
      <motion.div 
        className="relative px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 问候语 */}
        <div className="mb-6">
          <motion.h1 
            className="text-2xl font-bold text-gradient mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isAuthenticated ? `你好，${user?.username || '用户'}` : '欢迎来到文生视界'}
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isAuthenticated ? '开始你的创意之旅吧' : 'AI驱动的图文生成平台'}
          </motion.p>
        </div>

        {/* 快速创作按钮 */}
        <motion.button
          onClick={handleCreateClick}
          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl p-4 mb-6 btn-jelly shadow-glow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Sparkles size={20} />
            <span className="font-semibold">开始创作</span>
            <ArrowRight size={16} />
          </div>
        </motion.button>
      </motion.div>

      {/* 功能卡片 */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="card-soft p-4 text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create', { state: { type: 'image' } })}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Image className="text-primary-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">图片生成</h3>
            <p className="text-xs text-gray-500">AI智能图片创作</p>
          </motion.div>

          <motion.div 
            className="card-soft p-4 text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create', { state: { type: 'video' } })}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Video className="text-secondary-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">视频生成</h3>
            <p className="text-xs text-gray-500">AI智能视频创作</p>
          </motion.div>
        </div>
      </motion.div>

      {/* 热门模板 */}
      <motion.div 
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-primary-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">热门模板</h2>
          </div>
          <button 
            onClick={() => navigate('/templates')}
            className="text-primary-600 text-sm font-medium flex items-center space-x-1"
          >
            <span>更多</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {popularTemplates.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {popularTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                className="card-soft overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateClick(template)}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {template.thumbnail ? (
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="text-gray-400" size={32} />
                    </div>
                  )}
                  {template.isPopular && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <Star size={10} fill="currentColor" />
                      <span>热门</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Zap size={10} />
                      <span>{template.usageCount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 text-sm">暂无热门模板</p>
          </div>
        )}
      </motion.div>

      {/* 底部间距 */}
      <div className="h-20" />
    </div>
  )
}

export default Home