package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textvision.entity.ArtStyle;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 艺术风格Mapper接口
 *
 * @author TextVision
 * @since 2024-01-01
 */
@Mapper
public interface ArtStyleMapper extends BaseMapper<ArtStyle> {

    /**
     * 根据适用类型查询艺术风格列表
     *
     * @param applicableType 适用类型
     * @return 艺术风格列表
     */
    List<ArtStyle> selectByApplicableType(@Param("applicableType") String applicableType);

    /**
     * 查询启用状态的艺术风格列表
     *
     * @param applicableType 适用类型（可选）
     * @return 艺术风格列表
     */
    List<ArtStyle> selectEnabledStyles(@Param("applicableType") String applicableType);
}