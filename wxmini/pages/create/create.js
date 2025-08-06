/**
 * 文生视界微信小程序 - 创作页面
 * 基于微信小程序 v3.9.0 基础库
 */

const app = getApp()
const { content, file, analytics } = require('../../api/index.js')
const { showToast, showLoading, hideLoading, showConfirm, navigateTo, navigateBack, storage } = require('../../utils/utils.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 创作类型
    createType: 'image', // image, video, transform
    
    // 用户输入
    prompt: '',
    promptPlaceholder: '描述你想要生成的内容...',
    
    // 模板相关
    selectedTemplate: null,
    templateId: '',
    
    // 生成参数
    params: {
      // 图片参数
      width: 512,
      height: 512,
      steps: 20,
      cfg_scale: 7,
      sampler: 'DPM++ 2M Karras',
      
      // 视频参数
      duration: 3,
      fps: 24,
      motion_strength: 0.5,
      
      // 通用参数
      seed: -1,
      batch_count: 1,
      negative_prompt: ''
    },
    
    // 高级设置
    showAdvanced: false,
    
    // 上传的图片（用于图生图）
    uploadedImage: null,
    uploadedImagePath: '',
    
    // 生成状态
    generating: false,
    generationProgress: 0,
    generationStatus: '',
    taskId: '',
    
    // 生成结果
    generatedResults: [],
    currentResultIndex: 0,
    
    // 界面状态
    showResults: false,
    showParams: false,
    
    // 预设配置
    aspectRatios: [
      { label: '1:1', value: '1:1', width: 512, height: 512 },
      { label: '4:3', value: '4:3', width: 512, height: 384 },
      { label: '3:4', value: '3:4', width: 384, height: 512 },
      { label: '16:9', value: '16:9', width: 512, height: 288 },
      { label: '9:16', value: '9:16', width: 288, height: 512 }
    ],
    selectedAspectRatio: '1:1',
    
    samplers: [
      'DPM++ 2M Karras',
      'DPM++ SDE Karras',
      'Euler a',
      'Euler',
      'LMS',
      'Heun',
      'DPM2',
      'DPM2 a'
    ],
    
    videoDurations: [
      { label: '3秒', value: 3 },
      { label: '5秒', value: 5 },
      { label: '10秒', value: 10 },
      { label: '15秒', value: 15 }
    ],
    
    // 提示词建议
    promptSuggestions: [
      '一只可爱的小猫咪',
      '未来科技城市',
      '梦幻森林',
      '宇宙星空',
      '古风美女',
      '机械朋克风格',
      '水彩画风格',
      '卡通动漫风格'
    ],
    
    // 系统配置
    systemConfig: {},
    
    // 用户配置
    userConfig: {}
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
      templateId
    })
    
    // 初始化页面
    this.initPage()
    
    // 加载模板信息
    if (templateId) {
      this.loadTemplateInfo(templateId)
    }
    
    // 记录页面访问
    this.trackPageView()
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
      // 并行加载配置
      await Promise.all([
        this.loadSystemConfig(),
        this.loadUserConfig()
      ])
      
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
   * 加载系统配置
   */
  async loadSystemConfig() {
    try {
      const { config } = require('../../api/index.js')
      const systemConfig = await config.getGenerationConfig(this.data.createType)
      this.setData({ systemConfig })
    } catch (error) {
      console.error('Load system config error:', error)
    }
  },

  /**
   * 加载用户配置
   */
  async loadUserConfig() {
    try {
      const { config } = require('../../api/index.js')
      const userConfig = await config.getUserConfig()
      this.setData({ userConfig })
    } catch (error) {
      console.error('Load user config error:', error)
    }
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
   * 记录页面访问
   */
  trackPageView() {
    analytics.trackUserAction({
      action: 'create_page_view',
      params: {
        create_type: this.data.createType,
        template_id: this.data.templateId,
        timestamp: Date.now()
      }
    }).catch(console.error)
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
   * 宽高比选择
   */
  onAspectRatioChange(e) {
    const value = e.detail.value
    const ratio = this.data.aspectRatios[value]
    
    this.setData({
      selectedAspectRatio: ratio.value,
      'params.width': ratio.width,
      'params.height': ratio.height
    })
  },

  /**
   * 参数滑块变化
   */
  onParamSliderChange(e) {
    const { param } = e.currentTarget.dataset
    const value = e.detail.value
    
    this.setData({
      [`params.${param}`]: value
    })
  },

  /**
   * 采样器选择
   */
  onSamplerChange(e) {
    const value = e.detail.value
    const sampler = this.data.samplers[value]
    
    this.setData({
      'params.sampler': sampler
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
      showLoading('上传图片中...')
      
      const result = await file.uploadImage(filePath)
      
      this.setData({
        uploadedImage: result.url,
        uploadedImagePath: filePath
      })
      
      hideLoading()
      showToast('图片上传成功')
    } catch (error) {
      console.error('Upload image error:', error)
      hideLoading()
      showToast('图片上传失败')
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
      
      // 记录生成行为
      this.trackGeneration(generateData)
      
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
      prompt: prompt.trim(),
      params,
      type: createType
    }
    
    if (templateId) {
      data.template_id = templateId
    }
    
    if (uploadedImage) {
      data.image_url = uploadedImage
    }
    
    return data
  },

  /**
   * 调用生成API
   */
  async callGenerateAPI(data) {
    const { createType } = this.data
    
    switch (createType) {
      case 'image':
        return await content.textToImage(data)
      case 'video':
        return await content.textToVideo(data)
      case 'transform':
        return await content.imageToImage(data)
      default:
        throw new Error('不支持的生成类型')
    }
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
      
      // 记录生成成功
      this.trackGenerationComplete(result)
      
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

  /**
   * 记录生成行为
   */
  trackGeneration(data) {
    analytics.trackUserAction({
      action: 'generation_start',
      params: {
        create_type: this.data.createType,
        template_id: this.data.templateId,
        prompt_length: data.prompt.length,
        has_image: !!data.image_url,
        params: data.params
      }
    }).catch(console.error)
  },

  /**
   * 记录生成完成
   */
  trackGenerationComplete(result) {
    analytics.trackUserAction({
      action: 'generation_complete',
      params: {
        create_type: this.data.createType,
        result_count: result.results?.length || 0,
        task_id: this.data.taskId
      }
    }).catch(console.error)
  }
})