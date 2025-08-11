# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

TextVision 是一个多端图文/视频生成平台，包含后端服务、Web前端、移动端H5和微信小程序四个部分。项目基于火山引擎大模型提供智能化的内容创作服务。

## 架构设计

### 整体架构
- **后端 (back)**: Spring Boot 2.7.18 + MyBatis-Plus + MySQL 8.0
- **Web前端 (front)**: React 18 + TypeScript + Vite + Tailwind CSS
- **移动端 (mobile)**: React 18 + TypeScript + Vite + Tailwind CSS
- **微信小程序 (wxmini)**: 原生小程序开发

### 后端架构
- **分层架构**: Controller -> Service -> Mapper -> Entity
- **认证机制**: JWT + 微信小程序授权
- **API集成**: 火山引擎大模型API
- **数据库**: MySQL 8.0 + MyBatis-Plus
- **文档**: SpringDoc OpenAPI 3

### 前端架构
- **状态管理**: Zustand
- **UI框架**: Tailwind CSS + Lucide React Icons
- **动画**: Framer Motion (已优化为CSS动画提升性能)
- **HTTP客户端**: Axios
- **路由**: React Router DOM 6

## 开发命令

### 后端开发 (back/)
```bash
# 安装依赖
mvn clean install

# 启动开发服务器
mvn spring-boot:run

# 打包
mvn clean package -DskipTests

# 运行测试
mvn test

# 跳过测试打包
mvn clean package -DskipTests
```

### Web前端开发 (front/)
```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 5174)
npm run dev

# 构建
npm run build

# 类型检查
npm run check

# 代码检查
npm run lint

# 预览
npm run preview
```

### 移动端开发 (mobile/)
```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 3001)
npm run dev

# 构建
npm run build

# 类型检查
npm run check

# 代码检查
npm run lint

# 预览
npm run preview
```

### 微信小程序开发 (wxmini/)
- 使用微信开发者工具打开 wxmini 目录
- 配置 AppID 和 API 地址

## 核心功能模块

### 用户系统
- 用户注册/登录 (邮箱密码 + 微信小程序)
- JWT 认证授权
- 用户信息管理
- 操作日志记录

### 内容生成
- 图片生成 (基于火山引擎 doubao-seedream-3-0-t2i-250415)
- 视频生成 (基于火山引擎 doubao-seedance-1-0-lite-t2v-250428)
- 模板系统 (分类管理、标签系统)
- 生成历史管理

### 数据库设计
主要表结构：
- `user` - 用户表
- `template` - 模板表
- `template_category` - 模板分类表
- `generated_content` - 生成内容表
- `user_operation_log` - 用户操作日志表
- `art_style` - 艺术风格表

## 配置说明

### 后端配置 (back/src/main/resources/application.yml)
- 数据库连接配置
- 火山引擎API配置
- JWT密钥配置
- 微信小程序配置
- 文件上传配置

### 前端配置
- Web前端运行在端口 5174
- 移动端运行在端口 3001
- 后端API运行在端口 8999

## API接口

### 主要接口地址
- 后端API: http://localhost:8999
- API文档: http://localhost:8999/swagger-ui.html
- Web前端: http://localhost:5174
- 移动端: http://localhost:3001

### 核心接口
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `POST /api/contents/generate` - 生成内容
- `GET /api/templates` - 获取模板列表
- `GET /api/contents` - 获取生成历史

## 性能优化

### 前端优化
- 动画系统已从 framer-motion 迁移到CSS动画
- 实现了代码分割和懒加载
- 添加了VConsole移动端调试工具
- 优化了图片加载和缓存策略

### 后端优化
- 使用HikariCP连接池
- 异步处理生成任务
- 分页查询优化
- 数据库索引优化

## 部署说明

### 后端部署
```bash
# 打包
mvn clean package -DskipTests

# 运行
java -jar target/text-vision-backend-1.0.0.jar
```

### 前端部署
```bash
# Web前端
cd front && npm run build

# 移动端
cd mobile && npm run build
```

## 开发注意事项

### 代码规范
- 后端使用 Lombok 简化代码
- 统一异常处理和响应格式
- 前端使用 TypeScript 严格模式
- ESLint 代码检查

### 安全考虑
- JWT Token 安全配置
- API 密钥管理
- 用户密码加密存储
- 文件上传安全检查

### 微信小程序开发
- 需要配置正确的 AppID 和 AppSecret
- 使用分包加载优化性能
- 支持暗色模式配置

## 监控和日志

### 后端监控
- 健康检查: http://localhost:8999/actuator/health
- 应用信息: http://localhost:8999/actuator/info
- 日志文件: back/logs/text-vision.log

### 前端调试
- 移动端集成 VConsole 调试工具
- 网络请求监控和错误捕获