import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getToken } from '../../lib/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()
  const token = getToken()

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

  // 如果有token但认证状态还未确定（初始化阶段），显示加载状态而不是跳转到登录页
  if (token && !isAuthenticated && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">验证登录状态...</p>
        </div>
      </div>
    )
  }

  // 如果没有token且未认证，跳转到登录页
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 如果已认证，渲染子组件
  return <>{children}</>
}

export default ProtectedRoute