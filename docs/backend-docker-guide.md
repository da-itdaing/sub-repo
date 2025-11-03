# 백엔드 Docker 가이드 (Spring Boot)

이 문서는 저장소 루트의 `Dockerfile`을 기준으로 백엔드(Spring Boot) 컨테이너를 빌드/실행/변경하는 방법을 정리합니다. 지속적인 백엔드 개발 중에 Dockerfile을 어떻게 수정해야 할지 가이드도 포함되어 있습니다.

## TL;DR 빠른 시작

- 이미지 빌드

```zsh
docker build -t itdaing-backend:latest .
```

- 컨테이너 실행 (포트 8080, 로컬 프로필 예시)

```zsh
docker run -d --name itdaing-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=local \
  -e JAVA_OPTS="-Xms256m -Xmx512m" \
  itdaing-backend:latest
```

## 새 컴퓨터에서 빠르게 실행하기 (git pull 이후)


1) 환경 변수 템플릿 복사 후 값 설정
cp .env.example .env
# 필요한 경우 .env 열어서 외부 DB 자격 증명/프로필을 수정
```
```zsh
# .env의 SPRING_DATASOURCE_* 값을 사용해 실행
docker compose up -d --build backend
```
3) H2(인메모리)로 빠르게 확인하고 싶다면

# h2 프로필을 활성화하여 in-memory H2로 실행
docker compose --profile h2 up -d --build backend-h2

4) 로그와 상태 확인

```zsh
docker ps
```


```zsh
docker compose down
# 볼륨/이미지까지 정리하려면
docker compose down -v --rmi local
```
- 외부 설정 파일 마운트 (Spring 표준 `/config` 경로)

```zsh
# 예: src/main/resources 하위의 yml을 컨테이너 /config 로 마운트
# 컨테이너 내부 우선순위: /config > classpath
docker run -d --name itdaing-backend \
  -p 8080:8080 \
  itdaing-backend:latest
