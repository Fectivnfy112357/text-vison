package com.textvision.common;

import lombok.Getter;

/**
 * 响应状态码枚举
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Getter
public enum ResultCode {

    // 通用状态码
    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    UNSUPPORTED_MEDIA_TYPE(415, "不支持的媒体类型"),
    TOO_MANY_REQUESTS(429, "请求过于频繁"),

    // 认证相关
    UNAUTHORIZED(401, "未授权访问"),
    FORBIDDEN(403, "访问被禁止"),
    TOKEN_INVALID(4001, "Token无效"),
    TOKEN_EXPIRED(4002, "Token已过期"),
    LOGIN_REQUIRED(4003, "请先登录"),
    PERMISSION_DENIED(4004, "权限不足"),

    // 用户相关
    USER_NOT_FOUND(5001, "用户不存在"),
    USER_ALREADY_EXISTS(5002, "用户已存在"),
    USER_DISABLED(5003, "用户已被禁用"),
    PASSWORD_ERROR(5004, "密码错误"),
    EMAIL_ALREADY_EXISTS(5005, "邮箱已存在"),
    INVALID_EMAIL_FORMAT(5006, "邮箱格式不正确"),
    WEAK_PASSWORD(5007, "密码强度不够"),

    // 模板相关
    TEMPLATE_NOT_FOUND(6001, "模板不存在"),
    TEMPLATE_DISABLED(6002, "模板已被禁用"),
    TEMPLATE_CATEGORY_INVALID(6003, "模板分类无效"),
    
    // 分类相关
    CATEGORY_NOT_FOUND(6101, "分类不存在"),
    CATEGORY_NAME_EXISTS(6102, "分类名称已存在"),
    SYSTEM_CATEGORY_CANNOT_DELETE(6103, "系统默认分类不能删除"),

    // 生成相关
    GENERATION_FAILED(7001, "内容生成失败"),
    GENERATION_IN_PROGRESS(7002, "内容正在生成中"),
    GENERATION_QUOTA_EXCEEDED(7003, "生成配额已用完"),
    INVALID_GENERATION_TYPE(7004, "无效的生成类型"),
    INVALID_IMAGE_FORMAT(7005, "不支持的图片格式"),
    IMAGE_TOO_LARGE(7006, "图片文件过大"),
    PROMPT_TOO_LONG(7007, "提示词过长"),
    PROMPT_CONTAINS_SENSITIVE_CONTENT(7008, "提示词包含敏感内容"),
    CONTENT_NOT_FOUND(7009, "内容不存在"),
    GENERATION_LIMIT_EXCEEDED(7010, "生成次数超限"),

    // 文件相关
    FILE_UPLOAD_FAILED(8001, "文件上传失败"),
    FILE_NOT_FOUND(8002, "文件不存在"),
    FILE_TOO_LARGE(8003, "文件过大"),
    INVALID_FILE_TYPE(8004, "不支持的文件类型"),

    // 第三方服务相关
    THIRD_PARTY_SERVICE_ERROR(9001, "第三方服务异常"),
    VOLCANO_API_ERROR(9002, "火山引擎API调用失败"),
    SILICONFLOW_API_ERROR(9003, "硅基流动API调用失败"),
    API_RATE_LIMIT_EXCEEDED(9004, "API调用频率超限"),
    API_QUOTA_EXCEEDED(9005, "API调用配额超限");

    /**
     * 状态码
     */
    private final Integer code;

    /**
     * 状态消息
     */
    private final String message;

    /**
     * 构造器
     * 
     * @param code 状态码
     * @param message 状态消息
     */
    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 获取状态码
     * 
     * @return 状态码
     */
    public Integer getCode() {
        return code;
    }

    /**
     * 获取状态消息
     * 
     * @return 状态消息
     */
    public String getMessage() {
        return message;
    }
}