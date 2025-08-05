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
    page: 1,
    limit: 20,
    total: 0,
  },

  // 加载模板列表
  loadTemplates: async (params) => {
    console.log('[TemplateStore] Loading templates with params:', params)
    set({ isLoading: true, error: null })
    try {
      const response = await templateAPI.getTemplates(params)
      console.log('[TemplateStore] API response for templates:', response)
      // 确保templates是数组
      const templatesArray = Array.isArray(response?.templates) ? response.templates : []
      console.log('[TemplateStore] Setting templates:', templatesArray)
      set({ 
        templates: templatesArray,
        pagination: {
          ...get().pagination,
          page: params?.page || 1,
          total: response?.total || 0,
        },
        isLoading: false 
      })
    } catch (error: any) {
      console.error('[TemplateStore] 加载模板失败:', error)
      set({ 
        error: error.response?.data?.message || error.response?.data?.error || error.message || error.toString(),
        isLoading: false,
        templates: [] // 设置为空数组
      })
    }
  },

  // 加载热门模板
  loadPopularTemplates: async (limit = 10) => {
    console.log('[TemplateStore] Loading popular templates with limit:', limit)
    try {
      const response = await templateAPI.getPopularTemplates(limit)
      console.log('[TemplateStore] API response for popular templates:', response)
      // 处理后端返回的数据结构 {code, message, data}
      const templates = response?.data || []
      // 确保templates是数组
      const templatesArray = Array.isArray(templates) ? templates : []
      console.log('[TemplateStore] Setting popular templates:', templatesArray)
      set({ popularTemplates: templatesArray })
    } catch (error: any) {
      console.error('[TemplateStore] 加载热门模板失败:', error)
      set({ popularTemplates: [] }) // 设置为空数组
    }
  },

  // 加载分类
  loadCategories: async () => {
    console.log('[TemplateStore] Loading categories...')
    try {
      const categories = await templateCategoryAPI.getCategories()
      console.log('[TemplateStore] API response for categories:', categories)
      // 确保categories是数组
      const categoriesArray = Array.isArray(categories) ? categories : []
      const enabledCategories = categoriesArray.filter(cat => cat.isEnabled)
      console.log('[TemplateStore] Setting categories:', enabledCategories)
      set({ categories: enabledCategories })
    } catch (error: any) {
      console.error('[TemplateStore] 加载分类失败:', error)
      set({ categories: [] }) // 设置为空数组
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
      // 确保templates是数组
      const templatesArray = Array.isArray(templates) ? templates : []
      set({ 
        templates: templatesArray,
        pagination: {
          ...get().pagination,
          page: 1,
          total: templatesArray.length,
        },
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.response?.data?.error || error.message || error.toString(),
        isLoading: false,
        templates: [] // 设置为空数组
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
  useTemplate: async (id: string | number) => {
    try {
      await templateAPI.useTemplate(String(id))
      const template = await templateAPI.getTemplate(String(id))
      
      // 更新使用次数
      set(state => ({
        templates: state.templates.map(t => 
          t.id == id ? { ...t, usageCount: t.usageCount + 1 } : t
        ),
        popularTemplates: state.popularTemplates.map(t => 
          t.id == id ? { ...t, usageCount: t.usageCount + 1 } : t
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
  getTemplate: async (id: string | number) => {
    try {
      const template = await templateAPI.getTemplate(String(id))
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