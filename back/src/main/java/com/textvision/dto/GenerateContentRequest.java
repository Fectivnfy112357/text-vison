package com.textvision.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * 内容生成请求DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
public class GenerateContentRequest {

    /**
     * 生成类型：image-图片，video-视频
     */
    @NotBlank(message = "生成类型不能为空")
    @Pattern(regexp = "^(image|video)$", message = "生成类型只能是image或video")
    private String type;

    /**
     * 生成提示词
     */
    @NotBlank(message = "提示词不能为空")
    @Size(max = 1000, message = "提示词长度不能超过1000字符")
    private String prompt;

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
     * 图片质量（仅图片生成）
     */
    private String quality;

    /**
     * 视频时长（仅视频生成，秒）
     */
    private Integer duration;

    /**
     * 帧率（仅视频生成）
     */
    private Integer fps;

    /**
     * 是否高清（仅视频生成）
     */
    private Boolean hd;
}