// API 基础配置和工具函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8999/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// 获取存储的 JWT token
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 设置 JWT token
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// 清除 JWT token
const clearToken = (): void => {
  localStorage.removeItem('auth_token');
};

// 统一的请求配置
const getRequestConfig = (options: RequestInit = {}): RequestInit => {
  const token = getToken();
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
};

// 统一的响应处理
const handleResponse = async (response: Response, endpoint: string): Promise<any> => {
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`);
  }
  
  if (!response.ok) {
    if (response.status === 401) {
      console.error('401 未授权错误:', { endpoint, responseData: data });
      clearToken();
      throw new Error(data.message || '登录已过期，请重新登录');
    }
    throw new Error(data.message || `请求失败: ${response.status}`);
  }
  
  if (data.code !== 200 && data.code !== '200') {
    console.error('业务状态码错误:', data);
    throw new Error(data.message || '请求失败');
  }
  
  return data.data || data;
};

// 网络状态检测
const isOnline = (): boolean => {
  return navigator.onLine;
};

// 移动端网络质量检测
const getNetworkQuality = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    return connection.effectiveType || 'unknown';
  }
  return 'unknown';
};

// 请求重试机制
const retryRequest = async (
  fn: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 如果是网络错误且还有重试次数，则重试
      if (i < maxRetries && (
        error instanceof TypeError && 
        (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))
      )) {
        console.warn(`请求失败，${delay}ms后进行第${i + 1}次重试...`);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // 指数退避
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
};

// 带超时的fetch
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接');
    }
    throw error;
  }
};

// 统一的错误处理
const handleRequestError = (error: any): never => {
  console.error('API请求错误:', error);
  
  if (!isOnline()) {
    throw new Error('网络连接已断开，请检查网络设置');
  }
  
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    const networkQuality = getNetworkQuality();
    if (networkQuality === 'slow-2g' || networkQuality === '2g') {
      throw new Error('网络信号较弱，请稍后重试');
    }
    throw new Error('网络连接失败，请检查网络连接或稍后重试');
  }
  
  if (error.message.includes('请求超时')) {
    throw new Error('请求超时，请检查网络连接或稍后重试');
  }
  
  throw error;
};

// 通用请求函数
const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = getRequestConfig(options);

  // 离线检测
  if (!isOnline()) {
    throw new Error('网络连接已断开，请检查网络设置');
  }

  try {
    return await retryRequest(async () => {
      const response = await fetchWithTimeout(url, config);
      return await handleResponse(response, endpoint);
    });
  } catch (error) {
    return handleRequestError(error);
  }
};

// 用户相关 API
export const authAPI = {
  // 用户登录
  login: async (email: string, password: string) => {
    const data = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // 保存 token
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  },

  // 用户注册
  register: async (email: string, password: string, name: string, confirmPassword: string) => {
    const data = await request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, confirmPassword }),
    });
    
    // 保存 token
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  },

  // 获取用户信息
  getProfile: async () => {
    return await request('/users/profile');
  },

  // 更新用户信息
  updateProfile: async (name: string, avatar?: string) => {
    return await request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, avatar }),
    });
  },

  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string) => {
    return await request('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  // 获取用户操作日志
  getOperationLogs: async (page = 1, size = 20) => {
    return await request(`/users/operation-logs?page=${page}&size=${size}`);
  },

  // 发送手机验证码
  sendVerificationCode: async (phone: string) => {
    return await request('/users/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // 验证手机验证码
  verifyCode: async (phone: string, code: string) => {
    return await request('/users/verify-code', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  },
};

// 模板相关 API
export const templateAPI = {
  // 获取模板列表
  getTemplates: async (page = 1, size = 20, categoryId?: string, type?: string) => {
    const params: Record<string, any> = { page, size };
    if (categoryId && categoryId !== '全部') {
      params.categoryId = categoryId;
    }
    if (type) {
      params.type = type;
    }
    const queryString = new URLSearchParams(params).toString();
    return await request(`/templates?${queryString}`);
  },

  // 获取模板详情
  getTemplate: async (id: string) => {
    return await request(`/templates/${id}`);
  },

  // 获取所有分类
  getCategories: async () => {
    return await request('/templates/categories');
  },

  // 搜索模板
  searchTemplates: async (keyword: string, page = 1, size = 20, categoryId?: string, type?: string) => {
    const params: Record<string, any> = { keyword, page, size };
    if (categoryId && categoryId !== '全部') {
      params.categoryId = categoryId;
    }
    if (type) {
      params.type = type;
    }
    const queryString = new URLSearchParams(params).toString();
    return await request(`/templates/search?${queryString}`);
  },

  // 获取热门模板
  getPopularTemplates: async (limit = 10) => {
    return await request(`/templates/popular?limit=${limit}`);
  },

  // 使用模板（增加使用次数）
  useTemplate: async (id: string) => {
    return await request(`/templates/${id}/use`, {
      method: 'POST',
    });
  },
};

// 模板分类相关 API
export const templateCategoryAPI = {
  // 获取所有启用的分类
  getAllCategories: async () => {
    return await request('/template-categories');
  },

  // 获取分类名称列表
  getCategoryNames: async () => {
    return await request('/template-categories/names');
  },

  // 根据ID获取分类详情
  getCategoryById: async (id: number) => {
    return await request(`/template-categories/${id}`);
  },

  // 创建新分类
  createCategory: async (category: {
    name: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    status?: number;
  }) => {
    return await request('/template-categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  // 更新分类信息
  updateCategory: async (id: number, category: {
    name?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    status?: number;
  }) => {
    return await request(`/template-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  // 删除分类
  deleteCategory: async (id: number) => {
    return await request(`/template-categories/${id}`, {
      method: 'DELETE',
    });
  },

  // 更新分类排序
  updateSortOrder: async (id: number, sortOrder: number) => {
    return await request(`/template-categories/${id}/sort-order?sortOrder=${sortOrder}`, {
      method: 'PUT',
    });
  },
};

