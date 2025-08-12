import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Masonry from 'react-responsive-masonry'
import { GenerationContent } from '../lib/api'
import { 
  preloadImage, 
  generateRandomAspectRatio
} from '../utils/imageUtils'
import HistoryItem from './HistoryItem'

interface MasonryHistoryGridProps {
  history: GenerationContent[]
  onDownload: (item: GenerationContent) => void
  onShare: (item: GenerationContent) => void
  onDelete: (id: string) => void
  isLoading?: boolean
  columnsCount?: number
  gutter?: string
  className?: string
}

interface EnhancedHistoryItem extends GenerationContent {
  aspectRatio: number
  imageLoaded: boolean
}

const MasonryHistoryGrid: React.FC<MasonryHistoryGridProps> = ({
  history,
  onDownload,
  onShare,
  onDelete,
  isLoading = false,
  columnsCount = 2,
  gutter = '16px',
  className = ''
}) => {
  const [enhancedHistory, setEnhancedHistory] = useState<EnhancedHistoryItem[]>([])
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  // 增强历史记录数据，添加宽高比信息
  const enhanceHistory = useCallback(async (historyToEnhance: GenerationContent[]) => {
    if (!historyToEnhance.length) return []

    setLoadingImages(prev => {
      const newSet = new Set(prev)
      historyToEnhance.forEach(item => newSet.add(item.id))
      return newSet
    })

    try {
      // 为每个历史记录项计算宽高比
      const enhanced = await Promise.all(
        historyToEnhance.map(async (item) => {
          let aspectRatio = item.aspectRatio

          // 如果没有预定义的宽高比，尝试从图片获取
          if (!aspectRatio && item.thumbnail) {
            try {
              const dimensions = await preloadImage(item.thumbnail)
              aspectRatio = dimensions.aspectRatio
            } catch (error) {
              console.warn(`Failed to load thumbnail for history item ${item.id}:`, error)
              // 使用随机宽高比作为后备
              aspectRatio = generateRandomAspectRatio()
            }
          } else if (!aspectRatio && item.url) {
            try {
              const dimensions = await preloadImage(item.url)
              aspectRatio = dimensions.aspectRatio
            } catch (error) {
              console.warn(`Failed to load image for history item ${item.id}:`, error)
              // 使用随机宽高比作为后备
              aspectRatio = generateRandomAspectRatio()
            }
          } else if (!aspectRatio) {
            // 如果没有图片URL，根据类型使用默认宽高比
            aspectRatio = item.type === 'video' ? 16/9 : generateRandomAspectRatio()
          }

          return {
            ...item,
            aspectRatio,
            imageLoaded: false
          }
        })
      )

      setEnhancedHistory(enhanced)
      return enhanced
    } catch (error) {
      console.error('Error enhancing history:', error)
      // 返回带有默认宽高比的历史记录
      const fallbackEnhanced = historyToEnhance.map(item => ({
        ...item,
        aspectRatio: item.aspectRatio || (item.type === 'video' ? 16/9 : 16/9),
        imageLoaded: false
      }))
      setEnhancedHistory(fallbackEnhanced)
      return fallbackEnhanced
    } finally {
      setLoadingImages(new Set())
    }
  }, [])

  // 当历史记录数据变化时，重新增强数据
  useEffect(() => {
    if (history.length > 0) {
      enhanceHistory(history)
    } else {
      setEnhancedHistory([])
    }
  }, [history, enhanceHistory])

  // 处理图片加载完成
  const handleImageLoad = useCallback((itemId: string) => {
    setEnhancedHistory(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, imageLoaded: true }
          : item
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

  // 渲染单个历史记录卡片
  const renderHistoryItem = useCallback((item: EnhancedHistoryItem) => {
    const isLoadingImage = loadingImages.has(item.id)
    
    return (
      <div 
        key={item.id}
        className="break-inside-avoid mb-4"
        style={{ 
          marginBottom: gutter,
          opacity: isLoadingImage ? 0.6 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        <HistoryItem
          item={item}
          index={0}
          isSelected={false}
          onDownload={onDownload}
          onShare={onShare}
          onDelete={onDelete}
          aspectRatio={item.aspectRatio}
          onImageLoad={() => handleImageLoad(item.id)}
          isLoading={isLoadingImage}
        />
      </div>
    )
  }, [onDownload, onShare, onDelete, handleImageLoad, loadingImages, gutter])

  // 加载状态
  if (isLoading && enhancedHistory.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载历史记录...</p>
        </div>
      </div>
    )
  }

  // 空状态
  if (enhancedHistory.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">📭</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无历史记录</h3>
          <p className="text-sm text-gray-500">还没有创作记录，开始你的第一次AI创作之旅吧</p>
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
        {enhancedHistory.map(renderHistoryItem)}
      </Masonry>
      
      {/* 加载更多指示器 */}
      {isLoading && enhancedHistory.length > 0 && (
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

export default MasonryHistoryGrid