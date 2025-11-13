# Cursor 설정 구조 가이드

이 문서는 Cursor IDE의 설정 구조를 명확히 설명합니다.

## 두 개의 .cursor 폴더

Cursor IDE는 두 가지 레벨의 설정을 사용합니다:

### 1. 전역 설정 (`~/.cursor/`)
**위치**: `/home/ubuntu/.cursor/`

**역할**: 모든 프로젝트에서 공유되는 전역 설정

**내용**:
- `mcp.json` - MCP 서버 설정 (전역)
- `ide_state.json` - IDE 상태 정보 (전역)
- `projects/` - 프로젝트별 캐시 데이터
- `README.md` - 전역 설정 설명
- `MCP_SETUP.md` - MCP 서버 설정 가이드

**특징**:
- 모든 프로젝트에 적용됩니다
- MCP 서버 설정은 여기서 관리됩니다
- Git에 포함되지 않습니다 (개인 설정)

### 2. 프로젝트별 설정 (`프로젝트/.cursor/`)
**위치**: `/home/ubuntu/itdaing/.cursor/`

**역할**: 이 프로젝트(itdaing)에만 적용되는 설정

**내용**:
- `commands/` - 프로젝트별 명령어
- `rules/` - 프로젝트별 규칙
- `README.md` - 프로젝트 설정 설명
- `MULTIPLE_MODEL_SETUP.md` - Multiple model 사용 가이드
- `worktrees.json` - Git worktree 설정

**특징**:
- 이 프로젝트에만 적용됩니다
- Git에 포함됩니다 (팀 공유)
- 프로젝트 규칙과 명령어를 관리합니다

## 설정 우선순위

1. **프로젝트별 설정**이 전역 설정보다 우선합니다
2. MCP 서버는 전역 설정에서만 관리됩니다
3. 프로젝트 규칙과 명령어는 프로젝트별 설정에서 관리됩니다

## 구조 다이어그램

```
Cursor 설정 구조:
│
├── ~/.cursor/                          # 전역 설정 (모든 프로젝트 공유)
│   ├── mcp.json                        # MCP 서버 설정
│   ├── ide_state.json                  # IDE 상태
│   ├── projects/                       # 프로젝트 캐시
│   ├── README.md                       # 전역 설정 설명
│   └── MCP_SETUP.md                    # MCP 설정 가이드
│
└── 프로젝트/.cursor/                    # 프로젝트별 설정 (현재 위치)
    ├── commands/                        # 프로젝트 명령어
    │   ├── front-dev.md
    │   ├── back-dev.md
    │   └── ...
    ├── rules/                          # 프로젝트 규칙
    │   ├── project-rules.md
    │   ├── commands-rules.md
    │   └── ...
    ├── README.md                       # 프로젝트 설정 설명
    ├── MULTIPLE_MODEL_SETUP.md         # Multiple model 가이드
    ├── worktrees.json                  # Git worktree 설정
    └── CURSOR_SETTINGS_GUIDE.md        # 이 파일
```

## 주요 차이점

| 항목 | 전역 설정 (`~/.cursor/`) | 프로젝트별 설정 (`프로젝트/.cursor/`) |
|------|------------------------|-----------------------------------|
| **범위** | 모든 프로젝트 | 특정 프로젝트만 |
| **Git 포함** | ❌ 아니오 | ✅ 예 |
| **MCP 서버** | ✅ 여기서 관리 | ❌ 관리 안 함 |
| **프로젝트 규칙** | ❌ 없음 | ✅ 여기서 관리 |
| **프로젝트 명령어** | ❌ 없음 | ✅ 여기서 관리 |

## MCP 서버 설정

MCP 서버는 **전역 설정**에서만 관리됩니다:
- 설정 파일: `~/.cursor/mcp.json`
- 현재 설정: AWS Documentation Server
- 브라우저 확장 기능: Cursor 확장 기능으로 제공 (별도 설정 불필요)

**자세한 내용**: `~/.cursor/MCP_SETUP.md` 참조

## 프로젝트 규칙 및 명령어

프로젝트 규칙과 명령어는 **프로젝트별 설정**에서 관리됩니다:
- 규칙: `.cursor/rules/` 디렉토리
- 명령어: `.cursor/commands/` 디렉토리
- Git에 포함되어 팀원과 공유됩니다

**자세한 내용**: `.cursor/README.md` 참조

## 혼동 방지 팁

1. **MCP 서버 설정**이 필요하면 → `~/.cursor/mcp.json` 수정
2. **프로젝트 규칙**을 추가하려면 → `프로젝트/.cursor/rules/` 수정
3. **프로젝트 명령어**를 추가하려면 → `프로젝트/.cursor/commands/` 수정
4. **설정 위치가 헷갈리면** → 각 폴더의 `README.md` 참조

## 참고 문서

- 전역 설정: `~/.cursor/README.md`
- MCP 설정: `~/.cursor/MCP_SETUP.md`
- 프로젝트 설정: `프로젝트/.cursor/README.md`
- Multiple Model: `프로젝트/.cursor/MULTIPLE_MODEL_SETUP.md`

