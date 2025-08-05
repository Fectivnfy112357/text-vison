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

export const useAuthStore = create<AuthState & AuthActions>((set) => {
  // 防重复调用标志
  let isCheckingAuth = false
  
  return {
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
      // 根据后端返回的数据结构 {code: 200, data: {token: '...', user: {...}}, message: '登录成功'}
      const token = response.data.token
      const user = response.data.user

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
      // 根据后端返回的数据结构 {code: 200, data: {token: '...', user: {...}}, message: '注册成功'}
      const token = response.data.token
      const user = response.data.user

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
      authAPI.logout().catch(() => { }) // 忽略登出API错误
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
    // 防止重复调用
    if (isCheckingAuth) {
      return
    }
    
    isCheckingAuth = true
    const token = getToken()
    
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false })
      isCheckingAuth = false
      return
    }

    // 先设置为已认证状态，避免跳转到登录页
    set({ isAuthenticated: true, isLoading: true })
    
    try {
      const user = await authAPI.getUserInfo()
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error: any) {
      console.error('[Auth] Failed to get user info:', error)
      
      // 只有在401错误时才清除token和认证状态
      if (error.response?.status === 401) {
        clearToken()
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      } else {
        // 非401错误时，保持认证状态但用户信息为空
        // 这样可以避免跳转到登录页，用户信息可以稍后重试获取
        set({ 
          user: null,
          isAuthenticated: true, 
          isLoading: false 
        })
      }
    } finally {
      isCheckingAuth = false
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
  }
})