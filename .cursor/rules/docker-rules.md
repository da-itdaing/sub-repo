# Docker 사용 규칙

## MySQL 컨테이너 관리

### 컨테이너 정보
- **컨테이너 이름**: `itdaing-mysql`
- **이미지**: `mysql:8.0`
- **포트**: `3306:3306`
- **볼륨**: `itdaing_mysql_data` (데이터 영구 저장)

### 기본 명령어

#### 컨테이너 시작
```bash
# docker-compose.yml이 있는 디렉토리에서 실행
docker-compose up -d mysql

# 또는 프로젝트 루트에서
docker-compose -f docker-compose.yml up -d mysql
```

#### 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps | grep itdaing-mysql

# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a | grep itdaing-mysql

# 상세 정보 확인
docker inspect itdaing-mysql
```

#### 컨테이너 중지
```bash
# 중지 (데이터 유지)
docker-compose stop mysql

# 또는
docker stop itdaing-mysql
```

#### 컨테이너 재시작
```bash
# 재시작
docker-compose restart mysql

# 또는
docker restart itdaing-mysql
```

#### 컨테이너 제거
```bash
# 컨테이너만 제거 (볼륨 유지)
docker-compose down mysql

# 볼륨까지 제거 (주의: 데이터 삭제됨)
docker-compose down -v mysql
```

### 로그 확인
```bash
# 실시간 로그 확인
docker logs -f itdaing-mysql

# 최근 100줄 확인
docker logs --tail 100 itdaing-mysql

# 특정 시간 이후 로그
docker logs --since 10m itdaing-mysql
```

### MySQL 접속
```bash
# 컨테이너 내부 MySQL 클라이언트 사용
docker exec -it itdaing-mysql mysql -u root -p

# 비밀번호: root (또는 docker-compose.yml에 설정된 값)

# 외부에서 MySQL 클라이언트 사용 (로컬에 MySQL 클라이언트 설치 필요)
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### 데이터베이스 관리

#### 데이터베이스 목록 확인
```sql
SHOW DATABASES;
```

#### 데이터베이스 선택
```sql
USE itdaing;
```

#### 테이블 목록 확인
```sql
SHOW TABLES;
```

#### 테이블 구조 확인
```sql
DESCRIBE users;
-- 또는
SHOW CREATE TABLE users;
```

#### 데이터 확인
```sql
-- 사용자 데이터 확인
SELECT * FROM users LIMIT 10;

-- 특정 사용자 확인
SELECT * FROM users WHERE username = 'consumer1';

-- 테이블 행 수 확인
SELECT COUNT(*) FROM users;
```

### 백업 및 복원

#### 데이터베이스 백업
```bash
# 전체 데이터베이스 백업
docker exec itdaing-mysql mysqldump -u root -p itdaing > backup_$(date +%Y%m%d_%H%M%S).sql

# 특정 테이블만 백업
docker exec itdaing-mysql mysqldump -u root -p itdaing users > users_backup.sql
```

#### 데이터베이스 복원
```bash
# 백업 파일로 복원
docker exec -i itdaing-mysql mysql -u root -p itdaing < backup_20240101_120000.sql
```

### 볼륨 관리

#### 볼륨 목록 확인
```bash
docker volume ls | grep itdaing
```

#### 볼륨 상세 정보
```bash
docker volume inspect itdaing_mysql_data
```

#### 볼륨 백업 (데이터 디렉토리 직접 복사)
```bash
# 볼륨 마운트 경로 확인
docker volume inspect itdaing_mysql_data | grep Mountpoint

# 데이터 디렉토리 백업 (컨테이너 중지 후)
docker-compose stop mysql
sudo cp -r /var/lib/docker/volumes/itdaing_mysql_data/_data ./mysql_backup
docker-compose start mysql
```

#### 볼륨 제거 (주의: 데이터 삭제됨)
```bash
docker volume rm itdaing_mysql_data
```

