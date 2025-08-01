import { useState, useEffect, useMemo, memo } from 'react';
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

  // 直接使用templates状态，后端已经处理了筛选 - 使用useMemo优化性能
  const filteredTemplates = useMemo(() => 
    templates.filter(template => template && typeof template === 'object'),
    [templates]
  );

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

  const popularTemplates = useMemo(() => 
    templates.filter(t => t && t.isPopular).slice(0, 6),
    [templates]
  );

  return (
    <div className="min-h-screen pt-4 lg:pt-8 pb-20 lg:pb-16" style={{ contain: 'layout style', willChange: 'scroll-position' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-3xl xs:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
            模板库
          </h1>
          <p className="text-lg xs:text-xl text-gray-600 px-2">
            精选优质模板，激发您的创作灵感
          </p>
        </div>

        {/* 热门模板轮播 */}
        {popularTemplates.length > 0 && (
          <div className="mb-8 lg:mb-12">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 lg:p-8 text-white mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold mb-2 flex items-center">
                <Star className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                热门推荐
              </h2>
              <p className="text-purple-100 text-sm lg:text-base">最受欢迎的创作模板</p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" style={{ contain: 'layout' }}>
              {popularTemplates.map((template, index) => (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group"
                  style={{ willChange: 'transform', contain: 'layout style' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={template.preview || '/placeholder-template.png'}
                      alt={template.title || '模板预览'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      style={{ willChange: 'transform' }}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-template.png';
                      }}
                    />

                    {/* 类型标识 */}
                    <div className="absolute top-3 left-3 z-20">
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
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-yellow-500 rounded-lg px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-white fill-current" />
                        <span className="text-xs text-white font-medium">热门</span>
                      </div>
                    </div>

                    {/* 悬停操作 - 确保完全覆盖 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                      <Link
                        to={`/generate?template=${template.id}`}
                        onClick={() => handleUseTemplate(template)}
                        className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-150 flex items-center space-x-2"
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 搜索和过滤器 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col space-y-4">
            {/* 搜索框和视图切换 */}
            <div className="flex flex-col xs:flex-row xs:items-center space-y-3 xs:space-y-0 xs:space-x-4">
              {/* 搜索框 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[48px]"
                />
              </div>

              {/* 视图切换 */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 lg:p-2 rounded-lg transition-colors min-w-[48px] min-h-[48px] lg:min-w-auto lg:min-h-auto flex items-center justify-center ${
                    viewMode === 'grid'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 lg:p-2 rounded-lg transition-colors min-w-[48px] min-h-[48px] lg:min-w-auto lg:min-h-auto flex items-center justify-center ${
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 分类过滤 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">分类筛选</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id === 0 ? '全部' : category.id.toString())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${
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
          </div>
        </div>

        {/* 模板网格/列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载模板中...</p>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
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
          </div>
        ) : (
          <div
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
              : 'space-y-4'
            }
            style={{ contain: 'layout', willChange: 'contents' }}
          >
            {filteredTemplates.map((template, index) => (
              viewMode === 'grid' ? (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group"
                  style={{ willChange: 'transform', contain: 'layout style' }}
                >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                          src={template.preview || '/placeholder-template.png'}
                          alt={template.title || '模板预览'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          style={{ willChange: 'transform' }}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-template.png';
                          }}
                        />

                      {/* 类型标识 */}
                      <div className="absolute top-3 left-3 z-20">
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

                      {/* 悬停操作 - 确保完全覆盖 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                        <Link
                          to={`/generate?template=${template.id}`}
                          onClick={() => handleUseTemplate(template)}
                          className="bg-white text-gray-900 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-150 flex items-center space-x-2 min-h-[44px]"
                        >
                          <Wand2 className="w-4 h-4" />
                          <span className="text-sm lg:text-base">使用模板</span>
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
                        </div>
                      </div>

                      {/* 标签显示 */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">+{template.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                </div>
              ) : (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
                  style={{ willChange: 'transform', contain: 'layout style' }}
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

                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {template.categoryId || '其他'}
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{template.views || 0}</span>
                          </span>
                        </div>

                        {/* 标签显示 */}
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 4).map((tag, tagIndex) => (
                              <span key={tagIndex} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 4 && (
                              <span className="text-gray-400 text-xs">+{template.tags.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <Link
                          to={`/generate?template=${template.id}`}
                          onClick={() => handleUseTemplate(template)}
                          className="bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors duration-150 flex items-center space-x-2 min-h-[44px]"
                        >
                          <Wand2 className="w-4 h-4" />
                          <span className="text-sm lg:text-base">使用</span>
                        </Link>
                      </div>
                    </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* 加载更多 */}
        {filteredTemplates.length > 0 && filteredTemplates.length % 12 === 0 && (
          <div className="text-center mt-12">
            <button className="bg-gray-100 text-gray-600 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              加载更多模板
            </button>
          </div>
        )}
      </div>
    </div>
  );
}