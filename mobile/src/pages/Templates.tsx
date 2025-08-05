import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Eye, 
  Play, 
  Heart, 
  Sparkles,
  TrendingUp,
  Clock,
  User,
  Tag,
  ChevronDown
} from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { useAuthStore } from '../store/useAuthStore'
import { Template, TemplateCategory } from '../lib/api'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'list'
type SortType = 'popular' | 'newest' | 'rating' | 'downloads'

const Templates: React.FC = () => {
  const navigate = useNavigate()
  const { 
    templates, 
    categories, 
    selectedCategory, 
    searchQuery,
    isLoading,
    loadTemplates,
    loadCategories,
    searchTemplates,
    setSelectedCategory,
    setSearchQuery,
    useTemplate
  } = useTemplateStore()
  const { isAuthenticated } = useAuthStore()

  // 状态管理
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortType, setSortType] = useState<SortType>('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  // 初始化
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadTemplates(),
          loadCategories()
        ])
      } catch (error) {
        console.error('[Templates] Failed to load data:', error)
      }
    }
    loadData()
  }, [])


  // 排序模板 - 移到useEffect之前
  const sortedTemplates = React.useMemo(() => {
    const sorted = [...templates]
    
    switch (sortType) {
      case 'popular':
        return sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'downloads':
        return sorted.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
      default:
        return sorted
    }
  }, [templates, sortType])


  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery)
        if (localSearchQuery) {
          searchTemplates(localSearchQuery)
        } else {
          loadTemplates()
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearchQuery])

  // 处理分类选择
  const handleCategorySelect = (category: TemplateCategory | null) => {
    setSelectedCategory(category)
    setShowCategoryFilter(false)
    loadTemplates()
  }

  // 处理模板使用
  const handleUseTemplate = async (template: Template) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await useTemplate(template.id)
      navigate('/create', { 
        state: { 
          template,
          type: template.type || 'image'
        } 
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || error.toString())
    }
  }

  // 处理收藏
  const handleToggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
      toast.success('已取消收藏')
    } else {
      newFavorites.add(templateId)
      toast.success('已添加到收藏')
    }
    setFavorites(newFavorites)
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="relative safe-area-top px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-800">模板库</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft"
            >
              {viewMode === 'grid' ? (
                <List size={18} className="text-gray-600" />
              ) : (
                <Grid3X3 size={18} className="text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft"
            >
              <Filter size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/60 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          />
        </div>

        {/* 分类筛选 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="flex items-center space-x-2 px-3 py-2 bg-white/60 rounded-xl border border-white/60"
          >
            <Tag size={16} className="text-gray-600" />
            <span className="text-sm text-gray-600">
              {selectedCategory ? selectedCategory.name : '全部分类'}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>

        {/* 分类下拉菜单 */}
        <AnimatePresence>
          {showCategoryFilter && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-6 right-6 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-60 overflow-y-auto scrollbar-hide"
            >
              <button
                onClick={() => handleCategorySelect(null)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  !selectedCategory ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                }`}
              >
                全部分类
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    selectedCategory?.id === category.id ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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
                  <option value="popular">最受欢迎</option>
                  <option value="newest">最新发布</option>
                  <option value="rating">评分最高</option>
                  <option value="downloads">下载最多</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        ) : sortedTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-600 mb-2">暂无模板</p>
              <p className="text-sm text-gray-500">尝试调整搜索条件或分类筛选</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4">
                {sortedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-soft overflow-hidden"
                  >
                    {/* 模板预览 */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {template.imageUrl ? (
                        <img 
                          src={template.imageUrl} 
                          alt={template.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-template.jpg'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="text-gray-400" size={32} />
                        </div>
                      )}
                      
                      {/* 悬浮操作 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Play size={16} className="text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(template.id.toString())}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart 
                            size={16} 
                            className={`${
                              favorites.has(template.id.toString()) 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-700'
                            }`} 
                          />
                        </button>
                      </div>

                      {/* 标签 */}
                      {template.isPremium && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full">
                            PRO
                          </span>
                        </div>
                      )}
                      
                      {template.isHot && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                            <TrendingUp size={10} />
                            <span>热门</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 模板信息 */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                        {template.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {template.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{formatNumber(template.usageCount || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star size={12} className="text-yellow-400 fill-current" />
                          <span>{template.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-soft p-4"
                  >
                    <div className="flex space-x-3">
                      {/* 缩略图 */}
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {template.imageUrl ? (
                          <img 
                            src={template.imageUrl} 
                            alt={template.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-template.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="text-gray-400" size={20} />
                          </div>
                        )}
                      </div>

                      {/* 模板信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                              {template.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {template.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User size={12} />
                                <span>{template.author || '官方'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye size={12} />
                                <span>{formatNumber(template.usageCount || 0)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star size={12} className="text-yellow-400 fill-current" />
                                <span>{template.rating?.toFixed(1) || '0.0'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{new Date(template.createdAt).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center space-x-2 ml-2">
                            <button
                              onClick={() => handleToggleFavorite(template.id.toString())}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Heart 
                                size={16} 
                                className={`${
                                  favorites.has(template.id.toString()) 
                                    ? 'text-red-500 fill-current' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </button>
                            <button
                              onClick={() => handleUseTemplate(template)}
                              className="px-3 py-1 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors"
                            >
                              使用
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 点击外部关闭分类菜单 */}
      {showCategoryFilter && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowCategoryFilter(false)}
        />
      )}
    </div>
  )
}

export default Templates