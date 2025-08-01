import { create } from 'zustand';
import { authAPI, clearToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(email, password);
      
      // 检查响应数据是否存在，用户数据在 response.user 中
      if (!response || !response.user || !response.user.id) {
        throw new Error('登录响应数据格式错误');
      }
      
      const user: User = {
        id: response.user.id.toString(),
        email: response.user.email || '',
        name: response.user.name || '',
        avatar: response.user.avatar
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
      
      // 检查响应数据是否存在，用户数据在 response.user 中
      if (!response || !response.user || !response.user.id) {
        throw new Error('注册响应数据格式错误');
      }
      
      const user: User = {
        id: response.user.id.toString(),
        email: response.user.email || '',
        name: response.user.name || '',
        avatar: response.user.avatar
      };
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearToken();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  checkAuth: async () => {
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
      // Token 无效或过期，清除认证状态
      clearToken();
      set({ user: null, isAuthenticated: false });
    }
  }
}));