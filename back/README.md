# TextVision Backend

TextVision 图文/视频生成平台后端服务

## 项目简介

TextVision 是一个基于火山引擎大模型的图文/视频生成平台，提供智能化的内容创作服务。本项目为后端服务，采用 Spring Boot 3.x + MyBatis-Plus + MySQL 技术栈构建。

## 技术栈

- **框架**: Spring Boot 3.2.0
- **JDK**: 17
- **数据库**: MySQL 8.0+
- **ORM**: MyBatis-Plus 3.5.4.1
- **认证**: JWT (JSON Web Token)
- **密码加密**: Spring Security Crypto
- **API文档**: SpringDoc OpenAPI 3
- **工具类**: Hutool
- **构建工具**: Maven

## 主要功能

### 用户管理
- 用户注册/登录
- JWT 认证授权
- 用户信息管理
- 密码修改

### 模板管理
- 模板分页查询
- 模板分类管理
- 热门模板推荐
- 模板搜索
- 标签查询

### 内容生成
- 图片生成（基于火山引擎）
- 视频生成（基于火山引擎）
- 生成历史管理
- 批量操作
- 生成统计

### 操作日志
- 用户操作记录
- 日志查询统计
- 自动清理过期日志

## 项目结构

```
src/main/java/com/textvision/
├── TextVisionApplication.java          # 启动类
├── common/                             # 通用类
│   ├── PageRequest.java               # 分页请求
│   ├── PageResult.java                # 分页响应
│   ├── Result.java                    # 统一响应
│   └── ResultCode.java                # 响应码枚举
├── config/                            # 配置类
│   ├── AsyncConfig.java               # 异步配置
│   ├── MybatisPlusConfig.java         # MyBatis-Plus配置
│   ├── SwaggerConfig.java             # API文档配置
│   └── WebConfig.java                 # Web配置
├── controller/                        # 控制器
│   ├── GeneratedContentController.java
│   ├── TemplateController.java
│   └── UserController.java
├── dto/                               # 数据传输对象
│   ├── GenerateContentRequest.java
│   ├── GeneratedContentResponse.java
│   ├── LoginResponse.java
│   ├── TemplateResponse.java
│   ├── UserLoginRequest.java
│   ├── UserRegisterRequest.java
│   └── UserResponse.java
├── entity/                            # 实体类
│   ├── GeneratedContent.java
│   ├── Template.java
│   ├── User.java
│   └── UserOperationLog.java
├── exception/                         # 异常处理
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
├── interceptor/                       # 拦截器
│   └── JwtAuthInterceptor.java
├── mapper/                            # 数据访问层
│   ├── GeneratedContentMapper.java
│   ├── TemplateMapper.java
│   ├── UserMapper.java
│   └── UserOperationLogMapper.java
├── service/                           # 服务层
│   ├── impl/
│   │   ├── GeneratedContentServiceImpl.java
│   │   ├── TemplateServiceImpl.java
│   │   ├── UserOperationLogServiceImpl.java
│   │   └── UserServiceImpl.java
│   ├── GeneratedContentService.java
│   ├── TemplateService.java
│   ├── UserOperationLogService.java
│   ├── UserService.java
│   └── VolcanoApiService.java
└── util/                              # 工具类
    ├── HttpUtil.java
    ├── JwtUtil.java
    └── PasswordUtil.java
```

## 数据库设计

### 主要表结构

1. **user** - 用户表
2. **template** - 模板表
3. **generated_content** - 生成内容表
4. **user_operation_log** - 用户操作日志表

详细的表结构和初始化数据请查看 `src/main/resources/init/init.sql`

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd text-vision-backend
   ```

2. **配置数据库**
   - 创建数据库 `text_vision`
   - 修改 `application.yml` 中的数据库连接配置

3. **安装依赖**
   ```bash
   mvn clean install
   ```

4. **启动应用**
   ```bash
   mvn spring-boot:run
   ```

5. **访问应用**
   - 应用地址: http://localhost:8080
   - API文档: http://localhost:8080/swagger-ui.html

## 配置说明

### 应用配置 (application.yml)

```yaml
# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/text_vision
    username: root
    password: your_password

# JWT配置
app:
  jwt:
    secret: your-jwt-secret
    expiration: 86400000  # 24小时

# 火山引擎API配置
  volcano:
    api:
      access-key: your-access-key
      secret-key: your-secret-key
```

### 火山引擎配置

1. 注册火山引擎账号
2. 获取 Access Key 和 Secret Key
3. 在 `application.yml` 中配置相关信息

## API 文档

启动应用后，访问 http://localhost:8080/swagger-ui.html 查看完整的 API 文档。

### 主要接口

#### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

#### 模板相关
- `GET /api/templates` - 分页查询模板
- `GET /api/templates/{id}` - 获取模板详情
- `GET /api/templates/categories` - 获取所有分类
- `GET /api/templates/popular` - 获取热门模板

#### 内容生成
- `POST /api/contents/generate` - 生成内容
- `GET /api/contents` - 查询生成历史
- `GET /api/contents/{id}` - 获取生成详情
- `DELETE /api/contents/{id}` - 删除生成内容

## 开发指南

### 代码规范

1. 使用 Lombok 简化代码
2. 统一异常处理
3. 统一响应格式
4. 合理的日志记录
5. 完善的注释文档

### 新增功能

1. 在对应的 Service 接口中定义方法
2. 在 ServiceImpl 中实现业务逻辑
3. 在 Controller 中添加接口
4. 添加相应的 DTO 类
5. 更新 API 文档

### 数据库变更

1. 修改 `init.sql` 文件
2. 更新对应的实体类
3. 修改 Mapper 接口
4. 测试数据库操作

## 部署说明

### 打包

```bash
mvn clean package -DskipTests
```

### 运行

```bash
java -jar target/text-vision-backend-1.0.0.jar
```

### Docker 部署

```dockerfile
FROM openjdk:17-jre-slim
COPY target/text-vision-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 监控和日志

- 应用日志: `logs/text-vision.log`
- 健康检查: http://localhost:8080/actuator/health
- 应用信息: http://localhost:8080/actuator/info

## 常见问题

### Q: 数据库连接失败
A: 检查数据库配置、网络连接和数据库服务状态

### Q: JWT Token 无效
A: 检查 Token 格式、过期时间和密钥配置

### Q: 火山引擎 API 调用失败
A: 检查 API 密钥配置和网络连接

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: support@textvision.com