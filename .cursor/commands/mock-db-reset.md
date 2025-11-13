# Private EC2에서 Mock 데이터베이스 초기화

개발/QA용 목업 데이터를 다시 구축합니다. 스키마를 초기화한 뒤 Flyway 마이그레이션과 `DevDataSeed`를 실행합니다.

## 사용법
```
/mock-db-reset
```

## 실행되는 명령어
```bash
cd ~/itdaing && ./scripts/mockdb-reset.sh
```

## 설명
- Private EC2에서 직접 `scripts/mockdb-reset.sh` 스크립트를 실행합니다.
- 스크립트는 다음 순서로 동작합니다:
  1. RDS 연결 정보 확인 및 사용자 확인 프롬프트
  2. 기존 `public` 스키마 삭제 (`DROP SCHEMA public CASCADE`) 후 재생성
  3. Flyway 마이그레이션 재실행 (`./gradlew flywayMigrate`)
  4. Spring Boot `dev`/`seed` 프로파일을 이용한 `DevDataSeed` 실행 또는 별도 시드 SQL 적용
  5. 핵심 조회 엔드포인트 헬스체크 (`/api/master/categories`, `/api/popups`)
- 모든 작업 로그는 `logs/mockdb-reset-$(date).log`로 남길 예정입니다.

## 주의사항
- **파괴적 작업**입니다. 프로덕션 데이터베이스에서 절대 실행하지 마세요.
- 실행 전 `prod.env`에 설정된 RDS 엔드포인트가 올바른지 확인하십시오.
- 동시 실행을 방지하기 위해 한 명의 운영자만 수행하세요.
- 실패 시 로그 파일을 확인하고, 필요하면 수동으로 스키마를 삭제 후 다시 시도하십시오.

