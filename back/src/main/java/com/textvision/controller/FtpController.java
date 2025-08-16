package com.textvision.controller;

import com.textvision.util.FtpUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * FTP文件控制器
 * 用于上传、下载和管理FTP服务器上的文件
 */
@Slf4j
@RestController
@RequestMapping("/api/ftp")
@RequiredArgsConstructor
public class FtpController {

    private final FtpUtil ftpUtil;

    /**
     * 下载FTP文件
     *
     * @param fileName 文件名
     * @return 文件内容
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            byte[] fileData = ftpUtil.downloadFile(fileName);
            if (fileData == null) {
                return ResponseEntity.notFound().build();
            }

            // 根据文件扩展名设置Content-Type
            String contentType = getContentType(fileName);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(new ByteArrayResource(fileData));

        } catch (Exception e) {
            log.error("下载文件失败: {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 列出FTP目录下的文件
     *
     * @param path 路径，默认为根目录
     * @return 文件列表
     */
    @GetMapping("/files")
    public ResponseEntity<String[]> listFiles(@RequestParam(defaultValue = "/") String path) {
        try {
            String[] files = ftpUtil.listFiles(path);
            if (files == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            log.error("列出文件失败: {}", path, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 删除FTP文件
     *
     * @param fileName 文件名
     * @return 操作结果
     */
    @DeleteMapping("/files/{fileName}")
    public ResponseEntity<String> deleteFile(@PathVariable String fileName) {
        try {
            boolean success = ftpUtil.deleteFile(fileName);
            if (success) {
                return ResponseEntity.ok("文件删除成功");
            } else {
                return ResponseEntity.badRequest().body("文件删除失败");
            }
        } catch (Exception e) {
            log.error("删除文件失败: {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 检查文件是否存在
     *
     * @param fileName 文件名
     * @return 是否存在
     */
    @GetMapping("/exists/{fileName}")
    public ResponseEntity<Boolean> checkFileExists(@PathVariable String fileName) {
        try {
            String[] files = ftpUtil.listFiles("/");
            if (files != null) {
                for (String file : files) {
                    if (fileName.equals(file)) {
                        return ResponseEntity.ok(true);
                    }
                }
            }
            return ResponseEntity.ok(false);
        } catch (Exception e) {
            log.error("检查文件存在性失败: {}", fileName, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 根据文件名获取Content-Type
     *
     * @param fileName 文件名
     * @return Content-Type
     */
    private String getContentType(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "mp4":
                return "video/mp4";
            case "avi":
                return "video/x-msvideo";
            case "mov":
                return "video/quicktime";
            case "pdf":
                return "application/pdf";
            case "txt":
                return "text/plain";
            default:
                return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }
}