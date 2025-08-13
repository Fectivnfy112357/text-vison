import React, { memo, useCallback, useRef, useState, useEffect } from 'react'

import { 
  Eye, 
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Template } from '../lib/api'
import { getAspectRatioStyle } from '../utils/imageUtils'

interface TemplateCardProps {
  template: Template
  index: number
  onUseTemplate: (template: Template) => void
  getCategoryIcon: (categoryName: string) => string
  formatNumber: (num: number) => string
  aspectRatio?: number
  onImageLoad?: () => void
  isLoading?: boolean
}


const TemplateCard: React.FC<TemplateCardProps> = memo(({
  template,
  onUseTemplate,
  getCategoryIcon,
  formatNumber,
  aspectRatio = 16/9, // 默认16:9
  onImageLoad,
  isLoading = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  // 图片懒加载 - 使用Intersection Observer（性能优化版本）
  useEffect(() => {
    if (!template.imageUrl) {
      setIsVisible(true)
      return
    }

    // 增加提前加载距离，提升用户体验
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '300px', // 提前300px加载，给予更多缓冲时间
        threshold: 0.01
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [template.imageUrl])

  // 处理图片加载成功
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    onImageLoad?.()
  }, [onImageLoad])

  // 处理图片加载错误
  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
    onImageLoad?.()
  }, [onImageLoad])

  // 处理使用模板 - 减少依赖项
  const handleUseTemplate = useCallback(() => {
    onUseTemplate(template)
  }, [onUseTemplate]) // 移除template依赖，因为template.id作为key已经足够

  // 列表视图
  return (
    <div
      ref={cardRef}
      className="group"
    >
      <div className="card-glow overflow-hidden">
        {/* 大图展示区域 */}
        <div 
          className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
          style={getAspectRatioStyle(aspectRatio)}
        >
          {template.imageUrl ? (
            <>
              {/* 图片加载状态 */}
              {(isVisible && !imageLoaded) || isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-xs text-gray-500">加载中...</div>
                  </div>
                </div>
              )}
              
              {/* 实际图片 - 懒加载 */}
              {isVisible && (
                <img
                  ref={imageRef}
                  src={template.imageUrl}
                  alt={template.title}
                  className={`w-full h-full object-cover absolute inset-0 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                  decoding="async"
                  style={{ 
                    transition: imageLoaded ? 'opacity 0.3s ease-in-out' : 'none',
                    // 移除 will-change 以减少内存使用
                  }}
                />
              )}
              
              {/* 图片加载错误占位符 */}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <Sparkles className="text-gray-400 mb-2" size={32} />
                    <div className="text-xs text-gray-500">图片加载失败</div>
                  </div>
                </div>
              )}
              
              {/* 占位符 - 图片未加载时显示 */}
              {!isVisible && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="text-gray-300 mb-2" size={32} />
                    <div className="text-xs text-gray-400">模板预览</div>
                  </div>
                </div>
              )}
            </>
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
          
                  </div>
        
        {/* 内容区域 */}
        <div className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                {template.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1 leading-relaxed">
                {template.description}
              </p>
            </div>
            <button
              onClick={handleUseTemplate}
              className="ml-2 px-2 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-medium rounded-full hover:shadow-lg transition-shadow duration-200 flex-shrink-0"
            >
              使用
            </button>
          </div>
          
          {/* 操作栏 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium">
                {getCategoryIcon(template.category || '')} {template.category}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${
                template.type === 'image' ? 'bg-blue-400' : 'bg-purple-400'
              }`} />
              <span className="text-xs text-gray-500 font-medium">
                {template.type === 'image' ? '图片' : '视频'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye size={12} className="text-primary-500" />
                <span className="font-medium">{formatNumber(template.usageCount || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

TemplateCard.displayName = 'TemplateCard'

export default TemplateCard