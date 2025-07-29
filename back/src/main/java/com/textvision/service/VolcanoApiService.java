package com.textvision.service;

import com.alibaba.fastjson2.JSON;
import com.textvision.util.HttpUtil;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 火山引擎API服务
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class VolcanoApiService {

    @Value("${volcano.api-key}")
    private String apiKey;

    @Value("${volcano.base-url}")
    private String baseUrl;

    @Value("${volcano.image-generation.endpoint}")
    private String imageEndpoint;

    @Value("${volcano.image-generation.model}")
    private String imageModel;

    @Value("${volcano.video-generation.endpoint}")
    private String videoEndpoint;

    @Value("${volcano.video-generation.model}")
    private String videoModel;

    /**
     * 生成图片
     * 
     * @param prompt 提示词
     * @param size 尺寸
     * @param style 风格
     * @param quality 质量
     * @return 生成结果
     */
    public ImageGenerationResult generateImage(String prompt, String size, String style, String quality) {
        try {
            String url = baseUrl + imageEndpoint;
            Map<String, String> headers = HttpUtil.buildHeaders(apiKey);
            
            ImageGenerationRequest request = new ImageGenerationRequest();
            request.setModel(imageModel);
            request.setPrompt(prompt);
            request.setSize(convertSizeFormat(size));
            request.setQuality(quality != null ? quality : "standard");
            request.setN(1);
            
            // 如果有风格参数，添加到提示词中
            if (style != null && !style.trim().isEmpty()) {
                request.setPrompt(prompt + ", " + style + " style");
            }
            
            log.info("调用火山引擎图片生成API: {}", JSON.toJSONString(request));
            
            String responseJson = HttpUtil.doPostJson(url, headers, request);
            ImageGenerationResponse response = JSON.parseObject(responseJson, ImageGenerationResponse.class);
            
            if (response != null && response.getData() != null && !response.getData().isEmpty()) {
                ImageData imageData = response.getData().get(0);
                ImageGenerationResult result = new ImageGenerationResult();
                result.setSuccess(true);
                result.setUrl(imageData.getUrl());
                result.setRevisedPrompt(imageData.getRevisedPrompt());
                return result;
            } else {
                log.error("火山引擎图片生成失败: 响应数据为空");
                return createErrorResult("图片生成失败: 响应数据为空");
            }
        } catch (Exception e) {
            log.error("火山引擎图片生成异常: {}", e.getMessage(), e);
            return createErrorResult("图片生成异常: " + e.getMessage());
        }
    }

    /**
     * 生成视频
     * 
     * @param prompt 提示词
     * @param duration 时长（秒）
     * @param fps 帧率
     * @param hd 是否高清
     * @return 生成结果
     */
    public VideoGenerationResult generateVideo(String prompt, Integer duration, Integer fps, Boolean hd) {
        try {
            String url = baseUrl + videoEndpoint;
            Map<String, String> headers = HttpUtil.buildHeaders(apiKey);
            
            // 构建符合火山引擎API规范的请求格式
            VideoGenerationRequest request = new VideoGenerationRequest();
            request.setModel(videoModel);
            
            // 构建content数组
            VideoContent content = new VideoContent();
            content.setType("text");
            
            // 构建包含参数的文本
            StringBuilder textBuilder = new StringBuilder(prompt);
            if (duration != null) {
                textBuilder.append(" --dur ").append(duration);
            } else {
                textBuilder.append(" --dur 5");
            }
            if (fps != null) {
                textBuilder.append(" --fps ").append(fps);
            } else {
                textBuilder.append(" --fps 24");
            }
            String quality = (hd != null && hd) ? "hd" : "standard";
            textBuilder.append(" --quality ").append(quality);
            
            content.setText(textBuilder.toString());
            request.setContent(java.util.Arrays.asList(content));
            
            log.info("调用火山引擎视频生成API: {}", JSON.toJSONString(request));
            
            String responseJson = HttpUtil.doPostJson(url, headers, request);
            log.debug("火山引擎视频生成API响应: {}", responseJson);
            
            // 火山引擎视频生成API返回任务ID，需要后续查询任务状态
            VideoGenerationTaskResponse response = JSON.parseObject(responseJson, VideoGenerationTaskResponse.class);
            
            if (response != null && response.getId() != null) {
                // 返回任务创建成功的结果，URL暂时为空
                VideoGenerationResult result = new VideoGenerationResult();
                result.setSuccess(true);
                result.setTaskId(response.getId());
                result.setUrl(""); // 任务创建成功，但视频还未生成完成
                log.info("视频生成任务创建成功，任务ID: {}", response.getId());
                return result;
            } else {
                log.error("火山引擎视频生成失败: 响应数据为空");
                return createVideoErrorResult("视频生成失败: 响应数据为空");
            }
        } catch (Exception e) {
            log.error("火山引擎视频生成异常: {}", e.getMessage(), e);
            return createVideoErrorResult("视频生成异常: " + e.getMessage());
        }
    }

    private ImageGenerationResult createErrorResult(String errorMessage) {
        ImageGenerationResult result = new ImageGenerationResult();
        result.setSuccess(false);
        result.setErrorMessage(errorMessage);
        return result;
    }

    private VideoGenerationResult createVideoErrorResult(String errorMessage) {
        VideoGenerationResult result = new VideoGenerationResult();
        result.setSuccess(false);
        result.setErrorMessage(errorMessage);
        return result;
    }

    /**
     * 转换尺寸格式
     * 将前端传来的格式（如landscape_16_9）转换为火山引擎API要求的格式（如1280x720）
     * 
     * @param size 前端传来的尺寸格式
     * @return 火山引擎API要求的尺寸格式
     */
    private String convertSizeFormat(String size) {
        if (size == null || size.trim().isEmpty()) {
            return "1024x1024";
        }
        
        // 如果已经是WIDTHxHEIGHT格式，直接返回
        if (size.matches("\\d+x\\d+")) {
            return size;
        }
        
        // 转换预定义的尺寸格式
        switch (size.toLowerCase()) {
            case "square":
            case "square_hd":
                return "1024x1024";
            case "portrait_4_3":
                return "864x1152";
            case "landscape_4_3":
                return "1152x864";
            case "portrait_16_9":
                return "720x1280";
            case "landscape_16_9":
                return "1280x720";
            case "portrait_2_3":
                return "832x1248";
            case "landscape_3_2":
                return "1248x832";
            case "landscape_21_9":
                return "1512x648";
            default:
                log.warn("未知的尺寸格式: {}, 使用默认尺寸 1024x1024", size);
                return "1024x1024";
        }
    }

    // 请求和响应数据类
    @Data
    public static class ImageGenerationRequest {
        private String model;
        private String prompt;
        private String size;
        private String quality;
        private Integer n;
    }

    @Data
    public static class ImageGenerationResponse {
        private List<ImageData> data;
    }

    @Data
    public static class ImageData {
        private String url;
        private String revisedPrompt;
    }

    @Data
    public static class ImageGenerationResult {
        private boolean success;
        private String url;
        private String revisedPrompt;
        private String errorMessage;
    }

    @Data
    public static class VideoGenerationRequest {
        private String model;
        private List<VideoContent> content;
    }

    @Data
    public static class VideoContent {
        private String type;
        private String text;
    }

    @Data
    public static class VideoGenerationTaskResponse {
        private String id;
    }

    @Data
    public static class VideoGenerationResponse {
        private List<VideoData> data;
    }

    @Data
    public static class VideoData {
        private String url;
        private String thumbnail;
        private Integer duration;
    }

    @Data
    public static class VideoGenerationResult {
        private boolean success;
        private String taskId;
        private String url;
        private String thumbnail;
        private Integer duration;
        private String errorMessage;
    }
}