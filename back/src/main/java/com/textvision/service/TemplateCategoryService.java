package com.textvision.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.textvision.entity.TemplateCategory;

import java.util.List;

/**
 * 模板分类服务接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
public interface TemplateCategoryService extends IService<TemplateCategory> {

    /**
     * 获取所有启用的分类
     * 
     * @return 分类列表
     */
    List<TemplateCategory> getAllEnabledCategories();

    /**
     * 根据名称获取分类
     * 
     * @param name 分类名称
     * @return 分类信息
     */
    TemplateCategory getCategoryByName(String name);

    /**
     * 创建分类
     * 
     * @param category 分类信息
     * @return 创建的分类
     */
    TemplateCategory createCategory(TemplateCategory category);

    /**
     * 更新分类
     * 
     * @param id 分类ID
     * @param category 分类信息
     * @return 更新的分类
     */
    TemplateCategory updateCategory(Long id, TemplateCategory category);

    /**
     * 删除分类
     * 
     * @param id 分类ID
     */
    void deleteCategory(Long id);

    /**
     * 更新分类排序
     * 
     * @param id 分类ID
     * @param sortOrder 排序权重
     */
    void updateCategorySortOrder(Long id, Integer sortOrder);

    /**
     * 获取分类名称列表（用于兼容旧接口）
     * 
     * @return 分类名称列表
     */
    List<String> getCategoryNames();
}