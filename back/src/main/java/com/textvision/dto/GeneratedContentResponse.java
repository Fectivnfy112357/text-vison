package com.textvision.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 生成内容响应DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
public class GeneratedContentResponse {

    /**
     * 内容ID
     */
    private Long id;

    /**
     * 类型：image-图片，video-视频
     */
    private String type;

    /**
     * 生成提示词
     */
    private String prompt;

    /**
     * 生成内容URL
     */
    private String url;

    /**
     * 缩略图URL
     */
    private String thumbnail;

    /**
     * 多个生成内容URL（用于多视频生成）
     */
    private java.util.List<String> urls;

    /**
     * 多个缩略图URL
     */
    private java.util.List<String> thumbnails;

    /**
     * 尺寸比例
     */
    private String size;

    /**
     * 艺术风格
     */
    private String style;

    /**
     * 参考图片URL
     */
    private String referenceImage;

    /**
     * 使用的模板ID
     */
    private Long templateId;

    /**
     * 生成参数
     */
    private Map<String, Object> generationParams;

    /**
     * 状态：generating-生成中，completed-完成，failed-失败
     */
    private String status;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}