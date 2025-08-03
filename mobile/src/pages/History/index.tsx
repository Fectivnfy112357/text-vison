
import { useState, useEffect } from 'react'
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
import { useUserStore } from '../../store'
import { contentAPI } from '../../lib/api'
import ShareModal from '../../components/common/ShareModal'

interface HistoryItem {
  id: string
  type: 'image' | 'video'
  prompt: string
  url?: string
  urls?: string[]
  createdAt: Date
  size?: string
  style?: string
  status?: 'generating' | 'processing' | 'completed' | 'failed'
}

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
      <div className="min-h-screen bg-gray-50">
        <NavBar title="生成历史" className="mobile-header" />
        <div className="flex flex-col items-center justify-center h-96 px-4">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">请先登录</h3>
          <p className="text-gray-600 text-center mb-4">登录后即可查看您的创作历史记录</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        title="生成历史" 
        className="mobile-header"
        rightText={isSelectionMode ? '取消' : '选择'}
        onClickRight={toggleSelectionMode}
      />
      
      {/* 搜索栏 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索创作内容..."
          shape="round"
          leftIcon={<SearchIcon className="w-4 h-4" />}
        />
      </div>

      {/* 类型筛选 */}
      <div className="bg-white border-b border-gray-100">
        <Tabs 
          active={filterType} 
          onChange={(name) => setFilterType(name as 'all' | 'image' | 'video')}
          className="px-4"
        >
          <Tabs.TabPane title="全部" name="all" />
          <Tabs.TabPane title="图片" name="image" />
          <Tabs.TabPane title="视频" name="video" />
        </Tabs>
      </div>

      {/* 批量操作栏 */}
      {isSelectionMode && (
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
              onChange={toggleSelectAll}
            >
              全选
            </Checkbox>
            {selectedItems.length > 0 && (
              <span className="text-sm text-gray-500">
                已选择 {selectedItems.length} 个
              </span>
            )}
          </div>
          {selectedItems.length > 0 && (
            <Button
              type="danger"
              size="small"
              onClick={handleBatchDelete}
              icon={<Trash2 className="w-4 h-4" />}
            >
              删除
            </Button>
          )}
        </div>
      )}

      {/* 历史记录列表 */}
      <PullRefresh loading={refreshing} onRefresh={onRefresh}>
        <List
          loading={loading}
          finished={!hasMore}
          onLoad={onLoad}
          finishedText="没有更多了"
          loadingText="加载中..."
        >
          {isLoadingHistory && filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loading size="24px" className="mb-4" />
              <p className="text-gray-500">正在加载历史记录...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <Empty
              image={<Calendar className="w-16 h-16 text-gray-400" />}
              description={
                searchQuery || filterType !== 'all'
                  ? '没有找到匹配的创作'
                  : '还没有创作历史'
              }
            >
              {!searchQuery && filterType === 'all' && (
                <Button type="primary" size="small" className="mt-4">
                  开始创作
                </Button>
              )}
            </Empty>
          ) : (
            filteredHistory.map((item) => (
              <SwipeCell
                key={item.id}
                rightAction={
                  <div className="flex h-full">
                    <Button
                      square
                      type="primary"
                      text="分享"
                      className="h-full"
                      onClick={() => handleShare(item)}
                    />
                    <Button
                      square
                      type="danger"
                      text="删除"
                      className="h-full"
                      onClick={() => handleDelete(item)}
                    />
                  </div>
                }
              >
                <Cell
                  className="py-3"
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleItemSelection(item.id)
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {/* 选择框 */}
                    {isSelectionMode && (
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="mt-1"
                      />
                    )}
                    
                    {/* 媒体预览 */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.type === 'video' ? (
                        <div className="relative w-full h-full">
                          {item.status === 'failed' ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-50">
                              <Video className="w-6 h-6 text-red-400" />
                            </div>
                          ) : item.url ? (
                            <>
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
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
                              <Video className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          {item.status === 'failed' ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-50">
                              <ImageIcon className="w-6 h-6 text-red-400" />
                            </div>
                          ) : item.url ? (
                            <Image
                              src={item.url}
                              fit="cover"
                              className="w-full h-full"
                              errorIcon={<ImageIcon className="w-6 h-6 text-gray-400" />}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 内容信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.prompt || '无提示词'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          {item.type === 'video' ? (
                            <Video className="w-3 h-3 mr-1" />
                          ) : (
                            <ImageIcon className="w-3 h-3 mr-1" />
                          )}
                          {item.type === 'video' ? '视频' : '图片'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                        {item.status === 'failed' && (
                          <>
                            <span>•</span>
                            <span className="text-red-500">生成失败</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    {!isSelectionMode && (
                      <Button
                        size="small"
                        type="default"
                        icon={<MoreHorizontal className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentItem(item)
                          setActionSheetVisible(true)
                        }}
                      />
                    )}
                  </div>
                </Cell>
              </SwipeCell>
            ))
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