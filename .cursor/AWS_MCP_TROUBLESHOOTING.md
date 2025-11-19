# AWS Documentation MCP 서버 문제 해결 가이드

## 현재 설정

```json
{
  "AWS Documentation": {
    "command": "/home/ubuntu/.local/bin/uvx",
    "args": [
      "awslabs.aws-documentation-mcp-server@latest"
    ],
    "env": {
      "FASTMCP_LOG_LEVEL": "INFO",
      "AWS_DOCUMENTATION_PARTITION": "aws",
      "PATH": "/home/ubuntu/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    }
  }
}
```

## 문제 해결 단계

### 1. MCP 서버 프로세스 확인

```bash
ps aux | grep awslabs.aws-documentation-mcp-server
```

서버가 실행 중이면 프로세스가 보입니다.

### 2. 수동으로 서버 실행 테스트

```bash
/home/ubuntu/.local/bin/uvx awslabs.aws-documentation-mcp-server@latest
```

서버가 시작되면 정상입니다. Ctrl+C로 종료하세요.

### 3. Cursor 재시작

MCP 설정을 변경한 후에는 Cursor를 완전히 재시작해야 합니다:

1. Cursor 완전 종료
2. Cursor 다시 시작
3. MCP 서버 연결 상태 확인

### 4. 로그 확인

Cursor 설정에서 MCP 서버 로그를 확인하세요:
- Settings → MCP → AWS Documentation → Logs

### 5. 대안 설정 시도

만약 위 설정이 작동하지 않으면 다음을 시도해보세요:

#### 옵션 1: 상대 경로 사용

```json
{
  "AWS Documentation": {
    "command": "uvx",
    "args": [
      "awslabs.aws-documentation-mcp-server@latest"
    ],
    "env": {
      "FASTMCP_LOG_LEVEL": "DEBUG",
      "AWS_DOCUMENTATION_PARTITION": "aws"
    }
  }
}
```

#### 옵션 2: Python 직접 실행 (uvx가 작동하지 않는 경우)

먼저 패키지를 설치:
```bash
uvx awslabs.aws-documentation-mcp-server@latest --help
```

그 다음 Python 경로 확인:
```bash
which python3
```

### 6. 네트워크 연결 확인

AWS Documentation MCP 서버는 인터넷 연결이 필요합니다:

```bash
curl -I https://docs.aws.amazon.com
```

### 7. uvx 업데이트

uvx가 최신 버전인지 확인:

```bash
uvx --version
```

업데이트가 필요하면:
```bash
pip install --upgrade uv
```

## 일반적인 문제

### 문제: MCP 서버가 시작되지 않음

**해결책**:
1. `uvx`가 PATH에 있는지 확인
2. 전체 경로 사용 (`/home/ubuntu/.local/bin/uvx`)
3. Cursor 재시작

### 문제: 연결은 되지만 응답이 없음

**해결책**:
1. 로그 레벨을 `DEBUG`로 변경
2. 네트워크 연결 확인
3. AWS 문서 사이트 접근 가능 여부 확인

### 문제: 타임아웃 오류

**해결책**:
1. 서버 초기화 시간이 필요할 수 있음
2. 로그 레벨을 `INFO` 또는 `DEBUG`로 변경하여 상세 정보 확인

## 추가 리소스

- AWS Documentation MCP Server: https://github.com/awslabs/aws-documentation-mcp-server
- MCP 프로토콜 문서: https://modelcontextprotocol.io
- Cursor MCP 설정: Cursor Settings → MCP

## 지원

문제가 지속되면:
1. Cursor 로그 확인
2. MCP 서버 로그 확인
3. GitHub 이슈 리포트 (해당 MCP 서버 저장소)

