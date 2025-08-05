import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Sparkles, History, Grid3X3, User } from 'lucide-react'
import { clsx } from 'clsx'

interface NavItem {
  path: string
  icon: React.ComponentType<any>
  label: string
}

const navItems: NavItem[] = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/create', icon: Sparkles, label: '创作' },
  { path: '/history', icon: History, label: '历史' },
  { path: '/templates', icon: Grid3X3, label: '模板' },
  { path: '/profile', icon: User, label: '我的' },
]

const BottomNavigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <motion.div 
      className="safe-area-bottom bg-white/80 backdrop-blur-md border-t border-white/60 px-2 py-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={clsx(
                'relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200',
                'min-w-[60px] min-h-[60px] touch-manipulation',
                isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-500 hover:text-primary-500'
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {/* 活跃状态背景 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-100/80 to-secondary-100/80 rounded-xl"
                  layoutId="activeTab"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
              
              {/* 图标 */}
              <motion.div
                className="relative z-10 mb-1"
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon 
                  size={20} 
                  className={clsx(
                    'transition-colors duration-200',
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  )}
                />
              </motion.div>
              
              {/* 标签 */}
              <span 
                className={clsx(
                  'relative z-10 text-xs font-medium transition-colors duration-200',
                  isActive ? 'text-primary-600' : 'text-gray-500'
                )}
              >
                {item.label}
              </span>
              
              {/* 活跃指示器 */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default BottomNavigation