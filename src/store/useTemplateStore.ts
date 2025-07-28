import { create } from 'zustand';

export interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  preview: string;
  type: 'image' | 'video';
  style: string;
  size: string;
  views: number;
  isPopular?: boolean;
}

interface TemplateState {
  templates: Template[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;
  fetchTemplates: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTemplates: () => Template[];
}

// 模拟模板数据
const mockTemplates: Template[] = [
  {
    id: '1',
    title: '梦幻森林',
    description: '神秘的梦幻森林场景，充满魔法色彩',
    prompt: 'magical fantasy forest with glowing mushrooms, ethereal lighting, mystical atmosphere, enchanted woodland',
    category: '自然风光',
    tags: ['森林', '魔法', '梦幻'],
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20fantasy%20forest%20glowing%20mushrooms%20ethereal%20lighting&image_size=landscape_16_9',
    preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20fantasy%20forest%20glowing%20mushrooms%20ethereal%20lighting&image_size=landscape_16_9',
    type: 'image',
    style: '魔幻风格',
    size: 'landscape_16_9',
    views: 1250,
    isPopular: true
  },
  {
    id: '2',
    title: '未来城市',
    description: '科幻未来城市景观，霓虹灯光效果',
    prompt: 'futuristic cyberpunk city skyline, neon lights, flying cars, holographic displays, night scene',
    category: '科幻未来',
    tags: ['城市', '科幻', '霓虹'],
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20cyberpunk%20city%20skyline%20neon%20lights&image_size=landscape_16_9',
    preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20cyberpunk%20city%20skyline%20neon%20lights&image_size=landscape_16_9',
    type: 'image',
    style: '赛博朋克',
    size: 'landscape_16_9',
    views: 980,
    isPopular: true
  },
  {
    id: '3',
    title: '古风美人',
    description: '古典东方美人肖像，水墨画风格',
    prompt: 'traditional chinese beauty portrait, ink painting style, elegant hanfu dress, soft lighting',
    category: '人物肖像',
    tags: ['古风', '美人', '水墨'],
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20beauty%20portrait%20ink%20painting%20style&image_size=portrait_4_3',
    preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20beauty%20portrait%20ink%20painting%20style&image_size=portrait_4_3',
    type: 'image',
    style: '水墨风格',
    size: 'portrait_4_3',
    views: 756
  },
  {
    id: '4',
    title: '宇宙星云',
    description: '绚丽的宇宙星云景象，深空摄影风格',
    prompt: 'colorful nebula in deep space, cosmic dust clouds, bright stars, galaxy background, astronomical photography',
    category: '自然风光',
    tags: ['宇宙', '星云', '深空'],
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20nebula%20deep%20space%20cosmic%20dust%20clouds&image_size=landscape_16_9',
    preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20nebula%20deep%20space%20cosmic%20dust%20clouds&image_size=landscape_16_9',
    type: 'image',
    style: '写实风格',
    size: 'landscape_16_9',
    views: 642
  },
  {
    id: '5',
    title: '可爱动物',
    description: '萌萌的小动物插画，卡通风格',
    prompt: 'cute kawaii animals, cartoon style, pastel colors, adorable expressions, chibi art',
    category: '卡通插画',
    tags: ['动物', '可爱', '卡通'],
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20kawaii%20animals%20cartoon%20style%20pastel%20colors&image_size=square',
    preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20kawaii%20animals%20cartoon%20style%20pastel%20colors&image_size=square',
    type: 'image',
    style: '卡通风格',
    size: 'square',
    views: 1120
  }
];

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  categories: ['全部', '自然风光', '科幻未来', '人物肖像', '卡通插画', '建筑设计', '抽象艺术'],
  selectedCategory: '全部',
  searchQuery: '',
  isLoading: false,

  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ templates: mockTemplates, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredTemplates: () => {
    const { templates, selectedCategory, searchQuery } = get();
    
    let filtered = templates;
    
    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }
}));