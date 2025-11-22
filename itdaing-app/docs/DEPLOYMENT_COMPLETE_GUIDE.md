# aischool.daitdaing.link 배포 완전 가이드

## 📋 현재 상황 (2025-11-22)

### ✅ 완료된 작업
- ✅ 도메인 구매: `daitdaing.link`
- ✅ ACM SSL 인증서 발급: `*.daitdaing.link`
- ✅ Route 53 A 레코드 생성: `aischool.daitdaing.link`
- ✅ itdaing-app 빌드 완료
- ✅ S3 배포 스크립트 준비

### ⏳ 진행 중
- ⏳ DNS 전파 대기 (aischool.daitdaing.link)
- ⏳ ALB 또는 CloudFront 설정 (아직 확인 안됨)

---

## 🏗️ 인프라 구성

### 현재 아키텍처

```
Internet
    ↓
Elastic IP: 43.203.224.238
    ↓
Bastion Host (Public Subnet)
    ↓ SSH
Private EC2: 10.0.145.136 (itdaing-test)
    ├─ Nginx (Port 80)
    ├─ Spring Boot (Port 8080)
    └─ Redis (Port 6379)
    ↓
AWS RDS PostgreSQL (Private)
```

### SSH 접속 정보

```ssh
# Bastion Host
HostName: 3.34.159.33 (Elastic IP: 43.203.224.238?)
User: ubuntu

# Private EC2 (itdaing-test)
HostName: 10.0.145.136
User: ubuntu
ProxyJump: bastion
```

---

## 🚀 배포 방법 선택

### 방법 1: Application Load Balancer (추천 - Backend + Frontend)

**장점**:
- Private EC2를 그대로 사용
- Backend API와 Frontend 모두 서빙
- Health Check 자동

**단계**:

#### 1. ALB 생성
```
AWS Console → EC2 → Load Balancers → Create

Type: Application Load Balancer
Name: itdaing-alb
Scheme: Internet-facing ⚠️
Subnets: Public Subnet 2개 이상 선택

Security Group:
- Inbound: HTTP (80), HTTPS (443) from 0.0.0.0/0
- Outbound: All traffic

Listeners:
- HTTP:80 → Target Group
- HTTPS:443 → Target Group (SSL: *.daitdaing.link)
```

#### 2. Target Group 생성
```
Name: itdaing-tg
Target type: Instances
Protocol: HTTP
Port: 80
Health check path: /

Targets: Private EC2 (10.0.145.136)
```

#### 3. Route 53 설정 확인
```
Type: A
Name: aischool.daitdaing.link
Alias: Yes
Route traffic to: ALB (itdaing-alb)
```

#### 4. DNS 전파 확인
```bash
# 5-30분 대기 후
nslookup aischool.daitdaing.link
# 응답: ALB DNS 이름

# 접속 테스트
curl https://aischool.daitdaing.link/actuator/health
```

---

### 방법 2: CloudFront + S3 (추천 - Frontend만)

**장점**:
- 빠른 CDN
- 저렴한 비용
- 글로벌 배포

**단계**:

#### 1. S3 설정 및 배포
```bash
cd /home/ubuntu/itdaing-app

# S3 초기 설정 (최초 1회)
./scripts/deploy-s3-setup.sh

# 빌드 및 배포
./scripts/deploy-s3.sh
```

**배포 경로**: `s3://daitdaing-static-files/prod/`

#### 2. CloudFront Distribution 생성

**AWS Console → CloudFront → Create Distribution**

**Origin**:
- Origin domain: `daitdaing-static-files.s3.ap-northeast-2.amazonaws.com`
- Origin path: `/prod`
- Origin access: `Public`

**Default cache behavior**:
- Viewer protocol policy: `Redirect HTTP to HTTPS`
- Allowed HTTP methods: `GET, HEAD, OPTIONS`
- Cache policy: `CachingOptimized`

**Settings**:
- Alternate domain names (CNAMEs): `aischool.daitdaing.link`
- Custom SSL certificate: `*.daitdaing.link` (ACM 인증서 선택)
- Default root object: `index.html`

**Custom error responses** (SPA용):
- 403 → /index.html (200)
- 404 → /index.html (200)

#### 3. Route 53 설정 확인
```
Type: A
Name: aischool.daitdaing.link
Alias: Yes
Route traffic to: CloudFront distribution
```

#### 4. Backend API 별도 설정

**Frontend**: `https://aischool.daitdaing.link` (CloudFront → S3)  
**Backend API**: `https://api.daitdaing.link` (ALB → Private EC2)

**ALB for API**:
- Name: itdaing-api-alb
- Listener: HTTPS:443
- Certificate: *.daitdaing.link
- Target: Private EC2 (10.0.145.136:8080)

**프론트엔드 환경변수** (빌드 전 설정):
```env
VITE_API_BASE_URL=https://api.daitdaing.link
```

