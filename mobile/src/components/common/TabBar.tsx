import React from 'react'
import { Tabbar, TabbarItem } from 'react-vant'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMobileStore } from '../../store'
import { Home, Sparkles, BookOpen, Clock, User } from 'lucide-react'

const TabBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeTab, setActiveTab } = useMobileStore()

  // 定义底部导航栏的配置 - 使用Lucide图标，移除我的页面
  const tabs = [
    {
      key: 'generate',
      title: '生成',
      icon: Sparkles,
      path: '/generate',
      gradient: 'from-mist-500 to-mist-300'
    },
    {
      key: 'templates',
      title: '模板',
      icon: BookOpen,
      path: '/templates',
      gradient: 'from-sky-400 to-mist-400'
    },
    {
      key: 'history',
      title: '历史',
      icon: Clock,
      path: '/history',
      gradient: 'from-mist-300 to-sky-300'
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
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-white/80 backdrop-blur-xl border-t border-mist-200/30 rounded-t-3xl shadow-mist">
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map(tab => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.key
            
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 ease-out min-w-[60px] ${
                  isActive 
                    ? 'transform -translate-y-1 scale-105' 
                    : 'hover:scale-105'
                }`}
                style={{
                  animation: isActive ? 'jelly 0.6s ease-in-out' : 'none'
                }}
              >
                <div className={`p-2 rounded-xl mb-1 transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${tab.gradient} shadow-jelly` 
                    : 'bg-cream-100/50'
                }`}>
                  <IconComponent 
                    size={20} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-sm' 
                        : 'text-mist-400'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-mist-600 font-semibold' 
                    : 'text-mist-400'
                }`}>
                  {tab.title}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-mist-400 to-sky-400 rounded-full animate-pulse-soft" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TabBar