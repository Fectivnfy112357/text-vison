import axios, { AxiosResponse, AxiosError } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://frp-off.com:32626/api'


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
    // 只有认证相关接口的401错误才清空登录状态
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      // 只有这些认证相关接口的401错误才清空登录状态
      const authRelatedUrls = ['/users/profile', '/users/login', '/users/register']
      const isAuthRelated = authRelatedUrls.some(authUrl => url.includes(authUrl))
      
      if (isAuthRelated) {
        clearToken()
        // 移除强制跳转，让React Router和ProtectedRoute处理页面跳转
      }
      // 其他接口的401错误直接返回，不清空登录状态
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
    const requestConfig: any = {
      method,
      url,
      ...config,
    }
    
    // 对于GET和DELETE请求，将data作为params传递
    if (method === 'GET' || method === 'DELETE') {
      if (data) {
        requestConfig.params = data
      }
    } else {
      // 对于POST和PUT请求，将data作为请求体传递
      requestConfig.data = data
    }
    
    const response = await apiClient.request(requestConfig)
    return response.data
  } catch (error) {
    throw error
  }
}

// 类型定义
export interface User {
  id: string
  username: string
  name?: string
  nickname?: string
  email: string
  avatar?: string
  phone?: string
  gender?: number
  country?: string
  province?: string
  city?: string
  status?: number
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
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 通用API响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
  success: boolean
}

export interface PaginatedResponse<T = any> {
  code: number
  message: string
  data: {
    records: T[]
    total: number
    current: number
    size: number
    pages: number
    hasPrevious: boolean
    hasNext: boolean
  }
  timestamp: number
  success: boolean
}

export interface AuthResponse {
  code: number
  message: string
  data: {
    user: User
    token: string
    tokenType: string
    expiresIn: number
  }
  timestamp: number
  success: boolean
}

export interface Template {
  id: number
  title: string
  description: string
  prompt: string
  category: string
  tags: string[] | null
  imageUrl: string
  type: 'image' | 'video'
  usageCount: number
  status: number
  createdAt: string
  updatedAt: string
  // 瀑布流布局支持字段
  aspectRatio?: number // 宽高比，默认为 16/9 ≈ 1.78
  imageWidth?: number // 图片原始宽度
  imageHeight?: number // 图片原始高度
  // 兼容字段
  name?: string
  thumbnail?: string
  previewImage?: string
  isPopular?: boolean
  rating?: number
  author?: string
  downloadCount?: number
  isPremium?: boolean
  isHot?: boolean
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  isEnabled: boolean
}

export interface ArtStyle {
  id: number
  name: string
  description: string
  applicableType: string
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

// 生成内容请求DTO（匹配后端GenerateContentRequest）
export interface GenerateContentRequest {
  /** 生成类型：image-图片，video-视频 */
  type: 'image' | 'video'
  /** 生成提示词 */
  prompt: string
  /** 尺寸比例 */
  size?: string
  /** 艺术风格 */
  style?: string
  /** 艺术风格ID */
  styleId?: number
  /** 参考图片URL */
  referenceImage?: string
  /** 使用的模板ID */
  templateId?: number
  /** 图片质量（仅图片生成） */
  quality?: string
  /** 是否添加水印 */
  watermark?: boolean

  // ========== 图片生成参数 ==========
  /** 返回格式（仅图片生成） */
  responseFormat?: string
  /** 随机数种子（仅图片生成） */
  seed?: number
  /** 引导比例（仅图片生成） */
  guidanceScale?: number

