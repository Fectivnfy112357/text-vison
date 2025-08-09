import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Image, Video, Play } from 'lucide-react'

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
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 清理URL，移除可能存在的反引号
  const cleanUrl = React.useMemo(() => {
    if (!url) return ''
    let cleaned = url.trim()
    // 移除首尾的反引号
    if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim()
    }
    return cleaned
  }, [url])

  // 使用Intersection Observer实现懒加载
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
        }
      },
      {
        root: null,
        rootMargin: '50px', // 提前50px加载
        threshold: 0.1
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [])

  const handleImageError = () => {
    setHasError(true)
    onError?.()
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video load error:', e)
    console.error('Original URL:', url)
    console.error('Cleaned URL:', cleanUrl)
    setHasError(true)
    onError?.()
  }

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setImageLoaded(true)
  }, [])

  const handleVideoLoadedData = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  if (type === 'image') {
    return (
      <div ref={containerRef} className="relative w-full h-full">
        {/* 占位符 */}
        {(!isInView || isLoading) && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* 渐进式图片加载 */}
        {isInView && (
          <>
            {/* 低质量占位图 */}
            {!imageLoaded && !hasError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 filter blur-sm scale-110" />
            )}
            
            <img 
              src={cleanUrl}
              alt={alt}
              className={`${className} ${hasError ? 'hidden' : ''} transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              decoding="async"
              style={{
                willChange: 'opacity'
              }}
            />
          </>
        )}
        
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-red-200/50">
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
        )}
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div ref={containerRef} className="relative w-full h-full group">
        {(!isInView || isLoading) && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {isInView && (
          <video 
            ref={videoRef}
            src={cleanUrl}
            className={`${className} ${hasError ? 'hidden' : ''} transition-opacity duration-300 ${
              !isLoading ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleVideoError}
            onLoadedData={handleVideoLoadedData}
            preload="metadata"
            playsInline
            webkit-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-playsinline="true"
            style={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              willChange: 'opacity'
            }}
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            crossOrigin="anonymous"
          >
            您的浏览器不支持视频播放
          </video>
        )}
        
        {/* 视频播放按钮（仅在移动端且未播放时显示） */}
        {!hasError && !isLoading && (
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 md:hidden"
            style={{ display: videoRef.current?.paused ? 'flex' : 'none' }}
          >
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Play size={32} className="text-primary-600 ml-1" />
            </div>
          </button>
        )}
        
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-red-200/50">
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
        )}
      </div>
    )
  }

  return null
}

export default MediaWithFallback