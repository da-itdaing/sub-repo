# DNS 설정 가이드

## 🚨 현재 문제

```
aischool.daitdaing.link → DNS_PROBE_FINISHED_NXDOMAIN
```

**원인**: DNS 레코드가 설정되지 않음

---

## 📋 해결 방법

### 1단계: 도메인 소유 확인

#### daitdaing.link 도메인을 이미 소유하고 있는 경우

Route 53에서 호스팅 영역을 확인하세요:

1. AWS Console → Route 53 → Hosted zones
2. `daitdaing.link` 검색
3. 호스팅 영역이 있으면 → **2단계**로 이동
4. 호스팅 영역이 없으면 → **아래 호스팅 영역 생성** 참고

#### 도메인을 소유하지 않은 경우

**옵션 A**: 새 도메인 구매
- Route 53 → Registered domains → Register domain
- 또는 외부 도메인 등록 업체 (GoDaddy, Namecheap 등)

**옵션 B**: 기존 도메인 사용
- 다른 서브도메인 사용 (예: `test.yourdomain.com`)

---

### 2단계: Route 53 호스팅 영역 생성 (없는 경우만)

```bash
# AWS CLI로 생성
aws route53 create-hosted-zone \
  --name daitdaing.link \
  --caller-reference $(date +%s) \
  --hosted-zone-config Comment="Itdaing 프로젝트"
```

**또는 AWS Console에서**:
1. Route 53 → Hosted zones → Create hosted zone
2. Domain name: `daitdaing.link`
3. Type: `Public hosted zone`
4. Create hosted zone

**중요**: 생성 후 Name Server 4개를 도메인 등록 업체에 설정해야 합니다.

---

### 3단계: Application Load Balancer 생성 (Private EC2용)

현재 EC2는 **Private Subnet**에 있으므로 ALB가 필요합니다.

#### ALB 생성

1. **EC2 Console → Load Balancers → Create Load Balancer**

2. **Application Load Balancer 선택**

3. **기본 설정**:
   - Name: `itdaing-alb`
   - Scheme: `Internet-facing` ⚠️ 중요!
   - IP address type: `IPv4`

4. **Network mapping**:
   - VPC: 현재 EC2와 동일한 VPC
   - Subnets: **Public Subnet 2개 이상** 선택 ⚠️
     - ap-northeast-2a (Public)
     - ap-northeast-2c (Public)

5. **Security groups**:
   - 새 Security Group 생성:
     - Inbound: HTTP (80), HTTPS (443) from 0.0.0.0/0
     - Outbound: All traffic

6. **Listeners and routing**:
   - Protocol: HTTP
   - Port: 80
   - Default action: Forward to... (새 Target Group 생성)

7. **Target Group 생성**:
   - Target type: `Instances`
   - Target Group name: `itdaing-tg`
   - Protocol: HTTP
   - Port: 80
   - Health check path: `/`
   - Register targets: EC2 인스턴스 `i-0f3c3ae4ce27bb373` 선택

8. **Create load balancer**

#### ALB DNS 이름 확인
```
itdaing-alb-123456789.ap-northeast-2.elb.amazonaws.com
```

---

### 4단계: Route 53 A 레코드 생성

1. **Route 53 Console → Hosted zones → daitdaing.link**

2. **Create record 클릭**

3. **레코드 설정**:
   ```
   Record name: aischool
   Record type: A - Routes traffic to an IPv4 address and some AWS resources
   
   [✓] Alias
   Route traffic to: Alias to Application and Classic Load Balancer
   Region: Asia Pacific (Seoul) ap-northeast-2
   Choose load balancer: itdaing-alb-xxxxx
   
   Routing policy: Simple routing
   
   Evaluate target health: Yes (권장)
   ```

4. **Create records**

---

### 5단계: DNS 전파 확인

```bash
# DNS 전파 확인 (5-30분 소요)
nslookup aischool.daitdaing.link

# 응답 예시 (성공):
# Non-authoritative answer:
# Name:	aischool.daitdaing.link
# Address: 54.180.xxx.xxx (ALB IP)

# 전파 상태 확인
dig aischool.daitdaing.link +trace
```

**DNS 전파 체크 사이트**:
- https://www.whatsmydns.net/#A/aischool.daitdaing.link

---

## 🔒 SSL/TLS 설정 (HTTPS)

DNS가 작동하면 SSL 인증서 발급:

### 1. AWS Certificate Manager (ACM)

```bash
# AWS CLI로 요청
aws acm request-certificate \
  --domain-name daitdaing.link \
  --subject-alternative-names "*.daitdaing.link" \
  --validation-method DNS \
  --region ap-northeast-2
```

### 2. DNS 검증

ACM에서 제공하는 CNAME 레코드를 Route 53에 추가

### 3. ALB에 인증서 연결

1. ALB → Listeners → Add listener
2. Protocol: HTTPS
3. Port: 443
4. Default SSL certificate: ACM 인증서 선택

### 4. Nginx HTTPS 리디렉션 (선택)

```nginx
server {
    listen 80;
    server_name aischool.daitdaing.link;
    
    # HTTP → HTTPS 리디렉션
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aischool.daitdaing.link;
    
    # ALB가 SSL termination 처리하므로
    # 실제로는 HTTP로 받음
    # ...
}
```

---

## ✅ 최종 체크리스트

- [ ] daitdaing.link 도메인 구매 완료
- [ ] Route 53 호스팅 영역 생성
- [ ] 도메인 등록 업체에서 Name Server 설정
- [ ] Public Subnet 2개 확인 (ALB용)
- [ ] Application Load Balancer 생성
- [ ] Target Group에 Private EC2 등록
- [ ] Route 53 A 레코드 생성 (ALB Alias)
- [ ] DNS 전파 확인 (5-30분)
- [ ] http://aischool.daitdaing.link 접속 테스트
- [ ] SSL 인증서 발급 (ACM)
- [ ] HTTPS 설정

---

## 🔍 트러블슈팅

### DNS가 전파되지 않음

```bash
# Name Server 확인
dig daitdaing.link NS

# Route 53 Name Server와 일치하는지 확인
# 도메인 등록 업체에서 Name Server 설정 확인
```

### ALB Health Check 실패

```bash
# EC2에서 직접 접근 테스트
curl http://localhost:80

# Security Group 확인
# - ALB → EC2: HTTP (80) 허용
# - EC2 → ALB: Outbound 모두 허용
```

### 502 Bad Gateway

```bash
# 백엔드 상태 확인
curl http://localhost:8080/actuator/health

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 참고 링크

- [AWS ALB 설정 가이드](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [Route 53 시작하기](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/)
- [ACM 인증서 발급](https://docs.aws.amazon.com/acm/latest/userguide/)

