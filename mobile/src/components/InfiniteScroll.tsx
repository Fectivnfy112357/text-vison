import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'

export interface PaginationData {
  records?: any[]
  total: number
  current: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface InfiniteScrollProps {
  data: any[]
  pagination: PaginationData
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => Promise<void> | void
  onRefresh?: () => Promise<void> | void
  children: (item: any, index: number) => React.ReactNode
  emptyComponent?: React.ReactNode
  loadingComponent?: React.ReactNode
  loadingMoreComponent?: React.ReactNode
  endComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  threshold?: number
  className?: string
  scrollContainerClassName?: string
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  data,
  pagination,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  children,
  emptyComponent,
  loadingComponent,
  loadingMoreComponent,
  endComponent,
  errorComponent,
  threshold = 0.7,
  className = '',
  scrollContainerClassName = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showRefreshButton, setShowRefreshButton] = useState(false)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  // 处理滚动加载更多 - 优化性能
  const handleScroll = useCallback(async () => {
    if (!scrollContainerRef.current || isLoading || isLoadingMore || !hasMore) return

    const container = scrollContainerRef.current
    const { scrollTop, scrollHeight, clientHeight } = container
    
    // 简化计算，只使用剩余滚动距离判断
    const remainingScroll = scrollHeight - (scrollTop + clientHeight)
    
    // 当滚动到指定位置时加载更多
    if (remainingScroll < 300) {
      await onLoadMore()
    }

    // 简化刷新按钮逻辑
    const shouldShowRefresh = scrollTop > 300
    if (shouldShowRefresh !== showRefreshButton) {
      setShowRefreshButton(shouldShowRefresh)
    }
  }, [isLoading, isLoadingMore, hasMore, onLoadMore, showRefreshButton])

  // 处理刷新
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await onRefresh()
      // 滚动到顶部
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
      setShowRefreshButton(false)
    }
  }, [onRefresh, isRefreshing])

  // 设置滚动监听 - 增强性能优化
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let ticking = false
    let lastScrollTime = 0
    const SCROLL_THROTTLE = 100 // 100ms节流
    
    const optimizedHandleScroll = () => {
      const now = Date.now()
      
      // 时间节流，避免频繁触发
      if (now - lastScrollTime < SCROLL_THROTTLE) {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(() => {
            handleScroll()
            ticking = false
          })
        }
        return
      }
      
      lastScrollTime = now
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
      }
    }

    // 使用passive事件监听器提升滚动性能
    container.addEventListener('scroll', optimizedHandleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', optimizedHandleScroll)
    }
  }, [handleScroll])

  // 默认组件
  const defaultEmptyComponent = (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="text-gray-400 text-2xl">📭</div>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">暂无数据</h3>
        <p className="text-sm text-gray-500">没有找到相关内容</p>
      </div>
    </div>
  )

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  )

  const defaultLoadingMoreComponent = (
    <div className="flex justify-center py-4">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">加载更多...</span>
      </div>
    </div>
  )

  const defaultEndComponent = (
    <div className="flex justify-center py-4">
      <span className="text-sm text-gray-400">已加载全部数据</span>
    </div>
  )

  const defaultErrorComponent = (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">加载失败</h3>
        <p className="text-sm text-gray-500 mb-4">请稍后重试</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
        >
          重新加载
        </button>
      </div>
    </div>
  )

  return (
    <div className={`relative h-full ${className}`}>
      {/* 滚动容器 */}
      <div
        ref={scrollContainerRef}
        className={`overflow-y-auto h-full ${scrollContainerClassName}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          willChange: 'transform'
        }}
      >
        {isLoading ? (
          loadingComponent || defaultLoadingComponent
        ) : data.length === 0 ? (
          emptyComponent || defaultEmptyComponent
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => children(item, index))}
            
            {/* 加载更多指示器 */}
            {isLoadingMore && (loadingMoreComponent || defaultLoadingMoreComponent)}
            
            {/* 没有更多数据提示 */}
            {!hasMore && data.length > 0 && (endComponent || defaultEndComponent)}
          </div>
        )}
      </div>

      {/* 刷新按钮 */}
      {showRefreshButton && onRefresh && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw 
            size={20} 
            className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
        </button>
      )}

      {/* 加载更多按钮（当滚动加载不可用时） */}
      {hasMore && !isLoadingMore && !isLoading && data.length > 0 && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronDown size={16} />
            <span className="text-sm">加载更多</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default InfiniteScroll