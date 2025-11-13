# 프론트엔드 개발 서버 실행

프론트엔드 개발 서버를 시작합니다.

## 사용법
```
/front-dev
```

## 실행되는 명령어
```bash
cd itdaing-web && npm run dev -- --host
```

## 설명
- `itdaing-web` 디렉토리로 이동
- Vite 개발 서버 시작
- `--host` 옵션으로 다른 기기에서도 접근 가능하도록 설정
- 기본 포트: 5173
- 접속 URL: http://localhost:5173

## 주의사항
- 백엔드 서버가 실행 중이어야 API 호출이 가능합니다
- MySQL 컨테이너도 실행 중이어야 합니다
