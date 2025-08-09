import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Image, 
  Video, 
  Settings, 
  Upload, 
  X, 
  ChevronDown,
  Palette,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react'
import { useGenerationStore } from '../store/useGenerationStore'
import { useArtStyleStore } from '../store/useArtStyleStore'
import { useAuthStore } from '../store/useAuthStore'
import { ImageGenerationParams, VideoGenerationParams, Template } from '../lib/api'
import { toast } from 'sonner'

type GenerationType = 'image' | 'video'

const Create: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { generateContent, isGenerating, currentGeneration } = useGenerationStore()
  const { artStyles, selectedStyle, isLoading: stylesLoading, error: stylesError, loadArtStyles, setSelectedStyle, clearError } = useArtStyleStore()
  const { isAuthenticated } = useAuthStore()

  // 状态管理
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<GenerationType>('image')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [watermark, setWatermark] = useState(true)

  // 图片参数
  const [imageParams, setImageParams] = useState<ImageGenerationParams>({
    prompt: '',
    size: '1024x1024',
    quality: 'standard',
    responseFormat: 'url',
    seed: undefined,
    guidanceScale: 7.5,
    watermark: true,
    type: 'image',
    style: undefined,
    styleId: undefined,
    templateId: undefined,
  })

  // 视频参数
  const [videoParams, setVideoParams] = useState<VideoGenerationParams>({
    prompt: '',
    resolution: '720p',
    duration: 5,
    ratio: '16:9',
    fps: 24,
    cameraFixed: false,
    cfgScale: 7.5,
    count: 1,
    watermark: true,
    type: 'video',
    style: undefined,
    styleId: undefined,
    templateId: undefined,
    model: 'doubao-seedance-pronew',
    firstFrameImage: undefined,
    lastFrameImage: undefined,
    hd: false,
  })

  // 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // 加载艺术风格数据
    loadArtStyles()

    // 处理路由状态
    const state = location.state as any
    if (state?.type) {
      setType(state.type)
    }
    if (state?.template) {
      const template = state.template as Template
      setPrompt(template.prompt)
    }
  }, [isAuthenticated, location.state, loadArtStyles])

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        toast.error('文件大小不能超过10MB')
        return
      }
      setReferenceImage(file)
    }
  }

  // 生成内容
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入创作描述')
      return
    }

    const options = type === 'image' 
      ? { 
          ...imageParams, 
          prompt, 
          watermark, 
          referenceImage: referenceImage?.name,
          styleId: selectedStyle?.id,
          style: selectedStyle?.name
        }
      : { 
          ...videoParams, 
          prompt, 
          watermark, 
          referenceImage: referenceImage?.name,
          styleId: selectedStyle?.id,
          style: selectedStyle?.name
        }

    await generateContent({
      prompt,
      type,
      style: selectedStyle?.id?.toString(),
      options,
    })
  }

  // 下载结果
  const handleDownload = () => {
    if (currentGeneration?.url) {
      const link = document.createElement('a')
      link.href = currentGeneration.url
      link.download = `generated-${type}-${Date.now()}`
      link.click()
    }
  }

  // 分享结果
  const handleShare = async () => {
    if (currentGeneration?.url && navigator.share) {
      try {
        await navigator.share({
          title: '我的AI创作',
          text: prompt,
          url: currentGeneration.url,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    }
  }

  // 如果未认证，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-primary-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">未登录</h3>
            <p className="text-sm text-gray-500 mb-8">登录后开始AI创作之旅</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
      {/* 头部 */}
      <motion.div 
        className="safe-area-top px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-white/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">AI创作</h1>
        <div className="w-10" />
      </motion.div>

      {/* 主内容 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-6 py-6 space-y-6">
          {/* 类型选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-medium text-gray-700 mb-3">创作类型</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType('image')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  type === 'image'
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-white/50'
                }`}
              >
                <Image className={`mx-auto mb-2 ${type === 'image' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                <span className={`text-sm font-medium ${type === 'image' ? 'text-primary-600' : 'text-gray-600'}`}>
                  图片生成
                </span>
              </button>
              <button
                onClick={() => setType('video')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  type === 'video'
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-white/50'
                }`}
              >
                <Video className={`mx-auto mb-2 ${type === 'video' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                <span className={`text-sm font-medium ${type === 'video' ? 'text-primary-600' : 'text-gray-600'}`}>
                  视频生成
                </span>
              </button>
            </div>
          </motion.div>

          {/* 创作描述 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-medium text-gray-700 mb-3">创作描述</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`描述你想要生成的${type === 'image' ? '图片' : '视频'}...`}
              className="input-soft w-full h-24 resize-none text-gray-900 placeholder-gray-500"
            />
          </motion.div>

          {/* 艺术风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-medium text-gray-700 mb-3">艺术风格</h2>
            <button
              onClick={() => {
                if (stylesError) {
                  clearError()
                  loadArtStyles()
                }
                setShowStylePicker(!showStylePicker)
              }}
              className="w-full input-soft flex items-center justify-between p-3"
              disabled={stylesLoading}
            >
              <div className="flex items-center space-x-2">
                <Palette size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {stylesLoading ? '加载中...' : 
                   stylesError ? '加载失败，点击重试' :
                   selectedStyle ? selectedStyle.name : '选择风格'}
                </span>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            
            <AnimatePresence>
              {showStylePicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide"
                >
                  {stylesLoading ? (
                    <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                        <span>加载风格中...</span>
                      </div>
                    </div>
                  ) : stylesError ? (
                    <div className="col-span-2 text-center py-4">
                      <div className="text-red-500 text-sm mb-2">加载失败</div>
                      <button
                        onClick={() => {
                          clearError()
                          loadArtStyles()
                        }}
                        className="text-primary-500 text-sm hover:text-primary-600"
                      >
                        点击重试
                      </button>
                    </div>
                  ) : Array.isArray(artStyles) && artStyles.length > 0 ? (
                    artStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style)
                          setShowStylePicker(false)
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedStyle?.id === style.id
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-gray-200 bg-white/50'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-800">{style.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                      暂无可用风格
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 参考图片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-medium text-gray-700 mb-3">参考图片（可选）</h2>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="reference-upload"
              />
              <label
                htmlFor="reference-upload"
                className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-primary-300 transition-colors"
              >
                {referenceImage ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{referenceImage.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setReferenceImage(null)
                      }}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                    <span className="text-sm text-gray-500">点击上传参考图片</span>
                  </div>
                )}
              </label>
            </div>
          </motion.div>

          {/* 高级设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3"
            >
              <Settings size={16} />
              <span>高级设置</span>
              <ChevronDown 
                size={16} 
                className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 card-soft p-4"
                >
                  {type === 'image' ? (
                    <>
                      {/* 图片尺寸 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
                        <select
                          value={imageParams.size}
                          onChange={(e) => setImageParams(prev => ({ ...prev, size: e.target.value }))}
                          className="input-soft w-full"
                        >
                          <option value="1024x1024">1024x1024 (正方形)</option>
                          <option value="1024x1792">1024x1792 (竖版)</option>
                          <option value="1792x1024">1792x1024 (横版)</option>
                        </select>
                      </div>
                      
                      {/* 图片质量 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">质量</label>
                        <select
                          value={imageParams.quality}
                          onChange={(e) => setImageParams(prev => ({ ...prev, quality: e.target.value }))}
                          className="input-soft w-full"
                        >
                          <option value="standard">标准</option>
                          <option value="hd">高清</option>
                        </select>
                      </div>
                      
                      {/* 引导比例 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          引导比例: {imageParams.guidanceScale}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="0.5"
                          value={imageParams.guidanceScale}
                          onChange={(e) => setImageParams(prev => ({ 
                            ...prev, 
                            guidanceScale: parseFloat(e.target.value) 
                          }))}
                          className="w-full"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 视频分辨率 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">分辨率</label>
                        <select
                          value={videoParams.resolution}
                          onChange={(e) => setVideoParams(prev => ({ ...prev, resolution: e.target.value }))}
                          className="input-soft w-full"
                        >
                          <option value="1280x720">1280x720 (720p)</option>
                          <option value="1920x1080">1920x1080 (1080p)</option>
                          <option value="3840x2160">3840x2160 (4K)</option>
                        </select>
                      </div>
                      
                      {/* 视频时长 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          时长: {videoParams.duration}秒
                        </label>
                        <input
                          type="range"
                          min="3"
                          max="30"
                          value={videoParams.duration}
                          onChange={(e) => setVideoParams(prev => ({ 
                            ...prev, 
                            duration: parseInt(e.target.value) 
                          }))}
                          className="w-full"
                        />
                      </div>
                      
                      {/* 画面比例 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">画面比例</label>
                        <select
                          value={videoParams.ratio}
                          onChange={(e) => setVideoParams(prev => ({ ...prev, ratio: e.target.value }))}
                          className="input-soft w-full"
                        >
                          <option value="16:9">16:9 (横屏)</option>
                          <option value="9:16">9:16 (竖屏)</option>
                          <option value="1:1">1:1 (正方形)</option>
                        </select>
                      </div>
                      
                      {/* 帧率 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">帧率</label>
                        <select
                          value={videoParams.fps}
                          onChange={(e) => setVideoParams(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                          className="input-soft w-full"
                        >
                          <option value={24}>24 FPS</option>
                          <option value={30}>30 FPS</option>
                          <option value={60}>60 FPS</option>
                        </select>
                      </div>
                      
                      {/* 固定摄像头 */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">固定摄像头</label>
                        <button
                          onClick={() => setVideoParams(prev => ({ ...prev, cameraFixed: !prev.cameraFixed }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            videoParams.cameraFixed ? 'bg-primary-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              videoParams.cameraFixed ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* 视频模型 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">生成模型</label>
                        <select
                          value={videoParams.model}
                          onChange={(e) => setVideoParams(prev => ({ ...prev, model: e.target.value }))}
                          className="input-soft w-full"
                        >
                          <option value="doubao-seedance-pronew">豆包-Seedance Pro</option>
                          <option value="doubao-seedance-1-0-lite-t2v">豆包-Seedance Lite T2V</option>
                          <option value="doubao-seedance-1-0-lite-i2v">豆包-Seedance Lite I2V</option>
                          <option value="doubao-seaweed">豆包-Seaweed</option>
                          <option value="wan2-1-14b-t2v">Wan2 T2V</option>
                          <option value="wan2-1-14b-i2v">Wan2 I2V</option>
                        </select>
                      </div>
                      
                      {/* 高清模式 */}
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">高清模式</label>
                        <button
                          onClick={() => setVideoParams(prev => ({ ...prev, hd: !prev.hd }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            videoParams.hd ? 'bg-primary-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              videoParams.hd ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* 水印设置 */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">添加水印</label>
                    <button
                      onClick={() => setWatermark(!watermark)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        watermark ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          watermark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 生成按钮 */}
          <motion.button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl font-semibold btn-jelly shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>生成中...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles size={20} />
                <span>开始生成</span>
              </div>
            )}
          </motion.button>

          {/* 生成结果 */}
          {currentGeneration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-soft p-4"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-3">生成结果</h3>
              
              {currentGeneration.status === 'completed' && currentGeneration.url ? (
                <div>
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                    {type === 'image' ? (
                      <img 
                        src={currentGeneration.url} 
                        alt="Generated content"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg'
                        }}
                      />
                    ) : (
                      <video 
                        src={currentGeneration.url} 
                        poster={currentGeneration.thumbnail}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium flex items-center justify-center space-x-2"
                    >
                      <Download size={16} />
                      <span>下载</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 bg-primary-100 text-primary-700 py-2 px-4 rounded-xl font-medium flex items-center justify-center space-x-2"
                    >
                      <Share2 size={16} />
                      <span>分享</span>
                    </button>
                  </div>
                </div>
              ) : currentGeneration.status === 'processing' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-600">正在生成中...</p>
                  {currentGeneration.progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${currentGeneration.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{currentGeneration.progress}%</p>
                    </div>
                  )}
                </div>
              ) : currentGeneration.status === 'failed' ? (
                <div className="text-center py-8">
                  <p className="text-red-600">生成失败，请重试</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">等待处理...</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Create