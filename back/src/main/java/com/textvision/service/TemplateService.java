package com.textvision.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.dto.TemplateResponse;
import com.textvision.entity.Template;

import java.util.List;

/**
 * 模板服务接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
public interface TemplateService extends IService<Template> {

    /**
     * 分页查询模板
     * 
     * @param pageRequest 分页请求
     * @param category 分类
     * @param type 类型
     * @return 模板分页数据
     */
    PageResult<TemplateResponse> getTemplates(PageRequest pageRequest, String category, String type);

    /**
     * 根据ID获取模板
     * 
     * @param id 模板ID
     * @return 模板响应
     */
    TemplateResponse getTemplateById(Long id);

    /**
     * 获取所有分类
     * 
     * @return 分类列表
     */
    List<String> getAllCategories();

    /**
     * 获取热门模板
     * 
     * @param limit 限制数量
     * @return 热门模板列表
     */
    List<TemplateResponse> getPopularTemplates(int limit);

    /**
     * 根据标签查询模板
     * 
     * @param tag 标签
     * @return 模板列表
     */
    List<TemplateResponse> getTemplatesByTag(String tag);

    /**
     * 增加模板使用次数
     * 
     * @param id 模板ID
     */
    void incrementUsageCount(Long id);

    /**
     * 搜索模板
     * 
     * @param keyword 关键词
     * @param category 分类
     * @param type 类型
     * @param pageRequest 分页请求
     * @return 模板分页数据
     */
    PageResult<TemplateResponse> searchTemplates(String keyword, String category, String type, PageRequest pageRequest);
}