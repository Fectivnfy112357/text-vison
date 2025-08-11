import React, { memo, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Image, 
  Video, 
  Download, 
  Share2, 
  Trash2, 
  Calendar,
  Clock
} from 'lucide-react'
import { GenerationContent } from '../lib/api'
import MediaWithFallback from './MediaWithFallback'

interface HistoryItemProps {
  item: GenerationContent
  index: number
  isSelected: boolean
  onDownload: (item: GenerationContent) => void
  onShare: (item: GenerationContent) => void
  onDelete: (id: string) => void
}

const HistoryItem: React.FC<HistoryItemProps> = memo(({
  item,
  index,
  isSelected,
  onDownload,
  onShare,
  onDelete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用Intersection Observer实现懒加载和自动播放
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && item.type === 'video' && videoRef.current) {
          // 视频进入视图时尝试播放
          videoRef.current.play().catch(() => {
            // 自动播放失败，静音后再试
            if (videoRef.current) {
              videoRef.current.muted = true
              videoRef.current.play().catch(console.error)
            }
          })
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.5
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [item.type])
  // 格式化时间函数
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }, [])

  
  // 处理下载
  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload(item)
  }, [item, onDownload])

  // 处理分享
  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onShare(item)
  }, [item, onShare])

  // 处理删除
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(item.id)
  }, [item.id, onDelete])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: Math.min(index * 0.02, 0.3),
        duration: 0.2 
      }}
      className={`card-soft overflow-hidden ${
        isSelected ? 'ring-2 ring-primary-300' : ''
      }`}
    >
      {/* 主要内容区域 */}
      <div>
        {/* 大图展示 */}
        <div ref={containerRef} className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {(item.thumbnail || item.url) ? (
            item.type === 'video' ? (
              <div className="relative w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50">
              <video
                ref={videoRef}
                src={item.url || ''}
                className="absolute inset-0 w-full h-full object-cover"
                preload="auto"
                playsInline
                webkit-playsinline="true"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
                x5-playsinline="true"
                muted
                loop
                autoPlay
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                poster={item.url || undefined}
              >
                <source src={item.url || ''} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>
            ) : (
              <MediaWithFallback
                url={item.thumbnail || item.url || ''}
                type={item.type}
                alt="Generated content"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                {item.type === 'image' ? (
                  <Image className="text-gray-400 mb-2" size={32} />
                ) : (
                  <Video className="text-gray-400 mb-2" size={32} />
                )}
                <div className="text-sm text-gray-500">{item.type === 'image' ? '图片' : '视频'}模板</div>
              </div>
            </div>
          )}
          
          {/* 状态标签 */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              item.type === 'image' 
                ? 'bg-primary-100/80 text-primary-700 border border-primary-200/50'
                : 'bg-secondary-100/80 text-secondary-700 border border-secondary-200/50'
            }`}>
              {item.type === 'image' ? (
                <><Image size={12} className="mr-1" />图片</>
              ) : (
                <><Video size={12} className="mr-1" />视频</>
              )}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              item.status === 'completed' 
                ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
                : item.status === 'processing'
                ? 'bg-amber-100/80 text-amber-700 border border-amber-200/50'
                : 'bg-rose-100/80 text-rose-700 border border-rose-200/50'
            }`}>
              {item.status === 'completed' ? '已完成' :
               item.status === 'processing' ? '处理中' : '失败'}
            </span>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-5">
          <div className="space-y-3">
            {/* 提示词 - 多行展示 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">提示词</h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-800 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                  {item.prompt}
                </p>
              </div>
            </div>

            {/* 元数据 */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{formatTime(item.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{new Date(item.createdAt).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>

            {/* 快速操作按钮（移动端可见） */}
            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
              {item.url && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Download size={12} />
                    <span>下载</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-secondary-50 text-secondary-600 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <Share2 size={12} />
                    <span>分享</span>
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Trash2 size={12} />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

HistoryItem.displayName = 'HistoryItem'

export default HistoryItem