
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
import { Play, Image as ImageIcon, Settings, Palette, Download, Share2 } from 'lucide-react'
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
  
  // 高级设置
  const [steps, setSteps] = useState(20)
  const [guidance, setGuidance] = useState(7.5)
  const [seed, setSeed] = useState('')
  
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
  
  // 尺寸选项
  const sizeOptions = {
    image: [
      { text: '正方形 (1024x1024)', value: '1024x1024' },
      { text: '横向 (1344x768)', value: '1344x768' },
      { text: '纵向 (768x1344)', value: '768x1344' },
      { text: '宽屏 (1536x640)', value: '1536x640' },
    ],
    video: [
      { text: '标准 (1280x720)', value: '1280x720' },
      { text: '高清 (1920x1080)', value: '1920x1080' },
      { text: '竖屏 (720x1280)', value: '720x1280' },
      { text: '方形 (1024x1024)', value: '1024x1024' },
    ]
  }
  
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
      const options = {
        size: selectedSize,
        styleId: selectedStyle,
        steps,
        guidance,
        seed: seed || undefined
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <NavBar 
          title={
            <span className="flex items-center justify-center text-mist-800 font-bold">
              <span className="mr-2 text-2xl animate-bounce-soft">🎨</span>
              AI生成
            </span>
          }
          className="mobile-header backdrop-blur-md bg-white/80 border-b border-purple-100"
          rightText={<Settings className="w-5 h-5 text-purple-600" />}
          onClickRight={() => {
            setShowAdvancedSettings(true)
            buttonTap()
          }}
        />
      
      <div className="mobile-content pb-20 space-y-8">
        {/* 内容类型选择 - 果冻感设计 */}
        <div className="mobile-card backdrop-blur-md bg-white/80 border border-purple-100 shadow-lg shadow-purple-100/50">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">🎯</span>
            生成类型
          </h3>
          <RadioGroup value={contentType} onChange={setContentType}>
            <div className="flex gap-4">
              <div className="flex-1">
                <Radio name="image" className="w-full">
                  <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <span className="text-sm font-medium">图片生成</span>
                    </div>
                  </div>
                </Radio>
              </div>
              <div className="flex-1">
                <Radio name="video" className="w-full">
                  <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Play className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <span className="text-sm font-medium">视频生成</span>
                    </div>
                  </div>
                </Radio>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {/* 文本输入区域 - 果冻感设计 */}
        <div className="mobile-card backdrop-blur-md bg-white/80 border border-purple-100 shadow-lg shadow-purple-100/50">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">✍️</span>
            描述内容
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
        
        {/* 参数设置 - 果冻感设计 */}
        <div className="mobile-card backdrop-blur-md bg-white/80 border border-purple-100 shadow-lg shadow-purple-100/50">
          <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
            <span className="mr-2 text-xl animate-bounce-soft">⚙️</span>
            生成设置
          </h3>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-white/60 to-mist-50/60 border border-mist-200/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer"
              onClick={() => {
                setShowSizePicker(true)
                buttonTap()
              }}
            >
              <span className="font-medium text-mist-800">尺寸规格</span>
              <span className="text-mist-600 text-sm">{selectedSizeText}</span>
            </div>
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-white/60 to-purple-50/60 border border-purple-200/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer"
              onClick={() => {
                setShowStyleSheet(true)
                buttonTap()
              }}
            >
              <span className="font-medium text-mist-800">艺术风格</span>
              <span className="text-mist-600 text-sm">{selectedStyleInfo?.name || '选择风格'}</span>
            </div>
            <div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-white/60 to-pink-50/60 border border-pink-200/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer"
              onClick={() => {
                setShowAdvancedSettings(true)
                buttonTap()
              }}
            >
              <span className="font-medium text-mist-800">高级设置</span>
              <Settings className="w-5 h-5 text-mist-600" />
            </div>
          </div>
        </div>
        
        {/* 最近生成 - 果冻感设计 */}
        {history.length > 0 && (
          <div className="mobile-card backdrop-blur-md bg-white/80 border border-purple-100 shadow-lg shadow-purple-100/50">
            <h3 className="text-lg font-bold mb-4 text-mist-800 flex items-center">
              <span className="mr-2 text-xl animate-bounce-soft">🕒</span>
              最近生成
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
        
        {/* 生成按钮 - 果冻感设计 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/90 border-t border-purple-100">
          <LoadingButton
             type="primary"
             size="large"
             block
             loading={isGenerating}
             onClick={handleGenerate}
             disabled={!prompt.trim()}
             loadingText="生成中..."
             className="bg-gradient-to-r from-purple-500 to-pink-500 border-none shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 transform hover:scale-105"
           >
             <span className="flex items-center justify-center">
               <span className="mr-2 text-lg">✨</span>
               {`生成${contentType === 'image' ? '图片' : '视频'}`}
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
      
      {/* 高级设置 - 果冻感设计 */}
      <Popup
        visible={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        position="bottom"
        round
        className="backdrop-blur-md"
      >
        <div className="p-6 bg-gradient-to-br from-white/90 to-pink-50/90 backdrop-blur-md">
          <h3 className="text-lg font-bold mb-6 text-center text-mist-800 flex items-center justify-center">
            <span className="mr-2 text-xl animate-bounce-soft">⚙️</span>
            高级设置
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
              <Field
                label="生成步数"
                value={steps.toString()}
                onChange={(val) => setSteps(Number(val) || 20)}
                type="number"
                placeholder="20"
                className="mobile-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(177, 151, 252, 0.2)',
                  borderRadius: '12px'
                }}
              />
              <div className="text-xs text-mist-600 mt-1">推荐值: 20-50，值越高质量越好但耗时更长</div>
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
              <div className="text-xs text-mist-600 mt-1">推荐值: 5-15，值越高越贴近描述但可能过度拟合</div>
            </div>
            <div className="p-4 bg-white/60 border border-mist-200/50 rounded-xl backdrop-blur-sm">
              <Field
                label="随机种子"
                value={seed}
                onChange={setSeed}
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