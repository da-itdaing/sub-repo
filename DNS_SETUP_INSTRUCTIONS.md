# DNS 설정 완료 가이드

## ✅ 확인된 정보 (Route 53 스크린샷)

### Hosted Zone
- **Domain**: daitdaing.link
- **Type**: Public hosted zone ✅
- **Hosted zone ID**: Z10121032LNSJCTNM7Q65
- **Record count**: 5개

### Name Servers (Route 53)
```
ns-1812.awsdns-34.co.uk
ns-952.awsdns-55.net
ns-1187.awsdns-20.org
ns-226.awsdns-28.com
```

**이 4개의 Name Server를 도메인 등록 업체에 설정해야 합니다!**

---

## 🎯 즉시 확인 필요

### 1. 도메인 등록 업체 Name Server 설정

**도메인을 어디서 구매하셨나요?**

#### 가비아 (gabia.com)
```
My가비아 로그인
→ 서비스 관리 → 도메인 
→ daitdaing.link 선택
→ 네임서버 설정
→ "1차 네임서버" ~ "4차 네임서버"에 입력:
   ns-1812.awsdns-34.co.uk
   ns-952.awsdns-55.net
   ns-1187.awsdns-20.org
   ns-226.awsdns-28.com
→ 적용
```

#### 후이즈 (whois.co.kr)
```
로그인 → 도메인 관리
→ daitdaing.link 선택
→ 네임서버 설정
→ Route 53 NS 4개 입력
→ 저장
```

#### Route 53에서 직접 구매
→ 이미 자동 설정됨 ✅

---

### 2. Route 53 레코드 확인

**Records (5) 섹션 확인 필요**:

현재 어떤 레코드가 있나요?
- [ ] NS 레코드 (기본, 자동 생성)
- [ ] SOA 레코드 (기본, 자동 생성)
- [ ] **aischool A 레코드** ← 이게 필요!

#### aischool 레코드가 없으면

**Create record 클릭**:
```
Record name: aischool
Record type: A
Alias: Yes ✓
Route traffic to: Application Load Balancer
Region: Asia Pacific (Seoul) ap-northeast-2
Load balancer: aischool-bastion-alb-1858295846
```

**Create records 클릭**

---

## ⏰ DNS 전파 타임라인

### Name Server 설정 직후

```
도메인 등록 업체에서 NS 설정 후
→ 30분 ~ 2시간 (일반적)
→ 최대 24-48시간
```

### 전파 확인

```bash
# 계속 확인
watch -n 30 'dig aischool.daitdaing.link +short'

# 또는 온라인
https://www.whatsmydns.net/#A/aischool.daitdaing.link
```

**전파 완료 시**:
```bash
$ dig aischool.daitdaing.link +short
54.180.xxx.xxx (ALB IP 출력)
```

---

## 🔍 문제 진단

### 현재 상황 (whatsmydns.net)

전 세계 모든 DNS 서버에서 빨간 X:
```
Seoul, South Korea       ✗
Singapore, Singapore     ✗
Beijing, China           ✗
(모든 지역)              ✗
```

**의미**: DNS 레코드가 전혀 전파되지 않음

**가능한 원인**:

#### 원인 1: Name Server 미설정 (가장 가능성 높음)
```
도메인 등록 업체의 현재 Name Server:
❌ 기본 Name Server (등록 업체 제공)
✅ 필요: Route 53 Name Server 4개
```

#### 원인 2: A 레코드 미생성
```
Route 53 Records에 aischool 레코드가 없음
```

---

## 📝 즉시 실행 체크리스트

### [ ] 1. 도메인 등록 업체 확인
- 어디서 daitdaing.link를 구매했나요?
- 현재 Name Server 무엇으로 설정되어 있나요?

### [ ] 2. Name Server 변경
Route 53 NS로 변경:
```
ns-1812.awsdns-34.co.uk
ns-952.awsdns-55.net
ns-1187.awsdns-20.org
ns-226.awsdns-28.com
```

### [ ] 3. Route 53 A 레코드 생성
```
aischool → aischool-bastion-alb
```

### [ ] 4. DNS 전파 대기
30분 ~ 2시간

---

## 🚀 당분간 ALB DNS 사용

**현재 접속 가능 URL**:
```
https://aischool-bastion-alb-1858295846.ap-northeast-2.elb.amazonaws.com
```

**React 앱 정상 작동 중** ✅

---

## 📞 확인 필요

1. **도메인 구매처가 어디인가요?**
   - 가비아, 후이즈, Route 53, 기타?

2. **현재 Name Server는?**
   - 도메인 관리 페이지에서 확인

3. **Route 53 Records에 aischool 레코드 있나요?**
   - AWS Console에서 확인

**이 3가지 정보만 있으면 DNS 문제를 바로 해결할 수 있습니다!**

