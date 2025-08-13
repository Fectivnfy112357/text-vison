package com.textvision.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 模板响应DTO
 *
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
public class TemplateResponse {

    /**
     * 模板ID
     */
    private Long id;

    /**
     * 模板宽高比
     */
    private String aspectRatio;

    /**
     * 模板标题
     */
    private String title;

    /**
     * 模板描述
     */
    private String description;

    /**
     * 模板提示词
     */
    private String prompt;

    /**
     * 模板分类
     */
    private String category;

    /**
     * 标签列表
     */
    private List<String> tags;

    /**
     * 模板预览图
     */
    private String imageUrl;

    /**
     * 类型：image-图片，video-视频
     */
    private String type;

    /**
     * 使用次数
     */
    private Integer usageCount;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}