### 성능 모니터링

#### 리소스 사용량 확인
```bash
# 컨테이너 리소스 사용량
docker stats itdaing-mysql

# 특정 시간 동안 모니터링
docker stats --no-stream itdaing-mysql
```

#### MySQL 프로세스 확인
```bash
docker exec itdaing-mysql ps aux | grep mysql
```

#### 연결 상태 확인
```bash
docker exec itdaing-mysql mysqladmin -u root -p status
docker exec itdaing-mysql mysqladmin -u root -p processlist
```

### 문제 해결

#### 컨테이너가 시작되지 않을 때
```bash
# 로그 확인
docker logs itdaing-mysql

# 컨테이너 재생성
docker-compose down mysql
docker-compose up -d mysql
```

#### 포트 충돌 시
```bash
# 포트 사용 확인
lsof -i :3306

# docker-compose.yml에서 포트 변경
# ports: "3307:3306"  # 호스트 포트를 3307로 변경
```

#### 데이터베이스 연결 실패 시
1. 컨테이너 상태 확인: `docker ps | grep itdaing-mysql`
2. 로그 확인: `docker logs itdaing-mysql`
3. 네트워크 확인: `docker network ls`
4. 컨테이너 재시작: `docker-compose restart mysql`

#### 디스크 공간 부족 시
```bash
# 사용하지 않는 리소스 정리
docker system prune -a

# 볼륨까지 제거 (주의)
docker system prune -a --volumes
```

### 환경 변수 설정

#### docker-compose.yml에서 설정
```yaml
environment:
  MYSQL_ROOT_PASSWORD: root
  MYSQL_DATABASE: itdaing
  MYSQL_USER: itdaing
  MYSQL_PASSWORD: itdaing
```

#### 런타임 환경 변수 변경
```bash
# 컨테이너 재생성 필요
docker-compose down mysql
# docker-compose.yml 수정
docker-compose up -d mysql
```

### 네트워크 관리

#### 네트워크 확인
```bash
docker network ls
docker network inspect final-project_default
```

#### 컨테이너 간 통신 테스트
```bash
# 다른 컨테이너에서 MySQL 접속 테스트
docker run --rm --network final-project_default mysql:8.0 mysql -h itdaing-mysql -u root -p
```

### 보안 주의사항

1. **비밀번호 관리**
   - 프로덕션 환경에서는 강력한 비밀번호 사용
   - 환경 변수로 관리 (docker-compose.yml에 하드코딩 금지)

2. **포트 노출**
   - 프로덕션에서는 외부 포트 노출 최소화
   - 방화벽 규칙 설정

3. **볼륨 권한**
   - 볼륨 마운트 시 적절한 권한 설정
   - 민감한 데이터는 암호화 고려

### 유용한 스크립트

#### MySQL 컨테이너 완전 초기화
```bash
#!/bin/bash
# reset-mysql.sh

echo "MySQL 컨테이너 중지 및 제거..."
docker-compose down -v mysql

echo "MySQL 컨테이너 재시작..."
docker-compose up -d mysql

echo "MySQL 준비 대기 중..."
sleep 10

echo "완료! 백엔드를 재시작하면 Flyway 마이그레이션이 실행됩니다."
```

#### 데이터베이스 상태 확인 스크립트
```bash
#!/bin/bash
# check-mysql.sh

echo "=== MySQL 컨테이너 상태 ==="
docker ps | grep itdaing-mysql

echo -e "\n=== MySQL 연결 테스트 ==="
docker exec itdaing-mysql mysqladmin -u root -p'root' ping

echo -e "\n=== 데이터베이스 목록 ==="
docker exec itdaing-mysql mysql -u root -p'root' -e "SHOW DATABASES;"

echo -e "\n=== 테이블 목록 ==="
docker exec itdaing-mysql mysql -u root -p'root' -e "USE itdaing; SHOW TABLES;"
```

