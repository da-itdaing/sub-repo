// src/main/java/com/da/itdaing/global/storage/StorageProps.java
package com.da.itdaing.global.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter @Setter
@ConfigurationProperties(prefix = "storage")
public class StorageProps {

    /** provider: local | s3 */
    private String provider = "local";

    private final Local local = new Local();
    private final S3 s3 = new S3();
    private final Defaults defaults = new Defaults();

    @Getter @Setter
    public static class Local {
        /** 파일 시스템 루트. 예: ./var */
        private String root = "./var";
        /** 정적 경로 베이스. 예: uploads */
        private String baseDir = "uploads";
        /** 정적 공개 URL 베이스. 예: http://localhost:8080 */
        private String publicBaseUrl = "http://localhost:8080";
    }

    @Getter @Setter
    public static class S3 {
        private String bucket;
        private String region;          // ap-northeast-2
        private String baseDir = "uploads";
        /** CDN(CloudFront) 도메인 등. 없으면 s3 URL로 구성 */
        private String publicBaseUrl;
    }

    @Getter @Setter
    public static class Defaults {
        /**
         * 데이터셋 초기화나 더미 데이터를 위한 기본 이미지 목록
         */
        private java.util.List<DefaultImage> images = java.util.List.of();
    }

    @Getter @Setter
    public static class DefaultImage {
        private String key;
        private String url;
    }
}
