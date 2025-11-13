# 데이터베이스 마이그레이션 가이드

## 📋 개요

프로젝트는 현재 MySQL을 사용하고 있으며, 향후 챗봇 기능을 위해 PostgreSQL + pgvector를 추가할 예정입니다.

## 🗄️ 데이터베이스 전략

### 현재: MySQL 8.0
- 주요 애플리케이션 데이터베이스
- 사용자, 팝업, 리뷰, 메시지 등 모든 비즈니스 데이터
- Flyway를 통한 스키마 마이그레이션

### 향후: PostgreSQL 15 + pgvector
- 챗봇 전용 데이터베이스
- 벡터 임베딩 저장 및 유사도 검색
- 별도 프로파일로 관리 (`chatbot`)

## 🔄 MySQL 마이그레이션

### Flyway 사용

```bash
# 마이그레이션 상태 확인
./gradlew flywayInfo

# 마이그레이션 실행 (애플리케이션 시작 시 자동 실행)
./gradlew flywayMigrate

# 마이그레이션 파일 위치
src/main/resources/db/migration/
```

### 마이그레이션 파일 명명 규칙

```
V{version}__{description}.sql

예:
V1__init_schema.sql
V2__extend_seller_profile.sql
V3__add_chatbot_tables.sql
```

## 🐘 PostgreSQL 설정 (향후)

### 1. Docker 컨테이너 시작

```bash
# PostgreSQL + pgvector 시작
docker-compose --profile chatbot up -d postgres
```

### 2. pgvector 확장 활성화

```sql
-- PostgreSQL 접속
docker exec -it itdaing-postgres psql -U itdaing -d itdaing_chatbot

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. 벡터 테이블 생성 예시

```sql
-- 챗봇 대화 기록 테이블 (예시)
CREATE TABLE chatbot_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI embedding dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 벡터 인덱스 생성 (유사도 검색용)
CREATE INDEX ON chatbot_conversations 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 4. Spring Boot 설정

`application-chatbot.yml` 프로파일 사용:

```bash
SPRING_PROFILES_ACTIVE=chatbot,local ./gradlew bootRun
```

## 📊 데이터베이스 연결 정보

### MySQL (기본)

| 항목 | 값 |
|------|-----|
| 호스트 | localhost |
| 포트 | 3306 |
| 데이터베이스 | itdaing |
| 사용자 | root |
| 비밀번호 | password |

### PostgreSQL (챗봇용)

| 항목 | 값 |
|------|-----|
| 호스트 | localhost |
| 포트 | 5432 |
| 데이터베이스 | itdaing_chatbot |
| 사용자 | itdaing |
| 비밀번호 | password |

## 🔧 다중 데이터소스 설정 (향후)

챗봇 기능 추가 시 두 데이터베이스를 동시에 사용할 수 있도록 설정:

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.mysql")
    public DataSource mysqlDataSource() {
        // MySQL 데이터소스
    }
    
    @Bean
    @ConfigurationProperties("spring.datasource.postgres")
    public DataSource postgresDataSource() {
        // PostgreSQL 데이터소스
    }
}
```

## 📝 마이그레이션 체크리스트

### MySQL 마이그레이션
- [ ] Flyway 마이그레이션 파일 작성
- [ ] 마이그레이션 테스트 (로컬)
- [ ] 롤백 전략 수립 (필요 시)
- [ ] 프로덕션 배포 전 백업

### PostgreSQL 설정 (향후)
- [ ] Docker 컨테이너 설정 확인
- [ ] pgvector 확장 설치 확인
- [ ] 벡터 테이블 스키마 설계
- [ ] 인덱스 최적화 전략 수립

## 🚨 주의사항

1. **프로덕션 환경**
   - 마이그레이션 실행 전 반드시 백업
   - `ddl-auto=create` 절대 사용 금지
   - `validate` 또는 `update` 사용

2. **벡터 인덱스**
   - pgvector 인덱스는 대량 데이터 삽입 후 생성 권장
   - `lists` 파라미터는 데이터 크기에 따라 조정 필요

3. **데이터 일관성**
   - MySQL과 PostgreSQL 간 데이터 동기화 전략 수립
   - 트랜잭션 경계 명확히 정의

## 📚 참고 자료

- [Flyway 문서](https://flywaydb.org/documentation/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL 벡터 검색 가이드](https://github.com/pgvector/pgvector#getting-started)

