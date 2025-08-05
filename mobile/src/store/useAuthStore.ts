import { create } from 'zustand'
import { authAPI, User, LoginRequest, RegisterRequest } from '../lib/api'
import { getToken, setToken, clearToken } from '../lib/api'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // 状态
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // 登录
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login(credentials)
      console.log('[Auth] Login response:', response)
      // 根据API响应结构，token在data.token中
      const token = response.data?.token || response.token
      const user = response.data?.user || response.user
      
      if (!token) {
        throw new Error('登录响应中未找到token')
      }
      
      setToken(token)
      set({ 
        user: user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      toast.success('登录成功')
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || '登录失败'
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 注册
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.register(data)
      console.log('[Auth] Register response:', response)
      // 根据API响应结构，token在data.token中
      const token = response.data?.token || response.token
      const user = response.data?.user || response.user
      
      if (!token) {
        throw new Error('注册响应中未找到token')
      }
      
      setToken(token)
      set({ 
        user: user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      toast.success('注册成功')
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || error.toString()
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 登出
  logout: () => {
    try {
      authAPI.logout().catch(() => {}) // 忽略登出API错误
    } finally {
      clearToken()
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      })
      toast.success('已退出登录')
    }
  },

  // 检查认证状态
  checkAuth: async () => {
    const token = getToken()
    if (!token) {
      console.log('[Auth] No token found, setting unauthenticated')
      set({ isAuthenticated: false, user: null, isLoading: false })
      return
    }

    console.log('[Auth] Token found, checking user info...')
    set({ isLoading: true })
    try {
      const user = await authAPI.getUserInfo()
      console.log('[Auth] User info retrieved successfully:', user)
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error: any) {
      console.error('[Auth] Failed to get user info:', error)
      // 只有在401错误时才清除token，其他错误保持当前状态
      if (error.response?.status === 401) {
        console.log('[Auth] Token expired, clearing auth state')
        clearToken()
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      } else {
        console.log('[Auth] Network error, keeping current auth state')
        // 网络错误时，如果有token就假设用户已认证
        set({ 
          isAuthenticated: true, 
          isLoading: false 
        })
      }
    }
  },

  // 更新用户信息
  updateUser: async (data: Partial<User>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedUser = await authAPI.updateUserInfo(data)
      set({ 
        user: updatedUser, 
        isLoading: false 
      })
      toast.success('用户信息更新成功')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || error.toString()
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  // 更新个人资料
  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null })
    try {
      const updatedUser = await authAPI.updateUserInfo(data)
      set({ 
        user: updatedUser, 
        isLoading: false 
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || error.toString()
      set({ error: errorMessage, isLoading: false })
      throw new Error(errorMessage)
    }
  },

  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null })
    try {
      await authAPI.changePassword({ oldPassword, newPassword })
      set({ isLoading: false })
      toast.success('密码修改成功')
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || error.toString()
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
      return false
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))