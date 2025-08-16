package com.textvision.util;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.FileOutputStream;
import java.util.Base64;

/**
 * VideoUtil测试类
 */
@Slf4j
@SpringBootTest
public class VideoUtilTest {

    @Autowired
    private VideoUtil videoUtil;

    @Test
    public void testExtractFirstFrame() {
        // 测试在线视频
        String videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
        
        log.info("测试视频URL: {}", videoUrl);
        
        // 检查是否为视频URL
        boolean isVideo = videoUtil.isVideoUrl(videoUrl);
        log.info("是否为视频URL: {}", isVideo);
        
        // 提取第一帧
        byte[] frameData = videoUtil.extractFirstFrame(videoUrl);
        
        if (frameData != null) {
            log.info("成功提取视频帧，大小: {} bytes", frameData.length);
            
            // 保存到本地文件测试
            String outputPath = "test_thumbnail.jpg";
            try (FileOutputStream fos = new FileOutputStream(outputPath)) {
                fos.write(frameData);
                log.info("已保存到: {}", outputPath);
            } catch (Exception e) {
                log.error("保存文件失败", e);
            }
            
            // 生成文件名测试
            String fileName = videoUtil.generateThumbnailFileName(videoUrl);
            log.info("生成的文件名: {}", fileName);
            
        } else {
            log.warn("提取视频帧失败");
        }
    }

    @Test
    public void testExtractFirstFrameToFile() {
        String videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
        String outputPath = "test_frame_to_file.jpg";
        
        boolean success = videoUtil.extractFirstFrameToFile(videoUrl, outputPath);
        
        if (success) {
            log.info("成功提取并保存到文件: {}", outputPath);
        } else {
            log.warn("提取并保存失败");
        }
    }
}