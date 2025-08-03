import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeviceInfo, NetworkStatus } from '../types'
import { authAPI, clearToken } from '../lib/api'

// 用户数据接口
interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

// 用户状态接口
interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, confirmPassword: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  checkAuth: () => Promise<void>
}

// 移动端特有状态接口
interface MobileState {
  // 底部导航状态
  activeTab: string
  setActiveTab: (tab: string) => void
  
  // 设备信息
  deviceInfo: DeviceInfo | null
  setDeviceInfo: (info: DeviceInfo) => void
  
  // 网络状态
  networkStatus: NetworkStatus
  setNetworkStatus: (status: NetworkStatus) => void
  
  // 键盘状态
  isKeyboardVisible: boolean
  setKeyboardVisible: (visible: boolean) => void
  
  // 加载状态
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  // 错误状态
  error: string | null
  setError: (error: string | null) => void
}

// 生成内容接口
interface GeneratedContent {
  id: string
  type: 'image' | 'video'
  prompt: string
  url: string
  thumbnail?: string
  urls?: string[]
  thumbnails?: string[]
  createdAt: Date
  size: string
  style?: string
  referenceImage?: string
  status?: string
}

// 模板接口
interface Template {
  id: string
  title: string
  description: string
  prompt: string
  categoryId: string
  tags: string[]
  imageUrl: string
  preview: string
  type: 'image' | 'video'
  style: string
  size: string
  views: number
  isPopular?: boolean
}

// 分类接口
interface Category {
  id: number
  name: string
  description?: string
  icon?: string
  sortOrder?: number
  status?: number
}

