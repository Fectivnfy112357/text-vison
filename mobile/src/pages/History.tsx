import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  RefreshCw,
  Eye,
  Clock
} from 'lucide-react'
import { useGenerationStore } from '../store/useGenerationStore'
import { useAuthStore } from '../store/useAuthStore'
import { GenerationContent } from '../lib/api'
import { toast } from 'sonner'
import HistoryItem from '../components/HistoryItem'

type FilterType = 'all' | 'image' | 'video'
type SortType = 'newest' | 'oldest' | 'name'

const History: React.FC = () => {
  const navigate = useNavigate()
  const { 
    history, 
    isLoading, 
    loadHistory, 
    refreshHistory, 
    removeFromHistory
  } = useGenerationStore()
  const { isAuthenticated } = useAuthStore()

  // 状态管理
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortType, _setSortType] = useState<SortType>('newest')
  const [_showFilters, _setShowFilters] = useState(false)
  const [selectedItems, _setSelectedItems] = useState<Set<string>>(new Set())
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [_isSelectionMode, _setIsSelectionMode] = useState(false)

  
  // 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    loadHistory()
    
    // 组件卸载时清理轮询
    return () => {
      // destroy 方法将在 useGenerationStore 中实现
    }
  }, [isAuthenticated, loadHistory])

  // 过滤和排序历史记录
  const filteredHistory = React.useMemo(() => {
    if (!history || !Array.isArray(history)) {
      return []
    }
    
    let filtered = history.filter(item => {
      // 类型过滤
      if (filterType !== 'all' && item.type !== filterType) {
        return false
      }
      
      // 搜索过滤
      if (searchQuery) {
        return item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      }
      
      return true
    })

    // 排序
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

    return filtered
  }, [history, filterType, searchQuery, sortType])

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

  // 处理查看详情 - 使用useCallback优化
  const handleViewDetail = useCallback((item: GenerationContent) => {
    // 这里可以导航到详情页面或打开模态框
    console.log('查看详情:', item)
  }, [])

  // 如果未认证，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="text-primary-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">未登录</h3>
            <p className="text-sm text-gray-500 mb-8">登录后查看创作历史记录</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="safe-area-top px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-800">创作历史</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft"
            >
              <RefreshCw size={18} className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索创作内容..."
            className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/60 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          />
        </div>

        {/* 过滤器 */}
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {(['all', 'image', 'video'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/60 text-gray-600'
                }`}
              >
                {type === 'all' ? '全部' : type === 'image' ? '图片' : '视频'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>


      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="text-gray-400" size={32} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-medium text-gray-700">暂无创作历史</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  还没有创作记录，开始你的第一次AI创作之旅吧
                </p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/create')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-soft hover:shadow-lg transition-all"
              >
                开始创作
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={selectedItems.has(item.id)}
                  onViewDetail={handleViewDetail}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </div>
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