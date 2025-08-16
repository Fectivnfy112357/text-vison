package com.textvision.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

/**
 * 数据分析请求DTO
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Data
@Schema(description = "数据分析请求")
public class AnalyticsRequest {

    @NotBlank(message = "行为类型不能为空")
    @Schema(description = "行为类型", example = "page_view")
    private String action;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "行为参数")
    private Map<String, Object> params;

    @Schema(description = "会话ID")
    private String sessionId;

    @Schema(description = "页面路径")
    private String pagePath;

    @Schema(description = "设备信息")
    private Map<String, Object> deviceInfo;

    @Schema(description = "时间戳")
    private Long timestamp;
}