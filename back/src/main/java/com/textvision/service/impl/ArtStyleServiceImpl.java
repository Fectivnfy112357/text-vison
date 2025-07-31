package com.textvision.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textvision.entity.ArtStyle;
import com.textvision.mapper.ArtStyleMapper;
import com.textvision.service.ArtStyleService;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 艺术风格服务实现类
 *
 * @author TextVision
 * @since 2024-01-01
 */
@Service
public class ArtStyleServiceImpl extends ServiceImpl<ArtStyleMapper, ArtStyle> implements ArtStyleService {

    @Override
    public List<ArtStyle> getStylesByType(String applicableType) {
        if (applicableType == null || applicableType.trim().isEmpty()) {
            return getAllEnabledStyles();
        }
        return baseMapper.selectByApplicableType(applicableType);
    }

    @Override
    public List<ArtStyle> getAllEnabledStyles() {
        return baseMapper.selectEnabledStyles(null);
    }

    @Override
    public String getStyleDescription(Long styleId) {
        if (styleId == null) {
            return null;
        }
        
        QueryWrapper<ArtStyle> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", styleId)
                   .eq("status", 1)
                   .eq("deleted", 0);
        
        ArtStyle artStyle = getOne(queryWrapper);
        return artStyle != null ? artStyle.getDescription() : null;
    }

    @Override
    public boolean createStyle(ArtStyle artStyle) {
        if (artStyle == null) {
            return false;
        }
        
        // 设置默认值
        if (artStyle.getStatus() == null) {
            artStyle.setStatus(1);
        }
        if (artStyle.getSortOrder() == null) {
            artStyle.setSortOrder(0);
        }
        
        return save(artStyle);
    }

    @Override
    public boolean updateStyle(ArtStyle artStyle) {
        if (artStyle == null || artStyle.getId() == null) {
            return false;
        }
        
        return updateById(artStyle);
    }

    @Override
    public boolean deleteStyle(Long id) {
        if (id == null) {
            return false;
        }
        
        return removeById(id);
    }
}