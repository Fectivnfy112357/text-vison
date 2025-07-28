import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Share2, Trash2, Image as ImageIcon, Video, Calendar, Clock } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const { history, removeFromHistory, clearHistory } = useGenerationStore();
  const { isAuthenticated } = useAuthStore();

  // 过滤和排序历史记录
  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    selectedItems.forEach(id => removeFromHistory(id));
    setSelectedItems([]);
    toast.success(`已删除 ${selectedItems.length} 个项目`);
  };

  const handleDownload = (item: any) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `textvision-${item.id}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('下载开始');
  };

  const handleShare = async (item: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的AI创作',
          text: item.prompt,
          url: item.url
        });
      } catch (error) {
        navigator.clipboard.writeText(item.url);
        toast.success('链接已复制到剪贴板');
      }
    } else {
      navigator.clipboard.writeText(item.url);
      toast.success('链接已复制到剪贴板');
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
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索创作内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 过滤器 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部类型</option>
                  <option value="image">图片</option>
                  <option value="video">视频</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">最新优先</option>
                <option value="oldest">最早优先</option>
              </select>
            </div>
          </div>

          {/* 批量操作 */}
          {filteredHistory.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-purple-600 hover:text-purple-700"
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
                    className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除选中</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* 历史记录网格 */}
        {filteredHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
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
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleSelectItem(item.id)}
                >
                  {/* 图片/视频预览 */}
                  <div className="relative aspect-video">
                    <img
                      src={item.url}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 类型标识 */}
                    <div className="absolute top-2 left-2">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                        {item.type === 'video' ? (
                          <Video className="w-3 h-3 text-white" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-white" />
                        )}
                        <span className="text-xs text-white capitalize">
                          {item.type === 'video' ? '视频' : '图片'}
                        </span>
                      </div>
                    </div>

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
                    <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item);
                        }}
                        className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 内容信息 */}
                  <div className="p-4">
                    <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-2">
                      {item.prompt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.style}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{item.size}</span>
                      <span>#{item.id.slice(-6)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 清空历史按钮 */}
        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => {
                if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
                  clearHistory();
                  setSelectedItems([]);
                  toast.success('历史记录已清空');
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              清空所有历史记录
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}