// API 基础配置和工具函数
const API_BASE_URL = 'http://localhost:8080/api';

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

// 通用请求函数
const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // 尝试解析响应体
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // 如果无法解析JSON，抛出HTTP状态错误
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token 过期或无效，清除本地存储
        clearToken();
        throw new Error(data.message || '登录已过期，请重新登录');
      }
      
      // 抛出后端返回的具体错误信息
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    // 添加调试信息
    console.log('API响应:', { response: response, data: data });
    
    // 检查业务状态码 - 修复：确保code是数字类型的200
    if (data.code !== 200 && data.code !== '200') {
      console.error('业务状态码错误:', data);
      throw new Error(data.message || '请求失败');
    }
    
    // 如果有data字段则返回data，否则返回整个响应
    return data.data || data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
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
  getTemplates: async (page = 1, size = 20, category?: string, type?: string) => {
    let url = `/templates?page=${page}&size=${size}`;
    if (category && category !== '全部') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    return await request(url);
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
  searchTemplates: async (keyword: string, page = 1, size = 20, category?: string, type?: string) => {
    let url = `/templates/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
    if (category && category !== '全部') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    return await request(url);
  },

  // 获取热门模板
  getPopularTemplates: async (limit = 10) => {
    return await request(`/templates/popular?limit=${limit}`);
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
      style,
    };
    
    // 如果有额外选项，合并到请求体中
    if (options) {
      Object.assign(requestBody, options);
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
    let url = `/contents?page=${page}&size=${size}`;
    if (type) {
      url += `&type=${type}`;
    }
    return await request(url);
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