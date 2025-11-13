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

## 유틸리티 스크립트

### check-private-ec2-env.sh
Private EC2 환경 확인 스크립트

---

**참고**: 현재 Private EC2에서 직접 작업 중이므로, SSH를 통한 원격 스크립트는 사용하지 않습니다.