  // ========== 视频生成参数 ==========
  /** 视频生成模型 */
  model?: string
  /** 视频分辨率 */
  resolution?: string
  /** 视频时长（秒） */
  duration?: number
  /** 视频比例 */
  ratio?: string
  /** 帧率（仅视频生成） */
  fps?: number
  /** 是否固定摄像头（仅视频生成） */
  cameraFixed?: boolean
  /** CFG Scale参数（仅视频生成） */
  cfgScale?: number
  /** 生成视频数量 */
  count?: number
  /** 首帧图片URL（图生视频） */
  firstFrameImage?: string
  /** 尾帧图片URL（图生视频-首尾帧） */
  lastFrameImage?: string
  /** 是否高清（仅视频生成） */
  hd?: boolean
}

// 保持向后兼容的旧接口
export interface ImageGenerationParams {
  prompt: string
  size?: string
  quality?: string
  responseFormat?: string
  seed?: number
  guidanceScale?: number
  watermark?: boolean
  referenceImage?: string
  type?: string
  style?: string
  styleId?: number
  templateId?: number
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
  type?: string
  style?: string
  styleId?: number
  templateId?: number
  model?: string
  firstFrameImage?: string
  lastFrameImage?: string
  hd?: boolean
}

export interface GenerationContent {
  id: string
  type: 'image' | 'video'
  prompt: string
  result?: string
  url?: string
  thumbnail?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  params: ImageGenerationParams | VideoGenerationParams
  aspectRatio?: number
  width?: number
  height?: number
  createdAt: string
  updatedAt: string
}

// 认证API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> => 
    request('POST', '/users/login', data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> => 
    request('POST', '/users/register', data),
  
  getUserInfo: (): Promise<ApiResponse<User>> => 
    request('GET', '/users/profile'),
  
  updateUserInfo: (data: Partial<User>): Promise<ApiResponse<User>> => 
    request('PUT', '/users/profile', data),
  
  changePassword: (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> => 
    request('POST', '/users/password', data),
  
  logout: (): Promise<ApiResponse<void>> => 
    request('POST', '/users/logout'),
}

// 模板API
export const templateAPI = {
  getTemplates: (params?: { categoryId?: string; keyword?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Template>> => 
    request('GET', '/templates', params),
  
  getTemplate: (id: string): Promise<ApiResponse<Template>> => 
    request('GET', `/templates/${id}`),
  
  getPopularTemplates: (limit?: number): Promise<ApiResponse<Template[]>> => 
    request('GET', '/templates/popular', { limit }),
  
  getTemplatesByCategory: (category: string): Promise<ApiResponse<Template[]>> => 
    request('GET', `/templates/category/${category}`),
  
  searchTemplates: (query: string): Promise<PaginatedResponse<Template>> => 
    request('GET', '/templates/search', { keyword: query }),
  
  useTemplate: (id: string): Promise<ApiResponse<void>> => 
    request('POST', `/templates/${id}/use`),
}

// 模板分类API
export const templateCategoryAPI = {
  getCategories: (): Promise<ApiResponse<TemplateCategory[]>> => 
    request('GET', '/template-categories'),
  
  getCategoryNames: (): Promise<ApiResponse<string[]>> => 
    request('GET', '/template-categories/names'),
}

// 内容生成API
export const contentAPI = {
  generateContent: (data: GenerateContentRequest): Promise<ApiResponse<GenerationContent>> => 
    request('POST', '/contents/generate', data),
  
  // 保持向后兼容的旧方法
  generateContentLegacy: (data: {
    prompt: string
    type: 'image' | 'video'
    templateId?: string
    size?: string
    style?: string
    options?: ImageGenerationParams | VideoGenerationParams
  }): Promise<ApiResponse<GenerationContent>> => 
    request('POST', '/contents/generate', data),
  
  getArtStyles: (): Promise<ApiResponse<ArtStyle[]>> => 
    request('GET', '/art-styles'),
  
  getUserContents: (params?: { page?: number; limit?: number; type?: 'image' | 'video' }): Promise<PaginatedResponse<GenerationContent>> => 
    request('GET', '/contents', params),
  
  getContent: (id: string): Promise<ApiResponse<GenerationContent>> => 
    request('GET', `/contents/${id}`),
  
  getRecentContents: (limit?: number): Promise<ApiResponse<GenerationContent[]>> => 
    request('GET', '/contents/recent', { limit }),
  
  deleteContent: (id: string): Promise<ApiResponse<void>> => 
    request('DELETE', `/contents/${id}`),
  
  batchDeleteContents: (ids: string[]): Promise<ApiResponse<void>> => 
    request('POST', '/contents/batch-delete', { ids }),
  

  
  getUserStats: (): Promise<ApiResponse<{
    totalCount: number
    imageCount: number
    videoCount: number
    completedCount: number
    failedCount: number
    processingCount: number
    todayCount: number
  }>> => 
    request('GET', '/contents/stats'),
  
  getUserHistoryStats: (params?: { days?: number }): Promise<ApiResponse<{
    dailyStats: Array<{
      date: string
      total: number
      completed: number
      failed: number
      images: number
      videos: number
    }>
  }>> => 
    request('GET', '/contents/history-stats', params),
}

export default apiClient