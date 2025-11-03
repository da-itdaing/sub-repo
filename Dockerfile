# syntax=docker/dockerfile:1

# ----- Builder stage: build Spring Boot jar with Gradle (wrapper or global) -----
FROM gradle:8.10.2-jdk21 AS builder

WORKDIR /workspace

# Copy project (frontend/node_modules/etc. are excluded by .dockerignore)
COPY . .

# Ensure wrapper is executable if present
RUN if [ -f ./gradlew ]; then chmod +x ./gradlew; fi

# Build the application (prefer bootJar; fall back to build). Skip tests for faster image builds.
# Use Gradle wrapper only if the wrapper JAR exists and is non-empty; otherwise use system Gradle.
RUN bash -lc 'set -euo pipefail; \
  USE_WRAPPER=0; \
  if [ -x ./gradlew ] && [ -s ./gradle/wrapper/gradle-wrapper.jar ]; then \
    USE_WRAPPER=1; \
  fi; \
  if [ "$USE_WRAPPER" = "1" ]; then \
    echo "Using Gradle Wrapper"; \
    ./gradlew --no-daemon clean bootJar -x test || ./gradlew --no-daemon clean build -x test; \
  else \
    echo "Using system Gradle"; \
    gradle --no-daemon clean bootJar -x test || gradle --no-daemon clean build -x test; \
  fi'


# ----- Runtime stage: run the built Spring Boot jar -----
FROM eclipse-temurin:21-jre AS runtime

ENV TZ=Asia/Seoul \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m"

WORKDIR /app

# Install curl for healthcheck (kept minimal)
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user (Debian/Ubuntu base)
RUN groupadd -r spring \
  && useradd -r -g spring spring \
  && chown -R spring:spring /app

# Copy jar built in the builder stage
COPY --from=builder /workspace/build/libs/*.jar /app/app.jar

# Copy entrypoint script
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Ensure ownership for non-root user
RUN chown -R spring:spring /app

# Container healthcheck via Spring Boot Actuator
# Container healthcheck: prefer Actuator, fallback to TCP/HTTP reachability
# - Longer start-period for cold boots
# - If Actuator not exposed in current profile, we still mark healthy when port responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD curl -fsS http://localhost:8080/actuator/health | grep -q '"status":"UP"' || curl -s -o /dev/null http://localhost:8080 || exit 1

EXPOSE 8080
USER spring

# You can override SPRING_PROFILES_ACTIVE and JAVA_OPTS at runtime
ENTRYPOINT ["/app/entrypoint.sh"]
