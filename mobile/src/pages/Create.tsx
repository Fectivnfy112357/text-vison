import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { JellyButton } from '../motions'
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
  ArrowLeft,
  Wand2,
  Zap,
  RotateCcw,
  Clock,
  Camera,
  Shield,
  Maximize
} from 'lucide-react'
import { useGenerationStore } from '../store/useGenerationStore'
import { useArtStyleStore } from '../store/useArtStyleStore'
import { useAuthStore } from '../store/useAuthStore'
import { GenerateContentRequest, Template } from '../lib/api'
import { toast } from 'sonner'
import CustomSelect from '../components/CustomSelect'
import ButtonSelect from '../components/ButtonSelect'

// 子组件将在后续创建
const TypeSelector = ({ type, onChange }: { type: 'image' | 'video'; onChange: (type: 'image' | 'video') => void }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onChange('image')}
        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          type === 'image'
            ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg'
            : 'border-gray-200 bg-white/50 hover:border-primary-300 hover:shadow-md'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 transition-opacity duration-300 ${
          type === 'image' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`} />
        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
            type === 'image'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-500'
          }`}>
            <Image size={24} />
          </div>
          <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
            type === 'image' ? 'text-primary-700' : 'text-gray-600 group-hover:text-primary-600'
          }`}>
            图片生成
          </h3>
          <p className={`text-xs transition-colors duration-300 ${
            type === 'image' ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-500'
          }`}>
            AI生成精美图片
          </p>
        </div>
      </button>
      
      <button
        onClick={() => onChange('video')}
        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          type === 'video'
            ? 'border-secondary-400 bg-gradient-to-br from-secondary-50 to-secondary-100 shadow-lg'
            : 'border-gray-200 bg-white/50 hover:border-secondary-300 hover:shadow-md'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-primary-500/10 transition-opacity duration-300 ${
          type === 'video' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`} />
        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
            type === 'video'
              ? 'bg-secondary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-400 group-hover:bg-secondary-100 group-hover:text-secondary-500'
          }`}>
            <Video size={24} />
          </div>
          <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
            type === 'video' ? 'text-secondary-700' : 'text-gray-600 group-hover:text-secondary-600'
          }`}>
            视频生成
          </h3>
          <p className={`text-xs transition-colors duration-300 ${
            type === 'video' ? 'text-secondary-600' : 'text-gray-500 group-hover:text-secondary-500'
          }`}>
            AI创作动态视频
          </p>
        </div>
      </button>
    </div>
  )
}

