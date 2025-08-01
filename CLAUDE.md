# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

TextVision是一个基于火山引擎大模型的图文/视频生成平台，采用前后端分离架构：
- **前端**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**: Spring Boot 2.7.x + MyBatis-Plus + MySQL 8.0 + JWT认证

## 快速开始

### 环境要求
- **前端**: Node.js 16+, npm
- **后端**: JDK 8+, Maven 3.6+, MySQL 8.0+

### 启动命令

#### 前端开发
```bash
cd front
npm install
npm run dev        # 开发服务器 http://localhost:5173
npm run build      # 构建生产版本
npm run lint       # ESLint检查
npm run check      # TypeScript类型检查
```

#### 后端开发
```bash
cd back
# 创建数据库 text_vision 并执行 init.sql
mvn clean install  # 安装依赖
mvn spring-boot:run  # 启动服务 http://localhost:8080
mvn test            # 运行测试
```

## 项目结构

### 后端架构
```
com.textvision/
├── common/          # 通用类：分页、响应封装
├── config/          # 配置类：MyBatis、Swagger、Web配置
├── controller/      # REST API控制器
├── dto/            # 数据传输对象
├── entity/         # 数据库实体类
├── exception/      # 异常处理
├── interceptor/    # JWT认证拦截器
├── mapper/         # MyBatis Mapper接口
├── service/        # 业务逻辑层
│   └── impl/       # 服务实现类
└── util/           # 工具类：JWT、密码加密、HTTP客户端
```

### 前端架构
```
src/
├── components/     # 通用组件：AuthModal, Navbar, Footer
├── pages/         # 页面组件：Home, Generate, Templates, History
├── store/         # 状态管理：Zustand store
├── lib/           # 工具函数和API客户端
├── hooks/         # 自定义Hook：useTheme
└── types/         # TypeScript类型定义
```

## 核心功能模块

### 用户认证
- JWT Token认证，存储在localStorage
- 拦截器自动添加Authorization头
- 用户信息存储在useAuthStore

### 内容生成
- 支持图片生成（doubao-seedream-3-0-t2i-250415）
- 支持视频生成（doubao-seedance-1-0-lite-t2v-250428）
- 生成历史记录和状态管理

### 模板系统
- 模板分类管理
- 热门模板推荐
- 模板详情和预览

### 艺术风格
- 艺术风格分类管理
- 风格标签和描述

## API端点

### 用户相关
- POST /api/users/register - 用户注册
- POST /api/users/login - 用户登录
- GET /api/users/profile - 获取用户信息

### 模板相关
- GET /api/templates - 分页查询模板
- GET /api/templates/{id} - 模板详情
- GET /api/templates/categories - 分类列表
- GET /api/templates/popular - 热门模板

### 内容生成
- POST /api/contents/generate - 生成内容
- GET /api/contents - 生成历史
- GET /api/contents/{id} - 生成详情

### 艺术风格
- GET /api/art-styles - 艺术风格列表
- GET /api/art-styles/{id} - 风格详情

## 配置文件

### 后端配置 (back/src/main/resources/application.yml)
- **数据库**: MySQL连接配置
- **JWT**: 密钥和过期时间设置
- **火山引擎**: API密钥和端点配置
- **文件上传**: 大小限制和类型限制
- **日志**: 日志级别和文件输出

### 前端配置
- **API**: 基础URL在lib/api.ts中配置
- **主题**: 明暗主题切换在hooks/useTheme.ts
- **路由**: React Router在App.tsx中配置

## 开发规范

### 代码风格
- **前端**: ESLint + TypeScript严格模式
- **后端**: 遵循Spring Boot最佳实践
- **命名**: 统一使用驼峰命名法
- **注释**: 关键业务逻辑需要中文注释

### 数据库约定
- **表名**: 使用下划线命名
- **字段**: 使用下划线命名，自动映射到驼峰
- **逻辑删除**: 使用deleted字段（0未删除，1已删除）

## 常用命令

### 数据库初始化
```sql
-- 创建数据库
CREATE DATABASE text_vision DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 执行初始化脚本
source back/src/main/resources/init/init.sql
```

### 测试运行
```bash
# 前端测试
npm run check  # 类型检查
npm run lint   # 代码风格检查

# 后端测试
mvn test       # 运行单元测试
```

### 构建部署
```bash
# 前端构建
npm run build  # 输出到dist目录

# 后端构建
mvn clean package -DskipTests  # 生成jar包
java -jar target/text-vision-backend-1.0.0.jar
```

## 调试技巧

### 前端调试
- 使用React DevTools检查组件状态
- 使用Zustand DevTools检查store状态
- 网络请求在lib/api.ts中可开启debug模式

### 后端调试
- 日志文件在logs/text-vision.log
- Swagger文档在http://localhost:8080/swagger-ui.html
- 健康检查在http://localhost:8080/actuator/health