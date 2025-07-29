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
  const [size, setSize] = useState('landscape_16_9');
  const [style, setStyle] = useState('写实风格');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const { templates } = useTemplateStore();
  const templateAppliedRef = useRef(false);
  
  const { generateContent, isGenerating, currentGeneration } = useGenerationStore();
  const { isAuthenticated, user } = useAuthStore();

  const sizeOptions = [
    { value: 'square', label: '正方形 (1:1)' },
    { value: 'landscape_16_9', label: '横屏 (16:9)' },
    { value: 'landscape_4_3', label: '横屏 (4:3)' },
    { value: 'portrait_4_3', label: '竖屏 (4:3)' },
    { value: 'portrait_16_9', label: '竖屏 (16:9)' }
  ];

  const styleOptions = [
    '写实风格', '卡通风格', '水墨风格', '油画风格', '素描风格', 
    '赛博朋克', '蒸汽朋克', '极简主义', '抽象艺术', '超现实主义'
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
          setSize(template.size || 'landscape_16_9');
          setStyle(template.style || '默认风格');
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

  const handleGenerate = async () => {
    // 添加调试信息
    console.log('认证状态:', { isAuthenticated, user });
    console.log('Token:', localStorage.getItem('token'));
    
    if (!prompt.trim()) {
      toast.error('请输入描述文本');
      return;
    }

    if (!isAuthenticated) {
      toast.error('请先登录后再进行创作');
      return;
    }

    try {
      await generateContent(prompt, type, {
        size,
        style,
        referenceImage
      });
      toast.success('生成成功！');
    } catch (error) {
      // 显示具体的错误信息
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (!currentGeneration || !currentGeneration.url) {
      toast.error('下载失败：无效的文件链接');
      return;
    }
    
    const link = document.createElement('a');
    link.href = currentGeneration.url;
    const fileId = currentGeneration.id || 'unknown';
    const fileType = currentGeneration.type === 'video' ? 'mp4' : 'jpg';
    link.download = `textvision-${fileId}.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('下载开始');
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

            {/* 生成参数 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                生成参数
              </h2>
              
              <div className="space-y-4">
                {/* 类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生成类型
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setType('image')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        type === 'image'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>图片</span>
                    </button>
                    <button
                      onClick={() => setType('video')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        type === 'video'
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>视频</span>
                    </button>
                  </div>
                </div>

                {/* 尺寸选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尺寸比例
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 风格选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    艺术风格
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {styleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

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
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      <img
                        src={currentGeneration.url || '/placeholder-generation.png'}
                        alt={currentGeneration.prompt || '生成结果'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-generation.png';
                        }}
                      />
                      {currentGeneration.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-700 mb-4">
                      <strong>提示词：</strong>{currentGeneration.prompt || '无描述'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentGeneration.type === 'video' ? '视频' : '图片'} • {currentGeneration.style || '默认风格'} • {currentGeneration.size || '未知尺寸'}
                    </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDownload}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>下载</span>
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