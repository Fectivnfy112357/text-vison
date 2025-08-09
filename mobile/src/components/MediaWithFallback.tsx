import React from 'react'
import { Image, Video } from 'lucide-react'

interface MediaWithFallbackProps {
  url: string
  type: 'image' | 'video'
  alt?: string
  className?: string
  onError?: () => void
}

const MediaWithFallback: React.FC<MediaWithFallbackProps> = ({ 
  url, 
  type, 
  alt = '媒体内容', 
  className = '',
  onError 
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onError?.()
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
    const fallback = target.nextElementSibling as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    onError?.()
    const target = e.target as HTMLVideoElement
    target.style.display = 'none'
    const fallback = target.nextElementSibling as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }

  if (type === 'image') {
    return (
      <div className="relative w-full h-full">
        <img 
          src={url}
          alt={alt}
          className={className}
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex-col items-center justify-center text-center p-4 border border-red-200/50" style={{display: 'none'}}>
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-2">
            <Image size={24} className="text-red-500" />
          </div>
          <div className="text-sm font-medium text-red-600 mb-1">
            图片加载失败
          </div>
          <div className="text-xs text-red-500">
            链接已过期，无法访问
          </div>
        </div>
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className="relative w-full h-full">
        <video 
          src={url}
          className={className}
          controls
          onError={handleVideoError}
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex-col items-center justify-center text-center p-4 border border-red-200/50" style={{display: 'none'}}>
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-2">
            <Video size={24} className="text-red-500" />
          </div>
          <div className="text-sm font-medium text-red-600 mb-1">
            视频加载失败
          </div>
          <div className="text-xs text-red-500">
            链接已过期，无法访问
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default MediaWithFallback