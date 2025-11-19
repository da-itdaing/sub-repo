package com.da.itdaing.testsupport;

// @EnableJpaAuditing 들어있는 설정
import com.da.itdaing.global.config.JpaConfig;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@DataJpaTest
@ActiveProfiles("test")
@Import(JpaConfig.class) // ★ Auditing 활성화
public @interface JpaSliceTest {}
