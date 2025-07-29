package com.textvision.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 模板实体类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName(value = "template", autoResultMap = true)
public class Template {

    /**
     * 模板ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 模板标题
     */
    @TableField("title")
    private String title;

    /**
     * 模板描述
     */
    @TableField("description")
    private String description;

    /**
     * 模板提示词
     */
    @TableField("prompt")
    private String prompt;

    /**
     * 模板分类
     */
    @TableField("category")
    private String category;

    /**
     * 标签列表
     */
    @TableField(value = "tags", typeHandler = JacksonTypeHandler.class)
    private List<String> tags;

    /**
     * 模板预览图
     */
    @TableField("image_url")
    private String imageUrl;

    /**
     * 类型：image-图片，video-视频
     */
    @TableField("type")
    private String type;

    /**
     * 使用次数
     */
    @TableField("usage_count")
    private Integer usageCount;

    /**
     * 状态：0-禁用，1-启用
     */
    @TableField("status")
    private Integer status;

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