import { useRef, useEffect, useCallback, useState } from 'react'

// 手势类型定义
interface GestureHandlers {
  onSwipeLeft?: (velocity?: number) => void
  onSwipeRight?: (velocity?: number) => void
  onSwipeUp?: (velocity?: number) => void
  onSwipeDown?: (velocity?: number) => void
  onPinchIn?: (scale?: number) => void
  onPinchOut?: (scale?: number) => void
  onTap?: (position?: { x: number; y: number }) => void
  onLongPress?: (position?: { x: number; y: number }) => void
  onDoubleTap?: (position?: { x: number; y: number }) => void
  onRotate?: (angle?: number) => void
  onPan?: (delta?: { x: number; y: number }) => void
  onPanStart?: (position?: { x: number; y: number }) => void
  onPanEnd?: (velocity?: { x: number; y: number }) => void
}

interface GestureOptions {
  swipeThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  pinchThreshold?: number
  rotateThreshold?: number
  panThreshold?: number
  enableHapticFeedback?: boolean
  preventDefault?: boolean
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export const useGestures = (
  handlers: GestureHandlers,
  options: GestureOptions = {}
) => {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 0.1,
    rotateThreshold = 15,
    panThreshold = 10,
    enableHapticFeedback = true,
    preventDefault = true
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<TouchPoint | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastTapRef = useRef<number>(0)
  const initialDistanceRef = useRef<number>(0)
  const initialAngleRef = useRef<number>(0)
  const isPanningRef = useRef<boolean>(false)
  const lastPanPositionRef = useRef<{ x: number; y: number } | null>(null)
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastMoveTimeRef = useRef<number>(0)

  const [isGesturing, setIsGesturing] = useState(false)

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const getAngle = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }, [])

  const getCenter = useCallback((touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }, [])

  const calculateVelocity = useCallback((currentPos: { x: number; y: number }, time: number) => {
    if (!lastPanPositionRef.current || !lastMoveTimeRef.current) {
      return { x: 0, y: 0 }
    }

    const deltaTime = time - lastMoveTimeRef.current
    if (deltaTime === 0) return velocityRef.current

    const deltaX = currentPos.x - lastPanPositionRef.current.x
    const deltaY = currentPos.y - lastPanPositionRef.current.y

    velocityRef.current = {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime
    }

    return velocityRef.current
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    const now = Date.now()
    setIsGesturing(true)

    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now
      }

      lastPanPositionRef.current = { x: touch.clientX, y: touch.clientY }
      lastMoveTimeRef.current = now
      isPanningRef.current = false

      // 设置长按定时器
      if (handlers.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          handlers.onLongPress!({ x: touch.clientX, y: touch.clientY })
        }, longPressDelay)
      }
    } else if (e.touches.length === 2) {
      // 双指操作
      clearLongPressTimer()
      isPanningRef.current = false
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1])
      initialAngleRef.current = getAngle(e.touches[0], e.touches[1])
    }
  }, [handlers, longPressDelay, clearLongPressTimer, getDistance, getAngle, preventDefault])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    const now = Date.now()

    if (e.touches.length === 2) {
      // 处理缩放和旋转手势
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const currentAngle = getAngle(e.touches[0], e.touches[1])
      
      // 缩放检测
      const distanceChange = currentDistance - initialDistanceRef.current
      const scaleRatio = currentDistance / initialDistanceRef.current
      
      if (Math.abs(distanceChange) > pinchThreshold * initialDistanceRef.current) {
        if (distanceChange > 0 && handlers.onPinchOut) {
          handlers.onPinchOut(scaleRatio)
        } else if (distanceChange < 0 && handlers.onPinchIn) {
          handlers.onPinchIn(scaleRatio)
        }
      }

      // 旋转检测
      const angleDiff = currentAngle - initialAngleRef.current
      if (Math.abs(angleDiff) > rotateThreshold && handlers.onRotate) {
        handlers.onRotate(angleDiff)
      }
    } else if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // 检测拖拽开始
      if (!isPanningRef.current && distance > panThreshold) {
        isPanningRef.current = true
        clearLongPressTimer()
        if (handlers.onPanStart) {
          handlers.onPanStart({ x: touch.clientX, y: touch.clientY })
        }
      }

      // 处理拖拽
      if (isPanningRef.current && handlers.onPan) {
        calculateVelocity({ x: touch.clientX, y: touch.clientY }, now)
        handlers.onPan({ x: deltaX, y: deltaY })
        lastPanPositionRef.current = { x: touch.clientX, y: touch.clientY }
        lastMoveTimeRef.current = now
      } else {
        // 清除长按定时器（因为手指移动了）
        clearLongPressTimer()
      }
    }
  }, [handlers, pinchThreshold, rotateThreshold, panThreshold, clearLongPressTimer, getDistance, getAngle, calculateVelocity, preventDefault])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }

    clearLongPressTimer()
    setIsGesturing(false)

    if (!touchStartRef.current || e.touches.length > 0) {
      if (isPanningRef.current && handlers.onPanEnd) {
        handlers.onPanEnd(velocityRef.current)
      }
      isPanningRef.current = false
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime

    // 处理拖拽结束
    if (isPanningRef.current) {
      if (handlers.onPanEnd) {
        handlers.onPanEnd(velocityRef.current)
      }
      isPanningRef.current = false
      touchStartRef.current = null
      return
    }

    // 检查是否为点击（短时间且移动距离小）
    if (distance < 10 && deltaTime < 200) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTapRef.current

      if (timeSinceLastTap < doubleTapDelay && handlers.onDoubleTap) {
        handlers.onDoubleTap({ x: touch.clientX, y: touch.clientY })
        lastTapRef.current = 0 // 重置以避免三击
      } else {
        lastTapRef.current = now
        // 延迟执行单击，以便检测双击
        setTimeout(() => {
          if (lastTapRef.current === now && handlers.onTap) {
            handlers.onTap({ x: touch.clientX, y: touch.clientY })
          }
        }, doubleTapDelay)
      }
    }
    // 检查滑动手势
    else if (distance > swipeThreshold) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > absY) {
        // 水平滑动
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight(velocity)
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft(velocity)
        }
      } else {
        // 垂直滑动
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown(velocity)
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp(velocity)
        }
      }
    }

    touchStartRef.current = null
  }, [handlers, swipeThreshold, doubleTapDelay, clearLongPressTimer, preventDefault])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      clearLongPressTimer()
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer, preventDefault])

  return {
    ref: elementRef,
    isGesturing
  }
}

