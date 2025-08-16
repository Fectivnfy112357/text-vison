package com.textvision.util;

import lombok.extern.slf4j.Slf4j;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.UUID;

/**
 * 视频处理工具类
 * 用于从视频中提取帧作为缩略图
 */
@Slf4j
@Component
public class VideoUtil {

    /**
     * 从视频URL提取第一帧作为缩略图
     *
     * @param videoUrl 视频URL
     * @return 缩略图的字节数组
     */
    public byte[] extractFirstFrame(String videoUrl) {
        FFmpegFrameGrabber grabber = null;
        try {
            // 创建视频抓取器
            grabber = new FFmpegFrameGrabber(new URL(videoUrl));
            
            // 设置超时时间
            grabber.setOption("timeout", "30000000"); // 30秒
            
            // 开始抓取
            grabber.start();
            
            // 获取第一帧
            Frame frame = grabber.grabImage();
            if (frame == null) {
                log.error("无法获取视频第一帧: {}", videoUrl);
                return null;
            }
            
            // 转换为BufferedImage
            Java2DFrameConverter converter = new Java2DFrameConverter();
            BufferedImage bufferedImage = converter.convert(frame);
            
            if (bufferedImage == null) {
                log.error("无法转换视频帧为图像: {}", videoUrl);
                return null;
            }
            
            // 转换为字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "jpg", outputStream);
            
            log.info("成功提取视频第一帧: {}", videoUrl);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("提取视频帧异常: {}", videoUrl, e);
            return null;
        } finally {
            if (grabber != null) {
                try {
                    grabber.stop();
                    grabber.close();
                } catch (Exception e) {
                    log.error("关闭视频抓取器异常", e);
                }
            }
        }
    }
    
    /**
     * 生成缩略图文件名
     *
     * @param originalVideoUrl 原始视频URL
     * @return 缩略图文件名
     */
    public String generateThumbnailFileName(String originalVideoUrl) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return String.format("thumbnail_%s.jpg", uuid);
    }
}