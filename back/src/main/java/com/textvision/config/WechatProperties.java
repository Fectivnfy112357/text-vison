package com.textvision.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 微信配置属性类
 * 用于读取application.yml中的微信相关配置
 */
@Component
@ConfigurationProperties(prefix = "app.wechat")
public class WechatProperties {
    
    private Miniprogram miniprogram = new Miniprogram();
    
    public Miniprogram getMiniprogram() {
        return miniprogram;
    }
    
    public void setMiniprogram(Miniprogram miniprogram) {
        this.miniprogram = miniprogram;
    }
    
    /**
     * 微信小程序配置
     */
    public static class Miniprogram {
        private String appId;
        private String appSecret;
        private Long sessionTimeout = 7200000L; // 默认2小时
        
        public String getAppId() {
            return appId;
        }
        
        public void setAppId(String appId) {
            this.appId = appId;
        }
        
        public String getAppSecret() {
            return appSecret;
        }
        
        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }
        
        public Long getSessionTimeout() {
            return sessionTimeout;
        }
        
        public void setSessionTimeout(Long sessionTimeout) {
            this.sessionTimeout = sessionTimeout;
        }
    }
}