import { create } from 'zustand'
import { templateAPI, templateCategoryAPI, Template, TemplateCategory } from '../lib/api'
import { toast } from 'sonner'

interface TemplateState {
  templates: Template[]
  popularTemplates: Template[]
  categories: TemplateCategory[]
  selectedCategory: TemplateCategory | null
  searchQuery: string
  isLoading: boolean
  error: string | null
  pagination: {
    current: number
    size: number
    total: number
    pages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

interface TemplateActions {
  loadTemplates: (params?: { categoryId?: string; keyword?: string; page?: number; size?: number }) => Promise<void>
  loadPopularTemplates: (limit?: number) => Promise<void>
  loadCategories: () => Promise<void>
  searchTemplates: (query: string, page?: number) => Promise<void>
  setSelectedCategory: (category: TemplateCategory | null) => void
  setSearchQuery: (query: string) => void
  useTemplate: (id: string | number) => Promise<Template | null>
  getTemplate: (id: string | number) => Promise<Template | null>
  clearError: () => void
  resetPagination: () => void
}

export const useTemplateStore = create<TemplateState & TemplateActions>((set, get) => ({
  // 状态
  templates: [],
  popularTemplates: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    size: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrevious: false,
  },

  // 加载模板列表
  loadTemplates: async (params) => {
    const currentPage = params?.page || 1
    const isLoadMore = currentPage > 1
    
    console.log('[TemplateStore] loadTemplates called', {
      params,
      currentPage,
      isLoadMore,
      selectedCategory: get().selectedCategory?.name
    })
    
    set({ isLoading: !isLoadMore, error: null })
    try {
      const response = await templateAPI.getTemplates(params)
      console.log('[TemplateStore] API response', {
        response,
        categoryId: params?.categoryId,
        returnedTemplates: response?.data?.records?.length || 0,
        total: response?.data?.total
      })

      // 处理后端返回的数据结构 {code, message, data, success}
      let templatesArray: Template[] = []
      let paginationData = {
        current: 1,
        size: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false
      }

      if (response?.data) {
        templatesArray = response.data.records || []
        paginationData = {
          current: response.data.current || 1,
          size: response.data.size || 20,
          total: response.data.total || 0,
          pages: response.data.pages || 0,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false
        }
      }

      console.log('[TemplateStore] Processed data', {
        templatesArray: templatesArray.length,
        paginationData,
        isLoadMore
      })

      // 如果是加载更多，则合并数据；否则替换数据
      const existingTemplates = isLoadMore ? get().templates : []
      const mergedTemplates = isLoadMore ? [...existingTemplates, ...templatesArray] : templatesArray

      set({
        templates: mergedTemplates,
        pagination: paginationData,
        isLoading: false
      })
    } catch (error: any) {
      console.error('[TemplateStore] Error:', error)
      set({
        error: error.response?.data?.message || error.response?.data?.error || error.message || error.toString(),
        isLoading: false,
        templates: [] // 设置为空数组
      })
    }
  },

  // 加载热门模板
  loadPopularTemplates: async (limit = 10) => {
    try {
      const response = await templateAPI.getPopularTemplates(limit)
      // 处理后端返回的数据结构 {code, message, data, timestamp, success}
      const templates = response?.data || []
      // 确保templates是数组
      const templatesArray = Array.isArray(templates) ? templates : []
      set({ popularTemplates: templatesArray })
    } catch (error: any) {
      console.error('[TemplateStore] 加载热门模板失败:', error)
      set({ popularTemplates: [] }) // 设置为空数组
    }
  },

  // 加载分类
  loadCategories: async () => {
    try {
      const response = await templateCategoryAPI.getCategories()

      // 处理后端返回的数据结构 {code, message, data, timestamp, success}
      const categoriesArray = response?.data || []
      const enabledCategories = categoriesArray.filter(cat => cat.isEnabled !== false)
      
      console.log('[TemplateStore] 加载分类成功', {
        totalCategories: categoriesArray.length,
        enabledCategories: enabledCategories.length,
        categories: enabledCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          templateCount: cat.templateCount
        }))
      })
      
      set({ categories: enabledCategories })
    } catch (error: any) {
      console.error('[TemplateStore] 加载分类失败:', error)
      set({ categories: [] }) // 设置为空数组
    }
  },

  // 搜索模板
  searchTemplates: async (query: string, page: number = 1) => {
    if (!query.trim()) {
      get().loadTemplates({ page: 1 })
      return
    }

    set({ isLoading: true, error: null, searchQuery: query })
    try {
      const response = await templateAPI.searchTemplates(query, { page, size: 20 })

      // 处理后端返回的数据结构 {code, message, data, timestamp, success}
      let templatesArray: Template[] = []
      let paginationData = {
        current: 1,
        size: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false
      }

      if (response?.data) {
        templatesArray = response.data.records || []
        paginationData = {
          current: response.data.current || 1,
          size: response.data.size || 20,
          total: response.data.total || 0,
          pages: response.data.pages || 0,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false
        }
      }

      set({
        templates: templatesArray,
        pagination: paginationData,
        isLoading: false
      })
    } catch (error: any) {
      console.error('[TemplateStore] 搜索模板失败:', error)
      set({
        error: error.response?.data?.message || error.message || error.toString(),
        isLoading: false,
        templates: [] // 设置为空数组
      })
    }
  },

  // 设置选中的分类
  setSelectedCategory: (category: TemplateCategory | null) => {
    set({ selectedCategory: category })
  },

  // 设置搜索查询
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  // 使用模板
  useTemplate: async (id: string | number) => {
    try {
      await templateAPI.useTemplate(String(id))
      const templateResponse = await templateAPI.getTemplate(String(id))
      const template = templateResponse?.data

      // 更新使用次数
      if (template) {
        set(state => ({
          templates: state.templates.map(t => 
            t.id === template.id 
              ? { ...t, usageCount: (t.usageCount || 0) + 1 }
              : t
          ),
          popularTemplates: state.popularTemplates.map(t => 
            t.id === template.id 
              ? { ...t, usageCount: (t.usageCount || 0) + 1 }
              : t
          )
        }))
      }
      
      return template
    } catch (error: any) {
      console.error('使用模板失败:', error)
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      toast.error(errorMessage)
      return null
    }
  },

  // 获取单个模板
  getTemplate: async (id: string | number) => {
    try {
      const response = await templateAPI.getTemplate(String(id))
      return response?.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      toast.error(errorMessage)
      return null
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },

  // 重置分页
  resetPagination: () => {
    set({
      pagination: {
        current: 1,
        size: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false,
      }
    })
  },
}))