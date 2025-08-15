import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Search, Filter, Download, Share2, Trash2, Image as ImageIcon, Video, Calendar, Clock, Loader2, Play } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { contentAPI } from '@/lib/api';
import { downloadContent, shareContent, handleApiError } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import CustomSelect from '@/components/ui/CustomSelect';
import MediaPreviewModal from '@/components/ui/MediaPreviewModal';
import { parseAspectRatio } from '@/utils/aspectRatio';

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    title?: string;
  }>({ isOpen: false, mediaUrl: '', mediaType: 'image' });

  const openPreview = (url: string, type: 'image' | 'video', title?: string) => {
    setPreviewModal({ isOpen: true, mediaUrl: url, mediaType: type, title });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, mediaUrl: '', mediaType: 'image' });
  };

  // 类型过滤器选项
  const filterTypeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' }
  ];

  // 添加加载状态追踪
  const [mediaLoadStatus, setMediaLoadStatus] = useState<Record<string, boolean>>({});

  // 优化状态更新函数
  const updateMediaLoadStatus = useCallback((id: string, status: boolean) => {
    setMediaLoadStatus(prev => {
      if (prev[id] === status) return prev;
      return { ...prev, [id]: status };
    });
  }, []);

  // 排序选项
  const sortByOptions = [
    { value: 'newest', label: '最新优先' },
    { value: 'oldest', label: '最早优先' }
  ];

  const { history, loadHistory, refreshHistory, isLoadingHistory } = useGenerationStore();
  const { isAuthenticated } = useAuthStore();

  // 组件挂载时和过滤类型改变时加载历史记录
  useEffect(() => {
    if (isAuthenticated) {
      const type = filterType === 'all' ? undefined : filterType;
      loadHistory(1, 20, type);
    }
  }, [isAuthenticated, loadHistory, filterType]);


  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 过滤和排序历史记录
  const filteredHistory = history
    .filter(item => {
      if (!item || typeof item !== 'object') return false;
      const prompt = item.prompt || '';
      const type = item.type || '';
      const matchesSearch = prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
    });

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(item => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    if (!window.confirm(`确定要删除选中的 ${selectedItems.length} 个项目吗？此操作不可恢复。`)) {
      return;
    }

    try {
      // 使用API批量删除
      await contentAPI.batchDeleteContents(selectedItems);

      // 刷新历史记录
      await refreshHistory();

      setSelectedItems([]);
      toast.success(`已删除 ${selectedItems.length} 个项目`);
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请稍后重试');
    }
  };

  const handleDownload = (item: { id: string; url?: string; type?: string }) => {
    if (!item || !item.url) {
      toast.error('下载失败：无效的文件链接');
      return;
    }

    // 检查媒体是否加载失败
    if (mediaLoadStatus[item.id] === false) {
      toast.error('下载失败：媒体加载失败');
      return;
    }

    try {
      downloadContent(item);
      toast.success('下载开始');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleShare = async (item: { id: string; url?: string; prompt?: string; type?: string }) => {
    if (!item || !item.url) {
      toast.error('分享失败：无效的内容链接');
      return;
    }

    // 检查媒体是否加载失败
    if (mediaLoadStatus[item.id] === false) {
      toast.error('分享失败：媒体加载失败');
      return;
    }

    try {
      await shareContent(item);
      toast.success('分享成功');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error(handleApiError(error));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} 小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-8 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后即可查看您的创作历史记录</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 active:translate-y-0"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 瀑布流历史记录卡片组件
  const MasonryHistoryCard = memo(({ item, onSelectItem, onDownload, onShare, openPreview, mediaLoadStatus, updateMediaLoadStatus, selectedItems }: {
    item: any;
    onSelectItem: (id: string) => void;
    onDownload: (item: any) => void;
    onShare: (item: any) => void;
    openPreview: (url: string, type: 'image' | 'video', title?: string) => void;
    mediaLoadStatus: Record<string, boolean>;
    updateMediaLoadStatus: (id: string, status: boolean) => void;
    selectedItems: string[];
  }) => {
    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.status === 'failed') return;
      if (mediaLoadStatus[item.id] !== false) {
        if (item.type === 'video') {
          openPreview(item.url || '', 'video', item.prompt);
        } else {
          openPreview(item.url || '', 'image', item.prompt);
        }
      }
    };

    const handleDownloadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDownload(item);
    };

    const handleShareClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onShare(item);
    };

    const handleImageError = () => {
      updateMediaLoadStatus(item.id, false);
    };

    const handleImageLoad = () => {
      updateMediaLoadStatus(item.id, true);
    };

    const renderContent = () => {
      if (item.status === 'failed') {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
            <ImageIcon className="w-12 h-12 text-red-400 mb-2" />
            <p className="text-sm text-red-600 font-medium">生成失败</p>
            <p className="text-xs text-red-500 mt-1 px-2 text-center">
              {(item as any).errorMessage || '请修改提示词后重试'}
            </p>
          </div>
        );
      }

      if (mediaLoadStatus[item.id] === false) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">加载失败</p>
          </div>
        );
      }

      return (
        <>
          <img
            src={item.type === 'video' ? (item as any).thumbnail || item.url : item.url || '/placeholder-image.png'}
            alt={item.prompt || '生成内容'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          
          {/* 视频播放按钮 */}
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-white/95 text-gray-800 p-3 rounded-full shadow-xl">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
            </div>
          )}

          {/* 视频标识 */}
          {item.type === 'video' && (
            <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
              <Video className="w-3 h-3 inline mr-1" />
              视频
            </div>
          )}

          {/* 选择状态 */}
          <div className="absolute top-2 right-2">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedItems.includes(item.id)
                ? 'bg-purple-600 border-purple-600'
                : 'bg-white/50 border-white backdrop-blur-sm'
            }`}>
              {selectedItems.includes(item.id) && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="absolute bottom-2 right-2 flex space-x-1 z-20">
            <button
              onClick={handleDownloadClick}
              className="action-button bg-white/90 text-gray-700 p-2.5 lg:p-2 rounded-full shadow-lg min-w-[40px] min-h-[40px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
              title="下载"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareClick}
              className="action-button bg-white/90 text-gray-700 p-2.5 lg:p-2 rounded-full shadow-lg min-w-[40px] min-h-[40px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
              title="分享"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </>
      );
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden group mb-4 masonry-card">
        {/* 图片容器 - 根据宽高比动态计算高度 */}
        <div className="relative overflow-hidden bg-gray-100">
          {item.aspectRatio && item.aspectRatio !== '16:9' && item.aspectRatio.trim() !== '' ? (
            <div 
              className="relative w-full"
              style={{ 
                paddingTop: `${(1 / (parseAspectRatio(item.aspectRatio))) * 100}%` 
              }}
            >
              <div
                className="absolute inset-0 cursor-pointer overflow-hidden bg-gray-100"
                onClick={handleCardClick}
              >
                {renderContent()}
              </div>
            </div>
          ) : (
            <div className="aspect-video">
              <div
                className="relative w-full h-full cursor-pointer overflow-hidden bg-gray-100"
                onClick={handleCardClick}
              >
                {renderContent()}
              </div>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {item.prompt || '无描述'}
          </p>

          <div className="flex items-center justify-between text-xs mb-1">
            <span className="truncate flex-1 mr-2">
              {item.status === 'failed' ? (
                <span className="text-red-600 font-medium">• 生成失败</span>
              ) : (
                <span className="text-gray-500">{item.style || '默认风格'}</span>
              )}
            </span>
            <span className="flex-shrink-0 text-gray-500">{item.createdAt ? formatDate(item.createdAt.toString()) : '未知时间'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="truncate flex-1 mr-2">{item.size || '未知尺寸'}</span>
            <span className="flex-shrink-0">#{item.id ? item.id.slice(-6) : 'unknown'}</span>
          </div>
        </div>
      </div>
    );
  });

  MasonryHistoryCard.displayName = 'MasonryHistoryCard';

  return (
    <div className="history-page min-h-screen relative pt-8 pb-8 flex flex-col">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/static/home3.jpg')"
        }}
      />
      {/* 淡色蒙版 */}
      <div className="absolute inset-0 bg-white/85" />
      
      <div className="relative max-w-full mx-auto px-6 sm:px-12 lg:px-16 flex-1 flex flex-col w-full">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            创作历史
          </h1>
          <p className="text-xl text-gray-600">
            回顾您的精彩创作历程
          </p>
        </div>

        {/* 搜索和过滤器 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* 搜索框 */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索创作内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[48px]"
              />
            </div>

            {/* 过滤器 */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:flex-shrink-0">
              <div className="w-full sm:w-[140px]">
                <CustomSelect
                  value={filterType}
                  onChange={(value) => setFilterType(value as 'all' | 'image' | 'video')}
                  options={filterTypeOptions}
                  placeholder="选择类型"
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <CustomSelect
                  value={sortBy}
                  onChange={(value) => {
                    setSortBy(value as string);
                  }}
                  options={sortByOptions}
                  placeholder="选择排序"
                />
              </div>
            </div>
          </div>

          {/* 批量操作 */}
          {filteredHistory.length > 0 && (
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between space-y-3 xs:space-y-0 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="button-secondary text-sm text-purple-600 min-h-[44px] flex items-center px-3 py-2 rounded-lg"
                >
                  {selectedItems.length === filteredHistory.length ? '取消全选' : '全选'}
                </button>
                {selectedItems.length > 0 && (
                  <span className="text-sm text-gray-500">
                    已选择 {selectedItems.length} 个项目
                  </span>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="button-danger flex items-center space-x-1 px-4 py-2 text-red-600 rounded-lg min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除选中</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 历史记录瀑布流 */}
        {isLoadingHistory ? (
          <div className="flex items-center justify-center min-h-[600px] w-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载历史记录中...</p>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center min-h-[600px] w-full flex items-center justify-center">
            <div>
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' ? '没有找到匹配的创作' : '还没有创作历史'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all'
                  ? '尝试调整搜索条件或过滤器'
                  : '开始您的第一次AI创作吧！'
                }
              </p>
              <Link
                to="/generate"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                开始创作
              </Link>
            </div>
          </div>
        ) : (
          <div className="history-container min-h-[600px] w-full">
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4">
              {filteredHistory.map((item) => (
                <div key={item.id} className="break-inside-avoid">
                  <MasonryHistoryCard
                    item={item}
                    onSelectItem={handleSelectItem}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    openPreview={openPreview}
                    mediaLoadStatus={mediaLoadStatus}
                    updateMediaLoadStatus={updateMediaLoadStatus}
                    selectedItems={selectedItems}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 清空历史按钮 */}
        {history.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={async () => {
                if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
                  try {
                    // 获取所有历史记录的ID
                    const allIds = history.map(item => item.id);
                    if (allIds.length > 0) {
                      await contentAPI.batchDeleteContents(allIds);
                      await refreshHistory();
                    }
                    setSelectedItems([]);
                    toast.success('历史记录已清空');
                  } catch (error) {
                    console.error('清空历史记录失败:', error);
                    toast.error('清空失败，请稍后重试');
                  }
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 active:bg-red-100 active:scale-95"
            >
              清空所有历史记录
            </button>
          </div>
        )}

        {/* 媒体预览模态框 */}
        <MediaPreviewModal
          isOpen={previewModal.isOpen}
          onClose={closePreview}
          mediaUrl={previewModal.mediaUrl}
          mediaType={previewModal.mediaType}
          autoPlay={previewModal.mediaType === 'video'}
          title={previewModal.title}
          onDownload={() => handleDownload({ id: '', url: previewModal.mediaUrl, type: previewModal.mediaType })}
          onShare={() => handleShare({ id: '', url: previewModal.mediaUrl, prompt: previewModal.title, type: previewModal.mediaType })}
        />
      </div>
    </div>
  );
}