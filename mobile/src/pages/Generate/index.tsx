
import React, { useState, useEffect } from 'react'
import {
  NavBar,
  Field,
  Button,
  Picker,
  ActionSheet,
  Popup,
  Image,
  Loading,
  Toast,
  Cell,
  CellGroup,
  Radio,
  RadioGroup,
  Divider,
  Space,
  Tag
} from 'react-vant'
import { useGenerationStore, useArtStyleStore, useTemplateStore } from '../../store'
import { Play, Image as ImageIcon, Settings, Palette, Download, Share2, ChevronRight, Sparkles } from 'lucide-react'
import ShareModal from '../../components/common/ShareModal'
import { useGestures, usePinchGesture } from '../../hooks/useGestures'
import { useHapticFeedback } from '../../utils/haptics'
import { PageTransition, FadeTransition, ScaleTransition } from '../../components/ui/Transitions'
import { FullScreenLoading, InlineLoading, LoadingButton } from '../../components/ui/LoadingStates'
import { NetworkError, EmptyState } from '../../components/ui/ErrorStates'

const Generate = () => {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState<'image' | 'video'>('image')
  const [selectedSize, setSelectedSize] = useState('1024x1024')
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null)
  const [showSizePicker, setShowSizePicker] = useState(false)
  const [showStyleSheet, setShowStyleSheet] = useState(false)
  const [showResultPopup, setShowResultPopup] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  
  // 高级设置 - 与PC端保持一致
  const [steps, setSteps] = useState(20)
  const [guidance, setGuidance] = useState(7.5)
  const [seed, setSeed] = useState('')
  const [quality, setQuality] = useState('standard')
  const [watermark, setWatermark] = useState(false)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  
  // 视频参数
  const [resolution, setResolution] = useState('720p')
  const [duration, setDuration] = useState(5)
  const [ratio, setRatio] = useState('16:9')
  const [fps, setFps] = useState(24)
  const [cameraFixed, setCameraFixed] = useState(false)
  const [cfgScale, setCfgScale] = useState(7)
  const [count, setCount] = useState(1)
  
  // 触觉反馈和手势支持
   const { buttonTap, success, error: hapticError, selection } = useHapticFeedback()
   
   const handlePinch = (scale: number, type: 'in' | 'out') => {
     setImageScale(prev => {
       const newScale = type === 'out' ? prev * scale : prev / scale
       return Math.max(0.5, Math.min(3, newScale))
     })
   }
   
   const { ref: pinchRef } = usePinchGesture(handlePinch)
  
  const { 
    generateContent, 
    isGenerating, 
    currentGeneration,
    history 
  } = useGenerationStore()
  
  const { 
    styles, 
    fetchStyles, 
    getStyleById 
  } = useArtStyleStore()
  
  const { templates } = useTemplateStore()
  
  // 尺寸选项 - 与PC端保持一致
  const sizeOptions = {
    image: [
      { text: '正方形 (1024x1024)', value: '1024x1024' },
      { text: '横屏 (1152x896)', value: '1152x896' },
      { text: '竖屏 (896x1152)', value: '896x1152' },
      { text: '宽屏 (1216x832)', value: '1216x832' },
      { text: '长屏 (832x1216)', value: '832x1216' },
    ],
    video: [
      { text: '标准 (1280x720)', value: '1280x720' },
      { text: '高清 (1920x1080)', value: '1920x1080' },
      { text: '竖屏 (720x1280)', value: '720x1280' },
      { text: '方形 (1024x1024)', value: '1024x1024' },
    ]
  }
  
  // 质量选项
  const qualityOptions = [
    { text: '标准质量', value: 'standard' },
    { text: '高清质量', value: 'hd' }
  ]
  
  // 视频分辨率选项
  const resolutionOptions = [
    { text: '480p (标清)', value: '480p' },
    { text: '720p (高清)', value: '720p' },
    { text: '1080p (全高清)', value: '1080p' }
  ]
  
  // 视频比例选项
  const ratioOptions = [
    { text: '正方形 (1:1)', value: '1:1' },
    { text: '竖屏 (3:4)', value: '3:4' },
    { text: '横屏 (4:3)', value: '4:3' },
    { text: '宽屏 (16:9)', value: '16:9' },
    { text: '竖屏 (9:16)', value: '9:16' },
    { text: '超宽屏 (21:9)', value: '21:9' }
  ]
  
  // 时长选项
  const durationOptions = [
    { text: '5秒', value: 5 },
    { text: '10秒', value: 10 }
  ]
  
  useEffect(() => {
    fetchStyles(contentType)
  }, [contentType, fetchStyles])
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      hapticError()
      Toast.fail('请输入生成描述')
      return
    }
    
    setError(null)
    buttonTap()
    
    try {
      const options: any = {
        size: selectedSize,
        styleId: selectedStyle,
        watermark,
        referenceImage
      }
      
      if (contentType === 'image') {
        options.quality = quality
        if (seed) options.seed = Number(seed)
        if (guidance !== 7.5) options.guidanceScale = guidance
      }
      
      if (contentType === 'video') {
        options.resolution = resolution
        options.duration = duration
        options.ratio = ratio
        options.fps = fps
        options.cameraFixed = cameraFixed
        options.cfgScale = cfgScale
        options.count = count
      }
      
      await generateContent(prompt, contentType, options)
      success()
      setShowResultPopup(true)
      Toast.success('生成成功！')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败'
      setError(errorMessage)
      hapticError()
      Toast.fail(errorMessage)
    }
  }
  
  const handleUseTemplate = (template: any) => {
    setPrompt(template.prompt)
    setContentType(template.type)
    setSelectedSize(template.size || (template.type === 'image' ? '1024x1024' : '1280x720'))
    if (template.styleId) {
      setSelectedStyle(template.styleId)
    }
  }
  
  const selectedStyleInfo = selectedStyle ? getStyleById(selectedStyle) : null
  const currentSizeOptions = sizeOptions[contentType]
  const selectedSizeText = currentSizeOptions.find(opt => opt.value === selectedSize)?.text || selectedSize
  
  // 如果有错误且没有生成内容，显示错误页面
  if (error && !currentGeneration) {
    return (
      <NetworkError 
        onRetry={() => {
          setError(null)
          handleGenerate()
        }}
        message={error}
      />
    )
  }

  return (
    <PageTransition isVisible={isPageVisible} type="fade">
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-mist-50 to-sky-50">
        <NavBar 
          title={
            <span className="flex items-center justify-center text-mist-800 font-bold">
              <span className="mr-2 text-2xl animate-bounce-soft">🎨</span>
              AI创作工坊
            </span>
          }
          className="mobile-header backdrop-blur-md bg-white/80 border-b border-mist-100 shadow-soft"
          rightText={<Settings className="w-5 h-5 text-mist-600" />}
          onClickRight={() => {
            setShowAdvancedSettings(true)
            buttonTap()
          }}
        />
      
      <div className="mobile-content pb-20 space-y-6">
        {/* 创作灵感区域 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-mist-100 shadow-soft">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">💡</span>
            创作灵感
          </h3>
          <p className="text-sm text-mist-600 mb-4 leading-relaxed">
            描述您想要创作的内容，AI将为您生成精美的视觉作品
          </p>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {['梦幻森林', '未来城市', '可爱动物', '抽象艺术'].map((tag, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-mist-100 text-mist-700 rounded-full text-xs font-medium hover:bg-mist-200 transition-colors"
                  onClick={() => setPrompt(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 内容类型选择 - 重新设计 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-mist-100 shadow-soft">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">🎯</span>
            创作类型
          </h3>
          <RadioGroup value={contentType} onChange={setContentType}>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Radio name="image" className="w-full">
                  <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    contentType === 'image' 
                      ? 'border-mist-300 bg-mist-50 shadow-jelly' 
                      : 'border-mist-200 bg-white hover:border-mist-300'
                  }`}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-sky-100 to-mist-100 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-sky-600" />
                      </div>
                      <span className="text-sm font-semibold text-mist-800">图片生成</span>
                      <p className="text-xs text-mist-600 mt-1">高质量图像创作</p>
                    </div>
                  </div>
                </Radio>
              </div>
              <div className="relative">
                <Radio name="video" className="w-full">
                  <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    contentType === 'video' 
                      ? 'border-mist-300 bg-mist-50 shadow-jelly' 
                      : 'border-mist-200 bg-white hover:border-mist-300'
                  }`}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-mist-100 to-sky-100 rounded-xl flex items-center justify-center">
                        <Play className="w-6 h-6 text-mist-600" />
                      </div>
                      <span className="text-sm font-semibold text-mist-800">视频生成</span>
                      <p className="text-xs text-mist-600 mt-1">动态视频创作</p>
                    </div>
                  </div>
                </Radio>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {/* 文本输入区域 - 重新设计 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-mist-100 shadow-soft">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">✍️</span>
            创作描述
          </h3>
          <div className="relative">
            <Field
              value={prompt}
              onChange={setPrompt}
              type="textarea"
              placeholder={`请描述您想要生成的${contentType === 'image' ? '图片' : '视频'}内容...`}
              rows={4}
              maxLength={500}
              showWordLimit
              className="mb-3 mobile-input"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(177, 151, 252, 0.2)',
                borderRadius: '16px'
              }}
            />
          </div>
          
          {/* 快速模板 - 果冻感设计 */}
          {templates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-mist-700 mb-3 flex items-center">
                <span className="mr-2 text-base animate-bounce-soft">🚀</span>
                快速模板
              </h4>
              <div className="flex flex-wrap gap-2">
                {templates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    className="px-3 py-2 text-xs font-medium text-mist-700 bg-gradient-to-r from-mist-100/80 to-sky-100/80 border border-mist-200/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer"
                    onClick={() => handleUseTemplate(template)}
                  >
                    {template.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 参数设置 - 重新设计 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-mist-100 shadow-soft">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">⚙️</span>
            创作参数
          </h3>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-mist-50 to-sky-50 border border-mist-200 rounded-xl transition-all duration-300 hover:shadow-jelly hover:scale-[1.02] cursor-pointer"
              onClick={() => {
                setShowSizePicker(true)
                buttonTap()
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm">📐</span>
                </div>
                <div>
                  <span className="font-semibold text-mist-800 text-sm">尺寸规格</span>
                  <p className="text-xs text-mist-600">选择输出尺寸</p>
                </div>
              </div>
              <span className="text-mist-700 text-sm font-medium">{selectedSizeText}</span>
            </div>
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-mist-50 to-cream-50 border border-mist-200 rounded-xl transition-all duration-300 hover:shadow-jelly hover:scale-[1.02] cursor-pointer"
              onClick={() => {
                setShowStyleSheet(true)
                buttonTap()
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-mist-100 rounded-lg flex items-center justify-center mr-3">
                  <Palette className="w-4 h-4 text-mist-600" />
                </div>
                <div>
                  <span className="font-semibold text-mist-800 text-sm">艺术风格</span>
                  <p className="text-xs text-mist-600">选择创作风格</p>
                </div>
              </div>
              <span className="text-mist-700 text-sm font-medium">{selectedStyleInfo?.name || '默认风格'}</span>
            </div>
          </div>
        </div>
        
        {/* 高级设置 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-mist-100 shadow-soft">
          <div 
            className="flex items-center justify-between p-4 bg-gradient-to-r from-mist-50 to-purple-50 border border-mist-200 rounded-xl transition-all duration-300 hover:shadow-jelly hover:scale-[1.02] cursor-pointer"
            onClick={() => {
              setShowAdvancedSettings(true)
              buttonTap()
            }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="font-semibold text-mist-800 text-sm">高级设置</span>
                <p className="text-xs text-mist-600">调整生成参数</p>
              </div>
            </div>
          </div>
        </div>

        {/* 最近生成 - 果冻感设计 */}
        {history.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-mist-100 shadow-soft">
            <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
              <span className="mr-2 text-xl animate-bounce-soft">🕒</span>
              最近创作
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {history.slice(0, 6).map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={item.thumbnail || item.url}
                    fit="cover"
                    className="w-full h-full"
                    onClick={() => {
                      // 可以添加查看详情的逻辑
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 生成按钮 - 重新设计 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/90 border-t border-mist-100">
          <LoadingButton
             type="primary"
             size="large"
             block
             loading={isGenerating}
             onClick={handleGenerate}
             disabled={!prompt.trim()}
             loadingText="创作中..."
             className="bg-gradient-to-r from-mist-400 to-sky-400 border-none shadow-jelly hover:shadow-xl transition-all duration-300 transform hover:scale-105"
           >
             <span className="flex items-center justify-center">
               <span className="mr-2 text-lg">✨</span>
               {`开始创作${contentType === 'image' ? '图片' : '视频'}`}
             </span>
           </LoadingButton>
        </div>
      </div>
      
      {/* 尺寸选择器 */}
      <Popup
        visible={showSizePicker}
        onClose={() => setShowSizePicker(false)}
        position="bottom"
        round
        className="backdrop-blur-md"
      >
        <div className="p-6 bg-gradient-to-br from-white/90 to-mist-50/90 backdrop-blur-md">
          <h3 className="text-lg font-bold mb-6 text-center text-mist-800 flex items-center justify-center">
            <span className="mr-2 text-xl animate-bounce-soft">📐</span>
            选择尺寸
          </h3>
          <div className="space-y-3">
            {currentSizeOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  selectedSize === option.value
                    ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50'
                    : 'border-mist-200/50 bg-white/60 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedSize(option.value)
                  setShowSizePicker(false)
                  selection()
                }}
              >
                <span className="font-medium text-mist-800">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Popup>
      
      {/* 艺术风格选择 - 果冻感设计 */}
      <Popup
        visible={showStyleSheet}
        onClose={() => setShowStyleSheet(false)}
        position="bottom"
        round
        className="backdrop-blur-md"
      >
        <div className="p-6 bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-md">
          <h3 className="text-lg font-bold mb-6 text-center text-mist-800 flex items-center justify-center">
            <span className="mr-2 text-xl animate-bounce-soft">🎨</span>
            选择艺术风格
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                selectedStyle === null
                  ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50'
                  : 'border-mist-200/50 bg-white/60 hover:border-purple-300 hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedStyle(null)
                setShowStyleSheet(false)
                selection()
              }}
            >
              <div className="font-medium text-mist-800 mb-1">默认风格</div>
              <div className="text-sm text-mist-600">使用系统默认的艺术风格</div>
            </div>
            {styles.map((style) => (
              <div
                key={style.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  selectedStyle === style.id
                    ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg shadow-purple-200/50'
                    : 'border-mist-200/50 bg-white/60 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => {
                  setSelectedStyle(style.id)
                  setShowStyleSheet(false)
                  selection()
                }}
              >
                <div className="font-medium text-mist-800 mb-1">{style.name}</div>
                {style.description && (
                  <div className="text-sm text-mist-600">{style.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Popup>
      
      {/* 高级设置 - 果冻感设计，与PC端参数一致 */}
      <Popup
        visible={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        position="bottom"
        round
        className="backdrop-blur-md"
      >
        <div className="p-6 bg-gradient-to-br from-white/90 to-pink-50/90 backdrop-blur-md max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-6 text-center text-mist-800 flex items-center justify-center">
            <span className="mr-2 text-xl animate-bounce-soft">⚙️</span>
            高级设置
          </h3>
          <div className="space-y-4">
            {/* 图片专用参数 */}
            {contentType === 'image' && (
              <>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <label className="block text-sm font-medium text-mist-700 mb-2">图片质量</label>
                  <div className="space-y-2">
                    {qualityOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                          quality === option.value
                            ? 'border-mist-400 bg-mist-50'
                            : 'border-mist-200 bg-white hover:border-mist-300'
                        }`}
                        onClick={() => {
                          setQuality(option.value)
                          selection()
                        }}
                      >
                        <span className="text-sm font-medium text-mist-800">{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    label="引导强度"
                    value={guidance.toString()}
                    onChange={(val) => setGuidance(Number(val) || 7.5)}
                    type="number"
                    placeholder="7.5"
                    className="mobile-input"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                  <div className="text-xs text-mist-600 mt-1">推荐值: 1-10，值越高越贴近描述</div>
                </div>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    label="随机种子"
                    value={seed}
                    onChange={setSeed}
                    type="number"
                    placeholder="留空随机生成"
                    className="mobile-input"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                  <div className="text-xs text-mist-600 mt-1">使用相同种子可以重现相似结果</div>
                </div>
              </>
            )}
            
            {/* 视频专用参数 */}
            {contentType === 'video' && (
              <>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <label className="block text-sm font-medium text-mist-700 mb-2">分辨率</label>
                  <div className="space-y-2">
                    {resolutionOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                          resolution === option.value
                            ? 'border-mist-400 bg-mist-50'
                            : 'border-mist-200 bg-white hover:border-mist-300'
                        }`}
                        onClick={() => {
                          setResolution(option.value)
                          selection()
                        }}
                      >
                        <span className="text-sm font-medium text-mist-800">{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <label className="block text-sm font-medium text-mist-700 mb-2">时长</label>
                  <div className="space-y-2">
                    {durationOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                          duration === option.value
                            ? 'border-mist-400 bg-mist-50'
                            : 'border-mist-200 bg-white hover:border-mist-300'
                        }`}
                        onClick={() => {
                          setDuration(option.value)
                          selection()
                        }}
                      >
                        <span className="text-sm font-medium text-mist-800">{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <label className="block text-sm font-medium text-mist-700 mb-2">画面比例</label>
                  <div className="space-y-2">
                    {ratioOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                          ratio === option.value
                            ? 'border-mist-400 bg-mist-50'
                            : 'border-mist-200 bg-white hover:border-mist-300'
                        }`}
                        onClick={() => {
                          setRatio(option.value)
                          selection()
                        }}
                      >
                        <span className="text-sm font-medium text-mist-800">{option.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <Field
                    label="帧率"
                    value={fps.toString()}
                    onChange={(val) => setFps(Number(val) || 24)}
                    type="number"
                    placeholder="24"
                    className="mobile-input"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(177, 151, 252, 0.2)',
                      borderRadius: '12px'
                    }}
                  />
                  <div className="text-xs text-mist-600 mt-1">推荐值: 12-60，值越高越流畅</div>
                </div>
                <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-mist-700">固定摄像头</label>
                      <p className="text-xs text-mist-600 mt-1">减少镜头运动，画面更稳定</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cameraFixed}
                        onChange={(e) => setCameraFixed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mist-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-mist-400 peer-checked:to-sky-400"></div>
                    </label>
                  </div>
                </div>
              </>
            )}
            
            {/* 通用参数 */}
            <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-mist-700">添加水印</label>
                  <p className="text-xs text-mist-600 mt-1">在生成内容上添加水印</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermark}
                    onChange={(e) => setWatermark(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mist-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-mist-400 peer-checked:to-sky-400"></div>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              type="primary"
              block
              onClick={() => {
                setShowAdvancedSettings(false)
                buttonTap()
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 border-none shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2 text-base">✅</span>
                确定
              </span>
            </Button>
          </div>
        </div>
      </Popup>
      
      {/* 生成结果弹窗 */}
      <Popup
        visible={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        position="center"
        round
        className="w-11/12 max-w-md"
      >
        <div className="p-4">
          {isGenerating ? (
            <div className="text-center py-8">
              <Loading size="24px" className="mb-4" />
              <div className="text-lg font-medium mb-2">正在生成中...</div>
              <div className="text-sm text-gray-600">请稍候，这可能需要几分钟时间</div>
            </div>
          ) : currentGeneration ? (
            <FadeTransition isVisible={!!currentGeneration}>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">生成完成</h3>
                <div className="mb-4">
                  <div 
                    ref={pinchRef}
                    className="relative overflow-hidden rounded-lg"
                    style={{
                      transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`
                    }}
                  >
                    {currentGeneration.type === 'image' ? (
                      <Image
                        src={currentGeneration.url}
                        fit="contain"
                        className="w-full transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={currentGeneration.url}
                        controls
                        className="w-full rounded-lg"
                        poster={currentGeneration.thumbnail}
                      />
                    )}
                  </div>
                  {imageScale !== 1 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      缩放: {Math.round(imageScale * 100)}%
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    size="small"
                    icon={<Download className="w-4 h-4" />}
                    className="flex-1"
                    onClick={() => {
                      buttonTap()
                      // 下载功能
                      const link = document.createElement('a')
                      link.href = currentGeneration.url
                      link.download = `generated-${currentGeneration.type}-${Date.now()}`
                      link.click()
                    }}
                  >
                    下载
                  </Button>
                  <Button
                    size="small"
                    icon={<Share2 className="w-4 h-4" />}
                    className="flex-1"
                    onClick={() => {
                      buttonTap()
                      setShowShareModal(true)
                    }}
                  >
                    分享
                  </Button>
                </div>
              </div>
            </FadeTransition>
          ) : null}
        </div>
      </Popup>
      
      {/* 分享弹窗 */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={currentGeneration ? {
          type: currentGeneration.type,
          url: currentGeneration.url,
          title: `我用AI生成了一个${currentGeneration.type === 'image' ? '图片' : '视频'}`,
          description: prompt || '快来看看我的AI创作！',
          thumbnail: currentGeneration.thumbnail || currentGeneration.url
        } : undefined}
      />
      </div>
    </PageTransition>
  )
}

export default Generate