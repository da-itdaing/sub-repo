# IDE 설정 가이드 (IntelliJ / Eclipse)

백엔드 개발자가 IntelliJ나 Eclipse에서 쉽고 안전하게 실행/디버그할 수 있도록 정리했습니다.

## 1) 프로젝트 Import

- JDK: 21 (필수)
- Import 방식: Gradle 프로젝트로 Import
- Gradle JVM: JDK 21 지정

## 2) 실행 프로파일

프로파일은 크게 2개입니다.

- `prod`: Private EC2에서 실행 (AWS RDS PostgreSQL + AWS S3)
- `dev`: IDE에서 RDS/S3에 붙는 개발용 (환경변수로 자격/엔드포인트 주입)

### 2.1 prod 프로파일 (Private EC2)

- Private EC2에서만 사용
- 파일: `src/main/resources/application-prod.yml`
- 환경 변수: `prod.env` 파일에서 로드
- 포트: 8080
- DB: AWS RDS PostgreSQL
- 스토리지: AWS S3

### 2.2 dev 프로파일 (IDE에서 개발)

- 파일: `src/main/resources/application-dev.yml`
- Run Configuration:
  - Environment variables 예시:
    - `SPRING_PROFILES_ACTIVE=dev`
    - `SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/<db>`
    - `SPRING_DATASOURCE_USERNAME=<username>`
    - `SPRING_DATASOURCE_PASSWORD=<password>`
    - `STORAGE_S3_BUCKET=<bucket-name>`
    - `AWS_ACCESS_KEY_ID=<access-key>`
    - `AWS_SECRET_ACCESS_KEY=<secret-key>`
  - 포트: 8080 (IDE에서 바로 접근 가능)
- 주의: 운영 데이터 변경 위험이 있으므로 개발/스테이징 전용 RDS를 사용하세요.

## 3) JWT 기본값

- SecurityConfig는 만료 시간을 **밀리초(long)** 로 받습니다.
- `dev` yml은 이미 밀리초로 구성되어 있습니다.
- 필요 시 Run Configuration에서 `JWT_*` 환경변수로 덮어쓰세요.

## 4) Git (bastion 경유, ProxyJump)

사설망 Private EC2에서 git clone/pull을 하려면 SSH ProxyJump 구성이 필요합니다. `~/.ssh/config` 예시:

```sshconfig
Host bastion
  HostName <bastion-public-ip-or-dns>
  User ubuntu
  IdentityFile ~/.ssh/bastion.pem
  StrictHostKeyChecking accept-new

Host private-ec2
  HostName <private-ec2-private-ip>
  User ubuntu
  ProxyJump bastion
  IdentityFile ~/.ssh/private-ec2.pem
  StrictHostKeyChecking accept-new

Host github.com
  HostName github.com
  User git
  ProxyJump bastion
  IdentityFile ~/.ssh/github_ed25519
  StrictHostKeyChecking accept-new
```

IntelliJ:
- Settings > Version Control > Git > **Use credential helper** / **Use native SSH executable** 활성화
- IDE는 위의 `~/.ssh/config`를 그대로 사용합니다.

## 5) 원격 디버깅 (Private EC2)

Private EC2에서 jar를 디버그 모드로 실행하고 IDE로 붙는 방법입니다.

1) Private EC2에서 애플리케이션을 디버그 모드로 실행:

```bash
ssh private-ec2 "cd ~/itdaing && source prod.env && JAVA_TOOL_OPTIONS='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005' nohup ./gradlew bootRun > /tmp/itdaing-boot.log 2>&1 &"
```

2) 로컬에서 포트 포워딩 (bastion 경유):

```bash
ssh -J ubuntu@<bastion-ip> ubuntu@<private-ec2-ip> -L 5005:127.0.0.1:5005 -N
```

또는 SSH config 사용:

```bash
ssh -L 5005:localhost:5005 private-ec2 -N
```

3) IntelliJ Run/Debug Configuration:
- Add New > Remote JVM Debug
- Host: `localhost`, Port: `5005`
- Debug 시작

보안 상 디버그 포트는 일시적으로만 열고, 보안 그룹 제한을 엄격히 적용하세요.

## 6) 배포(참고)

- [Private EC2 배포 가이드](../deployment/DEPLOY_TO_PRIVATE_EC2.md) 참고
- [Private EC2 접근 가이드](../deployment/PRIVATE_EC2_ACCESS.md) 참고
- 단순 배포는 로컬/CI에서 jar 빌드 후 Private EC2로 전송하는 방식을 권장합니다.

## 7) 테스트 실행

로컬에서 테스트를 실행할 수 있습니다:

```bash
# 전체 테스트
./gradlew test

# 특정 도메인 테스트
./gradlew testUser
./gradlew testPopup
```

테스트는 로컬에서 실행되며, 실제 데이터베이스 연결 없이 Mock을 사용합니다.
