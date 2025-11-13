# EC2 아키텍처 설명

## 📋 개요

프로젝트는 AWS에서 두 가지 EC2 인스턴스를 사용합니다:
- **Bastion EC2**: 점프 서버 (SSH 접근용)
- **Private EC2**: 애플리케이션 실행 서버

## 🏗️ 아키텍처 구조

```
인터넷
  │
  ├─ Bastion EC2 (Public Subnet)
  │   └─ SSH 접근용 점프 서버
  │
  └─ Private EC2 (Private Subnet)
      ├─ Spring Boot 애플리케이션 실행
      ├─ prod.env 파일 사용
      └─ RDS PostgreSQL 연결
```

## 🔑 각 EC2의 역할

### Bastion EC2
- **위치**: Public Subnet
- **역할**: 
  - SSH 접근을 위한 점프 서버
  - Private EC2에 접근하기 위한 게이트웨이
- **사용 시나리오**:
  - 로컬에서 Private EC2에 접근할 때 경유
  - SSH ProxyJump 설정으로 자동 경유 가능

### Private EC2
- **위치**: Private Subnet
- **역할**:
  - **Spring Boot 애플리케이션 실행**
  - `prod.env` 파일 사용
  - RDS PostgreSQL 연결
  - S3 접근
- **사용 시나리오**:
  - 실제 애플리케이션 서버
  - `prod.env` 파일이 배치되는 위치
  - systemd 서비스로 애플리케이션 실행

## 📁 파일 배치 위치

### Private EC2에 배치해야 할 파일들:
```
/home/ubuntu/
├── app.jar                    # Spring Boot 애플리케이션
├── prod.env                   # 환경 변수 파일 (중요!)
└── logs/                      # 로그 파일 (선택사항)
```

### Bastion EC2:
- 특별한 파일 배치 불필요 (점프 서버 역할만)

## 🔧 SSH 접근 방법

### 방법 1: Private EC2에 직접 접근 가능한 경우

```bash
# SSH 설정 (~/.ssh/config)
Host private-ec2
    HostName <private-ec2-ip>
    User ubuntu
    IdentityFile ~/.ssh/your-key.pem

# 접속
ssh private-ec2
```

### 방법 2: Bastion을 경유하여 접근

```bash
# SSH 설정 (~/.ssh/config)
Host bastion
    HostName <bastion-public-ip>
    User ubuntu
    IdentityFile ~/.ssh/bastion-key.pem

Host private-ec2
    HostName <private-ec2-private-ip>
    User ubuntu
    ProxyJump bastion
    IdentityFile ~/.ssh/private-ec2-key.pem

# 접속
ssh private-ec2  # 자동으로 Bastion을 경유
```

## 📝 prod.env 파일 사용

### 중요: Private EC2에서만 사용

`prod.env` 파일은 **Private EC2**에 배치되어 사용됩니다.

```bash
# Private EC2에 접속
ssh private-ec2

# 파일 확인
ls -la /home/ubuntu/prod.env

# 환경 변수 로드
source /home/ubuntu/prod.env

# 애플리케이션 실행
java -jar /home/ubuntu/app.jar
```

## 🚀 배포 프로세스

### 1. 로컬에서 빌드
```bash
./gradlew clean build -x test
```

### 2. Private EC2로 파일 전송
```bash
# 방법 1: 직접 전송
scp build/libs/*-SNAPSHOT.jar ubuntu@<private-ec2>:/home/ubuntu/app.jar
scp prod.env ubuntu@<private-ec2>:/home/ubuntu/prod.env

# 방법 2: Bastion 경유
scp -o ProxyJump=bastion \
    build/libs/*-SNAPSHOT.jar \
    ubuntu@<private-ec2>:/home/ubuntu/app.jar
```

### 3. Private EC2에서 서비스 시작
```bash
ssh private-ec2
sudo systemctl start itdaing
sudo systemctl status itdaing
```

## 🔒 보안 고려사항

1. **Bastion EC2**
   - Public IP 보유
   - SSH 포트(22)만 열어둠
   - 강력한 키 페어 사용

2. **Private EC2**
   - Private IP만 보유
   - RDS와 같은 Private Subnet에 위치
   - 보안 그룹으로 접근 제어

3. **prod.env 파일**
   - Private EC2에만 존재
   - 파일 권한: `chmod 600`
   - Git에 커밋하지 않음

## 📚 관련 문서

- [EC2 배포 가이드](DEPLOY_EC2.md)
- [prod.env 설정 가이드](PROD_ENV_SETUP.md)
- [RDS PostgreSQL 설정](AWS_RDS_POSTGRESQL_SETUP.md)

