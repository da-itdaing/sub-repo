# Kakao Map API 키 보안 가이드

## 🔒 보안 정책

### Kakao Map JavaScript API 키

**특징**:
- JavaScript Key는 **브라우저에서 노출됨** (숨길 수 없음)
- **도메인 기반 보호** 제공

### 도메인 제한 설정 (필수!)

**Kakao Developers Console** (https://developers.kakao.com):

1. 내 애플리케이션 선택
2. 플랫폼 → Web 플랫폼 등록
3. **사이트 도메인** 추가:
   ```
   https://aischool.daitdaing.link
   http://localhost:3000 (개발용)
   ```

4. JavaScript 키 → 플랫폼 설정에서 활성화

**설정 후**:
- ✅ 등록된 도메인에서만 API 키 사용 가능
- ❌ 다른 도메인에서 복사해도 작동 안함
- ✅ 키가 노출되어도 안전함

---

## 🔧 현재 구현

### Backend: ConfigController.java

```java
@GetMapping("/api/config/map-key")
public ResponseEntity<ApiResponse<MapKeyResponse>> getMapKey() {
    if (!StringUtils.hasText(kakaoMapAppKey)) {
        throw new IllegalStateException("KAKAO_MAP_APP_KEY is not configured");
    }
    
    // JavaScript Key는 도메인 제한으로 보호되므로 그대로 반환
    return ResponseEntity.ok(ApiResponse.success(new MapKeyResponse(kakaoMapAppKey)));
}
```

**보안 고려사항**:
- ✅ 환경변수에서 로드 (`KAKAO_MAP_APP_KEY`)
- ✅ 도메인 제한으로 보호
- ✅ Git에 커밋 안됨 (`.gitignore`)

---

## 🚨 현재 문제

### Backend 500 에러
```bash
$ curl http://localhost:8080/api/config/kakao-map-key
{"success":false,"error":{"status":500,"code":"E999","message":"서버 내부 오류가 발생했습니다"}}
```

**원인 분석**:
- ❌ 엔드포인트 경로 불일치: `/api/config/kakao-map-key` vs `/api/config/map-key`
- ✅ 환경변수 로드: `KAKAO_MAP_APP_KEY=95c50c02952121a082de072da2530448`

**해결**:
1. 엔드포인트 경로 확인
2. Frontend에서 올바른 경로 사용

---

## 🔄 대안 방법

### 옵션 1: Frontend 환경변수 직접 사용 (권장)

**장점**:
- Backend 의존성 제거
- 빠른 로딩
- 도메인 제한으로 안전

**설정**:
```bash
# .env 파일 생성
cd /home/ubuntu/itdaing-app
cat > .env << 'EOF'
VITE_KAKAO_MAP_KEY=95c50c02952121a082de072da2530448
EOF

# 재빌드
npm run build

# 재배포
sudo cp -r dist/* /var/www/itdaing/
```

**Frontend 코드 수정**:
```javascript
// src/utils/kakaoMapLoader.js
const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;
```

### 옵션 2: Backend 엔드포인트 유지

**현재 코드 그대로 사용** (도메인 제한으로 보호됨)

**Frontend에서 올바른 경로 호출**:
```javascript
// /api/config/map-key (올바른 경로)
const response = await axios.get('/api/config/map-key');
```

---

## 📝 Kakao Developers 설정

### 1. 애플리케이션 설정

**Kakao Developers Console**:
1. 내 애플리케이션 → 앱 선택
2. 플랫폼 → Web 플랫폼 등록

### 2. 사이트 도메인 등록

**추가할 도메인**:
```
https://aischool.daitdaing.link
http://localhost:3000
https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

### 3. JavaScript 키 활성화

**설정 → 일반**:
- JavaScript 키 활성화
- 플랫폼 설정에서 Web 플랫폼 활성화

---

## ✅ 권장 사항

### 단기 (지금 당장)

**Frontend 환경변수 사용**:
- `.env` 파일에 `VITE_KAKAO_MAP_KEY` 설정
- Backend 호출 제거
- 재빌드 및 배포

### 장기 (보안 강화)

**Backend Proxy 구현**:
- Frontend → Backend → Kakao API
- Backend에서 키 숨김
- Backend에서 도메인 검증

**하지만**: JavaScript Key는 원래 노출되어도 괜찮습니다!
- 도메인 제한으로 충분히 안전
- Kakao 공식 권장 방식

---

## 🎯 결론

**JavaScript API 키는 노출되어도 안전합니다**:
- ✅ 도메인 제한으로 보호
- ✅ 브라우저에서만 작동
- ✅ Kakao Developers에서 사용량 모니터링

**중요**:
- Kakao Developers Console에서 **도메인 제한 설정** 필수
- REST API 키 (Server용)는 절대 노출하면 안됨!

---

## 📚 참고

- [Kakao Developers - JavaScript SDK](https://apis.map.kakao.com/web/)
- [Kakao 인증 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/app)

