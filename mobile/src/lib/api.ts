import axios, { AxiosResponse, AxiosError } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8999/api'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token管理
export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

export const setToken = (token: string): void => {
  localStorage.setItem('token', token)
}

export const clearToken = (): void => {
  localStorage.removeItem('token')
}

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 通用请求函数
export const request = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
      ...config,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// 类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  phone?: string
  bio?: string
  isPremium?: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Template {
  id: string
  name: string
  title: string
  description: string
  prompt: string
  thumbnail: string
  previewImage?: string
  category: string
  tags: string[]
  isPopular: boolean
  usageCount: number
  rating?: number
  author?: string
  type?: 'image' | 'video'
  downloadCount?: number
  isPremium?: boolean
  isHot?: boolean
  createdAt: string
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  isEnabled: boolean
}

export interface ArtStyle {
  id: string
  name: string
  description: string
  thumbnail: string
  prompt: string
}

export interface ImageGenerationParams {
  prompt: string
  size?: string
  quality?: string
  responseFormat?: string
  seed?: number
  guidanceScale?: number
  watermark?: boolean
  referenceImage?: string
}

export interface VideoGenerationParams {
  prompt: string
  resolution?: string
  duration?: number
  ratio?: string
  fps?: number
  cameraFixed?: boolean
  cfgScale?: number
  count?: number
  watermark?: boolean
  referenceImage?: string
}

export interface GenerationContent {
  id: string
  type: 'image' | 'video'
  prompt: string
  result?: string
  thumbnail?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  params: ImageGenerationParams | VideoGenerationParams
  createdAt: string
  updatedAt: string
}

// 认证API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> => 
    request('POST', '/users/login', data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> => 
    request('POST', '/users/register', data),
  
  getUserInfo: (): Promise<User> => 
    request('GET', '/users/me'),
  
  updateUserInfo: (data: Partial<User>): Promise<User> => 
    request('PUT', '/users/me', data),
  
  changePassword: (data: { oldPassword: string; newPassword: string }): Promise<void> => 
    request('POST', '/users/change-password', data),
  
  logout: (): Promise<void> => 
    request('POST', '/users/logout'),
}

// 模板API
export const templateAPI = {
  getTemplates: (params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{ templates: Template[]; total: number }> => 
    request('GET', '/templates', { params }),
  
  getTemplate: (id: string): Promise<Template> => 
    request('GET', `/templates/${id}`),
  
  getPopularTemplates: (limit?: number): Promise<Template[]> => 
    request('GET', '/templates/popular', { params: { limit } }),
  
  getTemplatesByCategory: (category: string): Promise<Template[]> => 
    request('GET', `/templates/category/${category}`),
  
  searchTemplates: (query: string): Promise<Template[]> => 
    request('GET', '/templates/search', { params: { q: query } }),
  
  useTemplate: (id: string): Promise<void> => 
    request('POST', `/templates/${id}/use`),
}

// 模板分类API
export const templateCategoryAPI = {
  getCategories: (): Promise<TemplateCategory[]> => 
    request('GET', '/template-categories'),
  
  getCategoryNames: (): Promise<string[]> => 
    request('GET', '/template-categories/names'),
}

// 内容生成API
export const contentAPI = {
  generateContent: (data: {
    prompt: string
    type: 'image' | 'video'
    templateId?: string
    size?: string
    style?: string
    options?: ImageGenerationParams | VideoGenerationParams
  }): Promise<GenerationContent> => 
    request('POST', '/content/generate', data),
  
  getArtStyles: (): Promise<ArtStyle[]> => 
    request('GET', '/content/art-styles'),
  
  getUserContents: (params?: { page?: number; limit?: number; type?: 'image' | 'video' }): Promise<{ contents: GenerationContent[]; total: number }> => 
    request('GET', '/content/user', { params }),
  
  getContent: (id: string): Promise<GenerationContent> => 
    request('GET', `/content/${id}`),
  
  getRecentContents: (limit?: number): Promise<GenerationContent[]> => 
    request('GET', '/content/recent', { params: { limit } }),
  
  deleteContent: (id: string): Promise<void> => 
    request('DELETE', `/content/${id}`),
  
  batchDeleteContents: (ids: string[]): Promise<void> => 
    request('POST', '/content/batch-delete', { ids }),
  
  checkGenerationStatus: (id: string): Promise<GenerationContent> => 
    request('GET', `/content/${id}/status`),
}

export default apiClient