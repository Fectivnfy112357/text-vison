package com.textvision.controller;

import com.textvision.util.FtpUtil;
import com.textvision.util.VideoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * 视频缩略图测试控制器
 * 用于测试视频帧提取功能
 */
@Slf4j
@RestController
@RequestMapping("/api/test/video")
@RequiredArgsConstructor
public class VideoThumbnailTestController {

    private final VideoUtil videoUtil;
    private final FtpUtil ftpUtil;

    /**
     * 测试提取视频缩略图
     */
    @PostMapping("/extract-thumbnail")
    public ResponseEntity<Map<String, Object>> extractThumbnail(@RequestParam String videoUrl) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            log.info("开始测试视频缩略图提取: {}", videoUrl);
            
            // 提取视频帧
            byte[] thumbnailData = videoUtil.extractFirstFrame(videoUrl);
            String s = ftpUtil.uploadFile("test1.png", thumbnailData);
            System.out.println("9999999999999999999999:"+s);
            if (thumbnailData != null) {
                // 转换为Base64
                String base64Image = Base64.getEncoder().encodeToString(thumbnailData);
                
                result.put("success", true);
                result.put("message", "视频缩略图提取成功");
                result.put("videoUrl", videoUrl);
                result.put("thumbnailSize", thumbnailData.length);
                result.put("thumbnailData", "data:image/jpeg;base64," + base64Image);
                
                log.info("视频缩略图提取成功，大小: {} bytes", thumbnailData.length);
            } else {
                result.put("success", false);
                result.put("message", "无法提取视频缩略图");
            }
            
        } catch (Exception e) {
            log.error("提取视频缩略图异常: {}", videoUrl, e);
            result.put("success", false);
            result.put("message", "处理失败: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }


}