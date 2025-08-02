import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Play, Pause, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title?: string;
  onDownload?: () => void;
  onShare?: () => void;
  autoPlay?: boolean;
}

export default function MediaPreviewModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  title,
  onDownload,
  onShare,
  autoPlay = false
}: MediaPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);

  // 处理ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleVideoToggle = useCallback(() => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  const handleVideoRef = (ref: HTMLVideoElement | null) => {
    setVideoRef(ref);
    if (ref) {
      ref.addEventListener('play', () => setIsPlaying(true));
      ref.addEventListener('pause', () => setIsPlaying(false));
      ref.addEventListener('ended', () => setIsPlaying(false));
      
      // 视频加载元数据后处理
      ref.addEventListener('loadedmetadata', () => {
        if (autoPlay && mediaType === 'video') {
          // 自动播放视频
          ref.play().catch(error => {
            console.warn('自动播放失败:', error);
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(false);
        }
      });
      
      // 视频加载完成后准备播放
      ref.addEventListener('canplay', () => {
        // 如果设置了自动播放且还没有播放，尝试播放
        if (autoPlay && mediaType === 'video' && !isPlaying) {
          ref.play().catch(error => {
            console.warn('自动播放失败:', error);
          });
        }
      });
    }
  };

  const handleDownloadClick = useCallback(() => {
    if (imageError || videoError) {
      toast.error('下载失败：媒体加载失败');
      return;
    }
    
    if (onDownload) {
      onDownload();
    } else {
      // 默认下载逻辑
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.download = `textvision-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('下载开始');
    }
  }, [onDownload, mediaUrl, mediaType, imageError, videoError]);

  const handleShareClick = useCallback(async () => {
    if (imageError || videoError) {
      toast.error('分享失败：媒体加载失败');
      return;
    }
    
    if (onShare) {
      onShare();
    } else {
      // 默认分享逻辑
      try {
        if (navigator.share) {
          await navigator.share({
            title: title || '文生视界 - 创作分享',
            url: mediaUrl
          });
        } else {
          await navigator.clipboard.writeText(mediaUrl);
          toast.success('链接已复制到剪贴板');
        }
      } catch (error) {
        try {
          await navigator.clipboard.writeText(mediaUrl);
          toast.success('链接已复制到剪贴板');
        } catch (clipboardError) {
          toast.error('分享失败：无法访问剪贴板');
        }
      }
    }
  }, [onShare, title, mediaUrl, imageError, videoError]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, contain: 'layout style', willChange: 'opacity' }}
    >
      <div
        className="relative max-w-7xl max-h-[95vh] sm:max-h-[90vh] w-full bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ contain: 'layout style', willChange: 'transform' }}
      >
          {/* 头部操作栏 */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                {title && (
                  <h3 className="text-white font-medium text-sm sm:text-base lg:text-lg truncate">{title}</h3>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button
                  onClick={handleDownloadClick}
                  disabled={imageError || videoError}
                  className={`bg-white/20 backdrop-blur-sm text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-white/30 transition-colors duration-150 ${
                    (imageError || videoError) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="下载"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleShareClick}
                  disabled={imageError || videoError}
                  className={`bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-colors duration-150 ${
                    (imageError || videoError) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="分享"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 媒体内容 */}
          <div className="relative w-full h-full flex items-center justify-center bg-black" style={{ contain: 'layout' }}>
            {mediaType === 'video' ? (
              <div className="relative w-full h-full">
                {/* 视频加载状态 */}
                {videoLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-white text-sm">视频加载中...</span>
                    </div>
                  </div>
                )}

                {/* 视频加载失败状态 */}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="text-white space-y-2">
                        <h3 className="text-lg font-semibold">视频加载失败</h3>
                        <p className="text-sm text-gray-300 max-w-xs">请检查网络连接或稍后重试</p>
                      </div>
                    </div>
                  </div>
                )}

                <video
                  ref={handleVideoRef}
                  src={mediaUrl}
                  className={`w-full h-full object-contain max-h-[85vh] sm:max-h-[90vh] ${
                    videoError ? 'hidden' : ''
                  }`}
                  onClick={handleVideoToggle}
                  controls={!videoError}
                  preload="metadata"
                  playsInline
                  webkit-playsinline="true"
                  x5-playsinline="true"
                  x5-video-player-type="h5"
                  x5-video-player-fullscreen="true"
                  x-webkit-airplay="allow"
                  muted={false}
                  style={{ willChange: 'transform', contain: 'layout style' }}
                  poster={`${mediaUrl}#t=0.1`}
                  onLoadedMetadata={(e) => {
                    setVideoLoading(false);
                    // 移动端兼容处理
                    const video = e.target as HTMLVideoElement;
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    
                    if (isMobile) {
                      setTimeout(() => {
                        try {
                          video.currentTime = 0.1;
                          video.load();
                        } catch (error) {
                          console.warn('移动端视频时间设置失败:', error);
                        }
                      }, 100);
                    } else {
                      video.currentTime = 0.1;
                    }
                  }}
                  onCanPlay={(e) => {
                    setVideoLoading(false);
                    const video = e.target as HTMLVideoElement;
                    if (video.currentTime === 0) {
                      video.currentTime = 0.1;
                    }
                  }}
                  onLoadStart={() => setVideoLoading(true)}
                  onError={(e) => {
                    setVideoLoading(false);
                    setVideoError(true);
                    toast.error('视频加载失败，请检查网络连接');
                  }}
                />

                {/* 自定义播放控制 - 只在未播放且没有错误时显示 */}
                {!isPlaying && !videoError && !videoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handleVideoToggle}
                      className="bg-white/20 backdrop-blur-sm text-white p-4 sm:p-6 rounded-full hover:bg-white/30 transition-colors duration-150"
                      style={{ willChange: 'transform' }}
                    >
                      <Play className="w-8 h-8 sm:w-12 sm:h-12 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 图片加载状态 */}
                {imageLoading && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-white text-sm">图片加载中...</span>
                    </div>
                  </div>
                )}

                {/* 图片加载失败状态 */}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center space-y-4 text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="text-white space-y-2">
                        <h3 className="text-lg font-semibold">加载失败</h3>
                        <p className="text-sm text-gray-300 max-w-xs">请检查网络连接或稍后重试</p>
                      </div>
                    </div>
                  </div>
                )}

                <img
                  src={mediaUrl}
                  alt={title || '预览图片'}
                  className={`w-full h-full object-contain max-h-[85vh] sm:max-h-[90vh] ${
                    imageError ? 'hidden' : ''
                  }`}
                  style={{ willChange: 'transform' }}
                  loading="eager"
                  onLoad={() => {
                    setImageLoading(false);
                  }}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                    toast.error('图片加载失败，请检查网络连接');
                  }}
                />
              </div>
            )}
          </div>
      </div>
    </div>,
    document.body
  );
}