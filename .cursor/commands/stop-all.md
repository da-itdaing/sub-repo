# 전체 개발 서버 중지

실행 중인 모든 개발 서버를 중지합니다.

## 사용법
```
/stop-all
```

## 실행되는 명령어
```bash
# 백엔드 중지
pkill -f "gradlew bootRun"

# 프론트엔드 중지
pkill -f "vite"

# MySQL 중지 (선택사항)
docker-compose stop mysql
```

## 설명
- 백엔드와 프론트엔드 프로세스를 종료합니다
- MySQL 컨테이너는 기본적으로 중지하지 않습니다 (데이터 유지를 위해)
- MySQL도 중지하려면 `docker-compose stop mysql` 명령을 추가로 실행하세요

## MySQL 완전 제거 (데이터 삭제)
```bash
# 주의: 데이터가 삭제됩니다
docker-compose down -v mysql
```

