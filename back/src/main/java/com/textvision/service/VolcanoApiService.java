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
            request.setSize(size != null ? size : "1024x1024");
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
            
            VideoGenerationRequest request = new VideoGenerationRequest();
            request.setModel(videoModel);
            request.setPrompt(prompt);
            request.setDuration(duration != null ? duration : 5);
            request.setFps(fps != null ? fps : 24);
            request.setQuality(hd != null && hd ? "hd" : "standard");
            
            log.info("调用火山引擎视频生成API: {}", JSON.toJSONString(request));
            
            String responseJson = HttpUtil.doPostJson(url, headers, request);
            VideoGenerationResponse response = JSON.parseObject(responseJson, VideoGenerationResponse.class);
            
            if (response != null && response.getData() != null && !response.getData().isEmpty()) {
                VideoData videoData = response.getData().get(0);
                VideoGenerationResult result = new VideoGenerationResult();
                result.setSuccess(true);
                result.setUrl(videoData.getUrl());
                result.setThumbnail(videoData.getThumbnail());
                result.setDuration(videoData.getDuration());
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
        private String prompt;
        private Integer duration;
        private Integer fps;
        private String quality;
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
        private String url;
        private String thumbnail;
        private Integer duration;
        private String errorMessage;
    }
}