import { create } from 'zustand';
import { contentAPI } from '@/lib/api';
import { formatGeneratedContent } from '@/lib/utils';

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
  pollingInterval: ReturnType<typeof setInterval> | null;
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
      // 创建一个临时的生成中状态项，插入到历史记录的第一位
      const tempContent: GeneratedContent = {
        id: 'temp-' + Date.now(),
        type: type,
        prompt: prompt,
        url: '',
        urls: [],
        createdAt: new Date(),
        size: options.size || 'landscape_16_9',
        style: options.style || '默认风格',
        referenceImage: options.referenceImage,
        status: 'generating'
      };
      
      // 将临时项插入到历史记录的第一位，保持其他历史记录
      const currentHistory = get().history;
      const updatedHistory = [tempContent, ...currentHistory].slice(0, 4);
      set({ 
        history: updatedHistory,
        currentGeneration: tempContent
      });
      
      const result = await contentAPI.generateContent(
        prompt,
        type,
        undefined, // templateId
        options.size || 'landscape_16_9',
        options.style || '默认风格',
        options // 传递所有选项参数，包括视频参数
      );
      
      // 安全检查 API 响应数据
      if (!result || typeof result !== 'object') {
        throw new Error('生成内容失败：无效的响应数据');
      }
      
      if (!result.id) {
        throw new Error('生成内容失败：缺少内容ID');
      }
      
      const newContent: GeneratedContent = {
        ...formatGeneratedContent(result),
        type: result.type || type,
        prompt: result.prompt || prompt,
        size: result.size || options.size || 'landscape_16_9',
        style: result.style || options.style || '默认风格',
        referenceImage: result.referenceImage || options.referenceImage,
        status: result.status || 'processing'
      };
      
      // 替换临时项为真实的生成内容
      const historyWithoutTemp = get().history.filter(item => item.id !== tempContent.id);
      const finalHistory = [newContent, ...historyWithoutTemp].slice(0, 4);
      
      set({ 
        currentGeneration: newContent,
        history: finalHistory,
        isGenerating: false
      });
      
      // 如果状态是processing，启动轮询检查状态
      if (newContent.status === 'processing') {
        get().startPolling(newContent.id);
      }
    } catch (error) {
      // 发生错误时，移除临时项
      const currentHistory = get().history;
      const historyWithoutTemp = currentHistory.filter(item => !item.id.startsWith('temp-'));
      set({ 
        isGenerating: false,
        history: historyWithoutTemp,
        currentGeneration: null
      });
      throw error;
    }
  },

  loadHistory: async (page = 1, size = 20, type?: string) => {
    set({ isLoadingHistory: true });
    try {
      const result = await contentAPI.getUserContents(page, size, type);
      const contents = result.records || result.list || result;
      
      const formattedHistory: GeneratedContent[] = contents.map((item: any) => 
        formatGeneratedContent(item)
      );
      
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
      const { currentGeneration, history } = get();
      
      if (currentGeneration && currentGeneration.id === contentId) {
        const updatedContent: GeneratedContent = formatGeneratedContent(result);
        
        // 更新历史记录中的对应项
        const updatedHistory = history.map(item => 
          item.id === contentId ? updatedContent : item
        );
        
        set({ 
          currentGeneration: updatedContent,
          history: updatedHistory
        });
        
        // 如果生成完成或失败，停止轮询
        if (result.status === 'completed' || result.status === 'failed') {
          get().stopPolling();
        }
      }
    } catch (error) {
      console.error('检查生成状态失败:', error);
      get().stopPolling();
    }
  }
}));