import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Masonry from 'react-responsive-masonry'
import { Template } from '../lib/api'
import { 
  preloadImage, 
  generateRandomAspectRatio
} from '../utils/imageUtils'
import TemplateCard from './TemplateCard'

interface MasonryTemplateGridProps {
  templates: Template[]
  onUseTemplate: (template: Template) => void
  getCategoryIcon: (categoryName: string) => string
  formatNumber: (num: number) => string
  isLoading?: boolean
  columnsCount?: number
  gutter?: string
  className?: string
  hasMore?: boolean
}

interface EnhancedTemplate extends Template {
  aspectRatio: number
  imageLoaded: boolean
}

const MasonryTemplateGrid: React.FC<MasonryTemplateGridProps> = ({
  templates,
  onUseTemplate,
  getCategoryIcon,
  formatNumber,
  isLoading = false,
  columnsCount = 2,
  gutter = '16px',
  className = '',
  hasMore = false
}) => {
  const [enhancedTemplates, setEnhancedTemplates] = useState<EnhancedTemplate[]>([])
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  // 增强模板数据，添加宽高比信息
  const enhanceTemplates = useCallback(async (templatesToEnhance: Template[]) => {
    if (!templatesToEnhance.length) return []

    setLoadingImages(prev => {
      const newSet = new Set(prev)
      templatesToEnhance.forEach(t => newSet.add(t.id.toString()))
      return newSet
    })

    try {
      // 为每个模板计算宽高比
      const enhanced = await Promise.all(
        templatesToEnhance.map(async (template) => {
          let aspectRatio = template.aspectRatio

          // 如果没有预定义的宽高比，尝试从图片获取
          if (!aspectRatio && template.imageUrl) {
            try {
              const dimensions = await preloadImage(template.imageUrl)
              aspectRatio = dimensions.aspectRatio
            } catch (error) {
              console.warn(`Failed to load image for template ${template.id}:`, error)
              // 使用随机宽高比作为后备
              aspectRatio = generateRandomAspectRatio()
            }
          } else if (!aspectRatio) {
            // 如果没有图片URL，使用随机宽高比
            aspectRatio = generateRandomAspectRatio()
          }

          return {
            ...template,
            aspectRatio,
            imageLoaded: false
          }
        })
      )

      setEnhancedTemplates(enhanced)
      return enhanced
    } catch (error) {
      console.error('Error enhancing templates:', error)
      // 返回带有默认宽高比的模板
      const fallbackEnhanced = templatesToEnhance.map(template => ({
        ...template,
        aspectRatio: template.aspectRatio || 16/9,
        imageLoaded: false
      }))
      setEnhancedTemplates(fallbackEnhanced)
      return fallbackEnhanced
    } finally {
      setLoadingImages(new Set())
    }
  }, [])

  // 当模板数据变化时，重新增强数据
  useEffect(() => {
    if (templates.length > 0) {
      enhanceTemplates(templates)
    } else {
      setEnhancedTemplates([])
    }
  }, [templates, enhanceTemplates])

  
  // 处理图片加载完成
  const handleImageLoad = useCallback((templateId: number) => {
    setEnhancedTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, imageLoaded: true }
          : template
      )
    )
  }, [])

  // 计算列数（响应式）
  const responsiveColumns = useMemo(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 375) return 1 // 超小屏手机
      if (width < 768) return 2 // 手机和平板
      if (width < 1024) return 3 // 小桌面
      return 4 // 大桌面
    }
    return columnsCount
  }, [columnsCount])

  // 渲染单个模板卡片
  const renderTemplateCard = useCallback((template: EnhancedTemplate) => {
    const isLoadingImage = loadingImages.has(template.id.toString())
    
    return (
      <div 
        key={template.id}
        className="break-inside-avoid mb-4"
        style={{ 
          marginBottom: gutter,
          opacity: isLoadingImage ? 0.6 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        <TemplateCard
          template={template}
          index={0}
          onUseTemplate={onUseTemplate}
          getCategoryIcon={getCategoryIcon}
          formatNumber={formatNumber}
          aspectRatio={template.aspectRatio}
          onImageLoad={() => handleImageLoad(template.id)}
          isLoading={isLoadingImage}
        />
      </div>
    )
  }, [onUseTemplate, getCategoryIcon, formatNumber, handleImageLoad, loadingImages, gutter])

  // 加载状态
  if (isLoading && enhancedTemplates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载模板...</p>
        </div>
      </div>
    )
  }

  // 空状态 - 只有在不是加载状态且没有数据时才显示
  if (enhancedTemplates.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">📭</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无模板</h3>
          <p className="text-sm text-gray-500">模板库正在整理中，敬请期待</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <Masonry
        columnsCount={responsiveColumns}
        gutter={gutter}
        className="masonry-grid"
      >
        {enhancedTemplates.map(renderTemplateCard)}
      </Masonry>
      
      {/* 加载更多指示器 */}
      {isLoading && enhancedTemplates.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">加载更多...</span>
          </div>
        </div>
      )}
      
          </div>
  )
}

export default MasonryTemplateGrid