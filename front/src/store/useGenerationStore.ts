import { create } from 'zustand';

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
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const imageSize = options.size || 'landscape_16_9';
      const encodedPrompt = encodeURIComponent(prompt);
      
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type,
        prompt,
        url: type === 'image' 
          ? `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=${imageSize}`
          : `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}%20video%20animation&image_size=${imageSize}`,
        thumbnail: type === 'video' 
          ? `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}%20thumbnail&image_size=square`
          : undefined,
        createdAt: new Date(),
        size: imageSize,
        style: options.style,
        referenceImage: options.referenceImage
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