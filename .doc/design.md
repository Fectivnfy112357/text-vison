# 文生视界小程序登录集成与API修复 - 技术设计文档

## 1. 设计理念与整体方案

### 设计理念
- **安全优先**：微信登录集成必须确保用户数据安全，遵循最佳安全实践
- **向后兼容**：新的微信登录功能不能影响现有的Web和移动端登录体系
- **统一标准**：所有客户端使用统一的API接口规范和数据格式
- **渐进式改进**：分阶段实施，确保系统稳定性

### 整体架构方案
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   微信小程序     │    │   Web前端       │    │   移动端App     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   统一API网关   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   后端服务      │
                    │  - 用户服务     │
                    │  - 微信登录服务 │
                    │  - 内容生成服务 │
                    │  - 模板服务     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   数据存储      │
                    │  - MySQL数据库  │
                    │  - Redis缓存    │
                    └─────────────────┘
```

## 2. 技术栈选择与理由

### 后端技术栈
- **Spring Boot 2.7+**：现有技术栈，保持一致性
- **Spring Security + JWT**：现有鉴权体系，扩展支持微信登录
- **MySQL 8.0**：现有数据库，添加微信用户相关表
- **Redis**：缓存微信access_token和用户会话
- **微信开放平台SDK**：集成微信登录API

### 小程序技术栈
- **微信小程序原生框架**：现有技术栈
- **ES6+ JavaScript**：现有代码规范
- **微信小程序API**：wx.login, wx.getUserProfile等

### API设计原则
- **RESTful风格**：保持与现有API一致
- **统一响应格式**：所有API返回统一的Result格式
- **版本控制**：通过URL路径进行版本管理

## 3. 功能组件分解

### 3.1 微信登录服务组件
```java
// 微信登录控制器
@RestController
@RequestMapping("/api/auth")
public class WxAuthController {
    // 微信登录接口
    @PostMapping("/wx-login")
    public Result<LoginResponse> wxLogin(@RequestBody WxLoginRequest request);
    
    // 微信用户信息更新
    @PutMapping("/wx-userinfo")
    public Result<UserResponse> updateWxUserInfo(@RequestBody WxUserInfoRequest request);
}

// 微信登录服务
@Service
public class WxAuthService {
    // 处理微信登录逻辑
    public LoginResponse processWxLogin(String code, WxUserInfo userInfo);
    
    // 获取微信用户信息
    public WxUserInfo getWxUserInfo(String accessToken, String openId);
    
    // 绑定微信用户与系统用户
    public User bindWxUser(String openId, String unionId, WxUserInfo userInfo);
}
```

### 3.2 API接口统一组件
```java
// API响应统一格式
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private Long timestamp;
    private Boolean success;
}

// 分页响应格式
public class PageResult<T> {
    private List<T> records;
    private Long total;
    private Integer current;
    private Integer size;
    private Integer pages;
    private Boolean hasPrevious;
    private Boolean hasNext;
}
```

### 3.3 小程序API调用组件
```javascript
// 统一请求封装
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    // 微信登录
    async wxLogin(code, userInfo) {
        return this.post('/api/auth/wx-login', { code, userInfo });
    }
    
    // 获取模板列表
    async getTemplates(params) {
        return this.get('/api/templates', params);
    }
    
    // 生成内容
    async generateContent(data) {
        return this.post('/api/contents/generate', data);
    }
}
```

## 4. 代码与目录结构

### 4.1 后端目录结构扩展
```
back/src/main/java/com/textvision/
├── controller/
│   ├── UserController.java          # 现有用户控制器
│   ├── WxAuthController.java        # 新增：微信登录控制器
│   ├── TemplateController.java      # 现有模板控制器
│   └── GeneratedContentController.java # 现有内容生成控制器
├── service/
│   ├── UserService.java             # 现有用户服务
│   ├── WxAuthService.java           # 新增：微信登录服务
│   ├── WxApiService.java            # 新增：微信API调用服务
│   └── ...
├── entity/
│   ├── User.java                    # 现有用户实体
│   ├── WxUser.java                  # 新增：微信用户实体
│   └── ...
├── dto/
│   ├── WxLoginRequest.java          # 新增：微信登录请求DTO
│   ├── WxUserInfoRequest.java       # 新增：微信用户信息DTO
│   └── ...
├── config/
│   ├── WxConfig.java                # 新增：微信配置
│   └── ...
└── utils/
    ├── WxApiUtils.java              # 新增：微信API工具类
    └── ...
