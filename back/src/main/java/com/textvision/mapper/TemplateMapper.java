package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textvision.entity.Template;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 模板Mapper接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface TemplateMapper extends BaseMapper<Template> {

    /**
     * 分页查询模板
     * 
     * @param page 分页对象
     * @param category 分类
     * @param type 类型
     * @param keyword 关键词
     * @return 模板分页数据
     */
    @Select("<script>" +
            "SELECT * FROM template WHERE deleted = 0 AND status = 1" +
            "<if test=\"category != null and category != ''\">" +
            " AND category = #{category}" +
            "</if>" +
            "<if test=\"type != null and type != ''\">" +
            " AND type = #{type}" +
            "</if>" +
            "<if test=\"keyword != null and keyword != ''\">" +
            " AND (title LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%'))" +
            "</if>" +
            " ORDER BY usage_count DESC, created_at DESC" +
            "</script>")
    IPage<Template> selectPageWithConditions(Page<Template> page, 
                                           @Param("category") String category,
                                           @Param("type") String type,
                                           @Param("keyword") String keyword);

    /**
     * 获取所有分类
     * 
     * @return 分类列表
     */
    @Select("SELECT DISTINCT category FROM template WHERE deleted = 0 AND status = 1 ORDER BY category")
    List<String> selectAllCategories();

    /**
     * 获取热门模板
     * 
     * @param limit 限制数量
     * @return 热门模板列表
     */
    @Select("SELECT * FROM template WHERE deleted = 0 AND status = 1 ORDER BY usage_count DESC LIMIT #{limit}")
    List<Template> selectPopularTemplates(@Param("limit") int limit);

    /**
     * 增加模板使用次数
     * 
     * @param id 模板ID
     */
    @Update("UPDATE template SET usage_count = usage_count + 1 WHERE id = #{id}")
    void incrementUsageCount(@Param("id") Long id);

    /**
     * 根据标签查询模板
     * 
     * @param tag 标签
     * @return 模板列表
     */
    @Select("SELECT * FROM template WHERE deleted = 0 AND status = 1 AND JSON_CONTAINS(tags, JSON_QUOTE(#{tag})) ORDER BY usage_count DESC")
    List<Template> selectByTag(@Param("tag") String tag);
}