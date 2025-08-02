// @ts-nocheck
import React from 'react'
import { useMobileStore } from '../store'
import { getDeviceInfo, getNetworkStatus } from '../utils'

// 移动端设备信息Hook
export const useDeviceInfo = () => {
  const { deviceInfo, setDeviceInfo } = useMobileStore()
  
  React.useEffect(() => {
    if (!deviceInfo) {
      const info = getDeviceInfo()
      setDeviceInfo(info)
    }
  }, [deviceInfo, setDeviceInfo])
  
  return deviceInfo
}

// 网络状态Hook
export const useNetworkStatus = () => {
  const { networkStatus, setNetworkStatus } = useMobileStore()
  
  React.useEffect(() => {
    const updateNetworkStatus = () => {
      const status = getNetworkStatus()
      setNetworkStatus(status)
    }
    
    // 初始化网络状态
    updateNetworkStatus()
    
    // 监听网络状态变化
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [setNetworkStatus])
  
  return networkStatus
}

// 键盘状态Hook
export const useKeyboard = () => {
  const { isKeyboardVisible, setKeyboardVisible } = useMobileStore()
  
  React.useEffect(() => {
    const handleResize = () => {
      // 检测键盘是否弹出（简单的高度检测）
      const heightDiff = window.screen.height - window.innerHeight
      const isVisible = heightDiff > 150 // 阈值可以调整
      setKeyboardVisible(isVisible)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setKeyboardVisible])
  
  return isKeyboardVisible
}

// 安全区域Hook
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })
  
  React.useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
      })
    }
    
    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    
    return () => {
      window.removeEventListener('resize', updateSafeArea)
    }
  }, [])
  
  return safeArea
}

// 屏幕方向Hook
export const useOrientation = () => {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')
  
  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)
    
    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])
  
  return orientation
}

// PWA安装状态Hook
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    
    const handleAppInstalled = () => {
      setCanInstall(false)
      setDeferredPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setCanInstall(false)
      return outcome === 'accepted'
    }
    return false
  }
  
  return { canInstall, promptInstall }
}

// 触摸手势Hook
export const useTouch = (element: any) => {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null)
  
  React.useEffect(() => {
    const el = element.current
    if (!el) return
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchStart({ x: touch.clientX, y: touch.clientY })
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      setTouchEnd({ x: touch.clientX, y: touch.clientY })
    }
    
    el.addEventListener('touchstart', handleTouchStart)
    el.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [element])
  
  const getSwipeDirection = () => {
    if (!touchStart || !touchEnd) return null
    
    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }
  
  return { touchStart, touchEnd, getSwipeDirection }
}