# 배포 현황 (2025-11-22)

## ✅ 완료된 작업

### 인프라
- ✅ **도메인 구매**: daitdaing.link
- ✅ **ACM SSL 인증서**: *.daitdaing.link (발급 완료)
- ✅ **VPC 구성**: aischool-project-vpc
- ✅ **Public Subnet**: 2개 (ap-northeast-2a, 2b)
- ✅ **Private Subnet**: 2개 (ap-northeast-2a, 2b)
- ✅ **Application Load Balancer**: aischool-bastion-alb
  - Scheme: Internet-facing
  - Listeners: HTTP:80, HTTPS:443
  - Certificate: *.daitdaing.link 연결됨
- ✅ **Target Group**: private-tg
  - Protocol: HTTP:80
  - Registered Targets: 2개
    - itdaing-test (Healthy) ✅
    - private2-ec2 (Unused - Stopped)

### 애플리케이션
- ✅ **itdaing-app 빌드 완료**
- ✅ **PWA 파일 추가** (favicon, manifest, service worker)
- ✅ **Nginx 설정 완료** (server_name: aischool.daitdaing.link)
- ✅ **/var/www/itdaing 배포 완료**

### DNS
- ✅ **Route 53 호스팅 영역**: daitdaing.link
- ✅ **Route 53 A 레코드**: aischool.daitdaing.link → ALB

---

## ⏳ 현재 상태

### DNS 전파 대기 중

```bash
$ nslookup aischool.daitdaing.link
** server can't find aischool.daitdaing.link: NXDOMAIN
```

**원인**: DNS 전파 진행 중 (일반적으로 5-30분 소요)

### ALB 상태: Active ✅

**ALB 정보**:
- Name: aischool-bastion-alb
- DNS: aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
- Status: Active
- Listeners:
  - HTTP:80 → Redirect to HTTPS:443
  - HTTPS:443 → private-tg (SSL: *.daitdaing.link)

**Target Group**:
- Name: private-tg
- Health status:
  - ✅ itdaing-test (Healthy)
  - ⚠️ private2-ec2 (Stopped)

---

## 🔍 현재 문제 및 해결 상황

### 문제 1: DNS_PROBE_FINISHED_NXDOMAIN ⏳

**상태**: DNS 레코드가 전파되지 않음

**AWS 리소스 확인 결과**:
- ✅ ALB: aischool-bastion-alb (Active)
- ✅ ALB DNS: aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
- ✅ HTTPS:443 Listener (SSL: *.daitdaing.link)
- ✅ Route 53 A 레코드: aischool.daitdaing.link → ALB

**원인**: DNS 전파 진행 중 (정상)

**해결 방법**:
1. **DNS 전파 대기** (5-30분, 최대 48시간)
   ```bash
   # 계속 확인
   watch -n 10 'dig aischool.daitdaing.link +short'
   
   # 또는 온라인 도구
   # https://www.whatsmydns.net/#A/aischool.daitdaing.link
   ```

2. **Route 53 Name Server 확인**
   ```bash
   dig daitdaing.link NS
   
   # 도메인 등록 업체(가비아, 후이즈 등)에서
   # Name Server 설정이 Route 53 NS와 일치하는지 확인
   ```

3. **전파 완료 후 예상 응답**:
   ```bash
   $ dig aischool.daitdaing.link +short
   54.xxx.xxx.xxx  # ALB의 Public IP
   ```

### 문제 2: private2-ec2 (Unused) - 정리 필요

**상태**: Target Group에 Stopped 인스턴스가 등록됨

**영향**: 
- 현재 영향 없음 (Healthy target이 있음)
- Health check overhead 발생

**해결 방법**:
```
AWS Console → EC2 → Target Groups → private-tg
→ Targets 탭 → private2-ec2 선택 → Deregister
```

### 문제 3: ALB Health Check 경로 확인 필요

**현재 상태**:
- itdaing-test: Healthy ✅
- Health check path: `/` (추정)

**확인 필요**:
```
AWS Console → EC2 → Target Groups → private-tg
→ Health checks 탭
→ Health check path: / 또는 /actuator/health 확인
```

**권장**:
- Health check path: `/` (React App root)
- Healthy threshold: 2
- Unhealthy threshold: 2
- Timeout: 5초
- Interval: 30초
- Success codes: 200

