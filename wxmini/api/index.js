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
    return get('/api/contents/stats')
  },

  /**
   * 获取会员信息
   */
  getMemberInfo() {
    return get('/api/users/profile')
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
  },

  /**
   * 收藏/取消收藏模板
   * @param {object} data 收藏数据
   * @param {string} data.template_id 模板ID
   * @param {string} data.action 操作类型 favorite/unfavorite
   */
  favoriteTemplate(data) {
    return post('/api/templates/favorite', data, {
      loading: true,
      loadingText: '操作中...'
    })
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
  },

  /**
   * 获取任务状态
   * @param {string} taskId 任务ID
   */
  getTaskStatus(taskId) {
    return get(`/api/contents/task/${taskId}/status`)
  },

  /**
   * 获取任务结果
   * @param {string} taskId 任务ID
   */
  getTaskResult(taskId) {
    return get(`/api/contents/task/${taskId}/result`)
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
 * 全局API接口（兼容旧版本调用方式）
 */
const api = {
  /**
   * 获取生成历史
   * @param {object} params 查询参数
   */
  getGenerationHistory(params = {}) {
    return get('/api/contents', params)
  },

  /**
   * 获取生成统计
   */
  getGenerationStatistics() {
    return get('/api/contents/stats')
  },

  /**
   * 删除生成历史
   * @param {object} data 删除数据
   * @param {string} data.id 单个ID
   * @param {array} data.ids 批量ID数组
   */
  deleteGenerationHistory(data) {
    if (data.id) {
      return del(`/api/contents/${data.id}`, {}, {
        loading: true,
        loadingText: '删除中...'
      })
    } else if (data.ids && data.ids.length > 0) {
      return del('/api/contents/batch', { ids: data.ids }, {
        loading: true,
        loadingText: '删除中...'
      })
    }
    return Promise.reject(new Error('缺少删除参数'))
  },

  /**
   * 收藏模板
   * @param {object} data 收藏数据
   */
  favoriteTemplate(data) {
    return template.favoriteTemplate(data)
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
  // 全局API接口
  getGenerationHistory: api.getGenerationHistory,
  getGenerationStatistics: api.getGenerationStatistics,
  deleteGenerationHistory: api.deleteGenerationHistory,
  favoriteTemplate: api.favoriteTemplate
}