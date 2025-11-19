package com.da.itdaing.global.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import org.springframework.util.StringUtils;

/**
 * Loads key/value pairs from a dotenv-style file (default: {@code prod.env}) and
 * exposes them as a {@link SystemEnvironmentPropertySource} so that existing
 * {@code ${ENV_VAR}} placeholders continue to work without manually sourcing
 * the file in every shell.
 */
public class EnvFileEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(EnvFileEnvironmentPostProcessor.class);

    private static final String DEFAULT_ENV_FILE = "prod.env";
    private static final String PROPERTY_SOURCE_NAME = "itdaingEnvFile";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envFile = resolveEnvFilePath();
        if (envFile == null || !Files.exists(envFile)) {
            log.debug("Env file not found: {}", envFile);
            return;
        }

        Map<String, Object> values = loadEnvFile(envFile);
        if (values.isEmpty()) {
            return;
        }

        PropertySource<?> propertySource = new SystemEnvironmentPropertySource(PROPERTY_SOURCE_NAME, values);
        MutablePropertySources propertySources = environment.getPropertySources();
        if (propertySources.contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
            propertySources.addAfter(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME, propertySource);
        } else {
            propertySources.addFirst(propertySource);
        }
        log.info("Loaded {} entries from {}", values.size(), envFile);
    }

    private Path resolveEnvFilePath() {
        String configured = Optional.ofNullable(System.getProperty("ENV_FILE"))
            .orElseGet(() -> Optional.ofNullable(System.getenv("ENV_FILE")).orElse(null));
        if (!StringUtils.hasText(configured)) {
            configured = DEFAULT_ENV_FILE;
        }

        String expanded = configured.startsWith("~")
            ? System.getProperty("user.home") + configured.substring(1)
            : configured;
        Path path = Paths.get(expanded);
        if (!path.isAbsolute()) {
            return Paths.get(System.getProperty("user.dir")).resolve(path).normalize();
        }
        return path.normalize();
    }

    private Map<String, Object> loadEnvFile(Path envFile) {
        Map<String, Object> values = new LinkedHashMap<>();
        try (Stream<String> lines = Files.lines(envFile, StandardCharsets.UTF_8)) {
            lines.forEach(rawLine -> {
                String line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    return;
                }
                if (line.startsWith("export ")) {
                    line = line.substring("export ".length()).trim();
                }
                int delimiter = line.indexOf('=');
                if (delimiter < 0) {
                    return;
                }
                String key = line.substring(0, delimiter).trim();
                String value = line.substring(delimiter + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                if (StringUtils.hasText(key)) {
                    values.put(key, value);
                }
            });
        } catch (IOException e) {
            log.warn("Failed to load env file {}: {}", envFile, e.getMessage());
            return Map.of();
        }
        return values;
    }

    @Override
    public int getOrder() {
        // Run early but after system environment so actual env vars can override file
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}

