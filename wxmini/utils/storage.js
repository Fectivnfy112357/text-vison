// utils/storage.js
// 本地存储工具类

class Storage {
  constructor() {
    this.prefix = 'textvision_'
    this.cache = new Map()
    this.cacheExpiry = new Map()
  }

  /**
   * 生成存储键名
   */
  getKey(key) {
    return this.prefix + key
  }

  /**
   * 设置数据
   */
  set(key, value, expiry = null) {
    try {
      const storageKey = this.getKey(key)
      const data = {
        value,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : null
      }
      
      wx.setStorageSync(storageKey, data)
      
      // 更新内存缓存
      this.cache.set(key, value)
      if (expiry) {
        this.cacheExpiry.set(key, Date.now() + expiry)
      }
      
      return true
    } catch (error) {
      console.error('存储数据失败:', error)
      return false
    }
  }

  /**
   * 获取数据
   */
  get(key, defaultValue = null) {
    try {
      // 先检查内存缓存
      if (this.cache.has(key)) {
        const expiry = this.cacheExpiry.get(key)
        if (!expiry || Date.now() < expiry) {
          return this.cache.get(key)
        } else {
          // 缓存过期，清除
          this.cache.delete(key)
          this.cacheExpiry.delete(key)
        }
      }
      
      const storageKey = this.getKey(key)
      const data = wx.getStorageSync(storageKey)
      
      if (!data) {
        return defaultValue
      }
      
      // 检查是否过期
      if (data.expiry && Date.now() > data.expiry) {
        this.remove(key)
        return defaultValue
      }
      
      // 更新内存缓存
      this.cache.set(key, data.value)
      if (data.expiry) {
        this.cacheExpiry.set(key, data.expiry)
      }
      
      return data.value
    } catch (error) {
      console.error('获取数据失败:', error)
      return defaultValue
    }
  }

  /**
   * 删除数据
   */
  remove(key) {
    try {
      const storageKey = this.getKey(key)
      wx.removeStorageSync(storageKey)
      
      // 清除内存缓存
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      
      return true
    } catch (error) {
      console.error('删除数据失败:', error)
      return false
    }
  }

  /**
   * 检查数据是否存在
   */
  has(key) {
    try {
      const value = this.get(key)
      return value !== null
    } catch (error) {
      return false
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    try {
      const info = wx.getStorageInfoSync()
      const keys = info.keys.filter(key => key.startsWith(this.prefix))
      
      keys.forEach(key => {
        wx.removeStorageSync(key)
      })
      
      // 清空内存缓存
      this.cache.clear()
      this.cacheExpiry.clear()
      
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  /**
   * 获取所有键名
   */
  keys() {
    try {
      const info = wx.getStorageInfoSync()
      return info.keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))
    } catch (error) {
      console.error('获取键名失败:', error)
      return []
    }
  }

  /**
   * 获取存储大小信息
   */
  getStorageInfo() {
    try {
      return wx.getStorageInfoSync()
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0
      }
    }
  }

  /**
   * 异步设置数据
   */
  setAsync(key, value, expiry = null) {
    return new Promise((resolve, reject) => {
      try {
        const storageKey = this.getKey(key)
        const data = {
          value,
          timestamp: Date.now(),
          expiry: expiry ? Date.now() + expiry : null
        }
        
        wx.setStorage({
          key: storageKey,
          data,
          success: () => {
            // 更新内存缓存
            this.cache.set(key, value)
            if (expiry) {
              this.cacheExpiry.set(key, Date.now() + expiry)
            }
            resolve(true)
          },
          fail: reject
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 异步获取数据
   */
  getAsync(key, defaultValue = null) {
    return new Promise((resolve, reject) => {
      try {
        // 先检查内存缓存
        if (this.cache.has(key)) {
          const expiry = this.cacheExpiry.get(key)
          if (!expiry || Date.now() < expiry) {
            resolve(this.cache.get(key))
            return
          } else {
            // 缓存过期，清除
            this.cache.delete(key)
            this.cacheExpiry.delete(key)
          }
        }
        
        const storageKey = this.getKey(key)
        
        wx.getStorage({
          key: storageKey,
          success: (res) => {
            const data = res.data
            
            if (!data) {
              resolve(defaultValue)
              return
            }
            
            // 检查是否过期
            if (data.expiry && Date.now() > data.expiry) {
              this.remove(key)
              resolve(defaultValue)
              return
            }
            
            // 更新内存缓存
            this.cache.set(key, data.value)
            if (data.expiry) {
              this.cacheExpiry.set(key, data.expiry)
            }
            
            resolve(data.value)
          },
          fail: () => {
            resolve(defaultValue)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 批量设置数据
   */
  setBatch(data, expiry = null) {
    const promises = Object.entries(data).map(([key, value]) => {
      return this.setAsync(key, value, expiry)
    })
    
    return Promise.all(promises)
  }

  /**
   * 批量获取数据
   */
  getBatch(keys, defaultValue = null) {
    const promises = keys.map(key => {
      return this.getAsync(key, defaultValue)
    })
    
    return Promise.all(promises)
  }

  /**
   * 清理过期数据
   */
  cleanExpired() {
    try {
      const keys = this.keys()
      const now = Date.now()
      
      keys.forEach(key => {
        const storageKey = this.getKey(key)
        const data = wx.getStorageSync(storageKey)
        
        if (data && data.expiry && now > data.expiry) {
          this.remove(key)
        }
      })
      
      return true
    } catch (error) {
      console.error('清理过期数据失败:', error)
      return false
    }
  }

  /**
   * 获取数据大小（字节）
   */
  getDataSize(key) {
    try {
      const value = this.get(key)
      if (value === null) {
        return 0
      }
      
      const jsonString = JSON.stringify(value)
      return new Blob([jsonString]).size
    } catch (error) {
      console.error('获取数据大小失败:', error)
      return 0
    }
  }

  /**
   * 数据压缩存储
   */
  setCompressed(key, value, expiry = null) {
    try {
      // 简单的压缩：移除JSON中的空格
      const compressed = JSON.stringify(value)
      return this.set(key, compressed, expiry)
    } catch (error) {
      console.error('压缩存储失败:', error)
      return false
    }
  }

  /**
   * 获取压缩数据
   */
  getCompressed(key, defaultValue = null) {
    try {
      const compressed = this.get(key, null)
      if (compressed === null) {
        return defaultValue
      }
      
      return JSON.parse(compressed)
    } catch (error) {
      console.error('解压数据失败:', error)
      return defaultValue
    }
  }
}

// 创建全局实例
const storage = new Storage()

// 定期清理过期数据
setInterval(() => {
  storage.cleanExpired()
}, 60000) // 每分钟清理一次

module.exports = {
  storage
}