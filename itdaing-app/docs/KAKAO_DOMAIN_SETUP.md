# Kakao Developers 도메인 설정 가이드

## 🚨 Error Code: -200

**에러 발생 URL**:
```
https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com/
```

**원인**: Kakao Map JavaScript Key가 **도메인 제한**으로 차단됨

**해결**: Kakao Developers Console에서 도메인 등록 필요

---

## 📋 Kakao Developers 설정

### 1. Kakao Developers Console 접속

**URL**: https://developers.kakao.com

1. 로그인
2. **내 애플리케이션** 선택
3. 해당 앱 선택 (API 키: `56fe886b05a126e8d6dc491db5febff9`)

---

### 2. Web 플랫폼 설정

**앱 설정 → 플랫폼 → Web 플랫폼**

#### 사이트 도메인 추가:

```
http://localhost:3000
http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

**중요**: ALB DNS 전체를 복사하여 정확히 입력!

---

### 3. JavaScript 키 활성화 확인

**앱 설정 → 앱 키**

- JavaScript 키: `56fe886b05a126e8d6dc491db5febff9`
- 상태: **활성화** 확인

---

### 4. 도메인 검증 대기

설정 저장 후:
- **즉시 적용**: 1-5분
- 브라우저 캐시 삭제 후 재접속

---

## 🔧 설정 후 테스트

### 브라우저 새로고침

```
Ctrl + Shift + R (하드 리프레시)
```

### 예상 결과

```javascript
// Console 로그
[KakaoMapKey] Loaded key from environment ✅
Kakao Map SDK 로드 성공 ✅
```

**Error Code: -200 사라짐!** ✅

---

## 📊 Kakao Developers 도메인 설정 스크린샷 예시

```
[Web 플랫폼]
사이트 도메인:
┌─────────────────────────────────────────────────────────┐
│ http://localhost:3000                                    │
│ http://aischool-bastion-alb-1858295846.ap-northeast-... │
│ https://aischool-bastion-alb-1858295846.ap-northeast-...│
└─────────────────────────────────────────────────────────┘

[저장]
```

---

## 🚨 주의사항

### JavaScript Key 보안

**도메인 제한의 중요성**:
- ✅ 등록된 도메인에서만 작동
- ❌ 다른 도메인에서 키를 복사해도 무용지물
- ✅ 브라우저에 노출되어도 안전

**이것이 Kakao의 정상적인 보안 정책입니다!**

---

## 🔗 향후 도메인 변경 시

새 도메인 구매 후:
1. Kakao Developers에 새 도메인 추가
2. Frontend 재빌드 불필요 (동적 로딩)
3. 즉시 작동

---

## 📞 확인 사항

**Kakao Developers Console에서**:
1. 내 애플리케이션 → 앱 선택
2. 플랫폼 → Web 플랫폼
3. 사이트 도메인에 ALB DNS 등록되어 있나요?

**등록되어 있지 않다면** → 지금 바로 등록하세요!

설정 후 1-5분 내에 Error Code: -200이 해결됩니다!