```

## 현재 Dockerfile 개요

- 멀티스테이지 빌드
  - Builder: `gradle:8.10.2-jdk21`로 `bootJar`(실패 시 `build`) 생성, 테스트는 기본 제외(`-x test`).
  - Runtime: `eclipse-temurin:21-jre`로 경량 실행.
- 비루트 사용자(`spring`)로 실행하여 보안 강화.
- Runtime에 `curl`이 설치되어 컨테이너 헬스체크에 사용됩니다.
- 환경 변수
  - `SPRING_PROFILES_ACTIVE` 기본 `prod` (실행 시 재정의 권장)
  - `TZ=Asia/Seoul`
- Healthcheck(기본 포함)
  - interval=30s, timeout=5s, start-period=90s, retries=5
  - 우선 `/actuator/health`에서 `"status":"UP"`을 확인하고, 노출되지 않은 경우에는 `/`에 대한 HTTP 응답 유무로 대체 판단합니다.
- 포트: 기본 8080 노출 (`EXPOSE 8080`)
- JAR 복사: `/workspace/build/libs/*.jar` → `/app/app.jar` (와일드카드 사용)
- `.dockerignore`로 `build/`, `.gradle/`, `frontend/`, `node_modules/` 등을 제외하여 빌드 속도/이미지 크기 최적화

## 개발 중 자주 바꾸는 항목과 수정 가이드
### 1) JDK 버전 변경 (예: 17 → 21)
- Spring Boot 3.x는 Java 17+를 권장합니다. JDK 21을 쓰려면 두 Base Image를 교체하세요.
  - Runtime: `eclipse-temurin:21-jre`
- Gradle Toolchain을 사용 중이면 `gradle.properties`/`build.gradle`의 toolchain 설정도 21로 올리세요.

### 2) 빌드 도구 전환 (Maven 사용 시)
- Builder 이미지를 `maven:3.9-eclipse-temurin-17`로 바꾸고, 빌드 명령을 아래처럼 교체합니다.

```dockerfile
RUN mvn -B -DskipTests clean package
# (Spring Boot 실행 JAR: target/*.jar)
```
- JAR 복사 라인도 `COPY --from=builder /workspace/target/*.jar /app/app.jar`로 조정.

### 3) JAR 파일명/경로가 바뀌는 경우
- `build.gradle`에서 `archiveFileName`이나 멀티모듈로 아티팩트 명이 달라지면, Dockerfile의 JAR 복사 라인(와일드카드)을 명시적으로 바꾸는 것이 안전합니다.

```dockerfile
```

- 앱에서 `server.port=9090` 등으로 바꿨다면 실행 시 포워딩도 함께 조정하세요.

```zsh
# 9090으로 변경된 경우
docker run -p 9090:9090 itdaing-backend:latest
```

### 5) 프로필/환경 변수 관리
- 프로필: `SPRING_PROFILES_ACTIVE=local|dev|staging|prod` 등으로 분리하여 실행.
- DB/외부 서비스 크리덴셜은 이미지를 다시 빌드하지 말고 환경 변수 또는 `/config` 마운트로 주입하세요.

```zsh
docker run -d \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_USERNAME=app \
  -e DB_PASSWORD=secret \
  itdaing-backend:latest
```


```dockerfile
# 현재 Dockerfile 기본 HEALTHCHECK (Actuator 우선, HTTP 응답으로 대체 허용)
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD curl -fsS http://localhost:8080/actuator/health | grep -q '"status":"UP"' || \
      curl -s -o /dev/null http://localhost:8080 || exit 1
```

- 보안/노출 정책에 따라 Actuator 경로/보호 설정을 조정하세요.
  - 컨테이너 시작 직후 `STATUS=starting`은 start-period(기본 90s) 동안 정상입니다.

### 7) 빌드 캐시 최적화 (레이어드 JAR)
- Spring Boot 3.x는 기본 레이어를 생성합니다. 더 빠른 증분 빌드를 원하면 layertools를 이용해 레이어별 복사를 고려하세요.

```dockerfile
# (Builder에서 생성된 bootJar를 임시로 복사해 레이어 추출)
RUN java -Djarmode=layertools -jar build/libs/*.jar extract

# (Runtime로 복사)
COPY --from=builder /workspace/dependencies/ /app/dependencies/
COPY --from=builder /workspace/snapshot-dependencies/ /app/snapshot-dependencies/
COPY --from=builder /workspace/resources/ /app/resources/
COPY --from=builder /workspace/application/ /app/application/

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -Duser.timezone=$TZ \
  -cp /app/resources:/app/classes:/app/dependencies/*:/app/snapshot-dependencies/* \
  org.springframework.boot.loader.launch.JarLauncher"]
```

- 위 방식은 Docker 레이어 캐시 적중률을 높이지만, 유지보수 난도가 올라가므로 필요 시에만 적용을 권장합니다.

### 8) 멀티 아키텍처 빌드/배포
- AMD64/ARM64 모두 배포가 필요하면 buildx를 사용하세요.

```zsh
docker buildx build --platform linux/amd64,linux/arm64 -t <registry>/itdaing-backend:<tag> --push .
```

### 9) 이미지 태깅 전략
- `latest` 외에 커밋 SHA, 태그, 날짜를 함께 태깅해 추적성을 확보하세요.

```zsh
TAG=$(date +%Y%m%d)-$(git rev-parse --short HEAD)
docker build -t <registry>/itdaing-backend:${TAG} -t <registry>/itdaing-backend:latest .
```

## 로컬 개발 워크플로 추천

- 빠른 개발 사이클은 컨테이너보다 로컬 `bootRun`이 적합합니다.

```zsh
./gradlew bootRun
```

- 컨테이너로 DB를 띄우고 애플리케이션만 로컬에서 실행해도 좋습니다. 컨테이너 내부 DB에 로컬 앱이 연결할 때는 `localhost`/포트 포워딩을 사용하세요.
- 컨테이너에서 앱을 실행하면서 코드 변경을 즉시 반영하려면 DevTools + Jib/Skaffold/Tilt 같은 툴을 검토하세요. (순수 Docker만으로는 핫 리로드가 번거롭습니다.)

### docker-compose 예시 (선택)

```yaml
version: "3.8"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      - "5432:5432"
    volumes:
      - dbdata:/var/lib/postgresql/data

  backend:
    image: itdaing-backend:latest
    depends_on:
      - db
    environment:
      SPRING_PROFILES_ACTIVE: local
      DB_URL: jdbc:postgresql://db:5432/app
      DB_USERNAME: app
      DB_PASSWORD: secret
    ports:
      - "8080:8080"

volumes:
  dbdata: {}
```

## 문제 해결 가이드
- gradlew 권한 오류: Dockerfile에 `chmod +x ./gradlew`가 포함되어 있지만, 누락 시 `RUN chmod +x gradlew` 추가.
- Gradle Wrapper 부재: 현재 Dockerfile은 wrapper 우선, 없으면 시스템 gradle로 빌드합니다. 팀 표준은 wrapper 사용을 권장합니다.

## CI/CD 팁 (요약)

## H2 DB 테스트 세팅 (선택)

이 섹션은 로컬/간단 검증용으로 H2를 사용할 때만 필요합니다. 배포 환경이나 프로젝트가 H2를 사용하지 않는다면, 본 섹션은 건너뛰어도 됩니다(외부 DB만 사용).

이 프로젝트는 로컬 프로필(`application-local.yml`)에서 H2를 사용할 수 있도록 준비되어 있습니다. 현재 설정은 `jdbc:h2:tcp://localhost/~/itdaing ...` 형태로 TCP 서버를 가정합니다. 컨테이너 환경에서는 TCP 서버 의존 없이 “인메모리 H2”를 사용하는 것이 간단합니다. 이를 위해 Docker 이미지에 엔트리포인트 스크립트가 추가되어 있으며, `SPRING_USE_H2` 환경 변수로 손쉽게 전환할 수 있습니다.

### 1) Dockerfile 변경 사항

- `docker/entrypoint.sh` 스크립트를 사용해, `SPRING_USE_H2=true`일 때 아래 환경 변수를 기본값으로 설정합니다(이미 지정된 값이 있으면 보존).
  - `SPRING_PROFILES_ACTIVE=local`
  - `SPRING_H2_CONSOLE_ENABLED=true`
  - `SPRING_H2_CONSOLE_PATH=/h2-console`
  - `SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop`
  - `SPRING_DATASOURCE_URL=jdbc:h2:mem:itdaing;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`
  - `SPRING_DATASOURCE_PASSWORD=`(빈 값)
  - `SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver`

### 2) H2로 실행하는 예시

```zsh
docker run -d --name itdaing-backend \
  -p 8080:8080 \
  -e SPRING_USE_H2=true \
  -e SPRING_PROFILES_ACTIVE=local \
  itdaing-backend:latest
```

- H2 콘솔: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:itdaing`
  - 사용자: `sa`  비밀번호: (빈 값)

### 3) application-local.yml을 직접 업데이트하는 경우

- 현재는 `jdbc:h2:tcp://localhost/~/itdaing`으로 되어 있어 컨테이너 내에서 별도의 H2 서버가 필요합니다. 아래처럼 인메모리 또는 파일 모드로 바꾸면 더 단순합니다.

인메모리 예시:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:itdaing;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    username: sa
    password:
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
      path: /h2-console
```

파일 모드 예시(컨테이너 로컬 경로 사용):

```yaml
spring:
  datasource:
    url: jdbc:h2:file:/data/itdaing;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    username: sa
    password:
    driver-class-name: org.h2.Driver
```

이 경우 컨테이너 실행 시 볼륨을 마운트해 영속화할 수 있습니다.

```zsh
docker run -d --name itdaing-backend \
  -p 8080:8080 \
  -v "$PWD/.data":/data \
  -e SPRING_PROFILES_ACTIVE=local \
  itdaing-backend:latest
```

### 4) TCP 서버 모드를 꼭 써야 한다면

- 컨테이너에서 별도 H2 서버를 띄우려면 추가 스크립팅이 필요합니다. 유지보수 부담이 커 권장하지 않으며, 대신 인메모리/파일 모드를 권장합니다.
- 별도 DB 컨테이너(PostgreSQL/MySQL 등)로 전환하는 시점에는 `SPRING_USE_H2`를 제거하고 실제 데이터소스 환경 변수(예: `SPRING_DATASOURCE_URL`)로 교체하세요.

## 외부 데이터베이스(MySQL/MariaDB) 접속

다음 접속 정보를 사용하는 외부 DB로 연결해야 한다면, 컨테이너 실행 시 환경 변수로 데이터소스 값을 주입하세요. (민감정보는 코드/이미지에 하드코딩하지 말고 런타임에 주입)

- Host: `project-db-campus.smhrd.com`
- Port: `3312`
- User: `Insa6_aiNLPB_p3_2`
- Password: 
- Database: `Insa6_aiNLPB_p3_2`

H2와의 우선순위
- 기본적으로 H2는 사용하지 않습니다. `SPRING_USE_H2`를 설정하지 마세요.
- 실수로 `SPRING_USE_H2=true`를 켜더라도, `SPRING_DATASOURCE_URL`이 MySQL/등 비-H2 URL이면 엔트리포인트가 H2 오버라이드를 무시합니다.


권장 JDBC URL 예시:

```
jdbc:mysql://project-db-campus.smhrd.com:3312/Insa6_aiNLPB_p3_2?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=utf8
```

### 1) docker run 예시

```zsh
docker run -d --name itdaing-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://project-db-campus.smhrd.com:3312/Insa6_aiNLPB_p3_2?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=utf8" \
  -e SPRING_DATASOURCE_USERNAME="Insa6_aiNLPB_p3_2" \
  -e SPRING_DATASOURCE_PASSWORD="aischool2" \
  -e SPRING_DATASOURCE_DRIVER_CLASS_NAME="com.mysql.cj.jdbc.Driver" \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO="none" \
  itdaing-backend:latest
```

주의
- `SPRING_USE_H2`는 설정하지 마세요(H2 토글이 켜지면 외부 DB 설정을 덮을 수 있습니다).
- 애플리케이션 의존성에 MySQL 드라이버(`mysql-connector-j`)가 포함되어 있어야 합니다. 누락 시 빌드 스크립트에 추가하세요.

운영 팁
- 방화벽/허용목록: 새 컴퓨터/CI 런너의 아웃바운드 IP가 DB에서 허용되는지 확인하세요.
- 마이그레이션: 외부 DB로 스키마를 관리하려면 Flyway를 활성화하세요(`SPRING_FLYWAY_ENABLED=true`).
- 타임존/문자셋: JDBC URL의 `serverTimezone`, `characterEncoding`을 환경에 맞게 조정.
- 시크릿: `.env`는 레포에 커밋 금지. `.dockerignore`로 빌드 컨텍스트에도 포함되지 않음.

Gradle 예시:

```gradle
dependencies {
  implementation("mysql:mysql-connector-j:8.4.0")
}
```

Maven 예시:

```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version>8.4.0</version>
</dependency>
```

### 2) docker-compose 예시(.env 사용)

루트에 `.env` 파일을 두고 민감정보를 외부화하세요. 저장소에는 `.env`를 커밋하지 말고 `.env.example`만 공유합니다.

```yaml
version: "3.8"
services:
  backend:
    image: itdaing-backend:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
      SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
      SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
      SPRING_DATASOURCE_DRIVER_CLASS_NAME: com.mysql.cj.jdbc.Driver
      SPRING_JPA_HIBERNATE_DDL_AUTO: none
```

`.env` 예시 내용은 저장소의 `.env.example`를 참고해 복사/수정하세요.

### 3) 연결 확인

- 애플리케이션 로그에서 커넥션 성공/실패를 확인합니다.

```zsh
docker logs -f itdaing-backend | sed -n '1,200p'
```

- 필요하면 `jdbc:mysql://...`의 파라미터(`serverTimezone`, `useSSL`, `allowPublicKeyRetrieval`)를 현 환경에 맞게 조정하세요.


## API 테스트 방법

실행된 컨테이너가 호스트 8080 포트에 매핑되어 있다면 기본 베이스 URL은 `http://localhost:8080` 입니다. 포트를 바꿨다면 해당 포트로 교체하세요.

### 1) curl로 빠르게 확인

```zsh
# 단순 liveness 확인 (프로젝트 상황에 맞는 엔드포인트로 변경)
curl -i http://localhost:8080/

# (Actuator를 쓰는 경우) Health 체크
curl -s http://localhost:8080/actuator/health | jq

# 쿼리 파라미터 전송
curl -G http://localhost:8080/api/example \
  --data-urlencode "q=hello world" \
  --data-urlencode "page=0"

# JSON POST
curl -i -X POST http://localhost:8080/api/example \
  -H "Content-Type: application/json" \
  -d '{"name":"tester","enabled":true}'

# Bearer 토큰 포함
TOKEN="<paste-token-here>"
curl -i http://localhost:8080/api/secure \
  -H "Authorization: Bearer ${TOKEN}"
```

참고: 위 경로(`/api/example`, `/api/secure`)는 예시입니다. 실제 프로젝트의 엔드포인트로 바꿔 사용하세요.

### 2) HTTPie (선택)

```zsh
http :8080/
http :8080/api/example q=="hello world" page==0
http POST :8080/api/example name=tester enabled:=true
http :8080/api/secure "Authorization:Bearer ${TOKEN}"
```

### 3) Postman/Insomnia

- 환경 변수 `base_url`을 만들고 `http://localhost:8080` 설정 후, 요청 URL을 `{{base_url}}/api/...` 형태로 사용합니다.
- 프로필/토큰 등은 각각 환경 변수로 분리해 팀원 간 공유를 최소화하세요.

### 4) 컨테이너 내부에서 테스트

```zsh
# 쉘 접속 후 내부 localhost:8080으로 호출
docker exec -it itdaing-backend sh
apk add --no-cache curl jq 2>/dev/null || true
curl -s http://localhost:8080/ | head -n 20
```

### 5) docker-compose 네트워킹 참고

- compose에서 서비스명이 `backend`라면 같은 네트워크의 다른 컨테이너는 `http://backend:8080`으로 접근합니다.
- 호스트(개발자 Mac)에서 접근할 때는 여전히 `http://localhost:8080`을 사용합니다.

### 6) 문제 해결 팁 (API 테스트 시)

- 연결 안 됨: 컨테이너가 실행 중인지(`docker ps`), 포트 매핑이 올바른지(`-p 호스트:컨테이너`) 확인.
- 404/401: 호출 경로가 맞는지, 인증 헤더가 필요한지 확인.
- 타임아웃: 앱 기동 중일 수 있습니다. 로그로 상태 확인.

```zsh
docker logs -f itdaing-backend
```

- 포트 변경 시: 앱의 `server.port`와 Docker `-p` 매핑이 일치해야 합니다.
---

질문이나 변경이 필요한 부분(예: JDK 21 전환, Maven 전환, healthcheck 추가)이 있으면 이 문서 기준으로 PR에 반영해 주세요. 필요 시 Dockerfile 수정 예시를 함께 남겨드립니다.
