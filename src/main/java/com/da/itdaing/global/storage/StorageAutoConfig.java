// src/main/java/com/da/itdaing/global/storage/StorageAutoConfig.java
package com.da.itdaing.global.storage;

import com.da.itdaing.domain.file.storage.ImageStorage;
import com.da.itdaing.domain.file.storage.LocalImageStorage;
import com.da.itdaing.domain.file.storage.S3ImageStorage;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties(StorageProps.class)
public class StorageAutoConfig {

    @Bean
    @ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
    public ImageStorage localImageStorage(StorageProps props) {
        return new LocalImageStorage(props.getLocal());
    }

    @Bean
    @ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
    public S3Client s3Client(StorageProps props) {
        var builder = S3Client.builder()
            .region(Region.of(props.getS3().getRegion()));
        
        // LocalStack 사용 시 endpoint override
        String endpointUrl = System.getenv("AWS_ENDPOINT_URL");
        if (endpointUrl != null && !endpointUrl.isEmpty()) {
            builder.endpointOverride(java.net.URI.create(endpointUrl));
            // LocalStack은 path-style access 사용
            builder.forcePathStyle(true);
        }
        
        return builder.build();
    }

    @Bean
    @ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
    public ImageStorage s3ImageStorage(S3Client s3, StorageProps props) {
        return new S3ImageStorage(s3, props.getS3());
    }
}
