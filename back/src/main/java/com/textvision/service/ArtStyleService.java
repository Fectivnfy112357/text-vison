package com.textvision.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.textvision.entity.ArtStyle;

import java.util.List;

/**
 * 艺术风格服务接口
 *
 * @author TextVision
 * @since 2024-01-01
 */
public interface ArtStyleService extends IService<ArtStyle> {

    /**
     * 根据适用类型获取艺术风格列表
     *
     * @param applicableType 适用类型：image、video、both
     * @return 艺术风格列表
     */
    List<ArtStyle> getStylesByType(String applicableType);

    /**
     * 获取所有启用的艺术风格
     *
     * @return 艺术风格列表
     */
    List<ArtStyle> getAllEnabledStyles();

    /**
     * 根据ID获取艺术风格描述
     *
     * @param styleId 风格ID
     * @return 风格描述
     */
    String getStyleDescription(Long styleId);

    /**
     * 创建艺术风格
     *
     * @param artStyle 艺术风格对象
     * @return 是否创建成功
     */
    boolean createStyle(ArtStyle artStyle);

    /**
     * 更新艺术风格
     *
     * @param artStyle 艺术风格对象
     * @return 是否更新成功
     */
    boolean updateStyle(ArtStyle artStyle);

    /**
     * 删除艺术风格
     *
     * @param id 风格ID
     * @return 是否删除成功
     */
    boolean deleteStyle(Long id);
}