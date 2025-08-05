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
    page: number
    limit: number
    total: number
  }
}

interface TemplateActions {
  loadTemplates: (params?: { category?: string; search?: string; page?: number; limit?: number }) => Promise<void>
  loadPopularTemplates: (limit?: number) => Promise<void>
  loadCategories: () => Promise<void>
  searchTemplates: (query: string) => Promise<void>
  setSelectedCategory: (category: TemplateCategory | null) => void
  setSearchQuery: (query: string) => void
  useTemplate: (id: string) => Promise<Template | null>
  getTemplate: (id: string) => Promise<Template | null>
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
    page: 1,
    limit: 20,
    total: 0,
  },

  // 加载模板列表
  loadTemplates: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await templateAPI.getTemplates(params)
      set({ 
        templates: response.templates,
        pagination: {
          ...get().pagination,
          page: params?.page || 1,
          total: response.total,
        },
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.response?.data?.error || error.message || error.toString(),
        isLoading: false 
      })
    }
  },

  // 加载热门模板
  loadPopularTemplates: async (limit = 10) => {
    try {
      const templates = await templateAPI.getPopularTemplates(limit)
      set({ popularTemplates: templates })
    } catch (error: any) {
      console.error('加载热门模板失败:', error)
    }
  },

  // 加载分类
  loadCategories: async () => {
    try {
      const categories = await templateCategoryAPI.getCategories()
      set({ categories: categories.filter(cat => cat.isEnabled) })
    } catch (error: any) {
      console.error('加载分类失败:', error)
    }
  },

  // 搜索模板
  searchTemplates: async (query: string) => {
    if (!query.trim()) {
      get().loadTemplates()
      return
    }

    set({ isLoading: true, error: null, searchQuery: query })
    try {
      const templates = await templateAPI.searchTemplates(query)
      set({ 
        templates,
        pagination: {
          ...get().pagination,
          page: 1,
          total: templates.length,
        },
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.response?.data?.error || error.message || error.toString(),
        isLoading: false 
      })
    }
  },

  // 设置选中的分类
  setSelectedCategory: (category: TemplateCategory | null) => {
    set({ selectedCategory: category })
    if (category) {
      get().loadTemplates({ category: category.id, page: 1 })
    } else {
      get().loadTemplates({ page: 1 })
    }
  },

  // 设置搜索查询
  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  // 使用模板
  useTemplate: async (id: string) => {
    try {
      await templateAPI.useTemplate(id)
      const template = await templateAPI.getTemplate(id)
      
      // 更新使用次数
      set(state => ({
        templates: state.templates.map(t => 
          t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
        ),
        popularTemplates: state.popularTemplates.map(t => 
          t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      }))
      
      toast.success('模板已应用')
      return template
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || error.toString()
      toast.error(errorMessage)
      return null
    }
  },

  // 获取单个模板
  getTemplate: async (id: string) => {
    try {
      const template = await templateAPI.getTemplate(id)
      return template
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || error.toString()
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
        page: 1,
        limit: 20,
        total: 0,
      }
    })
  },
}))