// 艺术风格接口
interface ArtStyle {
  id: number
  name: string
  description: string
  applicableType: 'image' | 'video' | 'both'
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

// 内容生成状态接口
interface GenerationState {
  history: GeneratedContent[]
  isGenerating: boolean
  currentGeneration: GeneratedContent | null
  pollingInterval: ReturnType<typeof setInterval> | null
  isLoadingHistory: boolean
  generateContent: (prompt: string, type: 'image' | 'video', options?: any) => Promise<void>
  loadHistory: (page?: number, size?: number, type?: string) => Promise<void>
  refreshHistory: () => Promise<void>
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  startPolling: (contentId: string) => void
  stopPolling: () => void
  checkGenerationStatus: (contentId: string) => Promise<void>
}

// 模板状态接口
interface TemplateState {
  templates: Template[]
  categories: Category[]
  selectedCategory: string
  searchQuery: string
  isLoading: boolean
  fetchTemplates: (categoryId?: string, searchQuery?: string) => Promise<void>
  fetchCategories: () => Promise<void>
  searchTemplates: (query: string, categoryId?: string) => Promise<void>
  setSelectedCategory: (categoryId: string) => void
  setSearchQuery: (query: string) => void
  loadCategories: () => Promise<void>
  useTemplate: (templateId: string) => Promise<void>
}

// 艺术风格状态接口
interface ArtStyleState {
  styles: ArtStyle[]
  isLoading: boolean
  error: string | null
  fetchStyles: (type?: 'image' | 'video' | 'both') => Promise<void>
  getStyleById: (id: number) => ArtStyle | undefined
  getStylesByType: (type: 'image' | 'video') => ArtStyle[]
}

// 用户状态管理
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);
          
          // 检查响应数据格式，支持多种可能的数据结构
          let userData;
          if (response && response.user) {
            userData = response.user;
          } else if (response && response.id) {
            userData = response;
          } else {
            console.error('登录响应数据:', response);
            throw new Error('登录响应数据格式错误');
          }
          
          if (!userData || !userData.id) {
            console.error('用户数据无效:', userData);
            throw new Error('登录响应数据格式错误');
          }
          
          const user: User = {
            id: userData.id.toString(),
            email: userData.email || email,
            name: userData.name || '',
            avatar: userData.avatar
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, confirmPassword: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(email, password, name, confirmPassword);
          
          let userData;
          if (response && response.user) {
            userData = response.user;
          } else if (response && response.id) {
            userData = response;
          } else {
            console.error('注册响应数据:', response);
            throw new Error('注册响应数据格式错误');
          }
          
          if (!userData || !userData.id) {
            console.error('用户数据无效:', userData);
            throw new Error('注册响应数据格式错误');
          }
          
          const user: User = {
            id: userData.id.toString(),
            email: userData.email || email,
            name: userData.name || name,
            avatar: userData.avatar
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        clearToken();
        set({ user: null, isAuthenticated: false, token: null });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: !!token });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        try {
          const userProfile = await authAPI.getProfile();
          
          const user: User = {
            id: userProfile.id.toString(),
            email: userProfile.email,
            name: userProfile.name,
            avatar: userProfile.avatar
          };
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('checkAuth 失败:', error);
          clearToken();
          set({ user: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// 移动端状态管理
export const useMobileStore = create<MobileState>((set) => ({
  // 底部导航状态
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // 设备信息
  deviceInfo: null,
  setDeviceInfo: (info) => set({ deviceInfo: info }),
  
  // 网络状态
  networkStatus: { isOnline: navigator.onLine },
  setNetworkStatus: (status) => set({ networkStatus: status }),
  
  // 键盘状态
  isKeyboardVisible: false,
  setKeyboardVisible: (visible) => set({ isKeyboardVisible: visible }),
  
  // 加载状态
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  
  // 错误状态
  error: null,
  setError: (error) => set({ error }),
}))

// 内容生成状态管理
export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      history: [],
      isGenerating: false,
      currentGeneration: null,
      pollingInterval: null,
      isLoadingHistory: false,

      generateContent: async (prompt: string, type: 'image' | 'video', options = {}) => {
        set({ isGenerating: true });
        
        try {
          // 导入API函数
          const { contentAPI } = await import('../lib/api');
          const { formatGeneratedContent } = await import('../utils');
          
          // 创建临时生成中状态项
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
          
          // 将临时项插入到历史记录的第一位
          const currentHistory = get().history;
          const updatedHistory = [tempContent, ...currentHistory].slice(0, 4);
          set({ 
            history: updatedHistory,
            currentGeneration: tempContent
          });
          
          const result = await contentAPI.generateContent(
            prompt,
            type,
            undefined,
            options.size || 'landscape_16_9',
            options.style || '默认风格',
            options
          );
          
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
          const { contentAPI } = await import('../lib/api');
          const { formatGeneratedContent } = await import('../utils');
          
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
        const { pollingInterval } = get();
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        
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
          const { contentAPI } = await import('../lib/api');
          const { formatGeneratedContent } = await import('../utils');
          
          const result = await contentAPI.getContent(contentId);
          const { currentGeneration, history } = get();
          
          if (currentGeneration && currentGeneration.id === contentId) {
            const updatedContent: GeneratedContent = formatGeneratedContent(result);
            
            const updatedHistory = history.map(item => 
              item.id === contentId ? updatedContent : item
            );
            
            set({ 
              currentGeneration: updatedContent,
              history: updatedHistory
            });
            
            if (result.status === 'completed' || result.status === 'failed') {
              get().stopPolling();
            }
          }
        } catch (error) {
          console.error('检查生成状态失败:', error);
          get().stopPolling();
        }
      }
    }),
    {
      name: 'generation-storage',
      partialize: (state) => ({ 
        history: state.history
      }),
    }
  )
)

// 模板状态管理
export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      categories: [{ id: 0, name: '全部' }],
      selectedCategory: '全部',
      searchQuery: '',
      isLoading: false,

      fetchTemplates: async (categoryId?: string, searchQuery?: string) => {
        set({ isLoading: true });
        try {
          const { templateAPI } = await import('../lib/api');
          
          let templatesData;
          
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

      fetchCategories: async () => {
        try {
          const { templateCategoryAPI } = await import('../lib/api');
          const categoriesData = await templateCategoryAPI.getAllCategories();
          const categories = [{ id: 0, name: '全部' }, ...categoriesData];
          set({ categories });
        } catch (error) {
          console.error('加载分类失败:', error);
          throw error;
        }
      },

      searchTemplates: async (query: string, categoryId?: string) => {
        set({ isLoading: true });
        try {
          const { templateAPI } = await import('../lib/api');
          const templatesData = await templateAPI.searchTemplates(
            query.trim(),
            1,
            100,
            categoryId
          );
          
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
          const { templateCategoryAPI } = await import('../lib/api');
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
        const actualCategoryId = categoryId === '全部' ? undefined : categoryId;
        fetchTemplates(actualCategoryId, searchQuery);
      },

      setSearchQuery: (query: string) => {
        const { selectedCategory, fetchTemplates } = get();
        set({ searchQuery: query });
        const actualCategoryId = selectedCategory === '全部' ? undefined : selectedCategory;
        fetchTemplates(actualCategoryId, query);
      },

      useTemplate: async (templateId: string) => {
        try {
          const { templateAPI } = await import('../lib/api');
          await templateAPI.useTemplate(templateId);
          
          const { templates } = get();
          const updatedTemplates = templates.map(template => {
            if (template.id === templateId) {
              return {
                ...template,
                views: (template.views || 0) + 1
              };
            }
            return template;
          });
          
          set({ templates: updatedTemplates });
        } catch (error) {
          console.error('更新模板使用次数失败:', error);
          throw error;
        }
      }
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({ 
        templates: state.templates,
        categories: state.categories
      }),
    }
  )
)

