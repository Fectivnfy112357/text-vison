import { create } from 'zustand';
import { contentAPI } from '@/lib/api';

export interface ArtStyle {
  id: number;
  name: string;
  description: string;
  applicableType: 'image' | 'video' | 'both';
  sortOrder: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface ArtStyleState {
  styles: ArtStyle[];
  isLoading: boolean;
  error: string | null;
  fetchStyles: (type?: 'image' | 'video' | 'both') => Promise<void>;
  getStyleById: (id: number) => ArtStyle | undefined;
  getStylesByType: (type: 'image' | 'video') => ArtStyle[];
}

export const useArtStyleStore = create<ArtStyleState>((set, get) => ({
  styles: [],
  isLoading: false,
  error: null,

  fetchStyles: async (type?: 'image' | 'video' | 'both') => {
    set({ isLoading: true, error: null });
    try {
      const response = await contentAPI.getArtStyles(type);
      const styles = response.data || response || [];
      set({ styles, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取艺术风格失败';
      set({ error: errorMessage, isLoading: false });
      console.error('获取艺术风格失败:', error);
    }
  },

  getStyleById: (id: number) => {
    const { styles } = get();
    return styles.find(style => style.id === id);
  },

  getStylesByType: (type: 'image' | 'video') => {
    const { styles } = get();
    return styles.filter(style => 
      style.applicableType === type || style.applicableType === 'both'
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}));