# 백엔드 개발 서버 실행

백엔드 개발 서버를 시작합니다.

## 사용법
```
/back-dev
```

## 실행되는 명령어
```bash
./gradlew bootRun
```

## 설명
- Spring Boot 애플리케이션을 개발 모드로 실행
- 기본 프로파일: `local` (H2 메모리 DB)
- 포트: 8080
- 접속 URL: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- 헬스 체크: http://localhost:8080/actuator/health

## 프로파일 지정
```bash
# local 프로파일 (기본)
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun

# dev 프로파일 (RDS/S3 연동)
SPRING_PROFILES_ACTIVE=dev ./gradlew bootRun
```

## 주의사항
- MySQL 컨테이너가 실행 중이어야 합니다 (`docker-compose up -d mysql`)
- 포트 8080이 사용 중이 아닌지 확인하세요
- 로그는 콘솔에 출력되며, 백그라운드 실행 시 `/tmp/itdaing-boot.log`에 저장됩니다

