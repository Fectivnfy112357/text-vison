import { useEffect, useMemo, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

// 页面组件 - 使用懒加载优化性能
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

// 布局组件
import MobileLayout from './components/layout/MobileLayout'
import BottomNavigation from './components/navigation/BottomNavigation'
import AnimatedRoutes from './components/AnimatedRoutes'

// 状态管理
import { useAuthStore } from './store/useAuthStore'

// 认证组件
import ProtectedRoute from './components/auth/ProtectedRoute'

// VConsole 调试工具
import VConsoleComponent from './components/VConsole'

// 页面加载组件
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
)


function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 应用启动时检查认证状态
    checkAuth()
  }, [])

  // 缓存背景样式，避免重复计算 - 性能优化版本
  const backgroundStyle = useMemo(() => ({
    className: "h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50 gpu-accelerated"
  }), [])

  return (
    <Router>
      <div {...backgroundStyle}>
        <Routes>
            {/* 认证相关路由 */}
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<PageLoader />}>
                <Register />
              </Suspense>
            } />
            
            {/* 主应用路由 - 统一使用ProtectedRoute包裹 */}
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <MobileLayout>
                      <AnimatedRoutes />
                    </MobileLayout>
                  </div>
                  <BottomNavigation />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        
        {/* 全局通知 */}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '14px',
              padding: '12px 16px',
            },
            duration: 3000,
          }}
        />
        
        {/* VConsole 调试工具 - 仅在移动端显示 */}
        <VConsoleComponent />
      </div>
    </Router>
  )
}

export default App