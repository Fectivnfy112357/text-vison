/// <reference types="vite/client" />

// 移动端环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_MOBILE_PORT: string
  readonly VITE_ENABLE_PWA: string
  readonly VITE_PWA_NAME: string
  readonly VITE_PWA_SHORT_NAME: string
  readonly VITE_PWA_THEME_COLOR: string
  readonly VITE_ENABLE_VCONSOLE: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_ENABLE_HTTPS: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_ENABLE_HAPTIC_FEEDBACK: string
  readonly VITE_ENABLE_DEVICE_ORIENTATION: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_SUPPORTED_IMAGE_FORMATS: string
  readonly VITE_SUPPORTED_VIDEO_FORMATS: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_SOURCE_MAP: string
  readonly VITE_ENABLE_HOT_RELOAD: string
  readonly VITE_PWA_CACHE_STRATEGY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 移动端全局变量类型定义
declare const __DEV__: boolean
declare const __MOBILE__: boolean

// 移动端特有的Web API类型扩展
interface Navigator {
  // 设备振动API
  vibrate?: (pattern: number | number[]) => boolean
  // 设备方向API
  deviceMemory?: number
  // 网络信息API
  connection?: {
    effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
    downlink: number
    rtt: number
    saveData: boolean
  }
}

// 触摸事件类型扩展
interface TouchEvent {
  readonly touches: TouchList
  readonly targetTouches: TouchList
  readonly changedTouches: TouchList
}

// PWA相关类型
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

// 移动端特有的CSS属性
declare module 'react' {
  interface CSSProperties {
    WebkitTapHighlightColor?: string
    WebkitTouchCallout?: string
    WebkitUserSelect?: string
    touchAction?: string
  }
}