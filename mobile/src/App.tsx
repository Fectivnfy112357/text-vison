import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// 页面组件
import Home from './pages/Home'
import Create from './pages/Create'
import History from './pages/History'
import Templates from './pages/Templates'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

// 布局组件
import MobileLayout from './components/layout/MobileLayout'
import BottomNavigation from './components/navigation/BottomNavigation'

// 状态管理
import { useAuthStore } from './store/useAuthStore'

// 认证组件
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // 应用启动时检查认证状态
    checkAuth()
  }, [])

  return (
    <Router>
      <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <AnimatePresence mode="wait">
          <Routes>
            {/* 认证相关路由 */}
            <Route path="/login" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Login />
              </motion.div>
            } />
            <Route path="/register" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Register />
              </motion.div>
            } />
            
            {/* 主应用路由 - 统一使用ProtectedRoute包裹 */}
            <Route path="/*" element={
              <ProtectedRoute>
                <MobileLayout>
                  <div className="flex-1 overflow-hidden pb-20">
                    <Routes>
                      <Route path="/" element={
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Home />
                        </motion.div>
                      } />
                      <Route path="/create" element={
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Create />
                        </motion.div>
                      } />
                      <Route path="/history" element={
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <History />
                        </motion.div>
                      } />
                      <Route path="/templates" element={
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Templates />
                        </motion.div>
                      } />
                      <Route path="/profile" element={
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Profile />
                        </motion.div>
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