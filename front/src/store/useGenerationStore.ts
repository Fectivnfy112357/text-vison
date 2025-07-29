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
  status?: string;
}

interface GenerationState {
  history: GeneratedContent[];
  isGenerating: boolean;
  currentGeneration: GeneratedContent | null;
  pollingInterval: NodeJS.Timeout | null;
  generateContent: (prompt: string, type: 'image' | 'video', options?: any) => Promise<void>;
  addToHistory: (content: GeneratedContent) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  startPolling: (contentId: string) => void;
  stopPolling: () => void;
  checkGenerationStatus: (contentId: string) => Promise<void>;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  history: [],
  isGenerating: false,
  currentGeneration: null,
  pollingInterval: null,

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
        referenceImage: result.referenceImage || options.referenceImage,
        status: result.status || 'processing'
      };
      
      set({ 
        currentGeneration: newContent,
        isGenerating: false,
        history: [newContent, ...get().history]
      });
      
      // 如果状态是processing，启动轮询检查状态
      if (newContent.status === 'processing') {
        get().startPolling(newContent.id);
      }
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
  },

  startPolling: (contentId: string) => {
    // 清除现有的轮询
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // 开始新的轮询，每3秒检查一次
    const interval = setInterval(() => {
      get().checkGenerationStatus(contentId);
    }, 3000);
    
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  checkGenerationStatus: async (contentId: string) => {
    try {
      const result = await contentAPI.getContent(contentId);
      const { currentGeneration } = get();
      
      if (currentGeneration && currentGeneration.id === contentId) {
        const updatedContent: GeneratedContent = {
          id: result.id.toString(),
          type: result.type,
          prompt: result.prompt,
          url: result.url || '',
          thumbnail: result.thumbnail || undefined,
          createdAt: new Date(result.createdAt || Date.now()),
          size: result.size,
          style: result.style,
          referenceImage: result.referenceImage,
          status: result.status
        };
        
        set({ currentGeneration: updatedContent });
        
        // 如果生成完成或失败，停止轮询
        if (result.status === 'completed' || result.status === 'failed') {
          get().stopPolling();
          
          // 更新历史记录中的对应项
          const { history } = get();
          const updatedHistory = history.map(item => 
            item.id === contentId ? updatedContent : item
          );
          set({ history: updatedHistory });
        }
      }
    } catch (error) {
      console.error('检查生成状态失败:', error);
      // 如果检查失败多次，可以考虑停止轮询
    }
  }
}));