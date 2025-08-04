
import React, { useState, useEffect } from 'react'
import { 
  NavBar, 
  Search, 
  Tabs, 
  PullRefresh, 
  List, 
  Cell, 
  Image, 
  ActionSheet, 
  Dialog, 
  Toast,
  SwipeCell,
  Checkbox,
  Button,
  Empty,
  Loading
} from 'react-vant'
import { 
  Search as SearchIcon, 
  Filter, 
  Download, 
  Share2, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Play,
  MoreHorizontal,
  Calendar
} from 'lucide-react'
import { useGenerationStore } from '../../store'
import type { GeneratedContent } from '../../store'
import { useUserStore } from '../../store'
import { contentAPI } from '../../lib/api'
import ShareModal from '../../components/common/ShareModal'

type HistoryItem = GeneratedContent

const History = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [actionSheetVisible, setActionSheetVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareItem, setShareItem] = useState<HistoryItem | null>(null)
  
  const { history, loadHistory, refreshHistory, isLoadingHistory } = useGenerationStore()
  const { isAuthenticated } = useUserStore()

  // 过滤和排序历史记录
  const filteredHistory = history
    .filter(item => {
      if (!item || typeof item !== 'object') return false
      const prompt = item.prompt || ''
      const type = item.type || ''
      const matchesSearch = prompt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (!a || !b) return 0
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })

  // 加载历史记录
  useEffect(() => {
    if (isAuthenticated) {
      const type = filterType === 'all' ? undefined : filterType
      loadHistory(1, 20, type)
    }
  }, [isAuthenticated, loadHistory, filterType])

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshHistory()
      setPage(1)
      setHasMore(true)
      Toast.success('刷新成功')
    } catch (error) {
      Toast.fail('刷新失败')
    } finally {
      setRefreshing(false)
    }
  }

  // 加载更多
  const onLoad = async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    try {
      const nextPage = page + 1
      const type = filterType === 'all' ? undefined : filterType
      await loadHistory(nextPage, 20, type)
      setPage(nextPage)
      
      // 如果返回的数据少于20条，说明没有更多了
      if (history.length < nextPage * 20) {
        setHasMore(false)
      }
    } catch (error) {
      Toast.fail('加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 格式化时间
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return '刚刚'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} 小时前`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} 天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  // 处理项目操作
  const handleItemAction = (item: HistoryItem, action: string) => {
    setCurrentItem(item)
    setActionSheetVisible(false)
    
    switch (action) {
      case 'download':
        handleDownload(item)
        break
      case 'share':
        handleShare(item)
        break
      case 'delete':
        handleDelete(item)
        break
    }
  }

  // 下载
  const handleDownload = (item: HistoryItem) => {
    if (!item.url) {
      Toast.fail('下载失败：无效的文件链接')
      return
    }
    
    try {
      const link = document.createElement('a')
      link.href = item.url
      link.download = `${item.type}_${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      Toast.success('下载开始')
    } catch (error) {
      Toast.fail('下载失败')
    }
  }

  // 分享
  const handleShare = (item: HistoryItem) => {
    if (!item.url) {
      Toast.fail('分享失败：无效的内容链接')
      return
    }
    
    setShareItem(item)
    setShowShareModal(true)
  }

  // 删除单个项目
  const handleDelete = (item: HistoryItem) => {
    Dialog.confirm({
      title: '确认删除',
      message: '确定要删除这个创作吗？此操作不可恢复。',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    }).then(async () => {
      try {
        await contentAPI.deleteContent(item.id)
        await refreshHistory()
        Toast.success('删除成功')
      } catch (error) {
        Toast.fail('删除失败')
      }
    }).catch(() => {
      // 用户取消
    })
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedItems.length === 0) return
    
    Dialog.confirm({
      title: '确认删除',
      message: `确定要删除选中的 ${selectedItems.length} 个项目吗？此操作不可恢复。`,
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    }).then(async () => {
      try {
        await contentAPI.batchDeleteContents(selectedItems)
        await refreshHistory()
        setSelectedItems([])
        setIsSelectionMode(false)
        Toast.success(`已删除 ${selectedItems.length} 个项目`)
      } catch (error) {
        Toast.fail('删除失败')
      }
    }).catch(() => {
      // 用户取消
    })
  }

  // 切换选择模式
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedItems([])
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredHistory.map(item => item.id))
    }
  }

  // 切换单个项目选择
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <NavBar 
          title={
            <span className="flex items-center justify-center text-mist-800 font-bold">
              <span className="mr-2 text-2xl animate-bounce-soft">📚</span>
              生成历史
            </span>
          }
          className="mobile-header backdrop-blur-md bg-white/80 border-b border-mist-100" 
        />
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="w-24 h-24 bg-gradient-to-r from-mist-200 to-sky-200 rounded-3xl flex items-center justify-center mb-6 shadow-jelly animate-float">
            <Calendar className="w-12 h-12 text-mist-600" />
          </div>
          <h3 className="text-xl font-bold text-mist-800 mb-3">请先登录</h3>
          <p className="text-mist-600 text-center mb-6 leading-relaxed">登录后即可查看您的创作历史记录</p>
          <div className="w-16 h-16 bg-mist-100/50 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      <NavBar 
        title={
          <span className="flex items-center justify-center text-mist-800 font-bold">
            <span className="mr-2 text-2xl animate-bounce-soft">📚</span>
            生成历史
          </span>
        }
        className="mobile-header backdrop-blur-md bg-white/80 border-b border-mist-100"
        rightText={
          <span className={`font-medium transition-colors duration-300 ${
            isSelectionMode ? 'text-red-500' : 'text-mist-600'
          }`}>
            {isSelectionMode ? '取消' : '选择'}
          </span>
        }
        onClickRight={toggleSelectionMode}
      />
      
      {/* 搜索栏 - 果冻感设计 */}
      <div className="mx-4 mt-4 mb-6">
        <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="搜索创作内容..."
            shape="round"
            leftIcon={<SearchIcon className="w-4 h-4 text-mist-600" />}
            className="mobile-input"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(177, 151, 252, 0.2)',
              borderRadius: '16px'
            }}
          />
        </div>
      </div>

      {/* 类型筛选 - 果冻感设计 */}
      <div className="mx-4 mb-6">
        <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50">
          <h3 className="text-lg font-bold text-mist-800 mb-4 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">🎯</span>
            类型筛选
          </h3>
          <div className="flex gap-3">
            {[
              { key: 'all', label: '全部', icon: '📋' },
              { key: 'image', label: '图片', icon: '🖼️' },
              { key: 'video', label: '视频', icon: '🎬' }
            ].map((item) => (
              <button
                key={item.key}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  filterType === item.key
                    ? 'bg-gradient-to-r from-mist-500 to-sky-400 text-white shadow-jelly'
                    : 'bg-gradient-to-r from-mist-100/80 to-sky-100/80 text-mist-700 border border-mist-200/50 hover:shadow-md'
                }`}
                onClick={() => setFilterType(item.key as 'all' | 'image' | 'video')}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 批量操作栏 - 果冻感设计 */}
      {isSelectionMode && (
        <div className="mx-4 mb-6">
          <div className="mobile-card backdrop-blur-md bg-gradient-to-r from-red-50/80 to-pink-50/80 border border-red-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
                  onChange={toggleSelectAll}
                  className="text-red-500"
                >
                  <span className="font-medium text-mist-800">全选</span>
                </Checkbox>
                {selectedItems.length > 0 && (
                  <span className="text-sm text-mist-600 bg-white/60 px-3 py-1 rounded-lg">
                    已选择 {selectedItems.length} 个
                  </span>
                )}
              </div>
              {selectedItems.length > 0 && (
                <button
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95 flex items-center"
                  onClick={handleBatchDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 历史记录列表 - 果冻感设计 */}
      <PullRefresh loading={refreshing} onRefresh={onRefresh}>
        <List
          loading={loading}
          finished={!hasMore}
          onLoad={onLoad}
          finishedText="没有更多了"
          loadingText="加载中..."
        >
          {isLoadingHistory && filteredHistory.length === 0 ? (
            <div className="mx-4">
              <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50 flex flex-col items-center justify-center py-16">
                <Loading size="24px" className="mb-4 text-mist-500" />
                <p className="text-mist-600">正在加载历史记录...</p>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="mx-4">
              <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50 flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-mist-100 to-sky-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Calendar className="w-10 h-10 text-mist-500" />
                </div>
                <h3 className="text-lg font-bold text-mist-800 mb-2">
                  {searchQuery || filterType !== 'all'
                    ? '没有找到匹配的创作'
                    : '还没有创作历史'}
                </h3>
                <p className="text-mist-600 text-center mb-4">
                  {searchQuery || filterType !== 'all'
                    ? '试试其他关键词或筛选条件'
                    : '开始你的第一次创作吧'}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button className="px-6 py-3 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-xl font-medium shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95">
                    开始创作
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-4">
              {filteredHistory.map((item) => (
                <SwipeCell
                  key={item.id}
                  rightAction={
                    <div className="flex h-full">
                      <button
                        className="h-full px-6 bg-gradient-to-r from-mist-500 to-sky-400 text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                        onClick={() => handleShare(item)}
                      >
                        分享
                      </button>
                      <button
                        className="h-full px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                        onClick={() => handleDelete(item)}
                      >
                        删除
                      </button>
                    </div>
                  }
                >
                  <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      {/* 选择框 */}
                      {isSelectionMode && (
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="mt-1 text-mist-500"
                        />
                      )}
                      
                      {/* 媒体预览 */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-mist-100 to-sky-100 flex-shrink-0 shadow-soft">
                        {item.type === 'video' ? (
                          <div className="relative w-full h-full">
                            {item.status === 'failed' ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100">
                                <Video className="w-6 h-6 text-red-500" />
                              </div>
                            ) : item.url ? (
                              <>
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                  preload="metadata"
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play className="w-4 h-4 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-mist-500" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            {item.status === 'failed' ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100">
                                <ImageIcon className="w-6 h-6 text-red-500" />
                              </div>
                            ) : item.url ? (
                              <Image
                                src={item.url}
                                fit="cover"
                                className="w-full h-full transition-transform duration-300 hover:scale-110"
                                errorIcon={<ImageIcon className="w-6 h-6 text-mist-500" />}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-mist-500" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* 内容信息 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-mist-800 line-clamp-2 mb-2">
                          {item.prompt || '无提示词'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs mb-2">
                          <span className={`px-3 py-1 font-medium rounded-lg flex items-center ${
                            item.type === 'video'
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600'
                              : 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-600'
                          }`}>
                            {item.type === 'video' ? (
                              <><Video className="w-3 h-3 mr-1" />视频</>
                            ) : (
                              <><ImageIcon className="w-3 h-3 mr-1" />图片</>
                            )}
                          </span>
                          {item.status === 'failed' && (
                            <span className="px-3 py-1 font-medium rounded-lg bg-gradient-to-r from-red-100 to-pink-100 text-red-600">
                              ❌ 生成失败
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-mist-600 bg-white/60 px-2 py-1 rounded-lg inline-block">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                      
                      {/* 操作按钮 */}
                      {!isSelectionMode && (
                        <button
                          className="px-4 py-2 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-lg font-medium shadow-soft transition-all duration-300 hover:scale-105 active:scale-95 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentItem(item)
                            setActionSheetVisible(true)
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </SwipeCell>
              ))}
            </div>
          )}
        </List>
      </PullRefresh>

      {/* 操作菜单 */}
      <ActionSheet
        visible={actionSheetVisible}
        onCancel={() => setActionSheetVisible(false)}
        actions={[
          {
            name: '下载',
            icon: <Download className="w-4 h-4" />,
            callback: () => currentItem && handleItemAction(currentItem, 'download')
          },
          {
            name: '分享',
            icon: <Share2 className="w-4 h-4" />,
            callback: () => currentItem && handleItemAction(currentItem, 'share')
          },
          {
            name: '删除',
            icon: <Trash2 className="w-4 h-4" />,
            color: '#ee0a24',
            callback: () => currentItem && handleItemAction(currentItem, 'delete')
          }
        ]}
        cancelText="取消"
      />
      
      {/* 分享弹窗 */}
      <ShareModal
        visible={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setShareItem(null)
        }}
        shareData={shareItem ? {
          type: shareItem.type,
          url: shareItem.url!,
          title: `我用AI生成了一个${shareItem.type === 'image' ? '图片' : '视频'}`,
          description: shareItem.prompt || '快来看看我的AI创作！',
          thumbnail: shareItem.url
        } : undefined}
      />
    </div>
  )
}

export default History