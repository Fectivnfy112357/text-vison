import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import {
  Image,
  Video,
  Download,
  Share2,
  Trash2,
  Calendar,
  Sparkles,
  Play,
} from "lucide-react";
import { GenerationContent } from "../lib/api";
import { getAspectRatioStyle } from "../utils/imageUtils";

interface HistoryItemProps {
  item: GenerationContent;
  index: number;
  isSelected: boolean;
  onDownload: (item: GenerationContent) => void;
  onShare: (item: GenerationContent) => void;
  onDelete: (id: string) => void;
  aspectRatio?: number;
  onImageLoad?: () => void;
  isLoading?: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = memo(
  ({
    item,
    index,
    isSelected,
    onDownload,
    onShare,
    onDelete,
    aspectRatio = 16 / 9,
    onImageLoad,
    isLoading = false,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);

    // 格式化时间函数
    const formatTime = useCallback((dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return "今天";
      } else if (days === 1) {
        return "昨天";
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return date.toLocaleDateString("zh-CN");
      }
    }, []);

    // 图片懒加载
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: "300px",
          threshold: 0.01,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, []);

    // 处理图片加载成功
    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
      setImageError(false);
      onImageLoad?.();
    }, [onImageLoad]);

    // 处理图片加载错误
    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
      onImageLoad?.();
    }, [onImageLoad]);

    // 处理下载
    const handleDownload = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDownload(item);
      },
      [item, onDownload]
    );

    // 处理分享
    const handleShare = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(item);
      },
      [item, onShare]
    );

    // 处理删除
    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(item.id);
      },
      [item.id, onDelete]
    );

    // 处理视频点击播放
    const handleVideoClick = useCallback(() => {
      if (item.type === "video" && item.url) {
        setShowVideoPlayer(true);
      }
    }, [item.type, item.url]);

    // 关闭视频播放器
    const handleCloseVideoPlayer = useCallback(() => {
      setShowVideoPlayer(false);
    }, []);

    // 清理URL，移除可能存在的反引号
    const cleanUrl = React.useMemo(() => {
      let url = "";
      if (item.type === "video") {
        url = item.thumbnail || "";
      } else {
        url = item.url || "";
      }
      
      if (!url) return '';
      let cleaned = url.trim();
      // 移除首尾的反引号
      if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      }
      return cleaned;
    }, [item.type, item.thumbnail, item.url]);

    return (
      <>
        <div
          ref={containerRef}
          className={`card-glow overflow-hidden group cursor-pointer w-full ${
            isSelected ? "ring-2 ring-primary-300" : ""
          }`}
          style={{ boxSizing: 'border-box' }}
          onClick={handleVideoClick}
        >
          {/* 主要内容区域 */}
          <div>
            {/* 图片展示区域 */}
            <div
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
              style={getAspectRatioStyle(aspectRatio)}
            >
              {/* 图片容器 - 使用绝对定位填充整个容器 */}
              <div className="absolute inset-0">
                {cleanUrl ? (
                  <>
                    {/* 图片加载状态 */}
                    {isVisible && !imageLoaded && !imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 z-10">
                        <div className="text-center">
                          <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
                          <div className="text-xs text-gray-500">加载中...</div>
                        </div>
                      </div>
                    )}

                    {/* 实际图片 - 懒加载 */}
                    {isVisible && (
                      <>
                        {/* 低质量占位图 */}
                        {!imageLoaded && !imageError && (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 filter blur-sm scale-110" />
                        )}
                        
                        <img
                          src={cleanUrl}
                          alt={item.prompt || "Generated content"}
                          className={`w-full h-full object-cover ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                          }`}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          loading="lazy"
                          decoding="async"
                          style={{
                            transition: imageLoaded
                              ? "opacity 0.2s ease-in-out"
                              : "none",
                            // 确保图片填充整个容器
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </>
                    )}

                    {/* 图片加载错误占位符 */}
                    {imageError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-red-200/50">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-2">
                          <Sparkles size={24} className="text-red-500" />
                        </div>
                        <div className="text-sm font-medium text-red-600 mb-1">
                          图片加载失败
                        </div>
                        <div className="text-xs text-red-500">
                          链接已过期，无法访问
                        </div>
                      </div>
                    )}

                    {/* 占位符 - 图片未加载时显示 */}
                    {!isVisible && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Image className="text-gray-300 mb-2" size={32} />
                          <div className="text-xs text-gray-400">预览</div>
                        </div>
                      </div>
                    )}

                    {/* 视频播放覆盖层 */}
                    {item.type === "video" && imageLoaded && !imageError && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <Play size={24} className="text-primary-600 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Image className="text-gray-400 mb-2" size={32} />
                      <div className="text-sm text-gray-500">
                        {item.type === "image" ? "图片" : "视频"}模板
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 状态标签 */}
              <div className="absolute top-3 left-3 flex flex-col space-y-2 z-20">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    item.type === "image"
                      ? "bg-primary-100/80 text-primary-700 border border-primary-200/50"
                      : "bg-secondary-100/80 text-secondary-700 border border-secondary-200/50"
                  }`}
                >
                  {item.type === "image" ? (
                    <>
                      <Image size={12} className="mr-1" />
                      图片
                    </>
                  ) : (
                    <>
                      <Video size={12} className="mr-1" />
                      视频
                    </>
                  )}
                </span>
                {/* 只显示处理中和异常状态 */}
                {item.status !== "completed" && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      item.status === "processing"
                        ? "bg-amber-100/80 text-amber-700 border border-amber-200/50"
                        : "bg-rose-100/80 text-rose-700 border border-rose-200/50"
                    }`}
                  >
                    {item.status === "processing" ? "处理中" : "失败"}
                  </span>
                )}
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-3">
              <div className="space-y-2">
                {/* 提示词 - 单行展示 */}
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-800 leading-relaxed line-clamp-1">
                    {item.prompt}
                  </p>
                </div>

                {/* 元数据 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* 快速操作按钮 */}
                <div className="flex items-center space-x-1 pt-2 border-t border-gray-100">
                  {item.url && (
                    <>
                      <button
                        onClick={handleDownload}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors"
                      >
                        <Download size={10} />
                        <span>下载</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-secondary-50 text-secondary-600 rounded-md hover:bg-secondary-100 transition-colors"
                      >
                        <Share2 size={10} />
                        <span>分享</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 size={10} />
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 视频播放器模态框 */}
        {showVideoPlayer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl">
              {/* 关闭按钮 */}
              <button
                onClick={handleCloseVideoPlayer}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* 视频播放器 */}
              <video
                src={item.url || ""}
                className="w-full h-auto max-h-[80vh] rounded-lg"
                controls
                autoPlay
                playsInline
                webkit-playsinline="true"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
                x5-playsinline="true"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        )}
      </>
    );
  }
);

HistoryItem.displayName = "HistoryItem";

export default HistoryItem;