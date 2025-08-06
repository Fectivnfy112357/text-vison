# 文生视界微信小程序 - 技术设计文档

## 1. 设计理念与整体方案

### 设计哲学
- **微信生态优先**: 充分利用微信小程序的原生能力和生态优势
- **代码复用最大化**: 复用现有移动端的业务逻辑和API接口
- **性能与体验并重**: 在保证功能完整性的同时优化加载速度和交互体验
- **渐进式开发**: 采用MVP方式，优先实现核心功能，后续迭代增强

### 整体架构策略
- **前端**: 微信小程序原生开发，使用TypeScript提升代码质量
- **后端**: 复用现有Spring Boot API，无需修改
- **认证**: 集成微信登录，与现有用户系统打通
- **数据同步**: 保持与移动端完全一致的数据结构和业务逻辑

## 2. 技术栈选择与理由

### 前端技术栈
- **开发框架**: 微信小程序原生框架
  - *理由*: 最佳性能和完整的微信生态集成
- **开发语言**: TypeScript
  - *理由*: 类型安全，提升开发效率和代码质量
- **UI组件库**: WeUI + 自定义组件
  - *理由*: 符合微信设计规范，保持一致的用户体验
- **状态管理**: 小程序原生 + 自定义Store模式
  - *理由*: 轻量级，避免过度工程化
- **网络请求**: wx.request + 封装的API层
  - *理由*: 原生性能最佳，便于错误处理和拦截

### 后端技术栈（复用现有）
- **框架**: Spring Boot
- **数据库**: MySQL
- **认证**: JWT + 微信OpenID绑定
- **文件存储**: 现有的云存储方案
- **AI服务**: 现有的图片/视频生成API

### 开发工具
- **IDE**: 微信开发者工具
- **版本控制**: Git
- **包管理**: npm
- **构建工具**: 微信小程序原生构建

## 3. 功能组件架构

### 3.1 页面层级结构
```
小程序页面架构
├── 首页 (Home)
│   ├── 欢迎区域
│   ├── 快速创作入口
│   ├── 热门模板展示
│   └── 功能导航
├── 创作页面 (Create)
│   ├── 文本输入组件
│   ├── 参数设置组件
│   ├── 风格选择组件
│   └── 生成结果展示
├── 历史记录 (History)
│   ├── 作品列表组件
│   ├── 筛选组件
│   └── 搜索组件
├── 模板库 (Templates)
│   ├── 分类导航
│   ├── 模板网格
│   └── 模板详情
└── 个人中心 (Profile)
    ├── 用户信息展示
    ├── 统计数据
    ├── 设置选项
    └── 关于页面
```

### 3.2 核心组件设计

#### 认证组件 (AuthManager)
- **职责**: 处理微信登录、token管理、用户状态维护
- **核心方法**:
  - `wxLogin()`: 微信授权登录
  - `checkAuthStatus()`: 检查登录状态
  - `refreshToken()`: 刷新访问令牌
  - `logout()`: 登出清理

#### 网络请求组件 (ApiClient)
- **职责**: 封装网络请求，处理错误和重试
- **核心方法**:
  - `request()`: 通用请求方法
  - `uploadFile()`: 文件上传
  - `downloadFile()`: 文件下载
  - `handleError()`: 统一错误处理

#### 内容生成组件 (ContentGenerator)
- **职责**: 处理图片/视频生成逻辑
- **核心方法**:
  - `generateImage()`: 图片生成
  - `generateVideo()`: 视频生成
  - `checkProgress()`: 查询生成进度
  - `cancelGeneration()`: 取消生成

#### 微信能力组件 (WechatUtils)
- **职责**: 封装微信小程序特有能力
- **核心方法**:
  - `shareToFriends()`: 分享给好友
  - `shareToTimeline()`: 分享到朋友圈
  - `saveToAlbum()`: 保存到相册
  - `showSubscribeMessage()`: 订阅消息

## 4. 代码与目录结构

```
wxmini/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
├── sitemap.json          # 站点地图
├── pages/                # 页面目录
│   ├── index/            # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── create/           # 创作页面
│   │   ├── create.js
│   │   ├── create.json
│   │   ├── create.wxml
│   │   └── create.wxss
│   ├── history/          # 历史记录
│   ├── templates/        # 模板库
│   └── profile/          # 个人中心
├── components/           # 自定义组件
│   ├── auth-modal/       # 登录弹窗
│   ├── content-card/     # 内容卡片
│   ├── style-picker/     # 风格选择器
│   ├── progress-bar/     # 进度条
│   └── share-panel/      # 分享面板
├── utils/                # 工具函数
│   ├── api.js           # API封装
│   ├── auth.js          # 认证工具
│   ├── storage.js       # 存储工具
│   ├── wechat.js        # 微信能力封装
│   └── constants.js     # 常量定义
├── store/                # 状态管理
│   ├── auth.js          # 认证状态
│   ├── content.js       # 内容状态
│   └── user.js          # 用户状态
├── styles/               # 样式文件
│   ├── common.wxss      # 通用样式
│   ├── variables.wxss   # 样式变量
│   └── components.wxss  # 组件样式
└── assets/               # 静态资源
    ├── images/          # 图片资源
    └── icons/           # 图标资源
```

## 5. 核心数据设计

### 5.1 数据结构定义

