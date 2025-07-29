package com.textvision.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textvision.common.PageRequest;
import com.textvision.common.PageResult;
import com.textvision.entity.UserOperationLog;
import com.textvision.mapper.UserOperationLogMapper;
import com.textvision.service.UserOperationLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户操作日志服务实现类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserOperationLogServiceImpl extends ServiceImpl<UserOperationLogMapper, UserOperationLog> implements UserOperationLogService {

    private final UserOperationLogMapper userOperationLogMapper;

    @Override
    @Async
    public void logUserOperation(Long userId, String operationType, String resourceType, 
                               Long resourceId, Map<String, Object> operationDetails, 
                               String ipAddress, String userAgent) {
        UserOperationLog operationLog = new UserOperationLog();
        operationLog.setUserId(userId);
        operationLog.setOperation(operationType);
        operationLog.setResourceType(resourceType);
        operationLog.setResourceId(resourceId);
        operationLog.setDetails(operationDetails);
        operationLog.setIpAddress(ipAddress);
        operationLog.setUserAgent(userAgent);
        operationLog.setCreatedAt(LocalDateTime.now());
        
        userOperationLogMapper.insert(operationLog);
    }

    @Override
    public PageResult<UserOperationLog> getUserOperationLogs(Long userId, PageRequest pageRequest, 
                                                            String operationType, String resourceType, 
                                                            LocalDateTime startTime, LocalDateTime endTime) {
        Page<UserOperationLog> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<UserOperationLog> logPage = userOperationLogMapper.selectUserOperationLogsPage(
                page, userId, operationType, resourceType, startTime, endTime);
        
        return PageResult.of(logPage.getRecords(), logPage.getTotal(), logPage.getCurrent(), logPage.getSize());
    }

    @Override
    public List<UserOperationLog> getRecentOperationLogs(Long userId, int limit) {
        return userOperationLogMapper.selectRecentByUserId(userId, limit);
    }

    @Override
    public long countUserOperations(Long userId, String operationType, LocalDateTime startTime, LocalDateTime endTime) {
        return userOperationLogMapper.countByUserIdAndConditions(userId, operationType, startTime, endTime);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cleanExpiredLogs(LocalDateTime beforeTime) {
        int count = userOperationLogMapper.deleteExpiredLogs(beforeTime);
        log.info("清理过期操作日志完成，清理数量: {}", count);
        return count;
    }

    @Override
    public Map<String, Object> getUserOperationStats(Long userId, int days) {
        LocalDateTime startTime = LocalDateTime.now().minusDays(days);
        LocalDateTime endTime = LocalDateTime.now();
        
        Map<String, Object> stats = new HashMap<>();
        
        // 总操作次数
        long totalOperations = userOperationLogMapper.countByUserIdAndConditions(userId, null, startTime, endTime);
        stats.put("totalOperations", totalOperations);
        
        // 生成操作次数
        long generateOperations = userOperationLogMapper.countByUserIdAndConditions(userId, "GENERATE", startTime, endTime);
        stats.put("generateOperations", generateOperations);
        
        // 下载操作次数
        long downloadOperations = userOperationLogMapper.countByUserIdAndConditions(userId, "DOWNLOAD", startTime, endTime);
        stats.put("downloadOperations", downloadOperations);
        
        // 分享操作次数
        long shareOperations = userOperationLogMapper.countByUserIdAndConditions(userId, "SHARE", startTime, endTime);
        stats.put("shareOperations", shareOperations);
        
        // 删除操作次数
        long deleteOperations = userOperationLogMapper.countByUserIdAndConditions(userId, "DELETE", startTime, endTime);
        stats.put("deleteOperations", deleteOperations);
        
        // 统计时间范围
        stats.put("startTime", startTime);
        stats.put("endTime", endTime);
        stats.put("days", days);
        
        return stats;
    }
}