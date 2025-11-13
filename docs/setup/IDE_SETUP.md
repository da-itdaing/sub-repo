# IDE 설정 가이드 (IntelliJ / Eclipse)

백엔드 개발자가 IntelliJ나 Eclipse에서 쉽고 안전하게 실행/디버그/배포할 수 있도록 정리했습니다.

## 1) 프로젝트 Import

- JDK: 21 (필수)
- Import 방식: Gradle 프로젝트로 Import
- Gradle JVM: JDK 21 지정

## 2) 실행 프로파일

프로파일은 크게 3개입니다.

- `local` (기본): MySQL Docker 컨테이너 사용. 빠른 개발/스모크 테스트용.
- `dev`: IDE에서 RDS/S3에 붙는 개발용. 환경변수로 자격/엔드포인트 주입.
- `prod`: EC2 운영용. 포트 80, 환경변수 기반 설정.

### 2.1 local 프로파일 (가장 간편)
- Run Configuration:
  - Main class: `com.da.itdaing.ItdaingServerApplication`
  - Environment variables: `SPRING_PROFILES_ACTIVE=local`
  - (옵션) VM Options: `-Dspring.profiles.active=local`
- 포트: 8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- DB: MySQL 8.0 (Docker 컨테이너)

### 2.2 dev 프로파일 (RDS/S3와 연동)
- 파일: `src/main/resources/application-dev.yml`
- Run Configuration:
  - Environment variables 예시:
    - `SPRING_PROFILES_ACTIVE=dev`
    - `DB_URL=jdbc:mysql://<rds-endpoint>:3306/<db>`
    - `DB_USERNAME=<username>`
    - `DB_PASSWORD=<password>`
    - `S3_BUCKET_NAME=<bucket-name>`
    - (선택) `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (인스턴스 프로파일 미사용 시)
  - 포트: 8080 (IDE에서 바로 접근 가능)
- 주의: 운영 데이터 변경 위험이 있으므로 개발/스테이징 전용 RDS를 사용하세요.

### 2.3 prod 프로파일 (참고)
- EC2에서만 사용 권장. 로컬에선 포트 80 권한 이슈 가능.
- 파일: `src/main/resources/application-prod.yml`

## 3) JWT 기본값

- SecurityConfig는 만료 시간을 **밀리초(long)** 로 받습니다.
- `local`, `dev` yml은 이미 밀리초로 구성되어 있습니다.
- 필요 시 Run Configuration에서 `JWT_*` 환경변수로 덮어쓰세요.

## 4) Git (bastion 경유, ProxyJump)

사설망 EC2에서 git clone/pull을 하려면 SSH ProxyJump 구성이 필요합니다. `~/.ssh/config` 예시:

```sshconfig
Host bastion
  HostName <bastion-public-ip-or-dns>
  User ubuntu
  IdentityFile ~/.ssh/bastion.pem
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

## 5) 원격 디버깅 (선택, bastion 경유)

EC2에서 jar를 디버그 모드로 실행하고 IDE로 붙는 방법입니다.

1) EC2에서 애플리케이션을 디버그 모드로 실행 (예시):

```bash
JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" \
SPRING_PROFILES_ACTIVE=prod \
DB_URL=jdbc:mysql://<rds-endpoint>:3306/<db> \
DB_USERNAME=<user> DB_PASSWORD=<pass> S3_BUCKET_NAME=<bucket> \
nohup java -jar /home/ubuntu/app.jar > app.log 2>&1 &
```

2) 로컬에서 포트 포워딩 (bastion 경유):

```bash
ssh -J ubuntu@<bastion-ip> ubuntu@<private-ec2-ip> -L 5005:127.0.0.1:5005 -N
```

3) IntelliJ Run/Debug Configuration:
- Add New > Remote JVM Debug
- Host: `localhost`, Port: `5005`
- Debug 시작

보안 상 디버그 포트는 일시적으로만 열고, 보스턴과 SG 제한을 엄격히 적용하세요.

## 6) 배포(참고)

- `docs/DEPLOY_EC2.md` 참고 (systemd, 환경변수 정리)
- 단순 배포는 로컬/CI에서 jar 빌드 후 bastion을 통해 private-EC2로 전송하는 방식을 권장합니다.
