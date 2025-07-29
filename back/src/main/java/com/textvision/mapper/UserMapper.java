package com.textvision.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textvision.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 用户Mapper接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据邮箱查询用户
     * 
     * @param email 邮箱
     * @return 用户信息
     */
    @Select("SELECT * FROM user WHERE email = #{email} AND deleted = 0")
    User findByEmail(@Param("email") String email);

    /**
     * 检查邮箱是否存在
     * 
     * @param email 邮箱
     * @return 是否存在
     */
    @Select("SELECT COUNT(1) FROM user WHERE email = #{email} AND deleted = 0")
    boolean existsByEmail(@Param("email") String email);

    /**
     * 检查用户名是否存在
     * 
     * @param name 用户名
     * @return 是否存在
     */
    @Select("SELECT COUNT(1) FROM user WHERE name = #{name} AND deleted = 0")
    boolean existsByName(@Param("name") String name);
}