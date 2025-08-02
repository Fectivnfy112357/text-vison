import { useState } from 'react';
import { Image as ImageIcon, Download, Share2, Play, AlertCircle, Loader2 } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { toast } from 'sonner';
import MediaPreviewModal from '@/components/ui/MediaPreviewModal';

interface GenerationResult {
  id: string;
  prompt: string;
  type: 'image' | 'video';
  status: 'generating' | 'processing' | 'completed' | 'failed';
  urls: string[];
  thumbnails?: string[];
  url?: string;
  errorMessage?: string;
}

interface ResultsDisplayProps {
  history: GenerationResult[];
  onDownload: (url?: string, index?: number) => void;
  onShare: (url?: string) => void;
}

export default function ResultsDisplay({ history, onDownload, onShare }: ResultsDisplayProps) {
  const { currentGeneration } = useGenerationStore();
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    title?: string;
  }>({ isOpen: false, mediaUrl: '', mediaType: 'image' });

  const openPreview = (url: string, type: 'image' | 'video', title?: string) => {
    setPreviewModal({ isOpen: true, mediaUrl: url, mediaType: type, title });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, mediaUrl: '', mediaType: 'image' });
  };

  const getStatusDisplay = (generation: GenerationResult, index: number) => {
    if (generation.status === 'generating') {
      return { text: '生成中', color: 'from-yellow-400 to-orange-500' };
    } else if (generation.status === 'processing') {
      return { text: '处理中', color: 'from-blue-400 to-blue-600' };
    } else if (generation.status === 'failed') {
      return { text: '生成失败', color: 'from-red-400 to-red-600' };
    } else {
      return index === 0 
        ? { text: '最新作品', color: 'from-green-400 to-emerald-500' }
        : { text: `历史作品 ${index + 1}`, color: 'from-gray-400 to-gray-500' };
    }
  };

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 flex flex-col w-full"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-2 sm:mr-3">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          生成结果
        </h2>
        {history && history.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {history.length} 个作品
          </span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-center h-full">
          {history && history.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full">
              {/* 显示最多4个结果，2x2网格布局 */}
              {history.slice(0, 4).map((generation, genIndex) => (
                <div
                  key={generation.id}
                  className={`border-2 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 bg-gradient-to-br h-full flex flex-col ${
                    generation.status === 'failed' 
                      ? 'border-red-200 from-red-50 to-red-100 opacity-75 cursor-not-allowed'
                      : 'border-gray-100 from-white to-gray-50 transform transition-all duration-200 will-change-transform hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 group cursor-pointer'
                  }`}
                >
                  {/* 生成状态指示 - 更现代的设计 */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusDisplay(generation, genIndex).color} shadow-lg ${generation.status === 'generating' || generation.status === 'processing' ? 'animate-pulse' : ''}`}
                      />
                      <span className="text-xs sm:text-xs font-semibold text-gray-700">
                        {getStatusDisplay(generation, genIndex).text}
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2 sm:px-3 py-1 rounded-full ${generation.type === 'image' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700' : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
                      }`}>
                      {generation.type === 'image' ? '图片' : '视频'}
                    </span>
                  </div>

                  {/* 提示词 - 更好的排版 */}
                  <div className="mb-2 sm:mb-3 lg:mb-4 bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">{generation.prompt}</p>
                  </div>

                  {/* 结果展示 - 更现代的加载动画 */}
                   {renderContent(generation, genIndex, onDownload, onShare, openPreview)}
                 </div>
              ))}

              {/* 如果结果少于4个，显示空白占位 - 更现代的设计 */}
              {Array.from({ length: Math.max(0, 4 - history.length) }).map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  className="border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 bg-gradient-to-br from-gray-50 to-gray-100 h-full flex flex-col transform transition-all duration-200 will-change-transform hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="transform transition-transform duration-200 will-change-transform">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-2 sm:mb-3" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium">等待创作</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      
      {/* 媒体预览模态框 */}
      <MediaPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        mediaUrl={previewModal.mediaUrl}
        mediaType={previewModal.mediaType}
        title={previewModal.title}
        onDownload={() => onDownload(previewModal.mediaUrl)}
        onShare={() => onShare(previewModal.mediaUrl)}
        autoPlay={previewModal.mediaType === 'video'}
      />    </div>  );
}

