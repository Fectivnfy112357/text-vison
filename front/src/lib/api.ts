// API 基础配置和工具函数
const API_BASE_URL = 'http://223.72.35.202:8999/api';

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

// 统一的错误处理
const handleRequestError = (error: any): never => {
  console.error('API请求错误:', error);
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    throw new Error('网络连接失败，请检查网络连接或稍后重试');
  }
  throw error;
};

// 通用请求函数
const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = getRequestConfig(options);

  try {
    const response = await fetch(url, config);
    return await handleResponse(response, endpoint);
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

// 导出工具函数
export { getToken, setToken, clearToken };