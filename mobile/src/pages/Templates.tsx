import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Grid3X3, 
  List, 
  Eye, 
  Play, 
  Heart, 
  Sparkles,
  Clock,
  User,
  X
} from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { useAuthStore } from '../store/useAuthStore'
import { Template, TemplateCategory } from '../lib/api'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'list'

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


  // 排序模板 - 按使用次数排序
  const sortedTemplates = React.useMemo(() => {
    const sorted = [...templates]
    return sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  }, [templates])

  // 页面进入动画
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  }

  // 卡片动画
  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  }


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
    // setSelectedCategory内部已经会调用loadTemplates，无需重复调用
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

  // 获取分类图标
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, string> = {
      '人物': '👤',
      '风景': '🏞️',
      '动物': '🐾',
      '美食': '🍔',
      '科技': '🔬',
      '艺术': '🎨',
      '商业': '💼',
      '教育': '📚',
      '生活': '🏠',
      '运动': '⚽',
      '音乐': '🎵',
      '电影': '🎬',
      '游戏': '🎮',
      '时尚': '👗',
      '旅行': '✈️',
      '摄影': '📸',
      '设计': '✏️',
      '其他': '📌'
    }
    return iconMap[categoryName] || '📁'
  }

  
  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* 头部 */}
      <motion.div 
        className="relative safe-area-top bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-transparent backdrop-blur-sm border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 头部标题和操作区 */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">模板库</h1>
                <p className="text-xs text-gray-500">发现创意灵感，提升创作效率</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:bg-white/90 transition-colors"
              >
                {viewMode === 'grid' ? (
                  <List size={16} className="text-gray-600" />
                ) : (
                  <Grid3X3 size={16} className="text-gray-600" />
                )}
              </button>
              </div>
          </div>

          {/* 高级搜索栏 */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </div>
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="搜索模板名称、描述或标签..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300/50 focus:bg-white/90 transition-all duration-200 shadow-soft"
            />
            {localSearchQuery && (
              <button
                onClick={() => setLocalSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* 分类筛选标签 */}
        <div className="px-3 pb-3">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                !selectedCategory 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg' 
                  : 'bg-white/70 backdrop-blur-sm text-gray-600 border border-white/60 hover:bg-white/80 hover:shadow-soft'
              }`}
            >
              <span>🌟</span>
              <span>全部</span>
              {!selectedCategory && (
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {templates.length}
                </span>
              )}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                  selectedCategory?.id === category.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-white/70 backdrop-blur-sm text-gray-600 border border-white/60 hover:bg-white/80 hover:shadow-soft'
                }`}
              >
                <span>{getCategoryIcon(category.name)}</span>
                <span>{category.name}</span>
                {selectedCategory?.id === category.id && (
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {templates.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        </motion.div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-12">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
                  <Sparkles className="text-primary-400" size={32} />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                  <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">正在加载模板</h3>
              <p className="text-sm text-gray-500">为您精心挑选优质模板，请稍候...</p>
            </div>
          </div>
        ) : sortedTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                  <div className="text-center">
                    <Sparkles className="text-primary-400 mx-auto mb-1" size={40} />
                    <div className="w-2 h-2 bg-primary-300 rounded-full mx-auto animate-ping"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无相关模板</h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery || selectedCategory 
                  ? `没有找到"${searchQuery || selectedCategory?.name}"相关的模板，试试其他关键词吧`
                  : '模板库正在整理中，敬请期待更多精彩内容'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory(null)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                  >
                    🔄 重置筛选
                  </button>
                )}
                <button
                  onClick={() => loadTemplates()}
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/60 text-gray-700 rounded-lg text-sm font-medium hover:bg-white/80 transition-colors"
                >
                  🔄 重新加载
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3 px-3 py-4">
                {sortedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    className="group relative"
                  >
                    {/* 主卡片 */}
                    <div className="card-glow h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {/* 模板预览区域 */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {template.imageUrl ? (
                          <img 
                            src={template.imageUrl} 
                            alt={template.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-template.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                            <div className="text-center">
                              <Sparkles className="text-primary-400 mx-auto mb-2" size={32} />
                              <p className="text-xs text-primary-600 font-medium">暂无预览</p>
                            </div>
                          </div>
                        )}
                        
                        {/* 渐变遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* 顶部标签 */}
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                          <div className="flex flex-col space-y-1">
                            {template.isPremium && (
                              <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                ✨ PRO
                              </span>
                            )}
                            {template.isHot && (
                              <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center space-x-1">
                                <TrendingUp size={10} />
                                <span>热门</span>
                              </span>
                            )}
                          </div>
                          
                          {/* 收藏按钮 */}
                          <button
                            onClick={() => handleToggleFavorite(template.id.toString())}
                            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/30"
                          >
                            <Heart 
                              size={14} 
                              className={`${
                                favorites.has(template.id.toString()) 
                                  ? 'text-red-400 fill-current' 
                                  : 'text-white'
                              }`} 
                            />
                          </button>
                        </div>
                        
                        {/* 底部操作按钮 */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="w-full py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-lg shadow-lg hover:bg-white transition-colors flex items-center justify-center space-x-1"
                          >
                            <Play size={12} />
                            <span>使用模板</span>
                          </button>
                        </div>
                      </div>

                      {/* 模板信息 */}
                      <div className="p-3 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                              {template.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* 统计信息 */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Eye size={11} className="text-primary-500" />
                              <span className="font-medium">{formatNumber(template.usageCount || 0)}</span>
                            </div>
                          </div>
                          
                          {/* 类型指示器 */}
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              template.type === 'image' 
                                ? 'bg-blue-400' 
                                : 'bg-purple-400'
                            }`}></div>
                            <span className="text-xs text-gray-500 font-medium">
                              {template.type === 'image' ? '图片' : '视频'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 px-3 py-4">
                {sortedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    className="group cursor-pointer"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="card-glow hover:shadow-xl transition-all overflow-hidden">
                      {/* 大图展示区域 */}
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {template.imageUrl ? (
                          <img
                            src={template.imageUrl}
                            alt={template.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-template.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Sparkles className="text-gray-400 mb-2" size={32} />
                              <div className="text-xs text-gray-500">模板预览</div>
                            </div>
                          </div>
                        )}
                        
                        {/* 顶部标签 */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-1">
                          {template.isPremium && (
                            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                              ✨ PRO
                            </span>
                          )}
                          {template.isHot && (
                            <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center space-x-1">
                              <TrendingUp size={10} />
                              <span>热门</span>
                            </span>
                          )}
                        </div>
                        
                        {/* 收藏按钮 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(template.id.toString())
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/30"
                        >
                          <Heart 
                            size={16} 
                            className={`${favorites.has(template.id.toString()) ? 'text-red-400 fill-current' : 'text-white'}`} 
                          />
                        </button>
                        
                        {/* 遮罩层 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <div className="text-white">
                                <div className="text-sm font-medium mb-1">
                                  {getCategoryIcon(template.category || '')} {template.category}
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="flex items-center space-x-1">
                                    <Eye size={14} />
                                    <span>{formatNumber(template.usageCount || 0)}次使用</span>
                                  </span>
                                </div>
                              </div>
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30">
                                <Play size={20} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 内容区域 */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                              {template.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* 操作栏 */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-medium">
                                {getCategoryIcon(template.category || '')} {template.category}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                template.type === 'image' 
                                  ? 'bg-blue-400' 
                                  : 'bg-purple-400'
                              }`}></div>
                              <span className="text-xs text-gray-500 font-medium">
                                {template.type === 'image' ? '图片' : '视频'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Eye size={14} className="text-primary-500" />
                                <span className="font-medium">{formatNumber(template.usageCount || 0)}</span>
                              </div>
                            </div>
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


    </motion.div>
  )
}

export default Templates