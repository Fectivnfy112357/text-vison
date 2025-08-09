package com.textvision.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 生成内容实体类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName(value = "generated_content", autoResultMap = true)
public class GeneratedContent {

    /**
     * 内容ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 类型：image-图片，video-视频
     */
    @TableField("type")
    private String type;

    /**
     * 生成提示词
     */
    @TableField("prompt")
    private String prompt;

    /**
     * 生成内容URL
     */
    @TableField("url")
    private String url;

    /**
     * 缩略图URL
     */
    @TableField("thumbnail")
    private String thumbnail;

    /**
     * 多个生成内容URL（用于多视频生成）
     */
    @TableField(value = "urls", typeHandler = JacksonTypeHandler.class)
    private java.util.List<String> urls;

    /**
     * 多个缩略图URL
     */
    @TableField(value = "thumbnails", typeHandler = JacksonTypeHandler.class)
    private java.util.List<String> thumbnails;

    /**
     * 尺寸比例
     */
    @TableField("size")
    private String size;

    /**
     * 艺术风格
     */
    @TableField("style")
    private String style;

    /**
     * 参考图片URL
     */
    @TableField("reference_image")
    private String referenceImage;

    /**
     * 使用的模板ID
     */
    @TableField("template_id")
    private Long templateId;

    /**
     * 生成参数
     */
    @TableField(value = "generation_params", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> generationParams;

    /**
     * 状态：processing-处理中，completed-完成，failed-失败
     */
    @TableField("status")
    private String status;

    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除：0-未删除，1-已删除
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;
}