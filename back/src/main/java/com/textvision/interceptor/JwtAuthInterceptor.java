package com.textvision.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.textvision.common.Result;
import com.textvision.common.ResultCode;
import com.textvision.util.JwtUtil;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT认证拦截器
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 跳过OPTIONS预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("跳过OPTIONS预检请求: {}", request.getRequestURI());
            return true;
        }
        
        // 获取Authorization头
        String authHeader = request.getHeader("Authorization");
        
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            log.warn("请求缺少有效的Authorization头: {}", request.getRequestURI());
            writeErrorResponse(response, ResultCode.UNAUTHORIZED);
            return false;
        }
        
        // 提取token
        String token = authHeader.substring(7);
        
        try {
            // 验证token
            if (jwtUtil.isTokenExpired(token)) {
                log.warn("Token已过期: {}", request.getRequestURI());
                writeErrorResponse(response, ResultCode.TOKEN_EXPIRED);
                return false;
            }
            
            // 提取用户信息
            Long userId = jwtUtil.getUserIdFromToken(token);
            String email = jwtUtil.getEmailFromToken(token);
            
            if (userId == null) {
                log.warn("Token中缺少用户ID: {}", request.getRequestURI());
                writeErrorResponse(response, ResultCode.TOKEN_INVALID);
                return false;
            }
            
            // 将用户信息设置到请求属性中
            request.setAttribute("userId", userId);
            request.setAttribute("userEmail", email); // email可能为null，这是允许的
            
            log.debug("JWT认证成功: userId={}, email={}, uri={}", userId, email, request.getRequestURI());
            return true;
            
        } catch (Exception e) {
            log.error("JWT认证失败: uri={}", request.getRequestURI(), e);
            writeErrorResponse(response, ResultCode.TOKEN_INVALID);
            return false;
        }
    }

    /**
     * 写入错误响应
     */
    private void writeErrorResponse(HttpServletResponse response, ResultCode resultCode) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        Result<Void> result = Result.result(resultCode);
        String jsonResponse = objectMapper.writeValueAsString(result);
        
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}