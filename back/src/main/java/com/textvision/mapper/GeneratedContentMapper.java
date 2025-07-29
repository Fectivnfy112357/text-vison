package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textvision.entity.GeneratedContent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 生成内容数据访问层
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface GeneratedContentMapper extends BaseMapper<GeneratedContent> {

    /**
     * 查询用户最近的生成内容
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 生成内容列表
     */
    List<GeneratedContent> selectRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 分页查询用户生成内容（带条件）
     * 
     * @param page 分页参数
     * @param userId 用户ID
     * @param type 类型
     * @param status 状态
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param keyword 关键词
     * @return 分页结果
     */
    IPage<GeneratedContent> selectUserContentsPage(Page<GeneratedContent> page, @Param("userId") Long userId, 
                                                  @Param("type") String type, @Param("status") String status,
                                                  @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime,
                                                  @Param("keyword") String keyword);

    /**
     * 统计用户生成内容数量（带条件）
     * 
     * @param userId 用户ID
     * @param type 类型
     * @param status 状态
     * @return 数量
     */
    long countUserContents(@Param("userId") Long userId, @Param("type") String type, @Param("status") String status);

    /**
     * 统计用户今日生成次数
     * 
     * @param userId 用户ID
     * @return 今日生成次数
     */
    long getTodayGenerationCount(@Param("userId") Long userId);

    /**
     * 批量删除用户的生成内容
     * 
     * @param userId 用户ID
     * @param contentIds 内容ID列表
     * @return 删除数量
     */
    int batchDeleteUserContents(@Param("userId") Long userId, @Param("contentIds") List<Long> contentIds);
}