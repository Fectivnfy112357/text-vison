package com.textvision.dto;

import lombok.Data;

/**
 * 登录响应DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
public class LoginResponse {

    /**
     * 访问令牌
     */
    private String token;

    /**
     * 令牌类型
     */
    private String tokenType = "Bearer";

    /**
     * 过期时间（秒）
     */
    private Long expiresIn;

    /**
     * 用户信息
     */
    private UserResponse user;

    public LoginResponse(String token, Long expiresIn, UserResponse user) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
    }
}