// 艺术风格状态管理
export const useArtStyleStore = create<ArtStyleState>((set, get) => ({
  styles: [],
  isLoading: false,
  error: null,

  fetchStyles: async (type?: 'image' | 'video' | 'both') => {
    set({ isLoading: true, error: null });
    try {
      const { contentAPI } = await import('../lib/api');
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
}))

// 移动端特有的缓存状态管理
export const useCacheStore = create<{
  cacheSize: number
  lastCleanup: number
  setCacheSize: (size: number) => void
  updateLastCleanup: () => void
  shouldCleanup: () => boolean
}>()(
  persist(
    (set, get) => ({
      cacheSize: 0,
      lastCleanup: Date.now(),
      
      setCacheSize: (size: number) => set({ cacheSize: size }),
      
      updateLastCleanup: () => set({ lastCleanup: Date.now() }),
      
      shouldCleanup: () => {
        const { lastCleanup } = get();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        return (now - lastCleanup) > oneHour;
      }
    }),
    {
      name: 'cache-storage',
    }
  )
)

// 网络状态监听和离线数据缓存
export const useNetworkStore = create<{
  isOnline: boolean
  networkType: string
  isSlowConnection: boolean
  offlineQueue: Array<{ id: string; action: string; data: any; timestamp: number }>
  setOnline: (online: boolean) => void
  setNetworkType: (type: string) => void
  addToOfflineQueue: (action: string, data: any) => void
  processOfflineQueue: () => Promise<void>
  clearOfflineQueue: () => void
}>()(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      networkType: 'unknown',
      isSlowConnection: false,
      offlineQueue: [],

      setOnline: (online: boolean) => {
        set({ isOnline: online });
        
        // 当网络恢复时，处理离线队列
        if (online) {
          get().processOfflineQueue();
        }
      },

      setNetworkType: (type: string) => {
        const isSlowConnection = type === 'slow-2g' || type === '2g';
        set({ networkType: type, isSlowConnection });
      },

      addToOfflineQueue: (action: string, data: any) => {
        const { offlineQueue } = get();
        const queueItem = {
          id: Date.now().toString(),
          action,
          data,
          timestamp: Date.now()
        };
        
        set({ offlineQueue: [...offlineQueue, queueItem] });
      },

      processOfflineQueue: async () => {
        const { offlineQueue, isOnline } = get();
        
        if (!isOnline || offlineQueue.length === 0) {
          return;
        }

        console.log(`处理离线队列，共 ${offlineQueue.length} 项`);
        
        // 按时间戳排序，确保按顺序处理
        const sortedQueue = [...offlineQueue].sort((a, b) => a.timestamp - b.timestamp);
        const processedIds: string[] = [];

        for (const item of sortedQueue) {
          try {
            // 根据action类型处理不同的离线操作
            switch (item.action) {
              case 'generate_content':
                const { contentAPI } = await import('../lib/api');
                await contentAPI.generateContent(
                  item.data.prompt,
                  item.data.type,
                  item.data.templateId,
                  item.data.size,
                  item.data.style,
                  item.data.options
                );
                break;
              
              case 'use_template':
                const { templateAPI } = await import('../lib/api');
                await templateAPI.useTemplate(item.data.templateId);
                break;
              
              case 'report_share':
                const { mobileAPI } = await import('../lib/api');
                await mobileAPI.reportShare(
                  item.data.contentId,
                  item.data.platform,
                  item.data.shareMethod
                );
                break;
              
              default:
                console.warn('未知的离线操作类型:', item.action);
            }
            
            processedIds.push(item.id);
            console.log(`成功处理离线操作: ${item.action}`);
          } catch (error) {
            console.error(`处理离线操作失败: ${item.action}`, error);
            // 如果是网络错误，保留在队列中稍后重试
            if (error instanceof Error && error.message.includes('网络')) {
              continue;
            }
            // 其他错误则移除该项
            processedIds.push(item.id);
          }
        }

        // 移除已处理的项目
        if (processedIds.length > 0) {
          const remainingQueue = offlineQueue.filter(item => !processedIds.includes(item.id));
          set({ offlineQueue: remainingQueue });
          console.log(`已处理 ${processedIds.length} 项离线操作，剩余 ${remainingQueue.length} 项`);
        }
      },

      clearOfflineQueue: () => {
        set({ offlineQueue: [] });
      }
    }),
    {
      name: 'network-storage',
      partialize: (state) => ({
        offlineQueue: state.offlineQueue
      }),
    }
  )
)

