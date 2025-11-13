# Private EC2에서 전체 서비스 시작

Private EC2에서 백엔드 Spring Boot 서버를 시작합니다.

> ⚠️ **Mock 데이터 확인**: 실행 전에 `/mock-db-reset`으로 RDS를 초기화/시드한 뒤 서버를 올리는 것이 권장됩니다.

## 사용법
```
/start-all
```

## 실행되는 명령어
```bash
cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &
```

## 설명
- Private EC2에서 직접 백엔드 서버를 시작합니다.
- 환경 변수(`prod.env`)를 자동으로 로드합니다.
- 백그라운드로 실행되며 로그는 `/tmp/itdaing-boot.log`에 저장됩니다.
- 프로덕션 프로파일(`prod`)을 사용하며, AWS RDS PostgreSQL과 AWS S3를 사용합니다.

## 주의사항
- 현재 Private EC2에서 직접 작업 중입니다. SSH 접속 없이 명령어를 실행하세요.
- 이미 실행 중인 서버가 있다면 충돌이 발생할 수 있습니다. 필요한 경우 `/stop-all` 명령어로 서버를 중지한 후 다시 시도하세요.
- 로그 확인: `tail -f /tmp/itdaing-boot.log`
