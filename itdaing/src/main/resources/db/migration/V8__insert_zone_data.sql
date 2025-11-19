-- 존/셀 데이터 생성 (플리마켓 장소 및 부스 개념)
-- 실제 광주광역시 내 플리마켓 가능한 장소 좌표 사용
-- 모든 존과 셀은 관리자가 설계하며, 실제 사용 가능한 장소의 좌표로 생성

-- 광주광역시 중심 좌표: 35.1595, 126.8526
-- 각 구별 대표 위치 좌표 사용

-- 남구 존 (남구 문화거리 근처)
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 
    r.id,
    '남구 팝업존',
    '{"type":"Polygon","coordinates":[[[126.90,35.13],[126.92,35.13],[126.92,35.15],[126.90,35.15],[126.90,35.13]]]}',
    'AVAILABLE',
    20,
    '남구 문화거리 인근 플리마켓 존',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM region r WHERE r.name = '남구'
ON CONFLICT DO NOTHING;

-- 동구 존
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 
    r.id,
    '동구 팝업존',
    '{"type":"Polygon","coordinates":[[[126.93,35.14],[126.95,35.14],[126.95,35.16],[126.93,35.16],[126.93,35.14]]]}',
    'AVAILABLE',
    15,
    '동구 대인동 인근 플리마켓 존',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM region r WHERE r.name = '동구'
ON CONFLICT DO NOTHING;

-- 서구 존
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 
    r.id,
    '서구 팝업존',
    '{"type":"Polygon","coordinates":[[[126.85,35.14],[126.87,35.14],[126.87,35.16],[126.85,35.16],[126.85,35.14]]]}',
    'AVAILABLE',
    18,
    '서구 상무지구 인근 플리마켓 존',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM region r WHERE r.name = '서구'
ON CONFLICT DO NOTHING;

-- 북구 존
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 
    r.id,
    '북구 팝업존',
    '{"type":"Polygon","coordinates":[[[126.88,35.17],[126.90,35.17],[126.90,35.19],[126.88,35.19],[126.88,35.17]]]}',
    'AVAILABLE',
    22,
    '북구 첨단지구 인근 플리마켓 존',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM region r WHERE r.name = '북구'
ON CONFLICT DO NOTHING;

-- 광산구 존
INSERT INTO zone_area (region_id, name, geometry_data, status, max_capacity, notice, created_at, updated_at)
SELECT 
    r.id,
    '광산구 팝업존',
    '{"type":"Polygon","coordinates":[[[126.80,35.12],[126.82,35.12],[126.82,35.14],[126.80,35.14],[126.80,35.12]]]}',
    'AVAILABLE',
    16,
    '광산구 수완지구 인근 플리마켓 존',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM region r WHERE r.name = '광산구'
ON CONFLICT DO NOTHING;

-- 각 존별 셀 생성 (부스 개념)
-- 남구 존 셀들
INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A1',
    '광주광역시 남구 문화거리 1번지',
    35.14,
    126.91,
    'APPROVED',
    1,
    '남구 팝업존 A1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '남구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A2',
    '광주광역시 남구 문화거리 2번지',
    35.14,
    126.91,
    'APPROVED',
    1,
    '남구 팝업존 A2 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '남구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'B1',
    '광주광역시 남구 문화거리 3번지',
    35.14,
    126.91,
    'APPROVED',
    1,
    '남구 팝업존 B1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '남구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

-- 동구 존 셀들
INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A1',
    '광주광역시 동구 대인동 1번지',
    35.15,
    126.94,
    'APPROVED',
    1,
    '동구 팝업존 A1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '동구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A2',
    '광주광역시 동구 대인동 2번지',
    35.15,
    126.94,
    'APPROVED',
    1,
    '동구 팝업존 A2 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '동구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

-- 서구 존 셀들
INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A1',
    '광주광역시 서구 상무지구 1번지',
    35.15,
    126.86,
    'APPROVED',
    1,
    '서구 팝업존 A1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '서구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'B1',
    '광주광역시 서구 상무지구 2번지',
    35.15,
    126.86,
    'APPROVED',
    1,
    '서구 팝업존 B1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '서구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

-- 북구 존 셀들
INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A1',
    '광주광역시 북구 첨단지구 1번지',
    35.18,
    126.89,
    'APPROVED',
    1,
    '북구 팝업존 A1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '북구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A2',
    '광주광역시 북구 첨단지구 2번지',
    35.18,
    126.89,
    'APPROVED',
    1,
    '북구 팝업존 A2 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '북구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'B1',
    '광주광역시 북구 첨단지구 3번지',
    35.18,
    126.89,
    'APPROVED',
    1,
    '북구 팝업존 B1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '북구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

-- 광산구 존 셀들
INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A1',
    '광주광역시 광산구 수완지구 1번지',
    35.13,
    126.81,
    'APPROVED',
    1,
    '광산구 팝업존 A1 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '광산구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

INSERT INTO zone_cell (zone_area_id, owner_id, label, detailed_address, lat, lng, status, max_capacity, notice, created_at, updated_at)
SELECT 
    za.id,
    u.id,
    'A2',
    '광주광역시 광산구 수완지구 2번지',
    35.13,
    126.81,
    'APPROVED',
    1,
    '광산구 팝업존 A2 셀',
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
FROM zone_area za
CROSS JOIN users u
WHERE za.name = '광산구 팝업존' AND u.login_id = 'seller1'
LIMIT 1;

