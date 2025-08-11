import React, { memo, useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from "framer-motion"

import { 
  Eye, 
  Play, 
  Heart, 
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Template } from '../lib/api'

interface TemplateCardProps {
  template: Template
  index: number
  viewMode: 'grid' | 'list'
  isFavorite: boolean
  onUseTemplate: (template: Template) => void
  onToggleFavorite: (templateId: string) => void
  getCategoryIcon: (categoryName: string) => string
  formatNumber: (num: number) => string
}

// 统一的动画变体
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  }
}

const imageVariants = {
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

const TemplateCard: React.FC<TemplateCardProps> = memo(({
  template,
  viewMode,
  isFavorite,
  onUseTemplate,
  onToggleFavorite,
  getCategoryIcon,
  formatNumber
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 使用Intersection Observer实现懒加载
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [])

  // 处理使用模板
  const handleUseTemplate = useCallback(() => {
    onUseTemplate(template)
  }, [template, onUseTemplate])

  // 处理收藏/取消收藏
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(template.id.toString())
  }, [template.id, onToggleFavorite])

  // 处理图片加载错误
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-template.jpg'
  }, [])

  // 处理悬停状态
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // 网格视图
  if (viewMode === 'grid') {
    return (
      <motion.div
        ref={cardRef}
        className="group relative"
        variants={cardVariants}
        initial="hidden"
        animate={isIntersecting ? "visible" : "hidden"}
        whileHover="hover"
        whileTap="tap"
        layout
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div 
          className={`card-glow h-full overflow-hidden ${isHovered ? 'shadow-lg' : ''}`}
          layout
        >
          {/* 模板预览区域 */}
          <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            {template.imageUrl ? (
              <motion.img 
                src={template.imageUrl} 
                alt={template.title}
                className="w-full h-full object-cover"
                variants={imageVariants}
                initial="hidden"
                whileHover="hover"
                layout
                onError={handleImageError}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                <div className="text-center">
                  <Sparkles className="text-primary-400 mx-auto mb-2" size={32} />
                  <p className="text-xs text-primary-600 font-medium">暂无预览</p>
                </div>
              </div>
            )}
            
            {/* 渐变遮罩 */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                />
              )}
            </AnimatePresence>
            
            {/* 顶部标签 */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <div className="flex flex-col space-y-1">
                {template.isPremium && (
                  <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    ✨ PRO
                  </span>
                )}
                {template.isHot && (
                  <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center space-x-1">
                    <TrendingUp size={10} />
                    <span>热门</span>
                  </span>
                )}
              </div>
              
              {/* 收藏按钮 */}
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    onClick={handleToggleFavorite}
                    className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Heart 
                      size={14} 
                      className={isFavorite ? 'text-red-400 fill-current' : 'text-white'} 
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            {/* 底部操作按钮 */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  className="absolute bottom-2 left-2 right-2"
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <button
                    onClick={handleUseTemplate}
                    className="w-full py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-lg shadow-lg hover:bg-white transition-colors flex items-center justify-center space-x-1"
                  >
                    <Play size={12} />
                    <span>使用模板</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 模板信息 */}
          <div className="p-3 bg-white">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <motion.h3 
                  className={`font-bold text-gray-900 text-sm mb-1 line-clamp-2 ${isHovered ? 'text-primary-600' : ''}`}
                  animate={{ color: isHovered ? "#7c3aed" : "#111827" }}
                  transition={{ duration: 0.2 }}
                >
                  {template.title}
                </motion.h3>
                <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>
            
            {/* 统计信息 */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Eye size={11} className="text-primary-500" />
                  <span className="font-medium">{formatNumber(template.usageCount || 0)}</span>
                </div>
              </div>
              
              {/* 类型指示器 */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  template.type === 'image' ? 'bg-blue-400' : 'bg-purple-400'
                }`} />
                <span className="text-xs text-gray-500 font-medium">
                  {template.type === 'image' ? '图片' : '视频'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // 列表视图
  return (
    <motion.div
      ref={cardRef}
      className="group cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate={isIntersecting ? "visible" : "hidden"}
      whileHover="hover"
      whileTap="tap"
      layout
      onClick={handleUseTemplate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        className={`card-glow overflow-hidden ${isHovered ? 'shadow-xl' : ''}`}
        layout
      >
        {/* 大图展示区域 */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {template.imageUrl ? (
            <motion.img
              src={template.imageUrl}
              alt={template.title}
              className="w-full h-full object-cover"
              variants={imageVariants}
              initial="hidden"
              whileHover="hover"
              layout
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="text-gray-400 mb-2" size={32} />
                <div className="text-xs text-gray-500">模板预览</div>
              </div>
            </div>
          )}
          
          {/* 顶部标签 */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {template.isPremium && (
              <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                ✨ PRO
              </span>
            )}
            {template.isHot && (
              <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center space-x-1">
                <TrendingUp size={10} />
                <span>热门</span>
              </span>
            )}
          </div>
          
          {/* 收藏按钮 */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                onClick={handleToggleFavorite}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/30"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Heart 
                  size={16} 
                  className={isFavorite ? 'text-red-400 fill-current' : 'text-white'} 
                />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* 遮罩层 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-sm font-medium mb-1">
                        {getCategoryIcon(template.category || '')} {template.category}
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{formatNumber(template.usageCount || 0)}次使用</span>
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30">
                      <Play size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* 内容区域 */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <motion.h3 
                className={`font-bold text-gray-900 text-base mb-2 line-clamp-1 ${isHovered ? 'text-primary-600' : ''}`}
                animate={{ color: isHovered ? "#7c3aed" : "#111827" }}
                transition={{ duration: 0.2 }}
              >
                {template.title}
              </motion.h3>
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
                  {getCategoryIcon(template.category || '')} {template.category}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  template.type === 'image' ? 'bg-blue-400' : 'bg-purple-400'
                }`} />
                <span className="text-xs text-gray-500 font-medium">
                  {template.type === 'image' ? '图片' : '视频'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye size={14} className="text-primary-500" />
                  <span className="font-medium">{formatNumber(template.usageCount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

TemplateCard.displayName = 'TemplateCard'

export default TemplateCard