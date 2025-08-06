package com.textvision.service;

import com.textvision.dto.LoginResponse;
import com.textvision.dto.WxUserInfoRequest;
import com.textvision.dto.UserResponse;
import com.textvision.entity.User;

/**
 * 微信认证服务接口
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
public interface WxAuthService {

    /**
     * 处理微信小程序登录
     * 
     * @param code 微信登录凭证
     * @param userInfo 微信用户信息
     * @return 登录响应
     */
    LoginResponse processWxLogin(String code, WxUserInfoRequest.WxUserInfo userInfo);

    /**
     * 更新微信用户信息
     * 
     * @param request 微信用户信息请求
     * @return 用户响应
     */
    UserResponse updateWxUserInfo(WxUserInfoRequest request);

    /**
     * 检查微信登录状态
     * 
     * @param openId 微信openId
     * @return 是否有效
     */
    boolean checkWxLoginStatus(String openId);

    /**
     * 通过openId获取用户
     * 
     * @param openId 微信openId
     * @return 用户实体
     */
    User getUserByOpenId(String openId);

    /**
     * 创建或更新微信用户
     * 
     * @param openId 微信openId
     * @param unionId 微信unionId
     * @param userInfo 微信用户信息
     * @return 用户实体
     */
    User createOrUpdateWxUser(String openId, String unionId, WxUserInfoRequest.WxUserInfo userInfo);

    /**
     * 获取微信访问令牌
     * 
     * @param code 微信登录凭证
     * @return 微信会话信息
     */
    WxSessionInfo getWxSessionInfo(String code);

    /**
     * 微信会话信息
     */
    class WxSessionInfo {
        private String openId;
        private String unionId;
        private String sessionKey;
        private Integer errCode;
        private String errMsg;

        // 构造函数
        public WxSessionInfo() {}

        public WxSessionInfo(String openId, String unionId, String sessionKey) {
            this.openId = openId;
            this.unionId = unionId;
            this.sessionKey = sessionKey;
        }

        // Getters and Setters
        public String getOpenId() {
            return openId;
        }

        public void setOpenId(String openId) {
            this.openId = openId;
        }

        public String getUnionId() {
            return unionId;
        }

        public void setUnionId(String unionId) {
            this.unionId = unionId;
        }

        public String getSessionKey() {
            return sessionKey;
        }

        public void setSessionKey(String sessionKey) {
            this.sessionKey = sessionKey;
        }

        public Integer getErrCode() {
            return errCode;
        }

        public void setErrCode(Integer errCode) {
            this.errCode = errCode;
        }

        public String getErrMsg() {
            return errMsg;
        }

        public void setErrMsg(String errMsg) {
            this.errMsg = errMsg;
        }
    }
}