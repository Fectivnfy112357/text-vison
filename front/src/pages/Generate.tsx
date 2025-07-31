import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Image as ImageIcon, Video, Download, Share2, Wand2, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useEffect } from 'react';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [watermark, setWatermark] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 图片专用参数
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('');
  const [quality, setQuality] = useState('standard');
  const [responseFormat, setResponseFormat] = useState('url');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [guidanceScale, setGuidanceScale] = useState<number | undefined>(undefined);



  // 视频专用参数
  const [resolution, setResolution] = useState('720p');
  const [duration, setDuration] = useState(5);
  const [ratio, setRatio] = useState('16:9');
  const [fps, setFps] = useState(24);
  const [cameraFixed, setCameraFixed] = useState(false);
  const [cfgScale, setCfgScale] = useState(7);
  const [count, setCount] = useState(1);
  const [firstFrameImage, setFirstFrameImage] = useState<string | null>(null);
  const [lastFrameImage, setLastFrameImage] = useState<string | null>(null);
  const firstFrameInputRef = useRef<HTMLInputElement>(null);
  const lastFrameInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const { templates } = useTemplateStore();
  const templateAppliedRef = useRef(false);

  const { generateContent, isGenerating, currentGeneration, stopPolling, history, loadHistory } = useGenerationStore();
  const { isAuthenticated, user } = useAuthStore();

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // 页面加载时获取历史记录
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  // 视频参数选项
  const resolutionOptions = [
    { value: '480p', label: '480p (标清)' },
    { value: '720p', label: '720p (高清)' },
    { value: '1080p', label: '1080p (全高清)' }
  ];

  const ratioOptions = [
    { value: '1:1', label: '正方形 (1:1)' },
    { value: '3:4', label: '竖屏 (3:4)' },
    { value: '4:3', label: '横屏 (4:3)' },
    { value: '16:9', label: '宽屏 (16:9)' },
    { value: '9:16', label: '竖屏 (9:16)' },
    { value: '21:9', label: '超宽屏 (21:9)' }
  ];

  const durationOptions = [
    { value: 5, label: '5秒' },
    { value: 10, label: '10秒' }
  ];

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
        const templateTitle = template.title || '未命名模板';
        const currentTemplateKey = `${templateId}-${templateTitle}`;
        if (!templateAppliedRef.current || templateAppliedRef.current !== currentTemplateKey) {
          setPrompt(template.prompt || '');
          setType(template.type || 'image');
          templateAppliedRef.current = currentTemplateKey;
          toast.success(`已应用模板：${templateTitle}`);
        }
      }
    } else if (!searchParams.get('template')) {
      templateAppliedRef.current = null;
    }
  }, [searchParams, templates]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string);
        toast.success('参考图片上传成功');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFirstFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        toast.error('图片大小不能超过30MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFirstFrameImage(e.target?.result as string);
        toast.success('首帧图片上传成功');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLastFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        toast.error('图片大小不能超过30MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLastFrameImage(e.target?.result as string);
        toast.success('尾帧图片上传成功');
      };
      reader.readAsDataURL(file);
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

      if (type === 'image') {
        params.size = size;
        params.style = style;
        params.quality = quality;
        params.responseFormat = responseFormat;
        if (seed !== undefined && seed >= -1 && seed <= 2147483647) {
          params.seed = seed;
        }
        if (guidanceScale !== undefined && guidanceScale >= 1 && guidanceScale <= 10) {
          params.guidanceScale = guidanceScale;
        }
      }

      if (type === 'video') {
        params.resolution = resolution;
        params.duration = duration;
        params.ratio = ratio;
        params.fps = fps;
        params.cameraFixed = cameraFixed;
        params.cfgScale = cfgScale;
        params.count = count;
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

  const handleTemplateSelect = (template: any) => {
    setPrompt(template.prompt || '');
    setType(template.type || 'image');
    setShowTemplates(false);
    toast.success(`已应用模板：${template.title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex flex-col pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* 页面标题 - 更现代化的设计 */}
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

          {/* 模板选择按钮 - 更现代的设计 */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTemplates(!showTemplates)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
          >
            <Wand2 className="w-5 h-5" />
            <span>{showTemplates ? '隐藏模板' : '选择模板'}</span>
            <motion.div
              animate={{ rotate: showTemplates ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* 模板选择区域 - 更流畅的动画 */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Wand2 className="w-6 h-6 mr-3 text-purple-600" />
                  选择模板
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {templates.slice(0, 12).map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTemplateSelect(template)}
                    className="cursor-pointer bg-white rounded-2xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200 group"
                  >
                    <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group-hover:shadow-md transition-shadow">
                      <img
                        src={template.imageUrl || template.preview}
                        alt={template.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(template.title + ' ' + template.category)}&image_size=square`;
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">{template.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{template.category}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-3 py-1 rounded-full font-medium ${template.type === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                        {template.type === 'image' ? '图片' : '视频'}
                      </span>
                      <span className="text-gray-400">{template.views || 0} 次</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主要创作区域 - 简单稳定的布局 */}
        <div className="grid lg:grid-cols-2 gap-8 flex-1 items-start">
          {/* 左侧：创作输入和参数配置 */}
          <div className="flex flex-col space-y-6 w-full">
            {/* 文本输入和基础设置 - 更现代的卡片设计 */}
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

              {/* 类型选择和基础设置 - 更现代的设计 */}
              <div className="grid grid-cols-2 gap-6 mt-6">
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
                      <ImageIcon className="w-5 h-5" />
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
                      <Video className="w-5 h-5" />
                      <span>视频</span>
                    </motion.button>
                  </div>
                </div>

                {/* 参考图片上传 - 更现代的设计 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    参考图片
                  </label>
                  {referenceImage ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={referenceImage}
                        alt="参考图片"
                        className="w-full h-20 object-cover rounded-xl shadow-md"
                      />
                      <button
                        onClick={() => setReferenceImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02, borderColor: '#8b5cf6' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-50 transition-all duration-300 h-20 flex flex-col justify-center group"
                    >
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-500 mx-auto mb-1 transition-colors" />
                      <p className="text-gray-500 group-hover:text-purple-600 text-xs font-medium transition-colors">上传图片</p>
                    </motion.div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 水印选项 - 更现代的设计 */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 mt-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="watermark" className="text-sm font-semibold text-gray-700 flex items-center">
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
                      id="watermark"
                      checked={watermark}
                      onChange={(e) => setWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* 高级参数配置 - 可折叠设计 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-8 cursor-pointer hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      {type === 'image' ? <ImageIcon className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
                    </div>
                    {type === 'image' ? '图片参数' : '视频参数'}
                  </h2>
                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-8 pb-8"
                  >
                    <div className="border-t border-gray-100 pt-6">

                    {type === 'image' ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">图片尺寸</label>
                          <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                          >
                            <option value="1024x1024">正方形 (1024x1024)</option>
                            <option value="1152x896">横屏 (1152x896)</option>
                            <option value="896x1152">竖屏 (896x1152)</option>
                            <option value="1216x832">宽屏 (1216x832)</option>
                            <option value="832x1216">长屏 (832x1216)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">图片质量</label>
                          <select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                          >
                            <option value="standard">标准质量</option>
                            <option value="hd">高清质量</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">艺术风格</label>
                          <input
                            type="text"
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            placeholder="如：油画、水彩、卡通等"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">随机种子</label>
                          <input
                            type="number"
                            value={seed || ''}
                            onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="可选，用于复现结果"
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">分辨率</label>
                            <select
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                            >
                              {resolutionOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">时长</label>
                            <select
                              value={duration}
                              onChange={(e) => setDuration(Number(e.target.value))}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                            >
                              {durationOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">画面比例</label>
                            <select
                              value={ratio}
                              onChange={(e) => setRatio(e.target.value)}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                            >
                              {ratioOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">帧率</label>
                            <input
                              type="number"
                              value={fps}
                              onChange={(e) => setFps(Number(e.target.value))}
                              min="12"
                              max="60"
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 backdrop-blur-sm transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* 固定摄像头选项 - 更现代的设计 */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <label htmlFor="cameraFixed" className="text-sm font-semibold text-gray-700 flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                固定摄像头
                              </label>
                              <p className="text-xs text-gray-500 mt-2 ml-4">减少镜头运动，画面更稳定</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                id="cameraFixed"
                                checked={cameraFixed}
                                onChange={(e) => setCameraFixed(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 shadow-inner"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 生成按钮 - 更现代的设计 */}
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

          {/* 右侧：生成结果展示 - 独立的固定高度容器 */}
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
                            className={`w-3 h-3 rounded-full ${generation.status === 'generating' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50' :
                                generation.status === 'processing' ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50' :
                                  genIndex === 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                              }`}
                          ></motion.div>
                          <span className="text-xs font-semibold text-gray-700">
                            {generation.status === 'generating' ? '生成中' :
                              generation.status === 'processing' ? '处理中' :
                                genIndex === 0 ? '最新作品' : `历史作品 ${genIndex + 1}`}
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
                      {generation.status === 'generating' || generation.status === 'processing' ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mb-4"
                          ></motion.div>
                          <motion.p 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-sm text-gray-600 font-medium"
                          >
                            {generation.status === 'generating' ? '正在生成创作...' : '正在处理内容...'}
                          </motion.p>
                        </div>
                      ) : generation.urls && generation.urls.length > 0 ? (
                        <div className="space-y-3">
                          {generation.urls.slice(0, 1).map((url, index) => (
                            <motion.div 
                              key={index} 
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
                                  poster={generation.thumbnails?.[index]}
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt={`生成结果 ${index + 1}`}
                                  className="w-full h-40 object-cover rounded-2xl shadow-lg transition-all duration-300"
                                />
                              )}

                              {/* 操作按钮 - 更现代的设计 */}
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                                <button
                                  onClick={() => handleDownload(url, index)}
                                  className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-xl hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                                  title="下载"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleShare(url)}
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
                          {generation.urls.length > 1 && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-gray-500 text-center bg-gray-100 py-2 rounded-lg font-medium"
                            >
                              +{generation.urls.length - 1} 更多作品
                            </motion.p>
                          )}
                        </div>
                      ) : (
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
                      )}
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
                        <Sparkles className="w-10 h-10 text-purple-500" />
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
              )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
