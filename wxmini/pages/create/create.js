/**
 * 文生视界微信小程序 - 创作页面
 * 基于微信小程序 v3.9.0 基础库
 */

const app = getApp()
const { content, file, config } = require('../../api/index.js')
const { showToast, showLoading, hideLoading, showConfirm, navigateTo, navigateBack, storage } = require('../../utils/utils.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 创作类型
    createType: 'image', // 'image' | 'video'
    
    // 用户输入
    prompt: '',
    promptLength: 0,
    maxPromptLength: 500,
    
    // 模板相关
    selectedTemplate: null,
    templateId: null,
    
    // 图片生成参数
    sizeOptions: [
      { label: '1:1 (512x512)', value: '1:1', width: 512, height: 512 },
      { label: '4:3 (768x576)', value: '4:3', width: 768, height: 576 },
      { label: '3:4 (576x768)', value: '3:4', width: 576, height: 768 },
      { label: '16:9 (1024x576)', value: '16:9', width: 1024, height: 576 },
      { label: '9:16 (576x1024)', value: '9:16', width: 576, height: 1024 }
    ],
    selectedSizeIndex: 0,
    
    qualityOptions: [
      { label: '标准', value: 'standard' },
      { label: '高清', value: 'hd' },
      { label: '超高清', value: 'uhd' }
    ],
    selectedQualityIndex: 1,
    
    // 视频生成参数
    videoModels: [
      { label: 'Stable Video Diffusion', value: 'svd' },
      { label: 'AnimateDiff', value: 'animatediff' },
      { label: 'Pika Labs', value: 'pika' }
    ],
    selectedModelIndex: 0,
    
    resolutionOptions: [
      { label: '720p (1280x720)', value: '720p', width: 1280, height: 720 },
      { label: '1080p (1920x1080)', value: '1080p', width: 1920, height: 1080 },
      { label: '4K (3840x2160)', value: '4k', width: 3840, height: 2160 }
    ],
    selectedResolutionIndex: 0,
    
    videoDurations: [
      { label: '3秒', value: 3 },
      { label: '5秒', value: 5 },
      { label: '10秒', value: 10 },
      { label: '15秒', value: 15 },
      { label: '30秒', value: 30 }
    ],
    selectedDurationIndex: 1,
    
    videoRatios: [
      { label: '16:9 (横屏)', value: '16:9' },
      { label: '9:16 (竖屏)', value: '9:16' },
      { label: '1:1 (方形)', value: '1:1' },
      { label: '4:3 (标准)', value: '4:3' }
    ],
    selectedRatioIndex: 0,
    
    fpsOptions: [
      { label: '24 FPS', value: 24 },
      { label: '30 FPS', value: 30 },
      { label: '60 FPS', value: 60 }
    ],
    selectedFpsIndex: 1,
    
    // 生成参数
    params: {
      // 图片参数
      size: '1:1',
      quality: 'hd',
      seed: -1,
      guidanceScale: 7.5,
      
      // 视频参数
      model: 'svd',
      resolution: '720p',
      duration: 5,
      ratio: '16:9',
      fps: 30,
      cameraFixed: false,
      cfgScale: 7.5,
      count: 1,
      hd: false,
      
      // 通用参数
      watermark: false
    },
    
    // 高级设置
    showAdvanced: false,
    
    // 上传图片
    uploadedImages: [],
    maxImages: 3,
    
    // 生成状态
    isGenerating: false,
    generateProgress: 0,
    generateStatus: '',
    
    // 生成结果
    generateResult: null,
    showResult: false,
    
    // 界面状态
    showPromptSuggestions: false,
    
    // 提示词建议
    promptSuggestions: [
      '一只可爱的小猫',
      '未来科技城市',
      '梦幻森林',
      '宇宙星空',
      '古风建筑',
      '抽象艺术',
      '卡通角色',
      '风景画'
    ],
    
    // 系统配置
    systemConfig: {
      maxConcurrentGenerations: 3,
      supportedFormats: ['jpg', 'png', 'webp'],
      maxFileSize: 10 * 1024 * 1024 // 10MB
    },
    
    // 用户配置
    userConfig: {
      autoSave: true,
      defaultQuality: 'high',
      enableWatermark: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('Create page onLoad:', options)
    
    // 获取创作类型
    const createType = options.type || 'image'
    const templateId = options.template_id || ''
    
    this.setData({
      createType,
      templateId,
      'params.type': createType,
      'params.templateId': templateId
    })
    
    // 初始化页面
    this.initPage()
    
    // 加载模板信息
    if (templateId) {
      this.loadTemplateInfo(templateId)
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('Create page onShow')
    
    // 检查登录状态
    this.checkUserLogin()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('Create page onHide')
    
    // 暂停生成任务检查
    this.stopProgressCheck()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('Create page onUnload')
    
    // 清理定时器
    this.stopProgressCheck()
    
    // 取消未完成的生成任务
    if (this.data.generating && this.data.taskId) {
      this.cancelGeneration()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { createType } = this.data
    const typeNames = {
      image: '图片',
      video: '视频',
      transform: '图像转换'
    }
    
    return {
      title: `文生视界 - AI${typeNames[createType]}生成`,
      desc: '体验最新的AI创作技术',
      path: `/pages/create/create?type=${createType}`,
      imageUrl: '/images/share-create.jpg'
    }
  },

  /**
   * 初始化页面
   */
  async initPage() {
    try {
      // 更新界面
      this.updateUI()
    } catch (error) {
      console.error('Init page error:', error)
    }
  },

  /**
   * 检查用户登录状态
   */
  checkUserLogin() {
    const userInfo = app.globalData.userInfo || storage.get('user_info')
    if (!userInfo) {
      wx.showModal({
        title: '登录提示',
        content: '请先登录后再使用创作功能',
        confirmText: '去登录',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            navigateTo('/pages/login/login')
          } else {
            navigateBack()
          }
        }
      })
      return false
    }
    return true
  },

  /**
   * 加载模板信息
   */
  async loadTemplateInfo(templateId) {
    try {
      showLoading('加载模板信息...')
      const template = await content.getTemplateDetail(templateId)
      
      this.setData({
        selectedTemplate: template,
        prompt: template.default_prompt || '',
        params: {
          ...this.data.params,
          ...template.default_params
        }
      })
      
      hideLoading()
    } catch (error) {
      console.error('Load template info error:', error)
      hideLoading()
      showToast('模板加载失败')
    }
  },

  /**
   * 更新界面
   */
  updateUI() {
    const { createType } = this.data
    
    // 更新提示词占位符
    const placeholders = {
      image: '描述你想要生成的图片，例如：一只可爱的小猫咪坐在花园里',
      video: '描述你想要生成的视频内容，例如：海浪拍打着沙滩，夕阳西下',
      transform: '描述你想要的图片风格，例如：转换为水彩画风格'
    }
    
    this.setData({
      promptPlaceholder: placeholders[createType] || placeholders.image
    })
  },



  /**
   * 提示词输入
   */
  onPromptInput(e) {
    this.setData({
      prompt: e.detail.value
    })
  },

  /**
   * 提示词建议点击
   */
  onSuggestionTap(e) {
    const index = e.currentTarget.dataset.index
    const suggestion = this.data.promptSuggestions[index]
    
    this.setData({
      prompt: this.data.prompt + (this.data.prompt ? ', ' : '') + suggestion
    })
  },

  /**
   * 切换高级设置
   */
  onToggleAdvanced() {
    this.setData({
      showAdvanced: !this.data.showAdvanced
    })
  },

  /**
   * 图片尺寸选择
   */
  onSizeChange(e) {
    const index = e.detail.value
    const selectedSize = this.data.sizeOptions[index]
    
    this.setData({
      selectedSizeIndex: index,
      'params.size': selectedSize.value
    })
  },

  /**
   * 参数滑块变化
   */
  onParamSliderChange(e) {
    const { param } = e.currentTarget.dataset
    const value = parseFloat(e.detail.value)
    
    this.setData({
      [`params.${param}`]: value
    })
  },
  
  /**
   * 种子输入
   */
  onSeedInput(e) {
    const value = e.detail.value
    const seed = value === '' ? -1 : parseInt(value) || -1
    this.setData({
      'params.seed': seed
    })
  },
  
  /**
   * 随机种子
   */
  onRandomSeed() {
    const randomSeed = Math.floor(Math.random() * 2147483647)
    this.setData({
      'params.seed': randomSeed
    })
  },
  
  /**
   * 摄像头固定切换
   */
  onCameraFixedChange(e) {
    this.setData({
      'params.cameraFixed': e.detail.value
    })
  },
  
  /**
   * 高清模式切换
   */
  onHdChange(e) {
    this.setData({
      'params.hd': e.detail.value
    })
  },
  
  /**
   * 水印切换
   */
  onWatermarkChange(e) {
    this.setData({
      'params.watermark': e.detail.value
    })
  },

  /**
   * 视频模型选择
   */
  onVideoModelChange(e) {
    const index = e.detail.value
    const selectedModel = this.data.videoModels[index]
    
    this.setData({
      selectedModelIndex: index,
      'params.model': selectedModel.value
    })
  },
  
  /**
   * 分辨率选择
   */
  onResolutionChange(e) {
    const index = e.detail.value
    const selectedResolution = this.data.resolutionOptions[index]
    
    this.setData({
      selectedResolutionIndex: index,
      'params.resolution': selectedResolution.value
    })
  },
  
  /**
   * 视频时长选择
   */
  onDurationChange(e) {
    const index = e.detail.value
    const selectedDuration = this.data.videoDurations[index]
    
    this.setData({
      selectedDurationIndex: index,
      'params.duration': selectedDuration.value
    })
  },
  
  /**
   * 视频比例选择
   */
  onRatioChange(e) {
    const index = e.detail.value
    const selectedRatio = this.data.videoRatios[index]
    
    this.setData({
      selectedRatioIndex: index,
      'params.ratio': selectedRatio.value
    })
  },
  
  /**
   * 帧率选择
   */
  onFpsChange(e) {
    const index = e.detail.value
    const selectedFps = this.data.fpsOptions[index]
    
    this.setData({
      selectedFpsIndex: index,
      'params.fps': selectedFps.value
    })
  },
  
  /**
   * 图片质量选择
   */
  onQualityChange(e) {
    const index = e.detail.value
    const selectedQuality = this.data.qualityOptions[index]
    
    this.setData({
      selectedQualityIndex: index,
      'params.quality': selectedQuality.value
    })
  },

  /**
   * 上传图片（图生图）
   */
  onUploadImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.uploadImageFile(tempFilePath)
      },
      fail: (error) => {
        console.error('Choose image error:', error)
        showToast('选择图片失败')
      }
    })
  },

  /**
   * 上传图片文件
   */
  async uploadImageFile(filePath) {
    try {
      showLoading('处理图片中...')
      
      // 直接使用本地图片路径，不上传到服务器
      this.setData({
        uploadedImage: filePath,
        uploadedImagePath: filePath
      })
      
      hideLoading()
      showToast('图片选择成功')
    } catch (error) {
      console.error('Process image error:', error)
      hideLoading()
      showToast('图片处理失败')
    }
  },

  /**
   * 删除上传的图片
   */
  onRemoveImage() {
    this.setData({
      uploadedImage: null,
      uploadedImagePath: ''
    })
  },

  /**
   * 开始生成
   */
  async onStartGenerate() {
    // 验证输入
    if (!this.validateInput()) {
      return
    }
    
    // 检查登录状态
    if (!this.checkUserLogin()) {
      return
    }
    
    try {
      this.setData({
        generating: true,
        generationProgress: 0,
        generationStatus: '准备生成...',
        showResults: false
      })
      
      // 构建生成参数
      const generateData = this.buildGenerateData()
      
      // 发起生成请求
      const result = await this.callGenerateAPI(generateData)
      
      // 开始检查进度
      this.startProgressCheck(result.task_id)
      

      
    } catch (error) {
      console.error('Generate error:', error)
      this.setData({
        generating: false
      })
      showToast(error.message || '生成失败，请重试')
    }
  },

  /**
   * 验证输入
   */
  validateInput() {
    const { prompt, createType, uploadedImage } = this.data
    
    if (!prompt.trim()) {
      showToast('请输入提示词')
      return false
    }
    
    if (createType === 'transform' && !uploadedImage) {
      showToast('请先上传要转换的图片')
      return false
    }
    
    if (prompt.length > 500) {
      showToast('提示词不能超过500个字符')
      return false
    }
    
    return true
  },

  /**
   * 构建生成参数
   */
  buildGenerateData() {
    const { prompt, params, createType, uploadedImage, templateId } = this.data
    
    const data = {
      type: createType,
      prompt: prompt.trim(),
      size: params.size,
      style: params.style,
      styleId: params.styleId,
      referenceImage: params.referenceImage || uploadedImage,
      templateId: templateId || params.templateId,
      quality: params.quality,
      
      // 图片生成参数
      responseFormat: params.responseFormat,
      seed: params.seed,
      guidanceScale: params.guidanceScale,
      
      // 视频生成参数
      model: params.model,
      resolution: params.resolution,
      duration: params.duration,
      ratio: params.ratio,
      fps: params.fps,
      cameraFixed: params.cameraFixed,
      cfgScale: params.cfgScale,
      count: params.count,
      firstFrameImage: params.firstFrameImage,
      lastFrameImage: params.lastFrameImage,
      hd: params.hd,
      watermark: params.watermark
    }
    
    // 移除空值和undefined值
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        delete data[key]
      }
    })
    
    return data
  },

  /**
   * 调用生成API
   */
  async callGenerateAPI(data) {
    const { createType } = this.data
    
    // 使用统一的生成接口
    return await content.generateContent(data)
  },

  /**
   * 开始进度检查
   */
  startProgressCheck(taskId) {
    this.setData({ taskId })
    
    this.progressTimer = setInterval(() => {
      this.checkGenerationProgress()
    }, 2000)
  },

  /**
   * 停止进度检查
   */
  stopProgressCheck() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  },

  /**
   * 检查生成进度
   */
  async checkGenerationProgress() {
    try {
      const { taskId } = this.data
      const status = await content.getTaskStatus(taskId)
      
      this.setData({
        generationProgress: status.progress || 0,
        generationStatus: status.status_text || '生成中...'
      })
      
      if (status.status === 'completed') {
        this.onGenerationComplete()
      } else if (status.status === 'failed') {
        this.onGenerationFailed(status.error_message)
      }
    } catch (error) {
      console.error('Check progress error:', error)
      // 添加错误处理，停止进度检查
      this.onGenerationFailed('检查进度失败')
    }
  },

  /**
   * 生成完成
   */
  async onGenerationComplete() {
    try {
      this.stopProgressCheck()
      
      const { taskId } = this.data
      const result = await content.getTaskResult(taskId)
      
      this.setData({
        generating: false,
        generatedResults: result.results || [],
        currentResultIndex: 0,
        showResults: true
      })
      
      showToast('生成完成！')
      
    } catch (error) {
      console.error('Get result error:', error)
      this.onGenerationFailed('获取结果失败')
    }
  },

  /**
   * 生成失败
   */
  onGenerationFailed(errorMessage) {
    this.stopProgressCheck()
    
    this.setData({
      generating: false
    })
    
    showToast(errorMessage || '生成失败，请重试')
  },

  /**
   * 取消生成
   */
  async cancelGeneration() {
    try {
      const confirmed = await showConfirm('确定要取消生成吗？')
      if (!confirmed) return
      
      const { taskId } = this.data
      if (taskId) {
        await content.cancelTask(taskId)
      }
      
      this.stopProgressCheck()
      
      this.setData({
        generating: false,
        taskId: ''
      })
      
      showToast('已取消生成')
    } catch (error) {
      console.error('Cancel generation error:', error)
    }
  },

  /**
   * 结果图片切换
   */
  onResultSwiper(e) {
    this.setData({
      currentResultIndex: e.detail.current
    })
  },

  /**
   * 保存结果
   */
  onSaveResult() {
    const { generatedResults, currentResultIndex } = this.data
    const result = generatedResults[currentResultIndex]
    
    if (!result) return
    
    wx.saveImageToPhotosAlbum({
      filePath: result.url,
      success: () => {
        showToast('保存成功')
      },
      fail: (error) => {
        console.error('Save image error:', error)
        showToast('保存失败')
      }
    })
  },

  /**
   * 分享结果
   */
  onShareResult() {
    const { generatedResults, currentResultIndex } = this.data
    const result = generatedResults[currentResultIndex]
    
    if (!result) return
    
    // 实现分享逻辑
    console.log('Share result:', result)
  },

  /**
   * 重新生成
   */
  onRegenerate() {
    this.setData({
      showResults: false,
      generatedResults: []
    })
    
    this.onStartGenerate()
  },


})