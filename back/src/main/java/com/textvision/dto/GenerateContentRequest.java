package com.textvision.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

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
     * 艺术风格ID
     */
    private Long styleId;

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

    // ========== 图片生成参数 ==========
    
    /**
     * 返回格式（仅图片生成）
     * 可选值：url, b64_json
     * 默认值：url
     */
    private String responseFormat;
    
    /**
     * 随机数种子（仅图片生成）
     * 用于控制模型生成内容的随机性
     * 取值范围：[-1, 2147483647]
     * 默认值：-1（自动生成）
     */
    @Min(value = -1, message = "随机数种子最小值为-1")
    @Max(value = 2147483647, message = "随机数种子最大值为2147483647")
    private Integer seed;
    
    /**
     * 引导比例（仅图片生成）
     * 模型输出结果与prompt的一致程度
     * 取值范围：[1, 10]
     * 默认值：2.5
     */
    @Min(value = 1, message = "引导比例最小值为1")
    @Max(value = 10, message = "引导比例最大值为10")
    private Double guidanceScale;

    // ========== 视频生成参数 ==========
    
    /**
     * 视频生成模型
     * 可选值：doubao-seedance-pronew, doubao-seedance-1-0-lite-t2v, doubao-seedance-1-0-lite-i2v, 
     *        doubao-seaweed, wan2-1-14b-t2v, wan2-1-14b-i2v, wan2-1-14b-flf2v
     */
    private String model;

    /**
     * 视频分辨率
     * 可选值：480p, 720p, 1080p
     */
    private String resolution;

    /**
     * 视频时长（秒）
     * 可选值：5, 10
     */
    @Min(value = 5, message = "视频时长最少5秒")
    @Max(value = 10, message = "视频时长最多10秒")
    private Integer duration;

    /**
     * 视频比例
     * 可选值：1:1, 3:4, 4:3, 16:9, 9:16, 21:9
     */
    private String ratio;

    /**
     * 帧率（仅视频生成）
     * 默认24fps
     */
    private Integer fps;

    /**
     * 是否固定摄像头（仅视频生成）
     * true-固定摄像头，false-运动摄像头
     */
    private Boolean cameraFixed;

    /**
     * CFG Scale参数（仅视频生成）
     * 控制生成内容与提示词的匹配程度，范围1-20
     */
    @Min(value = 1, message = "CFG Scale最小值为1")
    @Max(value = 20, message = "CFG Scale最大值为20")
    private Double cfgScale;

    /**
     * 生成视频数量
     * 默认1个，最多4个
     */
    @Min(value = 1, message = "生成数量最少1个")
    @Max(value = 4, message = "生成数量最多4个")
    private Integer count;

    /**
     * 首帧图片URL（图生视频）
     */
    private String firstFrameImage;

    /**
     * 尾帧图片URL（图生视频-首尾帧）
     */
    private String lastFrameImage;

    /**
     * 是否高清（仅视频生成）
     */
    private Boolean hd;

    /**
     * 是否添加水印
     */
    private Boolean watermark;
}