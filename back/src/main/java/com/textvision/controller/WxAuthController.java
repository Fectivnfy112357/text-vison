package com.textvision.controller;

import com.textvision.common.Result;
import com.textvision.dto.LoginResponse;
import com.textvision.dto.WxLoginRequest;
import com.textvision.dto.WxUserInfoRequest;
import com.textvision.dto.UserResponse;
import com.textvision.service.WxAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * 微信认证控制器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "微信认证", description = "微信小程序登录认证接口")
public class WxAuthController {

    private final WxAuthService wxAuthService;

    /**
     * 微信小程序登录
     * 
     * @param request 微信登录请求
     * @param httpRequest HTTP请求
     * @return 登录响应
     */
    @PostMapping("/wx-login")
    @Operation(summary = "微信小程序登录", description = "通过微信code和用户信息进行登录")
    public Result<LoginResponse> wxLogin(@Valid @RequestBody WxLoginRequest request, HttpServletRequest httpRequest) {
        log.info("微信小程序登录请求: code={}", request.getCode());
        
        try {
            LoginResponse loginResponse = wxAuthService.processWxLogin(request.getCode(), request.getUserInfo());
            
            log.info("微信登录成功: userId={}, openId={}", 
                    loginResponse.getUser().getId(), 
                    request.getUserInfo() != null ? "***" : "null");
            
            return Result.success(loginResponse);
        } catch (Exception e) {
            log.error("微信登录失败: code={}, error={}", request.getCode(), e.getMessage(), e);
            return Result.error("登录失败: " + e.getMessage());
        }
    }

    /**
     * 更新微信用户信息
     * 
     * @param request 微信用户信息请求
     * @param httpRequest HTTP请求
     * @return 用户响应
     */
    @PutMapping("/wx-userinfo")
    @Operation(summary = "更新微信用户信息", description = "更新微信用户的个人信息")
    public Result<UserResponse> updateWxUserInfo(@Valid @RequestBody WxUserInfoRequest request, HttpServletRequest httpRequest) {
        log.info("更新微信用户信息请求: userId={}", request.getUserId());
        
        try {
            UserResponse userResponse = wxAuthService.updateWxUserInfo(request);
            
            log.info("微信用户信息更新成功: userId={}", userResponse.getId());
            
            return Result.success(userResponse);
        } catch (Exception e) {
            log.error("微信用户信息更新失败: userId={}, error={}", request.getUserId(), e.getMessage(), e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 微信登录状态检查
     * 
     * @param openId 微信openId
     * @return 检查结果
     */
    @GetMapping("/wx-status")
    @Operation(summary = "微信登录状态检查", description = "检查微信用户的登录状态")
    public Result<Map<String, Object>> checkWxStatus(@RequestParam String openId) {
        log.debug("检查微信登录状态: openId={}", openId);
        
        try {
            boolean isValid = wxAuthService.checkWxLoginStatus(openId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("isValid", isValid);
            result.put("openId", openId);
            result.put("timestamp", System.currentTimeMillis());
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("微信登录状态检查失败: openId={}, error={}", openId, e.getMessage(), e);
            return Result.error("状态检查失败: " + e.getMessage());
        }
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}