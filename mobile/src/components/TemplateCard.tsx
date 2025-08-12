import React, { memo, useCallback, useRef } from 'react'

import { 
  Eye, 
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { Template } from '../lib/api'

interface TemplateCardProps {
  template: Template
  index: number
  onUseTemplate: (template: Template) => void
  getCategoryIcon: (categoryName: string) => string
  formatNumber: (num: number) => string
}


const TemplateCard: React.FC<TemplateCardProps> = memo(({
  template,
  onUseTemplate,
  getCategoryIcon,
  formatNumber
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  // 处理图片加载错误
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-template.jpg'
  }, [])

  // 处理使用模板
  const handleUseTemplate = useCallback(() => {
    onUseTemplate(template)
  }, [template, onUseTemplate])

  // 列表视图
  return (
    <div
      ref={cardRef}
      className="group"
    >
      <div className="card-glow overflow-hidden">
        {/* 大图展示区域 */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {template.imageUrl ? (
            <img
              src={template.imageUrl}
              alt={template.title}
              className="w-full h-full object-cover"
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
          
                  </div>
        
        {/* 内容区域 */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
                {template.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {template.description}
              </p>
            </div>
            <button
              onClick={handleUseTemplate}
              className="ml-3 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-medium rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex-shrink-0"
            >
              使用模板
            </button>
          </div>
          
          {/* 操作栏 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
    </div>
  )
})

TemplateCard.displayName = 'TemplateCard'

export default TemplateCard