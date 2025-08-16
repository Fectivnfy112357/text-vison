import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react'
import { useGenerationStore } from '../store/useGenerationStore'
import { useAuthStore } from '../store/useAuthStore'
import { GenerationContent } from '../lib/api'
import { toast } from 'sonner'
import HistoryItem from '../components/HistoryItem'
import CommonMasonryGrid, { EnhancedItem } from '../components/CommonMasonryGrid'

type FilterType = 'all' | 'image' | 'video'
type SortType = 'newest' | 'oldest' | 'name'

const History: React.FC = () => {
  const navigate = useNavigate()
  const { 
    history, 
    isLoading, 
    isLoadingMore,
    pagination,
    loadHistory, 
    loadMoreHistory,
    refreshHistory, 
    removeFromHistory
  } = useGenerationStore()
  const { isAuthenticated } = useAuthStore()

  // 状态管理
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, _setSortType] = useState<SortType>('newest')
  const [_showFilters, _setShowFilters] = useState(false)
  const [selectedItems, _setSelectedItems] = useState<Set<string>>(new Set())
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [_isSelectionMode, _setIsSelectionMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  
  // 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    loadHistory({ page: 1, size: 20 })
    setIsVisible(true)
    
    // 组件卸载时清理轮询
    return () => {
      // destroy 方法将在 useGenerationStore 中实现
    }
  }, [isAuthenticated, loadHistory])

  // 滚动事件监听（性能优化版本）
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current
      if (!container) return
      
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      
      // 当滚动到距离底部400px时触发（增加提前量）
      if (scrollTop + clientHeight >= scrollHeight - 400 && !isLoadingMore && pagination.hasNext && !isLoading) {
        loadMoreHistory()
      }
    }

    // 使用 requestAnimationFrame 优化滚动事件
    let ticking = false
    let lastScrollTime = 0
    const SCROLL_THROTTLE = 150 // 增加节流时间，减少触发频率

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

    const container = scrollContainerRef.current
    if (container) {
      // 使用 passive 事件监听器提升滚动性能
      container.addEventListener('scroll', optimizedHandleScroll, {
        passive: true
      })
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', optimizedHandleScroll)
      }
    }
  }, [loadMoreHistory, isLoadingMore, pagination.hasNext, isLoading])

  // 过滤和排序历史记录（性能优化版本）
  const filteredHistory = React.useMemo(() => {
    if (!history || !Array.isArray(history) || history.length === 0) {
      return []
    }
    
    let filtered = history.filter(item => {
      // 类型过滤
      if (filterType !== 'all' && item.type !== filterType) {
        return false
      }
      
      return true
    })

    // 排序 - 只有在过滤结果不为空时才进行排序
    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        switch (sortType) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case 'name':
            return a.prompt.localeCompare(b.prompt)
          default:
            return 0
        }
      })
    }

    return filtered
  }, [history, filterType, sortType])

  // 处理刷新
  const handleRefresh = async () => {
    await refreshHistory()
    toast.success('历史记录已刷新')
  }

  // 处理删除 - 使用useCallback优化
  const handleDelete = useCallback(async (id: string) => {
    try {
      await removeFromHistory(id)
    } catch (error) {
      // removeFromHistory已经处理了toast提示
    }
  }, [removeFromHistory])

  // 处理下载 - 使用useCallback优化
  const handleDownload = useCallback(async (item: GenerationContent) => {
    if (!item.url) {
      toast.error('暂无可下载的内容')
      return
    }

    try {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = item.url
      link.download = `文生视界-${item.type}-${item.id}-${Date.now()}.${item.type === 'image' ? 'jpg' : 'mp4'}`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('下载已开始')
    } catch (error) {
      console.error('下载失败:', error)
      toast.error('下载失败，请重试')
    }
  }, [])

  // 处理分享 - 使用useCallback优化
  const handleShare = useCallback(async (item: GenerationContent) => {
    if (!item.url) {
      toast.error('暂无可分享的内容')
      return
    }

    try {
      // 现代浏览器的原生分享API
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: '文生视界 - AI生成作品',
          text: `我用AI生成了${item.type === 'image' ? '一张图片' : '一个视频'}："${item.prompt}"`,
          url: item.url,
        }

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          toast.success('分享成功！')
          return
        }
      }

      // 备用方案：复制链接到剪贴板
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(item.url)
        toast.success('链接已复制到剪贴板')
      } else {
        // 降级方案：使用临时输入框
        const tempInput = document.createElement('input')
        tempInput.value = item.url
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
        toast.success('链接已复制到剪贴板')
      }
    } catch (error) {
      console.error('分享失败:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        // 用户取消分享，不显示错误
        return
      }
      toast.error('分享失败，请重试')
    }
  }, [])

  
  // 如果未认证，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <div className="text-center max-w-sm w-full px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-primary-500" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">开始AI创作之旅</h3>
          <p className="text-gray-600 mb-8">登录后即可使用AI生成精美的图片和视频内容</p>
          <button
            onClick={() => navigate('/mobile/login')}
            className="w-3/4 mx-auto px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            立即登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <div className="relative safe-area-top bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-transparent backdrop-blur-sm border-b border-white/20">
        {/* 头部标题和操作区 */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">创作历史</h1>
                <p className="text-xs text-gray-500">
                  查看你的AI创作记录
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white/80 backdrop-blur-sm"
              >
                <RefreshCw size={18} className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 过滤器 */}
        <div className="px-3 pb-3">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1">
            {(['all', 'image', 'video'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium ${
                  filterType === type
                    ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                    : "bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200"
                }`}
              >
                {type === 'all' ? '🌟 全部' : type === 'image' ? '🖼️ 图片' : '🎬 视频'}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* 主内容 */}
      <div className="flex-1 pb-20 overflow-hidden">
        {filteredHistory.length === 0 && !isLoading ? (
          // 空状态
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-gray-400" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700">暂无创作历史</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  还没有创作记录，开始你的第一次AI创作之旅吧
                </p>
              </div>
              <button
                onClick={() => navigate('/create')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                开始创作
              </button>
            </div>
          </div>
        ) : (
          // 瀑布流布局
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto px-2 py-3"
            style={{ boxSizing: 'border-box' }}
          >
            <CommonMasonryGrid
              items={filteredHistory}
              renderItem={(enhancedItem, index) => (
                <HistoryItem
                  item={enhancedItem.original as GenerationContent}
                  index={index}
                  isSelected={false}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onDelete={handleDelete}
                  aspectRatio={enhancedItem.aspectRatio}
                  onImageLoad={() => {
                    // 处理图片加载完成，这里可以添加额外的逻辑
                  }}
                  isLoading={false}
                />
              )}
                  getAspectRatio={(item: any) => {
                try {
                  const ratioStr = (item as GenerationContent).aspectRatio;
                  // 如果没有定义宽高比，使用默认的9/16
                  if (!ratioStr) return 1/1;

                  // 分割比例字符串
                  const parts = ratioStr.split(":");
                  const width = parseFloat(parts[0]);
                  const height = parseFloat(parts[1]);
                  return width / height;
                } catch (error) {
                  // 任何错误情况下都返回1:1的比例
                  return 1;
                }
              }}
              getId={(item: any) => (item as GenerationContent).id}
              isLoading={isLoading}
              gutter="12px"
              className="h-full w-full"
              emptyMessage="还没有创作记录，开始你的第一次AI创作之旅吧"
              loadingMessage="正在加载历史记录..."
            />
          </div>
        )}
      </div>

      {/* 点击外部关闭菜单 */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </div>
  )
}

export default History