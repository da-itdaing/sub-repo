# 테스트 계정 정보

## 🔐 개발 환경 테스트 계정

백엔드 서버가 `local` 프로파일로 실행되면 자동으로 테스트 계정이 생성됩니다.

### Seller 계정 (판매자)

#### Seller 1
```
로그인 ID: seller1
비밀번호: pass!1234
이름: 박판매
닉네임: 팝업왕
이메일: seller1@itdaing.com
역할: SELLER
```

#### Seller 2
```
로그인 ID: seller2
비밀번호: pass!1234
이름: 이판매
닉네임: 플레이팩토리
이메일: seller2@itdaing.com
역할: SELLER
```

### Consumer 계정 (소비자)

#### Consumer 1
```
로그인 ID: consumer1
비밀번호: pass!1234
이름: 김소비
이메일: consumer1@itdaing.com
역할: CONSUMER
```

#### Consumer 2
```
로그인 ID: consumer2
비밀번호: pass!1234
이름: 이소비
이메일: consumer2@itdaing.com
역할: CONSUMER
```

### Admin 계정 (관리자)

```
로그인 ID: admin
비밀번호: pass!1234
이름: 관리자
이메일: admin@itdaing.com
역할: ADMIN
```

## 🚀 로그인 방법

### 1. 웹 브라우저로 로그인

```
URL: http://localhost:3000/login
```

1. 로그인 페이지 접속
2. 사용자 타입 선택:
   - **소비자**: consumer 계정 사용
   - **판매자**: seller 계정 사용
3. 로그인 ID와 비밀번호 입력
4. "로그인" 버튼 클릭

### 2. 자동 리다이렉션

로그인 성공 후 역할에 따라 자동 페이지 이동:

- **SELLER** → `/seller/dashboard` (판매자 대시보드)
- **CONSUMER** → `/` (메인 페이지)
- **ADMIN** → `/admin/dashboard` (관리자 대시보드, 추후 구현)

## 📋 각 계정별 기능

### Seller (판매자)

**접근 가능 페이지:**
- `/seller/dashboard` - 판매자 대시보드
- `/seller/popups` - 팝업 관리
- `/seller/popups/create` - 새 팝업 등록
- `/seller/profile` - 내 정보

**기능:**
- 팝업스토어 등록/수정/삭제
- 팝업스토어 통계 확인 (조회수, 찜, 리뷰)
- 승인 상태 확인 (승인 완료/대기/반려)
- 판매자 프로필 관리

### Consumer (소비자)

**접근 가능 페이지:**
- `/` - 메인 페이지
- `/popup/:id` - 팝업 상세
- `/nearby` - 내 주변 탐색
- `/mypage` - 마이페이지
- `/mypage/favorites` - 찜한 팝업
- `/mypage/reviews` - 내 리뷰

**기능:**
- 팝업스토어 검색/탐색
- 팝업스토어 상세 정보 확인
- 팝업스토어 찜하기
- 리뷰 작성/수정/삭제
- 지도 기반 검색

### Admin (관리자)

**접근 가능 페이지:**
- (추후 구현)

**기능:**
- 사용자 관리
- 팝업스토어 승인/반려
- 통계 대시보드
- 신고 관리

## 🧪 테스트 시나리오

### Seller 계정 테스트

```bash
# 1. seller1 계정으로 로그인
로그인 ID: seller1
비밀번호: pass!1234

# 2. 대시보드 확인
- 통계 카드 (팝업 수, 조회수 등)
- 최근 팝업 목록
- 주간 통계

# 3. 팝업 관리
- 팝업 목록 조회
- 검색 및 필터 기능
- 편집/삭제 버튼

# 4. 새 팝업 등록
- 팝업 정보 입력
- 이미지 업로드
- 등록 버튼 클릭

# 5. 프로필 관리
- 판매자 정보 수정
- 사업자 정보 확인
```

### Consumer 계정 테스트

```bash
# 1. consumer1 계정으로 로그인
로그인 ID: consumer1
비밀번호: pass!1234

# 2. 메인 페이지 확인
- 팝업 목록 (곧 오픈/울 동네/카테고리별)
- 히어로 캐러셀
- 검색 기능

# 3. 팝업 상세 페이지
- 팝업 정보 확인
- 지도 확인
- 리뷰 목록

# 4. 내 주변 탐색
- 지도 기반 팝업 검색
- 필터 기능
- 목록/지도 뷰 전환

# 5. 마이페이지
- 찜한 팝업 목록
- 내가 작성한 리뷰
- 프로필 정보
```

## 🔄 비밀번호 변경

현재 비밀번호 변경 기능은 UI만 구현되어 있습니다.
백엔드 API 구현 후 연동 예정입니다.

## ⚠️ 주의사항

### 개발 환경 전용

이 계정들은 **개발 환경에서만** 사용됩니다:
- `spring.profiles.active=local`일 때만 생성됨
- 프로덕션 환경에서는 절대 사용하지 마세요
- 실제 서비스에서는 회원가입을 통해 계정을 생성하세요

### 비밀번호 보안

- 현재 모든 테스트 계정의 비밀번호는 `pass!1234`로 동일합니다
- 프로덕션 환경에서는 강력한 비밀번호를 사용하세요
- 비밀번호는 절대 코드에 하드코딩하지 마세요

### 데이터 초기화

백엔드 서버를 재시작하면:
- 데이터베이스가 초기화될 수 있습니다 (설정에 따라 다름)
- 테스트 계정은 자동으로 재생성됩니다

## 🆘 로그인 문제 해결

### 문제: "로그인에 실패했습니다"

**원인:**
- 잘못된 로그인 ID 또는 비밀번호
- 백엔드 서버가 실행되지 않음
- 데이터베이스 연결 문제

**해결:**
1. 백엔드 서버 상태 확인:
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. 로그인 ID/비밀번호 확인:
   - 대소문자 구분 확인
   - 공백 없이 입력

3. 백엔드 로그 확인:
   ```bash
   tail -f /tmp/backend-startup.log
   ```

### 문제: "404 페이지를 찾을 수 없습니다"

**원인:**
- seller로 로그인했는데 seller 페이지가 구현되지 않음
- 라우팅 설정 문제

**해결:**
1. 프론트엔드 서버 재시작:
   ```bash
   cd /home/ubuntu/itdaing-app
   npm run dev
   ```

2. 브라우저 캐시 삭제:
   - Ctrl + Shift + R (강력 새로고침)

3. 라우팅 설정 확인:
   - `src/routes/index.jsx` 파일 확인

### 문제: seller 대시보드가 보이지 않음

**원인:**
- seller 계정의 role이 SELLER가 아님
- 라우팅 설정 문제

**해결:**
1. 사용자 프로필 확인:
   ```bash
   # 로그인 후 개발자 도구 콘솔에서
   localStorage.getItem('accessToken')
   ```

2. 백엔드 로그 확인:
   ```bash
   grep "User logged in" /tmp/backend-startup.log
   ```

## 📞 문의

테스트 계정 관련 문제가 있으면 백엔드 로그를 확인하거나,
`DevDataSeed.java` 파일을 확인해주세요.

**파일 위치:**
```
/home/ubuntu/itdaing/src/main/java/com/da/itdaing/config/DevDataSeed.java
```

