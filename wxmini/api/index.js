/**
 * 文生视界微信小程序 - API接口定义
 * 基于微信小程序 v3.9.0 基础库
 */

const { get, post, put, delete: del, upload } = require('../utils/request.js')

/**
 * 用户认证相关接口
 */
const auth = {
  /**
   * 微信登录
   * @param {object} data 登录数据
   * @param {string} data.code 微信登录code
   * @param {object} data.userInfo 用户信息
   */
  wxLogin(data) {
    return post('/api/auth/wx-login', data, {
      loading: true,
      loadingText: '登录中...'
    })
  },

  /**
   * 更新微信用户信息
   * @param {object} data 用户信息数据
   * @param {number} data.userId 用户ID
   * @param {object} data.userInfo 微信用户信息
   */
  updateWxUserInfo(data) {
    return put('/api/auth/wx-userinfo', data, {
      loading: true,
      loadingText: '更新中...'
    })
  },

  /**
   * 检查微信登录状态
   * @param {string} openId 微信openId
   */
  checkWxStatus(openId) {
    return get(`/api/auth/wx-status?openId=${openId}`)
  },

  /**
   * 用户注册
   * @param {object} data 注册数据
   * @param {string} data.email 邮箱
   * @param {string} data.name 用户名
   * @param {string} data.password 密码
   */
  register(data) {
    return post('/api/users/register', data, {
      loading: true,
      loadingText: '注册中...'
    })
  },

  /**
   * 用户登录
   * @param {object} data 登录数据
   * @param {string} data.email 邮箱
   * @param {string} data.password 密码
   */
  login(data) {
    return post('/api/users/login', data, {
      loading: true,
      loadingText: '登录中...'
    })
  },

  /**
   * 退出登录
   */
  logout() {
    return post('/api/auth/logout', {}, {
      loading: true,
      loadingText: '退出中...'
    })
  }
}

/**
 * 用户信息相关接口
 */
const user = {
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return get('/api/users/profile')
  },

  /**
   * 更新用户信息
   * @param {object} data 用户信息
   * @param {string} data.name 用户名
   * @param {string} data.avatar 头像URL
   */
  updateUserInfo(data) {
    return put('/api/users/profile', data, {
      loading: true,
      loadingText: '更新中...'
    })
  },

  /**
   * 修改密码
   * @param {object} data 密码数据
   * @param {string} data.oldPassword 旧密码
   * @param {string} data.newPassword 新密码
   */
  changePassword(data) {
    return put('/api/users/password', data, {
      loading: true,
      loadingText: '修改中...'
    })
  },

  /**
   * 检查邮箱是否存在
   * @param {string} email 邮箱
   */
  checkEmailExists(email) {
    return get(`/api/users/check-email?email=${email}`)
  },

  /**
   * 检查用户名是否存在
   * @param {string} username 用户名
   */
  checkUsernameExists(username) {
    return get(`/api/users/check-username?username=${username}`)
  },

  /**
   * 获取用户统计数据
   */
  getUserStats() {
    return get('/api/users/stats')
  },

  /**
   * 获取会员信息
   */
  getMemberInfo() {
    return get('/api/users/member-info')
  },

  /**
   * 上传文件
   * @param {string} filePath 文件路径
   * @param {string} type 文件类型
   */
  uploadFile(filePath, type = 'image') {
    return upload('/api/file/upload', filePath, {
      name: 'file',
      formData: { type },
      loading: true,
      loadingText: '上传中...'
    })
  },

  /**
   * 获取用户操作日志
   * @param {object} params 查询参数
   */
  getOperationLogs(params = {}) {
    return get('/api/users/operation-logs', params)
  }
}

/**
 * 模板相关接口
 */
