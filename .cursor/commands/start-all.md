# Private EC2에서 전체 서비스 시작

Private EC2에서 백엔드 Spring Boot 서버를 시작합니다.

## 사용법
```
/start-all
```

## 실행되는 명령어
```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"
```

## 설명
- Private EC2에 SSH 접속하여 백엔드 서버를 시작합니다.
- 환경 변수(`prod.env`)를 자동으로 로드합니다.
- 백그라운드로 실행되며 로그는 `/tmp/itdaing-boot.log`에 저장됩니다.
- 프로덕션 프로파일(`prod`)을 사용하며, AWS RDS PostgreSQL과 AWS S3를 사용합니다.

## 주의사항
- SSH 접속이 설정되어 있어야 합니다 (`~/.ssh/config`에 `private-ec2` 호스트 설정 필요).
- 이미 실행 중인 서버가 있다면 충돌이 발생할 수 있습니다. 필요한 경우 `/stop-all` 명령어로 서버를 중지한 후 다시 시도하세요.
- 로그 확인: `ssh private-ec2 "tail -f /tmp/itdaing-boot.log"`
