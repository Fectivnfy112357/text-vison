/**
 * 文生视界微信小程序 - 网络请求工具
 * 基于微信小程序 v3.9.0 基础库
 */

const { showToast, showLoading, hideLoading } = require('./utils.js')

// 配置常量
const CONFIG = {
  // 基础URL - 根据环境配置
  BASE_URL: 'http://localhost:8999',
  // 请求超时时间
  TIMEOUT: 30000,
  // 重试次数
  RETRY_COUNT: 3,
  // 重试延迟
  RETRY_DELAY: 1000
}

// 请求状态码
const STATUS_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  NETWORK_ERROR: -1
}

// 错误消息映射
const ERROR_MESSAGES = {
  [STATUS_CODE.UNAUTHORIZED]: '登录已过期，请重新登录',
  [STATUS_CODE.FORBIDDEN]: '没有权限访问',
  [STATUS_CODE.NOT_FOUND]: '请求的资源不存在',
  [STATUS_CODE.SERVER_ERROR]: '服务器内部错误',
  [STATUS_CODE.NETWORK_ERROR]: '网络连接失败，请检查网络设置'
}

/**
 * 请求拦截器
 */
class RequestInterceptor {
  constructor() {
    this.requestQueue = new Map() // 请求队列，用于防重复请求
    this.retryQueue = new Map() // 重试队列
  }

  /**
   * 生成请求唯一标识
   */
  generateRequestKey(options) {
    const { url, method = 'GET', data = {} } = options
    return `${method}:${url}:${JSON.stringify(data)}`
  }

  /**
   * 请求前处理
   */
  beforeRequest(options) {
    // 添加基础URL
    if (!options.url.startsWith('http')) {
      options.url = CONFIG.BASE_URL + options.url
    }

    // 设置默认超时时间
    if (!options.timeout) {
      options.timeout = CONFIG.TIMEOUT
    }

    // 设置默认请求头
    options.header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 添加认证token
    const token = wx.getStorageSync('access_token')
    if (token) {
      options.header.Authorization = `Bearer ${token}`
    }

    // 添加设备信息
    const systemInfo = wx.getSystemInfoSync()
    options.header['X-Device-Info'] = JSON.stringify({
      platform: systemInfo.platform,
      version: systemInfo.version,
      model: systemInfo.model,
      pixelRatio: systemInfo.pixelRatio,
      windowWidth: systemInfo.windowWidth,
      windowHeight: systemInfo.windowHeight
    })

    return options
  }

  /**
   * 响应后处理
   */
  afterResponse(response, options) {
    const { statusCode, data } = response

    // 处理HTTP状态码
    if (statusCode !== STATUS_CODE.SUCCESS) {
      return this.handleError({
        statusCode,
        message: ERROR_MESSAGES[statusCode] || '请求失败'
      }, options)
    }

    // 处理业务状态码
    if (data && data.code !== undefined) {
      if (data.code === 0 || data.code === 200) {
        return Promise.resolve(data.data || data)
      } else {
        return this.handleError({
          statusCode: data.code,
          message: data.message || data.msg || '业务处理失败'
        }, options)
      }
    }

    return Promise.resolve(data)
  }

  /**
   * 错误处理
   */
  handleError(error, options) {
    console.error('Request error:', error, options)

    // 处理登录过期
    if (error.statusCode === STATUS_CODE.UNAUTHORIZED) {
      this.handleUnauthorized()
      return Promise.reject(error)
    }

    // 处理网络错误重试
    if (error.statusCode === STATUS_CODE.NETWORK_ERROR) {
      return this.handleRetry(options, error)
    }

    // 显示错误提示
    if (!options.silent) {
      showToast(error.message || '请求失败', 'none')
    }

    return Promise.reject(error)
  }

