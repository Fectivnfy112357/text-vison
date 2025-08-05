import { create } from 'zustand'
import { contentAPI, ArtStyle } from '../lib/api'

interface ArtStyleState {
  artStyles: ArtStyle[]
  selectedStyle: ArtStyle | null
  isLoading: boolean
  error: string | null
}

interface ArtStyleActions {
  loadArtStyles: () => Promise<void>
  setSelectedStyle: (style: ArtStyle | null) => void
  clearError: () => void
}

export const useArtStyleStore = create<ArtStyleState & ArtStyleActions>((set) => ({
  // 状态
  artStyles: [],
  selectedStyle: null,
  isLoading: false,
  error: null,

  // 加载艺术风格
  loadArtStyles: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await contentAPI.getArtStyles()
      // 处理后端返回的数据结构 {code, message, data, timestamp, success}
      const artStyles = response?.data || []
      // 确保artStyles是数组
      const validArtStyles = Array.isArray(artStyles) ? artStyles : []
      set({ 
        artStyles: validArtStyles,
        isLoading: false 
      })
    } catch (error: any) {
      console.error('加载艺术风格失败:', error)
      set({ 
        artStyles: [], // 确保在错误时artStyles仍然是数组
        error: error.response?.data?.message || error.message || error.toString(),
        isLoading: false 
      })
    }
  },

  // 设置选中的艺术风格
  setSelectedStyle: (style: ArtStyle | null) => {
    set({ selectedStyle: style })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))