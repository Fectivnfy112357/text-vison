package com.textvision.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户响应DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
public class UserResponse {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 用户名
     */
    private String name;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}