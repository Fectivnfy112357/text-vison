import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Image, 
  Video, 
  Download, 
  Share2, 
  Trash2, 
  MoreVertical,
  Calendar,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useGenerationStore } from '../store/useGenerationStore'
import { useAuthStore } from '../store/useAuthStore'
import { GenerationContent } from '../lib/api'
import { toast } from 'sonner'

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
  const [sortType, setSortType] = useState<SortType>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadHistory()
  }, [isAuthenticated])

  // 过滤和排序历史记录
  const filteredHistory = React.useMemo(() => {
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

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await removeFromHistory(id)
    } catch (error) {
      // removeFromHistory已经处理了toast提示
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedItems).map(id => removeFromHistory(id))
      )
      setSelectedItems(new Set())
      setIsSelectionMode(false)
      toast.success(`已删除 ${selectedItems.size} 个项目`)
    } catch (error) {
      toast.error('批量删除失败')
    }
  }

  // 处理下载
  const handleDownload = (item: GenerationContent) => {
    if (item.result) {
      const link = document.createElement('a')
      link.href = item.result
      link.download = `${item.type}-${item.id}-${Date.now()}`
      link.click()
    }
  }

  // 处理分享
  const handleShare = async (item: GenerationContent) => {
    if (item.result && navigator.share) {
      try {
        await navigator.share({
          title: 'AI生成内容',
          text: item.prompt,
          url: item.result,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    }
  }

  // 处理查看详情
  const handleViewDetail = (item: GenerationContent) => {
    // 这里可以导航到详情页面或打开模态框
    console.log('查看详情:', item)
  }

  // 切换选择模式
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedItems(new Set())
  }

  // 切换项目选择
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
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
            <button
              onClick={toggleSelectionMode}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isSelectionMode 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white/80 text-gray-600'
              }`}
            >
              {isSelectionMode ? '取消' : '选择'}
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-xl border border-white/60"
          >
            <Filter size={16} className="text-gray-600" />
            <span className="text-sm text-gray-600">筛选</span>
          </button>
          
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

        {/* 展开的过滤器 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-white/60 rounded-xl border border-white/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">排序方式</span>
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value="newest">最新创建</option>
                  <option value="oldest">最早创建</option>
                  <option value="name">按名称</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 批量操作栏 */}
      <AnimatePresence>
        {isSelectionMode && selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 py-3 bg-primary-50 border-b border-primary-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-700">
                已选择 {selectedItems.size} 个项目
              </span>
              <button
                onClick={handleBatchDelete}
                className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
              >
                <Trash2 size={14} />
                <span>删除</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-600 mb-2">暂无创作历史</p>
              <p className="text-sm text-gray-500">开始你的第一次AI创作吧</p>
              <button
                onClick={() => navigate('/create')}
                className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl font-medium"
              >
                开始创作
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="grid gap-4">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card-soft p-4 relative ${
                    selectedItems.has(item.id) ? 'ring-2 ring-primary-300' : ''
                  }`}
                >
                  {/* 选择模式复选框 */}
                  {isSelectionMode && (
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className="absolute top-3 left-3 z-10"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedItems.has(item.id)
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {selectedItems.has(item.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )}

                  <div className={`flex space-x-3 ${isSelectionMode ? 'ml-8' : ''}`}>
                    {/* 缩略图 */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.result ? (
                        item.type === 'image' ? (
                          <img 
                            src={item.result} 
                            alt="Generated content"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={item.result}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === 'image' ? (
                            <Image className="text-gray-400" size={20} />
                          ) : (
                            <Video className="text-gray-400" size={20} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* 内容信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.prompt}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'image' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.type === 'image' ? (
                                <><Image size={12} className="mr-1" />图片</>
                              ) : (
                                <><Video size={12} className="mr-1" />视频</>
                              )}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status === 'completed' ? '已完成' : 
                               item.status === 'processing' ? '处理中' : '失败'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{formatTime(item.createdAt)}</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        {!isSelectionMode && (
                          <div className="relative">
                            <button
                              onClick={() => setShowActionMenu(showActionMenu === item.id ? null : item.id)}
                              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical size={16} className="text-gray-400" />
                            </button>

                            <AnimatePresence>
                              {showActionMenu === item.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-8 w-32 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20"
                                >
                                  <button
                                    onClick={() => {
                                      handleViewDetail(item)
                                      setShowActionMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Eye size={14} />
                                    <span>查看</span>
                                  </button>
                                  {item.result && (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleDownload(item)
                                          setShowActionMenu(null)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Download size={14} />
                                        <span>下载</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleShare(item)
                                          setShowActionMenu(null)
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <Share2 size={14} />
                                        <span>分享</span>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => {
                                      handleDelete(item.id)
                                      setShowActionMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                  >
                                    <Trash2 size={14} />
                                    <span>删除</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
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