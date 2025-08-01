import { motion } from 'framer-motion';
import { Image as ImageIcon, Download, Share2 } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { toast } from 'sonner';

interface GenerationResult {
  id: string;
  prompt: string;
  type: 'image' | 'video';
  status: 'generating' | 'processing' | 'completed';
  urls: string[];
  thumbnails?: string[];
  url?: string;
}

interface ResultsDisplayProps {
  history: GenerationResult[];
  onDownload: (url?: string, index?: number) => void;
  onShare: (url?: string) => void;
}

export default function ResultsDisplay({ history, onDownload, onShare }: ResultsDisplayProps) {
  const { currentGeneration } = useGenerationStore();

  const getStatusDisplay = (generation: GenerationResult, index: number) => {
    if (generation.status === 'generating') {
      return { text: '生成中', color: 'from-yellow-400 to-orange-500' };
    } else if (generation.status === 'processing') {
      return { text: '处理中', color: 'from-blue-400 to-blue-600' };
    } else {
      return index === 0 
        ? { text: '最新作品', color: 'from-green-400 to-emerald-500' }
        : { text: `历史作品 ${index + 1}`, color: 'from-gray-400 to-gray-500' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 flex flex-col w-full lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)]"
      style={{ minHeight: '600px' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
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

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          {history && history.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 w-full h-full">
              {/* 显示最多4个结果，2x2网格布局 */}
              {history.slice(0, 4).map((generation, genIndex) => (
                <motion.div
                  key={generation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: genIndex * 0.1 }}
                  className="border-2 border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group"
                >
                  {/* 生成状态指示 - 更现代的设计 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        animate={generation.status === 'generating' || generation.status === 'processing' ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: generation.status === 'generating' || generation.status === 'processing' ? Infinity : 0 }}
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusDisplay(generation, genIndex).color} shadow-lg`}
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        {getStatusDisplay(generation, genIndex).text}
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${generation.type === 'image' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700' : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
                      }`}>
                      {generation.type === 'image' ? '图片' : '视频'}
                    </span>
                  </div>

                  {/* 提示词 - 更好的排版 */}
                  <div className="mb-4 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium">{generation.prompt}</p>
                  </div>

                  {/* 结果展示 - 更现代的加载动画 */}
                  {renderContent(generation, genIndex, onDownload, onShare)}
                </motion.div>
              ))}

              {/* 如果结果少于4个，显示空白占位 - 更现代的设计 */}
              {Array.from({ length: Math.max(0, 4 - history.length) }).map((_, index) => (
                <motion.div 
                  key={`empty-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (history.length + index) * 0.1 }}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 h-full flex flex-col hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      >
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-sm text-gray-400 font-medium">等待创作</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function renderContent(
  generation: GenerationResult, 
  index: number, 
  onDownload: (url?: string, index?: number) => void,
  onShare: (url?: string) => void
) {
  if (generation.status === 'generating' || generation.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-gray-600 font-medium"
        >
          {generation.status === 'generating' ? '正在生成创作...' : '正在处理内容...'}
        </motion.p>
      </div>
    );
  }

  const urls = generation.urls || (generation.url ? [generation.url] : []);
  
  if (urls.length > 0) {
    return (
      <div className="space-y-3">
        {urls.slice(0, 1).map((url, urlIndex) => (
          <motion.div 
            key={urlIndex} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative group overflow-hidden rounded-2xl"
          >
            {generation.type === 'video' ? (
              <video
                src={url}
                controls
                className="w-full h-40 object-cover rounded-2xl shadow-lg transition-all duration-300"
                poster={generation.thumbnails?.[urlIndex]}
              />
            ) : (
              <img
                src={url}
                alt={`生成结果 ${urlIndex + 1}`}
                className="w-full h-40 object-cover rounded-2xl shadow-lg transition-all duration-300"
              />
            )}

            {/* 操作按钮 - 更现代的设计 */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              <button
                onClick={() => onDownload(url, urlIndex)}
                className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-xl hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onShare(url)}
                className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-xl hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                title="分享"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* 悬浮信息 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs font-medium">点击操作按钮进行下载或分享</p>
            </div>
          </motion.div>
        ))}
        
        {urls.length > 1 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 text-center bg-gray-100 py-2 rounded-lg font-medium"
          >
            +{urls.length - 1} 更多作品
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        </motion.div>
        <p className="text-sm text-gray-500 font-medium">等待生成结果</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[400px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg">
            <ImageIcon className="w-10 h-10 text-purple-500" />
          </div>
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">等待您的创作</h3>
        <p className="text-gray-500 text-lg mb-6 max-w-md text-center">
          输入您的创意描述，让AI为您创造精彩的视觉作品
        </p>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center space-x-2 text-purple-500"
        >
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}