// 简化的手势 Hook
export const useSwipeGesture = (
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
  threshold: number = 50
) => {
  return useGestures({
    onSwipeLeft: () => onSwipe('left'),
    onSwipeRight: () => onSwipe('right'),
    onSwipeUp: () => onSwipe('up'),
    onSwipeDown: () => onSwipe('down')
  }, { swipeThreshold: threshold })
}

// 拖拽手势 Hook
export const useDragGesture = (
  onDrag: (delta: { x: number; y: number }) => void,
  onDragStart?: () => void,
  onDragEnd?: (velocity: { x: number; y: number }) => void
) => {
  return useGestures({
    onPan: onDrag,
    onPanStart: onDragStart,
    onPanEnd: onDragEnd
  })
}

// 缩放手势 Hook
export const usePinchGesture = (
  onPinch: (scale: number, type: 'in' | 'out') => void,
  threshold: number = 0.1
) => {
  return useGestures({
    onPinchIn: (scale) => onPinch(scale || 1, 'in'),
    onPinchOut: (scale) => onPinch(scale || 1, 'out')
  }, { pinchThreshold: threshold })
}

// 触觉反馈hook
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern?: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern || 10)
    }
  }, [])

  const lightImpact = useCallback(() => {
    vibrate(10)
  }, [vibrate])

  const mediumImpact = useCallback(() => {
    vibrate(20)
  }, [vibrate])

  const heavyImpact = useCallback(() => {
    vibrate([30, 10, 30])
  }, [vibrate])

  const selectionChanged = useCallback(() => {
    vibrate(5)
  }, [vibrate])

  const notificationSuccess = useCallback(() => {
    vibrate([10, 50, 10])
  }, [vibrate])

  const notificationWarning = useCallback(() => {
    vibrate([20, 100, 20])
  }, [vibrate])

  const notificationError = useCallback(() => {
    vibrate([50, 50, 50, 50, 50])
  }, [vibrate])

  return {
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionChanged,
    notificationSuccess,
    notificationWarning,
    notificationError
  }
}