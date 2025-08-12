import { create } from 'zustand'
import { contentAPI, GenerationContent, GenerateContentRequest } from '../lib/api'
import { toast } from 'sonner'

interface GenerationState {
  history: GenerationContent[]
  isGenerating: boolean
  currentGeneration: GenerationContent | null
  pollingInterval: number | null
  isLoading: boolean
  isLoadingMore: boolean
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

interface GenerationActions {
  generateContent: (params: GenerateContentRequest) => Promise<GenerationContent | null>
  loadHistory: (params?: { page?: number; limit?: number; type?: 'image' | 'video' }) => Promise<void>
  loadMoreHistory: () => Promise<void>
  refreshHistory: () => Promise<void>
  removeFromHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  batchDeleteHistory: (ids: string[]) => Promise<void>
  startPolling: (id: string) => void
  stopPolling: () => void
  checkGenerationStatus: (id: string) => Promise<void>
  clearError: () => void
  destroy: () => void
}

export const useGenerationStore = create<GenerationState & GenerationActions>((set, get) => ({
  // 状态
  history: [],
  isGenerating: false,
  currentGeneration: null,
  pollingInterval: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: {
    current: 1,
    size: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrevious: false,
  },

  // 清理函数 - 在组件卸载时调用
  destroy: () => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
      set({ pollingInterval: null })
    }
  },

  // 生成内容
  generateContent: async (params: GenerateContentRequest) => {
    set({ isGenerating: true, error: null })
    try {
      // 创建临时生成项
      const tempGeneration: GenerationContent = {
        id: `temp-${Date.now()}`,
        type: params.type,
        prompt: params.prompt,
        status: 'pending',
        progress: 0,
        params: params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 添加到历史记录顶部
      set(state => ({
        history: [tempGeneration, ...state.history],
        currentGeneration: tempGeneration
      }))

      // 调用API生成内容
      const response = await contentAPI.generateContent(params)
      const result = response?.data
      
      if (result) {
        // 替换临时项为真实结果
        set(state => ({
          history: state.history.map(item => 
            item.id === tempGeneration.id ? result : item
          ),
          currentGeneration: result,
          isGenerating: false
        }))

        // 如果状态为处理中，开始轮询
        if (result.status === 'processing') {
          get().startPolling(result.id)
        }
      }

      toast.success('生成任务已提交')
      return result
    } catch (error: any) {
      // 移除临时项
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      set(state => ({
        history: state.history.filter(item => {
          // 检查 item.id 是否存在并且是字符串类型
          return item.id && typeof item.id === 'string' && !item.id.startsWith('temp-')
        }),
        currentGeneration: null,
        isGenerating: false,
        error: errorMessage
      }))
      toast.error(errorMessage)
      return null
    }
  },

  // 加载历史记录
  loadHistory: async (params) => {
    const currentPage = params?.page || 1
    const isLoadMore = currentPage > 1
    
    set({ isLoading: !isLoadMore, isLoadingMore: isLoadMore, error: null })
    try {
      const response = await contentAPI.getUserContents(params)
      
      // 处理后端返回的数据结构
      let historyData: GenerationContent[] = []
      let paginationData = {
        current: 1,
        size: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false
      }

      if (response?.data) {
        historyData = response.data.records || []
        paginationData = {
          current: response.data.current || 1,
          size: response.data.size || 20,
          total: response.data.total || 0,
          pages: response.data.pages || 0,
          hasNext: response.data.hasNext || false,
          hasPrevious: response.data.hasPrevious || false
        }
      }

      // 如果是加载更多，则合并数据；否则替换数据
      const existingHistory = isLoadMore ? get().history : []
      const mergedHistory = isLoadMore ? [...existingHistory, ...historyData] : historyData

      set({ 
        history: mergedHistory,
        pagination: paginationData,
        isLoading: false,
        isLoadingMore: false
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || error.toString(),
        isLoading: false,
        isLoadingMore: false
      })
    }
  },

  // 加载更多历史记录
  loadMoreHistory: async () => {
    const { pagination, isLoadingMore, isLoading } = get()
    if (isLoadingMore || !pagination.hasNext || isLoading) return

    set({ isLoadingMore: true })
    try {
      const nextPage = pagination.current + 1
      await get().loadHistory({ page: nextPage, size: pagination.size })
    } catch (error: any) {
      console.error('[GenerationStore] Failed to load more history:', error)
      set({ isLoadingMore: false })
    }
  },

  // 刷新历史记录
  refreshHistory: async () => {
    try {
      const response = await contentAPI.getUserContents({ page: 1, size: 20 })
      // 处理后端返回的数据结构
      let historyData: GenerationContent[] = []
      let paginationData = {
        current: 1,
        size: 20,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false
      }

      if (response?.data) {
        historyData = response.data.records || []
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
        history: historyData,
        pagination: paginationData
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      toast.error(errorMessage)
    }
  },

  // 从历史记录中移除
  removeFromHistory: async (id: string) => {
    try {
      await contentAPI.deleteContent(id)
      set(state => ({
        history: state.history.filter(item => item.id !== id)
      }))
      toast.success('删除成功')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      toast.error(errorMessage)
    }
  },

  // 清空历史记录
  clearHistory: async () => {
    try {
      const { history } = get()
      const ids = history.map(item => item.id)
      if (ids.length > 0) {
        await contentAPI.batchDeleteContents(ids)
        set({ history: [] })
        toast.success('历史记录已清空')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      toast.error(errorMessage)
    }
  },

  // 批量删除历史记录
  batchDeleteHistory: async (ids: string[]) => {
    try {
      await contentAPI.batchDeleteContents(ids)
      set(state => ({
        history: state.history.filter(item => !ids.includes(item.id))
      }))
      toast.success(`已删除 ${ids.length} 项记录`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || error.toString()
      toast.error(errorMessage)
    }
  },

  // 开始轮询状态
  startPolling: (id: string) => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }

    const interval = setInterval(() => {
      get().checkGenerationStatus(id)
    }, 2000) // 每2秒检查一次

    set({ pollingInterval: interval })
  },

  // 停止轮询
  stopPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
      set({ pollingInterval: null })
    }
  },

  // 检查生成状态
  checkGenerationStatus: async (id: string) => {
    try {
      const response = await contentAPI.getContent(id)
      const result = response?.data
      
      if (result) {
        // 更新历史记录中的对应项
        set(state => ({
          history: state.history.map(item => 
            item.id === id ? result : item
          ),
          currentGeneration: state.currentGeneration?.id === id ? result : state.currentGeneration
        }))

        // 如果任务完成或失败，停止轮询
        if (result.status === 'completed' || result.status === 'failed') {
          get().stopPolling()
          
          // 显示状态变更通知
          if (result.status === 'completed') {
            toast.success('生成完成')
          } else if (result.status === 'failed') {
            toast.error('生成失败')
          }
        }
      }
    } catch (error: any) {
      console.error('检查生成状态失败:', error)
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))