const template = {
  /**
   * 获取模板列表
   * @param {object} params 查询参数
   * @param {string} params.categoryId 分类ID
   * @param {string} params.type 类型
   * @param {string} params.keyword 关键词
   * @param {number} params.page 页码
   * @param {number} params.size 每页数量
   * @param {string} params.sortField 排序字段
   * @param {string} params.sortDirection 排序方向
   */
  getTemplates(params = {}) {
    return get('/api/templates', params)
  },

  /**
   * 获取模板详情
   * @param {string} templateId 模板ID
   */
  getTemplateDetail(templateId) {
    return get(`/api/templates/${templateId}`)
  },

  /**
   * 获取所有分类
   */
  getAllCategories() {
    return get('/api/templates/categories')
  },

  /**
   * 获取热门模板
   * @param {number} limit 数量限制
   */
  getPopularTemplates(limit = 10) {
    return get(`/api/templates/popular?limit=${limit}`)
  },

  /**
   * 搜索模板
   * @param {object} params 搜索参数
   */
  searchTemplates(params = {}) {
    return get('/api/templates/search', params)
  },

  /**
   * 根据标签查询模板
   * @param {string} tag 标签
   */
  getTemplatesByTag(tag) {
    return get(`/api/templates/by-tag?tag=${tag}`)
  },

  /**
   * 使用模板
   * @param {string} templateId 模板ID
   */
  useTemplate(templateId) {
    return post(`/api/templates/${templateId}/use`)
  }
}

/**
 * 内容生成相关接口
 */
const content = {

  /**
   * 生成内容（统一接口）
   * @param {object} data 生成参数
   * @param {string} data.templateId 模板ID
   * @param {string} data.prompt 提示词
   * @param {string} data.type 生成类型（text-to-image, text-to-video, image-to-image）
   * @param {object} data.parameters 生成参数
   * @param {string} data.imageUrl 原图片URL（图片生成图片时使用）
   */
  generateContent(data) {
    return post('/api/contents/generate', data, {
      loading: true,
      loadingText: '生成中，请稍候...',
      timeout: 120000
    })
  },

  /**
   * 文本生成图片
   * @param {object} data 生成参数
   */
  textToImage(data) {
    return this.generateContent({
      ...data,
      type: 'text-to-image'
    })
  },

  /**
   * 文本生成视频
   * @param {object} data 生成参数
   */
  textToVideo(data) {
    return this.generateContent({
      ...data,
      type: 'text-to-video'
    })
  },

  /**
   * 图片生成图片
   * @param {object} data 生成参数
   */
  imageToImage(data) {
    return this.generateContent({
      ...data,
      type: 'image-to-image'
    })
  },

  /**
   * 获取生成内容详情
   * @param {string} contentId 内容ID
   */
  getContentDetail(contentId) {
    return get(`/api/contents/${contentId}`)
  },

  /**
   * 分页查询用户生成内容
   * @param {object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.size 每页数量
   * @param {string} params.type 内容类型
   * @param {string} params.status 状态
   */
  getUserContents(params = {}) {
    return get('/api/contents', params)
  },

  /**
   * 获取最近生成内容
   * @param {number} limit 数量限制
   */
  getRecentContents(limit = 10) {
    return get(`/api/contents/recent?limit=${limit}`)
  },

  /**
   * 删除生成内容
   * @param {string} contentId 内容ID
   */
  deleteContent(contentId) {
    return del(`/api/contents/${contentId}`, {}, {
      loading: true,
      loadingText: '删除中...'
    })
  },

  /**
   * 批量删除生成内容
   * @param {array} contentIds 内容ID数组
   */
  batchDeleteContents(contentIds) {
    return del('/api/contents/batch', { ids: contentIds }, {
      loading: true,
      loadingText: '删除中...'
    })
  }
}

/**
 * 模板分类相关接口
 */
