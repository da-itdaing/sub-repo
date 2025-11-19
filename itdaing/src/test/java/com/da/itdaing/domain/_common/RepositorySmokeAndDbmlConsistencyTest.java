package com.da.itdaing.domain._common;

import com.da.itdaing.support.jpa.JpaTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

/**
 * 레포지토리 스캔/빈 로딩 스모크 테스트 + DBML 문서 일관성 검증.
 *
 * 목적:
 * 1) 프로젝트 내 Repository 빈이 최소 1개 이상 로딩되는지 검증
 * 2) /docs/schema/dbdiagram_v2.dbml 파일 존재 및 핵심 테이블 키워드 포함 여부 검증
 */
@DisplayName("Repository 스모크 & DBML 일관성 테스트")
class RepositorySmokeAndDbmlConsistencyTest extends JpaTestSupport {

    @Autowired
    private ApplicationContext context;

    @Test
    @DisplayName("Repository 빈이 최소 1개 이상 로딩되어야 한다")
    void repositoryBeans_shouldBeLoaded() {
        // given
        String[] allBeanNames = context.getBeanDefinitionNames();

        // when
        List<String> repositoryBeans = Arrays.stream(allBeanNames)
                .filter(name -> name.endsWith("Repository"))
                .collect(Collectors.toList());

        // then
        assertThat(repositoryBeans)
                .as("Repository 빈이 최소 1개 이상 로딩되어야 합니다")
                .isNotEmpty();

        System.out.println("✅ Loaded Repository beans: " + repositoryBeans.size());
        repositoryBeans.forEach(bean -> System.out.println("  - " + bean));
    }

    @Test
    @DisplayName("DBML 파일이 존재하고 핵심 테이블 키워드를 포함해야 한다")
    void dbmlFile_shouldExist_andContainKeyTables() {
        // given
        Path dbmlPath = Paths.get("docs/schema/dbdiagram_v2.dbml");

        // DBML 파일 존재 확인
        assertThat(dbmlPath.toFile())
                .as("DBML 파일이 존재해야 합니다: " + dbmlPath)
                .exists()
                .isFile();

        // when
        String dbmlContent;
        try {
            dbmlContent = Files.readString(dbmlPath);
        } catch (IOException e) {
            fail("DBML 파일을 읽을 수 없습니다: " + e.getMessage());
            return;
        }

        // then - 핵심 테이블 키워드 검증
        List<String> requiredKeywords = Arrays.asList(
                "Table users",
                "Table seller_profile",
                "Table popup",
                "Table zone_area",
                "Table zone_cell",
                "Table category",
                "Table style",
                "Table region",
                "Table feature",
                "Table user_pref_category",
                "Table user_pref_style",
                "Table user_pref_region",
                "Table wishlist",
                "Table review"
        );

        List<String> missingKeywords = requiredKeywords.stream()
                .filter(keyword -> !dbmlContent.contains(keyword))
                .collect(Collectors.toList());

        assertThat(missingKeywords)
                .as("DBML에 다음 키워드가 누락되었습니다: " + String.join(", ", missingKeywords))
                .isEmpty();

        System.out.println("✅ DBML 파일 검증 완료: 필수 테이블 " + requiredKeywords.size() + "개 모두 존재");
    }

    @Test
    @DisplayName("DBML 파일에 핵심 칼럼 키워드가 포함되어야 한다")
    void dbmlFile_shouldContainKeyCombinations() {
        // given
        Path dbmlPath = Paths.get("docs/schema/dbdiagram_v2.dbml");

        String dbmlContent;
        try {
            dbmlContent = Files.readString(dbmlPath);
        } catch (IOException e) {
            fail("DBML 파일을 읽을 수 없습니다: " + e.getMessage());
            return;
        }

        // when & then - 테이블 + 칼럼 조합 검증 (대표 예시)
        List<String> keyColumnCombinations = Arrays.asList(
                "login_id",        // users 테이블
                "seller_id",       // popup 테이블
                "zone_cell_id",    // popup 테이블
                "approval_status", // popup 테이블
                "activity_region", // seller_profile 테이블
                "user_id",         // 여러 pref 테이블
                "category_id",     // user_pref_category 등
                "style_id",        // user_pref_style 등
                "region_id"        // user_pref_region 등
        );

        List<String> missingColumns = keyColumnCombinations.stream()
                .filter(keyword -> !dbmlContent.contains(keyword))
                .collect(Collectors.toList());

        assertThat(missingColumns)
                .as("DBML에 다음 칼럼 키워드가 누락되었습니다: " + String.join(", ", missingColumns))
                .isEmpty();

        System.out.println("✅ DBML 칼럼 키워드 검증 완료: " + keyColumnCombinations.size() + "개 모두 존재");
    }
}

// ✅ repository smoke & dbml keywords ok

