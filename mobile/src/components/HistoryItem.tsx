import React, { memo, useCallback, useRef, useState, useEffect, useMemo } from "react";
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
    isSelected,
    onDownload,
    onShare,
    onDelete,
    aspectRatio = 16 / 9,
    onImageLoad,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);

    // 格式化时间函数 - 简化版本，直接显示日期
    const formatTime = useMemo(() => {
      const date = new Date(item.createdAt);
      return date.toLocaleDateString("zh-CN");
    }, [item.createdAt]);

    // 图片懒加载 - 简化版本，类似TemplateCard
    useEffect(() => {
      const url = item.type === "video" ? item.thumbnail : item.url;
      if (!url) {
        setIsVisible(true);
        return;
      }

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
    }, [item.type, item.thumbnail, item.url]);

    // 处理图片加载成功 - 简化版本，类似TemplateCard
    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
      setImageError(false);
      onImageLoad?.();
    }, [onImageLoad]);

    // 处理图片加载错误 - 简化版本，类似TemplateCard
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
      [onDownload, item]
    );

    // 处理分享
    const handleShare = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(item);
      },
      [onShare, item]
    );

    // 处理删除
    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(item.id);
      },
      [onDelete, item.id]
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

    // 获取图片URL
    const getImageUrl = React.useMemo(() => {
      if (item.type === "video") {
        return item.thumbnail || "";
      } else {
        return item.url || "";
      }
    }, [item.type, item.thumbnail, item.url]);

    return (
      <>
        <div
          ref={containerRef}
          className={`card-glow overflow-hidden group cursor-pointer w-full ${
            isSelected ? "ring-2 ring-primary-300" : ""
          }`}
          style={{ 
            boxSizing: 'border-box'
          }}
          onClick={handleVideoClick}
        >
          {/* 主要内容区域 */}
          <div>
            {/* 图片展示区域 */}
            <div
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
              style={{
                ...getAspectRatioStyle(aspectRatio)
              }}
            >
              {/* 图片容器 - 使用绝对定位填充整个容器 */}
              <div className="absolute inset-0">
                {getImageUrl ? (
                  <>
                    {/* 图片加载状态 - 简化版本 */}
                    {isVisible && !imageLoaded && !imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                      </div>
                    )}

                    {/* 实际图片 - 懒加载 */}
                    {isVisible && (
                      <>
                        {/* 低质量占位图 - 移除模糊效果提升性能 */}
                        {!imageLoaded && !imageError && (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                        )}
                        
                        <img
                          src={getImageUrl}
                          alt={item.prompt || "Generated content"}
                          className={`w-full h-full object-cover ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                          }`}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                          loading="lazy"
                          decoding="async"
                          style={{
                            transition: imageLoaded ? "opacity 0.3s ease-in-out" : "none",
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </>
                    )}

                    {/* 图片加载错误占位符 - 简化版本 */}
                    {imageError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 flex flex-col items-center justify-center text-center p-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-1">
                          <Sparkles size={16} className="text-red-500" />
                        </div>
                        <div className="text-xs font-medium text-red-600">
                          加载失败
                        </div>
                      </div>
                    )}

                    {/* 占位符 - 图片未加载时显示 - 简化版本 */}
                    {!isVisible && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="text-gray-300" size={24} />
                      </div>
                    )}

                    {/* 视频播放覆盖层 - 简化版本 */}
                    {item.type === "video" && imageLoaded && !imageError && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <Play size={20} className="text-primary-600 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="text-gray-400" size={24} />
                  </div>
                )}
              </div>

              {/* 状态标签 */}
              <div className="absolute top-3 left-3 flex flex-col space-y-1 z-20">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === "image"
                      ? "bg-primary-100/80 text-primary-700"
                      : "bg-secondary-100/80 text-secondary-700"
                  }`}
                >
                  {item.type === "image" ? (
                    <>
                      <Image size={10} className="mr-1" />
                      图片
                    </>
                  ) : (
                    <>
                      <Video size={10} className="mr-1" />
                      视频
                    </>
                  )}
                </span>
                {/* 只显示处理中和异常状态 */}
                {item.status !== "completed" && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "processing"
                        ? "bg-amber-100/80 text-amber-700"
                        : "bg-rose-100/80 text-rose-700"
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
                <div className="rounded-lg p-2">
                  <p className="text-xs text-gray-800 leading-relaxed line-clamp-1">
                    {item.prompt}
                  </p>
                </div>

                {/* 元数据 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatTime}</span>
                    </div>
                  </div>
                </div>

                {/* 快速操作按钮 - 响应式布局 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-1">
                  {item.url && (
                    <>
                      <button
                        onClick={handleDownload}
                        className="flex-1 flex flex-col items-center justify-center py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md min-w-0"
                      >
                        <Download size={12} />
                        <span className="mt-0.5 leading-none">下载</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex-1 flex flex-col items-center justify-center py-1.5 text-xs bg-secondary-50 text-secondary-600 rounded-md min-w-0"
                      >
                        <Share2 size={12} />
                        <span className="mt-0.5 leading-none">分享</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md min-w-0"
                  >
                    <Trash2 size={12} />
                    <span className="mt-0.5 leading-none">删除</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 视频播放器模态框 - 简化版本 */}
        {showVideoPlayer && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={handleCloseVideoPlayer}
          >
            <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
              <video
                src={item.url || ""}
                className="w-full h-auto max-h-[80vh] rounded-lg"
                controls
                autoPlay
                playsInline
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