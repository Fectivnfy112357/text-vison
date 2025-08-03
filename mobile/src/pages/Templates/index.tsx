
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

const Templates: React.FC = () => {
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

  // 分类标签
  const categoryTabs = useMemo(() => {
    const allCategories = [{ id: '全部', name: '全部' }, ...categories]
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
      <div ref={swipeRef} className="min-h-screen bg-gray-50">
        <NavBar 
          title="模板库" 
          className="mobile-header"
          rightText={<SearchIcon className="w-5 h-5" />}
          onClickRight={() => {
            setShowSearch(!showSearch)
            buttonTap()
          }}
        />
      
      <PullRefresh loading={refreshing} onRefresh={onRefresh}>
        <div className="mobile-content pb-20">
          {/* 搜索框 */}
          {showSearch && (
            <div className="p-4 bg-white mb-2">
              <Search
                value={searchQuery}
                placeholder="搜索模板..."
                onSearch={handleSearch}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
          )}

          {/* 热门模板 */}
          {!searchQuery && popularTemplates.length > 0 && (
            <div className="bg-white mb-2">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">🔥 热门模板</h3>
              </div>
              <div className="p-4">
                <Grid columns={2} gutter={12}>
                  {popularTemplates.map((template) => (
                    <GridItem key={template.id}>
                      <div 
                        className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
                        onClick={() => handleTemplateDetail(template)}
                      >
                        <div className="relative aspect-video">
                          <Image
                            src={template.preview}
                            alt={template.title}
                            fit="cover"
                            className="w-full h-full"
                            loading={<Loading className="w-8 h-8" />}
                          />
                          <div className="absolute top-2 right-2">
                            <Tag color="#ff6b6b" size="small">
                              热门
                            </Tag>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                            {template.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {template.views}
                            </span>
                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
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

          {/* 分类标签 */}
          <div className="bg-white mb-2">
            <Tabs 
              active={activeCategory} 
              onChange={setActiveCategory}
              scrollable
              className="template-tabs"
            >
              {categoryTabs.map((category) => (
                <Tabs.TabPane key={category.id} title={category.name} name={category.id} />
              ))}
            </Tabs>
          </div>

          {/* 模板列表 */}
          <div className="bg-white">
            {loading || isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loading className="w-8 h-8" />
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="py-20">
                <Empty description={searchQuery ? '未找到相关模板' : '暂无模板'} />
                {searchQuery && (
                  <div className="text-center mt-4">
                    <Button 
                      size="small" 
                      type="primary" 
                      onClick={() => {
                        setSearchQuery('')
                        setShowSearch(false)
                      }}
                    >
                      清除搜索
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <Grid columns={2} gutter={12}>
                  {filteredTemplates.map((template, index) => (
                    <GridItem key={template.id}>
                      <ListItemTransition index={index}>
                        <TemplateCard template={template} index={index} />
                      </ListItemTransition>
                    </GridItem>
                  ))}
                </Grid>
              </div>
            )}
          </div>
        </div>
      </PullRefresh>

      {/* 模板详情弹窗 */}
      <ModalTransition 
        isVisible={showTemplateDetail}
        onClose={() => setShowTemplateDetail(false)}
        className="max-w-lg w-full mx-4"
      >
        {selectedTemplate && (
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedTemplate.title}
              </h3>
            </div>
            
            <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
              <Image
                src={selectedTemplate.preview}
                alt={selectedTemplate.title}
                fit="cover"
                className="w-full h-full"
              />
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedTemplate.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Tag color="#e3f2fd">{selectedTemplate.style}</Tag>
                <Tag color="#f3e5f5">
                  {selectedTemplate.type === 'image' ? '图片模板' : '视频模板'}
                </Tag>
                <Tag color="#e8f5e8">
                  <Eye className="w-3 h-3 mr-1" />
                  {selectedTemplate.views} 次使用
                </Tag>
              </div>
              
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.tags.map((tag, index) => (
                    <Tag key={index} size="small" color="#f5f5f5">
                      {tag}
                    </Tag>
                  ))}
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
                icon={<Wand2 className="w-4 h-4" />}
              >
                使用模板
              </Button>
            </div>
          </div>
        )}
      </ModalTransition>
      </div>
    </PageTransition>
  )
}

export default Templates