# Itdaing (잇다잉) - 광주광역시 플리마켓 매칭 서비스

## DB 초기화 스크립트

### init-all-data.sql
**전체 초기 데이터 삽입 스크립트 (메인 스크립트)**

이 스크립트는 다음을 포함합니다:
- 마스터 데이터 (카테고리, 스타일, 지역, 편의시설)
- 사용자 계정
  - 관리자: 5명 (admin1 ~ admin5)
  - 판매자: 15명 (seller1 ~ seller15)
  - 소비자: 50명 (consumer1 ~ consumer50)
- ZoneArea: 25개 (광주광역시 5개 구별 각 5개씩)
- ZoneCell: 125개 (각 Area당 5개씩)
- Popup: 150개 이상 (각 판매자당 8-12개)

**실행 방법:**
```bash
cd /home/ubuntu/itdaing
source prod.env
PGPASSWORD="$SPRING_DATASOURCE_PASSWORD" psql \
  -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com \
  -p 5432 \
  -U "$SPRING_DATASOURCE_USERNAME" \
  -d itdaing-db \
  -f scripts/init-all-data.sql
```

**모든 계정 비밀번호:** `pass!1234`

### init-postgres.sql
**PostgreSQL 초기 설정 스크립트**

- pgvector 확장 활성화
- updated_at 자동 업데이트 트리거 함수 생성

**실행 방법:**
```bash
cd /home/ubuntu/itdaing
source prod.env
PGPASSWORD="$SPRING_DATASOURCE_PASSWORD" psql \
  -h itdaing-db.cl4qagmger70.ap-northeast-2.rds.amazonaws.com \
  -p 5432 \
  -U "$SPRING_DATASOURCE_USERNAME" \
  -d itdaing-db \
  -f scripts/init-postgres.sql
```

### update-passwords.sql
**비밀번호 해시 확인 스크립트**

- 기존 사용자 비밀번호 해시 확인용
- 실제 비밀번호 업데이트는 백엔드 애플리케이션을 통해 수행해야 함

## 배포 스크립트

### deploy-frontend.sh
프론트엔드 배포 스크립트

### deploy-full-project.sh
전체 프로젝트 배포 스크립트

### deploy-to-private-ec2.sh
Private EC2 배포 스크립트

## 데이터베이스 백업/복원 스크립트

### backup-database.sh
**데이터베이스 백업 스크립트**

현재 데이터베이스의 전체 데이터를 백업 파일로 저장합니다.

**실행 방법:**
```bash
cd /home/ubuntu/itdaing
./scripts/backup-database.sh
```

**특정 파일명으로 백업:**
```bash
./scripts/backup-database.sh my_backup.sql
```

**기능:**
- PostgreSQL pg_dump를 사용한 전체 데이터베이스 백업
- 자동으로 타임스탬프 파일명 생성 (예: db_backup_20251118_120000.sql)
- 백업 후 압축 옵션 제공 (gzip)
- backups/ 디렉토리에 저장

### restore-database.sh
**데이터베이스 복원 스크립트**

백업 파일로부터 데이터베이스를 복원합니다.

**⚠️ 경고:** 이 작업은 현재 데이터베이스의 모든 데이터를 백업 파일의 데이터로 덮어씁니다.

**실행 방법:**
```bash
cd /home/ubuntu/itdaing
./scripts/restore-database.sh backups/db_backup_20251118_120000.sql
```

**압축된 백업 파일 복원:**
```bash
./scripts/restore-database.sh backups/db_backup_20251118_120000.sql.gz
```

**기능:**
- PostgreSQL psql을 사용한 데이터베이스 복원
- 압축된 파일(.gz) 자동 감지 및 압축 해제
- 복원 전 확인 프롬프트
- 안전한 복원 프로세스

### list-backups.sh
**백업 파일 목록 조회 스크립트**

생성된 모든 백업 파일의 목록과 정보를 표시합니다.

**실행 방법:**
```bash
cd /home/ubuntu/itdaing
./scripts/list-backups.sh
```

**표시 정보:**
- 백업 파일명
- 파일 크기
- 생성 날짜 및 시간
- 총 백업 개수 및 전체 크기

### auto-backup-database.sh
**자동 백업 스크립트 (Cron용)**

정기적으로 데이터베이스를 자동 백업하는 스크립트입니다.

**특징:**
- 자동으로 타임스탬프 파일명 생성
- 백업 후 자동 압축 (.gz)
- 7일 이상 된 자동 백업 파일 자동 삭제
- 백업 로그 기록 (backups/backup.log)

**수동 실행:**
```bash
cd /home/ubuntu/itdaing
./scripts/auto-backup-database.sh
```

**Cron 등록 (매일 새벽 2시):**
```bash
crontab -e
# 다음 라인 추가:
0 2 * * * /home/ubuntu/itdaing/scripts/auto-backup-database.sh >> /home/ubuntu/itdaing/backups/backup.log 2>&1
```

### setup-auto-backup.sh
**자동 백업 설정 도우미 스크립트**

대화형 인터페이스로 자동 백업을 쉽게 설정할 수 있습니다.

**실행 방법:**
```bash
cd /home/ubuntu/itdaing
./scripts/setup-auto-backup.sh
```

**제공 옵션:**
1. 매일 새벽 2시에 자동 백업 (권장)
2. 매주 일요일 새벽 3시에 자동 백업
3. 매일 오전 6시에 자동 백업
4. 6시간마다 자동 백업
5. 수동으로 crontab 편집
6. 현재 설정된 cron 작업 보기
7. 자동 백업 비활성화

## 유틸리티 스크립트

### check-private-ec2-env.sh
Private EC2 환경 확인 스크립트

---

## 백업/복원 사용 예시

### 정기 백업 생성
```bash
cd /home/ubuntu/itdaing
./scripts/backup-database.sh
# 백업 파일이 backups/ 디렉토리에 생성됩니다
```

### 백업 목록 확인
```bash
./scripts/list-backups.sh
```

### 데이터베이스 복원
```bash
# 백업 목록에서 복원할 파일 확인 후
./scripts/restore-database.sh backups/db_backup_20251118_120000.sql
# yes를 입력하여 복원 진행
```

### 백업 파일 관리
백업 파일은 `backups/` 디렉토리에 저장됩니다. 
- 압축된 백업은 약 50-80% 용량 절감
- 정기적으로 오래된 백업 파일 정리 권장
- 중요한 백업은 외부 스토리지(S3 등)에 별도 보관 권장

---

**참고**: 현재 Private EC2에서 직접 작업 중이므로, SSH를 통한 원격 스크립트는 사용하지 않습니다.
