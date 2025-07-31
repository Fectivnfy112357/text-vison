package com.textvision.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textvision.common.ResultCode;
import com.textvision.entity.TemplateCategory;
import com.textvision.exception.BusinessException;
import com.textvision.mapper.TemplateCategoryMapper;
import com.textvision.service.TemplateCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 模板分类服务实现类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateCategoryServiceImpl extends ServiceImpl<TemplateCategoryMapper, TemplateCategory> implements TemplateCategoryService {

    private final TemplateCategoryMapper templateCategoryMapper;

    @Override
    public List<TemplateCategory> getAllEnabledCategories() {
        return templateCategoryMapper.selectEnabledCategories();
    }

    @Override
    public TemplateCategory getCategoryByName(String name) {
        return templateCategoryMapper.selectByName(name);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TemplateCategory createCategory(TemplateCategory category) {
        // 检查分类名称是否已存在
        TemplateCategory existing = getCategoryByName(category.getName());
        if (existing != null) {
            throw new BusinessException(ResultCode.CATEGORY_NAME_EXISTS);
        }
        
        // 设置默认值
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        
        save(category);
        log.info("创建分类成功: {}", category.getName());
        return category;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TemplateCategory updateCategory(Long id, TemplateCategory category) {
        TemplateCategory existing = getById(id);
        if (existing == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        }
        
        // 检查名称是否与其他分类重复
        if (!existing.getName().equals(category.getName())) {
            TemplateCategory nameExists = getCategoryByName(category.getName());
            if (nameExists != null && !nameExists.getId().equals(id)) {
                throw new BusinessException(ResultCode.CATEGORY_NAME_EXISTS);
            }
        }
        
        category.setId(id);
        updateById(category);
        log.info("更新分类成功: id={}, name={}", id, category.getName());
        return category;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        TemplateCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        }
        
        // 检查是否为系统默认分类
        if ("全部".equals(category.getName()) || "其他".equals(category.getName())) {
            throw new BusinessException(ResultCode.SYSTEM_CATEGORY_CANNOT_DELETE);
        }
        
        // 逻辑删除
        removeById(id);
        log.info("删除分类成功: id={}, name={}", id, category.getName());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCategorySortOrder(Long id, Integer sortOrder) {
        TemplateCategory category = getById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.CATEGORY_NOT_FOUND);
        }
        
        templateCategoryMapper.updateSortOrder(id, sortOrder);
        log.debug("更新分类排序: id={}, sortOrder={}", id, sortOrder);
    }

    @Override
    public List<String> getCategoryNames() {
        List<TemplateCategory> categories = getAllEnabledCategories();
        return categories.stream()
                .map(TemplateCategory::getName)
                .collect(Collectors.toList());
    }
}