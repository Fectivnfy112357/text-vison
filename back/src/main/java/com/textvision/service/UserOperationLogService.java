package com.textvision.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.entity.UserOperationLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 用户操作日志服务接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
public interface UserOperationLogService extends IService<UserOperationLog> {

    /**
     * 记录用户操作日志
     * 
     * @param userId 用户ID
     * @param operationType 操作类型
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param operationDetails 操作详情
     * @param ipAddress IP地址
     * @param userAgent 用户代理
     */
    void logUserOperation(Long userId, String operationType, String resourceType, Long resourceId, 
                         Map<String, Object> operationDetails, String ipAddress, String userAgent);

    /**
     * 分页查询用户操作日志
     * 
     * @param userId 用户ID
     * @param pageRequest 分页请求
     * @param operationType 操作类型
     * @param resourceType 资源类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作日志分页数据
     */
    PageResult<UserOperationLog> getUserOperationLogs(Long userId, PageRequest pageRequest, 
                                                     String operationType, String resourceType, 
                                                     LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取用户最近操作日志
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 最近操作日志列表
     */
    List<UserOperationLog> getRecentOperationLogs(Long userId, int limit);

    /**
     * 统计用户操作次数
     * 
     * @param userId 用户ID
     * @param operationType 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作次数
     */
    long countUserOperations(Long userId, String operationType, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 清理过期日志
     * 
     * @param beforeTime 清理此时间之前的日志
     * @return 清理数量
     */
    int cleanExpiredLogs(LocalDateTime beforeTime);

    /**
     * 获取用户操作统计
     * 
     * @param userId 用户ID
     * @param days 统计天数
     * @return 操作统计数据
     */
    Map<String, Object> getUserOperationStats(Long userId, int days);
}