// 兼容性：保持原有的 getCategories 接口
templateAPI.getCategories = templateCategoryAPI.getCategoryNames;

// 内容生成相关 API
export const contentAPI = {
  // 生成内容
  generateContent: async (prompt: string, type: 'image' | 'video', templateId?: number, size?: string, style?: string, options?: any) => {
    const requestBody: any = {
      prompt,
      type,
      templateId,
      size,
    };
    
    // 如果有额外选项，合并到请求体中
    if (options) {
      Object.assign(requestBody, options);
    }
    
    // 如果options中有styleId，使用styleId；否则使用style
    if (options?.styleId) {
      requestBody.styleId = options.styleId;
    } else if (style) {
      requestBody.style = style;
    }
    
    return await request('/contents/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  // 艺术风格管理
  getArtStyles: async (type?: 'image' | 'video' | 'both') => {
    let url = '/art-styles';
    if (type) {
      url += `?type=${type}`;
    }
    return await request(url);
  },

  getArtStyleById: async (id: number) => {
    return await request(`/art-styles/${id}`);
  },

  // 用户内容管理
  getUserContents: async (page = 1, size = 20, type?: string) => {
    const params: Record<string, any> = { page, size };
    if (type) {
      params.type = type;
    }
    const queryString = new URLSearchParams(params).toString();
    return await request(`/contents?${queryString}`);
  },

  // 获取生成内容详情
  getContent: async (id: string) => {
    return await request(`/contents/${id}`);
  },

  // 获取最近生成内容
  getRecentContents: async (limit = 10) => {
    return await request(`/contents/recent?limit=${limit}`);
  },

  // 删除生成内容
  deleteContent: async (id: string) => {
    return await request(`/contents/${id}`, {
      method: 'DELETE',
    });
  },

  // 批量删除生成内容
  batchDeleteContents: async (ids: string[]) => {
    return await request('/contents/batch', {
      method: 'DELETE',
      body: JSON.stringify(ids.map(id => parseInt(id))),
    });
  },
};

// 移动端特有的API扩展
export const mobileAPI = {
  // 设备信息上报
  reportDeviceInfo: async (deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
    platform: string;
    isStandalone: boolean;
    networkType?: string;
    memoryInfo?: number;
    touchSupport?: boolean;
  }) => {
    return await request('/mobile/device-info', {
      method: 'POST',
      body: JSON.stringify({
        ...deviceInfo,
        timestamp: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
  },
  
  // 分享统计
  reportShare: async (contentId: string, platform: string, shareMethod?: string) => {
    return await request('/mobile/share-stats', {
      method: 'POST',
      body: JSON.stringify({ 
        contentId, 
        platform, 
        shareMethod,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }),
    });
  },

  // 获取移动端配置
  getMobileConfig: async () => {
    return await request('/mobile/config');
  },

  // 上报用户行为统计
  reportUserAction: async (action: string, data?: any) => {
    return await request('/mobile/user-actions', {
      method: 'POST',
      body: JSON.stringify({
        action,
        data,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  },

  // 上报性能数据
  reportPerformance: async (performanceData: {
    loadTime: number;
    renderTime: number;
    apiResponseTime?: number;
    memoryUsage?: number;
    networkType?: string;
  }) => {
    return await request('/mobile/performance', {
      method: 'POST',
      body: JSON.stringify({
        ...performanceData,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    });
  },

  // 上报错误信息
  reportError: async (error: {
    message: string;
    stack?: string;
    url?: string;
    line?: number;
    column?: number;
    userAgent?: string;
  }) => {
    return await request('/mobile/errors', {
      method: 'POST',
      body: JSON.stringify({
        ...error,
        timestamp: Date.now(),
        url: error.url || window.location.href,
        userAgent: error.userAgent || navigator.userAgent,
      }),
    });
  },

  // 获取移动端推荐内容
  getRecommendations: async (type: 'template' | 'content', limit = 10) => {
    return await request(`/mobile/recommendations?type=${type}&limit=${limit}`);
  },

  // 检查应用更新
  checkAppUpdate: async () => {
    return await request('/mobile/app-update');
  },
};

// 离线缓存管理
const CACHE_PREFIX = 'mobile_api_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

const cacheAPI = {
  // 设置缓存
  set: (key: string, data: any, expiry: number = CACHE_EXPIRY): void => {
    try {
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + expiry,
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('缓存设置失败:', error);
    }
  },

  // 获取缓存
  get: (key: string): any | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);
      
      // 检查是否过期
      if (Date.now() > cacheItem.expiry) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('缓存读取失败:', error);
      return null;
    }
  },

  // 清除指定缓存
  remove: (key: string): void => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  // 清除所有缓存
  clear: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  // 清除过期缓存
  clearExpired: (): void => {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem: CacheItem = JSON.parse(cached);
            if (now > cacheItem.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // 如果解析失败，删除该缓存项
          localStorage.removeItem(key);
        }
      }
    });
  },
};

// 带缓存的请求函数
const requestWithCache = async (
  endpoint: string, 
  options: RequestInit = {}, 
  cacheKey?: string,
  cacheExpiry?: number
): Promise<any> => {
  // 只对GET请求使用缓存
  const method = options.method?.toUpperCase() || 'GET';
  const shouldCache = method === 'GET' && cacheKey;

  // 尝试从缓存获取数据
  if (shouldCache) {
    const cachedData = cacheAPI.get(cacheKey);
    if (cachedData) {
      console.log('从缓存获取数据:', cacheKey);
      return cachedData;
    }
  }

  // 发起网络请求
  try {
    const data = await request(endpoint, options);
    
    // 缓存成功的响应
    if (shouldCache && data) {
      cacheAPI.set(cacheKey, data, cacheExpiry);
    }
    
    return data;
  } catch (error) {
    // 如果网络请求失败且有缓存，返回过期的缓存数据
    if (shouldCache && !isOnline()) {
      const expiredCache = localStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
      if (expiredCache) {
        try {
          const cacheItem: CacheItem = JSON.parse(expiredCache);
          console.warn('网络不可用，使用过期缓存数据:', cacheKey);
          return cacheItem.data;
        } catch (parseError) {
          // 忽略解析错误
        }
      }
    }
    
    throw error;
  }
};

// 网络状态监听
const networkStatusAPI = {
  // 添加网络状态监听器
  addNetworkListener: (callback: (isOnline: boolean) => void): (() => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 返回清理函数
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  // 获取当前网络状态
  getNetworkStatus: () => ({
    isOnline: isOnline(),
    networkType: getNetworkQuality(),
    connection: (navigator as any).connection || null,
  }),
};

// 增强的模板API，支持缓存
const enhancedTemplateAPI = {
  ...templateAPI,
  
  // 获取模板列表（带缓存）
  getTemplates: async (page = 1, size = 20, categoryId?: string, type?: string) => {
    const params: Record<string, any> = { page, size };
    if (categoryId && categoryId !== '全部') {
      params.categoryId = categoryId;
    }
    if (type) {
      params.type = type;
    }
    const queryString = new URLSearchParams(params).toString();
    const cacheKey = `templates_${queryString}`;
    
    return await requestWithCache(`/templates?${queryString}`, {}, cacheKey, 10 * 60 * 1000); // 10分钟缓存
  },

  // 获取分类（带缓存）
  getCategories: async () => {
    return await requestWithCache('/templates/categories', {}, 'template_categories', 30 * 60 * 1000); // 30分钟缓存
  },

  // 获取热门模板（带缓存）
  getPopularTemplates: async (limit = 10) => {
    return await requestWithCache(`/templates/popular?limit=${limit}`, {}, `popular_templates_${limit}`, 15 * 60 * 1000); // 15分钟缓存
  },
};

// 增强的内容API，支持缓存
const enhancedContentAPI = {
  ...contentAPI,
  
  // 获取艺术风格（带缓存）
  getArtStyles: async (type?: 'image' | 'video' | 'both') => {
    let url = '/art-styles';
    if (type) {
      url += `?type=${type}`;
    }
    const cacheKey = `art_styles_${type || 'all'}`;
    return await requestWithCache(url, {}, cacheKey, 30 * 60 * 1000); // 30分钟缓存
  },

  // 获取用户内容（带缓存）
  getUserContents: async (page = 1, size = 20, type?: string) => {
    const params: Record<string, any> = { page, size };
    if (type) {
      params.type = type;
    }
    const queryString = new URLSearchParams(params).toString();
    const cacheKey = `user_contents_${queryString}`;
    
    return await requestWithCache(`/contents?${queryString}`, {}, cacheKey, 5 * 60 * 1000); // 5分钟缓存
  },
};

// 导出工具函数和API
export { 
  getToken, 
  setToken, 
  clearToken, 
  cacheAPI, 
  networkStatusAPI, 
  isOnline, 
  getNetworkQuality,
  enhancedTemplateAPI,
  enhancedContentAPI
};