#### 用户数据结构
```typescript
interface User {
  id: string
  openid: string          // 微信OpenID
  unionid?: string        // 微信UnionID
  name: string
  avatar: string
  email?: string
  phone?: string
  bio?: string
  createdAt: string
  updatedAt: string
  stats: {
    totalGenerations: number
    totalFavorites: number
    totalShares: number
  }
}
```

#### 内容生成参数
```typescript
interface GenerationParams {
  prompt: string
  type: 'image' | 'video'
  style?: string
  size?: string
  quality?: string
  duration?: number       // 视频时长（秒）
  watermark?: boolean
  referenceImage?: string
}
```

#### 生成结果数据
```typescript
interface GenerationResult {
  id: string
  userId: string
  type: 'image' | 'video'
  prompt: string
  params: GenerationParams
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  resultUrl?: string
  thumbnailUrl?: string
  createdAt: string
  completedAt?: string
  error?: string
}
```

### 5.2 本地存储策略

#### 存储内容
- **用户Token**: 存储在wx.getStorageSync中，用于自动登录
- **用户信息**: 缓存基本用户信息，减少网络请求
- **生成历史**: 缓存最近的生成记录，支持离线浏览
- **应用设置**: 用户偏好设置（主题、通知等）

#### 存储键名规范
```javascript
const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  GENERATION_HISTORY: 'generation_history',
  APP_SETTINGS: 'app_settings',
  TEMPLATE_CACHE: 'template_cache'
}
```

### 5.3 API接口设计

#### 认证相关接口
```typescript
// 微信登录
POST /api/auth/wechat/login
Body: { code: string, userInfo: WechatUserInfo }
Response: { token: string, user: User }

// 获取用户信息
GET /api/users/profile
Headers: { Authorization: 'Bearer <token>' }
Response: { user: User }
```

#### 内容生成接口（复用现有）
```typescript
// 生成图片
POST /api/content/generate/image
Body: ImageGenerationParams
Response: { taskId: string }

// 生成视频
POST /api/content/generate/video
Body: VideoGenerationParams
Response: { taskId: string }

// 查询生成状态
GET /api/content/task/{taskId}
Response: GenerationResult
```

## 6. 微信小程序特有功能实现

### 6.1 微信登录流程
```javascript
// 微信登录实现
const wxLogin = async () => {
  try {
    // 1. 获取微信授权码
    const { code } = await wx.login()
    
    // 2. 获取用户信息授权
    const { userInfo } = await wx.getUserProfile({
      desc: '用于完善用户资料'
    })
    
    // 3. 发送到后端验证
    const response = await api.post('/auth/wechat/login', {
      code,
      userInfo
    })
    
    // 4. 保存token和用户信息
    wx.setStorageSync('user_token', response.token)
    wx.setStorageSync('user_info', response.user)
    
    return response.user
  } catch (error) {
    console.error('微信登录失败:', error)
    throw error
  }
}
```

### 6.2 分享功能实现
```javascript
// 分享到好友
const shareToFriends = (content) => {
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  
  // 自定义分享内容
  wx.onShareAppMessage(() => {
    return {
      title: `我用AI生成了这个作品：${content.prompt}`,
      path: `/pages/detail/detail?id=${content.id}`,
      imageUrl: content.thumbnailUrl
    }
  })
}

// 保存到相册
const saveToAlbum = async (imageUrl) => {
  try {
    // 1. 请求保存权限
    await wx.authorize({ scope: 'scope.writePhotosAlbum' })
    
    // 2. 下载图片
    const { tempFilePath } = await wx.downloadFile({ url: imageUrl })
    
    // 3. 保存到相册
    await wx.saveImageToPhotosAlbum({ filePath: tempFilePath })
    
    wx.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    wx.showToast({ title: '保存失败', icon: 'error' })
  }
}
```

### 6.3 订阅消息实现
```javascript
// 订阅生成完成通知
const subscribeGenerationNotice = async () => {
  try {
    await wx.requestSubscribeMessage({
      tmplIds: ['生成完成通知模板ID'],
      success: (res) => {
        console.log('订阅成功:', res)
      }
    })
  } catch (error) {
    console.error('订阅失败:', error)
  }
}
```

## 7. 性能优化策略

### 7.1 加载性能优化
- **分包加载**: 将模板库等非核心功能设为分包
- **图片懒加载**: 使用小程序原生的lazy-load
- **预加载**: 关键页面使用预加载机制
- **缓存策略**: 合理使用本地缓存减少网络请求

### 7.2 运行时性能优化
- **长列表优化**: 使用recycle-view处理大量数据
- **防抖节流**: 对搜索、滚动等操作进行优化
- **内存管理**: 及时清理不需要的数据和监听器

### 7.3 网络请求优化
- **请求合并**: 合并可以批量处理的请求
- **重试机制**: 网络失败时自动重试
- **超时处理**: 设置合理的请求超时时间
- **错误处理**: 统一的错误处理和用户提示

## 8. 安全与合规

### 8.1 数据安全
- **HTTPS传输**: 所有网络请求使用HTTPS
- **Token安全**: JWT token安全存储和传输
- **敏感信息**: 不在小程序端存储敏感信息

### 8.2 内容安全
- **内容审核**: 集成微信内容安全API
- **违规处理**: 对违规内容进行拦截和处理
- **用户举报**: 提供内容举报功能

### 8.3 小程序合规
- **隐私政策**: 完善的隐私政策和用户协议
- **权限申请**: 合理申请和使用小程序权限
- **内容规范**: 确保生成内容符合平台规范
