package com.da.itdaing.global.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;

@Slf4j
@Configuration
public class DataSourceLogConfig {
    public DataSourceLogConfig(DataSource ds) {
        try (Connection c = ds.getConnection()) {
            log.info(">>> Using DB: {}", c.getMetaData().getURL()); // 예: jdbc:h2:tcp://localhost/~/itdaing
        } catch (Exception ignored) {}
    }
}
