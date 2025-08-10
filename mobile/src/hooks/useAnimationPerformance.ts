import { useState, useEffect } from 'react'

/**
 * 用于检测和优化动画性能的 Hook
 * @returns 是否应该减少动画
 */
export const useAnimationPerformance = () => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [lowPerformance, setLowPerformance] = useState(false)

  useEffect(() => {
    // 检测用户是否减少了动画偏好
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    // 检测设备性能
    const checkPerformance = () => {
      // 简单的性能检测：检查硬件并发数和内存
      const isLowEndDevice = 
        (navigator as any).hardwareConcurrency <= 4 || 
        (navigator as any).deviceMemory <= 2 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      setLowPerformance(isLowEndDevice)
    }

    // 初始检测
    checkPerformance()
    
    // 监听媒体查询变化
    mediaQuery.addEventListener('change', handleMotionChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // 如果用户偏好减少动画或设备性能较低，都应该减少动画
  const shouldReduceMotion = reducedMotion || lowPerformance

  return {
    reducedMotion: shouldReduceMotion,
    // 优化的动画配置
    animationConfig: shouldReduceMotion ? {
      duration: 0,
      delay: 0
    } : {
      duration: 0.15,
      delay: 0
    },
    // 优化的过渡配置
    transitionConfig: shouldReduceMotion ? {
      type: "tween" as const,
      duration: 0,
      ease: "easeOut" as const
    } : {
      type: "tween" as const,
      duration: 0.15,
      ease: "easeOut" as const
    }
  }
}