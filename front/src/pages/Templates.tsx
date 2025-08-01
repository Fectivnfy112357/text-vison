import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Image as ImageIcon, Video, Wand2, Star, Eye } from 'lucide-react';
import { useTemplateStore } from '@/store/useTemplateStore';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Templates() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { 
    templates, 
    categories, 
    searchQuery, 
    selectedCategory,
    isLoading, 
    fetchTemplates, 
    setSelectedCategory, 
    setSearchQuery,
    loadCategories 
  } = useTemplateStore();
  
  // 直接使用templates状态，后端已经处理了筛选
  const filteredTemplates = templates.filter(template => template && typeof template === 'object');

  useEffect(() => {
    const loadData = async () => {
      try {
        // 先加载分类，再加载模板
        await loadCategories();
        await fetchTemplates();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败，请重试';
        toast.error(errorMessage);
      }
    };
    loadData();
   }, [fetchTemplates, loadCategories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleUseTemplate = (template: any) => {
    // 移除toast提示，避免与Generate页面的提示重复
  };

  const popularTemplates = templates.filter(t => t && t.isPopular).slice(0, 6);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            模板库
          </h1>
          <p className="text-xl text-gray-600">
            精选优质模板，激发您的创作灵感
          </p>
        </div>

        {/* 热门模板轮播 */}
        {popularTemplates.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Star className="w-6 h-6 mr-2" />
                热门推荐
              </h2>
              <p className="text-purple-100">最受欢迎的创作模板</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative aspect-video">
                    <img
                      src={template.preview || '/placeholder-template.png'}
                      alt={template.title || '模板预览'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-template.png';
                      }}
                    />
                    
                    {/* 类型标识 */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                        {template.type === 'video' ? (
                          <Video className="w-3 h-3 text-white" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-white" />
                        )}
                        <span className="text-xs text-white capitalize">
                          {template.type === 'video' ? '视频' : '图片'}
                        </span>
                      </div>
                    </div>

                    {/* 热门标识 */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500 rounded-lg px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-white fill-current" />
                        <span className="text-xs text-white font-medium">热门</span>
                      </div>
                    </div>

                    {/* 悬停操作 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link
                        to={`/generate?template=${template.id}`}
                        onClick={() => handleUseTemplate(template)}
                        className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>使用模板</span>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{template.title || '未命名模板'}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description || '暂无描述'}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {template.categoryId || '其他'}
                      </span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{template.views || 0}</span>
                        </span>
                        <span>{template.style || '默认风格'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

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
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 视图切换 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 分类过滤 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">分类筛选</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id === 0 ? '全部' : category.id.toString())}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === (category.id === 0 ? '全部' : category.id.toString())
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 模板网格/列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载模板中...</p>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              没有找到匹配的模板
            </h3>
            <p className="text-gray-600 mb-6">
              尝试调整搜索关键词或选择其他分类
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('全部');
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              重置筛选条件
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }
          >
            <AnimatePresence>
              {filteredTemplates.map((template, index) => (
                viewMode === 'grid' ? (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative aspect-video">
                      <img
                          src={template.preview || '/placeholder-template.png'}
                          alt={template.title || '模板预览'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-template.png';
                          }}
                        />
                      
                      {/* 类型标识 */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                          {template.type === 'video' ? (
                            <Video className="w-3 h-3 text-white" />
                          ) : (
                            <ImageIcon className="w-3 h-3 text-white" />
                          )}
                          <span className="text-xs text-white capitalize">
                            {template.type === 'video' ? '视频' : '图片'}
                          </span>
                        </div>
                      </div>

                      {/* 悬停操作 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link
                          to={`/generate?template=${template.id}`}
                          onClick={() => handleUseTemplate(template)}
                          className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Wand2 className="w-4 h-4" />
                          <span>使用模板</span>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{template.title || '未命名模板'}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description || '暂无描述'}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {template.categoryId || '其他'}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{template.views || 0}</span>
                          </span>
                          <span>{template.style || '默认风格'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-16 flex-shrink-0">
                        <img
                          src={template.preview || '/placeholder-template.png'}
                          alt={template.title || '模板预览'}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-template.png';
                          }}
                        />
                        <div className="absolute top-1 left-1">
                          <div className="bg-black/50 backdrop-blur-sm rounded px-1 py-0.5 flex items-center space-x-1">
                            {template.type === 'video' ? (
                              <Video className="w-2 h-2 text-white" />
                            ) : (
                              <ImageIcon className="w-2 h-2 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.title || '未命名模板'}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{template.description || '暂无描述'}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {template.category || '其他'}
                          </span>
                          <span>{template.style || '默认风格'}</span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{template.views || 0}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Link
                          to={`/generate?template=${template.id}`}
                          onClick={() => handleUseTemplate(template)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                          <Wand2 className="w-4 h-4" />
                          <span>使用</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 加载更多 */}
        {filteredTemplates.length > 0 && filteredTemplates.length % 12 === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <button className="bg-gray-100 text-gray-600 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              加载更多模板
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}