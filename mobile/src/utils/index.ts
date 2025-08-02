import type { DeviceInfo } from '../types'

// 获取设备信息
export const getDeviceInfo = (): DeviceInfo => {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    platform: navigator.platform,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  }
}

// 检测是否为移动设备
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 检测是否为iOS设备
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// 检测是否为Android设备
export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent)
}

// 检测是否在微信内置浏览器中
export const isWeChat = (): boolean => {
  return /MicroMessenger/i.test(navigator.userAgent)
}

// 检测是否支持PWA
export const isPWASupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
export const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else {
    return new Date(timestamp).toLocaleDateString()
  }
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, wait)
    }
  }
}

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 下载文件
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 分享内容（使用Web Share API）
export const shareContent = async (data: {
  title?: string
  text?: string
  url?: string
  files?: File[]
}): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(data)
      return true
    } else {
      // 降级方案：复制链接到剪贴板
      if (data.url) {
        await copyToClipboard(data.url)
        return true
      }
      return false
    }
  } catch (error) {
    console.error('分享失败:', error)
    return false
  }
}

// 获取网络状态
export const getNetworkStatus = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  
  return {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  }
}

// 添加到主屏幕提示
export const promptInstallPWA = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let deferredPrompt: any = null
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
    })
    
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        resolve(choiceResult.outcome === 'accepted')
        deferredPrompt = null
      })
    } else {
      resolve(false)
    }
  })
}

// 触觉反馈
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
  if ('vibrate' in navigator && navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    }
    navigator.vibrate(patterns[type])
  }
}
// 格式化生成内容数据
export const formatGeneratedContent = (item: any) => {
  return {
    id: item.id ? item.id.toString() : 'unknown',
    type: item.type || 'image',
    prompt: item.prompt || '',
    url: item.url || item.imageUrl || item.videoUrl || '',
    thumbnail: item.thumbnail || item.thumbnailUrl || item.url || item.imageUrl,
    urls: item.urls || (item.url ? [item.url] : []),
    thumbnails: item.thumbnails || (item.thumbnail ? [item.thumbnail] : []),
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    size: item.size || 'landscape_16_9',
    style: item.style || '默认风格',
    referenceImage: item.referenceImage,
    status: item.status || 'completed'
  }
}

// 格式化模板数据
export const formatTemplate = (item: any) => {
  return {
    id: item.id ? item.id.toString() : 'unknown',
    title: item.title || '未命名模板',
    description: item.description || '暂无描述',
    prompt: item.prompt || '',
    categoryId: item.categoryId || item.category || '其他',
    tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').filter(Boolean)) : [],
    imageUrl: item.imageUrl || item.preview || '/placeholder-template.png',
    preview: item.preview || item.imageUrl || '/placeholder-template.png',
    type: item.type || 'image',
    style: item.style || '默认风格',
    size: item.size || 'landscape_16_9',
    views: item.usageCount || item.views || 0,
    isPopular: item.isPopular || false
  }
}

// 格式化艺术风格数据
export const formatArtStyle = (item: any) => {
  return {
    id: item.id,
    name: item.name || '未命名风格',
    description: item.description || '暂无描述',
    applicableType: item.applicableType || 'both',
    sortOrder: item.sortOrder || 0,
    status: item.status || 1,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  }
}

// 格式化分类数据
export const formatCategory = (item: any) => {
  return {
    id: item.id,
    name: item.name || '未命名分类',
    description: item.description,
    icon: item.icon,
    sortOrder: item.sortOrder || 0,
    status: item.status || 1
  }
}