package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textvision.entity.GeneratedContent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 生成内容Mapper接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface GeneratedContentMapper extends BaseMapper<GeneratedContent> {

    /**
     * 分页查询用户生成内容
     * 
     * @param page 分页对象
     * @param userId 用户ID
     * @param type 内容类型
     * @param status 状态
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param keyword 关键词
     * @return 生成内容分页数据
     */
    IPage<GeneratedContent> selectUserContentsPage(Page<GeneratedContent> page, Long userId, String type, String status, 
                                                   LocalDateTime startTime, LocalDateTime endTime, String keyword);

    /**
     * 获取用户最近生成的内容
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 最近生成内容列表
     */
    @Select("SELECT * FROM generated_content WHERE user_id = #{userId} AND deleted = 0 ORDER BY created_at DESC LIMIT #{limit}")
    List<GeneratedContent> selectRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 统计用户生成内容数量
     * 
     * @param userId 用户ID
     * @param type 内容类型
     * @param status 状态
     * @return 数量
     */
    @Select("<script>" +
            "SELECT COUNT(1) FROM generated_content WHERE user_id = #{userId} AND deleted = 0" +
            "<if test=\"type != null and type != ''\">" +
            " AND type = #{type}" +
            "</if>" +
            "<if test=\"status != null and status != ''\">" +
            " AND status = #{status}" +
            "</if>" +
            "</script>")
    long countByUserIdAndConditions(@Param("userId") Long userId,
                                   @Param("type") String type,
                                   @Param("status") String status);

    /**
     * 获取用户今日生成数量
     * 
     * @param userId 用户ID
     * @param today 今日开始时间
     * @return 今日生成数量
     */
    @Select("SELECT COUNT(1) FROM generated_content WHERE user_id = #{userId} AND deleted = 0 AND created_at >= #{today}")
    long countTodayByUserId(@Param("userId") Long userId, @Param("today") LocalDateTime today);

    /**
     * 批量删除用户生成内容
     * 
     * @param userId 用户ID
     * @param ids ID列表
     * @return 影响行数
     */
    @Select("UPDATE generated_content SET deleted = 1 WHERE user_id = #{userId} AND id IN (${ids})")
    int batchDeleteByUserIdAndIds(@Param("userId") Long userId, @Param("ids") String ids);

    /**
     * 批量删除用户生成内容
     * 
     * @param userId 用户ID
     * @param ids ID列表
     * @return 影响行数
     */
    int batchDeleteUserContents(@Param("userId") Long userId, @Param("ids") List<Long> ids);

    /**
     * 统计用户内容数量
     * 
     * @param userId 用户ID
     * @param type 内容类型
     * @param status 状态
     * @return 数量
     */
    long countUserContents(@Param("userId") Long userId, @Param("type") String type, @Param("status") String status);

    /**
     * 获取用户今日生成数量
     * 
     * @param userId 用户ID
     * @return 今日生成数量
     */
    long getTodayGenerationCount(@Param("userId") Long userId);
}