---

## 🧪 테스트 시나리오

### 시나리오 1: ALB DNS로 직접 접속 (DNS 전파 전)

```bash
# 터미널에서
curl -I https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com

# 예상 결과
HTTP/2 200
server: nginx/1.24.0 (Ubuntu)
content-type: text/html
```

**브라우저 테스트**:
1. https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com 접속
2. React App이 정상 표시되는지 확인
3. API 호출 확인 (Network 탭)

### 시나리오 2: DNS 전파 후

```bash
# DNS 확인
nslookup aischool.daitdaing.link

# HTTPS 접속
curl -I https://aischool.daitdaing.link

# 브라우저
https://aischool.daitdaing.link
```

---

## 🎯 즉시 실행 (ALB DNS 테스트)

```bash
# 1. ALB로 HTTP 요청 (자동 HTTPS 리디렉션)
curl -L -I http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com

# 2. HTTPS 요청
curl -I https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com

# 3. HTML 응답 확인
curl https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com | head -30
```

**브라우저에서 테스트**:
```
https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

이 URL이 정상 작동하면, DNS 전파 후 https://aischool.daitdaing.link도 동일하게 작동합니다!

---

## 🚀 즉시 테스트 가능

### 1. ALB DNS로 직접 접속

```bash
# HTTP (자동 HTTPS 리디렉션)
curl -L http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com

# HTTPS
curl https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

브라우저에서:
- http://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com

### 2. SSH Tunnel (로컬 PC)

```bash
# 로컬 PC에서
ssh -L 8080:10.0.145.136:80 ubuntu@3.34.159.33

# 브라우저
http://localhost:8080
```

---

## 📊 DNS 전파 확인 방법

### 방법 1: nslookup (계속 확인)

```bash
watch -n 10 'nslookup aischool.daitdaing.link'
```

### 방법 2: dig (Google DNS)

```bash
dig aischool.daitdaing.link @8.8.8.8
```

### 방법 3: 온라인 도구

- https://www.whatsmydns.net/#A/aischool.daitdaing.link
- https://dnschecker.org/#A/aischool.daitdaing.link

---

## 🎯 예상 결과

### DNS 전파 후

```bash
$ nslookup aischool.daitdaing.link
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	aischool.daitdaing.link
Address: 54.xxx.xxx.xxx (ALB IP)
```

### 브라우저 접속

```
https://aischool.daitdaing.link
→ ALB (HTTPS:443)
→ Target Group (HTTP:80)
→ Private EC2 (10.0.145.136:80)
→ Nginx
→ React App (itdaing-app)
```

---

## 📝 배포 완료 체크리스트

- [x] 도메인 구매 (daitdaing.link)
- [x] ACM SSL 인증서 (*.daitdaing.link)
- [x] VPC 및 Subnet 구성
- [x] ALB 생성 (aischool-bastion-alb)
- [x] Target Group 생성 (private-tg)
- [x] EC2를 Target Group에 등록
- [x] HTTPS:443 리스너 설정
- [x] SSL 인증서 연결
- [x] Route 53 A 레코드 생성
- [ ] DNS 전파 확인 ← **현재 대기 중**
- [ ] https://aischool.daitdaing.link 접속 테스트

---

## ⏰ 예상 타임라인

- **현재**: DNS 전파 대기
- **5-30분 후**: DNS 전파 완료 예상
- **접속 가능**: https://aischool.daitdaing.link

---

## 🔧 문제 발생 시

### DNS가 24시간 이상 전파되지 않음

1. **Route 53 레코드 확인**
   - AWS Console → Route 53
   - aischool 레코드 Value 확인

2. **ALB Health Check 확인**
   - Target Group의 Health status
   - itdaing-test가 Healthy인지 확인

3. **Name Server 확인**
   - 도메인 등록 업체 설정 확인
   - Route 53 Name Server와 일치하는지 확인

---

## 📚 관련 문서

- [UBUNTU_DEVELOPMENT_GUIDE.md](../UBUNTU_DEVELOPMENT_GUIDE.md) - Ubuntu 개발 환경
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) - 테스트 계정

**참고**: 배포 스크립트 및 상세 가이드는 보안상 gitignore에 추가됨

