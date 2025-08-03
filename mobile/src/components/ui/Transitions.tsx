import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'

// 页面切换动画类型
type TransitionType = 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown'

interface PageTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  type?: TransitionType
  duration?: number
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isVisible,
  type = 'slide',
  duration = 300,
  className
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // 延迟添加进入动画类
      setTimeout(() => {
        setAnimationClass(getEnterClass(type))
      }, 10)
    } else {
      setAnimationClass(getExitClass(type))
      // 动画结束后移除元素
      setTimeout(() => {
        setShouldRender(false)
      }, duration)
    }
  }, [isVisible, type, duration])

  const getEnterClass = (type: TransitionType): string => {
    switch (type) {
      case 'slide':
        return 'translate-x-0 opacity-100'
      case 'fade':
        return 'opacity-100'
      case 'scale':
        return 'scale-100 opacity-100'
      case 'slideUp':
        return 'translate-y-0 opacity-100'
      case 'slideDown':
        return 'translate-y-0 opacity-100'
      default:
        return 'translate-x-0 opacity-100'
    }
  }

  const getExitClass = (type: TransitionType): string => {
    switch (type) {
      case 'slide':
        return 'translate-x-full opacity-0'
      case 'fade':
        return 'opacity-0'
      case 'scale':
        return 'scale-95 opacity-0'
      case 'slideUp':
        return '-translate-y-full opacity-0'
      case 'slideDown':
        return 'translate-y-full opacity-0'
      default:
        return 'translate-x-full opacity-0'
    }
  }

  const getInitialClass = (type: TransitionType): string => {
    switch (type) {
      case 'slide':
        return 'translate-x-full opacity-0'
      case 'fade':
        return 'opacity-0'
      case 'scale':
        return 'scale-95 opacity-0'
      case 'slideUp':
        return 'translate-y-full opacity-0'
      case 'slideDown':
        return '-translate-y-full opacity-0'
      default:
        return 'translate-x-full opacity-0'
    }
  }

  if (!shouldRender) return null

  return (
    <div
      className={clsx(
        'transition-all ease-out',
        getInitialClass(type),
        animationClass,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// 弹窗动画组件
interface ModalTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  onClose?: () => void
  className?: string
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  isVisible,
  onClose,
  className
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      setTimeout(() => {
        setAnimationClass('opacity-100')
      }, 10)
    } else {
      setAnimationClass('opacity-0')
      setTimeout(() => {
        setShouldRender(false)
      }, 300)
    }
  }, [isVisible])

  if (!shouldRender) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        'transition-opacity duration-300 ease-out',
        'opacity-0',
        animationClass
      )}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div
        className={clsx(
          'relative bg-white rounded-lg shadow-xl',
          'transform transition-all duration-300 ease-out',
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// 列表项动画组件
interface ListItemTransitionProps {
  children: React.ReactNode
  index: number
  className?: string
}

export const ListItemTransition: React.FC<ListItemTransitionProps> = ({
  children,
  index,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 50) // 错开动画时间

    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className={clsx(
        'transform transition-all duration-500 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

// 滑动切换组件
interface SwipeTransitionProps {
  children: React.ReactNode[]
  currentIndex: number
  onSwipe?: (direction: 'left' | 'right') => void
  className?: string
}

export const SwipeTransition: React.FC<SwipeTransitionProps> = ({
  children,
  currentIndex,
  onSwipe,
  className
}) => {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 50
    if (Math.abs(currentX) > threshold && onSwipe) {
      if (currentX > 0) {
        onSwipe('right')
      } else {
        onSwipe('left')
      }
    }
    
    setCurrentX(0)
    setIsDragging(false)
  }

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? currentX : 0}px))`
        }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

// 展开/收起动画组件
interface CollapseTransitionProps {
  children: React.ReactNode
  isOpen: boolean
  className?: string
}

export const CollapseTransition: React.FC<CollapseTransitionProps> = ({
  children,
  isOpen,
  className
}) => {
  return (
    <div
      className={clsx(
        'overflow-hidden transition-all duration-300 ease-out',
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

// 淡入淡出组件
interface FadeTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  duration?: number
  className?: string
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  isVisible,
  duration = 300,
  className
}) => {
  return (
    <div
      className={clsx(
        'transition-opacity ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// 缩放动画组件
interface ScaleTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  duration?: number
  className?: string
}

export const ScaleTransition: React.FC<ScaleTransitionProps> = ({
  children,
  isVisible,
  duration = 300,
  className
}) => {
  return (
    <div
      className={clsx(
        'transform transition-all ease-out',
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}