  /**
   * 处理登录过期
   */
  handleUnauthorized() {
    // 清除本地存储的用户信息
    wx.removeStorageSync('access_token')
    wx.removeStorageSync('refresh_token')
    wx.removeStorageSync('user_info')

    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    })
  }

  /**
   * 处理重试
   */
  async handleRetry(options, error) {
    const requestKey = this.generateRequestKey(options)
    const retryInfo = this.retryQueue.get(requestKey) || { count: 0 }

    if (retryInfo.count < CONFIG.RETRY_COUNT) {
      retryInfo.count++
      this.retryQueue.set(requestKey, retryInfo)

      // 延迟重试
      await new Promise(resolve => {
        setTimeout(resolve, CONFIG.RETRY_DELAY * retryInfo.count)
      })

      console.log(`Retrying request (${retryInfo.count}/${CONFIG.RETRY_COUNT}):`, options.url)
      return this.request(options)
    } else {
      this.retryQueue.delete(requestKey)
      return Promise.reject(error)
    }
  }

  /**
   * 发起请求
   */
  request(options) {
    return new Promise((resolve, reject) => {
      // 防重复请求
      const requestKey = this.generateRequestKey(options)
      if (this.requestQueue.has(requestKey)) {
        return this.requestQueue.get(requestKey)
      }

      // 请求前处理
      const processedOptions = this.beforeRequest({ ...options })

      // 显示加载状态
      if (processedOptions.loading) {
        showLoading(processedOptions.loadingText || '请求中...')
      }

      // 创建请求Promise
      const requestPromise = new Promise((innerResolve, innerReject) => {
        wx.request({
          ...processedOptions,
          success: (response) => {
            this.afterResponse(response, processedOptions)
              .then(innerResolve)
              .catch(innerReject)
          },
          fail: (error) => {
            const networkError = {
              statusCode: STATUS_CODE.NETWORK_ERROR,
              message: error.errMsg || '网络请求失败'
            }
            this.handleError(networkError, processedOptions)
              .then(innerResolve)
              .catch(innerReject)
          },
          complete: () => {
            // 隐藏加载状态
            if (processedOptions.loading) {
              hideLoading()
            }
            // 从请求队列中移除
            this.requestQueue.delete(requestKey)
          }
        })
      })

      // 添加到请求队列
      this.requestQueue.set(requestKey, requestPromise)

      requestPromise.then(resolve).catch(reject)
    })
  }
}

// 创建请求实例
const requestInterceptor = new RequestInterceptor()

/**
 * 通用请求方法
 */
function request(options) {
  return requestInterceptor.request(options)
}

/**
 * GET请求
 */
function get(url, params = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST请求
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 */
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 文件上传
 */
function upload(url, filePath, options = {}) {
  return new Promise((resolve, reject) => {
    // 显示加载状态
    if (options.loading !== false) {
      showLoading(options.loadingText || '上传中...')
    }

    // 获取认证token
    const token = wx.getStorageSync('access_token')
    const header = {
      ...options.header
    }
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    wx.uploadFile({
      url: url.startsWith('http') ? url : CONFIG.BASE_URL + url,
      filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header,
      success: (response) => {
        try {
          const data = JSON.parse(response.data)
          if (data.code === 0 || data.code === 200) {
            resolve(data.data || data)
          } else {
            reject({
              statusCode: data.code,
              message: data.message || '上传失败'
            })
          }
        } catch (error) {
          reject({
            statusCode: STATUS_CODE.SERVER_ERROR,
            message: '响应数据解析失败'
          })
        }
      },
      fail: (error) => {
        reject({
          statusCode: STATUS_CODE.NETWORK_ERROR,
          message: error.errMsg || '上传失败'
        })
      },
      complete: () => {
        if (options.loading !== false) {
          hideLoading()
        }
      }
    })
  })
}

/**
 * 文件下载
 */
function download(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 显示加载状态
    if (options.loading !== false) {
      showLoading(options.loadingText || '下载中...')
    }

    // 获取认证token
    const token = wx.getStorageSync('access_token')
    const header = {
      ...options.header
    }
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    wx.downloadFile({
      url: url.startsWith('http') ? url : CONFIG.BASE_URL + url,
      header,
      success: (response) => {
        if (response.statusCode === STATUS_CODE.SUCCESS) {
          resolve(response.tempFilePath)
        } else {
          reject({
            statusCode: response.statusCode,
            message: '下载失败'
          })
        }
      },
      fail: (error) => {
        reject({
          statusCode: STATUS_CODE.NETWORK_ERROR,
          message: error.errMsg || '下载失败'
        })
      },
      complete: () => {
        if (options.loading !== false) {
          hideLoading()
        }
      }
    })
  })
}

/**
 * 批量请求
 */
function all(requests) {
  return Promise.all(requests)
}

/**
 * 竞速请求
 */
function race(requests) {
  return Promise.race(requests)
}

/**
 * 设置配置
 */
function setConfig(config) {
  Object.assign(CONFIG, config)
}

/**
 * 获取配置
 */
function getConfig() {
  return { ...CONFIG }
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  upload,
  download,
  all,
  race,
  setConfig,
  getConfig,
  STATUS_CODE,
  ERROR_MESSAGES
}