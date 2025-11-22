# Nginx 배포 가이드

## 📋 현재 상황

**EC2 정보**:
- Instance ID: ``
- Private IP: ``
- Public IP: **없음** (Private Subnet)
- Region: ap-northeast-2 (Seoul)

**도메인 문제**:
- 도메인: `aischool.daitdaing.link`
- 상태: **DNS_PROBE_FINISHED_NXDOMAIN** (DNS 레코드 없음)

---

## 🚨 문제 분석

### 1. EC2가 Private Subnet에 위치
- Public IP가 없음
- 인터넷에서 직접 접근 불가
- Load Balancer 또는 Bastion Host 필요

### 2. DNS 레코드 미설정
```bash
$ nslookup aischool.daitdaing.link
** server can't find aischool.daitdaing.link: NXDOMAIN

$ nslookup daitdaing.link
** server can't find daitdaing.link: NXDOMAIN
```

---

## ✅ 해결 방법

### 방법 1: Application Load Balancer 사용 (권장)

#### 1단계: ALB 생성
1. AWS Console → EC2 → Load Balancers
2. Create Load Balancer
3. Application Load Balancer 선택
4. **Internet-facing** 선택
5. **Public Subnet** 선택
6. Target Group에 Private EC2 추가 ()

#### 2단계: Route 53 설정
1. Route 53 → Hosted zones → daitdaing.link
2. Create record
   - Record name: `aischool`
   - Record type: `A` (Alias)
   - Route traffic to: `Alias to Application Load Balancer`
   - Select ALB

#### 3단계: Nginx 설정
```nginx
server {
    listen 80;
    server_name aischool.daitdaing.link;
    
    root /var/www/itdaing;
    index index.html;
    
    # ... (현재 설정 유지)
}
```

---

### 방법 2: Bastion Host + Elastic IP

**현재 구성**: Private VPC → Bastion Host를 통해 접속

#### 아키텍처
```
Internet
    ↓
Elastic IP (43.203.224.238)
    ↓
Bastion Host (Public Subnet)
    ↓
Private EC2 (10.0.5.175)
    ↓
RDS, Redis (Private)
```

**중요**: 
- ✅ Bastion Host에 Elastic IP 할당 (이미 설정됨)
- ❌ Private EC2에는 Elastic IP 할당 불가
- ✅ ALB를 사용하여 Private EC2를 Public으로 노출

---

### 방법 3: CloudFront + S3 (정적 사이트) - 권장!

SPA를 S3에 배포하고 CloudFront로 서빙하는 방법입니다.

#### 아키텍처
```
Internet → CloudFront → S3 (daitdaing-static-files/prod/)
                      ↓
Route 53: aischool.daitdaing.link → CloudFront
```

#### 1단계: S3 설정
```bash
# S3 정적 웹사이트 호스팅 활성화
cd /home/ubuntu/itdaing-app
./scripts/deploy-s3-setup.sh
```

#### 2단계: 빌드 및 S3 업로드
```bash
# 자동 배포 스크립트
cd /home/ubuntu/itdaing-app
./scripts/deploy-s3.sh
```

**배포 경로**: `s3://daitdaing-static-files/prod/`

#### 3단계: CloudFront Distribution 생성

**AWS Console → CloudFront → Create Distribution**

**Origin 설정**:
- Origin domain: `daitdaing-static-files.s3.ap-northeast-2.amazonaws.com`
- Origin path: `/prod`
- Origin access: `Public`

**Default cache behavior**:
- Viewer protocol policy: `Redirect HTTP to HTTPS`
- Allowed HTTP methods: `GET, HEAD, OPTIONS`
- Cache policy: `CachingOptimized`
- Origin request policy: `CORS-S3Origin`

**Settings**:
- Price class: `Use all edge locations`
- Alternate domain names (CNAMEs): `aischool.daitdaing.link`
- Custom SSL certificate: `*.daitdaing.link` (ACM에서 발급)

**Default root object**: `index.html`

**Custom error responses**:
- HTTP error code: `403` → Response page path: `/index.html` → HTTP response code: `200`
- HTTP error code: `404` → Response page path: `/index.html` → HTTP response code: `200`

#### 4단계: Route 53 설정
```
Record name: aischool
Record type: A (Alias)
Route traffic to: CloudFront distribution
Distribution: [생성한 CloudFront]
```

#### 5단계: API 별도 설정 (옵션)

CloudFront에서는 정적 파일만 서빙하고, API는 ALB로 분리:

