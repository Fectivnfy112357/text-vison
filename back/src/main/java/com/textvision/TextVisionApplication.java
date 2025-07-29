package com.textvision;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 文生视界应用主启动类
 * 
 * @author TextVision Team
 * @since 1.0.0
 */
@SpringBootApplication
@MapperScan("com.textvision.mapper")
@EnableTransactionManagement
@EnableAsync
public class TextVisionApplication {

    public static void main(String[] args) {
        SpringApplication.run(TextVisionApplication.class, args);
        System.out.println("");
        System.out.println("  ████████╗███████╗██╗  ██╗████████╗    ██╗   ██╗██╗███████╗██╗ ██████╗ ███╗   ██╗");
        System.out.println("  ╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝    ██║   ██║██║██╔════╝██║██╔═══██╗████╗  ██║");
        System.out.println("     ██║   █████╗   ╚███╔╝    ██║       ██║   ██║██║███████╗██║██║   ██║██╔██╗ ██║");
        System.out.println("     ██║   ██╔══╝   ██╔██╗    ██║       ╚██╗ ██╔╝██║╚════██║██║██║   ██║██║╚██╗██║");
        System.out.println("     ██║   ███████╗██╔╝ ██╗   ██║        ╚████╔╝ ██║███████║██║╚██████╔╝██║ ╚████║");
        System.out.println("     ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝         ╚═══╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝");
        System.out.println("");
        System.out.println("  :: 文生视界后端服务启动成功 :: 访问地址: http://localhost:8080/swagger-ui/index.html");
        System.out.println("");
    }
}