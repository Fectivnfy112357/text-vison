package com.textvision.controller;

import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.common.Result;
import com.textvision.dto.LoginResponse;
import com.textvision.dto.UserLoginRequest;
import com.textvision.dto.UserRegisterRequest;
import com.textvision.dto.UserResponse;
import com.textvision.entity.UserOperationLog;
import com.textvision.service.UserOperationLogService;
import com.textvision.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户注册、登录、信息管理等接口")
public class UserController {

    private final UserService userService;
    private final UserOperationLogService userOperationLogService;

    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "用户注册接口")
    public Result<LoginResponse> register(@Valid @RequestBody UserRegisterRequest request, HttpServletRequest httpRequest) {
        log.info("用户注册请求: email={}, username={}", request.getEmail(), request.getUsername());
        
        LoginResponse loginResponse = userService.register(request);
        
        // 记录操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("email", request.getEmail());
        details.put("username", request.getUsername());
        userOperationLogService.logUserOperation(
                loginResponse.getUser().getId(),
                "REGISTER",
                "USER",
                loginResponse.getUser().getId(),
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success(loginResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录接口")
    public Result<LoginResponse> login(@Valid @RequestBody UserLoginRequest request, HttpServletRequest httpRequest) {
        log.info("用户登录请求: email={}", request.getEmail());
        
        LoginResponse loginResponse = userService.login(request);
        
        // 记录操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("email", request.getEmail());
        details.put("loginTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                loginResponse.getUser().getId(),
                "LOGIN",
                "USER",
                loginResponse.getUser().getId(),
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success(loginResponse);
    }

    @GetMapping("/profile")
    @Operation(summary = "获取用户信息", description = "获取当前登录用户的详细信息")
    public Result<UserResponse> getUserProfile(@Parameter(hidden = true) @RequestAttribute("userId") Long userId) {
        log.debug("获取用户信息: userId={}", userId);
        
        UserResponse userResponse = userService.getUserResponse(userId);
        return Result.success(userResponse);
    }

    @PutMapping("/profile")
    @Operation(summary = "更新用户信息", description = "更新当前登录用户的信息")
    public Result<UserResponse> updateUserProfile(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> updateData,
            HttpServletRequest httpRequest) {
        log.info("更新用户信息: userId={}", userId);
        
        String name = (String) updateData.get("name");
        String avatar = (String) updateData.get("avatar");
        UserResponse userResponse = userService.updateUser(userId, name, avatar);
        
        // 记录操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("updateFields", updateData.keySet());
        details.put("updateTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                userId,
                "UPDATE_PROFILE",
                "USER",
                userId,
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success(userResponse);
    }

    @PutMapping("/password")
    @Operation(summary = "修改密码", description = "修改当前登录用户的密码")
    public Result<Void> changePassword(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, String> passwordData,
            HttpServletRequest httpRequest) {
        log.info("修改密码: userId={}", userId);
        
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");
        
        userService.changePassword(userId, oldPassword, newPassword);
        
        // 记录操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("changeTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                userId,
                "CHANGE_PASSWORD",
                "USER",
                userId,
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success();
    }

    @GetMapping("/check-email")
    @Operation(summary = "检查邮箱是否存在", description = "检查指定邮箱是否已被注册")
    public Result<Boolean> checkEmailExists(@RequestParam String email) {
        log.debug("检查邮箱是否存在: email={}", email);
        
        boolean exists = userService.existsByEmail(email);
        return Result.success(exists);
    }

    @GetMapping("/check-username")
    @Operation(summary = "检查用户名是否存在", description = "检查指定用户名是否已被使用")
    public Result<Boolean> checkUsernameExists(@RequestParam String username) {
        log.debug("检查用户名是否存在: username={}", username);
        
        boolean exists = userService.existsByUsername(username);
        return Result.success(exists);
    }

    @GetMapping("/operation-logs")
    @Operation(summary = "获取用户操作日志", description = "分页获取当前用户的操作日志")
    public Result<PageResult<UserOperationLog>> getUserOperationLogs(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String resourceType) {
        log.debug("获取用户操作日志: userId={}, page={}, size={}", userId, page, size);
        
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        
        PageResult<UserOperationLog> logs = userOperationLogService.getUserOperationLogs(
                userId, pageRequest, operationType, resourceType, null, null);
        return Result.success(logs);
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}