# 🏪 Itdaing Backend

> 다잇다잉 백엔드 서버 - Spring Boot 3.5.7 기반 REST API

## 📋 개요

**Itdaing Backend**는 팝업스토어 추천 플랫폼의 핵심 API 서버입니다.  
소비자, 판매자, 관리자를 위한 인증, 팝업 관리, 존/셀 관리, 리뷰/즐겨찾기 등의 기능을 제공합니다.

## 🛠️ 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| **Framework** | Spring Boot | 3.5.7 |
| **Language** | Java | 21 |
| **Build Tool** | Gradle (Kotlin DSL) | 8.x |
| **Database** | PostgreSQL + pgvector | 15+ |
| **ORM** | Hibernate + Hibernate Spatial | 6.6.29 |
| **Query** | QueryDSL | 5.0.0 |
| **Migration** | Flyway | - |
| **Auth** | JWT (jjwt) | 0.12.5 |
| **Cache** | Redis | - |
| **Storage** | AWS S3 | SDK 2.25.66 |
| **Mapping** | MapStruct | 1.6.3 |
| **API Docs** | SpringDoc OpenAPI | 2.7.0 |
| **Spatial** | JTS Core | 1.19.0 |

## 📁 프로젝트 구조

```
itdaing/
├── src/main/java/com/da/itdaing/
│   ├── config/                 # 설정 클래스
│   ├── domain/                 # 도메인별 DDD 구조
│   │   ├── admin/              # 관리자 기능
│   │   ├── audit/              # 감사 로그
│   │   ├── file/               # 파일 업로드
│   │   ├── geo/                # 존/셀 지리 정보
│   │   ├── master/             # 마스터 데이터 (카테고리, 스타일 등)
│   │   ├── messaging/          # 메시지/문의
│   │   ├── metric/             # 조회수/통계
│   │   ├── popup/              # 팝업스토어
│   │   ├── reco/               # 추천 시스템
│   │   ├── seller/             # 판매자
│   │   ├── social/             # 리뷰/즐겨찾기
│   │   └── user/               # 사용자/인증
│   └── global/                 # 공통 모듈
│       ├── api/                # ApiResponse 래퍼
│       ├── config/             # 전역 설정
│       ├── error/              # 예외 처리
│       ├── security/           # JWT, 인증 필터
│       └── util/               # 유틸리티
├── src/main/resources/
│   ├── application.yml         # 기본 설정
│   ├── application-prod.yml    # 프로덕션 설정
│   └── db/migration/           # Flyway 마이그레이션
├── docs/                       # API 문서 & 가이드
├── scripts/                    # 운영 스크립트
└── build.gradle.kts            # Gradle 빌드 설정
```

## 🚀 실행 방법

### 개발 환경

```bash
cd ~/itdaing

# 환경 변수 설정
source prod.env

# 서버 시작
./scripts/start-backend.sh

# 로그 확인
./scripts/tail-backend-log.sh

# 서버 중지
./scripts/stop-backend.sh
```

### 빌드

```bash
# 전체 빌드 (테스트 포함)
./gradlew build

# 테스트 제외 빌드
./gradlew build -x test

# JAR 생성
./gradlew bootJar
```

## 📝 API 엔드포인트

### 공개 API (인증 불필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/signup/consumer` | 소비자 회원가입 |
| POST | `/api/auth/signup/seller` | 판매자 회원가입 |
| GET | `/api/master/**` | 마스터 데이터 조회 |
| GET | `/api/popups` | 팝업 목록 조회 |
| GET | `/api/popups/{id}` | 팝업 상세 조회 |
| GET | `/api/zones` | 존 목록 조회 |
| GET | `/api/sellers/{id}` | 판매자 정보 조회 |

### 인증 필요 API

| 메서드 | 경로 | 역할 | 설명 |
|--------|------|------|------|
| GET | `/api/users/me` | ALL | 내 정보 조회 |
| PUT | `/api/users/me` | ALL | 내 정보 수정 |
| POST | `/api/popups` | SELLER | 팝업 등록 |
| PUT | `/api/popups/{id}` | SELLER | 팝업 수정 |
| GET | `/api/admin/**` | ADMIN | 관리자 기능 |

### API 문서

- **Swagger UI**: https://da-itdaing.github.io/sub-repo/
- **OpenAPI JSON**: `/docs/openapi.json`

## 🔐 인증 & 보안

### JWT 토큰

- **Access Token**: 15분 유효 (Header)
- **Refresh Token**: 14일 유효 (Redis 저장)

### 역할 (Role)

| 역할 | 설명 |
|------|------|
| `CONSUMER` | 소비자 - 팝업 조회, 리뷰 작성 |
| `SELLER` | 판매자 - 팝업 등록/관리 |
| `ADMIN` | 관리자 - 전체 관리 |

## 🧪 테스트

```bash
# 전체 테스트
./gradlew test

# 도메인별 테스트
./gradlew testMaster      # 마스터 데이터
./gradlew testUser        # 사용자
./gradlew testPopup       # 팝업
./gradlew testGeo         # 지리 정보
./gradlew testSocial      # 소셜 (리뷰/즐겨찾기)
```

### 테스트 계정

| 역할 | 아이디 | 비밀번호 |
|------|--------|----------|
| 소비자 | consumer1~10 | (환경변수 참조) |
| 판매자 | seller1~50 | (환경변수 참조) |
| 관리자 | admin1~3 | (환경변수 참조) |

> ⚠️ 실제 비밀번호는 `prod.env` 또는 팀 내부 문서 참조

## 💾 데이터베이스

### 백업 & 복원

```bash
# 수동 백업
./scripts/backup-database.sh

# 백업 목록 확인
./scripts/list-backups.sh

# 복원
./scripts/restore-database.sh backups/db_backup_YYYYMMDD_HHMMSS.sql

# 자동 백업 설정
./scripts/setup-auto-backup.sh
```

## 📚 문서

| 문서 | 설명 |
|------|------|
| [BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) | 아키텍처 & 보안 플로우 |
| [BACKEND_FOUNDATION.md](docs/BACKEND_FOUNDATION.md) | 마스터 데이터 & 패키지 규칙 |
| [DB_SCHEMA.md](docs/DB_SCHEMA.md) | 데이터베이스 스키마 |
| [scripts/README.md](scripts/README.md) | 스크립트 사용법 |

## 🔧 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `SPRING_PROFILES_ACTIVE` | 활성 프로파일 | `prod` |
| `DB_URL` | PostgreSQL 연결 URL | - |
| `DB_USERNAME` | DB 사용자명 | - |
| `DB_PASSWORD` | DB 비밀번호 | - |
| `JWT_SECRET` | JWT 서명 키 (256bit+) | - |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 | - |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 | - |
| `S3_BUCKET_NAME` | S3 버킷명 | - |

## 🚢 배포

### systemd 서비스

```bash
# 서비스 상태 확인
sudo systemctl status itdaing-backend

# 서비스 재시작
sudo systemctl restart itdaing-backend

# 로그 확인
journalctl -u itdaing-backend -f
```

### 프로덕션 구성

```
사용자 → CloudFront → ALB → private-tg → Spring Boot (8080)
```

## 📄 라이선스

인공지능 사관학교 6기 프로젝트
