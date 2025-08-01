import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2 } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useArtStyleStore } from '@/store/useArtStyleStore';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

import ParameterConfig, { ImageGenerationParams, VideoGenerationParams } from '@/components/generate/ParameterConfig';
import ResultsDisplay from '@/components/generate/ResultsDisplay';
import ImageUploader from '@/components/generate/ImageUploader';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [watermark, setWatermark] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [setShowTemplates] = useState(false);
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);
  const [firstFrameImage] = useState<string | null>(null);
  const [lastFrameImage] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<number | undefined>(undefined);

  const [searchParams] = useSearchParams();

  // 图片参数
  const [imageParams, setImageParams] = useState<ImageGenerationParams>({
    size: '1024x1024',
    quality: 'standard',
    responseFormat: 'url',
    seed: undefined,
    guidanceScale: undefined
  });

  // 视频参数
  const [videoParams, setVideoParams] = useState<VideoGenerationParams>({
    resolution: '720p',
    duration: 5,
    ratio: '16:9',
    fps: 24,
    cameraFixed: false,
    cfgScale: 7,
    count: 1
  });

  const { generateContent, isGenerating, currentGeneration, stopPolling, history, loadHistory } = useGenerationStore();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchStyles, styles, getStylesByType } = useArtStyleStore();
  const { templates } = useTemplateStore();

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // 页面加载时获取历史记录和艺术风格
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
    fetchStyles();
  }, [isAuthenticated, loadHistory, fetchStyles]);

  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 检查是否有模板参数
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t && t.id === templateId);
      if (template) {
        setPrompt(template.prompt || '');
        setType(template.type || 'image');
        toast.success(`已应用模板：${template.title}`);
      }
    }
  }, [searchParams, templates]);

  const handleTemplateSelect = (template: any) => {
    setPrompt(template.prompt || '');
    setType(template.type || 'image');
    setShowTemplates(false);
    toast.success(`已应用模板：${template.title}`);
  };


  const handleDownload = (specificUrl?: string, index?: number) => {
    if (!currentGeneration) {
      toast.error('下载失败：无效的内容');
      return;
    }

    const fileType = currentGeneration.type === 'video' ? 'mp4' : 'jpg';
    const fileId = currentGeneration.id || 'unknown';

    if (specificUrl && index !== undefined) {
      const link = document.createElement('a');
      link.href = specificUrl;
      link.download = `textvision-${fileId}-${index + 1}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`第${index + 1}个文件下载开始`);
      return;
    }

    const urls = currentGeneration.urls || (currentGeneration.url ? [currentGeneration.url] : []);

    if (urls.length === 0) {
      toast.error('下载失败：无效的文件链接');
      return;
    }

    if (urls.length === 1) {
      const link = document.createElement('a');
      link.href = urls[0];
      link.download = `textvision-${fileId}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('下载开始');
    } else {
      urls.forEach((url, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = url;
          link.download = `textvision-${fileId}-${index + 1}.${fileType}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500);
      });
      toast.success(`开始下载${urls.length}个文件`);
    }
  };

  const handleShare = async (specificUrl?: string) => {
    const shareUrl = specificUrl || currentGeneration?.url;
    if (!shareUrl) {
      toast.error('分享失败：无效的内容链接');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: '文生视界 - 我的创作',
          text: currentGeneration?.prompt || '精彩创作内容',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('链接已复制到剪贴板');
      } catch (clipboardError) {
        toast.error('分享失败：无法访问剪贴板');
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入描述文本');
      return;
    }

    if (!isAuthenticated) {
      toast.error('请先登录后再进行创作');
      return;
    }

    setIsGeneratingAnimation(true);

    try {
      const params: any = {
        watermark,
        referenceImage
      };

      // 添加艺术风格参数
      if (selectedStyleId) {
        params.styleId = selectedStyleId;
      }

      if (type === 'image') {
        params.size = imageParams.size;
        params.quality = imageParams.quality;
        params.responseFormat = imageParams.responseFormat;
        if (imageParams.seed !== undefined && imageParams.seed >= -1 && imageParams.seed <= 2147483647) {
          params.seed = imageParams.seed;
        }
        if (imageParams.guidanceScale !== undefined && imageParams.guidanceScale >= 1 && imageParams.guidanceScale <= 10) {
          params.guidanceScale = imageParams.guidanceScale;
        }
      }

      if (type === 'video') {
        params.resolution = videoParams.resolution;
        params.duration = videoParams.duration;
        params.ratio = videoParams.ratio;
        params.fps = videoParams.fps;
        params.cameraFixed = videoParams.cameraFixed;
        params.cfgScale = videoParams.cfgScale;
        params.count = videoParams.count;
        params.firstFrameImage = firstFrameImage;
        params.lastFrameImage = lastFrameImage;
      }

      await generateContent(prompt, type, params);
      toast.success('生成成功！');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingAnimation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">


        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4"
          >
            AI创作工坊
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto"
          >
            将您的想象力转化为令人惊艳的视觉作品，体验前所未有的创作乐趣
          </motion.p>


        </motion.div>
        {/* 主要创作区域 */}
        <div className="grid lg:grid-cols-2 gap-8 flex-1 items-start">
          {/* 左侧：创作输入和参数配置 */}
          <div className="flex flex-col space-y-6 w-full">

            {/* 文本输入和基础设置 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                描述您的创意
              </h2>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="请详细描述您想要生成的内容，例如：一只可爱的小猫坐在彩虹桥上，背景是梦幻的星空..."
                  className="w-full h-40 p-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all duration-300 text-gray-700 placeholder-gray-400 bg-gray-50/50 backdrop-blur-sm"
                  maxLength={500}
                />
                <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                  <span className={`text-sm font-medium ${prompt.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                    {prompt.length}/500
                  </span>
                  {prompt.length > 0 && (
                    <button
                      onClick={() => setPrompt('')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1 rounded-lg hover:bg-purple-50 transition-all"
                    >
                      清空
                    </button>
                  )}
                </div>
              </div>

              {/* 类型选择和艺术风格 */}
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    生成类型
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setType('image')}
                      className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${type === 'image'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-purple-200'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>图片</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setType('video')}
                      className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${type === 'video'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-purple-200'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>视频</span>
                    </motion.button>
                  </div>
                </div>

                {/* 艺术风格选择 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    艺术风格
                  </label>
                  <select
                    value={selectedStyleId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value ? Number(e.target.value) : undefined;
                      setSelectedStyleId(selectedId);
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="">选择艺术风格（可选）</option>
                    {getStylesByType(type).map((artStyle) => (
                      <option key={artStyle.id} value={artStyle.id}>
                        {artStyle.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 参考图片上传 */}
                <div>
                  <ImageUploader
                    image={referenceImage}
                    onImageChange={setReferenceImage}
                    label="参考图片"
                    maxSize={10 * 1024 * 1024}
                    aspectRatio="rectangle"
                  />
                </div>
              </div>

              {/* 水印选项 */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 mt-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      添加水印
                    </label>
                    <p className="text-xs text-gray-500 mt-2 ml-4">
                      在生成的内容上添加平台标识，保护您的创作
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermark}
                      onChange={(e) => setWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* 高级参数配置 */}
            <ParameterConfig
              type={type}
              imageParams={imageParams}
              videoParams={videoParams}
              onImageParamsChange={setImageParams}
              onVideoParamsChange={setVideoParams}
            />

            {/* 生成按钮 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ delay: 0.2 }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="relative w-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white py-6 rounded-3xl font-bold text-xl hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-2xl shadow-purple-500/25 overflow-hidden group"
            >
              {/* 背景动画效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* 生成中的动画效果 */}
              {(isGenerating || isGeneratingAnimation) && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}

              <div className="relative z-10 flex items-center space-x-3">
                <motion.div
                  animate={isGenerating || isGeneratingAnimation ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isGenerating || isGeneratingAnimation ? Infinity : 0, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <span>{isGenerating ? '生成中...' : '开始生成'}</span>
              </div>
            </motion.button>
          </div>

          {/* 右侧：生成结果展示 */}
          <ResultsDisplay
            history={history}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  );
}
