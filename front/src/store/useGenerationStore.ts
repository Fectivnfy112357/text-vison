import { create } from 'zustand';
import { contentAPI } from '@/lib/api';

export interface GeneratedContent {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  thumbnail?: string;
  createdAt: Date;
  size: string;
  style?: string;
  referenceImage?: string;
}

interface GenerationState {
  history: GeneratedContent[];
  isGenerating: boolean;
  currentGeneration: GeneratedContent | null;
  generateContent: (prompt: string, type: 'image' | 'video', options?: any) => Promise<void>;
  addToHistory: (content: GeneratedContent) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  history: [],
  isGenerating: false,
  currentGeneration: null,

  generateContent: async (prompt: string, type: 'image' | 'video', options = {}) => {
    set({ isGenerating: true });
    
    try {
      const result = await contentAPI.generateContent(
        prompt,
        type,
        undefined, // templateId
        options.size || 'landscape_16_9',
        options.style || '默认风格'
      );
      
      console.log('Generation API response:', result);
      
      // 安全检查 API 响应数据
      if (!result || typeof result !== 'object') {
        throw new Error('生成内容失败：无效的响应数据');
      }
      
      if (!result.id) {
        throw new Error('生成内容失败：缺少内容ID');
      }
      
      const newContent: GeneratedContent = {
        id: result.id.toString(),
        type: result.type || type,
        prompt: result.prompt || prompt,
        url: result.url || '',
        thumbnail: result.thumbnail || undefined,
        createdAt: new Date(result.createdAt || Date.now()),
        size: result.size || options.size || 'landscape_16_9',
        style: result.style || options.style || '默认风格',
        referenceImage: result.referenceImage || options.referenceImage
      };
      
      set({ 
        currentGeneration: newContent,
        isGenerating: false,
        history: [newContent, ...get().history]
      });
    } catch (error) {
      set({ isGenerating: false });
      throw error;
    }
  },

  addToHistory: (content: GeneratedContent) => {
    set(state => ({
      history: [content, ...state.history]
    }));
  },

  removeFromHistory: (id: string) => {
    set(state => ({
      history: state.history.filter(item => item.id !== id)
    }));
  },

  clearHistory: () => {
    set({ history: [] });
  }
}));