import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Image, Video, Zap, Star, TrendingUp, ArrowRight, Search, Palette, Lightbulb, BookOpen, Users, Clock, Heart } from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { useAuthStore } from '../store/useAuthStore'
import { Template } from '../lib/api'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { popularTemplates, loadPopularTemplates } = useTemplateStore()
  const { isAuthenticated, user } = useAuthStore()
  const [animatedStats, setAnimatedStats] = useState({ today: 0, total: 0, satisfaction: 0 })

  useEffect(() => {
    loadPopularTemplates(4)
    
    // 动态数字动画
    if (isAuthenticated) {
      const duration = 2000
      const steps = 60
      const todayTarget = 12
      const totalTarget = 156
      const satisfactionTarget = 89

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        setAnimatedStats({
          today: Math.floor(todayTarget * easeOut),
          total: Math.floor(totalTarget * easeOut),
          satisfaction: Math.floor(satisfactionTarget * easeOut)
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setAnimatedStats({ today: todayTarget, total: totalTarget, satisfaction: satisfactionTarget })
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleCreateClick = () => {
    if (isAuthenticated) {
      navigate('/create')
    }
  }

  const handleTemplateClick = (template: Template) => {
    if (isAuthenticated) {
      navigate('/create', { state: { template } })
    }
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {/* 动态背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 头部区域 */}
      <motion.div
        className="relative px-6 pt-8 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 问候语和统计 */}
        <div className="mb-6">
          <motion.h1
            className="text-2xl font-bold text-gradient mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isAuthenticated ? `你好，${user?.nickname || user?.username || '用户'}` : '欢迎来到文生视界'}
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

        {/* 热门搜索词 */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          {['国风', '赛博朋克', '油画', '水墨', '像素'].map((tag, index) => (
            <motion.button
              key={tag}
              className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-700 border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create', { state: { prompt: tag } })}
            >
              #{tag}
            </motion.button>
          ))}
        </motion.div>

        {/* 用户统计卡片 */}
        {isAuthenticated && (
          <motion.div
            className="grid grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <motion.div 
              className="card-soft p-3 text-center group hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-primary-600">{animatedStats.today}</div>
              <div className="text-xs text-gray-500">今日生成</div>
            </motion.div>
            <motion.div 
              className="card-soft p-3 text-center group hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-secondary-600">{animatedStats.total}</div>
              <div className="text-xs text-gray-500">总作品</div>
            </motion.div>
            <motion.div 
              className="card-soft p-3 text-center group hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-accent-600">{animatedStats.satisfaction}%</div>
              <div className="text-xs text-gray-500">满意度</div>
            </motion.div>
          </motion.div>
        )}

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

      {/* 创作灵感 */}
      <motion.div
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <div className="card-soft p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="text-primary-600" size={20} />
            <h3 className="font-semibold text-gray-800">今日灵感</h3>
          </div>
          <div className="space-y-2">
            {[
              "梦幻星空下的城市夜景",
              "赛博朋克风格的街头艺术", 
              "国风水墨山水画"
            ].map((inspiration, index) => (
              <motion.div
                key={index}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/create', { state: { prompt: inspiration } })}
              >
                <p className="text-sm text-gray-700">{inspiration}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 热门模板 */}
      <motion.div
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-primary-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">热门模板</h2>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="text-primary-600 text-sm font-medium flex items-center space-x-1 hover:text-primary-700 transition-colors"
          >
            <span>查看全部</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {popularTemplates.length > 0 ? (
          <div className="space-y-3">
            {popularTemplates.slice(0, 3).map((template, index) => (
              <motion.div
                key={template.id}
                className="card-soft cursor-pointer group hover:shadow-xl transition-all overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateClick(template)}
              >
                {/* 大图展示区域 */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {template.imageUrl ? (
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="text-gray-400 mb-2" size={32} />
                        <div className="text-xs text-gray-500">模板预览</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 热门标识 */}
                  {template.usageCount > 10 && (
                    <motion.div 
                      className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <Star size={12} fill="currentColor" />
                      <span>热门</span>
                    </motion.div>
                  )}
                  
                  {/* 遮罩层 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <div className="text-sm font-medium mb-1">{template.category}</div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="flex items-center space-x-1">
                              <Zap size={14} />
                              <span>{template.usageCount}次使用</span>
                            </span>
                          </div>
                        </div>
                        <motion.div
                          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ArrowRight size={20} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 内容区域 */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-base mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* 操作栏 */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-medium">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Zap size={16} />
                        <span className="font-medium">{template.usageCount}</span>
                        <span className="text-xs">次使用</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="card-soft p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 text-sm mb-2">暂无热门模板</p>
              <button
                onClick={() => navigate('/create')}
                className="text-primary-600 text-sm font-medium"
              >
                去创建第一个模板
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Home