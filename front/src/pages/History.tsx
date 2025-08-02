import { useState, useEffect } from 'react';
import { Search, Filter, Download, Share2, Trash2, Image as ImageIcon, Video, Calendar, Clock, Loader2, Play } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { contentAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import CustomSelect from '@/components/ui/CustomSelect';
import MediaPreviewModal from '@/components/ui/MediaPreviewModal';

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

    const link = document.createElement('a');
    link.href = item.url;
    const fileId = item.id || 'unknown';
    const fileType = item.type === 'video' ? 'mp4' : 'jpg';
    link.download = `textvision-${fileId}.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('下载开始');
  };

  const handleShare = async (item: { id: string; url?: string; prompt?: string; type?: string }) => {
    if (!item || !item.url) {
      toast.error('分享失败：无效的内容链接');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: '文生视界 - 创作分享',
          text: item.prompt || '精彩创作内容',
          url: item.url
        });
      } else {
        await navigator.clipboard.writeText(item.url);
        toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(item.url);
        toast.success('链接已复制到剪贴板');
      } catch (clipboardError) {
        toast.error('分享失败：无法访问剪贴板');
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

  return (
    <div className="min-h-screen pt-4 lg:pt-8 pb-20 lg:pb-16 scroll-container mobile-scroll-optimized">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-3xl xs:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
            创作历史
          </h1>
          <p className="text-lg xs:text-xl text-gray-600 px-2">
            回顾您的精彩创作历程
          </p>
        </div>

        {/* 搜索和过滤器 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8">
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

        {/* 历史记录网格 */}
        {isLoadingHistory ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              正在加载历史记录...
            </h3>
            <p className="text-gray-600">
              请稍候，正在获取您的创作历史
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16">
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
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 active:translate-y-0"
            >
              开始创作
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 grid-optimized">
            {filteredHistory.map((item, index) => (
              <div
                key={item.id}
                className={`history-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer card-item md:shadow-lg mobile-performance ${selectedItems.includes(item.id) ? 'ring-2 ring-purple-500' : ''
                  }`}
                onClick={() => handleSelectItem(item.id)}
              >
                  {/* 图片/视频预览 */}
                  <div className="history-card-image relative h-40 xs:h-48 overflow-hidden">
                    {item.type === 'video' ? (
                      <div
                        className="relative w-full h-full cursor-pointer overflow-hidden bg-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(item.url || '', 'video', item.prompt);
                        }}
                      >
                        <video
                          src={item.url || ''}
                          className="w-full h-full object-cover media-optimized"
                          preload="metadata"
                          muted
                          playsInline
                          poster=""
                          onError={(e) => {
                            console.error('Video load error:', e);
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'none';
                          }}
                          onLoadedMetadata={(e) => {
                            const target = e.target as HTMLVideoElement;
                            target.currentTime = 0.1;
                          }}
                        />
                        
                        {/* 播放按钮覆盖层 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/95 text-gray-800 p-3 rounded-full shadow-xl">
                            <Play className="w-6 h-6 ml-0.5" />
                          </div>
                        </div>
                        
                        {/* 视频标识 */}
                        <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                          <Video className="w-3 h-3 inline mr-1" />
                          视频
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url || '/placeholder-image.png'}
                        alt={item.prompt || '生成内容'}
                        className="w-full h-full object-cover cursor-pointer media-optimized"
                        loading="lazy"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(item.url || '', 'image', item.prompt);
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png';
                        }}
                      />
                    )}

                    {/* 选择状态 */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedItems.includes(item.id)
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className="action-button bg-white/90 text-gray-700 p-2.5 lg:p-2 rounded-xl shadow-lg min-w-[40px] min-h-[40px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
                        title="下载"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                        className="action-button bg-white/90 text-gray-700 p-2.5 lg:p-2 rounded-xl shadow-lg min-w-[40px] min-h-[40px] lg:min-w-auto lg:min-h-auto flex items-center justify-center"
                        title="分享"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>


                  </div>

                  {/* 内容信息 */}
                  <div className="p-3 lg:p-4">
                    <p className="text-sm text-gray-600 mb-2 lg:mb-3 line-clamp-2">
                      {item.prompt || '无描述'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1 lg:mb-2">
                      <span className="truncate flex-1 mr-2">{item.style || '默认风格'}</span>
                      <span className="flex-shrink-0">{item.createdAt ? formatDate(item.createdAt.toString()) : '未知时间'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="truncate flex-1 mr-2">{item.size || '未知尺寸'}</span>
                      <span className="flex-shrink-0">#{item.id ? item.id.slice(-6) : 'unknown'}</span>
                    </div>
                  </div>
              </div>
            ))}
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