```

### 4.2 小程序目录结构优化
```
wxmini/
├── api/
│   ├── index.js                     # 修改：统一API接口定义
│   ├── auth.js                      # 新增：认证相关API
│   ├── template.js                  # 新增：模板相关API
│   ├── content.js                   # 新增：内容生成API
│   └── user.js                      # 新增：用户相关API
├── utils/
│   ├── request.js                   # 修改：请求工具
│   ├── auth.js                      # 新增：登录认证工具
│   └── ...
├── pages/
│   ├── login/                       # 新增：登录页面
│   │   ├── login.js
│   │   ├── login.wxml
│   │   └── login.wxss
│   └── ...
└── ...
```

## 5. 核心数据设计

### 5.1 数据库表设计

#### 微信用户表 (wx_users)
```sql
CREATE TABLE wx_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '关联的系统用户ID',
    open_id VARCHAR(64) NOT NULL UNIQUE COMMENT '微信openid',
    union_id VARCHAR(64) COMMENT '微信unionid',
    nickname VARCHAR(100) COMMENT '微信昵称',
    avatar_url VARCHAR(500) COMMENT '微信头像URL',
    gender TINYINT COMMENT '性别：0-未知，1-男，2-女',
    country VARCHAR(50) COMMENT '国家',
    province VARCHAR(50) COMMENT '省份',
    city VARCHAR(50) COMMENT '城市',
    language VARCHAR(20) COMMENT '语言',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_open_id (open_id),
    INDEX idx_union_id (union_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 用户表扩展 (users表添加字段)
```sql
ALTER TABLE users ADD COLUMN login_type VARCHAR(20) DEFAULT 'email' COMMENT '登录类型：email, wechat';
ALTER TABLE users ADD COLUMN wx_open_id VARCHAR(64) COMMENT '微信openid';
ALTER TABLE users ADD COLUMN wx_union_id VARCHAR(64) COMMENT '微信unionid';
```

### 5.2 数据传输对象 (DTO)

#### 微信登录请求
```java
public class WxLoginRequest {
    @NotBlank(message = "微信code不能为空")
    private String code;
    
    private WxUserInfo userInfo;
    
    // getters and setters
}

public class WxUserInfo {
    private String nickName;
    private String avatarUrl;
    private Integer gender;
    private String country;
    private String province;
    private String city;
    private String language;
    
    // getters and setters
}
```

#### 登录响应
```java
public class LoginResponse {
    private UserResponse user;
    private String token;
    private String tokenType = "Bearer";
    private Long expiresIn;
    
    // getters and setters
}
```

### 5.3 API接口规范

#### 微信登录接口
```
POST /api/auth/wx-login
Content-Type: application/json

请求体:
{
    "code": "微信登录code",
    "userInfo": {
        "nickName": "用户昵称",
        "avatarUrl": "头像URL",
        "gender": 1,
        "country": "中国",
        "province": "广东",
        "city": "深圳",
        "language": "zh_CN"
    }
}

响应:
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "user": {
            "id": 1,
            "name": "用户昵称",
            "email": null,
            "avatar": "头像URL",
            "loginType": "wechat"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "Bearer",
        "expiresIn": 7200
    },
    "timestamp": 1703123456789,
    "success": true
}
```

#### 统一错误响应格式
```json
{
    "code": 400,
    "message": "请求参数错误",
    "data": null,
    "timestamp": 1703123456789,
    "success": false
}
```

## 6. 安全设计

### 6.1 微信登录安全
- **code验证**：验证微信返回的code有效性和时效性
- **HTTPS通信**：所有API调用使用HTTPS加密
- **token安全**：JWT token设置合理的过期时间
- **用户信息加密**：敏感信息在数据库中加密存储

### 6.2 API安全
- **请求签名**：关键API添加请求签名验证
- **频率限制**：对登录等敏感接口添加频率限制
- **参数校验**：严格校验所有输入参数
- **SQL注入防护**：使用参数化查询防止SQL注入

## 7. 性能优化

### 7.1 缓存策略
- **Redis缓存**：缓存微信access_token和用户会话信息
- **本地缓存**：小程序端缓存用户信息和常用数据
- **CDN加速**：静态资源使用CDN加速

### 7.2 数据库优化
- **索引优化**：为查询频繁的字段添加索引
- **连接池**：合理配置数据库连接池
- **读写分离**：考虑读写分离提升性能

## 8. 监控与日志

### 8.1 日志记录
- **登录日志**：记录所有登录尝试和结果
- **API调用日志**：记录关键API的调用情况
- **错误日志**：详细记录系统错误信息

### 8.2 监控指标
- **登录成功率**：监控微信登录的成功率
- **API响应时间**：监控各API接口的响应时间
- **系统资源**：监控CPU、内存、数据库等资源使用情况
