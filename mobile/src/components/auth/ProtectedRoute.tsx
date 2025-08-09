import React from 'react'
import { useAuthStore } from '../../store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading } = useAuthStore()

  // 如果正在加载认证状态，显示加载界面
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 移除认证检查，允许所有用户访问
  return <>{children}</>
}

export default ProtectedRoute