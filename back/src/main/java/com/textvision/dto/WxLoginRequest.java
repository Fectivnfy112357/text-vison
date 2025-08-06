package com.textvision.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 微信登录请求DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
@Schema(description = "微信登录请求")
public class WxLoginRequest {

    @NotBlank(message = "微信登录凭证不能为空")
    @Schema(description = "微信登录凭证code", required = true, example = "081Kq4Ga1MSox204JGGa1s42qb3Kq4Gn")
    private String code;

    @Schema(description = "微信用户信息")
    private WxUserInfoRequest.WxUserInfo userInfo;

    @Schema(description = "加密数据")
    private String encryptedData;

    @Schema(description = "初始向量")
    private String iv;

    @Schema(description = "签名")
    private String signature;

    @Schema(description = "原始数据")
    private String rawData;
}