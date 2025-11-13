# Private EC2에서 백엔드 서버 실행

Private EC2에서 백엔드 개발 서버를 시작합니다.

> 💡 Mock 데이터가 비어 있으면 `/mock-db-reset`으로 RDS를 초기화한 뒤 실행하세요.

## 사용법
```
/back-dev
```

## 실행되는 명령어
```bash
cd ~/itdaing && source prod.env && ./gradlew bootRun
```

## 설명
- Private EC2에서 직접 Spring Boot 애플리케이션을 실행합니다.
- 환경 변수(`prod.env`)를 자동으로 로드합니다.
- 프로덕션 프로파일(`prod`)을 사용하며, AWS RDS PostgreSQL과 AWS S3를 사용합니다.
- Swagger UI는 Private EC2의 공개 IP를 통해 접근 가능합니다.

## 주의사항
- 현재 Private EC2에서 직접 작업 중입니다. SSH 접속 없이 명령어를 실행하세요.
- 백그라운드 실행을 원하면 `nohup` 또는 `&`를 사용하세요.
- 로그 확인: `tail -f /tmp/itdaing-boot.log`
