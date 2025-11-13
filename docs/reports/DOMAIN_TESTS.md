# 도메인별 테스트 실행 가이드

## 📋 개요

프로젝트의 모든 도메인 엔티티와 리포지토리에 대한 테스트가 구현되어 있습니다.
도메인별로 독립적으로 테스트를 실행할 수 있도록 Gradle 태스크가 구성되어 있습니다.

## 🚀 전체 테스트 실행

```bash
# 모든 테스트 실행
./gradlew test --no-daemon

# 빠른 피드백 (첫 실패 시 중단)
./gradlew test --no-daemon --fail-fast
```

## 🎯 도메인별 테스트 실행

### 1️⃣ Master Data (Region, Style, Category, Feature)

```bash
./gradlew testMaster --no-daemon
```

**테스트 포함:**
- RegionRepositoryTest
- StyleRepositoryTest
- CategoryRepositoryTest (unique 제약 검증)
- FeatureRepositoryTest

---

### 2️⃣ User Domain (Users, Profiles, Preferences)

```bash
./gradlew testUser --no-daemon
```

**테스트 포함:**
- UsersRepositoryTest (unique email/loginId 검증)
- ConsumerProfileRepositoryTest
- SellerProfileRepositoryTest
- UserPrefCategoryRepositoryTest (unique 제약 검증)
- UserPrefStyleRepositoryTest
- UserPrefRegionRepositoryTest

---

### 3️⃣ Geo Domain (Zone Management)

```bash
./gradlew testGeo --no-daemon
```

**테스트 포함:**
- ZoneAreaRepositoryTest
- ZoneCellRepositoryTest
- ZoneAvailabilityRepositoryTest

---

### 4️⃣ Popup Domain (Popup Stores)

```bash
./gradlew testPopup --no-daemon
```

**테스트 포함:**
- PopupRepositoryTest
- PopupImageRepositoryTest
- PopupCategoryRepositoryTest (unique 제약 검증)
- PopupFeatureRepositoryTest

---

### 5️⃣ Social Domain (Wishlist, Reviews)

```bash
./gradlew testSocial --no-daemon
```

**테스트 포함:**
- WishlistRepositoryTest (unique 제약 검증)
- ReviewRepositoryTest (1인 1리뷰 제약 검증)
- ReviewImageRepositoryTest

---

### 6️⃣ Messaging Domain (Messages, Announcements)

```bash
./gradlew testMsg --no-daemon
```

**테스트 포함:**
- MessageRepositoryTest
- MessageAttachmentRepositoryTest
- AnnouncementRepositoryTest

---

### 7️⃣ Recommendation Domain (AI Recommendations)

```bash
./gradlew testReco --no-daemon
```

**테스트 포함:**
- DailyConsumerRecommendationRepositoryTest (unique 제약 검증)
- UserRecoDissmissalRepositoryTest
- DailySellerRecommendationRepositoryTest

---

### 8️⃣ Metric Domain (Analytics & Events)

```bash
./gradlew testMetric --no-daemon
```

**테스트 포함:**
- EventLogRepositoryTest
- EventLogCategoryRepositoryTest
- MetricDailyPopupRepositoryTest (unique 제약 검증)
- MetricDailyCategoryRepositoryTest

---

### 9️⃣ Audit Domain (Approval Records)

```bash
./gradlew testAudit --no-daemon
```

**테스트 포함:**
- ApprovalRecordRepositoryTest

---

## 📊 테스트 통계

| 도메인 | 엔티티 수 | 리포지토리 수 | 테스트 수 |
|--------|-----------|---------------|-----------|
| Master | 4 | 4 | 4 |
| User | 6 | 6 | 6 |
| Geo | 3 | 3 | 3 |
| Popup | 4 | 4 | 4 |
| Social | 3 | 3 | 3 |
| Messaging | 3 | 3 | 3 |
| Reco | 3 | 3 | 3 |
| Metric | 4 | 4 | 4 |
| Audit | 1 | 1 | 1 |
| **합계** | **31** | **31** | **31** |

**Enums:** 6개 (CategoryType, UserRole, ApprovalStatus, AnnouncementAudience, EventAction, DecisionType)

---

## 🔧 테스트 설정

### Fail Fast 모드
첫 번째 테스트 실패 시 즉시 중단되어 빠른 피드백을 제공합니다.

```kotlin
tasks.withType<Test> {
    failFast = true
}
```

### 테스트 로깅
모든 테스트 결과(통과/스킵/실패)가 콘솔에 출력됩니다.

```kotlin
testLogging {
    events("passed", "skipped", "failed")
}
```

---

## 🧪 테스트 환경

- **Database:** H2 in-memory (MODE=MySQL)
- **Profile:** test (application-test.yml)
- **Framework:** JUnit 5 + Spring Boot Test
- **Assertions:** AssertJ

### H2 설정 (application-test.yml)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:itda;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
```

---

## 💡 유용한 명령어

```bash
# 빌드 없이 테스트만 실행
./gradlew test --no-daemon -x compileJava

# 특정 도메인 테스트만 실행 (캐시 무시)
./gradlew testMaster --no-daemon --rerun-tasks

# 병렬 실행 (성능 향상)
./gradlew test --no-daemon --parallel --max-workers=4

# 상세 로그와 함께 실행
./gradlew testUser --no-daemon --info

# 테스트 리포트 생성 후 확인
./gradlew test --no-daemon
open build/reports/tests/test/index.html
```

---

## 📝 테스트 작성 규칙

1. **@DataJpaTest** 사용으로 JPA 슬라이스 테스트
2. **@ActiveProfiles("test")** 로 테스트 프로파일 활성화
3. 기본 **save/find** 검증
4. **unique 제약 조건** 위반 테스트 포함
5. **AssertJ** 스타일 단언문 사용

### 예시

```java
@DataJpaTest
@ActiveProfiles("test")
class RegionRepositoryTest {
    
    @Autowired
    private RegionRepository regionRepository;
    
    @Test
    void 지역을_저장하고_조회할_수_있다() {
        // given
        Region region = Region.builder()
                .name("남구")
                .build();
        
        // when
        Region saved = regionRepository.save(region);
        Region found = regionRepository.findById(saved.getId()).orElseThrow();
        
        // then
        assertThat(found.getName()).isEqualTo("남구");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}
```

---

## 🎯 다음 단계

1. ✅ **도메인 엔티티 및 리포지토리 구현 완료**
2. ✅ **기본 테스트 작성 완료**
3. 🔄 **Service 계층 구현**
4. 🔄 **Controller 계층 구현**
5. 🔄 **통합 테스트 작성**
6. 🔄 **Flyway 마이그레이션 스크립트 작성**

---

## 📚 참고

- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [AssertJ Documentation](https://assertj.github.io/doc/)

