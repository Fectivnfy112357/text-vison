package com.textvision.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.dto.GenerateContentRequest;
import com.textvision.dto.GeneratedContentResponse;
import com.textvision.entity.GeneratedContent;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 生成内容服务接口
 *
 * @author TextVision Team
 * @since 1.0.0
 */
public interface GeneratedContentService extends IService<GeneratedContent> {

    /**
     * 生成内容
     *
     * @param userId  用户ID
     * @param request 生成请求
     * @return 生成内容响应
     */
    GeneratedContentResponse generateContent(Long userId, GenerateContentRequest request);

    /**
     * 分页查询用户生成内容
     *
     * @param userId      用户ID
     * @param pageRequest 分页请求
     * @param type        内容类型
     * @param status      状态
     * @param startTime   开始时间
     * @param endTime     结束时间
     * @return 生成内容分页数据
     */
    PageResult<GeneratedContentResponse> getUserContents(Long userId, PageRequest pageRequest, String type, String status, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 根据ID获取生成内容
     *
     * @param userId    用户ID
     * @param contentId 内容ID
     * @return 生成内容响应
     */
    GeneratedContentResponse getContentById(Long userId, Long contentId);

    /**
     * 获取用户最近生成的内容
     *
     * @param userId 用户ID
     * @param limit  限制数量
     * @return 最近生成内容列表
     */
    List<GeneratedContentResponse> getRecentContents(Long userId, int limit);

    /**
     * 删除生成内容
     *
     * @param userId    用户ID
     * @param contentId 内容ID
     * @return 是否成功
     */
    boolean deleteContent(Long userId, Long contentId);

    /**
     * 批量删除生成内容
     *
     * @param userId     用户ID
     * @param contentIds 内容ID列表
     * @return 删除数量
     */
    int batchDeleteContents(Long userId, List<Long> contentIds);

    /**
     * 统计用户生成内容数量
     *
     * @param userId 用户ID
     * @param type   内容类型
     * @param status 状态
     * @return 数量
     */
    long countUserContents(Long userId, String type, String status);

    /**
     * 获取用户今日生成数量
     *
     * @param userId 用户ID
     * @return 今日生成数量
     */
    long getTodayGenerationCount(Long userId);

    /**
     * 更新生成状态
     *
     * @param contentId    内容ID
     * @param status       状态
     * @param url          生成结果URL
     * @param thumbnail    缩略图URL
     * @param errorMessage 错误信息
     */
    void updateGenerationStatus(Long contentId, String status, String url, String thumbnail, String errorMessage);

    /**
     * 更新生成状态（支持多个URL）
     *
     * @param contentId    内容ID
     * @param status       状态
     * @param urls         生成结果URL列表
     * @param thumbnails   缩略图URL列表
     * @param errorMessage 错误信息
     */
    void updateGenerationStatus(Long contentId, String status, java.util.List<String> urls, java.util.List<String> thumbnails, String errorMessage);

    /**
     * 根据日期范围统计用户生成内容数量
     *
     * @param userId    用户ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 数量
     */
    long countUserContentsByDateRange(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 根据日期范围和状态统计用户生成内容数量
     *
     * @param userId    用户ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @param status    状态
     * @return 数量
     */
    long countUserContentsByDateRange(Long userId, LocalDateTime startTime, LocalDateTime endTime, String status);

    /**
     * 根据日期范围、状态和类型统计用户生成内容数量
     *
     * @param userId    用户ID
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @param status    状态
     * @param type      内容类型
     * @return 数量
     */
    long countUserContentsByDateRange(Long userId, LocalDateTime startTime, LocalDateTime endTime, String status, String type);

    void asyncGenerateContent(Long id, GenerateContentRequest modifiedRequest);

}