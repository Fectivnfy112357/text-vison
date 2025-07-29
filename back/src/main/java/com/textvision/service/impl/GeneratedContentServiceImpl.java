package com.textvision.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.common.ResultCode;
import com.textvision.dto.GenerateContentRequest;
import com.textvision.dto.GeneratedContentResponse;
import com.textvision.entity.GeneratedContent;
import com.textvision.entity.Template;
import com.textvision.exception.BusinessException;
import com.textvision.mapper.GeneratedContentMapper;
import com.textvision.service.GeneratedContentService;
import com.textvision.service.TemplateService;
import com.textvision.service.VolcanoApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 生成内容服务实现类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeneratedContentServiceImpl extends ServiceImpl<GeneratedContentMapper, GeneratedContent> implements GeneratedContentService {

    private final GeneratedContentMapper generatedContentMapper;
    private final TemplateService templateService;
    private final VolcanoApiService volcanoApiService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public GeneratedContentResponse generateContent(Long userId, GenerateContentRequest request) {
        // 检查用户今日生成次数限制（可根据业务需求调整）
        long todayCount = getTodayGenerationCount(userId);
        if (todayCount >= 100) { // 假设每日限制100次
            throw new BusinessException(ResultCode.GENERATION_LIMIT_EXCEEDED);
        }

        // 验证模板（如果指定了模板ID）
        Template template = null;
        if (request.getTemplateId() != null) {
            template = templateService.getById(request.getTemplateId());
            if (template == null) {
                throw new BusinessException(ResultCode.TEMPLATE_NOT_FOUND);
            }
            if (template.getStatus() == 0) {
                throw new BusinessException(ResultCode.TEMPLATE_DISABLED);
            }
        }

        // 创建生成内容记录
        GeneratedContent content = new GeneratedContent();
        content.setUserId(userId);
        content.setType(request.getType());
        content.setPrompt(request.getPrompt());
        content.setSize(request.getSize());
        content.setStyle(request.getStyle());
        content.setReferenceImage(request.getReferenceImage());
        content.setTemplateId(request.getTemplateId());
        content.setStatus("processing");
        
        // 构建生成参数
        Map<String, Object> params = new HashMap<>();
        if ("image".equals(request.getType())) {
            params.put("quality", request.getQuality());
        } else if ("video".equals(request.getType())) {
            params.put("duration", request.getDuration());
            params.put("fps", request.getFps());
            params.put("hd", request.getHd());
        }
        content.setGenerationParams(params);
        
        // 保存到数据库
        save(content);
        
        // 增加模板使用次数
        if (template != null) {
            templateService.incrementUsageCount(template.getId());
        }
        
        // 异步调用生成API
        asyncGenerateContent(content.getId(), request);
        
        return convertToGeneratedContentResponse(content);
    }

    @Override
    public PageResult<GeneratedContentResponse> getUserContents(Long userId, PageRequest pageRequest, String type, String status, LocalDateTime startTime, LocalDateTime endTime) {
        Page<GeneratedContent> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<GeneratedContent> contentPage = generatedContentMapper.selectUserContentsPage(
                page, userId, type, status, startTime, endTime, pageRequest.getKeyword());
        
        List<GeneratedContentResponse> responses = contentPage.getRecords().stream()
                .map(this::convertToGeneratedContentResponse)
                .collect(Collectors.toList());
        
        return PageResult.of(responses, contentPage.getTotal(), contentPage.getCurrent(), contentPage.getSize());
    }

    @Override
    public GeneratedContentResponse getContentById(Long userId, Long contentId) {
        GeneratedContent content = getById(contentId);
        if (content == null || !content.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.CONTENT_NOT_FOUND);
        }
        return convertToGeneratedContentResponse(content);
    }

    @Override
    public List<GeneratedContentResponse> getRecentContents(Long userId, int limit) {
        List<GeneratedContent> contents = generatedContentMapper.selectRecentByUserId(userId, limit);
        return contents.stream()
                .map(this::convertToGeneratedContentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteContent(Long userId, Long contentId) {
        GeneratedContent content = getById(contentId);
        if (content == null || !content.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.CONTENT_NOT_FOUND);
        }
        return removeById(contentId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int batchDeleteContents(Long userId, List<Long> contentIds) {
        if (contentIds == null || contentIds.isEmpty()) {
            return 0;
        }
        return generatedContentMapper.batchDeleteUserContents(userId, contentIds);
    }

    @Override
    public long countUserContents(Long userId, String type, String status) {
        return generatedContentMapper.countUserContents(userId, type, status);
    }

    @Override
    public long getTodayGenerationCount(Long userId) {
        return generatedContentMapper.getTodayGenerationCount(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateGenerationStatus(Long contentId, String status, String url, String thumbnail, String errorMessage) {
        GeneratedContent content = getById(contentId);
        if (content == null) {
            log.warn("更新生成状态失败，内容不存在: contentId={}", contentId);
            return;
        }
        
        content.setStatus(status);
        content.setUrl(url);
        content.setThumbnail(thumbnail);
        content.setErrorMessage(errorMessage);
        content.setUpdatedAt(LocalDateTime.now());
        
        updateById(content);
        log.info("更新生成状态成功: contentId={}, status={}", contentId, status);
    }

    /**
     * 异步生成内容
     */
    @Async
    public void asyncGenerateContent(Long contentId, GenerateContentRequest request) {
        try {
            log.info("开始异步生成内容: contentId={}, type={}", contentId, request.getType());
            
            String resultUrl;
            String thumbnail = null;
            
            if ("image".equals(request.getType())) {
                // 调用图片生成API
                VolcanoApiService.ImageGenerationResult result = volcanoApiService.generateImage(
                        request.getPrompt(),
                        request.getSize(),
                        request.getStyle(),
                        request.getQuality()
                );
                resultUrl = result.getUrl();
                thumbnail = result.getUrl(); // 图片没有缩略图，使用原图
            } else {
                // 调用视频生成API
                VolcanoApiService.VideoGenerationResult result = volcanoApiService.generateVideo(
                        request.getPrompt(),
                        request.getDuration(),
                        request.getFps(),
                        request.getHd()
                );
                resultUrl = result.getUrl();
                thumbnail = result.getThumbnail();
            }
            
            // 更新为成功状态
            updateGenerationStatus(contentId, "completed", resultUrl, thumbnail, null);
            
        } catch (Exception e) {
            log.error("生成内容失败: contentId={}", contentId, e);
            // 更新为失败状态
            updateGenerationStatus(contentId, "failed", null, null, e.getMessage());
        }
    }

    /**
     * 转换为生成内容响应DTO
     */
    private GeneratedContentResponse convertToGeneratedContentResponse(GeneratedContent content) {
        GeneratedContentResponse response = new GeneratedContentResponse();
        BeanUtils.copyProperties(content, response);
        return response;
    }
}