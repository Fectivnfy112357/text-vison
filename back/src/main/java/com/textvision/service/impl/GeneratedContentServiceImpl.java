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
import com.textvision.entity.ArtStyle;
import com.textvision.entity.GeneratedContent;
import com.textvision.entity.Template;
import com.textvision.exception.BusinessException;
import com.textvision.mapper.GeneratedContentMapper;
import com.textvision.service.ArtStyleService;
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
    private final ArtStyleService artStyleService;

    private String convertSizeToAspectRatio(String size) {
        //1024x1024 （1:1）
        //864x1152 （3:4）
        //1152x864 （4:3）
        //1280x720 （16:9）
        //720x1280 （9:16）
        //832x1248 （2:3）
        //1248x832 （3:2）
        //1512x648 （21:9）
        String ratio;
        switch (size) {
            case "1024x1024":
                ratio = "1:1";
                break;
            case "864x1152":
                ratio = "3:4";
                break;
            case "1152x864":
                ratio = "4:3";
                break;
            case "1280x720":
                ratio = "16:9";
                break;
            case "720x1280":
                ratio = "9:16";
                break;
            case "832x1248":
                ratio = "2:3";
                break;
            case "1248x832":
                ratio = "3:2";
                break;
            case "1512x648":
                ratio = "21:9";
                break;
            default:
                ratio = "1:1";
                break;
        }
        return ratio;
    }

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

        // 处理艺术风格
        String finalPrompt = request.getPrompt();
        String styleName = "默认风格";
        if (request.getStyleId() != null) {
            ArtStyle artStyle = artStyleService.getById(request.getStyleId());
            if (artStyle != null) {
                styleName = artStyle.getName();
                String styleDescription = artStyle.getDescription();
                if (styleDescription != null && !styleDescription.trim().isEmpty()) {
                    finalPrompt = styleDescription + ", " + request.getPrompt();
                    log.info("应用艺术风格: styleId={}, name={}, description={}", request.getStyleId(), styleName, styleDescription);
                }
            }
        } else if (request.getStyle() != null && !request.getStyle().trim().isEmpty()) {
            styleName = request.getStyle();
        }

        // 创建生成内容记录
        GeneratedContent content = new GeneratedContent();
        content.setUserId(userId);
        content.setType(request.getType());
        content.setPrompt(finalPrompt);
        content.setSize(request.getSize());
        content.setStyle(styleName);
        content.setReferenceImage(request.getReferenceImage());
        content.setTemplateId(request.getTemplateId());
        content.setStatus("processing");
        content.setAspectRatio(convertSizeToAspectRatio(request.getSize()));
        content.setUrl(""); // 初始设置为空字符串，生成完成后更新

        // 构建生成参数
        Map<String, Object> params = new HashMap<>();
        if ("image".equals(request.getType())) {
            params.put("quality", request.getQuality());
        } else if ("video".equals(request.getType())) {
            params.put("model", request.getModel());
            params.put("resolution", request.getResolution());
            params.put("duration", request.getDuration());
            params.put("ratio", request.getRatio());
            params.put("fps", request.getFps());
            params.put("cameraFixed", request.getCameraFixed());
            params.put("cfgScale", request.getCfgScale());
            params.put("count", request.getCount());
            params.put("firstFrameImage", request.getFirstFrameImage());
            params.put("lastFrameImage", request.getLastFrameImage());
            params.put("hd", request.getHd());
        }
        // 添加水印参数
        params.put("watermark", request.getWatermark());
        content.setGenerationParams(params);

        // 保存到数据库
        save(content);

        // 增加模板使用次数
        if (template != null) {
            templateService.incrementUsageCount(template.getId());
        }

        // 创建修改后的请求对象用于异步生成
        GenerateContentRequest modifiedRequest = new GenerateContentRequest();
        BeanUtils.copyProperties(request, modifiedRequest);
        modifiedRequest.setPrompt(finalPrompt);

        // 异步调用生成API
        asyncGenerateContent(content.getId(), modifiedRequest);

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
        LambdaQueryWrapper<GeneratedContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GeneratedContent::getUserId, userId)
                .eq(GeneratedContent::getDeleted, 0);
        if (type != null && !type.isEmpty()) {
            wrapper.eq(GeneratedContent::getType, type);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(GeneratedContent::getStatus, status);
        }
        return count(wrapper);
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateGenerationStatus(Long contentId, String status, java.util.List<String> urls, java.util.List<String> thumbnails, String errorMessage) {
        GeneratedContent content = getById(contentId);
        if (content == null) {
            log.warn("更新生成状态失败，内容不存在: contentId={}", contentId);
            return;
        }

        content.setStatus(status);
        content.setUrls(urls);
        content.setThumbnails(thumbnails);
        content.setErrorMessage(errorMessage);
        content.setUpdatedAt(LocalDateTime.now());

        // 为了兼容性，如果有URL列表，也设置第一个URL到原字段
        if (urls != null && !urls.isEmpty()) {
            content.setUrl(urls.get(0));
        }
        if (thumbnails != null && !thumbnails.isEmpty()) {
            content.setThumbnail(thumbnails.get(0));
        }

        updateById(content);
        log.info("更新生成状态成功: contentId={}, status={}, urlCount={}", contentId, status, urls != null ? urls.size() : 0);
    }

    /**
     * 异步生成内容
     */
    @Async
    public void asyncGenerateContent(Long contentId, GenerateContentRequest request) {
        try {
            log.info("开始异步生成内容: contentId={}, type={}", contentId, request.getType());

            String resultUrl = null;
            String thumbnail = null;

            if ("image".equals(request.getType())) {
                // 调用图片生成API
                VolcanoApiService.ImageGenerationResult result = volcanoApiService.generateImage(
                        request.getPrompt(),
                        request.getSize(),
                        request.getStyle(),
                        request.getQuality(),
                        request.getResponseFormat(),
                        request.getSeed(),
                        request.getGuidanceScale(),
                        request.getWatermark()
                );

                if (result.isSuccess()) {
                    resultUrl = result.getUrl();
                    thumbnail = result.getUrl(); // 图片没有缩略图，使用原图
                } else {
                    // 图片生成失败
                    throw new RuntimeException(result.getErrorMessage());
                }
            } else {
                // 调用视频生成API
                VolcanoApiService.VideoGenerationResult result = volcanoApiService.generateVideo(
                        request.getPrompt(),
                        request.getModel(),
                        request.getResolution(),
                        request.getDuration(),
                        request.getRatio(),
                        request.getFps(),
                        request.getCameraFixed(),
                        request.getCfgScale(),
                        request.getCount(),
                        request.getFirstFrameImage(),
                        request.getLastFrameImage(),
                        request.getHd(),
                        request.getWatermark()
                );

                if (result.isSuccess() && result.getTaskId() != null) {
                    // 视频生成任务创建成功，开始轮询查询任务状态
                    log.info("视频生成任务创建成功，开始轮询查询状态: contentId={}, taskId={}", contentId, result.getTaskId());

                    String taskId = result.getTaskId();
                    int maxRetries = 60; // 最多查询60次，每次间隔10秒，总共10分钟
                    int retryCount = 0;

                    while (retryCount < maxRetries) {
                        try {
                            Thread.sleep(10000); // 等待10秒
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("任务被中断", e);
                        }

                        VolcanoApiService.VideoGenerationResult queryResult = volcanoApiService.queryVideoTask(taskId);

                        if (queryResult.isSuccess()) {
                            // 任务完成，检查是否有多个URL
                            if (queryResult.getUrls() != null && !queryResult.getUrls().isEmpty()) {
                                // 多个视频URL
                                log.info("视频生成任务完成: contentId={}, taskId={}, urlCount={}", contentId, taskId, queryResult.getUrls().size());
                                updateGenerationStatus(contentId, "completed", queryResult.getUrls(), queryResult.getThumbnails(), null);
                                return;
                            } else {
                                // 单个视频URL
                                resultUrl = queryResult.getUrl();
                                thumbnail = queryResult.getThumbnail();
                                log.info("视频生成任务完成: contentId={}, taskId={}, url={}", contentId, taskId, resultUrl);
                                break;
                            }
                        } else if ("PROCESSING".equals(queryResult.getErrorMessage())) {
                            // 任务进行中，继续等待
                            retryCount++;
                            log.debug("视频生成任务进行中: contentId={}, taskId={}, retry={}/{}", contentId, taskId, retryCount, maxRetries);
                        } else {
                            // 任务失败
                            throw new RuntimeException("视频生成任务失败: " + queryResult.getErrorMessage());
                        }
                    }

                    if (retryCount >= maxRetries) {
                        throw new RuntimeException("视频生成任务超时，请稍后重试");
                    }
                } else {
                    throw new RuntimeException("视频生成任务创建失败: " + result.getErrorMessage());
                }
            }

            // 更新为成功状态（单个URL的情况）
            updateGenerationStatus(contentId, "completed", resultUrl, thumbnail, null);

        } catch (Exception e) {
            log.error("生成内容失败: contentId={}", contentId, e);
            // 更新为失败状态
            updateGenerationStatus(contentId, "failed", (String) null, null, e.getMessage());
        }
    }

    /**
     * 转换为生成内容响应DTO
     */
    private GeneratedContentResponse convertToGeneratedContentResponse(GeneratedContent content) {
        GeneratedContentResponse response = new GeneratedContentResponse();
        BeanUtils.copyProperties(content, response);

        // 如果style字段存储的是风格ID，需要转换为风格名称
        if (content.getStyle() != null && !content.getStyle().trim().isEmpty()) {
            try {
                // 尝试解析为Long类型的ID
                Long styleId = Long.parseLong(content.getStyle());
                ArtStyle artStyle = artStyleService.getById(styleId);
                if (artStyle != null) {
                    response.setStyle(artStyle.getName());
                } else {
                    response.setStyle("默认风格");
                }
            } catch (NumberFormatException e) {
                // 如果不是数字，说明已经是风格名称，直接使用
                response.setStyle(content.getStyle());
            }
        } else {
            response.setStyle("默认风格");
        }

        return response;
    }

    @Override
    public long countUserContentsByDateRange(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<GeneratedContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GeneratedContent::getUserId, userId)
                .ge(GeneratedContent::getCreatedAt, startTime)
                .le(GeneratedContent::getCreatedAt, endTime);
        return count(wrapper);
    }

    @Override
    public long countUserContentsByDateRange(Long userId, LocalDateTime startTime, LocalDateTime endTime, String status) {
        LambdaQueryWrapper<GeneratedContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GeneratedContent::getUserId, userId)
                .ge(GeneratedContent::getCreatedAt, startTime)
                .le(GeneratedContent::getCreatedAt, endTime);
        if (status != null) {
            wrapper.eq(GeneratedContent::getStatus, status);
        }
        return count(wrapper);
    }

    @Override
    public long countUserContentsByDateRange(Long userId, LocalDateTime startTime, LocalDateTime endTime, String status, String type) {
        LambdaQueryWrapper<GeneratedContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GeneratedContent::getUserId, userId)
                .ge(GeneratedContent::getCreatedAt, startTime)
                .le(GeneratedContent::getCreatedAt, endTime);
        if (status != null) {
            wrapper.eq(GeneratedContent::getStatus, status);
        }
        if (type != null) {
            wrapper.eq(GeneratedContent::getType, type);
        }
        return count(wrapper);
    }
}