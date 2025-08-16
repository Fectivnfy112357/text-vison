import { useEffect, useMemo, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { isPCDevice } from './utils/deviceDetection'

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

  // 设备检测和跳转逻辑
  useEffect(() => {
    let timeoutId: number;
    
    const checkDevice = () => {
      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 防抖：延迟检测，避免频繁触发
      timeoutId = setTimeout(() => {
        if (isPCDevice()) {
          window.location.href = 'https://www.textvision.top:666';
        }
      }, 300);
    };
    
    // 初始检测
    checkDevice();
    
    // 监听窗口大小变化（F12设备仿真会触发）
    const handleResize = () => {
      checkDevice();
    };
    
    // 监听设备方向变化
    const handleOrientationChange = () => {
      checkDevice();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 清理函数
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // 缓存背景样式，避免重复计算 - 性能优化版本
  const backgroundStyle = useMemo(() => ({
    className: "h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50 gpu-accelerated"
  }), [])

  return (
    <Router>
      <div {...backgroundStyle}>
        <Routes>
            {/* 根路径重定向到移动端首页 */}
            <Route path="/" element={<Navigate to="/mobile/" replace />} />
            
            {/* 认证相关路由 */}
            <Route path="/mobile/login" element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            } />
            <Route path="/mobile/register" element={
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
        

      </div>
    </Router>
  )
}

export default App