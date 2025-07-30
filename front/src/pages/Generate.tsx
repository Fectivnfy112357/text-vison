import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI创作工坊
          </h1>
          <p className="text-xl text-gray-600">
            将您的想象力转化为令人惊艳的视觉作品
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* 左侧生成结果区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 生成结果展示区域 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                生成结果
              </h2>
              
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {/* 显示最多4个结果，每个单独一行 */}
                  {history.slice(0, 4).map((generation, genIndex) => (
                    <motion.div 
                      key={generation.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: genIndex * 0.1 }}
                      className="border border-gray-200 rounded-xl p-3 bg-gray-50 hover:shadow-md transition-shadow"
                    >
                      {/* 生成状态指示 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            generation.status === 'generating' ? 'bg-yellow-500 animate-pulse' :
                            generation.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                            genIndex === 0 ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-xs font-medium text-gray-700">
                            {generation.status === 'generating' ? '生成中' :
                             generation.status === 'processing' ? '处理中' :
                             genIndex === 0 ? '最新' : `历史${genIndex + 1}`}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {generation.type === 'image' ? '图片' : '视频'}
                        </span>
                      </div>

                      {/* 提示词 */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{generation.prompt}</p>
                      </div>

                      {/* 结果展示 */}
                      {generation.status === 'generating' || generation.status === 'processing' ? (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-100 rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
                          <p className="text-xs text-gray-500">
                            {generation.status === 'generating' ? '正在生成...' : '正在处理...'}
                          </p>
                        </div>
                      ) : generation.urls && generation.urls.length > 0 ? (
                        <div className="space-y-2">
                          {generation.urls.slice(0, 1).map((url, index) => (
                            <div key={index} className="relative group">
                              {generation.type === 'video' ? (
                                <video
                                  src={url}
                                  controls
                                  className="w-full aspect-video object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                  poster={generation.thumbnails?.[index]}
                                />
                              ) : (
                                <img
                                  src={url}
                                  alt={`生成结果 ${index + 1}`}
                                  className="w-full aspect-square object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                />
                              )}
                              
                              {/* 操作按钮 */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                <button
                                  onClick={() => handleDownload(url, index)}
                                  className="bg-black bg-opacity-70 text-white p-1.5 rounded-lg hover:bg-opacity-90 transition-all backdrop-blur-sm"
                                  title="下载"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleShare(url)}
                                  className="bg-black bg-opacity-70 text-white p-1.5 rounded-lg hover:bg-opacity-90 transition-all backdrop-blur-sm"
                                  title="分享"
                                >
                                  <Share2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {generation.urls.length > 1 && (
                            <p className="text-xs text-gray-500 text-center">+{generation.urls.length - 1} 更多</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8 bg-gray-100 rounded-lg">
                          <div className="text-center">
                            <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">等待结果</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* 如果结果少于4个，显示空白占位 */}
                  {Array.from({ length: Math.max(0, 4 - history.length) }).map((_, index) => (
                    <div key={`empty-${index}`} className="border-2 border-dashed border-gray-200 rounded-xl p-3 bg-gray-50">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">等待生成</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="border-2 border-dashed border-gray-200 rounded-xl p-3 bg-gray-50">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">等待生成</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* 中间输入区域 */}
          <div className="lg:col-span-2 space-y-6">
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
                参考图片
              </h2>
              
              {referenceImage ? (
                <div className="relative">
                  <img
                    src={referenceImage}
                    alt="参考图片"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm mb-1">点击上传参考图片</p>
                  <p className="text-xs text-gray-500">JPG、PNG，最大10MB</p>
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

            {/* 图片专用参数 */}
            {type === 'image' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
                  图片生成参数
                </h2>
                  
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* 尺寸选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片尺寸
                    </label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="1024x1024">正方形 (1024x1024)</option>
                      <option value="1152x896">横屏 (1152x896)</option>
                      <option value="896x1152">竖屏 (896x1152)</option>
                      <option value="1216x832">宽屏 (1216x832)</option>
                      <option value="832x1216">长屏 (832x1216)</option>
                    </select>
                  </div>

                  {/* 艺术风格 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      艺术风格
                    </label>
                    <input
                      type="text"
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      placeholder="如：油画、水彩、卡通等"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* 图片质量 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片质量
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="standard">标准质量</option>
                      <option value="hd">高清质量</option>
                    </select>
                  </div>

                  {/* 返回格式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      返回格式
                    </label>
                    <select
                      value={responseFormat}
                      onChange={(e) => setResponseFormat(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="url">图片链接</option>
                      <option value="b64_json">Base64编码</option>
                    </select>
                  </div>

                  {/* 随机数种子 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      随机数种子 (可选)
                    </label>
                    <input
                      type="number"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                      min="-1"
                      max="2147483647"
                      placeholder="-1 到 2147483647"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* 引导比例 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      引导比例 (可选)
                    </label>
                    <input
                      type="number"
                      value={guidanceScale || ''}
                      onChange={(e) => setGuidanceScale(e.target.value ? Number(e.target.value) : undefined)}
                      min="1"
                      max="10"
                      step="0.1"
                      placeholder="1.0 到 10.0"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* 视频专用参数 */}
            {type === 'video' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-purple-600" />
                  视频生成参数
                </h2>
                  
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* 分辨率选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分辨率
                    </label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 比例选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      画面比例
                    </label>
                    <select
                      value={ratio}
                      onChange={(e) => setRatio(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      {ratioOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 帧率 */}
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
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* CFG Scale */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CFG Scale (7)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={cfgScale}
                      onChange={(e) => setCfgScale(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* 生成数量 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      生成数量
                    </label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value={1}>1个</option>
                      <option value={2}>2个</option>
                      <option value={3}>3个</option>
                      <option value={4}>4个</option>
                    </select>
                  </div>
                </div>

                {/* 固定摄像头选项 */}
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="cameraFixed" className="text-sm font-medium text-gray-700">
                        固定摄像头 (减少镜头运动)
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        启用后视频画面更稳定，适合静态场景
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="cameraFixed"
                        checked={cameraFixed}
                        onChange={(e) => setCameraFixed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* 首帧和尾帧图片 */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* 首帧图片 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      首帧图片
                    </label>
                    {firstFrameImage ? (
                      <div className="relative">
                        <img
                          src={firstFrameImage}
                          alt="首帧图片"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setFirstFrameImage(null)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => firstFrameInputRef.current?.click()}
                        className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all h-24 flex flex-col justify-center"
                      >
                        <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <p className="text-gray-600 text-xs">上传首帧图片</p>
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
                      尾帧图片
                    </label>
                    {lastFrameImage ? (
                      <div className="relative">
                        <img
                          src={lastFrameImage}
                          alt="尾帧图片"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setLastFrameImage(null)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => lastFrameInputRef.current?.click()}
                        className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all h-24 flex flex-col justify-center"
                      >
                        <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <p className="text-gray-600 text-xs">上传尾帧图片</p>
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


          </div>

          {/* 右侧参数设置 */}
          <div className="space-y-6">
            {/* 生成设置 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                生成设置
              </h2>
              
              <div className="space-y-4">
                {/* 类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生成类型
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setType('image')}
                      className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        type === 'image'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="font-medium">图片</span>
                    </button>
                    <button
                      onClick={() => setType('video')}
                      className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                        type === 'video'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span className="font-medium">视频</span>
                    </button>
                  </div>
                </div>

                {/* 水印选项 */}
                <div className="bg-gray-50 rounded-lg p-3">
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
                
                {/* 生成按钮 */}
                <motion.button
                  id="generate-button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{isGenerating ? '生成中...' : '开始生成'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}