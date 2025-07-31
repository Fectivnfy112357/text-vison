package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textvision.entity.TemplateCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 模板分类数据访问层
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface TemplateCategoryMapper extends BaseMapper<TemplateCategory> {

    /**
     * 获取启用状态的分类列表（按排序权重排序）
     * 
     * @return 分类列表
     */
    List<TemplateCategory> selectEnabledCategories();

    /**
     * 根据名称查找分类
     * 
     * @param name 分类名称
     * @return 分类信息
     */
    TemplateCategory selectByName(@Param("name") String name);

    /**
     * 更新分类排序
     * 
     * @param id 分类ID
     * @param sortOrder 排序权重
     */
    void updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
}