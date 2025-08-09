package com.textvision.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.textvision.common.ResultCode;
import com.textvision.dto.*;
import com.textvision.entity.User;
import com.textvision.exception.BusinessException;
import com.textvision.mapper.UserMapper;
import com.textvision.service.UserService;
import com.textvision.util.JwtUtil;
import com.textvision.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 用户服务实现类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginResponse register(UserRegisterRequest request) {
        // 验证密码确认
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "两次输入的密码不一致");
        }

        // 验证密码强度
        if (!PasswordUtil.isValidPassword(request.getPassword())) {
            throw new BusinessException(ResultCode.WEAK_PASSWORD);
        }

        // 检查邮箱是否已存在
        if (existsByEmail(request.getEmail())) {
            throw new BusinessException(ResultCode.EMAIL_ALREADY_EXISTS);
        }

        // 检查用户名是否已存在
        if (existsByUsername(request.getUsername())) {
            throw new BusinessException(ResultCode.USER_ALREADY_EXISTS, "用户名已存在");
        }

        // 创建用户
        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(PasswordUtil.encode(request.getPassword()));
        user.setStatus(1);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // 保存用户
        if (!save(user)) {
            throw new BusinessException("用户注册失败");
        }

        log.info("用户注册成功: email={}, username={}", request.getEmail(), request.getUsername());

        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        Long expiresIn = jwtUtil.getExpirationSeconds();

        // 返回登录响应
        UserResponse userResponse = convertToUserResponse(user);
        return new LoginResponse(token, expiresIn, userResponse);
    }

    @Override
    public LoginResponse login(UserLoginRequest request) {
        // 根据邮箱查找用户
        User user = userMapper.findByEmail(request.getEmail());
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        // 验证密码
        if (!PasswordUtil.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        Long expiresIn = jwtUtil.getExpirationSeconds();

        log.info("用户登录成功: email={}, userId={}", request.getEmail(), user.getId());

        // 返回登录响应
        UserResponse userResponse = convertToUserResponse(user);
        return new LoginResponse(token, expiresIn, userResponse);
    }

    @Override
    public User getUserByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public UserResponse getUserResponse(Long userId) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return convertToUserResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateUser(Long userId, String name, String avatar) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 检查用户名是否已被其他用户使用
        if (name != null && !name.equals(user.getUsername()) && existsByUsername(name)) {
            throw new BusinessException(ResultCode.USER_ALREADY_EXISTS, "用户名已存在");
        }

        // 更新用户信息
        boolean updated = false;
        if (name != null && !name.equals(user.getUsername())) {
            user.setUsername(name);
            updated = true;
        }
        if (avatar != null && !avatar.equals(user.getAvatar())) {
            user.setAvatar(avatar);
            updated = true;
        }

        if (updated) {
            user.setUpdatedAt(LocalDateTime.now());
            if (!updateById(user)) {
                throw new BusinessException("用户信息更新失败");
            }
            log.info("用户信息更新成功: userId={}, name={}", userId, name);
        }

        return convertToUserResponse(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 验证旧密码
        if (!PasswordUtil.matches(oldPassword, user.getPassword())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR, "原密码错误");
        }

        // 验证新密码强度
        if (!PasswordUtil.isValidPassword(newPassword)) {
            throw new BusinessException(ResultCode.WEAK_PASSWORD);
        }

        // 更新密码
        user.setPassword(PasswordUtil.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());

        boolean success = updateById(user);
        if (success) {
            log.info("用户密码修改成功: userId={}", userId);
        }
        return success;
    }

    @Override
    public boolean existsByEmail(String email) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEmail, email)
               .eq(User::getDeleted, 0);
        return count(wrapper) > 0;
    }

    @Override
    public boolean existsByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username)
               .eq(User::getDeleted, 0);
        return count(wrapper) > 0;
    }

    /**
     * 转换为用户响应DTO
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(user, response);
        return response;
    }
}