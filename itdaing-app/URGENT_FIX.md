# 🚨 긴급 수정 가이드

## 현재 문제

**여전히 401 에러 발생**:
```
GET https://aischool-bastion-alb-xxx.elb.amazonaws.com/api/popups 401
Error: No refresh token
```

**원인**:
1. **HTTPS로 접속하고 있음** (SSL 인증서 불일치)
2. 브라우저 캐시 (이전 빌드)
3. ALB HTTP→HTTPS 자동 리디렉션

---

## ✅ 즉시 해결 방법

### 1. HTTP로 강제 접속 (가장 중요!)

**브라우저 주소창에 정확히 입력**:
```
http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

**주의**: `https://`가 아닌 `http://`로 시작!

---

### 2. AWS Console - ALB 리스너 수정 (필수!)

#### 현재 상태 (문제)
```
HTTP:80 → HTTPS:443으로 자동 리디렉션
HTTPS:443 → SSL 인증서 불일치 → CORS 에러 → 401
```

#### 수정 방법

**AWS Console → EC2 → Load Balancers → aischool-bastion-alb**:

1. **Listeners and rules** 탭 클릭
2. **HTTP:80** 리스너 선택
3. **Actions → Edit listener**
4. **Default actions** 섹션에서:
   ```
   현재: Redirect to HTTPS://#{host}:443/#{path}?#{query}
   변경: Forward to target groups
   Target group: private-tg 선택
   ```
5. **Save changes** 클릭

#### 수정 후
```
HTTP:80 → private-tg → Nginx → React App ✅
```

---

### 3. 브라우저 캐시 완전 삭제

#### Chrome/Edge

1. 개발자 도구 열기 (F12)
2. **Application** 탭
3. **Storage** 섹션:
   - Local Storage → 삭제
   - Session Storage → 삭제
   - IndexedDB → 삭제
   - Cookies → 삭제
4. **Clear site data** 클릭
5. 개발자 도구 닫기
6. 브라우저 주소창에 **http://**... 입력

#### 또는 시크릿 모드

```
Ctrl + Shift + N (Chrome/Edge)
Cmd + Shift + N (Mac)
```

시크릿 모드에서:
```
http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

---

## 🧪 테스트

### Backend 정상 작동 확인됨

```bash
$ curl http://localhost:8080/api/popups
{
    "success": true,
    "data": [
        {
            "id": 1681,
            "title": "트렌디 패션 팝업스토어",
            ...
        }
    ]
}  ✅
```

**Backend는 완벽하게 작동 중!**

문제는:
1. HTTPS 사용
2. 브라우저 캐시
3. ALB 리디렉션

---

## 🎯 즉시 실행

### STEP 1: ALB 리스너 수정 (AWS Console)
```
HTTP:80 리스너를 "Forward to target group"으로 변경
(리디렉션 제거)
```

### STEP 2: 브라우저 캐시 삭제
```
개발자 도구 → Application → Clear site data
```

### STEP 3: HTTP로 접속
```
http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

**순서대로 실행하시면 정상 작동합니다!** ✅

---

## 📊 예상 결과

```
✅ HomePage 정상 표시
✅ 팝업 목록 로드
✅ Kakao Map 정상 (도메인 등록 후)
✅ 모든 기능 작동
```

---

## 🔗 참고 문서

- `itdaing-app/docs/ALB_HTTP_ONLY_SETUP.md` - ALB HTTP 설정
- `itdaing-app/docs/KAKAO_DOMAIN_SETUP.md` - Kakao 도메인 설정
- `itdaing-app/FINAL_DEPLOYMENT_NOTES.md` - 배포 노트

