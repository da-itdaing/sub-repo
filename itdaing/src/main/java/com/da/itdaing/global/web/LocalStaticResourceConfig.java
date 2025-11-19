// src/main/java/com/da/itdaing/global/web/LocalStaticResourceConfig.java
package com.da.itdaing.global.web;

import com.da.itdaing.global.storage.StorageProps;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
@ConditionalOnBean(StorageProps.class)
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStaticResourceConfig implements WebMvcConfigurer {
    private final StorageProps props;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String baseDir = props.getLocal().getBaseDir();   // e.g. uploads
        String root = props.getLocal().getRoot();         // e.g. ./var
        String location = Paths.get(root).toUri().toString(); // file:/.../ 형태

        registry.addResourceHandler("/" + baseDir + "/**")
            .addResourceLocations(location);
    }
}
