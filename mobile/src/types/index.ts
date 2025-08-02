// 移动端特有的类型定义

// 设备信息
export interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  platform: string;
  isStandalone: boolean; // PWA模式
}

// 触摸事件数据
export interface TouchEventData {
  type: 'tap' | 'swipe' | 'pinch';
  target: string;
  timestamp: number;
  coordinates?: { x: number; y: number };
}

// 分享数据
export interface ShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

// 底部导航项
export interface TabItem {
  key: string;
  title: string;
  icon: string;
  path: string;
}

// 移动端页面属性
export interface MobilePageProps {
  title?: string;
  showHeader?: boolean;
  showTabBar?: boolean;
  className?: string;
}

// 网络状态
export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

// 移动端特有的API响应
export interface MobileApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  deviceId?: string;
}