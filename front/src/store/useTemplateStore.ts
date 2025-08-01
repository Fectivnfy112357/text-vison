import { create } from 'zustand';
import { templateAPI, templateCategoryAPI } from '@/lib/api';

export interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  categoryId: string;
  tags: string[];
  imageUrl: string;
  preview: string;
  type: 'image' | 'video';
  style: string;
  size: string;
  views: number;
  isPopular?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: number;
}

interface TemplateState {
  templates: Template[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;
  fetchTemplates: (categoryId?: string, searchQuery?: string) => Promise<void>;
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  loadCategories: () => Promise<void>;
}



export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  categories: [{ id: 0, name: '全部' }],
  selectedCategory: '全部',
  searchQuery: '',
  isLoading: false,

  fetchTemplates: async (categoryId?: string, searchQuery?: string) => {
    set({ isLoading: true });
    try {
      let templatesData;
      
      // 根据是否有搜索关键词选择不同的API
      if (searchQuery && searchQuery.trim()) {
        templatesData = await templateAPI.searchTemplates(
          searchQuery.trim(),
          1,
          100,
          categoryId
        );
      } else {
        templatesData = await templateAPI.getTemplates(
          1,
          100,
          categoryId
        );
      }
      
      // 转换后端数据格式
      const templates = templatesData.records
        .filter((template: any) => template && typeof template === 'object')
        .map((template: any) => ({
          id: template.id ? template.id.toString() : 'unknown',
          title: template.title || '未命名模板',
          description: template.description || '暂无描述',
          prompt: template.prompt || '',
          categoryId: template.categoryId || template.category || '其他',
          tags: template.tags ? template.tags.split(',').filter(Boolean) : [],
          imageUrl: template.imageUrl || template.preview || '/placeholder-template.png',
          preview: template.preview || template.imageUrl || '/placeholder-template.png',
          type: template.type || 'image',
          style: template.style || '默认风格',
          size: template.size || 'landscape_16_9',
          views: template.usageCount || 0,
          isPopular: template.isPopular || false
        }));
      
      set({ 
        templates,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadCategories: async () => {
    try {
      const categoriesData = await templateCategoryAPI.getAllCategories();
      const categories = [{ id: 0, name: '全部' }, ...categoriesData];
      set({ categories });
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  },

  setSelectedCategory: (categoryId: string) => {
    const { searchQuery, fetchTemplates } = get();
    set({ selectedCategory: categoryId });
    // 分类改变时自动调用后端筛选
    // 如果是"全部"则传递undefined，否则传递实际的categoryId
    const actualCategoryId = categoryId === '全部' ? undefined : categoryId;
    fetchTemplates(actualCategoryId, searchQuery);
  },

  setSearchQuery: (query: string) => {
    const { selectedCategory, fetchTemplates } = get();
    set({ searchQuery: query });
    // 搜索关键词改变时自动调用后端筛选
    // 如果是"全部"则传递undefined，否则传递实际的categoryId
    const actualCategoryId = selectedCategory === '全部' ? undefined : selectedCategory;
    fetchTemplates(actualCategoryId, query);
  }
}));