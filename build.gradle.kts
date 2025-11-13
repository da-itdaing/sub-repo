plugins {
    id("java")
    id("org.springframework.boot") version "3.5.7"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.springdoc.openapi-gradle-plugin") version "1.9.0"
}

group = "com.da.itdaing"
version = "0.0.1-SNAPSHOT"
description = "itdaing-server"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

openApi {
    // CI가 앱을 띄운 뒤 /v3/api-docs.yaml을 가져와서 파일로 저장
    outputDir.set(file("$buildDir/openapi"))
    outputFileName.set("openapi.yaml")
    waitTimeInSeconds.set(90)

    // 'openapi' 프로파일로 부팅 (H2 사용/보안완화용)
    customBootRun {
        args.set(listOf("--spring.profiles.active=openapi"))
    }
}

dependencies {
    // --- Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-web")          // REST
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")     // JPA
    implementation("org.springframework.boot:spring-boot-starter-security")     // Security
    implementation("org.springframework.boot:spring-boot-starter-validation")   // Bean Validation
    implementation("org.springframework.boot:spring-boot-starter-actuator")     // /actuator

    implementation("org.hibernate.orm:hibernate-spatial:6.6.29.Final")   // 네 로그의 hibernate-core 버전에 맞춤
    implementation("org.locationtech.jts:jts-core:1.19.0")

    // --- OpenAPI (Swagger UI)
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0")

    // --- JWT (jjwt 0.12.x: api + impl + jackson)
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")

    // AWS SDK v2 (S3)
    implementation(platform("software.amazon.awssdk:bom:2.25.66"))
    implementation("software.amazon.awssdk:s3")

    // --- QueryDSL (Jakarta)
    implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
    annotationProcessor("com.querydsl:querydsl-apt:5.0.0:jakarta")
    // (QueryDSL APT가 jakarta.* 어노테이션을 필요로 할 수 있어 보강)
    annotationProcessor("jakarta.annotation:jakarta.annotation-api:2.1.1")
    annotationProcessor("jakarta.persistence:jakarta.persistence-api:3.1.0")

    // --- MapStruct (선택)
    implementation("org.mapstruct:mapstruct:1.6.3")
    annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")

    // --- DB & Migration
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")
    runtimeOnly("com.mysql:mysql-connector-j")
    runtimeOnly("com.h2database:h2")  // local/test

    // --- Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // --- Lombok for tests
    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")

    // --- Spring configuration metadata
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    // --- Dev
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // --- Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
//    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.springframework.security:spring-security-test")
//    testImplementation("org.testcontainers:junit-jupiter")
//    testImplementation("org.testcontainers:mysql")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// QueryDSL Q타입 및 기타 APT 산출물을 IDE가 인식하도록 추가
sourceSets {
    named("main") {
        java.srcDir("build/generated/sources/annotationProcessor/java/main")
    }
}

// build.gradle.kts
tasks.named("clean") {
    delete("src/main/generated")
}

tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.add("-parameters")
}

tasks.withType<Test> {
    useJUnitPlatform()

    // 테스트 실패 시 즉시 중단
    failFast = true

    // 테스트 이벤트 로깅
    testLogging {
        events("passed", "skipped", "failed")
        showStandardStreams = false
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}

// 도메인별 테스트 태스크
tasks.register<Test>("testMaster") {
    description = "Run master domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.master.*")
    }
}

tasks.register<Test>("testUser") {
    description = "Run user domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.user.*")
    }
}

tasks.register<Test>("testGeo") {
    description = "Run geo domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.geo.*")
    }
}

tasks.register<Test>("testPopup") {
    description = "Run popup domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.popup.*")
    }
}

tasks.register<Test>("testSocial") {
    description = "Run social domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.social.*")
    }
}

tasks.register<Test>("testMsg") {
    description = "Run messaging domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.messaging.*")
    }
}

tasks.register<Test>("testReco") {
    description = "Run recommendation domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.reco.*")
    }
}

tasks.register<Test>("testMetric") {
    description = "Run metric domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.metric.*")
    }
}

tasks.register<Test>("testAudit") {
    description = "Run audit domain tests"
    group = "verification"
    useJUnitPlatform {
        includeEngines("junit-jupiter")
    }
    filter {
        includeTestsMatching("com.da.itdaing.domain.audit.*")
    }
}
