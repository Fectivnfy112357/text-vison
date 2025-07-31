package com.textvision.controller;

import com.textvision.common.Result;
import com.textvision.entity.ArtStyle;
import com.textvision.service.ArtStyleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 艺术风格控制器
 *
 * @author TextVision
 * @since 2024-01-01
 */
@Tag(name = "艺术风格管理", description = "艺术风格相关接口")
@RestController
@RequestMapping("/api/art-styles")
@RequiredArgsConstructor
public class ArtStyleController {

    private final ArtStyleService artStyleService;

    @Operation(summary = "获取艺术风格列表", description = "根据类型获取艺术风格列表")
    @GetMapping
    public Result<List<ArtStyle>> getArtStyles(
            @Parameter(description = "适用类型：image、video、both") 
            @RequestParam(required = false) String type) {
        List<ArtStyle> styles = artStyleService.getStylesByType(type);
        return Result.success(styles);
    }

    @Operation(summary = "根据ID获取艺术风格", description = "获取指定ID的艺术风格详情")
    @GetMapping("/{id}")
    public Result<ArtStyle> getArtStyleById(
            @Parameter(description = "风格ID") 
            @PathVariable Long id) {
        ArtStyle artStyle = artStyleService.getById(id);
        if (artStyle == null) {
            return Result.error("艺术风格不存在");
        }
        return Result.success(artStyle);
    }

    @Operation(summary = "创建艺术风格", description = "创建新的艺术风格")
    @PostMapping
    public Result<String> createArtStyle(@RequestBody ArtStyle artStyle) {
        if (artStyle.getName() == null || artStyle.getName().trim().isEmpty()) {
            return Result.error("风格名称不能为空");
        }
        if (artStyle.getDescription() == null || artStyle.getDescription().trim().isEmpty()) {
            return Result.error("风格描述不能为空");
        }
        if (artStyle.getApplicableType() == null || artStyle.getApplicableType().trim().isEmpty()) {
            return Result.error("适用类型不能为空");
        }
        
        boolean success = artStyleService.createStyle(artStyle);
        if (success) {
            return Result.success("创建成功");
        } else {
            return Result.error("创建失败");
        }
    }

    @Operation(summary = "更新艺术风格", description = "更新指定ID的艺术风格")
    @PutMapping("/{id}")
    public Result<String> updateArtStyle(
            @Parameter(description = "风格ID") 
            @PathVariable Long id, 
            @RequestBody ArtStyle artStyle) {
        artStyle.setId(id);
        boolean success = artStyleService.updateStyle(artStyle);
        if (success) {
            return Result.success("更新成功");
        } else {
            return Result.error("更新失败");
        }
    }

    @Operation(summary = "删除艺术风格", description = "删除指定ID的艺术风格")
    @DeleteMapping("/{id}")
    public Result<String> deleteArtStyle(
            @Parameter(description = "风格ID") 
            @PathVariable Long id) {
        boolean success = artStyleService.deleteStyle(id);
        if (success) {
            return Result.success("删除成功");
        } else {
            return Result.error("删除失败");
        }
    }
}