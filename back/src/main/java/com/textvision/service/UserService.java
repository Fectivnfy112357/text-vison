package com.textvision.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.textvision.dto.*;
import com.textvision.entity.User;

/**
 * 用户服务接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
public interface UserService extends IService<User> {

    /**
     * 用户注册
     * 
     * @param request 注册请求
     * @return 登录响应（包含token）
     */
    LoginResponse register(UserRegisterRequest request);

    /**
     * 用户登录
     * 
     * @param request 登录请求
     * @return 登录响应
     */
    LoginResponse login(UserLoginRequest request);

    /**
     * 根据邮箱获取用户
     * 
     * @param email 邮箱
     * @return 用户信息
     */
    User getUserByEmail(String email);

    /**
     * 根据ID获取用户响应
     * 
     * @param userId 用户ID
     * @return 用户响应
     */
    UserResponse getUserResponse(Long userId);

    /**
     * 更新用户信息
     * 
     * @param userId 用户ID
     * @param name 用户名
     * @param avatar 头像
     * @return 用户响应
     */
    UserResponse updateUser(Long userId, String name, String avatar);

    /**
     * 修改密码
     * 
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @return 是否成功
     */
    boolean changePassword(Long userId, String oldPassword, String newPassword);

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
     * @param username 用户名
     * @return 是否存在
     */
    boolean existsByUsername(String username);
}