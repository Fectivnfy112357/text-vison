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
      const artStyles = await contentAPI.getArtStyles()
      set({ 
        artStyles,
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.response?.data?.error || error.message || error.toString(),
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