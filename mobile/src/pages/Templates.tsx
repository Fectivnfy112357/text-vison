import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Sparkles,
  X
} from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { Template, TemplateCategory } from '../lib/api'
import { toast } from 'sonner'
import TemplateCard from '../components/TemplateCard'


// 页面切换动画
const pageVariants = {
  initial: { 
    opacity: 0, 
    x: 100 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

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
    setSearchQuery
  } = useTemplateStore()
  
  // 状态管理
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
    <div 
      className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50"
    >
      {/* 头部 */}
      <div 
        className="relative safe-area-top bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-transparent backdrop-blur-sm border-b border-white/20"
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
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium flex items-center space-x-1.5 transition-all duration-150 transform hover:scale-105 ${
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
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium flex items-center space-x-1.5 transition-all duration-150 transform hover:scale-105 ${
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
      </div>

      {/* 主内容 */}
      <div 
        className="flex-1 overflow-y-auto pb-20"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          contain: 'content',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-12">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-gray-400" size={40} />
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
                    重置筛选
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-4">
            <div className="space-y-3 px-3 py-4">
              {sortedTemplates.map((template, index) => (
                <div key={template.id}>
                  <TemplateCard
                    template={template}
                    index={index}
                    getCategoryIcon={getCategoryIcon}
                    formatNumber={formatNumber}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Templates