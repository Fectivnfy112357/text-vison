package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textvision.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户数据访问层
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据邮箱查找用户
     * 
     * @param email 邮箱
     * @return 用户信息
     */
    User findByEmail(String email);

    /**
     * 检查邮箱是否存在
     * 
     * @param email 邮箱
     * @return 是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 检查用户名是否存在
     * 
     * @param name 用户名
     * @return 是否存在
     */
    boolean existsByName(String name);

    /**
     * 根据微信openId查找用户
     * 
     * @param openId 微信openId
     * @return 用户信息
     */
    User findByWxOpenId(String openId);
}