
import * as React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'react-vant'

// 页面组件
import Home from './pages/Home'
import Generate from './pages/Generate'
import Templates from './pages/Templates'
import History from './pages/History'
import Profile from './pages/Profile'

// 布局组件
import Layout from './components/common/Layout'

// 全局错误边界
import ErrorBoundary from './components/common/ErrorBoundary'

// 状态管理
import { useUserStore, useMobileStore } from './store'
import { getDeviceInfo, getNetworkStatus } from './utils'

const App = () => {
  const { checkAuth } = useUserStore()
  const { setDeviceInfo, setNetworkStatus } = useMobileStore()

  // 应用初始化
  // @ts-ignore
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // 检查用户认证状态
        await checkAuth()
        
        // 设置设备信息
        const deviceInfo = getDeviceInfo()
        setDeviceInfo(deviceInfo)
        
        // 设置网络状态
        const networkStatus = getNetworkStatus()
        setNetworkStatus(networkStatus)
        
        // 监听网络状态变化
        const handleOnline = () => setNetworkStatus({ ...getNetworkStatus(), isOnline: true })
        const handleOffline = () => setNetworkStatus({ ...getNetworkStatus(), isOnline: false })
        
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        
        // 监听网络连接类型变化
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        if (connection) {
          const handleConnectionChange = () => {
            setNetworkStatus(getNetworkStatus())
          }
          connection.addEventListener('change', handleConnectionChange)
          
          return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            connection.removeEventListener('change', handleConnectionChange)
          }
        }
        
        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
        }
      } catch (error) {
        console.error('应用初始化失败:', error)
      }
    }

    initializeApp()
  }, [checkAuth, setDeviceInfo, setNetworkStatus])

  return (
    <ErrorBoundary>
      <ConfigProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App