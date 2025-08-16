/**
 * 设备检测工具函数
 * 用于判断当前设备是否为移动设备
 */

/**
 * 检测是否为移动设备
 * @returns {boolean} 如果是移动设备返回 true，否则返回 false
 */
export const isMobileDevice = (): boolean => {
  // 检查 User Agent
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile', 'tablet'
  ];
  
  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // 检查屏幕宽度（移动设备通常小于768px）
  const isMobileScreen = window.innerWidth <= 768;
  
  // 检查触摸支持
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 综合判断：满足任意两个条件即认为是移动设备
  const conditions = [isMobileUserAgent, isMobileScreen, hasTouchSupport];
  const trueCount = conditions.filter(Boolean).length;
  
  return trueCount >= 2;
};

/**
 * 检测是否为PC设备
 * @returns {boolean} 如果是PC设备返回 true，否则返回 false
 */
export const isPCDevice = (): boolean => {
  return !isMobileDevice();
};

/**
 * 获取当前设备类型
 * @returns {'mobile' | 'pc'} 设备类型
 */
export const getDeviceType = (): 'mobile' | 'pc' => {
  return isMobileDevice() ? 'mobile' : 'pc';
};