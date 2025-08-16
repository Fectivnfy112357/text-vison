package com.textvision.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotNull;

/**
 * 微信用户信息请求DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
@Schema(description = "微信用户信息请求")
public class WxUserInfoRequest {

    @NotNull(message = "用户ID不能为空")
    @Schema(description = "用户ID", required = true, example = "1")
    private Long userId;

    @Schema(description = "微信用户信息")
    private WxUserInfo userInfo;

    /**
     * 微信用户信息内部类
     */
    @Data
    @Schema(description = "微信用户信息")
    public static class WxUserInfo {

        @Schema(description = "用户昵称", example = "张三")
        private String nickName;

        @Schema(description = "用户头像URL", example = "https://thirdwx.qlogo.cn/mmopen/vi_32/xxx/132")
        private String avatarUrl;

        @Schema(description = "用户性别，0-未知，1-男，2-女", example = "1")
        private Integer gender;

        @Schema(description = "用户所在国家", example = "中国")
        private String country;

        @Schema(description = "用户所在省份", example = "广东")
        private String province;

        @Schema(description = "用户所在城市", example = "深圳")
        private String city;

        @Schema(description = "用户语言", example = "zh_CN")
        private String language;

        @Schema(description = "微信openId")
        private String openId;

        @Schema(description = "微信unionId")
        private String unionId;

        @Schema(description = "水印信息")
        private Watermark watermark;

        /**
         * 水印信息内部类
         */
        @Data
        @Schema(description = "水印信息")
        public static class Watermark {

            @Schema(description = "小程序appid")
            private String appid;

            @Schema(description = "时间戳")
            private Long timestamp;
        }
    }
}