```
aischool.daitdaing.link  → CloudFront → S3 (프론트엔드)
api.daitdaing.link       → ALB → Private EC2 (백엔드 API)
```

**프론트엔드 환경변수**:
```env
VITE_API_BASE_URL=https://api.daitdaing.link
```

---

## 🔧 현재 배포 상태

### ✅ 완료된 작업
- ✅ itdaing-app 빌드 완료 (`npm run build`)
- ✅ `/var/www/itdaing`에 배포 완료
- ✅ Nginx 설정 업데이트 (PWA 지원)
- ✅ Nginx 재로드 완료

### ⏳ 대기 중인 작업
- ⏳ **Route 53 DNS 레코드 생성** (가장 중요!)
- ⏳ **ALB 또는 Elastic IP 설정** (Public 접근 필요)
- ⏳ **SSL/TLS 인증서** (HTTPS)

---

## 📝 Route 53 설정 가이드

### 호스팅 영역 확인
```bash
# AWS CLI로 확인 (권한 필요)
aws route53 list-hosted-zones
```

### A 레코드 생성 (예시)

**daitdaing.link 호스팅 영역이 이미 있다면**:

1. Route 53 Console 접속
2. Hosted zones → `daitdaing.link` 선택
3. Create record 클릭
4. 설정:
   ```
   Record name: aischool
   Record type: A
   Alias: Yes
   Route traffic to: Application Load Balancer
   Region: ap-northeast-2
   Load balancer: [선택]
   ```

**호스팅 영역이 없다면**:

1. Route 53 → Hosted zones → Create hosted zone
2. Domain name: `daitdaing.link`
3. Type: Public hosted zone
4. 생성 후 Name Server를 도메인 등록 업체에 설정

---

## 🌐 도메인 구조 (권장)

```
daitdaing.link (메인 도메인)
├── www.daitdaing.link        → CloudFront or ALB
├── aischool.daitdaing.link   → ALB → Private EC2 (10.0.145.136)
├── api.daitdaing.link        → ALB → Backend (Port 8080)
└── admin.daitdaing.link      → 관리자 대시보드
```

---

## 🔍 DNS 문제 해결 체크리스트

- [ ] daitdaing.link 도메인 구매 완료 여부 확인
- [ ] Route 53 호스팅 영역 생성 확인
- [ ] 도메인 등록 업체에서 Name Server 설정 확인
- [ ] aischool.daitdaing.link A 레코드 생성
- [ ] ALB 또는 Elastic IP 설정
- [ ] DNS 전파 대기 (최대 48시간, 보통 5-30분)

---

## 🚀 즉시 테스트 (Public IP 없이)

Public IP가 없는 현재 상태에서는:

### 옵션 1: SSH Tunnel
```bash
# 로컬에서 SSH 터널 생성
ssh -L 3000:localhost:80 ubuntu@[bastion-host-ip]

# 브라우저에서
http://localhost:3000
```

### 옵션 2: Private IP로 직접 접근 (VPN 필요)
```
http://10.0.145.136
```

### 옵션 3: Bastion Host에서 테스트
```bash
curl http://10.0.145.136
```

---

## 📋 다음 단계

### 즉시 해결 (DNS 설정)

1. **Route 53 확인**
   - AWS Console → Route 53
   - Hosted zones에 `daitdaing.link` 있는지 확인
   
2. **A 레코드 생성**
   - Record name: `aischool`
   - Type: A (Alias to ALB)
   - 또는: A (Elastic IP)

3. **DNS 전파 확인**
   ```bash
   nslookup aischool.daitdaing.link
   dig aischool.daitdaing.link
   ```

### 장기 해결 (인프라)

1. **Application Load Balancer 생성**
   - Public Subnet에 ALB 배치
   - Target: Private EC2 (10.0.145.136)
   
2. **SSL/TLS 인증서 발급**
   - AWS Certificate Manager
   - Domain: `*.daitdaing.link`

3. **HTTPS 리디렉션**
   - Nginx에 SSL 설정 추가
   - HTTP → HTTPS 자동 리디렉션

---

## 📄 관련 파일

**현재 배포된 파일**:
- `/var/www/itdaing/` - itdaing-app 빌드 결과물
- `/etc/nginx/sites-available/itdaing.conf` - Nginx 설정
- `PWA 파일들`: favicon, manifest, sw.js

**배포 스크립트 필요 시**:
- [../UBUNTU_DEVELOPMENT_GUIDE.md](../UBUNTU_DEVELOPMENT_GUIDE.md)

