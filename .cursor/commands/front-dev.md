# Private EC2에서 프론트엔드 빌드

Private EC2에서 프론트엔드를 빌드합니다.

> 💡 프론트가 백엔드 API를 사용하므로, `/mock-db-reset` 실행 후 `/back-dev` 또는 `/start-all`로 서버를 기동한 상태에서 확인하세요. `VITE_API_BASE_URL`은 기본적으로 `http://localhost:8080`으로 설정되어 있습니다.

## 사용법
```
/front-dev
```

## 실행되는 명령어
```bash
cd ~/itdaing/itdaing-web && npm install && npm run build
```

## 설명
- Private EC2에서 직접 프론트엔드를 빌드합니다.
- 의존성 설치 후 프로덕션 빌드를 수행합니다.
- 빌드 결과는 `itdaing-web/dist/` 디렉토리에 생성됩니다.
- 빌드 후 nginx를 통해 서빙됩니다.

## 주의사항
- 현재 Private EC2에서 직접 작업 중입니다. SSH 접속 없이 명령어를 실행하세요.
- 빌드 후 nginx 디렉토리로 복사해야 합니다: `sudo cp -r ~/itdaing/itdaing-web/dist/* /var/www/itdaing/`
