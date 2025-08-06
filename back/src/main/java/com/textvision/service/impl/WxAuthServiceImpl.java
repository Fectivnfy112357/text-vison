package com.textvision.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.textvision.config.WechatProperties;
import com.textvision.dto.LoginResponse;
import com.textvision.dto.WxUserInfoRequest;
import com.textvision.dto.UserResponse;
import com.textvision.entity.User;
import com.textvision.mapper.UserMapper;
import com.textvision.service.WxAuthService;
import com.textvision.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 微信认证服务实现类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WxAuthServiceImpl implements WxAuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final WechatProperties wechatProperties;

    private static final String WX_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session";

    @Override
    @Transactional
    public LoginResponse processWxLogin(String code, WxUserInfoRequest.WxUserInfo userInfo) {
        log.info("开始处理微信登录: code={}", code);
        
        // 1. 通过code获取微信会话信息
        WxSessionInfo sessionInfo = getWxSessionInfo(code);
        if (sessionInfo.getErrCode() != null && sessionInfo.getErrCode() != 0) {
            throw new RuntimeException("微信登录失败: " + sessionInfo.getErrMsg());
        }
        
        String openId = sessionInfo.getOpenId();
        String unionId = sessionInfo.getUnionId();
        
        if (!StringUtils.hasText(openId)) {
            throw new RuntimeException("获取微信openId失败");
        }
        
        log.info("获取微信会话信息成功: openId={}, unionId={}", openId, unionId);
        
        // 2. 查找或创建用户
        User user = createOrUpdateWxUser(openId, unionId, userInfo);
        
        // 3. 生成JWT令牌
        String token = jwtUtil.generateToken(user.getId().toString());
        
        // 4. 构建响应
        UserResponse userResponse = convertToUserResponse(user);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(token);
        loginResponse.setUser(userResponse);
        
        log.info("微信登录处理完成: userId={}, openId={}", user.getId(), openId);
        
        return loginResponse;
    }

    @Override
    @Transactional
    public UserResponse updateWxUserInfo(WxUserInfoRequest request) {
        log.info("更新微信用户信息: userId={}", request.getUserId());
        
        User user = userMapper.selectById(request.getUserId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 更新用户信息
        if (request.getUserInfo() != null) {
            WxUserInfoRequest.WxUserInfo userInfo = request.getUserInfo();
            if (StringUtils.hasText(userInfo.getNickName())) {
                user.setNickname(userInfo.getNickName());
            }
            if (StringUtils.hasText(userInfo.getAvatarUrl())) {
                user.setAvatar(userInfo.getAvatarUrl());
            }
            if (userInfo.getGender() != null) {
                user.setGender(userInfo.getGender());
            }
            if (StringUtils.hasText(userInfo.getCountry())) {
                user.setCountry(userInfo.getCountry());
            }
            if (StringUtils.hasText(userInfo.getProvince())) {
                user.setProvince(userInfo.getProvince());
            }
            if (StringUtils.hasText(userInfo.getCity())) {
                user.setCity(userInfo.getCity());
            }
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
        
        log.info("微信用户信息更新成功: userId={}", user.getId());
        
        return convertToUserResponse(user);
    }

    @Override
    public boolean checkWxLoginStatus(String openId) {
        if (!StringUtils.hasText(openId)) {
            return false;
        }
        
        User user = getUserByOpenId(openId);
        return user != null && user.getStatus() == 1;
    }

    @Override
    public User getUserByOpenId(String openId) {
        if (!StringUtils.hasText(openId)) {
            return null;
        }
        
        return userMapper.findByWxOpenId(openId);
    }

    @Override
    @Transactional
    public User createOrUpdateWxUser(String openId, String unionId, WxUserInfoRequest.WxUserInfo userInfo) {
        // 先尝试通过openId查找用户
        User existingUser = getUserByOpenId(openId);
        
        if (existingUser != null) {
            // 用户已存在，更新信息
            log.info("用户已存在，更新信息: userId={}, openId={}", existingUser.getId(), openId);
            
            if (userInfo != null) {
                updateUserFromWxInfo(existingUser, userInfo);
            }
            
            if (StringUtils.hasText(unionId)) {
                existingUser.setWxUnionId(unionId);
            }
            
            existingUser.setUpdatedAt(LocalDateTime.now());
            userMapper.updateById(existingUser);
            
            return existingUser;
        } else {
            // 创建新用户
            log.info("创建新用户: openId={}, unionId={}", openId, unionId);
            
            User newUser = new User();
            newUser.setWxOpenId(openId);
            newUser.setWxUnionId(unionId);
            
            if (userInfo != null) {
                updateUserFromWxInfo(newUser, userInfo);
            } else {
                // 设置默认值
                newUser.setNickname("微信用户");
                newUser.setAvatar("");
            }
            
            newUser.setStatus(1);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            
            userMapper.insert(newUser);
            
            log.info("新用户创建成功: userId={}, openId={}", newUser.getId(), openId);
            
            return newUser;
        }
    }

    @Override
    public WxSessionInfo getWxSessionInfo(String code) {
        log.info("获取微信会话信息: code={}", code);
        
        try {
            String url = String.format("%s?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                    WX_LOGIN_URL, wechatProperties.getMiniprogram().getAppId(), wechatProperties.getMiniprogram().getAppSecret(), code);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String responseBody = response.getBody();
            
            log.debug("微信API响应: {}", responseBody);
            
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            WxSessionInfo sessionInfo = new WxSessionInfo();
            
            if (jsonNode.has("errcode")) {
                sessionInfo.setErrCode(jsonNode.get("errcode").asInt());
                sessionInfo.setErrMsg(jsonNode.get("errmsg").asText());
            } else {
                sessionInfo.setOpenId(jsonNode.get("openid").asText());
                sessionInfo.setSessionKey(jsonNode.get("session_key").asText());
                
                if (jsonNode.has("unionid")) {
                    sessionInfo.setUnionId(jsonNode.get("unionid").asText());
                }
                
                sessionInfo.setErrCode(0);
            }
            
            return sessionInfo;
        } catch (Exception e) {
            log.error("获取微信会话信息失败: code={}, error={}", code, e.getMessage(), e);
            
            WxSessionInfo errorInfo = new WxSessionInfo();
            errorInfo.setErrCode(-1);
            errorInfo.setErrMsg("网络请求失败: " + e.getMessage());
            
            return errorInfo;
        }
    }

    /**
     * 从微信用户信息更新用户实体
     */
    private void updateUserFromWxInfo(User user, WxUserInfoRequest.WxUserInfo userInfo) {
        if (StringUtils.hasText(userInfo.getNickName())) {
            user.setNickname(userInfo.getNickName());
        }
        if (StringUtils.hasText(userInfo.getAvatarUrl())) {
            user.setAvatar(userInfo.getAvatarUrl());
        }
        if (userInfo.getGender() != null) {
            user.setGender(userInfo.getGender());
        }
        if (StringUtils.hasText(userInfo.getCountry())) {
            user.setCountry(userInfo.getCountry());
        }
        if (StringUtils.hasText(userInfo.getProvince())) {
            user.setProvince(userInfo.getProvince());
        }
        if (StringUtils.hasText(userInfo.getCity())) {
            user.setCity(userInfo.getCity());
        }
    }

    /**
     * 转换用户实体为响应DTO
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAvatar(user.getAvatar());
        response.setGender(user.getGender());
        response.setCountry(user.getCountry());
        response.setProvince(user.getProvince());
        response.setCity(user.getCity());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        return response;
    }
}