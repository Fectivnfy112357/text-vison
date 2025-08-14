import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useArtStyleStore } from '@/store/useArtStyleStore';
import { downloadContent, shareContent, handleApiError } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

import ParameterConfig, { ImageGenerationParams, VideoGenerationParams } from '@/components/generate/ParameterConfig';
import ResultsDisplay from '@/components/generate/ResultsDisplay';
import CreationInput from '@/components/generate/CreationInput';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [watermark, setWatermark] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
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
  const { fetchStyles  } = useArtStyleStore();
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
      if (template && !prompt) { // 只有当prompt为空时才应用模板，避免重复应用
        setPrompt(template.prompt || '');
        setType(template.type || 'image');
        toast.success('模板已应用');
      }
    }
  }, [searchParams, templates, prompt]);


  const handleDownload = (url?: string, index?: number) => {
    // 如果传入了具体的url，直接下载该url
    if (url) {
      try {
        // 从history中找到包含该url的内容
        const targetContent = history.find(item => 
          item.url === url || (item.urls && item.urls.includes(url))
        );
        
        if (targetContent) {
          downloadContent({
            id: targetContent.id,
            url: targetContent.url,
            urls: targetContent.urls,
            type: targetContent.type
          }, url, index);
        } else {
          // 如果找不到对应内容，创建一个临时对象
          downloadContent({
            id: 'temp-download',
            url: url,
            urls: [url],
            type: 'image' // 默认类型
          }, url, index);
        }
        toast.success('下载开始');
      } catch (error) {
        toast.error(handleApiError(error));
      }
      return;
    }

    // 如果没有传入url，使用currentGeneration或history中的最新内容
    const contentToDownload = currentGeneration || history.find(item => 
      item.status === 'completed' || item.status === 'success' || (!item.status && item.url)
    );
    
    if (!contentToDownload) {
      toast.error('下载失败：无可用的内容');
      return;
    }

    try {
      downloadContent({
        id: contentToDownload.id,
        url: contentToDownload.url,
        urls: contentToDownload.urls,
        type: contentToDownload.type
      }, url, index);
      
      const urls = contentToDownload.urls || (contentToDownload.url ? [contentToDownload.url] : []);
      if (urls.length === 1) {
        toast.success('下载开始');
      } else {
        toast.success(`开始下载${urls.length}个文件`);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleShare = async (url?: string) => {
    // 如果传入了具体的url，从history中找到对应的内容
    if (url) {
      const targetContent = history.find(item => 
        item.url === url || (item.urls && item.urls.includes(url))
      );
      
      try {
        await shareContent({
          url: url,
          prompt: targetContent?.prompt || '用户生成的内容'
        }, url);
        toast.success('分享成功');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error(handleApiError(error));
        }
      }
      return;
    }

    // 如果没有传入url，使用currentGeneration或history中的最新内容
    const contentToShare = currentGeneration || history.find(item => 
      item.status === 'completed' || item.status === 'success' || (!item.status && item.url)
    );
    
    if (!contentToShare) {
      toast.error('分享失败：无可用的内容');
      return;
    }

    try {
      await shareContent({
        url: contentToShare.url,
        prompt: contentToShare.prompt
      }, url);
      toast.success('分享成功');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error(handleApiError(error));
      }
    }
  };

  const handleGenerate = async () => {
    console.log('生成请求参数:', {
      prompt: prompt.trim(),
      isAuthenticated,
      user,
      token: localStorage.getItem('auth_token'),
      tokenExists: !!localStorage.getItem('auth_token')
    });
    
    if (!prompt.trim()) {
      toast.error('请输入描述文本');
      return;
    }

    if (!isAuthenticated) {
      console.error('认证失败 - 详细信息:', {
        isAuthenticated,
        user,
        token: localStorage.getItem('auth_token'),
        tokenExists: !!localStorage.getItem('auth_token')
      });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col pt-8 pb-8" style={{ contain: 'layout style paint', overflowAnchor: 'none' }}>
      <div className="max-w-7xl mx-auto px-8 w-full flex-1 flex flex-col">

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI创作工坊
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            将您的想象力转化为令人惊艳的视觉作品，体验前所未有的创作乐趣
          </p>
        </div>

        {/* 主要创作区域 */}
        <div className="grid grid-cols-2 gap-8 flex-1">
          {/* 创作输入和参数配置 */}
          <div className="flex flex-col space-y-6 w-full">

            {/* 创意输入组件 */}
            <CreationInput
              prompt={prompt}
              type={type}
              selectedStyleId={selectedStyleId}
              referenceImage={referenceImage}
              watermark={watermark}
              onPromptChange={setPrompt}
              onTypeChange={setType}
              onStyleChange={setSelectedStyleId}
              onReferenceImageChange={setReferenceImage}
              onWatermarkChange={setWatermark}
            />

            {/* 高级参数配置 */}
            <ParameterConfig
              type={type}
              imageParams={imageParams}
              videoParams={videoParams}
              onImageParamsChange={setImageParams}
              onVideoParamsChange={setVideoParams}
            />

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="relative w-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white py-6 rounded-3xl font-bold text-xl hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 transform transition-all duration-200 will-change-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-2xl shadow-purple-500/25 overflow-hidden group"
              style={{ contain: 'layout style paint' }}
            >
              {/* 背景动画效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

              {/* 生成中的动画效果 */}
              {(isGenerating || isGeneratingAnimation) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-75" />
              )}

              <div className="relative z-10 flex items-center space-x-3">
                <div className={`transform transition-transform duration-200 will-change-transform ${isGenerating || isGeneratingAnimation ? 'animate-spin' : ''}`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <span>{isGenerating ? '生成中...' : '开始生成'}</span>
              </div>
            </button>
          </div>

          {/* 生成结果展示 */}
          <div>
            <ResultsDisplay
              history={history as any[]}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
