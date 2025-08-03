# 设计文档

## 概述

本设计文档详细描述了文生视界移动端分离项目的技术架构、组件设计和实现方案。项目将在 `mobile` 目录下创建独立的移动端应用，使用 React + TypeScript + Vite 技术栈，配合 Vant UI 组件库，实现与PC端功能完全一致但针对移动端优化的用户体验。

## 架构

### 技术栈选择

**核心框架：**
- React 18.2.0 - 与PC端保持一致的React版本
- TypeScript 5.2.2 - 强类型支持，提高代码质量
- Vite 5.0.0 - 快速的构建工具，与PC端保持一致

**移动端UI框架：**
- Vant 4.x - 专业的移动端React UI组件库
- @vant/touch-emulator - 桌面端调试移动端手势的工具

**状态管理：**
- Zustand 4.4.7 - 轻量级状态管理，与PC端保持一致

**路由管理：**
- React Router DOM 6.20.1 - 与PC端保持一致的路由版本

**网络请求：**
- Axios 1.6.2 - 与PC端共享相同的API接口

**样式方案：**
- Tailwind CSS 3.3.6 - 基础样式框架
- PostCSS + Autoprefixer - CSS处理工具链

### 项目结构

```
mobile/
├── public/                 # 静态资源
│   ├── favicon.ico
│   └── manifest.json      # PWA配置
├── src/
│   ├── assets/            # 静态资源
│   ├── components/        # 组件目录
│   │   ├── common/        # 通用组件
│   │   ├── forms/         # 表单组件
│   │   └── ui/            # UI组件
│   ├── hooks/             # 自定义Hooks
│   ├── lib/               # 工具库
│   │   ├── api.ts         # API配置（复用PC端）
│   │   └── utils.ts       # 工具函数
│   ├── pages/             # 页面组件
│   │   ├── Home/          # 首页
│   │   ├── Generate/      # 生成页面
│   │   ├── Templates/     # 模板页面
│   │   ├── History/       # 历史记录
│   │   └── Profile/       # 个人中心
│   ├── store/             # 状态管理
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript类型定义
│   ├── App.tsx            # 应用根组件
│   ├── main.tsx           # 应用入口
│   └── vite-env.d.ts      # Vite类型声明
├── package.json           # 项目配置
├── vite.config.ts         # Vite配置
├── tailwind.config.js     # Tailwind配置
├── tsconfig.json          # TypeScript配置
└── README.md              # 项目说明
```

### 开发环境配置

**端口配置：**
- 移动端开发服务器：5175端口（避免与PC端5174端口冲突）
- 支持局域网访问，便于真机调试

**构建配置：**
- 移动端优化的构建配置
- PWA支持，提供类原生应用体验
- 资源压缩和优化

## 组件和接口

### 核心页面组件

#### 1. 首页 (Home)
**功能：** 产品介绍、用户引导、快速入口
**组件结构：**
```typescript
interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  // 产品介绍轮播
  // 功能特色展示
  // 登录注册入口
  // 快速生成入口
}
```

**移动端优化：**
- 使用 Vant 的 Swiper 组件实现产品介绍轮播
- 大按钮设计，触摸友好
- 垂直布局，适配小屏幕

#### 2. 生成页面 (Generate)
**功能：** 文本输入、参数设置、内容生成
**组件结构：**
```typescript
interface GenerateProps {}

const Generate: React.FC<GenerateProps> = () => {
  // 文本输入区域
  // 生成类型选择（图片/视频）
  // 参数设置面板
  // 艺术风格选择
  // 生成结果展示
}
```

**移动端优化：**
- 使用 Vant 的 Field 组件优化文本输入
- Picker 组件实现参数选择
- ActionSheet 实现艺术风格选择
- 全屏预览生成结果

#### 3. 模板页面 (Templates)
**功能：** 模板浏览、分类筛选、模板应用
**组件结构：**
```typescript
interface TemplatesProps {}

const Templates: React.FC<TemplatesProps> = () => {
  // 分类标签栏
  // 模板网格列表
  // 模板详情弹窗
  // 搜索功能
}
```

**移动端优化：**
- 使用 Vant 的 Tabs 组件实现分类切换
- Grid 组件展示模板列表
- Popup 组件显示模板详情
- 下拉刷新和上拉加载

#### 4. 历史记录 (History)
**功能：** 生成记录查看、内容管理、下载分享
**组件结构：**
```typescript
interface HistoryProps {}

const History: React.FC<HistoryProps> = () => {
  // 记录列表
  // 筛选和搜索
  // 批量操作
  // 分享功能
}
```

**移动端优化：**
- 使用 Vant 的 List 组件实现虚拟滚动
- SwipeCell 组件实现滑动操作
- 原生分享API集成

#### 5. 个人中心 (Profile)
**功能：** 用户信息、设置、登录状态管理
**组件结构：**
```typescript
interface ProfileProps {}

const Profile: React.FC<ProfileProps> = () => {
  // 用户信息展示
  // 设置选项
  // 登录/注册入口
  // 退出登录
}
```

