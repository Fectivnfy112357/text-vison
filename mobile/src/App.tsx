import { useEffect, useMemo, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// 页面组件 - 使用懒加载优化性能
const Home = lazy(() => import('./pages/Home'))
const Create = lazy(() => import('./pages/Create'))
const History = lazy(() => import('./pages/History'))
const Templates = lazy(() => import('./pages/Templates'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Help = lazy(() => import('./pages/Help'))
const Notifications = lazy(() => import('./pages/Settings/Notifications'))
const Privacy = lazy(() => import('./pages/Settings/Privacy'))
const Appearance = lazy(() => import('./pages/Settings/Appearance'))

// 布局组件
import MobileLayout from './components/layout/MobileLayout'
import BottomNavigation from './components/navigation/BottomNavigation'

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

// 优化的页面动画组件
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="h-full"
  >
    {children}
  </motion.div>
)

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 应用启动时检查认证状态
    checkAuth()
  }, [])

  // 缓存背景样式，避免重复计算
  const backgroundStyle = useMemo(() => ({
    className: "h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50"
  }), [])

  return (
    <Router>
      <div {...backgroundStyle}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* 认证相关路由 */}
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <Login />
                </AnimatedPage>
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <Register />
                </AnimatedPage>
              </Suspense>
            } />
            
            {/* 主应用路由 - 统一使用ProtectedRoute包裹 */}
            <Route path="/*" element={
              <ProtectedRoute>
                <MobileLayout>
                  <div className="flex-1 overflow-hidden pb-20">
                    <Routes>
                      <Route path="/" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Home />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/create" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Create />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/history" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <History />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/templates" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Templates />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/profile" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Profile />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/help" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Help />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/settings/notifications" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Notifications />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/settings/privacy" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Privacy />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      <Route path="/settings/appearance" element={
                        <Suspense fallback={<PageLoader />}>
                          <AnimatedPage>
                            <Appearance />
                          </AnimatedPage>
                        </Suspense>
                      } />
                      {/* 默认重定向到首页 */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </MobileLayout>
                <BottomNavigation />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
        
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