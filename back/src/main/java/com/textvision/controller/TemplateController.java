package com.textvision.controller;

import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.common.Result;
import com.textvision.dto.TemplateResponse;
import com.textvision.service.TemplateService;
import com.textvision.service.UserOperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 模板控制器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Tag(name = "模板管理", description = "模板查询、分类、搜索等接口")
public class TemplateController {

    private final TemplateService templateService;
    private final UserOperationLogService userOperationLogService;

    @GetMapping
    @Operation(summary = "分页查询模板", description = "根据条件分页查询模板列表")
    public Result<PageResult<TemplateResponse>> getTemplates(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createTime") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.debug("分页查询模板: page={}, size={}, categoryId={}, type={}, keyword={}", 
                 page, size, categoryId, type, keyword);
        
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        pageRequest.setKeyword(keyword);
        pageRequest.setSortBy(sortField);
        pageRequest.setSortDir(sortDirection);
        
        PageResult<TemplateResponse> result = templateService.getTemplates(pageRequest, categoryId, type);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取模板详情", description = "根据ID获取模板详细信息")
    public Result<TemplateResponse> getTemplateById(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {
        
        log.debug("获取模板详情: id={}", id);
        
        TemplateResponse template = templateService.getTemplateById(id);
        
        // 记录查看操作日志（如果用户已登录）
        if (userId != null) {
            Map<String, Object> details = new HashMap<>();
            details.put("templateId", id);
            details.put("templateTitle", template.getTitle());
            details.put("viewTime", System.currentTimeMillis());
            userOperationLogService.logUserOperation(
                    userId,
                    "VIEW",
                    "TEMPLATE",
                    id,
                    details,
                    getClientIpAddress(httpRequest),
                    httpRequest.getHeader("User-Agent")
            );
        }
        
        return Result.success(template);
    }

    @GetMapping("/categories")
    @Operation(summary = "获取所有分类", description = "获取模板的所有分类列表")
    public Result<List<String>> getAllCategories() {
        log.debug("获取所有模板分类");
        
        List<String> categories = templateService.getAllCategories();
        return Result.success(categories);
    }

    @GetMapping("/popular")
    @Operation(summary = "获取热门模板", description = "获取使用次数最多的热门模板")
    public Result<List<TemplateResponse>> getPopularTemplates(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.debug("获取热门模板: limit={}", limit);
        
        List<TemplateResponse> templates = templateService.getPopularTemplates(limit);
        return Result.success(templates);
    }

    @GetMapping("/search")
    @Operation(summary = "搜索模板", description = "根据关键词搜索模板")
    public Result<PageResult<TemplateResponse>> searchTemplates(
            @RequestParam String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "usageCount") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @Parameter(hidden = true) @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {
        
        log.info("搜索模板: keyword={}, categoryId={}, type={}", keyword, categoryId, type);
        
        PageRequest pageRequest = new PageRequest();
        pageRequest.setPage(page);
        pageRequest.setSize(size);
        pageRequest.setSortBy(sortField);
        pageRequest.setSortDir(sortDirection);
        
        PageResult<TemplateResponse> result = templateService.searchTemplates(keyword, categoryId, type, pageRequest);
        
        // 记录搜索操作日志（如果用户已登录）
        if (userId != null) {
            Map<String, Object> details = new HashMap<>();
            details.put("keyword", keyword);
            details.put("categoryId", categoryId);
            details.put("type", type);
            details.put("resultCount", result.getTotal());
            details.put("searchTime", System.currentTimeMillis());
            userOperationLogService.logUserOperation(
                    userId,
                    "SEARCH",
                    "TEMPLATE",
                    null,
                    details,
                    getClientIpAddress(httpRequest),
                    httpRequest.getHeader("User-Agent")
            );
        }
        
        return Result.success(result);
    }

    @GetMapping("/by-tag")
    @Operation(summary = "根据标签查询模板", description = "根据标签获取相关模板")
    public Result<List<TemplateResponse>> getTemplatesByTag(@RequestParam String tag) {
        log.debug("根据标签查询模板: tag={}", tag);
        
        List<TemplateResponse> templates = templateService.getTemplatesByTag(tag);
        return Result.success(templates);
    }

    @PostMapping("/{id}/use")
    @Operation(summary = "使用模板", description = "标记模板被使用，增加使用次数")
    public Result<Void> useTemplate(
            @PathVariable Long id,
            @Parameter(hidden = true) @RequestAttribute(value = "userId", required = false) Long userId,
            HttpServletRequest httpRequest) {
        
        log.info("使用模板: id={}, userId={}", id, userId);
        
        templateService.incrementUsageCount(id);
        
        // 记录使用操作日志（如果用户已登录）
        if (userId != null) {
            Map<String, Object> details = new HashMap<>();
            details.put("templateId", id);
            details.put("useTime", System.currentTimeMillis());
            userOperationLogService.logUserOperation(
                    userId,
                    "USE",
                    "TEMPLATE",
                    id,
                    details,
                    getClientIpAddress(httpRequest),
                    httpRequest.getHeader("User-Agent")
            );
        }
        
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