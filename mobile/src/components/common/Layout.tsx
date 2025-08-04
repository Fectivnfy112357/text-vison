import React from 'react'
import { useLocation } from 'react-router-dom'
import TabBar from './TabBar'

interface LayoutProps {
  children: any
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  
  // 不显示底部导航栏的页面
  const hideTabBarPages = ['/login', '/register', '/home']
  const showTabBar = !hideTabBarPages.includes(location.pathname)

  return (
    <div className="mobile-container">
      <main className={`mobile-page ${showTabBar ? 'pb-20' : ''}`}>
        {children}
      </main>
      {showTabBar && <TabBar />}
    </div>
  )
}

export default Layout