const category = {
  /**
   * 获取所有启用分类
   */
  getAllCategories() {
    return get('/api/categories')
  },

  /**
   * 获取分类名称列表
   */
  getCategoryNames() {
    return get('/api/categories/names')
  },

  /**
   * 根据ID获取分类详情
   * @param {string} categoryId 分类ID
   */
  getCategoryById(categoryId) {
    return get(`/api/categories/${categoryId}`)
  },

  /**
   * 创建新分类
   * @param {object} data 分类数据
   */
  createCategory(data) {
    return post('/api/categories', data, {
      loading: true,
      loadingText: '创建中...'
    })
  },

  /**
   * 更新分类信息
   * @param {string} categoryId 分类ID
   * @param {object} data 分类数据
   */
  updateCategory(categoryId, data) {
    return put(`/api/categories/${categoryId}`, data, {
      loading: true,
      loadingText: '更新中...'
    })
  },

  /**
   * 删除分类
   * @param {string} categoryId 分类ID
   */
  deleteCategory(categoryId) {
    return del(`/api/categories/${categoryId}`, {}, {
      loading: true,
      loadingText: '删除中...'
    })
  },

  /**
   * 更新分类排序
   * @param {array} sortData 排序数据
   */
  updateCategorySort(sortData) {
    return put('/api/categories/sort', { sortData }, {
      loading: true,
      loadingText: '更新中...'
    })
  }
}

/**
 * 艺术风格相关接口
 */
const artStyle = {
  /**
   * 获取艺术风格列表
   */
  getArtStyles() {
    return get('/api/art-styles')
  },

  /**
   * 根据ID获取艺术风格
   * @param {string} styleId 风格ID
   */
  getArtStyleById(styleId) {
    return get(`/api/art-styles/${styleId}`)
  },

  /**
   * 创建艺术风格
   * @param {object} data 风格数据
   */
  createArtStyle(data) {
    return post('/api/art-styles', data, {
      loading: true,
      loadingText: '创建中...'
    })
  },

  /**
   * 更新艺术风格
   * @param {string} styleId 风格ID
   * @param {object} data 风格数据
   */
  updateArtStyle(styleId, data) {
    return put(`/api/art-styles/${styleId}`, data, {
      loading: true,
      loadingText: '更新中...'
    })
  },

  /**
   * 删除艺术风格
   * @param {string} styleId 风格ID
   */
  deleteArtStyle(styleId) {
    return del(`/api/art-styles/${styleId}`, {}, {
      loading: true,
      loadingText: '删除中...'
    })
  }
}

/**
 * 历史记录相关接口（实际为生成内容接口的别名）
 */
const history = {
  /**
   * 获取生成历史列表
   * @param {object} params 查询参数
   * @param {string} params.type 类型 image/video
   * @param {number} params.page 页码
   * @param {number} params.size 每页数量
   * @param {string} params.keyword 搜索关键词
   */
  getHistoryList(params = {}) {
    return get('/api/contents', params)
  },

  /**
   * 获取历史详情
   * @param {string} historyId 历史ID
   */
  getHistoryDetail(historyId) {
    return get(`/api/contents/${historyId}`)
  },

  /**
   * 删除历史记录
   * @param {string} historyId 历史ID
   */
  deleteHistory(historyId) {
    return del(`/api/contents/${historyId}`, {}, {
      loading: true,
      loadingText: '删除中...'
    })
  },

  /**
   * 批量删除历史记录
   * @param {Array} historyIds 历史ID数组
   */
  batchDeleteHistory(historyIds) {
    return del('/api/contents/batch', {
      ids: historyIds
    }, {
      loading: true,
      loadingText: '删除中...'
    })
  },

  /**
   * 收藏/取消收藏
   * @param {string} historyId 历史ID
   * @param {boolean} favorite 是否收藏
   */
  toggleFavorite(historyId, favorite) {
    return post(`/api/contents/${historyId}/favorite`, {
      favorite
    })
  },

  /**
   * 获取收藏列表
   * @param {object} params 查询参数
   */
  getFavoriteList(params = {}) {
    return get('/api/contents/favorites', params)
  }
}

/**
 * 文件上传相关接口
 */
