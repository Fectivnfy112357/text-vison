package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textvision.entity.Template;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 模板数据访问层
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface TemplateMapper extends BaseMapper<Template> {

    /**
     * 分页查询模板（带条件）
     * 
     * @param page 分页参数
     * @param category 分类
     * @param type 类型
     * @param keyword 关键词
     * @return 分页结果
     */
    IPage<Template> selectPageWithConditions(Page<Template> page, @Param("category") String category, 
                                           @Param("type") String type, @Param("keyword") String keyword);

    /**
     * 获取所有分类
     * 
     * @return 分类列表
     */
    List<String> selectAllCategories();

    /**
     * 获取热门模板
     * 
     * @param limit 限制数量
     * @return 模板列表
     */
    List<Template> selectPopularTemplates(@Param("limit") int limit);

    /**
     * 增加使用次数
     * 
     * @param id 模板ID
     */
    void incrementUsageCount(@Param("id") Long id);

    /**
     * 根据标签查询模板
     * 
     * @param tag 标签
     * @return 模板列表
     */
    List<Template> selectByTag(@Param("tag") String tag);
}