---

## 🔍 현재 상태 진단

### DNS 전파 확인
```bash
# 계속 확인
watch -n 5 'nslookup aischool.daitdaing.link'

# 또는
dig aischool.daitdaing.link @8.8.8.8
```

### Route 53 설정 확인 (AWS Console)

1. Route 53 → Hosted zones → daitdaing.link
2. aischool 레코드 확인:
   - Type: A (Alias) 또는 CNAME
   - Value: ALB DNS 또는 CloudFront DNS

---

## 🎯 추천 배포 전략

### 최종 아키텍처 (권장)

```
Internet
    ↓
Route 53: aischool.daitdaing.link
    ├─ (Frontend) → CloudFront → S3 (정적 파일)
    └─ (API) → ALB → Private EC2:8080 (Spring Boot)

Private VPC:
├─ Private EC2 (10.0.145.136)
│   ├─ Nginx (Port 80) - 사용 안함
│   └─ Spring Boot (Port 8080)
├─ RDS PostgreSQL
└─ Redis
```

### CloudFront에서 API 프록시 (단일 도메인)

CloudFront에서 `/api/*` 경로만 ALB로 전달:

**CloudFront Behaviors**:
1. `/api/*` → Origin: ALB (Cache disabled)
2. `/*` → Origin: S3 (Cache enabled)

**장점**: 단일 도메인으로 Frontend + Backend 서빙

---

## 📝 즉시 실행 가능한 명령어

### S3 배포 (지금 바로!)

```bash
cd /home/ubuntu/itdaing-app

# 1. S3 초기 설정 (최초 1회)
./scripts/deploy-s3-setup.sh

# 2. 빌드 및 S3 업로드
./scripts/deploy-s3.sh

# 3. S3 웹사이트 URL 확인
echo "http://daitdaing-static-files.s3-website-ap-northeast-2.amazonaws.com/prod/"
```

### 임시 접속 (SSH Tunnel)

DNS 전파 전에 테스트:

```bash
# 로컬 PC에서 실행
ssh -L 8080:10.0.145.136:80 ubuntu@3.34.159.33

# 브라우저에서
http://localhost:8080
```

---

## 🔧 DNS 전파 문제 해결

### 1. Route 53 레코드 확인

**AWS Console → Route 53 → Hosted zones → daitdaing.link**

aischool 레코드 확인:
- [ ] Record type: A (Alias)
- [ ] Alias target: ALB 또는 CloudFront
- [ ] Routing policy: Simple
- [ ] Evaluate target health: Yes

### 2. Name Server 확인

```bash
dig daitdaing.link NS

# 도메인 등록 업체의 Name Server와 일치하는지 확인
```

### 3. DNS 전파 확인 사이트

- https://www.whatsmydns.net/#A/aischool.daitdaing.link
- https://dnschecker.org/#A/aischool.daitdaing.link

---

## 📊 배포 체크리스트

### CloudFront + S3 배포 (권장)

- [x] 도메인 구매 (daitdaing.link)
- [x] ACM 인증서 (*.daitdaing.link)
- [x] S3 버킷 (daitdaing-static-files)
- [ ] S3 웹사이트 호스팅 활성화 → `./scripts/deploy-s3-setup.sh`
- [ ] 빌드 파일 S3 업로드 → `./scripts/deploy-s3.sh`
- [ ] CloudFront Distribution 생성
- [ ] Route 53 A 레코드 → CloudFront
- [ ] DNS 전파 대기 (5-30분)
- [ ] https://aischool.daitdaing.link 접속 테스트

### ALB 배포

- [x] 도메인 구매 (daitdaing.link)
- [x] ACM 인증서 (*.daitdaing.link)
- [ ] Public Subnet 2개 확인
- [ ] ALB 생성 (Internet-facing)
- [ ] Target Group 생성 (Private EC2:80)
- [ ] Route 53 A 레코드 → ALB
- [ ] DNS 전파 대기
- [ ] https://aischool.daitdaing.link 접속 테스트

---

## 🚨 주의사항

### Bastion Host에 Elastic IP

- ✅ **올바른 구성**: Bastion만 Elastic IP 필요
- ✅ **Private EC2**: Elastic IP 불필요 (ALB 또는 CloudFront 사용)

### Route 53 설정

DNS가 전파되지 않는 경우:
1. Route 53 레코드가 올바른 리소스를 가리키는지 확인
2. ALB 또는 CloudFront가 실제로 생성되어 있는지 확인
3. Name Server가 도메인 등록 업체에 설정되어 있는지 확인

---

## 📞 문의/지원

Route 53 설정이 완료되었는데 DNS가 전파되지 않으면:
- Route 53 Console에서 aischool 레코드의 Value 확인
- ALB DNS 또는 CloudFront DNS가 올바른지 확인
- DNS 전파 상태 확인: https://www.whatsmydns.net/