const file = {
  /**
   * 上传图片
   * @param {string} filePath 文件路径
   * @param {object} options 上传选项
   */
  uploadImage(filePath, options = {}) {
    return upload('/api/file/upload-image', filePath, {
      name: 'image',
      loading: true,
      loadingText: '上传中...',
      ...options
    })
  },

  /**
   * 上传视频
   * @param {string} filePath 文件路径
   * @param {object} options 上传选项
   */
  uploadVideo(filePath, options = {}) {
    return upload('/api/file/upload-video', filePath, {
      name: 'video',
      loading: true,
      loadingText: '上传中...',
      ...options
    })
  },

  /**
   * 获取上传凭证
   * @param {string} fileType 文件类型
   * @param {string} fileName 文件名
   */
  getUploadCredentials(fileType, fileName) {
    return post('/api/file/upload-credentials', {
      file_type: fileType,
      file_name: fileName
    })
  }
}

/**
 * 用户配置相关接口
 */
const config = {
  /**
   * 获取用户配置
   */
  getUserConfig() {
    return get('/api/config/user')
  },

  /**
   * 更新用户配置
   * @param {object} data 配置数据
   */
  updateUserConfig(data) {
    return put('/api/config/user', data)
  },

  /**
   * 获取系统配置
   */
  getSystemConfig() {
    return get('/api/config/system')
  },

  /**
   * 获取生成参数配置
   * @param {string} type 类型 image/video
   */
  getGenerationConfig(type) {
    return get(`/api/config/generation/${type}`)
  }
}



/**
 * 反馈相关接口
 */
const feedback = {
  /**
   * 提交反馈
   * @param {object} data 反馈数据
   * @param {string} data.type 反馈类型
   * @param {string} data.content 反馈内容
   * @param {Array} data.images 图片列表
   */
  submitFeedback(data) {
    return post('/api/feedback/submit', data, {
      loading: true,
      loadingText: '提交中...'
    })
  },

  /**
   * 获取反馈列表
   * @param {object} params 查询参数
   */
  getFeedbackList(params = {}) {
    return get('/api/feedback/list', params)
  },

  /**
   * 获取反馈详情
   * @param {string} feedbackId 反馈ID
   */
  getFeedbackDetail(feedbackId) {
    return get(`/api/feedback/${feedbackId}`)
  }
}

/**
 * 分享相关接口
 */
const share = {
  /**
   * 生成分享链接
   * @param {object} data 分享数据
   * @param {string} data.content_id 内容ID
   * @param {string} data.type 分享类型
   */
  generateShareLink(data) {
    return post('/api/share/generate-link', data)
  },

  /**
   * 获取分享内容
   * @param {string} shareId 分享ID
   */
  getSharedContent(shareId) {
    return get(`/api/share/${shareId}`)
  },

  /**
   * 记录分享行为
   * @param {object} data 分享数据
   */
  trackShare(data) {
    return post('/api/share/track', data, {
      silent: true
    })
  }
}

/**
 * 通知相关接口
 */
const notification = {
  /**
   * 获取通知列表
   * @param {object} params 查询参数
   */
  getNotificationList(params = {}) {
    return get('/api/notification/list', params)
  },

  /**
   * 标记通知已读
   * @param {string} notificationId 通知ID
   */
  markAsRead(notificationId) {
    return post(`/api/notification/${notificationId}/read`)
  },

  /**
   * 批量标记已读
   * @param {Array} notificationIds 通知ID数组
   */
  batchMarkAsRead(notificationIds) {
    return post('/api/notification/batch-read', {
      notification_ids: notificationIds
    })
  },

  /**
   * 删除通知
   * @param {string} notificationId 通知ID
   */
  deleteNotification(notificationId) {
    return del(`/api/notification/${notificationId}`)
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount() {
    return get('/api/notification/unread-count')
  }
}

module.exports = {
  auth,
  user,
  template,
  content,
  category,
  artStyle,
  history,
  file,
  config,
  feedback,
  share,
  notification
}