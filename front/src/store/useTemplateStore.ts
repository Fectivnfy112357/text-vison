import { create } from 'zustand';
import { templateAPI } from '@/lib/api';

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



export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  categories: ['全部'],
  selectedCategory: '全部',
  searchQuery: '',
  isLoading: false,

  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      const [templatesData, categoriesData] = await Promise.all([
        templateAPI.getTemplates(1, 100), // 获取更多模板
        templateAPI.getCategories()
      ]);
      
      // 转换后端数据格式
      const templates = templatesData.records
        .filter((template: any) => template && typeof template === 'object')
        .map((template: any) => ({
          id: template.id ? template.id.toString() : 'unknown',
          title: template.title || '未命名模板',
          description: template.description || '暂无描述',
          prompt: template.prompt || '',
          category: template.category || '其他',
          tags: template.tags ? template.tags.split(',').filter(Boolean) : [],
          imageUrl: template.imageUrl || template.preview || '/placeholder-template.png',
          preview: template.preview || template.imageUrl || '/placeholder-template.png',
          type: template.type || 'image',
          style: template.style || '默认风格',
          size: template.size || 'landscape_16_9',
          views: template.usageCount || 0,
          isPopular: template.isPopular || false
        }));
      
      const categories = ['全部', ...categoriesData];
      
      set({ 
        templates, 
        categories,
        isLoading: false 
      });
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