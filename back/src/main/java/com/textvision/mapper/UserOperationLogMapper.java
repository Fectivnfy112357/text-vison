package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.textvision.entity.UserOperationLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户操作日志Mapper接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface UserOperationLogMapper extends BaseMapper<UserOperationLog> {

    /**
     * 分页查询用户操作日志
     * 
     * @param page 分页对象
     * @param userId 用户ID
     * @param operationType 操作类型
     * @param resourceType 资源类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作日志分页数据
     */
    IPage<UserOperationLog> selectUserOperationLogsPage(Page<UserOperationLog> page,
                                                        @Param("userId") Long userId,
                                                        @Param("operationType") String operationType,
                                                        @Param("resourceType") String resourceType,
                                                        @Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);

    /**
     * 获取用户最近操作日志
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 最近操作日志列表
     */
    @Select("SELECT * FROM user_operation_log WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT #{limit}")
    List<UserOperationLog> selectRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 统计用户操作次数
     * 
     * @param userId 用户ID
     * @param operation 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 操作次数
     */
    long countByUserIdAndConditions(@Param("userId") Long userId,
                                   @Param("operation") String operation,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    /**
     * 清理过期日志
     * 
     * @param expireTime 过期时间
     * @return 清理数量
     */
    @Select("DELETE FROM user_operation_log WHERE created_at < #{expireTime}")
    int deleteExpiredLogs(@Param("expireTime") LocalDateTime expireTime);
}