# ALB HTTP 전용 설정 가이드

## 🚨 현재 문제

**ALB 리스너 설정**:
- HTTP:80 → **HTTPS:443으로 자동 리디렉션** ❌
- HTTPS:443 → SSL 인증서: `*.daitdaing.link`
- ALB DNS: `aischool-bastion-alb-xxx.elb.amazonaws.com`

**문제**:
```
SSL 인증서 도메인 불일치
→ HTTPS 접속 시 SSL 경고
→ Service Worker 에러
→ 브라우저 보안 제한
```

---

## ✅ 해결 방법: HTTP:80 리스너 수정

### AWS Console에서 수정

**EC2 → Load Balancers → aischool-bastion-alb**

#### STEP 1: HTTP:80 리스너 수정

**Listeners and rules 탭**:
1. **HTTP:80** 리스너 선택
2. **Actions → Edit listener**
3. **Default action** 변경:
   ```
   AS-IS: Redirect to HTTPS:443
   TO-BE: Forward to target group (private-tg)
   ```
4. **Save changes**

#### STEP 2: HTTPS:443 리스너 삭제 (선택)

당분간 HTTP만 사용하는 경우:
1. **HTTPS:443** 리스너 선택
2. **Actions → Delete listener**
3. 확인

---

## 🔧 설정 후 결과

### HTTP만 사용
```
http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
→ HTTP:80 리스너
→ private-tg (Target Group)
→ Private EC2:80 (Nginx)
→ React App ✅
```

**장점**:
- ✅ SSL 인증서 문제 없음
- ✅ Service Worker 정상 작동 (HTTP는 localhost와 동일하게 허용)
- ✅ 브라우저 경고 없음
- ✅ 개발/테스트 용이

**단점**:
- ⚠️ HTTPS 미지원 (보안 낮음)
- ⚠️ 프로덕션 사용 부적합

---

## 🌐 향후 도메인 구매 후

### 새 도메인 구매 시 (예: itdaing.site)

1. **Route 53 호스팅 영역 생성**
   ```
   Domain: itdaing.site
   ```

2. **ACM 인증서 재발급**
   ```
   Domain: *.itdaing.site
   Validation: DNS
   ```

3. **ALB HTTPS:443 리스너 재생성**
   ```
   Protocol: HTTPS
   Port: 443
   Certificate: *.itdaing.site
   Default action: Forward to private-tg
   ```

4. **HTTP:80 리스너 재설정**
   ```
   Redirect to HTTPS:443
   ```

5. **Route 53 A 레코드**
   ```
   app.itdaing.site → ALB
   ```

6. **결과**:
   ```
   https://app.itdaing.site
   → HTTPS:443 (SSL 정상)
   → private-tg
   → React App ✅ (Service Worker 포함)
   ```

---

## 📋 요약

### 현재 (임시)
```
HTTP만 사용
http://aischool-bastion-alb-xxx.elb.amazonaws.com
```

**설정**:
- HTTP:80 → Forward to private-tg (리디렉션 제거)
- HTTPS:443 → 삭제 (선택)

### 향후 (프로덕션)
```
HTTPS 사용
https://app.itdaing.site
```

**설정**:
- 새 도메인 + 새 SSL 인증서
- HTTP:80 → Redirect to HTTPS:443
- HTTPS:443 → Forward to private-tg

---

## 🎯 즉시 실행

**AWS Console → EC2 → Load Balancers → aischool-bastion-alb**:
1. Listeners 탭
2. HTTP:80 선택 → Edit listener
3. Default action: **Forward to private-tg** (리디렉션 제거)
4. Save

**5분 후 테스트**:
```
http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
→ HTTP만 사용 ✅
→ SSL 경고 없음 ✅
```

