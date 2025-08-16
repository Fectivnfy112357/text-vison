package com.textvision.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
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
     * @param videoUrl 视频URL（支持本地文件路径和HTTP URL）
     * @return 缩略图的字节数组
     */
    public byte[] extractFirstFrame(String videoUrl) {
        try {
            log.info("开始处理视频URL: {}", videoUrl);
            
            // 尝试使用JavaCV提取视频帧
            byte[] frame = extractFrameWithJavaCV(videoUrl);
            if (frame != null) {
                log.info("使用JavaCV成功提取视频帧: {}", videoUrl);
                return frame;
            }
            
            // JavaCV失败，创建默认缩略图
            log.warn("JavaCV提取失败，使用默认缩略图: {}", videoUrl);
            BufferedImage thumbnail = createDefaultThumbnail(videoUrl);
            
            // 转换为字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(thumbnail, "jpg", outputStream);
            
            log.info("生成默认缩略图成功: {}", videoUrl);
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            log.error("生成视频缩略图异常: {}", videoUrl, e);
            return null;
        }
    }

    /**
     * 使用JavaCV提取视频第一帧
     *
     * @param videoUrl 视频URL
     * @return 缩略图的字节数组
     */
    private byte[] extractFrameWithJavaCV(String videoUrl) {
        try {
            // 检查JavaCV是否可用
            Class<?> grabberClass = Class.forName("org.bytedeco.javacv.FFmpegFrameGrabber");
            Class<?> converterClass = Class.forName("org.bytedeco.javacv.Java2DFrameConverter");
            
            log.info("尝试使用JavaCV提取视频帧: {}", videoUrl);
            
            // 创建视频抓取器
            Object grabber = grabberClass.getConstructor(String.class).newInstance(videoUrl);
            grabberClass.getMethod("start").invoke(grabber);
            
            // 获取第一帧
            Object frame = grabberClass.getMethod("grabImage").invoke(grabber);
            
            if (frame == null) {
                log.warn("无法获取视频帧");
                return null;
            }
            
            // 创建转换器并转换为BufferedImage
            Object converter = converterClass.getConstructor().newInstance();
            BufferedImage image = (BufferedImage) converterClass.getMethod("convert", frame.getClass()).invoke(converter, frame);
            
            if (image == null) {
                log.warn("转换帧为BufferedImage失败");
                return null;
            }
            
            // 调整图像大小
            int targetWidth = image.getWidth() / 2;
            int targetHeight = image.getHeight() / 2;
            BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = resizedImage.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.drawImage(image, 0, 0, targetWidth, targetHeight, null);
            g2d.dispose();
            
            // 转换为字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(resizedImage, "jpg", outputStream);
            
            // 释放资源
            grabberClass.getMethod("stop").invoke(grabber);
            grabberClass.getMethod("release").invoke(grabber);
            
            log.info("JavaCV提取成功，图片大小: {} bytes", outputStream.size());
            return outputStream.toByteArray();
            
        } catch (ClassNotFoundException e) {
            log.debug("JavaCV不可用: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("使用JavaCV提取视频帧异常: {}", videoUrl, e);
            return null;
        }
    }
    
    /**
     * 创建默认缩略图
     */
    private BufferedImage createDefaultThumbnail(String videoUrl) {
        // 创建320x180的缩略图
        int width = 320;
        int height = 180;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        
        // 获取绘图上下文
        Graphics2D g2d = image.createGraphics();
        
        // 设置抗锯齿
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        
        // 填充背景
        g2d.setColor(new Color(41, 128, 185)); // 蓝色背景
        g2d.fillRect(0, 0, width, height);
        
        // 设置文字颜色和字体
        g2d.setColor(Color.WHITE);
        g2d.setFont(new Font("Arial", Font.BOLD, 16));
        
        // 绘制文字
        String text = "Video Thumbnail";
        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(text);
        int textHeight = fm.getHeight();
        
        g2d.drawString(text, (width - textWidth) / 2, (height - textHeight) / 2 + fm.getAscent());
        
        // 绘制视频URL（简化版）
        g2d.setFont(new Font("Arial", Font.PLAIN, 10));
        String urlText = videoUrl.length() > 40 ? videoUrl.substring(0, 37) + "..." : videoUrl;
        g2d.drawString(urlText, 5, height - 10);
        
        // 绘制播放图标
        drawPlayIcon(g2d, width / 2 - 15, height / 2 - 15, 30);
        
        g2d.dispose();
        
        return image;
    }
    
    /**
     * 绘制播放图标
     */
    private void drawPlayIcon(Graphics2D g2d, int x, int y, int size) {
        // 绘制圆形背景
        g2d.setColor(new Color(255, 255, 255, 180));
        g2d.fillOval(x, y, size, size);
        
        // 绘制三角形播放按钮
        g2d.setColor(new Color(41, 128, 185));
        int[] xPoints = {x + size/3, x + size*2/3, x + size/3};
        int[] yPoints = {y + size/3, y + size/2, y + size*2/3};
        g2d.fillPolygon(xPoints, yPoints, 3);
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
    
    /**
     * 检查是否为视频URL
     */
    public boolean isVideoUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        
        String lowerUrl = url.toLowerCase();
        return lowerUrl.contains(".mp4") || 
               lowerUrl.contains(".avi") || 
               lowerUrl.contains(".mov") || 
               lowerUrl.contains(".wmv") || 
               lowerUrl.contains(".flv") || 
               lowerUrl.contains(".mkv") ||
               lowerUrl.contains(".webm");
    }
    
    /**
     * 提取视频第一帧并保存到文件
     * 
     * @param videoPath 视频文件路径
     * @param outputImagePath 输出图片路径
     * @return 是否成功提取
     */
    public boolean extractFirstFrameToFile(String videoPath, String outputImagePath) {
        try {
            byte[] frameData = extractFirstFrame(videoPath);
            if (frameData != null) {
                // 将字节数组保存到文件
                File outputFile = new File(outputImagePath);
                java.io.FileOutputStream fos = new java.io.FileOutputStream(outputFile);
                fos.write(frameData);
                fos.close();
                
                log.info("成功提取第一帧到: {}", outputImagePath);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("提取视频帧到文件异常: {}", e.getMessage(), e);
            return false;
        }
    }
}