# 역할별 권한 정리

## 관리자 (ADMIN)

### Zone/Cell 관리 권한
- ✅ **Area (구역) 생성/수정/삭제**: 관리자만 가능
- ✅ **Cell (셀) 생성/수정/삭제**: 관리자만 가능
- ✅ **Zone 생성**: 관리자만 가능 (판매자 ID 지정)
- ✅ **Zone 상태 변경**: 관리자만 가능 (APPROVED, REJECTED, HIDDEN)
- ✅ **승인 관리**: 팝업 승인/거부

### API 엔드포인트
- `POST /api/geo/areas` - 구역 생성
- `PUT /api/geo/areas/{id}` - 구역 수정
- `DELETE /api/geo/areas/{id}` - 구역 삭제
- `POST /api/geo/cells` - 셀 생성
- `PUT /api/geo/cells/{id}` - 셀 수정
- `DELETE /api/geo/cells/{id}` - 셀 삭제
- `POST /api/geo/zones` - 존 생성 (판매자 ID 지정)
- `PATCH /api/geo/zones/{id}/status` - 존 상태 변경
- `POST /api/admin/approvals/{id}/approve` - 팝업 승인
- `POST /api/admin/approvals/{id}/reject` - 팝업 거부

## 판매자 (SELLER)

### Zone/Cell 권한
- ✅ **Cell 선택**: 팝업 등록 시 관리자가 생성한 Cell 선택만 가능
- ❌ **Cell 생성/수정/삭제**: 불가능
- ❌ **Zone 생성**: 불가능
- ✅ **내 Zone 목록 조회**: 할당받은 Zone 조회 가능

### API 엔드포인트
- `GET /api/geo/zones/me` - 내가 할당받은 Zone 목록 조회
- `GET /api/geo/areas` - 구역 목록 조회 (읽기 전용)
- `GET /api/geo/cells` - 셀 목록 조회 (읽기 전용, 팝업 등록 시 선택용)

### 팝업 관리
- `POST /api/popups` - 팝업 등록 (cellId 선택)
- `PUT /api/popups/{id}` - 팝업 수정
- `DELETE /api/popups/{id}` - 팝업 삭제

## 소비자 (CONSUMER)

### Zone/Cell 권한
- ✅ **Cell 위치 조회**: 팝업 상세 페이지에서 위치 확인
- ❌ **Cell 생성/수정/삭제**: 불가능
- ❌ **Zone 생성**: 불가능

### API 엔드포인트
- `GET /api/geo/cells/{id}` - 셀 상세 조회 (읽기 전용)
- `GET /api/popups` - 팝업 목록 조회
- `GET /api/popups/{id}` - 팝업 상세 조회

## 워크플로우

### 관리자 워크플로우
1. 관리자가 Area(구역) 생성 (DrawingMap으로 폴리곤 그리기)
2. 관리자가 해당 Area 내에 Cell 생성 (판매자 ID 지정)
3. 관리자가 Cell 상태를 APPROVED로 변경
4. 판매자가 팝업 등록 시 해당 Cell 선택

### 판매자 워크플로우
1. 판매자가 팝업 등록 폼 열기
2. 지도에서 관리자가 생성한 Cell 선택
3. 팝업 정보 입력 및 저장
4. 관리자 승인 대기

### 소비자 워크플로우
1. 팝업 목록에서 관심 있는 팝업 선택
2. 팝업 상세 페이지에서 지도 탭 클릭
3. 팝업 위치 확인 (Cell 좌표 표시)

