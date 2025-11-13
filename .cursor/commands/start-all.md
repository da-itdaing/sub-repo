# 전체 개발 서버 실행

모든 개발 서버(MySQL, 백엔드, 프론트엔드)를 순차적으로 시작합니다.

## 사용법
```
/start-all
```

## 실행 순서
1. MySQL Docker 컨테이너 시작
2. 백엔드 서버 시작 (5초 대기)
3. 프론트엔드 서버 시작 (10초 대기)

## 실행되는 명령어
```bash
# 1. MySQL 시작
docker-compose up -d mysql

# 2. MySQL 준비 대기
sleep 5

# 3. 백엔드 시작 (백그라운드)
./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &

# 4. 백엔드 준비 대기
sleep 10

# 5. 프론트엔드 시작 (백그라운드)
cd itdaing-web && npm run dev -- --host > /tmp/itdaing-web-dev.log 2>&1 &
```

## 접속 URL
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- MySQL: localhost:3306

## 로그 확인
```bash
# 백엔드 로그
tail -f /tmp/itdaing-boot.log

# 프론트엔드 로그
tail -f /tmp/itdaing-web-dev.log

# MySQL 로그
docker logs -f itdaing-mysql
```

## 서버 중지
```bash
# 모든 서버 중지
pkill -f "gradlew bootRun"
pkill -f "vite"
docker-compose stop mysql
```

## 주의사항
- 각 서버가 정상적으로 시작되었는지 로그를 확인하세요
- 포트 충돌이 발생하면 기존 프로세스를 종료한 후 다시 실행하세요

