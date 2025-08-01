package com.textvision.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.common.ResultCode;
import com.textvision.dto.TemplateResponse;
import com.textvision.entity.Template;
import com.textvision.entity.TemplateCategory;
import com.textvision.exception.BusinessException;
import com.textvision.mapper.TemplateMapper;
import com.textvision.service.TemplateService;
import com.textvision.service.TemplateCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 模板服务实现类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateServiceImpl extends ServiceImpl<TemplateMapper, Template> implements TemplateService {

    private final TemplateMapper templateMapper;
    private final TemplateCategoryService templateCategoryService;

    @Override
    public PageResult<TemplateResponse> getTemplates(PageRequest pageRequest, String categoryId, String type) {
        Page<Template> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<Template> templatePage = templateMapper.selectPageWithConditions(page, categoryId, type, pageRequest.getKeyword());
        
        List<TemplateResponse> responses = templatePage.getRecords().stream()
                .map(this::convertToTemplateResponse)
                .collect(Collectors.toList());
        
        return PageResult.of(responses, templatePage.getTotal(), templatePage.getCurrent(), templatePage.getSize());
    }

    @Override
    public TemplateResponse getTemplateById(Long id) {
        Template template = getById(id);
        if (template == null) {
            throw new BusinessException(ResultCode.TEMPLATE_NOT_FOUND);
        }
        if (template.getStatus() == 0) {
            throw new BusinessException(ResultCode.TEMPLATE_DISABLED);
        }
        return convertToTemplateResponse(template);
    }

    @Override
    public List<String> getAllCategories() {
        // 使用新的分类服务获取分类名称列表
        return templateCategoryService.getCategoryNames();
    }

    @Override
    public List<TemplateResponse> getPopularTemplates(int limit) {
        List<Template> templates = templateMapper.selectPopularTemplates(limit);
        return templates.stream()
                .map(this::convertToTemplateResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TemplateResponse> getTemplatesByTag(String tag) {
        List<Template> templates = templateMapper.selectByTag(tag);
        return templates.stream()
                .map(this::convertToTemplateResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void incrementUsageCount(Long id) {
        Template template = getById(id);
        if (template == null) {
            throw new BusinessException(ResultCode.TEMPLATE_NOT_FOUND);
        }
        if (template.getStatus() == 0) {
            throw new BusinessException(ResultCode.TEMPLATE_DISABLED);
        }
        
        templateMapper.incrementUsageCount(id);
        log.debug("模板使用次数增加: templateId={}", id);
    }

    @Override
    public PageResult<TemplateResponse> searchTemplates(String keyword, String categoryId, String type, PageRequest pageRequest) {
        Page<Template> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        
        // 设置搜索关键词
        if (keyword != null && !keyword.trim().isEmpty()) {
            pageRequest.setKeyword(keyword.trim());
        }
        
        IPage<Template> templatePage = templateMapper.selectPageWithConditions(page, categoryId, type, pageRequest.getKeyword());
        
        List<TemplateResponse> responses = templatePage.getRecords().stream()
                .map(this::convertToTemplateResponse)
                .collect(Collectors.toList());
        
        return PageResult.of(responses, templatePage.getTotal(), templatePage.getCurrent(), templatePage.getSize());
    }

    /**
     * 转换为模板响应DTO
     */
    private TemplateResponse convertToTemplateResponse(Template template) {
        TemplateResponse response = new TemplateResponse();
        BeanUtils.copyProperties(template, response);
        
        // 根据categoryId获取分类名称
        if (template.getCategoryId() != null) {
            try {
                TemplateCategory category = templateCategoryService.getById(template.getCategoryId());
                if (category != null) {
                    response.setCategory(category.getName());
                } else {
                    response.setCategory("其他");
                }
            } catch (Exception e) {
                log.warn("获取分类信息失败: categoryId={}", template.getCategoryId(), e);
                response.setCategory("其他");
            }
        } else {
            response.setCategory("其他");
        }
        
        // 设置标签列表
        response.setTags(template.getTags());
        
        return response;
    }
}