// 移动端性能监控状态管理
export const usePerformanceStore = create<{
  metrics: {
    loadTime: number
    renderTime: number
    apiResponseTimes: Record<string, number[]>
    memoryUsage: number
    errorCount: number
  }
  addMetric: (type: string, value: number) => void
  addApiResponseTime: (endpoint: string, time: number) => void
  incrementErrorCount: () => void
  getAverageApiTime: (endpoint: string) => number
  resetMetrics: () => void
}>((set, get) => ({
  metrics: {
    loadTime: 0,
    renderTime: 0,
    apiResponseTimes: {},
    memoryUsage: 0,
    errorCount: 0
  },

  addMetric: (type: string, value: number) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        [type]: value
      }
    }));
  },

  addApiResponseTime: (endpoint: string, time: number) => {
    set(state => {
      const currentTimes = state.metrics.apiResponseTimes[endpoint] || [];
      // 只保留最近10次的响应时间
      const updatedTimes = [...currentTimes, time].slice(-10);
      
      return {
        metrics: {
          ...state.metrics,
          apiResponseTimes: {
            ...state.metrics.apiResponseTimes,
            [endpoint]: updatedTimes
          }
        }
      };
    });
  },

  incrementErrorCount: () => {
    set(state => ({
      metrics: {
        ...state.metrics,
        errorCount: state.metrics.errorCount + 1
      }
    }));
  },

  getAverageApiTime: (endpoint: string) => {
    const { metrics } = get();
    const times = metrics.apiResponseTimes[endpoint];
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  },

  resetMetrics: () => {
    set({
      metrics: {
        loadTime: 0,
        renderTime: 0,
        apiResponseTimes: {},
        memoryUsage: 0,
        errorCount: 0
      }
    });
  }
}))

// 移动端用户行为统计状态管理
export const useAnalyticsStore = create<{
  sessionId: string
  events: Array<{
    id: string
    type: string
    data: any
    timestamp: number
  }>
  addEvent: (type: string, data?: any) => void
  getEventsByType: (type: string) => any[]
  clearEvents: () => void
  getSessionDuration: () => number
}>()(
  persist(
    (set, get) => ({
      sessionId: Date.now().toString(),
      events: [],

      addEvent: (type: string, data?: any) => {
        const event = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type,
          data: data || {},
          timestamp: Date.now()
        };

        set(state => ({
          events: [...state.events, event].slice(-100) // 只保留最近100个事件
        }));

        // 如果启用了分析功能，上报事件
        if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
          import('../lib/api').then(({ mobileAPI }) => {
            mobileAPI.reportUserAction(type, data).catch(error => {
              console.warn('上报用户行为失败:', error);
            });
          });
        }
      },

      getEventsByType: (type: string) => {
        const { events } = get();
        return events.filter(event => event.type === type);
      },

      clearEvents: () => {
        set({ events: [] });
      },

      getSessionDuration: () => {
        const { sessionId } = get();
        const sessionStart = parseInt(sessionId);
        return Date.now() - sessionStart;
      }
    }),
    {
      name: 'analytics-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        events: state.events.slice(-50) // 持久化时只保存最近50个事件
      }),
    }
  )
)