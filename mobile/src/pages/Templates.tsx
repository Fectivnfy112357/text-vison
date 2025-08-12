import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles
} from 'lucide-react'
import { useTemplateStore } from '../store/useTemplateStore'
import { useAuthStore } from '../store/useAuthStore'
import { Template, TemplateCategory } from '../lib/api'
import { toast } from 'sonner'
import MasonryTemplateGrid from '../components/MasonryTemplateGrid'



const Templates: React.FC = () => {
  const navigate = useNavigate()
  const { 
    templates, 
    categories, 
    selectedCategory, 
    isLoading,
    pagination,
    loadTemplates,
    loadCategories,
    setSelectedCategory,
    useTemplate
  } = useTemplateStore()
  const { isAuthenticated } = useAuthStore()
  
  // 状态管理
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 初始化 - 分批加载避免阻塞
  useEffect(() => {
    const loadData = async () => {
      try {
        // 先加载分类
        await loadCategories()
        // 再加载第一页模板
        await loadTemplates({ page: 1, size: 20 })
      } catch (error) {
        console.error('[Templates] Failed to load data:', error)
      }
    }
    loadData()
  }, [])


  // 排序模板 - 按使用次数排序，添加缓存
  const sortedTemplates = useMemo(() => {
    console.log('[Templates] Sorting templates', {
      count: templates.length,
      firstTemplate: templates[0]?.title,
      selectedCategory: selectedCategory?.name
    })
    // 只有在templates数组长度变化时才重新排序
    if (templates.length === 0) return []
    
    const sorted = [...templates]
    return sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
  }, [templates]) // 移除selectedCategory依赖，因为API已经返回过滤后的数据

  
  // 处理分类选择 - 使用useCallback优化
  const handleCategorySelect = useCallback((category: TemplateCategory | null) => {
    console.log('[Templates] handleCategorySelect called', {
      category: category?.name || '全部',
      categoryId: category?.id,
      templateCount: category?.templateCount || 0
    })
    setSelectedCategory(category)
    // 触发重新加载第一页
    if (category) {
      console.log('[Templates] Loading templates for category:', category.id)
      loadTemplates({ categoryId: category.id.toString(), page: 1, size: 20 })
    } else {
      console.log('[Templates] Loading all templates')
      loadTemplates({ page: 1, size: 20 })
    }
  }, [setSelectedCategory, loadTemplates])

  // 加载更多数据
  const loadMore = useCallback(async () => {
    console.log('[Templates] loadMore called', {
      isLoadingMore,
      hasNext: pagination.hasNext,
      isLoading,
      currentPage: pagination.current
    })
    
    if (isLoadingMore || !pagination.hasNext || isLoading) {
      console.log('[Templates] loadMore blocked by conditions')
      return
    }

    setIsLoadingMore(true)
    try {
      const nextPage = pagination.current + 1
      console.log('[Templates] Loading page', nextPage)
      
      const params = {
        page: nextPage,
        size: pagination.size,
        categoryId: selectedCategory?.id ? selectedCategory.id.toString() : undefined
      }
      await loadTemplates(params)
    } catch (error) {
      console.error('[Templates] Failed to load more:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, pagination.hasNext, isLoading, pagination.current, pagination.size, selectedCategory, loadTemplates])

  // 滚动事件监听（性能优化版本）
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current
      if (!container) return
      
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      
      // 当滚动到距离底部400px时触发（增加提前量）
      if (scrollTop + clientHeight >= scrollHeight - 400 && !isLoadingMore && pagination.hasNext && !isLoading) {
        loadMore()
      }
    }

    // 使用 requestAnimationFrame 优化滚动事件
    let ticking = false
    let lastScrollTime = 0
    const SCROLL_THROTTLE = 150 // 增加节流时间，减少触发频率
    
    const optimizedHandleScroll = () => {
      const now = Date.now()
      
      // 时间节流，避免频繁触发
      if (now - lastScrollTime < SCROLL_THROTTLE) {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(() => {
            handleScroll()
            ticking = false
          })
        }
        return
      }
      
      lastScrollTime = now
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      // 使用 passive 事件监听器提升滚动性能
      container.addEventListener('scroll', optimizedHandleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', optimizedHandleScroll)
      }
    }
  }, [loadMore, isLoadingMore, pagination.hasNext, isLoading])

  // 节流函数
  const throttle = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0
    
    return ((...args: any[]) => {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }) as T
  }

  
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
      className="h-screen flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50"
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
                  {pagination.total}
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
                    {pagination.total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 pb-20 overflow-hidden">
        {sortedTemplates.length === 0 && !isLoading ? (
          // 空状态
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-gray-400" size={40} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无相关模板</h3>
              <p className="text-sm text-gray-500 mb-6">
                {selectedCategory 
                  ? `没有找到"${selectedCategory?.name}"相关的模板，试试其他分类吧`
                  : '模板库正在整理中，敬请期待更多精彩内容'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {selectedCategory && (
                  <button
                    onClick={() => {
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
          // 瀑布流布局
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto px-2 py-3"
          >
            <MasonryTemplateGrid
              templates={sortedTemplates}
              onUseTemplate={handleUseTemplate}
              getCategoryIcon={getCategoryIcon}
              formatNumber={formatNumber}
              isLoading={isLoading}
              columnsCount={2}
              gutter="8px"
              className="h-full"
              hasMore={pagination.hasNext}
              onLoadMore={loadMore}
            />
          </div>
        )}
      </div>

    </div>
  )
}

export default Templates