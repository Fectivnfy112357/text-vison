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

    @Value("${volcano.video-generation.query-endpoint:/api/v3/contents/generations/tasks}")
    private String videoQueryEndpoint;

    /**
     * 生成图片
     * 
     * @param prompt 提示词
     * @param size 尺寸
     * @param style 风格
     * @param quality 质量
     * @param responseFormat 返回格式
     * @param seed 随机数种子
     * @param guidanceScale 引导比例
     * @return 生成结果
     */
    public ImageGenerationResult generateImage(String prompt, String size, String style, String quality, 
                                             String responseFormat, Integer seed, Double guidanceScale) {
        try {
            String url = baseUrl + imageEndpoint;
            Map<String, String> headers = HttpUtil.buildHeaders(apiKey);
            
            ImageGenerationRequest request = new ImageGenerationRequest();
            request.setModel(imageModel);
            request.setPrompt(prompt);
            request.setSize(convertSizeFormat(size));
            request.setQuality(quality != null ? quality : "standard");
            request.setN(1);
            
            // 设置返回格式
            if (responseFormat != null && !responseFormat.trim().isEmpty()) {
                request.setResponseFormat(responseFormat);
            }
            
            // 设置随机数种子
            if (seed != null && seed >= -1 && seed <= 2147483647) {
                request.setSeed(seed);
            }
            
            // 设置引导比例
            if (guidanceScale != null && guidanceScale >= 1.0 && guidanceScale <= 10.0) {
                request.setGuidanceScale(guidanceScale);
            }
            
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
     * @param model 模型名称
     * @param resolution 分辨率
     * @param duration 时长（秒）
     * @param ratio 视频比例
     * @param fps 帧率
     * @param cameraFixed 是否固定摄像头
     * @param cfgScale CFG Scale参数
     * @param count 生成数量
     * @param firstFrameImage 首帧图片
     * @param lastFrameImage 尾帧图片
     * @param hd 是否高清
     * @return 生成结果
     */
    public VideoGenerationResult generateVideo(String prompt, String model, String resolution, 
                                             Integer duration, String ratio, Integer fps, 
                                             Boolean cameraFixed, Double cfgScale, Integer count,
                                             String firstFrameImage, String lastFrameImage, Boolean hd) {
        try {
            String url = baseUrl + videoEndpoint;
            Map<String, String> headers = HttpUtil.buildHeaders(apiKey);
            
            // 构建符合火山引擎API规范的请求格式
            VideoGenerationRequest request = new VideoGenerationRequest();
            // 使用传入的模型，如果为空则使用默认模型
            request.setModel(model != null ? model : videoModel);
            
            // 构建content数组
            java.util.List<VideoContent> contentList = new java.util.ArrayList<>();
            
            // 添加文本内容
            VideoContent textContent = new VideoContent();
            textContent.setType("text");
            
            // 构建包含参数的文本
            StringBuilder textBuilder = new StringBuilder(prompt);
            
            // 添加分辨率参数
            if (resolution != null) {
                textBuilder.append(" --rs ").append(resolution);
            }
            
            // 添加时长参数
            if (duration != null) {
                textBuilder.append(" --dur ").append(duration);
            } else {
                textBuilder.append(" --dur 5");
            }
            
            // 添加比例参数
            if (ratio != null) {
                textBuilder.append(" --ratio ").append(ratio);
            }
            
            // 添加帧率参数
            if (fps != null) {
                textBuilder.append(" --fps ").append(fps);
            }
            
            // 添加固定摄像头参数
            if (cameraFixed != null) {
                textBuilder.append(" --cf ").append(cameraFixed ? "true" : "false");
            }
            
            // 添加CFG Scale参数
            if (cfgScale != null) {
                textBuilder.append(" --cfg ").append(cfgScale);
            }
            
            // 添加生成数量参数
            if (count != null && count > 1) {
                textBuilder.append(" --n ").append(count);
            }
            
            textContent.setText(textBuilder.toString());
            contentList.add(textContent);
            
            // 添加首帧图片
            if (firstFrameImage != null && !firstFrameImage.trim().isEmpty()) {
                VideoContent firstFrameContent = new VideoContent();
                firstFrameContent.setType("image_url");
                VideoImageUrl firstImageUrl = new VideoImageUrl();
                firstImageUrl.setUrl(firstFrameImage);
                firstFrameContent.setImage_url(firstImageUrl);
                firstFrameContent.setRole("first_frame");
                contentList.add(firstFrameContent);
            }
            
            // 添加尾帧图片
            if (lastFrameImage != null && !lastFrameImage.trim().isEmpty()) {
                VideoContent lastFrameContent = new VideoContent();
                lastFrameContent.setType("image_url");
                VideoImageUrl lastImageUrl = new VideoImageUrl();
                lastImageUrl.setUrl(lastFrameImage);
                lastFrameContent.setImage_url(lastImageUrl);
                lastFrameContent.setRole("last_frame");
                contentList.add(lastFrameContent);
            }
            
            request.setContent(contentList);
            
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
                result.setCount(count != null ? count : 1); // 记录生成数量
                log.info("视频生成任务创建成功，任务ID: {}, 生成数量: {}", response.getId(), count);
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

    /**
     * 查询视频生成任务状态
     * 
     * @param taskId 任务ID
     * @return 查询结果
     */
    public VideoGenerationResult queryVideoTask(String taskId) {
        try {
            String url = baseUrl + videoQueryEndpoint + "/" + taskId;
            Map<String, String> headers = HttpUtil.buildHeaders(apiKey);
            
            log.debug("查询视频生成任务状态: taskId={}, url={}", taskId, url);
            
            String responseJson = HttpUtil.doGet(url, headers);
            log.debug("火山引擎视频任务查询API响应: {}", responseJson);
            
            VideoTaskQueryResponse response = JSON.parseObject(responseJson, VideoTaskQueryResponse.class);
            
            VideoGenerationResult result = new VideoGenerationResult();
            result.setTaskId(taskId);
            
            if (response != null) {
                if ("succeeded".equals(response.getStatus())) {
                    // 任务完成，提取视频URL
                    if (response.getContent() != null && response.getContent().getVideo_url() != null) {
                        String videoUrl = response.getContent().getVideo_url().trim();
                        // 移除可能存在的反引号
                        if (videoUrl.startsWith("`") && videoUrl.endsWith("`")) {
                            videoUrl = videoUrl.substring(1, videoUrl.length() - 1).trim();
                        }
                        
                        // 检查是否包含多个视频URL（以逗号或分号分隔）
                        if (videoUrl.contains(",") || videoUrl.contains(";")) {
                            // 多个视频URL
                            String[] urlArray = videoUrl.split("[,;]");
                            java.util.List<String> urls = new java.util.ArrayList<>();
                            java.util.List<String> thumbnails = new java.util.ArrayList<>();
                            
                            for (String u : urlArray) {
                                String cleanUrl = u.trim();
                                if (!cleanUrl.isEmpty()) {
                                    urls.add(cleanUrl);
                                    // 为每个视频生成缩略图URL（如果API提供的话）
                                    thumbnails.add(cleanUrl); // 暂时使用视频URL作为缩略图
                                }
                            }
                            
                            result.setSuccess(true);
                            result.setUrls(urls);
                            result.setThumbnails(thumbnails);
                            result.setUrl(urls.get(0)); // 兼容性：设置第一个URL
                            result.setDuration(response.getDuration());
                            log.info("视频生成任务完成: taskId={}, urlCount={}", taskId, urls.size());
                        } else {
                            // 单个视频URL
                            result.setSuccess(true);
                            result.setUrl(videoUrl);
                            result.setDuration(response.getDuration());
                            log.info("视频生成任务完成: taskId={}, url={}", taskId, videoUrl);
                        }
                    } else {
                        result.setSuccess(false);
                        result.setErrorMessage("任务完成但无视频数据");
                    }
                } else if ("failed".equals(response.getStatus())) {
                    // 任务失败
                    result.setSuccess(false);
                    result.setErrorMessage(response.getError() != null ? response.getError() : "视频生成失败");
                    log.error("视频生成任务失败: taskId={}, error={}", taskId, response.getError());
                } else {
                    // 任务进行中
                    result.setSuccess(false);
                    result.setErrorMessage("PROCESSING"); // 特殊标记表示任务进行中
                    log.debug("视频生成任务进行中: taskId={}, status={}", taskId, response.getStatus());
                }
            } else {
                result.setSuccess(false);
                result.setErrorMessage("查询响应为空");
            }
            
            return result;
        } catch (Exception e) {
            log.error("查询视频生成任务异常: taskId={}", taskId, e);
            VideoGenerationResult result = new VideoGenerationResult();
            result.setSuccess(false);
            result.setTaskId(taskId);
            result.setErrorMessage("查询任务异常: " + e.getMessage());
            return result;
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
        private String responseFormat;
        private Integer seed;
        private Double guidanceScale;
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
    public static class VideoTaskQueryResponse {
        private String id;
        private String model;
        private String status;
        private String error;
        private VideoContent content;
        private VideoUsage usage;
        private Long created_at;
        private Long updated_at;
        private Integer seed;
        private String resolution;
        private Integer duration;
        private String ratio;
        private Integer framespersecond;
    }

    @Data
    public static class VideoContent {
        private String type;
        private String text;
        private String video_url;
        private VideoImageUrl image_url;
        private String role; // first_frame, last_frame
    }
    
    @Data
    public static class VideoImageUrl {
        private String url;
    }

    @Data
    public static class VideoUsage {
        private Integer completion_tokens;
        private Integer total_tokens;
    }

    @Data
    public static class VideoGenerationResult {
        private boolean success;
        private String taskId;
        private String url;
        private String thumbnail;
        private Integer duration;
        private String errorMessage;
        private Integer count; // 生成数量
        private java.util.List<String> urls; // 多个视频URL
        private java.util.List<String> thumbnails; // 多个缩略图URL
    }
}