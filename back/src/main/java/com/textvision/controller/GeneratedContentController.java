package com.textvision.controller;

import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.common.Result;
import com.textvision.dto.GenerateContentRequest;
import com.textvision.dto.GeneratedContentResponse;
import com.textvision.service.GeneratedContentService;
import com.textvision.service.UserOperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
 
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 生成内容控制器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
@Tag(name = "内容生成", description = "图片/视频生成、管理等接口")
public class GeneratedContentController {

    private final GeneratedContentService generatedContentService;
    private final UserOperationLogService userOperationLogService;

    @PostMapping("/generate")
    @Operation(summary = "生成内容", description = "根据请求参数生成图片或视频")
    public Result<GeneratedContentResponse> generateContent(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @Valid @RequestBody GenerateContentRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("生成内容请求: userId={}, type={}, prompt={}", userId, request.getType(), request.getPrompt());
        
        GeneratedContentResponse response = generatedContentService.generateContent(userId, request);
        
        // 记录生成操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("type", request.getType());
        details.put("prompt", request.getPrompt());
        details.put("templateId", request.getTemplateId());
        details.put("size", request.getSize());
        details.put("style", request.getStyle());
        details.put("generateTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                userId,
                "GENERATE",
                "CONTENT",
                response.getId(),
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success(response);
    }

    @GetMapping
    @Operation(summary = "分页查询用户生成内容", description = "分页查询当前用户的生成内容")
    public Result<PageResult<GeneratedContentResponse>> getUserContents(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createTime") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.debug("分页查询用户生成内容: userId={}, page={}, size={}, type={}, status={}", 
                 userId, page, size, type, status);
        
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        pageRequest.setKeyword(keyword);
        pageRequest.setSortBy(sortField);
        pageRequest.setSortDir(sortDirection);
        
        PageResult<GeneratedContentResponse> result = generatedContentService.getUserContents(
                userId, pageRequest, type, status, startTime, endTime);
        
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取生成内容详情", description = "根据ID获取生成内容详细信息")
    public Result<GeneratedContentResponse> getContentById(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        log.debug("获取生成内容详情: userId={}, contentId={}", userId, id);
        
        GeneratedContentResponse response = generatedContentService.getContentById(userId, id);
        
        // 记录查看操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("contentId", id);
        details.put("contentType", response.getType());
        details.put("viewTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                userId,
                "VIEW",
                "CONTENT",
                id,
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success(response);
    }

    @GetMapping("/recent")
    @Operation(summary = "获取最近生成内容", description = "获取用户最近生成的内容")
    public Result<List<GeneratedContentResponse>> getRecentContents(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.debug("获取最近生成内容: userId={}, limit={}", userId, limit);
        
        List<GeneratedContentResponse> contents = generatedContentService.getRecentContents(userId, limit);
        return Result.success(contents);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除生成内容", description = "删除指定的生成内容")
    public Result<Void> deleteContent(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        log.info("删除生成内容: userId={}, contentId={}", userId, id);
        
        boolean success = generatedContentService.deleteContent(userId, id);
        
        if (success) {
            // 记录删除操作日志
            Map<String, Object> details = new HashMap<>();
            details.put("contentId", id);
            details.put("deleteTime", System.currentTimeMillis());
            userOperationLogService.logUserOperation(
                    userId,
                    "DELETE",
                    "CONTENT",
                    id,
                    details,
                    getClientIpAddress(httpRequest),
                    httpRequest.getHeader("User-Agent")
            );
        }
        
        return Result.success();
    }

    @DeleteMapping("/batch")
    @Operation(summary = "批量删除生成内容", description = "批量删除指定的生成内容")
    public Result<Map<String, Object>> batchDeleteContents(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @RequestBody List<Long> contentIds,
            HttpServletRequest httpRequest) {
        
        log.info("批量删除生成内容: userId={}, contentIds={}", userId, contentIds);
        
        int deletedCount = generatedContentService.batchDeleteContents(userId, contentIds);
        
        // 记录批量删除操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("contentIds", contentIds);
        details.put("deletedCount", deletedCount);
        details.put("deleteTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                userId,
                "BATCH_DELETE",
                "CONTENT",
                null,
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("deletedCount", deletedCount);
        result.put("totalRequested", contentIds.size());
        
        return Result.success(result);
    }

    @GetMapping("/stats")
    @Operation(summary = "获取用户生成统计", description = "获取用户的生成内容统计信息")
    public Result<Map<String, Object>> getUserContentStats(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId) {
        
        log.debug("获取用户生成统计: userId={}", userId);
        
        Map<String, Object> stats = new HashMap<>();
        
        // 总生成数量
        long totalCount = generatedContentService.countUserContents(userId, null, null);
        stats.put("totalCount", totalCount);
        
        // 图片生成数量
        long imageCount = generatedContentService.countUserContents(userId, "image", null);
        stats.put("imageCount", imageCount);
        
        // 视频生成数量
        long videoCount = generatedContentService.countUserContents(userId, "video", null);
        stats.put("videoCount", videoCount);
        
        // 成功生成数量
        long completedCount = generatedContentService.countUserContents(userId, null, "completed");
        stats.put("completedCount", completedCount);
        
        // 失败生成数量
        long failedCount = generatedContentService.countUserContents(userId, null, "failed");
        stats.put("failedCount", failedCount);
        
        // 处理中数量
        long processingCount = generatedContentService.countUserContents(userId, null, "processing");
        stats.put("processingCount", processingCount);
        
        // 今日生成数量
        long todayCount = generatedContentService.getTodayGenerationCount(userId);
        stats.put("todayCount", todayCount);
        
        return Result.success(stats);
    }

    @PostMapping("/{id}/download")
    @Operation(summary = "下载生成内容", description = "记录下载操作（实际下载由前端处理）")
    public Result<Void> downloadContent(
            @Parameter(hidden = true) @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        log.info("下载生成内容: userId={}, contentId={}", userId, id);
        
        // 验证内容存在性
        GeneratedContentResponse content = generatedContentService.getContentById(userId, id);
        
        // 记录下载操作日志
        Map<String, Object> details = new HashMap<>();
        details.put("contentId", id);
        details.put("contentType", content.getType());
        details.put("downloadTime", System.currentTimeMillis());
        userOperationLogService.logUserOperation(
                userId,
                "DOWNLOAD",
                "CONTENT",
                id,
                details,
                getClientIpAddress(httpRequest),
                httpRequest.getHeader("User-Agent")
        );
        
        return Result.success();
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