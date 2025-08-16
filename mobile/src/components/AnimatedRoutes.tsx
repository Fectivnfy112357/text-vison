import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'

// 页面组件
const Home = lazy(() => import('../pages/Home'))
const Create = lazy(() => import('../pages/Create'))
const History = lazy(() => import('../pages/History'))
const Templates = lazy(() => import('../pages/Templates'))
const Profile = lazy(() => import('../pages/Profile'))
const Help = lazy(() => import('../pages/Help'))
const Notifications = lazy(() => import('../pages/Settings/Notifications'))
const Privacy = lazy(() => import('../pages/Settings/Privacy'))
const Appearance = lazy(() => import('../pages/Settings/Appearance'))

// 页面加载组件
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// 优化的页面动画组件 - 硬件加速版本
const AnimatedPage = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, transform: 'translateZ(0)' }}
    animate={{ opacity: 1, transform: 'translateZ(0)' }}
    exit={{ opacity: 0, transform: 'translateZ(0)' }}
    transition={{ 
      duration: 0.2,
      ease: 'linear'
    }}
    className="h-full animate-performant"
    style={{ 
      willChange: 'opacity, transform',
      backfaceVisibility: 'hidden'
    }}
  >
    {children}
  </motion.div>
)

interface AnimatedRoutesProps {
  location?: any
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = () => {
  const location = useLocation()

  // 路由变化时滚动到顶部
  useEffect(() => {
    // 延迟执行以确保 DOM 更新完成
    const timer = setTimeout(() => {
      // 查找外层滚动容器
      const scrollContainer = document.querySelector('.flex-1.overflow-y-auto') as HTMLElement
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
      }
    }, 100) // 100ms 延迟确保动画和 DOM 更新完成
    
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/mobile/" element={
          <Suspense fallback={<PageLoader />}>
            <AnimatedPage>
              <Home />
            </AnimatedPage>
          </Suspense>
        } />
        <Route path="/mobile/create" element={
          <Suspense fallback={<PageLoader />}>
            <AnimatedPage>
              <Create />
            </AnimatedPage>
          </Suspense>
        } />
        <Route path="/mobile/history" element={
          <Suspense fallback={<PageLoader />}>
            <AnimatedPage>
              <History />
            </AnimatedPage>
          </Suspense>
        } />
        <Route path="/mobile/templates" element={
          <Suspense fallback={<PageLoader />}>
            <AnimatedPage>
              <Templates />
            </AnimatedPage>
          </Suspense>
        } />
        <Route path="/mobile/profile" element={
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
      </Routes>
    </AnimatePresence>
  )
}

export default AnimatedRoutes