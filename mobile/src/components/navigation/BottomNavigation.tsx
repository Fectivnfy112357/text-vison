import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Sparkles, History, Grid3X3, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useAnimationPerformance } from '../../hooks/useAnimationPerformance'

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
  const { reducedMotion, animationConfig, transitionConfig } = useAnimationPerformance()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom bg-white/80 backdrop-blur-md border-t border-white/60 px-2 py-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: animationConfig.duration,
        delay: animationConfig.delay
      }}
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
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            >
              {/* 活跃状态背景 */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/80 to-secondary-100/80 rounded-xl" />
              )}
              
              {/* 图标 */}
              {reducedMotion ? (
                <div className="relative z-10 mb-1">
                  <Icon 
                    size={20} 
                    className={clsx(
                      'transition-colors duration-200',
                      isActive ? 'text-primary-600' : 'text-gray-500'
                    )}
                  />
                </div>
              ) : (
                <motion.div
                  className="relative z-10 mb-1"
                  animate={{
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={transitionConfig}
                >
                  <Icon 
                    size={20} 
                    className={clsx(
                      'transition-colors duration-200',
                      isActive ? 'text-primary-600' : 'text-gray-500'
                    )}
                  />
                </motion.div>
              )}
              
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
              {isActive && !reducedMotion && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={transitionConfig}
                />
              )}
              {isActive && reducedMotion && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default BottomNavigation