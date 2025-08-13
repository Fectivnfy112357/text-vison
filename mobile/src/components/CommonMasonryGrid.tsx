import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Masonry from 'react-responsive-masonry'
import { 
  preloadImage, 
  generateRandomAspectRatio,
  clearImageCache
} from '../utils/imageUtils'

interface CommonMasonryGridProps<T, ID> {
  items: T[]
  renderItem: (item: EnhancedItem<T>, index: number) => React.ReactNode
  getAspectRatio: (item: T) => number
  getId: (item: T) => ID
  isLoading?: boolean
  columnsCount?: number
  gutter?: string
  className?: string
  hasMore?: boolean
  onLoadMore?: () => void
  emptyMessage?: string
  loadingMessage?: string
}

export interface EnhancedItem<T> {
  original: T
  aspectRatio: number
  imageLoaded: boolean
}

const CommonMasonryGrid = <T extends {}, ID extends string | number>({
  items,
  renderItem,
  getAspectRatio,
  getId,
  isLoading = false,
  columnsCount = 2,
  gutter = '16px',
  className = '',
  hasMore = false,
  onLoadMore,
  emptyMessage = '暂无数据',
  loadingMessage = '正在加载...'
}: CommonMasonryGridProps<T, ID>) => {
  const [enhancedItems, setEnhancedItems] = useState<EnhancedItem<T>[]>([])
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
  const processingRef = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // 增强数据，添加宽高比信息（同步处理版本）
  const enhanceItems = useCallback((itemsToEnhance: T[]) => {
    console.log('[CommonMasonryGrid] enhanceItems called', {
      inputCount: itemsToEnhance.length,
      enhancedCount: enhancedItems.length
    })
    
    if (!itemsToEnhance.length) return []
    
    setLoadingImages(prev => {
      const newSet = new Set(prev)
      itemsToEnhance.forEach(item => {
        const id = getId(item)
        newSet.add(id.toString())
      })
      return newSet
    })

    try {
      // 同步处理所有项目数据
      const enhanced = itemsToEnhance.map(item => {
        // 获取宽高比，优先使用预定义的，避免图片加载
        let aspectRatio = getAspectRatio(item)
        
        if (!aspectRatio) {
          // 如果没有预定义宽高比，使用随机比例
          aspectRatio = generateRandomAspectRatio()
        }

        return {
          original: item,
          aspectRatio,
          imageLoaded: false
        }
      })
      
      console.log('[CommonMasonryGrid] Enhanced items', {
        enhancedCount: enhanced.length,
        firstAspectRatio: enhanced[0]?.aspectRatio
      })
      
      // 立即更新状态
      setEnhancedItems(enhanced)
      setLoadingImages(new Set())
      
      return enhanced
    } catch (error) {
      console.error('Error enhancing items:', error)
      const fallbackEnhanced = itemsToEnhance.map(item => ({
        original: item,
        aspectRatio: getAspectRatio(item) || 16/9,
        imageLoaded: false
      }))
      setEnhancedItems(fallbackEnhanced)
      setLoadingImages(new Set())
      return fallbackEnhanced
    }
  }, [getAspectRatio, getId, enhancedItems.length])

  // 当数据变化时，重新增强数据
  useEffect(() => {
    console.log('[CommonMasonryGrid] useEffect triggered', {
      itemsLength: items.length,
      enhancedItemsLength: enhancedItems.length,
      isLoading
    })
    
    if (items.length > 0) {
      enhanceItems(items)
    } else {
      setEnhancedItems([])
    }
  }, [items, enhanceItems, isLoading])

  // 内存管理：当组件卸载时清理缓存
  useEffect(() => {
    return () => {
      clearImageCache()
    }
  }, [])

  // 节流函数
  const throttle = <F extends (...args: any[]) => void>(
    func: F,
    delay: number
  ): F => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0
    
    return ((...args: any[]) => {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }) as F
  }

  // 处理图片加载完成
  const handleImageLoad = useCallback((itemId: ID) => {
    setEnhancedItems(prev => 
      prev.map(item => 
        getId(item.original) === itemId 
          ? { ...item, imageLoaded: true }
          : item
      )
    )
  }, [getId])

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

  // 渲染单个项目卡片（优化版本）
  const renderItemCard = useCallback((enhancedItem: EnhancedItem<T>, index: number) => {
    const itemId = getId(enhancedItem.original)
    const isLoadingImage = loadingImages.has(itemId.toString())
    
    // 调试日志
    console.log(`[CommonMasonryGrid] Rendering item ${itemId}`, {
      aspectRatio: enhancedItem.aspectRatio,
      isLoadingImage
    })
    
    return (
      <div 
        key={itemId.toString()}
        style={{ 
          marginBottom: gutter,
          opacity: isLoadingImage ? 0.6 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {renderItem(enhancedItem, index)}
      </div>
    )
  }, [renderItem, getId, loadingImages, gutter])

  // 添加调试日志
  console.log('[CommonMasonryGrid] Render state', {
    isLoading,
    itemsLength: items.length,
    enhancedItemsLength: enhancedItems.length,
    willShowLoading: isLoading && enhancedItems.length === 0,
    willShowEmpty: enhancedItems.length === 0 && !isLoading && items.length === 0
  })

  // 加载状态
  if (isLoading && enhancedItems.length === 0) {
    console.log('[CommonMasonryGrid] Showing loading state')
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // 空状态 - 只有在不是加载状态且没有数据时才显示
  if (enhancedItems.length === 0 && !isLoading && items.length === 0) {
    console.log('[CommonMasonryGrid] Showing empty state')
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">📭</div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无数据</h3>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={gridRef}
      className={`w-full ${className}`}
      style={{ 
        height: '100%'
        // 移除 overflowY: 'auto' 避免嵌套滚动
      }}
    >
      <Masonry
        columnsCount={responsiveColumns}
        gutter={gutter}
      >
        {enhancedItems.map((item, index) => renderItemCard(item, index))}
      </Masonry>
      
      {/* 加载更多指示器 */}
      {isLoading && enhancedItems.length > 0 && (
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

export default memo(CommonMasonryGrid)