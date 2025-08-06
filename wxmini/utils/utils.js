/**
 * 文生视界微信小程序 - 工具函数库
 * 基于微信小程序 v3.9.0 基础库
 * 包含常用的工具函数和微信小程序API封装
 */

/**
 * 格式化时间
 * @param {Date|string|number} date 时间
 * @param {string} format 格式 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取相对时间
 * @param {Date|string|number} date 时间
 * @returns {string} 相对时间字符串
 */
function getRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  if (diff < 0) return '未来'
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < month) return `${Math.floor(diff / day)}天前`
  if (diff < year) return `${Math.floor(diff / month)}个月前`
  return `${Math.floor(diff / year)}年前`
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间(ms)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 延迟时间(ms)
 * @returns {Function} 节流后的函数
 */
function throttle(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) return
    timer = setTimeout(() => {
      func.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 深拷贝
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const cloned = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key])
    })
    return cloned
  }
  return obj
}

/**
 * 生成唯一ID
 * @param {number} length ID长度
 * @returns {string} 唯一ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

/**
 * 验证身份证号
 * @param {string} idCard 身份证号
 * @returns {boolean} 是否有效
 */
function validateIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 获取URL参数
 * @param {string} url URL地址
 * @returns {object} 参数对象
 */
function getUrlParams(url) {
  const params = {}
  const urlObj = new URL(url)
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

/**
 * 构建URL参数
 * @param {object} params 参数对象
 * @returns {string} URL参数字符串
 */
function buildUrlParams(params) {
  const searchParams = new URLSearchParams()
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      searchParams.append(key, params[key])
    }
  })
  return searchParams.toString()
}

/**
 * 数组去重
 * @param {Array} arr 数组
 * @param {string} key 去重字段(对象数组)
 * @returns {Array} 去重后的数组
 */
function uniqueArray(arr, key) {
  if (!Array.isArray(arr)) return []
  
  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  
  return [...new Set(arr)]
}

/**
 * 数组分组
 * @param {Array} arr 数组
 * @param {string|Function} key 分组字段或函数
 * @returns {object} 分组后的对象
 */
function groupBy(arr, key) {
  if (!Array.isArray(arr)) return {}
  
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {})
}

/**
 * 数字格式化
 * @param {number} num 数字
 * @param {number} precision 精度
 * @returns {string} 格式化后的数字
 */
function formatNumber(num, precision = 2) {
  if (isNaN(num)) return '0'
  
  if (num >= 100000000) {
    return (num / 100000000).toFixed(precision) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(precision) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(precision) + 'K'
  }
  
  return num.toString()
}

/**
 * 颜色转换
 * @param {string} color 颜色值
 * @param {number} alpha 透明度
 * @returns {string} RGBA颜色值
 */
function hexToRgba(color, alpha = 1) {
  if (!color) return 'rgba(0, 0, 0, 0)'
  
  // 移除 # 号
  color = color.replace('#', '')
  
  // 3位转6位
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('')
  }
  
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 存储管理
 */
const storage = {
  /**
   * 设置存储
   * @param {string} key 键
   * @param {any} value 值
   * @param {number} expire 过期时间(秒)
   */
  set(key, value, expire) {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null
    }
    try {
      wx.setStorageSync(key, JSON.stringify(data))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },
  
  /**
   * 获取存储
   * @param {string} key 键
   * @returns {any} 值
   */
  get(key) {
    try {
      const dataStr = wx.getStorageSync(key)
      if (!dataStr) return null
      
      const data = JSON.parse(dataStr)
      
      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return null
      }
      
      return data.value
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },
  
  /**
   * 删除存储
   * @param {string} key 键
   */
  remove(key) {
    try {
      wx.removeStorageSync(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  },
  
  /**
   * 清空存储
   */
  clear() {
    try {
      wx.clearStorageSync()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }
}

/**
 * 显示提示
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 持续时间
 */
function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title,
    icon,
    duration
  })
}

/**
 * 显示加载
 * @param {string} title 加载文本
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示确认框
 * @param {string} content 内容
 * @param {string} title 标题
 * @returns {Promise<boolean>} 是否确认
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success(res) {
        resolve(res.confirm)
      },
      fail() {
        resolve(false)
      }
    })
  })
}

/**
 * 页面跳转
 * @param {string} url 页面路径
 * @param {object} params 参数
 */
function navigateTo(url, params = {}) {
  const query = buildUrlParams(params)
  const fullUrl = query ? `${url}?${query}` : url
  
  wx.navigateTo({
    url: fullUrl,
    fail(error) {
      console.error('Navigate error:', error)
      showToast('页面跳转失败')
    }
  })
}

/**
 * 页面重定向
 * @param {string} url 页面路径
 * @param {object} params 参数
 */
function redirectTo(url, params = {}) {
  const query = buildUrlParams(params)
  const fullUrl = query ? `${url}?${query}` : url
  
  wx.redirectTo({
    url: fullUrl,
    fail(error) {
      console.error('Redirect error:', error)
      showToast('页面跳转失败')
    }
  })
}

/**
 * 返回上一页
 * @param {number} delta 返回层数
 */
function navigateBack(delta = 1) {
  wx.navigateBack({
    delta,
    fail(error) {
      console.error('Navigate back error:', error)
    }
  })
}

/**
 * 切换到标签页
 * @param {string} url 页面路径
 */
function switchTab(url) {
  wx.switchTab({
    url,
    fail(error) {
      console.error('Switch tab error:', error)
      showToast('页面切换失败')
    }
  })
}

/**
 * 重新启动到某页面
 * @param {string} url 页面路径
 * @param {object} params 参数
 */
function reLaunch(url, params = {}) {
  const query = buildUrlParams(params)
  const fullUrl = query ? `${url}?${query}` : url
  
  wx.reLaunch({
    url: fullUrl,
    fail(error) {
      console.error('ReLaunch error:', error)
      showToast('页面重启失败')
    }
  })
}

module.exports = {
  formatTime,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  generateId,
  formatFileSize,
  validatePhone,
  validateEmail,
  validateIdCard,
  getUrlParams,
  buildUrlParams,
  uniqueArray,
  groupBy,
  formatNumber,
  hexToRgba,
  storage,
  // 存储方法的直接导出，兼容旧代码
  getStorageSync: storage.get.bind(storage),
  setStorageSync: storage.set.bind(storage),
  removeStorageSync: storage.remove.bind(storage),
  clearStorageSync: storage.clear.bind(storage),
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  navigateTo,
  redirectTo,
  navigateBack,
  switchTab,
  reLaunch
}