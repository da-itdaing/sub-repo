# Gitmoji 커밋 컨벤션

## 📋 커밋 메시지 형식

```
[gitmoji] [타입]: [한글 설명]
```

**필수 규칙**:
- ✅ Gitmoji 사용 필수
- ✅ 한글 커밋 메시지 (주요 키워드만 영어 허용)
- ✅ 구체적이고 명확한 설명

---

## 🎨 주요 Gitmoji

### 기능 개발
- ✨ **기능**: 새로운 기능 추가
  ```bash
  git commit -m "✨ 기능: Kakao Map 연동 및 마커 클러스터링"
  ```

- 💄 **스타일**: UI/스타일 수정
  ```bash
  git commit -m "💄 스타일: 메인 페이지 반응형 레이아웃 개선"
  ```

### 버그 수정
- 🐛 **버그**: 버그 수정
  ```bash
  git commit -m "🐛 버그: 로그인 시 토큰 저장 안되는 문제 수정"
  ```

- 🚑 **긴급**: 치명적인 버그 핫픽스
  ```bash
  git commit -m "🚑 긴급: 프로덕션 서버 다운 문제 수정"
  ```

### 문서
- 📝 **문서**: 문서 추가/수정
  ```bash
  git commit -m "📝 문서: Redis 통합 및 데이터 흐름 설명 추가"
  ```

### 코드 품질
- ♻️ **리팩토링**: 코드 리팩터링
  ```bash
  git commit -m "♻️ 리팩토링: 중복 코드 제거 및 hooks 분리"
  ```

- ⚡️ **성능**: 성능 개선
  ```bash
  git commit -m "⚡️ 성능: React Query 캐싱 전략 최적화"
  ```

- 🎨 **구조**: 코드 구조/형식 개선
  ```bash
  git commit -m "🎨 구조: 컴포넌트 폴더 구조 재정리"
  ```

### 테스트
- ✅ **테스트**: 테스트 추가/수정
  ```bash
  git commit -m "✅ 테스트: 팝업 API 유닛 테스트 추가"
  ```

### 설정 & 도구
- 🔧 **설정**: 설정 파일 수정
  ```bash
  git commit -m "🔧 설정: Vite proxy 설정 추가"
  ```

- 🙈 **gitignore**: .gitignore 수정
  ```bash
  git commit -m "🙈 gitignore: .cursor 폴더 제외"
  ```

- 📦 **의존성**: package.json 업데이트
  ```bash
  git commit -m "📦 의존성: React Query v5 업그레이드"
  ```

### 배포 & CI/CD
- 🚀 **배포**: 배포 관련
  ```bash
  git commit -m "🚀 배포: 프로덕션 환경 설정 추가"
  ```

- 👷 **CI**: CI/CD 빌드 시스템 수정
  ```bash
  git commit -m "👷 CI: GitHub Actions 워크플로우 추가"
  ```

### 보안
- 🔒 **보안**: 보안 관련 수정
  ```bash
  git commit -m "🔒 보안: JWT 토큰 갱신 로직 강화"
  ```

### 데이터베이스
- 🗃️ **DB**: 데이터베이스 관련
  ```bash
  git commit -m "🗃️ DB: 팝업 테이블 인덱스 추가"
  ```

---

## ✅ 올바른 예시

```bash
✅ git commit -m "✨ 기능: 팝업 찜하기 기능 구현"
✅ git commit -m "🐛 버그: Redis 연결 실패 시 재시도 로직 추가"
✅ git commit -m "📝 문서: API 엔드포인트 문서화"
✅ git commit -m "💄 스타일: Consumer App 메인 페이지 UI 개선"
✅ git commit -m "♻️ 리팩토링: API 클라이언트 Axios 인터셉터 분리"
✅ git commit -m "⚡️ 성능: 팝업 목록 조회 쿼리 최적화"
✅ git commit -m "🔧 설정: Tailwind CSS v4 설정 추가"
```

---

## ❌ 잘못된 예시

```bash
❌ git commit -m "add kakao map feature"
   → Gitmoji 없음, 영어

❌ git commit -m "fix bug"
   → 구체적이지 않음

❌ git commit -m "✨ feat: add new feature"
   → 영어 사용

❌ git commit -m "update"
   → 너무 모호함

❌ git commit -m "여러 기능 추가"
   → Gitmoji 없음, 구체적이지 않음
```

---

## 📏 커밋 메시지 작성 가이드

### 1. 제목 (필수)
- 50자 이내 권장
- 명령형으로 작성 ("추가함" ❌, "추가" ✅)
- 마침표 없이 작성

### 2. 본문 (선택)
복잡한 변경사항은 본문에 상세 설명:

```bash
git commit -m "✨ 기능: 팝업 상세 페이지 구현

- 팝업 정보 표시 (제목, 위치, 날짜, 운영시간)
- 이미지 갤러리 (슬라이드)
- 리뷰 목록 및 평점
- 찜하기 기능 연동
- Kakao Map 위치 표시

Closes #123"
```

### 3. Footer (선택)
이슈 번호 참조:

```bash
Closes #123
Fixes #456
Related to #789
```

---

## 🔍 커밋 전 체크리스트

- [ ] Gitmoji 포함
- [ ] 한글로 작성 (키워드만 영어 허용)
- [ ] 구체적인 변경사항 명시
- [ ] 50자 이내 (본문 제외)
- [ ] 테스트 완료 (해당되는 경우)
- [ ] Linter 에러 없음

---

## 📚 관련 문서

- [Gitmoji 공식 사이트](https://gitmoji.dev/)
- [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) - 브랜치 전략
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 개발 환경 가이드

