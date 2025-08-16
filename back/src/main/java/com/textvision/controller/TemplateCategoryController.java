package com.textvision.controller;

import com.textvision.common.Result;
import com.textvision.entity.TemplateCategory;
import com.textvision.service.TemplateCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 模板分类控制器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/template-categories")
@RequiredArgsConstructor
@Tag(name = "模板分类管理", description = "模板分类相关接口")
public class TemplateCategoryController {

    private final TemplateCategoryService templateCategoryService;

    @GetMapping
    @Operation(summary = "获取所有启用的分类")
    public Result<List<TemplateCategory>> getAllCategories() {
        List<TemplateCategory> categories = templateCategoryService.getAllEnabledCategories();
        return Result.success(categories);
    }

    @GetMapping("/names")
    @Operation(summary = "获取分类名称列表")
    public Result<List<String>> getCategoryNames() {
        List<String> names = templateCategoryService.getCategoryNames();
        return Result.success(names);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取分类详情")
    public Result<TemplateCategory> getCategoryById(
            @Parameter(description = "分类ID") @PathVariable Long id) {
        TemplateCategory category = templateCategoryService.getById(id);
        return Result.success(category);
    }

    @PostMapping
    @Operation(summary = "创建新分类")
    public Result<TemplateCategory> createCategory(
            @Valid @RequestBody TemplateCategory category) {
        TemplateCategory created = templateCategoryService.createCategory(category);
        return Result.success(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新分类信息")
    public Result<TemplateCategory> updateCategory(
            @Parameter(description = "分类ID") @PathVariable Long id,
            @Valid @RequestBody TemplateCategory category) {
        TemplateCategory updated = templateCategoryService.updateCategory(id, category);
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类")
    public Result<Void> deleteCategory(
            @Parameter(description = "分类ID") @PathVariable Long id) {
        templateCategoryService.deleteCategory(id);
        return Result.success();
    }

    @PutMapping("/{id}/sort-order")
    @Operation(summary = "更新分类排序")
    public Result<Void> updateSortOrder(
            @Parameter(description = "分类ID") @PathVariable Long id,
            @Parameter(description = "排序权重") @RequestParam Integer sortOrder) {
        templateCategoryService.updateCategorySortOrder(id, sortOrder);
        return Result.success();
    }
}