function renderContent(
  generation: GenerationResult, 
  index: number, 
  onDownload: (url?: string, index?: number) => void,
  onShare: (url?: string) => void,
  openPreview: (url: string, type: 'image' | 'video', title?: string) => void
) {
  if (generation.status === 'generating' || generation.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4 animate-spin" />
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {generation.status === 'generating' ? '正在生成创作...' : '正在处理内容...'}
        </p>
      </div>
    );
  }

  if (generation.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-red-700">生成失败</h3>
            <p className="text-xs text-red-600 max-w-xs mx-auto px-2">
              {generation.errorMessage || '生成过程中出现错误，请稍后重试'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const urls = generation.urls || (generation.url ? [generation.url] : []);
  
  if (urls.length > 0) {
    return (
      <div className="space-y-3">
        {urls.slice(0, 1).map((url, urlIndex) => (
          <div 
            key={urlIndex} 
            className={`relative overflow-hidden rounded-2xl ${
              generation.status !== 'failed' 
                ? 'cursor-pointer transform transition-transform duration-200 will-change-transform group'
                : ''
            }`}
            onClick={generation.status !== 'failed' ? () => openPreview(url, generation.type, generation.prompt) : undefined}
            style={{ contain: 'layout style paint' }}
          >
            {generation.type === 'video' ? (
              <VideoWithLoading url={url} />
            ) : (
              <ImageWithLoading url={url} alt={`生成结果 ${urlIndex + 1}`} />
            )}

            {/* 操作按钮 - 只有成功生成时才显示，且需要hover */}
            {generation.status !== 'failed' && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1 sm:space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(url, urlIndex);
                  }}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-white transform transition-all duration-200 will-change-transform hover:scale-105 shadow-lg"
                  title="下载"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(url);
                  }}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-xl hover:bg-white transform transition-all duration-200 will-change-transform hover:scale-105 shadow-lg"
                  title="分享"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {urls.length > 1 && (
          <p className="text-xs text-gray-500 text-center bg-gray-100 py-2 rounded-lg font-medium">
            +{urls.length - 1} 更多作品
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="text-center">
        <div className="animate-bounce">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        </div>
        <p className="text-sm text-gray-500 font-medium">等待生成结果</p>
      </div>
    </div>
  );
}

function ImageWithLoading({ url, alt, onError }: { url: string; alt: string; onError?: (failed: boolean) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-24 sm:h-32 lg:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="text-xs text-gray-500">加载中...</span>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-500">加载失败</span>
          </div>
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          className={`w-full h-full object-cover shadow-lg transform transition-all duration-200 will-change-transform group-hover:scale-105 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
}

function VideoWithLoading({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-24 sm:h-32 lg:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="text-xs text-gray-500">加载中...</span>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-red-500">视频加载失败</span>
          </div>
        </div>
      ) : (
        <>
          <video
            src={url}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            preload="metadata"
            muted
            playsInline
            poster=""
            onLoadedMetadata={(e) => {
              const target = e.target as HTMLVideoElement;
              target.currentTime = 0.1;
              setLoading(false);
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
          
          {!loading && !error && (
            <>
              {/* 中央播放按钮 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full hover:bg-black/70 transition-colors duration-150">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
                </div>
              </div>
              
              {/* 视频标识 */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                视频
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[200px]">
      <div className="text-center flex flex-col items-center">
        <div className="mb-6 flex justify-center animate-bounce">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg">
            <ImageIcon className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">等待您的创作</h3>
        <p className="text-gray-500 text-lg mb-6 max-w-md text-center">
          输入您的创意描述，让AI为您创造精彩的视觉作品
        </p>
        <div className="flex items-center justify-center space-x-2 text-purple-500 animate-pulse">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}