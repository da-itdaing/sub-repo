# 데이터베이스 마이그레이션 가이드

## 📋 개요

프로젝트는 AWS RDS PostgreSQL 15 + pgvector를 사용합니다.

## 🗄️ 데이터베이스 전략

### 현재: PostgreSQL 15 + pgvector (AWS RDS)
- 주요 애플리케이션 데이터베이스
- 사용자, 팝업, 리뷰, 메시지 등 모든 비즈니스 데이터
- Flyway를 통한 스키마 마이그레이션
- pgvector 확장으로 향후 챗봇 기능 지원

### 데이터베이스 정보
- **엔드포인트**: `itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com`
- **포트**: 5432
- **데이터베이스**: `itdaing-db`
- **사용자**: `itdaing_admin`
- **접근**: Private EC2에서만 접근 가능

## 🔄 PostgreSQL 마이그레이션

### Flyway 사용

```bash
# 마이그레이션 상태 확인 (로컬)
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

### PostgreSQL 문법 주의사항

- `AUTO_INCREMENT` → `BIGSERIAL` 또는 `SERIAL`
- `DATETIME(6)` → `TIMESTAMP(6)`
- `TINYINT(1)` → `BOOLEAN`
- `ENGINE=InnoDB` 제거
- `ON UPDATE CURRENT_TIMESTAMP` 제거 (트리거 사용)

## 🐘 pgvector 확장

### 확장 활성화

pgvector 확장은 `scripts/init-postgres.sql`에서 자동으로 활성화됩니다:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 벡터 테이블 생성 예시

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

## 📊 데이터베이스 접속

### Private EC2에서 접속

```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && PGPASSWORD=\$SPRING_DATASOURCE_PASSWORD psql -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com -U itdaing_admin -d itdaing-db"
```

### 데이터베이스 관리 명령어

```sql
-- 데이터베이스 목록 확인
\l

-- 현재 데이터베이스 선택
\c itdaing-db

-- 테이블 목록 확인
\dt

-- 테이블 구조 확인
\d users

-- 데이터 확인
SELECT * FROM users LIMIT 10;
```

## 🔧 Spring Boot 설정

### 프로덕션 프로파일

`application-prod.yml`에서 PostgreSQL 연결 설정:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
```

환경 변수는 `prod.env` 파일에서 관리합니다.

## 📝 마이그레이션 체크리스트

### PostgreSQL 마이그레이션
- [ ] Flyway 마이그레이션 파일 작성
- [ ] PostgreSQL 문법으로 변환 확인
- [ ] 마이그레이션 테스트 (로컬 또는 Private EC2)
- [ ] 롤백 전략 수립 (필요 시)
- [ ] 프로덕션 배포 전 백업

### pgvector 설정
- [ ] pgvector 확장 설치 확인
- [ ] 벡터 테이블 스키마 설계
- [ ] 인덱스 최적화 전략 수립

## 🚨 주의사항

1. **프로덕션 환경**
   - 마이그레이션 실행 전 반드시 백업
   - `ddl-auto=create` 절대 사용 금지
   - `validate` 사용 권장

2. **벡터 인덱스**
   - pgvector 인덱스는 대량 데이터 삽입 후 생성 권장
   - `lists` 파라미터는 데이터 크기에 따라 조정 필요

3. **데이터베이스 접근**
   - AWS RDS는 Private EC2에서만 접근 가능
   - 보안 그룹 설정 확인 필요

## 📚 참고 자료

- [Flyway 문서](https://flywaydb.org/documentation/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL 벡터 검색 가이드](https://github.com/pgvector/pgvector#getting-started)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
