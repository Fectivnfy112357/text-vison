import React from 'react'
import { Tabbar, TabbarItem } from 'react-vant'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMobileStore } from '../../store'

const TabBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTab, setActiveTab } = useMobileStore()

  // 定义底部导航栏的配置
  const tabs = [
    {
      key: 'home',
      title: '首页',
      icon: 'home-o',
      path: '/home'
    },
    {
      key: 'generate',
      title: '生成',
      icon: 'photo-o',
      path: '/generate'
    },
    {
      key: 'templates',
      title: '模板',
      icon: 'apps-o',
      path: '/templates'
    },
    {
      key: 'history',
      title: '历史',
      icon: 'clock-o',
      path: '/history'
    },
    {
      key: 'profile',
      title: '我的',
      icon: 'user-o',
      path: '/profile'
    }
  ]

  // 根据当前路径确定激活的标签
  const getCurrentTab = () => {
    const currentPath = location.pathname
    const currentTab = tabs.find(tab => tab.path === currentPath)
    return currentTab ? currentTab.key : 'home'
  }

  // 处理标签切换
  const handleTabChange = (tabKey: string) => {
    const tab = tabs.find(t => t.key === tabKey)
    if (tab) {
      setActiveTab(tabKey)
      navigate(tab.path)
    }
  }

  // 确保当前激活的标签与路径同步
  // @ts-ignore
  React.useEffect(() => {
    const currentTab = getCurrentTab()
    if (currentTab !== activeTab) {
      setActiveTab(currentTab)
    }
  }, [location.pathname, activeTab, setActiveTab])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <Tabbar 
        value={activeTab} 
        onChange={handleTabChange}
        className="mobile-tabbar"
        activeColor="#3B82F6"
        inactiveColor="#6B7280"
      >
        {tabs.map(tab => (
          <TabbarItem 
            key={tab.key} 
            name={tab.key} 
            icon={tab.icon}
            className="mobile-tabbar-item"
          >
            {tab.title}
          </TabbarItem>
        ))}
      </Tabbar>
    </div>
  )
}

export default TabBar