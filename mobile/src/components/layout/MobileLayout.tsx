import React from 'react'

interface MobileLayoutProps {
  children: React.ReactNode
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 静态背景装饰 - 性能优化 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none contain-paint">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 rounded-full blur-3xl transform-gpu" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-100/20 to-mist-100/20 rounded-full blur-3xl transform-gpu" />
      </div>
      
      {/* 主内容区域 */}
      <div className="flex-1 relative z-10 safe-area-top">
        {children}
      </div>
    </div>
  )
}

export default MobileLayout