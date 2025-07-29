package com.textvision.util;

import com.alibaba.fastjson2.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * HTTP工具类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class HttpUtil {

    private static final int TIMEOUT = 30000; // 30秒超时

    /**
     * 发送GET请求
     * 
     * @param url 请求URL
     * @param headers 请求头
     * @return 响应内容
     */
    public static String doGet(String url, Map<String, String> headers) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet(url);
            
            // 设置请求头
            if (headers != null && !headers.isEmpty()) {
                headers.forEach(httpGet::setHeader);
            }
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity, StandardCharsets.UTF_8);
                    log.debug("GET请求响应: URL={}, Status={}, Response={}", url, response.getCode(), result);
                    return result;
                }
            }
        } catch (IOException | ParseException e) {
            log.error("GET请求失败: URL={}, Error={}", url, e.getMessage(), e);
            throw new RuntimeException("HTTP GET请求失败: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * 发送POST请求（JSON格式）
     * 
     * @param url 请求URL
     * @param headers 请求头
     * @param jsonBody JSON请求体
     * @return 响应内容
     */
    public static String doPostJson(String url, Map<String, String> headers, String jsonBody) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(url);
            
            // 设置请求头
            httpPost.setHeader("Content-Type", "application/json");
            if (headers != null && !headers.isEmpty()) {
                headers.forEach(httpPost::setHeader);
            }
            
            // 设置请求体
            if (jsonBody != null && !jsonBody.trim().isEmpty()) {
                StringEntity entity = new StringEntity(jsonBody, ContentType.APPLICATION_JSON, StandardCharsets.UTF_8.name(), false);
                httpPost.setEntity(entity);
            }
            
            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity, StandardCharsets.UTF_8);
                    log.debug("POST请求响应: URL={}, Status={}, Response={}", url, response.getCode(), result);
                    return result;
                }
            }
        } catch (IOException | ParseException e) {
            log.error("POST请求失败: URL={}, Body={}, Error={}", url, jsonBody, e.getMessage(), e);
            throw new RuntimeException("HTTP POST请求失败: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * 发送POST请求（对象转JSON）
     * 
     * @param url 请求URL
     * @param headers 请求头
     * @param requestBody 请求体对象
     * @return 响应内容
     */
    public static String doPostJson(String url, Map<String, String> headers, Object requestBody) {
        String jsonBody = requestBody != null ? JSON.toJSONString(requestBody) : null;
        return doPostJson(url, headers, jsonBody);
    }

    /**
     * 发送POST请求并解析JSON响应
     * 
     * @param url 请求URL
     * @param headers 请求头
     * @param requestBody 请求体对象
     * @param responseClass 响应类型
     * @return 响应对象
     */
    public static <T> T doPostJsonForObject(String url, Map<String, String> headers, Object requestBody, Class<T> responseClass) {
        String responseJson = doPostJson(url, headers, requestBody);
        if (responseJson != null && !responseJson.trim().isEmpty()) {
            try {
                return JSON.parseObject(responseJson, responseClass);
            } catch (Exception e) {
                log.error("JSON解析失败: Response={}, Error={}", responseJson, e.getMessage(), e);
                throw new RuntimeException("响应JSON解析失败: " + e.getMessage(), e);
            }
        }
        return null;
    }

    /**
     * 发送GET请求并解析JSON响应
     * 
     * @param url 请求URL
     * @param headers 请求头
     * @param responseClass 响应类型
     * @return 响应对象
     */
    public static <T> T doGetForObject(String url, Map<String, String> headers, Class<T> responseClass) {
        String responseJson = doGet(url, headers);
        if (responseJson != null && !responseJson.trim().isEmpty()) {
            try {
                return JSON.parseObject(responseJson, responseClass);
            } catch (Exception e) {
                log.error("JSON解析失败: Response={}, Error={}", responseJson, e.getMessage(), e);
                throw new RuntimeException("响应JSON解析失败: " + e.getMessage(), e);
            }
        }
        return null;
    }

    /**
     * 构建请求头
     * 
     * @param apiKey API密钥
     * @return 请求头Map
     */
    public static Map<String, String> buildHeaders(String apiKey) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + apiKey);
        headers.put("Content-Type", "application/json");
        headers.put("Accept", "application/json");
        headers.put("User-Agent", "TextVision/1.0");
        return headers;
    }

    /**
     * 构建请求头（自定义Authorization格式）
     * 
     * @param authorizationValue Authorization头的值
     * @return 请求头Map
     */
    public static Map<String, String> buildHeadersWithAuth(String authorizationValue) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", authorizationValue);
        headers.put("Content-Type", "application/json");
        headers.put("Accept", "application/json");
        headers.put("User-Agent", "TextVision/1.0");
        return headers;
    }
}