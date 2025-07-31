package com.textvision.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 艺术风格实体类
 *
 * @author TextVision
 * @since 2024-01-01
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("art_style")
public class ArtStyle implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 风格ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 风格名称
     */
    @TableField("name")
    private String name;

    /**
     * 风格描述
     */
    @TableField("description")
    private String description;

    /**
     * 适用类型：image-图片，video-视频，both-两者
     */
    @TableField("applicable_type")
    private String applicableType;

    /**
     * 排序权重
     */
    @TableField("sort_order")
    private Integer sortOrder;

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