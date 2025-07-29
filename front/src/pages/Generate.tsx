import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Image as ImageIcon, Video, Download, Share2, Wand2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const { generateContent, isGenerating, currentGeneration, stopPolling } = useGenerationStore();
  const { isAuthenticated, user } = useAuthStore();

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);



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
            templateAppliedRef.current = currentTemplateKey; // 记录具体的模板标识
            toast.success(`已应用模板：${templateTitle}`);
          }
        }
    } else if (!searchParams.get('template')) {
      // 如果没有模板参数，清除标识
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
    // 添加调试信息
    console.log('认证状态:', { isAuthenticated, user });
    console.log('Token:', localStorage.getItem('auth_token'));
    
    if (!prompt.trim()) {
      toast.error('请输入描述文本');
      return;
    }

    if (!isAuthenticated) {
      toast.error('请先登录后再进行创作');
      return;
    }

    try {
      const params: any = {
        watermark,
        referenceImage
      };
      
      // 如果是视频类型，添加视频专用参数
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
      // 显示具体的错误信息
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      toast.error(errorMessage);
    }
  };

  const handleDownload = (specificUrl?: string, index?: number) => {
    if (!currentGeneration) {
      toast.error('下载失败：无效的内容');
      return;
    }

    const fileType = currentGeneration.type === 'video' ? 'mp4' : 'jpg';
    const fileId = currentGeneration.id || 'unknown';

    // 如果指定了特定URL，下载单个文件
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

    // 批量下载或单个文件下载
    const urls = currentGeneration.urls || (currentGeneration.url ? [currentGeneration.url] : []);
    
    if (urls.length === 0) {
      toast.error('下载失败：无效的文件链接');
      return;
    }

    if (urls.length === 1) {
      // 单个文件下载
      const link = document.createElement('a');
      link.href = urls[0];
      link.download = `textvision-${fileId}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('下载开始');
    } else {
      // 批量下载
      urls.forEach((url, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = url;
          link.download = `textvision-${fileId}-${index + 1}.${fileType}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500); // 每个文件间隔500ms下载，避免浏览器阻止
      });
      toast.success(`开始下载${urls.length}个文件`);
    }
  };

  const handleShare = async () => {
    if (!currentGeneration || !currentGeneration.url) {
      toast.error('分享失败：无效的内容链接');
      return;
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: '文生视界 - 我的创作',
          text: currentGeneration.prompt || '精彩创作内容',
          url: currentGeneration.url
        });
      } else {
        await navigator.clipboard.writeText(currentGeneration.url);
        toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(currentGeneration.url);
        toast.success('链接已复制到剪贴板');
      } catch (clipboardError) {
        toast.error('分享失败：无法访问剪贴板');
      }
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI创作工坊
          </h1>
          <p className="text-xl text-gray-600">
            将您的想象力转化为令人惊艳的视觉作品
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="space-y-6">
            {/* 文本输入 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
                描述您的创意
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请详细描述您想要生成的内容，例如：一只可爱的小猫坐在彩虹桥上，背景是梦幻的星空..."
                className="w-full h-32 p-4 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {prompt.length}/500 字符
                </span>
                <button
                  onClick={() => setPrompt('')}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  清空
                </button>
              </div>
            </motion.div>

            {/* 参考图片上传 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-purple-600" />
                参考图片 (可选)
              </h2>
              
              {referenceImage ? (
                <div className="relative">
                  <img
                    src={referenceImage}
                    alt="参考图片"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">点击上传参考图片</p>
                  <p className="text-sm text-gray-500">支持 JPG、PNG 格式，最大 10MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.div>

            {/* 生成设置 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                生成设置
              </h2>
              
              <div className="space-y-6">
                {/* 类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    生成类型
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setType('image')}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                        type === 'image'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-medium">图片</span>
                    </button>
                    <button
                      onClick={() => setType('video')}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                        type === 'video'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                      <span className="font-medium">视频</span>
                    </button>
                  </div>
                </div>

                {/* 水印选项 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="watermark" className="text-sm font-medium text-gray-700">
                        添加水印
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        在生成的内容上添加平台标识
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 视频专用参数 */}
            {type === 'video' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-600" />
                  视频生成参数
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* 分辨率选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分辨率
                      </label>
                      <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {resolutionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 时长选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        视频时长
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {durationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 比例选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        视频比例
                      </label>
                      <select
                        value={ratio}
                        onChange={(e) => setRatio(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {ratioOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 帧率设置 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        帧率 (FPS)
                      </label>
                      <input
                        type="number"
                        value={fps}
                        onChange={(e) => setFps(Number(e.target.value))}
                        min="12"
                        max="60"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* CFG Scale */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CFG Scale ({cfgScale})
                      </label>
                      <input
                        type="range"
                        value={cfgScale}
                        onChange={(e) => setCfgScale(Number(e.target.value))}
                        min="1"
                        max="20"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>20</span>
                      </div>
                    </div>

                    {/* 生成数量 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        生成数量
                      </label>
                      <select
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value={1}>1个</option>
                        <option value={2}>2个</option>
                        <option value={3}>3个</option>
                        <option value={4}>4个</option>
                      </select>
                    </div>
                  </div>

                  {/* 固定摄像头选项 */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="cameraFixed"
                      checked={cameraFixed}
                      onChange={(e) => setCameraFixed(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="cameraFixed" className="text-sm font-medium text-gray-700">
                      固定摄像头 (减少镜头运动)
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 首帧和尾帧图片上传 */}
            {type === 'video' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                  图生视频
                </h2>
                
                <div className="space-y-4">
                  {/* 首帧图片 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      首帧图片 (可选)
                    </label>
                    {firstFrameImage ? (
                      <div className="relative">
                        <img
                          src={firstFrameImage}
                          alt="首帧图片"
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => setFirstFrameImage(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => firstFrameInputRef.current?.click()}
                        className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                      >
                        <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">点击上传首帧图片</p>
                        <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 等格式，最大 30MB</p>
                      </div>
                    )}
                    <input
                      ref={firstFrameInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFirstFrameUpload}
                      className="hidden"
                    />
                  </div>

                  {/* 尾帧图片 */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        尾帧图片 (可选)
                      </label>
                      {lastFrameImage ? (
                        <div className="relative">
                          <img
                            src={lastFrameImage}
                            alt="尾帧图片"
                            className="w-full h-32 object-cover rounded-xl"
                          />
                          <button
                            onClick={() => setLastFrameImage(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => lastFrameInputRef.current?.click()}
                          className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                        >
                          <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">点击上传尾帧图片</p>
                          <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 等格式，最大 30MB</p>
                        </div>
                      )}
                      <input
                        ref={lastFrameInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLastFrameUpload}
                        className="hidden"
                      />
                    </div>
                </div>
              </motion.div>
            )}

            {/* 生成按钮 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isGenerating ? '生成中...' : '开始生成'}</span>
            </motion.button>
          </div>

          {/* 结果展示区域 */}
          <div className="lg:sticky lg:top-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 h-fit"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                生成结果
              </h2>
              
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-purple-600 font-medium">AI正在为您创作...</p>
                      <p className="text-sm text-gray-500 mt-2">预计需要 30-60 秒</p>
                    </div>
                  </motion.div>
                ) : currentGeneration ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    {/* 多个结果的网格布局 */}
                    {currentGeneration.urls && currentGeneration.urls.length > 1 ? (
                      <div className={`grid gap-3 ${
                        currentGeneration.urls.length === 2 ? 'grid-cols-1' : 
                        currentGeneration.urls.length === 3 ? 'grid-cols-1' : 
                        'grid-cols-2'
                      }`}>
                        {currentGeneration.urls.map((url, index) => (
                          <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                            {currentGeneration.status === 'completed' && url ? (
                              currentGeneration.type === 'video' ? (
                                <video
                                  src={url}
                                  className="w-full h-full object-cover"
                                  controls
                                  poster={currentGeneration.thumbnails?.[index]}
                                  onError={(e) => {
                                    const target = e.target as HTMLVideoElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt={`${currentGeneration.prompt || '生成结果'} ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              )
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
                                  <p className="text-purple-600 text-sm font-medium">生成中...</p>
                                </div>
                              </div>
                            )}
                            {currentGeneration.type === 'video' && currentGeneration.status !== 'completed' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/50 rounded-full p-2">
                                  <Video className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            )}
                            {/* 序号标识 */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                            {/* 下载按钮 */}
                            {currentGeneration.status === 'completed' && url && (
                              <button
                                onClick={() => handleDownload(url, index)}
                                className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                                title="下载"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* 单个结果的显示 */
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        {currentGeneration.status === 'completed' && (currentGeneration.url || (currentGeneration.urls && currentGeneration.urls[0])) ? (
                          currentGeneration.type === 'video' ? (
                            <video
                              src={currentGeneration.url || currentGeneration.urls?.[0]}
                              className="w-full h-full object-cover"
                              controls
                              poster={currentGeneration.thumbnail || currentGeneration.thumbnails?.[0]}
                              onError={(e) => {
                                const target = e.target as HTMLVideoElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <img
                              src={currentGeneration.url || currentGeneration.urls?.[0]}
                              alt={currentGeneration.prompt || '生成结果'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                              <p className="text-purple-600 font-medium">生成中...</p>
                              <p className="text-sm text-gray-500 mt-1">请稍候</p>
                            </div>
                          </div>
                        )}
                        {currentGeneration.type === 'video' && currentGeneration.status !== 'completed' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-3">
                              <Video className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <p className="text-gray-700 mb-4">
                        <strong>提示词：</strong>{currentGeneration.prompt || '无描述'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {currentGeneration.type === 'video' ? '视频' : '图片'}
                        {currentGeneration.urls && currentGeneration.urls.length > 1 && (
                          <span> • 共{currentGeneration.urls.length}个</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownload()}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>{currentGeneration.urls && currentGeneration.urls.length > 1 ? '下载全部' : '下载'}</span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>分享</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center text-gray-500">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>您的创作将在这里显示</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}