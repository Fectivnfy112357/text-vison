// 触觉反馈类型
export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

// 检查设备是否支持触觉反馈
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator || 'hapticFeedback' in navigator
}

// 触觉反馈模式映射
const hapticPatterns: Record<HapticFeedbackType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [50, 100, 50, 100, 50],
  selection: 5
}

// 触发触觉反馈
export const triggerHapticFeedback = (type: HapticFeedbackType = 'light'): void => {
  if (!isHapticSupported()) {
    console.warn('Haptic feedback is not supported on this device')
    return
  }

  try {
    const pattern = hapticPatterns[type]
    
    // 使用 Vibration API
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
      return
    }

    // 尝试使用 Web Haptics API (实验性)
    if ('hapticFeedback' in navigator) {
      const hapticAPI = (navigator as any).hapticFeedback
      
      switch (type) {
        case 'light':
          hapticAPI?.impact?.({ intensity: 'light' })
          break
        case 'medium':
          hapticAPI?.impact?.({ intensity: 'medium' })
          break
        case 'heavy':
          hapticAPI?.impact?.({ intensity: 'heavy' })
          break
        case 'success':
          hapticAPI?.notification?.({ type: 'success' })
          break
        case 'warning':
          hapticAPI?.notification?.({ type: 'warning' })
          break
        case 'error':
          hapticAPI?.notification?.({ type: 'error' })
          break
        case 'selection':
          hapticAPI?.selection?.()
          break
        default:
          hapticAPI?.impact?.({ intensity: 'light' })
      }
    }
  } catch (error) {
    console.warn('Failed to trigger haptic feedback:', error)
  }
}

// 触觉反馈工具类
export class HapticManager {
  private static instance: HapticManager
  private isEnabled: boolean = true
  private lastFeedbackTime: number = 0
  private readonly minInterval: number = 50 // 最小间隔时间（毫秒）

  private constructor() {
    // 从本地存储读取用户偏好
    const stored = localStorage.getItem('haptic-enabled')
    this.isEnabled = stored !== null ? JSON.parse(stored) : true
  }

  public static getInstance(): HapticManager {
    if (!HapticManager.instance) {
      HapticManager.instance = new HapticManager()
    }
    return HapticManager.instance
  }

  // 启用/禁用触觉反馈
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    localStorage.setItem('haptic-enabled', JSON.stringify(enabled))
  }

  // 检查是否启用
  public getEnabled(): boolean {
    return this.isEnabled
  }

  // 触发触觉反馈（带防抖）
  public trigger(type: HapticFeedbackType = 'light'): void {
    if (!this.isEnabled) return

    const now = Date.now()
    if (now - this.lastFeedbackTime < this.minInterval) {
      return // 防止过于频繁的触觉反馈
    }

    this.lastFeedbackTime = now
    triggerHapticFeedback(type)
  }

  // 按钮点击反馈
  public buttonTap(): void {
    this.trigger('light')
  }

  // 选择反馈
  public selection(): void {
    this.trigger('selection')
  }

  // 成功反馈
  public success(): void {
    this.trigger('success')
  }

  // 错误反馈
  public error(): void {
    this.trigger('error')
  }

  // 警告反馈
  public warning(): void {
    this.trigger('warning')
  }

  // 长按反馈
  public longPress(): void {
    this.trigger('medium')
  }

  // 滑动反馈
  public swipe(): void {
    this.trigger('light')
  }

  // 刷新反馈
  public refresh(): void {
    this.trigger('medium')
  }
}

// 导出单例实例
export const hapticManager = HapticManager.getInstance()

// React Hook 形式的触觉反馈
export const useHapticFeedback = () => {
  const manager = HapticManager.getInstance()

  return {
    isSupported: isHapticSupported(),
    isEnabled: manager.getEnabled(),
    setEnabled: (enabled: boolean) => manager.setEnabled(enabled),
    trigger: (type: HapticFeedbackType) => manager.trigger(type),
    buttonTap: () => manager.buttonTap(),
    selection: () => manager.selection(),
    success: () => manager.success(),
    error: () => manager.error(),
    warning: () => manager.warning(),
    longPress: () => manager.longPress(),
    swipe: () => manager.swipe(),
    refresh: () => manager.refresh()
  }
}

// 触觉反馈装饰器（用于按钮等组件）
export const withHapticFeedback = <T extends Record<string, any>>(
  Component: any,
  feedbackType: HapticFeedbackType = 'light'
) => {
  return (props: T) => {
    const { trigger } = useHapticFeedback()

    const handleClick = (event: any) => {
      trigger(feedbackType)
      if (props.onClick) {
        props.onClick(event)
      }
    }

    return Component({
      ...props,
      onClick: handleClick
    })
  }
}

// 导出常用的触觉反馈函数
export const hapticFeedback = {
  light: () => triggerHapticFeedback('light'),
  medium: () => triggerHapticFeedback('medium'),
  heavy: () => triggerHapticFeedback('heavy'),
  success: () => triggerHapticFeedback('success'),
  warning: () => triggerHapticFeedback('warning'),
  error: () => triggerHapticFeedback('error'),
  selection: () => triggerHapticFeedback('selection')
}