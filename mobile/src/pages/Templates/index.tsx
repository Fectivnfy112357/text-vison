
import React, { useState, useEffect, useMemo } from 'react'
import { 
  NavBar, 
  Tabs, 
  Grid, 
  GridItem, 
  Search, 
  PullRefresh, 
  List, 
  Cell, 
  Image, 
  Tag, 
  Button, 
  Popup, 
  Loading,
  Empty,
  Toast
} from 'react-vant'
import { Eye, Wand2, Search as SearchIcon } from 'lucide-react'
import { useTemplateStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { useGestures, useSwipeGesture } from '@/hooks/useGestures'
import { useHapticFeedback } from '@/utils/haptics'
import { PageTransition, ListItemTransition, ModalTransition, FadeTransition } from '@/components/ui/Transitions'
import { FullScreenLoading, GridSkeleton, CardSkeleton } from '@/components/ui/LoadingStates'
import { NetworkError, EmptyState } from '@/components/ui/ErrorStates'

interface Template {
  id: string
  title: string
  description: string
  preview: string
  categoryId: string
  type: 'image' | 'video'
  style: string
  views: number
  isPopular: boolean
  tags?: string[]
}

interface Category {
  id: string
  name: string
  icon?: string
}

const Templates = () => {
  const navigate = useNavigate()
  const { 
    templates, 
    categories, 
    isLoading, 
    fetchTemplates, 
    fetchCategories,
    searchTemplates 
  } = useTemplateStore()
  
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplateDetail, setShowTemplateDetail] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPageVisible, setIsPageVisible] = useState(true)
  
  const { buttonTap, selection, success, refresh: hapticRefresh } = useHapticFeedback()
  
  // 手势处理
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'left') {
      const currentIndex = categoryTabs.findIndex(cat => cat.id === activeCategory)
      if (currentIndex < categoryTabs.length - 1) {
        setActiveCategory(categoryTabs[currentIndex + 1].id)
        selection()
      }
    } else if (direction === 'right') {
      const currentIndex = categoryTabs.findIndex(cat => cat.id === activeCategory)
      if (currentIndex > 0) {
        setActiveCategory(categoryTabs[currentIndex - 1].id)
        selection()
      }
    }
  }
  
  const { ref: swipeRef } = useSwipeGesture(handleSwipe)

  // 过滤后的模板列表
  const filteredTemplates = useMemo(() => {
    let filtered = templates
    
    // 按分类过滤
    if (activeCategory !== '全部') {
      filtered = filtered.filter(template => template.categoryId === activeCategory)
    }
    
    // 按搜索关键词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
  }, [templates, activeCategory, searchQuery])

  // 热门模板
  const popularTemplates = useMemo(() => {
    return templates.filter(template => template.isPopular).slice(0, 6)
  }, [templates])

  // 初始化数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchTemplates(),
        fetchCategories()
      ])
    } catch (error) {
      console.error('加载数据失败:', error)
      Toast.fail('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true)
    setError(null)
    hapticRefresh()
    
    try {
      await loadData()
      Toast.success('刷新成功')
      success()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刷新失败'
      setError(errorMessage)
      Toast.fail(errorMessage)
    } finally {
      setRefreshing(false)
    }
  }

  // 搜索处理
  const handleSearch = async (value: string) => {
    setSearchQuery(value)
    if (value.trim()) {
      try {
        await searchTemplates(value.trim(), activeCategory !== '全部' ? activeCategory : undefined)
      } catch (error) {
        console.error('搜索失败:', error)
        Toast.fail('搜索失败，请稍后重试')
      }
    }
  }

  // 使用模板
  const handleUseTemplate = (template: Template) => {
    navigate(`/generate?template=${template.id}`)
  }

  // 查看模板详情
  const handleTemplateDetail = (template: Template) => {
    setSelectedTemplate(template)
    setShowTemplateDetail(true)
  }

  // 分类标签 - 修复重复的"全部"问题
  const categoryTabs = useMemo(() => {
    // 确保不会有重复的"全部"选项
    const filteredCategories = categories.filter(cat => String(cat.id) !== '全部' && cat.name !== '全部')
    const allCategories = [{ id: '全部', name: '全部' }, ...filteredCategories]
    return allCategories
  }, [categories])

  // 如果正在加载且没有数据，显示全屏加载
  if (isLoading && filteredTemplates.length === 0) {
    return <FullScreenLoading />
  }

  // 如果有网络错误，显示错误页面
  if (error && filteredTemplates.length === 0) {
    return (
      <NetworkError 
        onRetry={loadData}
        message={error}
      />
    )
  }

  return (
    <PageTransition isVisible={isPageVisible} type="fade">
      <div ref={swipeRef} className="min-h-screen bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <NavBar 
          title={
            <span className="flex items-center justify-center text-mist-800 font-bold">
              <span className="mr-2 text-2xl animate-bounce-soft">📚</span>
              模板库
            </span>
          }
          className="mobile-header backdrop-blur-md bg-white/80 border-b border-mist-100"
          rightText={<SearchIcon className="w-5 h-5 text-mist-600" />}
          onClickRight={() => {
            setShowSearch(!showSearch)
            buttonTap()
          }}
        />
      
      <PullRefresh loading={refreshing} onRefresh={onRefresh}>
        <div className="mobile-content pb-20 space-y-6">
          {/* 搜索框 - 果冻感设计 */}
          {showSearch && (
            <div className="mx-4 mt-4">
              <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50">
                <Search
                  value={searchQuery}
                  placeholder="搜索模板..."
                  onSearch={handleSearch}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  className="mobile-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(177, 151, 252, 0.2)',
                    borderRadius: '16px'
                  }}
                />
              </div>
            </div>
          )}

          {/* 热门模板 - 果冻感设计 */}
          {!searchQuery && popularTemplates.length > 0 && (
            <div className="mx-4">
              <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-mist-800 flex items-center">
                    <span className="mr-3 text-2xl animate-bounce-soft">🔥</span>
                    热门模板
                  </h3>
                </div>
                <Grid columns={2} gutter={16}>
                  {popularTemplates.map((template) => (
                    <GridItem key={template.id}>
                      <div 
                        className="relative bg-gradient-to-br from-white/90 to-mist-50/90 rounded-2xl overflow-hidden border border-mist-200/30 shadow-soft backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-jelly cursor-pointer"
                        onClick={() => {
                          handleTemplateDetail(template)
                          buttonTap()
                        }}
                      >
                        <div className="relative aspect-video">
                          <Image
                            src={template.preview}
                            alt={template.title}
                            fit="cover"
                            className="w-full h-full"
                            loading={<Loading className="w-8 h-8" />}
                          />
                          <div className="absolute top-3 right-3">
                            <div className="px-2 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs font-bold rounded-full shadow-md">
                              热门
                            </div>
                          </div>
                          {/* 渐变遮罩 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-mist-800 mb-2 line-clamp-1">
                            {template.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center text-mist-600">
                              <Eye className="w-3 h-3 mr-1" />
                              {template.views}
                            </span>
                            <span className="px-2 py-1 bg-gradient-to-r from-sky-100 to-mist-100 text-sky-700 rounded-lg font-medium">
                              {template.type === 'image' ? '图片' : '视频'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </GridItem>
                  ))}
                </Grid>
              </div>
            </div>
          )}

          {/* 分类标签 - 果冻感设计 */}
          <div className="mx-4">
            <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50">
              <h3 className="text-lg font-bold text-mist-800 mb-4 flex items-center">
                <span className="mr-2 text-xl animate-bounce-soft">🏷️</span>
                分类筛选
              </h3>
              <div className="flex flex-wrap gap-2">
                {categoryTabs.map((category) => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-mist-500 to-sky-400 text-white shadow-jelly'
                        : 'bg-gradient-to-r from-mist-100/80 to-sky-100/80 text-mist-700 border border-mist-200/50 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setActiveCategory(category.id)
                      selection()
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 模板列表 - 果冻感设计 */}
          <div className="mx-4">
            <div className="mobile-card backdrop-blur-md bg-white/80 border border-mist-200/50">
              {loading || isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-r from-mist-200 to-sky-200 rounded-full animate-pulse mb-4" />
                  <span className="text-mist-600 font-medium">加载中...</span>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="text-6xl mb-4 animate-bounce-soft">📭</div>
                  <div className="text-mist-600 mb-4">
                    {searchQuery ? '未找到相关模板' : '暂无模板'}
                  </div>
                  {searchQuery && (
                    <button 
                      className="px-6 py-3 bg-gradient-to-r from-mist-500 to-sky-400 text-white rounded-xl font-medium shadow-jelly transition-all duration-300 hover:scale-105 active:scale-95"
                      onClick={() => {
                        setSearchQuery('')
                        setShowSearch(false)
                        buttonTap()
                      }}
                    >
                      清除搜索
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-mist-800 mb-6 flex items-center">
                    <span className="mr-2 text-xl animate-bounce-soft">🎨</span>
                    模板列表
                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-mist-100 to-sky-100 text-mist-600 text-sm rounded-lg">
                      {filteredTemplates.length}
                    </span>
                  </h3>
                  <Grid columns={2} gutter={16}>
                    {filteredTemplates.map((template, index) => (
                      <GridItem key={template.id}>
                        <ListItemTransition index={index}>
                          <div 
                            className="relative bg-gradient-to-br from-white/90 to-mist-50/90 rounded-2xl overflow-hidden border border-mist-200/30 shadow-soft backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-jelly cursor-pointer"
                            onClick={() => {
                              handleTemplateDetail(template)
                              buttonTap()
                            }}
                          >
                            <div className="relative aspect-video">
                              <Image
                                src={template.preview}
                                alt={template.title}
                                fit="cover"
                                className="w-full h-full"
                                loading={<Loading className="w-8 h-8" />}
                              />
                              {template.isPopular && (
                                <div className="absolute top-3 right-3">
                                  <div className="px-2 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs font-bold rounded-full shadow-md">
                                    热门
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                            <div className="p-4">
                              <h4 className="text-sm font-semibold text-mist-800 mb-2 line-clamp-1">
                                {template.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center text-mist-600">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {template.views}
                                </span>
                                <span className="px-2 py-1 bg-gradient-to-r from-sky-100 to-mist-100 text-sky-700 rounded-lg font-medium">
                                  {template.type === 'image' ? '图片' : '视频'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </ListItemTransition>
                      </GridItem>
                    ))}
                  </Grid>
                </div>
              )}
            </div>
          </div>
        </div>
      </PullRefresh>

      {/* 模板详情弹窗 - 果冻感设计 */}
      <Popup
        visible={showTemplateDetail}
        onClose={() => setShowTemplateDetail(false)}
        position="bottom"
        round
        className="backdrop-blur-md"
      >
        {selectedTemplate && (
          <div className="p-6 bg-gradient-to-br from-white/95 to-mist-50/95 backdrop-blur-md">
            <div className="text-center mb-6">
              <div className="w-12 h-1 bg-gradient-to-r from-mist-300 to-sky-300 rounded-full mx-auto mb-4" />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mist-400 to-sky-400 rounded-full mb-4 shadow-lg shadow-mist-200/50">
                <span className="text-2xl animate-bounce-soft">
                  {selectedTemplate.type === 'image' ? '🖼️' : '🎬'}
                </span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-mist-600 to-sky-600 bg-clip-text text-transparent mb-2">
                {selectedTemplate.title}
              </h3>
            </div>
            
            <div className="relative aspect-video mb-6 rounded-2xl overflow-hidden border border-mist-200/50 shadow-lg shadow-mist-100/50">
              <Image
                src={selectedTemplate.preview}
                alt={selectedTemplate.title}
                fit="cover"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                <p className="text-mist-700 text-sm leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>
              
              <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-gradient-to-r from-mist-100 to-sky-100 text-mist-700 rounded-lg text-sm font-medium">
                    {selectedTemplate.style}
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-sm font-medium">
                    {selectedTemplate.type === 'image' ? '图片模板' : '视频模板'}
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-sm font-medium flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {selectedTemplate.views} 次使用
                  </div>
                </div>
              </div>
              
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <div className="text-sm font-medium text-mist-700 mb-2">标签</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag, index) => (
                      <div key={index} className="px-2 py-1 bg-gradient-to-r from-gray-100 to-mist-100 text-gray-700 rounded-lg text-xs">
                        #{tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                block 
                type="primary" 
                size="large"
                onClick={() => {
                  handleUseTemplate(selectedTemplate)
                  setShowTemplateDetail(false)
                  success()
                }}
                className="h-12 text-lg font-semibold bg-gradient-to-r from-mist-500 to-sky-500 border-none shadow-lg shadow-mist-200/50 hover:shadow-xl hover:shadow-mist-300/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  <Wand2 className="w-4 h-4 mr-2" />
                  使用模板
                </span>
              </Button>
            </div>
          </div>
        )}
      </Popup>
      </div>
    </PageTransition>
  )
}

export default Templates