import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function MediaPreviewModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  title,
  onDownload,
  onShare
}: MediaPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

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
      
      // 视频加载完成后立即播放
      ref.addEventListener('loadeddata', () => {
        ref.play().catch(console.error);
      });
    }
  };

  const handleDownloadClick = useCallback(() => {
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
  }, [onDownload, mediaUrl, mediaType]);

  const handleShareClick = useCallback(async () => {
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
  }, [onShare, title, mediaUrl]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, willChange: 'opacity' }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative max-w-7xl max-h-[95vh] sm:max-h-[90vh] w-full bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* 头部操作栏 */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                {title && (
                  <h3 className="text-white font-medium text-sm sm:text-base lg:text-lg truncate">{title}</h3>
                )}
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                  {mediaType === 'video' ? '视频' : '图片'}
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <button
                  onClick={handleDownloadClick}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-white/30 transition-all duration-200"
                  title="下载"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleShareClick}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
                  title="分享"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
                  title="关闭"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 媒体内容 */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {mediaType === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  ref={handleVideoRef}
                  src={mediaUrl}
                  className="w-full h-full object-contain max-h-[85vh] sm:max-h-[90vh]"
                  onClick={handleVideoToggle}
                  autoPlay
                  controls
                  preload="metadata"
                  style={{ willChange: 'transform' }}
                />

                {/* 自定义播放控制 - 只在未播放时显示 */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      onClick={handleVideoToggle}
                      className="bg-white/20 backdrop-blur-sm text-white p-4 sm:p-6 rounded-full hover:bg-white/30 transition-all duration-150"
                      style={{ willChange: 'transform' }}
                    >
                      <Play className="w-8 h-8 sm:w-12 sm:h-12 ml-1" />
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              <img
                src={mediaUrl}
                alt={title || '预览图片'}
                className="w-full h-full object-contain max-h-[85vh] sm:max-h-[90vh]"
                style={{ willChange: 'transform' }}
                loading="eager"
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}