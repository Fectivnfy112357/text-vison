package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textvision.entity.UserOperationLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户操作日志数据访问层
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface UserOperationLogMapper extends BaseMapper<UserOperationLog> {

    /**
     * 分页查询用户操作日志
     * 
     * @param page 分页参数
     * @param userId 用户ID
     * @param operationType 操作类型
     * @param resourceType 资源类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 分页结果
     */
    IPage<UserOperationLog> selectUserOperationLogsPage(Page<UserOperationLog> page, 
                                                       @Param("userId") Long userId,
                                                       @Param("operationType") String operationType,
                                                       @Param("resourceType") String resourceType,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);

    /**
     * 查询用户最近的操作日志
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 操作日志列表
     */
    List<UserOperationLog> selectRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 统计用户操作次数（带条件）
     * 
     * @param userId 用户ID
     * @param operationType 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作次数
     */
    long countByUserIdAndConditions(@Param("userId") Long userId,
                                   @Param("operationType") String operationType,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    /**
     * 删除过期日志
     * 
     * @param beforeTime 时间点
     * @return 删除数量
     */
    int deleteExpiredLogs(@Param("beforeTime") LocalDateTime beforeTime);
}