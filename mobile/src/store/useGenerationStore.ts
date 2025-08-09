import { create } from 'zustand'
import { contentAPI, GenerationContent, GenerateContentRequest } from '../lib/api'
import { toast } from 'sonner'

interface GenerationState {
  history: GenerationContent[]
  isGenerating: boolean
  currentGeneration: GenerationContent | null
  pollingInterval: number | null
  isLoading: boolean
  error: string | null
}

interface GenerationActions {
  generateContent: (params: GenerateContentRequest) => Promise<GenerationContent | null>
  loadHistory: (params?: { page?: number; limit?: number; type?: 'image' | 'video' }) => Promise<void>
  refreshHistory: () => Promise<void>
  removeFromHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  batchDeleteHistory: (ids: string[]) => Promise<void>
  startPolling: (id: string) => void
  stopPolling: () => void
  checkGenerationStatus: (id: string) => Promise<void>
  clearError: () => void
}

export const useGenerationStore = create<GenerationState & GenerationActions>((set, get) => ({
  // 状态
  history: [],
  isGenerating: false,
  currentGeneration: null,
  pollingInterval: null,
  isLoading: false,
  error: null,

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
        history: state.history.filter(item => !item.id.startsWith('temp-')),
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
    set({ isLoading: true, error: null })
    try {
      const response = await contentAPI.getUserContents(params)
      // 处理后端返回的数据结构 {code, message, data, timestamp, success}
      const historyData = response?.data?.records || []
      set({ 
        history: historyData,
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || error.toString(),
        isLoading: false 
      })
    }
  },

  // 刷新历史记录
  refreshHistory: async () => {
    try {
      const response = await contentAPI.getUserContents({ limit: 20 })
      // 处理后端返回的数据结构 {code, message, data, timestamp, success}
      const historyData = response?.data?.records || []
      set({ history: historyData })
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