### 底部导航组件

```typescript
interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'home', title: '首页', icon: 'home-o' },
    { key: 'generate', title: '生成', icon: 'photo-o' },
    { key: 'templates', title: '模板', icon: 'apps-o' },
    { key: 'history', title: '历史', icon: 'clock-o' },
    { key: 'profile', title: '我的', icon: 'user-o' }
  ];
  
  return (
    <Tabbar value={activeTab} onChange={onTabChange}>
      {tabs.map(tab => (
        <TabbarItem key={tab.key} name={tab.key} icon={tab.icon}>
          {tab.title}
        </TabbarItem>
      ))}
    </Tabbar>
  );
};
```

### API接口复用

移动端将完全复用PC端的API接口配置：

```typescript
// 直接复用 PC端的 api.ts 文件
import { authAPI, templateAPI, contentAPI, templateCategoryAPI } from '@/lib/api';

// 移动端特有的API扩展
export const mobileAPI = {
  // 设备信息上报
  reportDeviceInfo: async (deviceInfo: DeviceInfo) => {
    // 实现设备信息上报
  },
  
  // 分享统计
  reportShare: async (contentId: string, platform: string) => {
    // 实现分享统计
  }
};
```

## 数据模型

### 移动端特有的数据类型

```typescript
// 设备信息
interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  platform: string;
  isStandalone: boolean; // PWA模式
}

// 触摸事件数据
interface TouchEventData {
  type: 'tap' | 'swipe' | 'pinch';
  target: string;
  timestamp: number;
  coordinates?: { x: number; y: number };
}

// 分享数据
interface ShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}
```

### 状态管理扩展

```typescript
// 移动端特有的状态管理
interface MobileStore {
  // 底部导航状态
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // 设备信息
  deviceInfo: DeviceInfo | null;
  setDeviceInfo: (info: DeviceInfo) => void;
  
  // 网络状态
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  
  // 键盘状态
  isKeyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;
}
```

## 错误处理

### 移动端特有的错误处理

```typescript
class MobileErrorHandler {
  // 网络错误处理
  static handleNetworkError(error: Error) {
    if (!navigator.onLine) {
      Toast.fail('网络连接已断开，请检查网络设置');
      return;
    }
    Toast.fail('网络请求失败，请稍后重试');
  }
  
  // 设备兼容性错误
  static handleCompatibilityError(feature: string) {
    Toast.fail(`您的设备不支持${feature}功能`);
  }
  
  // 文件操作错误
  static handleFileError(error: Error) {
    if (error.message.includes('quota')) {
      Toast.fail('设备存储空间不足');
      return;
    }
    Toast.fail('文件操作失败');
  }
}
```

### 全局错误边界

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MobileErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('移动端应用错误:', error, errorInfo);
    // 上报错误到监控系统
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <Empty description="应用出现错误，请刷新页面重试" />
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 测试策略

### 单元测试
- 使用 Vitest 进行组件单元测试
- 覆盖核心业务逻辑和工具函数
- Mock 移动端特有的API（如分享、设备信息等）

### 集成测试
- 使用 React Testing Library 进行组件集成测试
- 测试页面间的导航和数据流
- 测试API接口的集成

### 移动端特有测试
- 触摸事件测试
- 响应式布局测试
- 设备兼容性测试
- 网络状态变化测试

### 真机测试策略
- iOS Safari 测试
- Android Chrome 测试
- 微信内置浏览器测试
- PWA 安装和使用测试

## 性能优化

### 移动端性能优化策略

1. **代码分割**
   - 路由级别的懒加载
   - 组件级别的动态导入
   - 第三方库的按需加载

2. **资源优化**
   - 图片懒加载和WebP格式支持
   - 字体文件优化
   - CSS和JS文件压缩

3. **网络优化**
   - API请求缓存策略
   - 离线数据缓存
   - 请求去重和防抖

4. **渲染优化**
   - 虚拟滚动实现
   - 防抖和节流优化
   - 避免不必要的重渲染

### PWA支持

```typescript
// PWA配置
const pwaConfig = {
  name: '文生视界移动版',
  short_name: 'TextVision',
  description: 'AI图文生成移动应用',
  theme_color: '#3B82F6',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};
```

## 部署配置

### 构建配置优化

```typescript
// vite.config.ts for mobile
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // PWA插件配置
  ],
  server: {
    port: 5175,
    host: '0.0.0.0',
    allowedHosts: ['frp-oil.com', 'localhost', '127.0.0.1', 'frp-off.com']
  },
  build: {
    // 移动端优化的构建配置
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['vant'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

### 环境变量配置

```typescript
// 移动端环境变量
interface MobileEnv {
  VITE_API_BASE_URL: string;
  VITE_APP_TITLE: string;
  VITE_MOBILE_PORT: string;
  VITE_ENABLE_PWA: string;
  VITE_ENABLE_VCONSOLE: string; // 移动端调试工具
}
```

这个设计文档涵盖了移动端项目的完整技术架构，确保与PC端功能保持一致的同时，提供优秀的移动端用户体验。