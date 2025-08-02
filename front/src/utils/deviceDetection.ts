/**
 * 设备检测工具函数
 */

// 检测是否为移动设备
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone',
    'mobile', 'tablet', 'kindle', 'silk', 'opera mini'
  ];
  
  // 检查用户代理字符串
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // 检查屏幕尺寸（宽度小于768px认为是移动设备）
  const isMobileScreen = window.innerWidth < 768;
  
  // 检查触摸支持
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || (isMobileScreen && hasTouchSupport);
};

// 检测是否为平板设备
export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const tabletKeywords = ['ipad', 'tablet', 'kindle', 'silk'];
  
  const isTabletUA = tabletKeywords.some(keyword => userAgent.includes(keyword));
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isTabletUA || (isTabletScreen && hasTouchSupport);
};

// 检测是否为桌面设备
export const isDesktopDevice = (): boolean => {
  return !isMobileDevice() && !isTabletDevice();
};

// 获取设备类型
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
};

// 检查是否应该跳转到移动端
export const shouldRedirectToMobile = (): boolean => {
  // 检查是否已经手动选择了桌面版本
  const preferDesktop = localStorage.getItem('prefer-desktop') === 'true';
  if (preferDesktop) return false;
  
  // 检查是否为移动设备或平板
  return isMobileDevice() || isTabletDevice();
};

// 检查是否应该跳转到桌面端
export const shouldRedirectToDesktop = (): boolean => {
  // 检查是否已经手动选择了移动版本
  const preferMobile = localStorage.getItem('prefer-mobile') === 'true';
  if (preferMobile) return false;
  
  // 检查是否为桌面设备
  return isDesktopDevice();
};

// 设置用户偏好
export const setDevicePreference = (preference: 'desktop' | 'mobile' | 'auto') => {
  if (preference === 'auto') {
    localStorage.removeItem('prefer-desktop');
    localStorage.removeItem('prefer-mobile');
  } else if (preference === 'desktop') {
    localStorage.setItem('prefer-desktop', 'true');
    localStorage.removeItem('prefer-mobile');
  } else if (preference === 'mobile') {
    localStorage.setItem('prefer-mobile', 'true');
    localStorage.removeItem('prefer-desktop');
  }
};

// 获取移动端URL
export const getMobileUrl = (): string => {
  const currentUrl = new URL(window.location.href);
  // 将端口改为5175（移动端端口）
  currentUrl.port = '5175';
  return currentUrl.toString();
};

// 获取桌面端URL
export const getDesktopUrl = (): string => {
  const currentUrl = new URL(window.location.href);
  // 将端口改为5174（桌面端端口）
  currentUrl.port = '5174';
  return currentUrl.toString();
};