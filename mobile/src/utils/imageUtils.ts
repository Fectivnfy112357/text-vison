/**
 * 图片工具函数
 */

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

// 图片缓存
const imageCache = new Map<string, ImageDimensions>()

// 预加载队列
class ImagePreloadQueue {
  private queue: Array<{ url: string; resolve: Function; reject: Function }> = []
  private activeLoading = 0
  private maxConcurrent = 2 // 最大并发数

  add(url: string): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject })
      this.process()
    })
  }

  private process() {
    while (this.activeLoading < this.maxConcurrent && this.queue.length > 0) {
      const { url, resolve, reject } = this.queue.shift()!
      this.activeLoading++
      
      this.loadImage(url)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.activeLoading--
          this.process()
        })
    }
  }

  private async loadImage(url: string): Promise<ImageDimensions> {
    // 检查缓存
    if (imageCache.has(url)) {
      return imageCache.get(url)!
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        const dimensions: ImageDimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        }
        
        // 缓存结果
        imageCache.set(url, dimensions)
        resolve(dimensions)
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`))
      }
      
      img.src = url
    })
  }
}

const preloadQueue = new ImagePreloadQueue()

// 清理缓存（内存管理）
export function clearImageCache() {
  imageCache.clear()
}

// 限制缓存大小
const MAX_CACHE_SIZE = 100
function manageCacheSize() {
  if (imageCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(imageCache.keys()).slice(0, imageCache.size - MAX_CACHE_SIZE)
    keysToDelete.forEach(key => imageCache.delete(key))
  }
}

/**
 * 计算图片宽高比
 * @param width 图片宽度
 * @param height 图片高度
 * @returns 宽高比
 */
export function calculateAspectRatio(width: number, height: number): number {
  if (height === 0) return 1 // 避免除零错误
  return width / height
}

/**
 * 预加载图片并获取尺寸（使用队列和缓存）
 * @param imageUrl 图片URL
 * @returns Promise<ImageDimensions>
 */
export function preloadImage(imageUrl: string): Promise<ImageDimensions> {
  // 管理缓存大小
  manageCacheSize()
  
  // 使用队列加载
  return preloadQueue.add(imageUrl)
}

/**
 * 根据宽高比获取CSS类名
 * @param aspectRatio 宽高比
 * @returns Tailwind CSS类名
 */
export function getAspectRatioClass(aspectRatio: number): string {
  if (aspectRatio > 2) return 'aspect-[3/1]' // 超宽屏
  if (aspectRatio > 1.8) return 'aspect-[16/9]' // 宽屏
  if (aspectRatio > 1.5) return 'aspect-[4/3]' // 标准
  if (aspectRatio > 1.2) return 'aspect-[5/4]' // 接近正方形
  if (aspectRatio > 0.8) return 'aspect-[1/1]' // 正方形
  if (aspectRatio > 0.6) return 'aspect-[3/4]' // 竖屏
  return 'aspect-[9/16]' // 超竖屏
}

/**
 * 根据宽高比获取样式对象
 * @param aspectRatio 宽高比
 * @returns CSS样式对象
 */
export function getAspectRatioStyle(aspectRatio: number): React.CSSProperties {
  return {
    aspectRatio: aspectRatio.toString()
  }
}

/**
 * 为模板生成随机宽高比（用于演示）
 * @returns 随机宽高比
 */
export function generateRandomAspectRatio(): number {
  const commonRatios = [
    16/9,  // 1.78 - 宽屏
    4/3,   // 1.33 - 标准
    1/1,   // 1.00 - 正方形
    3/4,   // 0.75 - 竖屏
    9/16,  // 0.56 - 超竖屏
    21/9,  // 2.33 - 超宽屏
    3/2,   // 1.50 - 3:2
    2/3    // 0.67 - 2:3
  ]
  return commonRatios[Math.floor(Math.random() * commonRatios.length)]
}

/**
 * 批量预加载图片
 * @param imageUrls 图片URL数组
 * @param batchSize 批量大小
 * @returns Promise<ImageDimensions[]>
 */
export async function batchPreloadImages(
  imageUrls: string[], 
  batchSize: number = 5
): Promise<ImageDimensions[]> {
  const results: ImageDimensions[] = []
  
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize)
    const batchPromises = batch.map(url => 
      preloadImage(url).catch(() => ({
        width: 16,
        height: 9,
        aspectRatio: 16/9
      }))
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // 避免同时加载太多图片，添加延迟
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}