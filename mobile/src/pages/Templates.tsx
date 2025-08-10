import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Search, 
  Grid3X3, 
  List, 
  Sparkles,
  X
} from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { useAuthStore } from '../store/useAuthStore'
import { Template, TemplateCategory } from '../lib/api'
import { toast } from 'sonner'
import TemplateCard from '../components/TemplateCard'
import { Float, Pulse } from '../motions'

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
  const sortedTemplates = useMemo(() => {
    const sorted = [...templates]
    return sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  }, [templates])

  // 搜索防抖 - 使用useCallback优化
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
  }, [localSearchQuery, searchQuery, setSearchQuery, searchTemplates, loadTemplates])

  // 处理分类选择 - 使用useCallback优化
  const handleCategorySelect = useCallback((category: TemplateCategory | null) => {
    setSelectedCategory(category)
  }, [setSelectedCategory])

  // 处理模板使用 - 使用useCallback优化
  const handleUseTemplate = useCallback(async (template: Template) => {
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
  }, [isAuthenticated, useTemplate, navigate])

  // 处理收藏 - 使用useCallback优化
  const handleToggleFavorite = useCallback((templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
      toast.success('已取消收藏')
    } else {
      newFavorites.add(templateId)
      toast.success('已添加到收藏')
    }
    setFavorites(newFavorites)
  }, [favorites])

  // 格式化数字 - 使用useCallback优化
  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }, [])

  // 获取分类图标 - 使用useMemo优化
  const getCategoryIcon = useCallback((categoryName: string) => {
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
  }, [])

  
  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
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
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300/50 focus:border-primary-300/50 focus:bg-white/90 shadow-soft"
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
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium flex items-center space-x-1.5 ${
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
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium flex items-center space-x-1.5 ${
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
                <Pulse duration={2}>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-primary-400" size={32} />
                  </div>
                </Pulse>
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
                <Float duration={6}>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-primary-400 mx-auto mb-1" size={40} />
                    <div className="w-2 h-2 bg-primary-300 rounded-full mx-auto animate-ping"></div>
                  </div>
                </Float>
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
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-medium"
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
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    viewMode={viewMode}
                    isFavorite={favorites.has(template.id.toString())}
                    onUseTemplate={handleUseTemplate}
                    onToggleFavorite={handleToggleFavorite}
                    getCategoryIcon={getCategoryIcon}
                    formatNumber={formatNumber}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 px-3 py-4">
                {sortedTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    viewMode={viewMode}
                    isFavorite={favorites.has(template.id.toString())}
                    onUseTemplate={handleUseTemplate}
                    onToggleFavorite={handleToggleFavorite}
                    getCategoryIcon={getCategoryIcon}
                    formatNumber={formatNumber}
                  />
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