package com.textvision.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 用户操作日志实体类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName(value = "user_operation_log", autoResultMap = true)
public class UserOperationLog {

    /**
     * 日志ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 操作类型
     */
    @TableField("operation")
    private String operation;

    /**
     * 资源类型
     */
    @TableField("resource_type")
    private String resourceType;

    /**
     * 资源ID
     */
    @TableField("resource_id")
    private Long resourceId;

    /**
     * 操作详情
     */
    @TableField(value = "details", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> details;

    /**
     * IP地址
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 用户代理
     */
    @TableField("user_agent")
    private String userAgent;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}