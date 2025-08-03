/**
 * 移动端分享工具函数
 */

// 分享类型
export type ShareType = 'image' | 'video' | 'text' | 'url'

// 分享数据接口
export interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

// 分享选项
export interface ShareOptions {
  type: ShareType
  data: ShareData
  platform?: string // 指定分享平台
}

// 分享统计数据
export interface ShareStats {
  contentId: string
  contentType: 'image' | 'video'
  platform: string
  timestamp: number
  userId?: string
}

/**
 * 检查是否支持原生分享
 */
export const isNativeShareSupported = (): boolean => {
  return 'navigator' in window && 'share' in navigator
}

/**
 * 检查是否支持Web Share API Level 2 (文件分享)
 */
export const isFileShareSupported = (): boolean => {
  return isNativeShareSupported() && 'canShare' in navigator
}

/**
 * 原生分享功能
 */
export const nativeShare = async (options: ShareOptions): Promise<boolean> => {
  if (!isNativeShareSupported()) {
    throw new Error('Native share not supported')
  }

  try {
    const shareData: any = {
      title: options.data.title || '文生视界 - AI创作分享',
      text: options.data.text || '来看看我用AI创作的作品！',
      url: options.data.url
    }

    // 如果支持文件分享且有文件
    if (options.data.files && options.data.files.length > 0 && isFileShareSupported()) {
      shareData.files = options.data.files
      
      // 检查是否可以分享这些文件
      if (navigator.canShare && !navigator.canShare(shareData)) {
        throw new Error('Cannot share these files')
      }
    }

    await navigator.share(shareData)
    
    // 记录分享统计
    await recordShareStats({
      contentId: options.data.url || 'unknown',
      contentType: options.type === 'video' ? 'video' : 'image',
      platform: 'native',
      timestamp: Date.now()
    })
    
    return true
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // 用户取消分享
      return false
    }
    throw error
  }
}

/**
 * 保存图片到相册
 */
export const saveImageToAlbum = async (imageUrl: string, filename?: string): Promise<boolean> => {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename || `textvision_${Date.now()}.png`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Save image failed:', error)
    return false
  }
}

/**
 * 保存视频到相册
 */
export const saveVideoToAlbum = async (videoUrl: string, filename?: string): Promise<boolean> => {
  try {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = filename || `textvision_${Date.now()}.mp4`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Save video failed:', error)
    return false
  }
}

/**
 * 将图片URL转换为File对象
 */
export const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: mimeType })
}

/**
 * 复制内容到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    return true
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

/**
 * 生成分享链接
 */
export const generateShareUrl = (contentId: string, contentType: 'image' | 'video'): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${contentType}/${contentId}`
}

/**
 * 生成分享文案
 */
export const generateShareText = (contentType: 'image' | 'video', prompt?: string): string => {
  const typeText = contentType === 'video' ? '视频' : '图片'
  const baseText = `我用文生视界AI创作了这个${typeText}！`
  
  if (prompt) {
    return `${baseText}\n\n创作提示词：${prompt}\n\n快来试试吧！`
  }
  
  return `${baseText}\n\n快来试试AI创作吧！`
}

/**
 * 记录分享统计
 */
export const recordShareStats = async (stats: ShareStats): Promise<void> => {
  try {
    // 这里应该调用API记录分享统计
    // await api.post('/share/stats', stats)
    console.log('Share stats recorded:', stats)
    
    // 暂时存储到本地
    const existingStats = JSON.parse(localStorage.getItem('shareStats') || '[]')
    existingStats.push(stats)
    localStorage.setItem('shareStats', JSON.stringify(existingStats))
  } catch (error) {
    console.error('Record share stats failed:', error)
  }
}

/**
 * 获取分享统计数据
 */
export const getShareStats = (): ShareStats[] => {
  try {
    return JSON.parse(localStorage.getItem('shareStats') || '[]')
  } catch (error) {
    console.error('Get share stats failed:', error)
    return []
  }
}

/**
 * 社交平台分享URL生成器
 */
export const getSocialShareUrl = (platform: string, shareData: ShareData): string => {
  const encodedTitle = encodeURIComponent(shareData.title || '')
  const encodedText = encodeURIComponent(shareData.text || '')
  const encodedUrl = encodeURIComponent(shareData.url || '')
  
  switch (platform.toLowerCase()) {
    case 'wechat':
      // 微信分享需要特殊处理，这里返回一个通用链接
      return shareData.url || ''
    
    case 'weibo':
      return `https://service.weibo.com/share/share.php?title=${encodedText}&url=${encodedUrl}`
    
    case 'qq':
      return `https://connect.qq.com/widget/shareqq/index.html?title=${encodedTitle}&summary=${encodedText}&url=${encodedUrl}`
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
    
    default:
      return shareData.url || ''
  }
}

/**
 * 检测用户设备和浏览器
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent
  
  return {
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isWeChat: /MicroMessenger/.test(userAgent),
    isQQ: /QQ/.test(userAgent),
    isWeibo: /Weibo/.test(userAgent)
  }
}

/**
 * 根据设备和环境选择最佳分享方式
 */
export const getBestShareMethod = (contentType: ShareType): 'native' | 'social' | 'copy' => {
  const deviceInfo = getDeviceInfo()
  
  // 在微信中优先使用社交分享
  if (deviceInfo.isWeChat) {
    return 'social'
  }
  
  // 支持原生分享的优先使用原生分享
  if (isNativeShareSupported()) {
    return 'native'
  }
  
  // 降级到复制链接
  return 'copy'
}