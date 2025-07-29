import { create } from 'zustand';
import { contentAPI } from '@/lib/api';

export interface GeneratedContent {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  thumbnail?: string;
  urls?: string[]; // 支持多个URL（用于多视频生成）
  thumbnails?: string[]; // 支持多个缩略图
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
  isLoadingHistory: boolean;
  generateContent: (prompt: string, type: 'image' | 'video', options?: any) => Promise<void>;
  loadHistory: (page?: number, size?: number, type?: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
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
  isLoadingHistory: false,

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
        urls: result.urls || (result.url ? [result.url] : []),
        thumbnails: result.thumbnails || (result.thumbnail ? [result.thumbnail] : []),
        createdAt: new Date(result.createdAt || Date.now()),
        size: result.size || options.size || 'landscape_16_9',
        style: result.style || options.style || '默认风格',
        referenceImage: result.referenceImage || options.referenceImage,
        status: result.status || 'processing'
      };
      
      set({ 
        currentGeneration: newContent,
        isGenerating: false
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

  loadHistory: async (page = 1, size = 20, type?: string) => {
    set({ isLoadingHistory: true });
    try {
      const result = await contentAPI.getUserContents(page, size, type);
      const contents = result.records || result.list || result;
      
      const formattedHistory: GeneratedContent[] = contents.map((item: any) => ({
        id: item.id.toString(),
        type: item.type,
        prompt: item.prompt,
        url: item.url || '',
        thumbnail: item.thumbnail || undefined,
        urls: item.urls || (item.url ? [item.url] : []),
        thumbnails: item.thumbnails || (item.thumbnail ? [item.thumbnail] : []),
        createdAt: new Date(item.createdAt || item.createTime),
        size: item.size,
        style: item.style,
        referenceImage: item.referenceImage,
        status: item.status
      }));
      
      set({ 
        history: page === 1 ? formattedHistory : [...get().history, ...formattedHistory],
        isLoadingHistory: false 
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
      set({ isLoadingHistory: false });
      throw error;
    }
  },

  refreshHistory: async () => {
    await get().loadHistory(1, 20);
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
          urls: result.urls || (result.url ? [result.url] : []),
          thumbnails: result.thumbnails || (result.thumbnail ? [result.thumbnail] : []),
          createdAt: new Date(result.createdAt || Date.now()),
          size: result.size,
          style: result.style,
          referenceImage: result.referenceImage,
          status: result.status
        };
        
        set({ currentGeneration: updatedContent });
        
        // 如果生成完成或失败，停止轮询并刷新历史记录
        if (result.status === 'completed' || result.status === 'failed') {
          get().stopPolling();
          
          // 刷新历史记录以获取最新数据
          await get().refreshHistory();
        }
      }
    } catch (error) {
      console.error('检查生成状态失败:', error);
      get().stopPolling();
    }
  }
}));