package com.textvision.controller;

import com.textvision.common.Result;
import com.textvision.dto.AnalyticsRequest;
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
 * 数据分析控制器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "数据分析", description = "用户行为追踪和数据分析接口")
public class AnalyticsController {

    /**
     * 记录用户行为
     * 
     * @param request 行为数据请求
     * @param httpRequest HTTP请求
     * @return 处理结果
     */
    @PostMapping("/track")
    @Operation(summary = "记录用户行为", description = "记录用户在小程序中的行为数据")
    public Result<Map<String, Object>> trackUserAction(@Valid @RequestBody AnalyticsRequest request, HttpServletRequest httpRequest) {
        log.info("记录用户行为: action={}, userId={}", request.getAction(), request.getUserId());
        
        try {
            // 获取客户端信息
            String userAgent = httpRequest.getHeader("User-Agent");
            String clientIp = getClientIpAddress(httpRequest);
            
            // 记录行为数据（这里可以保存到数据库或发送到分析服务）
            Map<String, Object> trackingData = new HashMap<>();
            trackingData.put("action", request.getAction());
            trackingData.put("params", request.getParams());
            trackingData.put("userId", request.getUserId());
            trackingData.put("timestamp", System.currentTimeMillis());
            trackingData.put("userAgent", userAgent);
            trackingData.put("clientIp", clientIp);
            
            // TODO: 这里可以集成具体的分析服务，如：
            // 1. 保存到数据库
            // 2. 发送到第三方分析服务（如Google Analytics、百度统计等）
            // 3. 发送到消息队列进行异步处理
            
            log.debug("用户行为记录成功: {}", trackingData);
            
            Map<String, Object> result = new HashMap<>();
            result.put("tracked", true);
            result.put("timestamp", System.currentTimeMillis());
            
            return Result.success(result);
            
        } catch (Exception e) {
            log.error("记录用户行为失败: action={}, error={}", request.getAction(), e.getMessage(), e);
            return Result.error("记录失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户统计数据
     * 
     * @param userId 用户ID
     * @param period 时间周期
     * @return 统计数据
     */
    @GetMapping("/user-stats")
    @Operation(summary = "获取用户统计数据", description = "获取用户的行为统计数据")
    public Result<Map<String, Object>> getUserStats(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "7d") String period) {
        
        log.info("获取用户统计数据: userId={}, period={}", userId, period);
        
        try {
            // TODO: 从数据库或分析服务获取统计数据
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalActions", 0);
            stats.put("pageViews", 0);
            stats.put("generationCount", 0);
            stats.put("period", period);
            stats.put("userId", userId);
            
            return Result.success(stats);
            
        } catch (Exception e) {
            log.error("获取用户统计数据失败: userId={}, error={}", userId, e.getMessage(), e);
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取使用报告
     * 
     * @param period 时间周期
     * @return 使用报告
     */
    @GetMapping("/usage-report")
    @Operation(summary = "获取使用报告", description = "获取应用使用情况报告")
    public Result<Map<String, Object>> getUsageReport(@RequestParam(defaultValue = "7d") String period) {
        
        log.info("获取使用报告: period={}", period);
        
        try {
            // TODO: 生成使用报告
            Map<String, Object> report = new HashMap<>();
            report.put("period", period);
            report.put("totalUsers", 0);
            report.put("activeUsers", 0);
            report.put("totalGenerations", 0);
            report.put("popularTemplates", new String[]{});
            
            return Result.success(report);
            
        } catch (Exception e) {
            log.error("获取使用报告失败: period={}, error={}", period, e.getMessage(), e);
            return Result.error("获取使用报告失败: " + e.getMessage());
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