const StylePicker = ({ 
  selectedStyle, 
  onSelect, 
  styles, 
  isLoading, 
  error, 
  onRetry 
}: {
  selectedStyle: any
  onSelect: (style: any) => void
  styles: any[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group relative p-4 rounded-2xl border-2 border-gray-200 bg-white/50 hover:border-primary-300 hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <Palette size={20} className="text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-700">艺术风格</p>
              <p className="text-sm text-gray-500">
                {isLoading ? '加载中...' : 
                 error ? '加载失败，点击重试' :
                 selectedStyle ? selectedStyle.name : '选择风格'}
              </p>
            </div>
          </div>
          <ChevronDown 
            size={20} 
            className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-hide p-1"
          >
            {isLoading ? (
              <div className="col-span-2 flex items-center justify-center py-8">
                <div className="flex items-center space-x-3 text-gray-500">
                  <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
                  <span>加载风格中...</span>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 space-y-3">
                <p className="text-red-500 text-sm">加载失败</p>
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600 transition-colors"
                >
                  重试
                </button>
              </div>
            ) : styles.length > 0 ? (
              styles.map((style) => (
                <motion.button
                  key={style.id}
                  onClick={() => {
                    onSelect(style)
                    setIsOpen(false)
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    selectedStyle?.id === style.id
                      ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md'
                      : 'border-gray-200 bg-white/50 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <h4 className={`font-medium mb-1 ${
                    selectedStyle?.id === style.id ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {style.name}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${
                    selectedStyle?.id === style.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {style.description}
                  </p>
                </motion.button>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center py-8">
                <p className="text-gray-500 text-sm">暂无可用风格</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FileUploader = ({ 
  file, 
  onFileChange, 
  onRemove 
}: { 
  file: File | null
  onFileChange: (file: File) => void
  onRemove: () => void
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB限制
        toast.error('文件大小不能超过10MB')
        return
      }
      onFileChange(file)
    }
  }

  return (
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
        className="block group relative p-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all duration-300"
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Image size={20} className="text-primary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-700">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                onRemove()
              }}
              className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 group-hover:text-primary-600 transition-all duration-300">
              <Upload size={24} className="text-gray-400 group-hover:text-primary-600" />
            </div>
            <p className="text-gray-600 font-medium mb-1">上传参考图片</p>
            <p className="text-sm text-gray-500">支持 JPG, PNG 格式，最大 10MB</p>
          </div>
        )}
      </label>
    </div>
  )
}

const Create: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { generateContent, isGenerating, currentGeneration, destroy } = useGenerationStore()
  const { artStyles, selectedStyle, isLoading: stylesLoading, error: stylesError, loadArtStyles, setSelectedStyle, clearError } = useArtStyleStore()
  const { isAuthenticated } = useAuthStore()

  // 状态管理
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<'image' | 'video'>('image')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [watermark, setWatermark] = useState(true)

  // 生成参数
  const [generateParams, setGenerateParams] = useState<GenerateContentRequest>({
    type: 'image',
    prompt: '',
    watermark: true,
    size: '1024x1024',
    quality: 'standard',
    responseFormat: 'url',
    seed: -1,
    guidanceScale: 7.5,
    resolution: '720p',
    duration: 5,
    ratio: '16:9',
    fps: 24,
    cameraFixed: false,
    cfgScale: 7.5,
    firstFrameImage: undefined,
    lastFrameImage: undefined,
    hd: false,
  })

  // 初始化
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    loadArtStyles()

    // 处理路由状态
    const state = location.state as any
    if (state?.type) {
      setType(state.type)
      setGenerateParams(prev => ({ ...prev, type: state.type }))
    }
    if (state?.template) {
      const template = state.template as Template
      setPrompt(template.prompt)
      setGenerateParams(prev => ({ 
        ...prev, 
        prompt: template.prompt,
        templateId: template.id,
        style: template.category,
        styleId: undefined // 如果模板有特定风格ID，可以在这里设置
      }))
    }
    
    // 组件卸载时清理轮询
    return () => {
      destroy()
    }
  }, [isAuthenticated, location.state, loadArtStyles, destroy])

  // 处理参数变化
  const updateParam = (key: keyof GenerateContentRequest, value: any) => {
    setGenerateParams(prev => ({ ...prev, [key]: value }))
  }

  // 表单验证
  const validateForm = (): string | null => {
    if (!prompt.trim()) {
      return '请输入创作描述'
    }
    
    if (prompt.trim().length > 1000) {
      return '描述长度不能超过1000字符'
    }
    
    if (type === 'image') {
      if (!generateParams.size) {
        return '请选择图片尺寸'
      }
      if (!generateParams.quality) {
        return '请选择图片质量'
      }
    } else {
      if (!generateParams.resolution) {
        return '请选择视频分辨率'
      }
      if (!generateParams.duration) {
        return '请选择视频时长'
      }
      if (!generateParams.ratio) {
        return '请选择视频比例'
      }
    }
    
    return null
  }

  // 生成内容
  const handleGenerate = async () => {
    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    const request: GenerateContentRequest = {
      ...generateParams,
      prompt: prompt.trim(),
      type,
      watermark,
      styleId: selectedStyle?.id,
      style: selectedStyle?.name,
    }

    // 处理参考图片
    if (referenceImage) {
      // 在实际应用中，这里应该先上传图片获取URL
      request.referenceImage = referenceImage.name
    }

    // 参数清理 - 根据类型移除不需要的参数
    if (type === 'image') {
      delete request.resolution
      delete request.duration
      delete request.ratio
      delete request.fps
      delete request.cameraFixed
      delete request.cfgScale
      delete request.firstFrameImage
      delete request.lastFrameImage
      delete request.hd
    } else {
      delete request.size
      delete request.quality
      delete request.responseFormat
      delete request.seed
      delete request.guidanceScale
    }

    await generateContent(request)
  }

  // 重置表单
  const handleReset = () => {
    setPrompt('')
    setReferenceImage(null)
    setSelectedStyle(null)
    setShowAdvanced(false)
    setWatermark(true)
    setType('image')
    setGenerateParams({
      type: 'image',
      prompt: '',
      watermark: true,
      size: '1024x1024',
      quality: 'standard',
      responseFormat: 'url',
      seed: -1,
      guidanceScale: 7.5,
      resolution: '720p',
      duration: 5,
      ratio: '16:9',
      fps: 24,
      cameraFixed: false,
      cfgScale: 7.5,
      firstFrameImage: undefined,
      lastFrameImage: undefined,
      hd: false,
    })
    toast.success('表单已重置')
  }

  // 如果未认证，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <div className="text-center max-w-sm w-full px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-primary-500" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">开始AI创作之旅</h3>
          <p className="text-gray-600 mb-8">登录后即可使用AI生成精美的图片和视频内容</p>
          <button
            onClick={() => navigate('/login')}
            className="w-3/4 mx-auto px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold"
          >
            立即登录
          </button>
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
          className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-md transition-all duration-300"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          AI创作工坊
        </h1>
        <button 
          onClick={handleReset}
          className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-md transition-all duration-300"
        >
          <RotateCcw size={20} className="text-gray-600" />
        </button>
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
            <TypeSelector type={type} onChange={(newType) => {
              setType(newType)
              updateParam('type', newType)
            }} />
          </motion.div>

          {/* 创作描述 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <Wand2 size={16} className="text-primary-500" />
                <span className="font-medium text-gray-700">创作描述</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`描述你想要生成的${type === 'image' ? '图片' : '视频'}，比如：一只可爱的小猫在花园里玩耍...`}
                className="w-full h-32 p-4 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm resize-none text-gray-900 placeholder-gray-500 focus:border-primary-300 focus:bg-white transition-all duration-300"
              />
              <div className="text-right">
                <span className={`text-sm ${prompt.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                  {prompt.length}/1000
                </span>
              </div>
            </div>
          </motion.div>

          {/* 艺术风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StylePicker
              selectedStyle={selectedStyle}
              onSelect={setSelectedStyle}
              styles={artStyles}
              isLoading={stylesLoading}
              error={stylesError}
              onRetry={() => {
                clearError()
                loadArtStyles()
              }}
            />
          </motion.div>

          {/* 参考图片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <Image size={16} className="text-primary-500" />
                <span className="font-medium text-gray-700">参考图片（可选）</span>
              </label>
              <FileUploader
                file={referenceImage}
                onFileChange={setReferenceImage}
                onRemove={() => setReferenceImage(null)}
              />
            </div>
          </motion.div>

          {/* 高级设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full p-4 rounded-2xl border-2 border-gray-200 bg-white/50 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Settings size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-700">高级设置</p>
                    <p className="text-sm text-gray-500">自定义生成参数</p>
                  </div>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="space-y-4 p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm shadow-lg"
                  >
                    {/* 基础参数卡片 */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Settings size={14} className="text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800">基础参数</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {type === 'image' ? (
                          <>
                            <CustomSelect
                                value={generateParams.size || ''}
                                onChange={(value) => updateParam('size', value)}
                                options={[
                                  { value: "1024x1024", label: "1024×1024", description: "正方形" },
                                  { value: "1024x1792", label: "1024×1792", description: "竖版" },
                                  { value: "1792x1024", label: "1792×1024", description: "横版" }
                                ]}
                                label="尺寸"
                                icon={<Image size={14} className="text-primary-500" />}
                              />
                              
                              <ButtonSelect
                                value={generateParams.quality || ''}
                                onChange={(value) => updateParam('quality', value)}
                                options={[
                                  { value: "standard", label: "标准", description: "普通质量" },
                                  { value: "hd", label: "高清", description: "高质量输出" }
                                ]}
                                label="质量"
                                icon={<Zap size={14} className="text-primary-500" />}
                                columns={2}
                              />
                          </>
                        ) : (
                          <>
                            <CustomSelect
                                value={generateParams.resolution || ''}
                                onChange={(value) => updateParam('resolution', value)}
                                options={[
                                  { value: "720p", label: "720p", description: "标清" },
                                  { value: "1080p", label: "1080p", description: "高清" },
                                  { value: "4K", label: "4K", description: "超高清" }
                                ]}
                                label="分辨率"
                                icon={<Video size={14} className="text-secondary-500" />}
                              />
                              
                              <ButtonSelect
                                value={generateParams.duration || 5}
                                onChange={(value) => updateParam('duration', value)}
                                options={[
                                  { value: 5, label: "5秒", description: "短视频" },
                                  { value: 10, label: "10秒", description: "标准长度" }
                                ]}
                                label="时长"
                                icon={<Clock size={14} className="text-secondary-500" />}
                                columns={2}
                              />
                          </>
                        )}
                      </div>
                    </div>

                    {/* 视频比例（仅视频生成） */}
                    {type === 'video' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center space-x-1">
                            <Maximize size={14} className="text-secondary-500" />
                            <span>画面比例</span>
                          </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { value: '16:9', label: '16:9 横屏' },
                            { value: '9:16', label: '9:16 竖屏' },
                            { value: '1:1', label: '1:1 方形' },
                            { value: '4:3', label: '4:3 标准' },
                            { value: '3:4', label: '3:4 竖版' },
                            { value: '21:9', label: '21:9 超宽' }
                          ].map((ratio) => (
                            <button
                              key={ratio.value}
                              onClick={() => updateParam('ratio', ratio.value)}
                              className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                                generateParams.ratio === ratio.value
                                  ? 'border-secondary-300 bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-700 shadow-sm'
                                  : 'border-gray-200 bg-white/60 hover:border-secondary-300 hover:bg-secondary-50 text-gray-600'
                              }`}
                            >
                              {ratio.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 高级参数卡片 */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Wand2 size={14} className="text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800">高级参数</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {type === 'image' ? (
                          <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-blue-200/50">
                            <label className="block text-sm font-medium text-gray-700">
                              引导强度: <span className="text-primary-600 font-semibold">{generateParams.guidanceScale}</span>
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              step="0.5"
                              value={generateParams.guidanceScale}
                              onChange={(e) => updateParam('guidanceScale', parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>弱</span>
                              <span>强</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-200/50">
                              <label className="block text-sm font-medium text-gray-700">
                                CFG Scale: <span className="text-secondary-600 font-semibold">{generateParams.cfgScale}</span>
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="20"
                                step="0.5"
                                value={generateParams.cfgScale}
                                onChange={(e) => updateParam('cfgScale', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>弱</span>
                                <span>强</span>
                              </div>
                            </div>
                                <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">帧率</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[24, 30, 60].map((fps) => (
                                  <button
                                    key={fps}
                                    onClick={() => updateParam('fps', fps)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                                      generateParams.fps === fps
                                        ? 'border-secondary-300 bg-gradient-to-br from-secondary-50 to-secondary-100 text-secondary-700 shadow-sm'
                                        : 'border-gray-200 bg-white/60 hover:border-secondary-300 hover:bg-secondary-50 text-gray-600'
                                    }`}
                                  >
                                    {fps} FPS
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 视频专用设置 */}
                    {type === 'video' && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                            <Video size={14} className="text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-800">视频设置</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-700 flex items-center space-x-1">
                                  <Camera size={14} className="text-green-500" />
                                  <span>固定摄像头</span>
                                </p>
                                <p className="text-sm text-gray-500">保持视角稳定</p>
                              </div>
                              <button
                                onClick={() => updateParam('cameraFixed', !generateParams.cameraFixed)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  generateParams.cameraFixed ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    generateParams.cameraFixed ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-700 flex items-center space-x-1">
                                  <Sparkles size={14} className="text-purple-500" />
                                  <span>高清模式</span>
                                </p>
                                <p className="text-sm text-gray-500">更高质量输出</p>
                              </div>
                              <button
                                onClick={() => updateParam('hd', !generateParams.hd)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  generateParams.hd ? 'bg-purple-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    generateParams.hd ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 水印设置 */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700 flex items-center space-x-1">
                            <Shield size={14} className="text-blue-500" />
                            <span>添加水印</span>
                          </p>
                          <p className="text-sm text-gray-500">保护您的创作版权</p>
                        </div>
                        <button
                          onClick={() => setWatermark(!watermark)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            watermark ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              watermark ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 生成按钮 */}
          <JellyButton
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full group relative py-4 px-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center space-x-3">
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>开始生成</span>
                </>
              )}
            </div>
          </JellyButton>

          {/* 生成结果 */}
          {currentGeneration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">生成结果</h3>
              
              {currentGeneration.status === 'completed' && currentGeneration.url ? (
                <div>
                  <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
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
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = currentGeneration.url!
                        link.download = `generated-${type}-${Date.now()}`
                        link.click()
                      }}
                      className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
                    >
                      <Download size={16} />
                      <span>下载</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (navigator.share) {
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
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium flex items-center justify-center space-x-2"
                    >
                      <Share2 size={16} />
                      <span>分享</span>
                    </button>
                  </div>
                </div>
              ) : currentGeneration.status === 'processing' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">正在生成中...</p>
                  {currentGeneration.progress && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${currentGeneration.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{currentGeneration.progress}%</p>
                    </div>
                  )}
                </div>
              ) : currentGeneration.status === 'failed' ? (
                <div className="text-center py-8">
                  <p className="text-red-600 font-medium">生成失败，请重试</p>
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