# Private EC2에서 프론트엔드 빌드

Private EC2에서 프론트엔드를 빌드합니다.

## 사용법
```
/front-dev
```

## 실행되는 명령어
```bash
ssh private-ec2 "cd ~/itdaing/itdaing-web && npm install && npm run build"
```

## 설명
- Private EC2에 SSH 접속하여 프론트엔드를 빌드합니다.
- 의존성 설치 후 프로덕션 빌드를 수행합니다.
- 빌드 결과는 `itdaing-web/dist/` 디렉토리에 생성됩니다.
- 빌드 후 nginx를 통해 서빙됩니다.

## 주의사항
- SSH 접속이 설정되어 있어야 합니다 (`~/.ssh/config`에 `private-ec2` 호스트 설정 필요).
- 빌드 후 nginx 디렉토리로 복사해야 합니다: `sudo cp -r ~/itdaing/itdaing-web/dist/* /var/www/itdaing/`
